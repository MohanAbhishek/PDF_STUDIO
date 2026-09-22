import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { documentService } from '../services/documentService';
import { loadPdfDocument, renderPageToCanvas } from '../utils/pdfUtils';
import { exportModifiedPdf } from '../utils/pdfExporter';
import toast from 'react-hot-toast';
import {
  FileText, Undo2, Redo2, ZoomIn, ZoomOut, Download, Save, ArrowLeft,
  Type, Square, PenTool, Trash2, Check, X
} from 'lucide-react';

export default function EditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [documentMeta, setDocumentMeta] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [arrayBuffer, setArrayBuffer] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [zoom, setZoom] = useState(1.5);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editor tools: 'select' | 'text' | 'whiteout' | 'signature'
  const [activeTool, setActiveTool] = useState('select');
  const [objects, setObjects] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [selectedObjectId, setSelectedObjectId] = useState(null);

  // Dragging state
  const draggingRef = useRef(null);
  const [, setDraggingState] = useState(false);

  // Drawing signature modal state
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const signatureCanvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Canvas & page dimensions for coordinate mapping
  const [pageDimensions, setPageDimensions] = useState({});
  const canvasRef = useRef(null);
  const renderTaskRef = useRef(null);

  // Handle keyboard events for delete/backspace
  const handleKeyDown = useCallback((e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
      return;
    }

    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedObjectId) {
      e.preventDefault();
      console.log("Delete/Backspace pressed, selectedObjectId:", selectedObjectId);
      handleDeleteSelected();
    }
  }, [selectedObjectId, objects, historyIndex, history]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    fetchDocumentAndLoadPdf();
  }, [id]);

  useEffect(() => {
    if (pdfDoc && !loading) {
      const rafId = requestAnimationFrame(() => {
        renderCurrentPage();
      });
      return () => cancelAnimationFrame(rafId);
    }
  }, [pdfDoc, currentPage, zoom, loading]);

  // Global pointer move and up handlers for dragging objects
  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!draggingRef.current) return;
      const drag = draggingRef.current;
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;

      const newX = Math.max(0, drag.initialX + dx);
      const newY = Math.max(0, drag.initialY + dy);

      setObjects(prev => prev.map(o => o.id === drag.id ? { ...o, x: newX, y: newY } : o));
    };

    const handlePointerUp = () => {
      if (draggingRef.current) {
        draggingRef.current = null;
        setDraggingState(false);
        // Push history after drag completes
        setObjects(currentObjects => {
          pushHistory(currentObjects);
          return currentObjects;
        });
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [historyIndex, history]);

  const fetchDocumentAndLoadPdf = async () => {
    try {
      setLoading(true);
      const meta = await documentService.getDocument(id);
      setDocumentMeta(meta);

      const pdfBytes = await documentService.downloadDocument(id);
      console.log("DOWNLOADED BUFFER", {
        byteLength: pdfBytes?.byteLength
      });

      // Keep independent copies: PDF.js may transfer/detach the buffer it receives,
      // so export must use a separate untouched copy.
      const viewerBuffer = pdfBytes.slice(0);
      const exportBuffer = pdfBytes.slice(0);
      console.log("VIEWER BUFFER", {
        byteLength: viewerBuffer.byteLength
      });
      console.log("EXPORT BUFFER", {
        byteLength: exportBuffer.byteLength
      });

      setArrayBuffer(exportBuffer);
      const loadedPdf = await loadPdfDocument(viewerBuffer);
      console.log("PDF DOCUMENT LOADED", {
        numPages: loadedPdf.numPages,
        viewportWidth: loadedPdf.viewport?.width,
        viewportHeight: loadedPdf.viewport?.height
      });
      setPdfDoc(loadedPdf);
      console.log("PDF DOC STATE SET", {
        numPages: loadedPdf.numPages
      });
      setNumPages(loadedPdf.numPages);
    } catch (err) {
      console.error('Failed to load PDF document:', err);
      toast.error('Failed to load PDF document');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("LOADING STATE", { loading });
  }, [loading]);

  const renderCurrentPage = async () => {
    if (!pdfDoc || !canvasRef.current) return;
    try {
      const { viewport } = await renderPageToCanvas(pdfDoc, currentPage, canvasRef.current, zoom, renderTaskRef);
      setPageDimensions(prev => ({
        ...prev,
        [currentPage]: { width: viewport.width, height: viewport.height }
      }));
    } catch (err) {
      if (err?.name !== "RenderingCancelledException") {
        console.error('Render error:', err);
      }
    }
  };

  const pushHistory = (newObjects) => {
    setHistory(prevHistory => {
      const newHistory = prevHistory.slice(0, historyIndex + 1);
      newHistory.push(newObjects);
      setHistoryIndex(newHistory.length - 1);
      return newHistory;
    });
    setObjects(newObjects);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setObjects(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setObjects(history[newIndex]);
    }
  };

  // Canvas click handler for adding objects
  const handleCanvasClick = (e) => {
    if (activeTool === 'select') return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newObj = {
      id: Date.now().toString(),
      type: activeTool === 'text' ? 'text' : activeTool === 'whiteout' ? 'whiteout' : 'signature',
      pageNumber: currentPage,
      x: x,
      y: y,
      width: activeTool === 'whiteout' ? 120 : activeTool === 'text' ? 150 : 140,
      height: activeTool === 'whiteout' ? 30 : activeTool === 'text' ? 30 : 60,
      content: activeTool === 'text' ? 'Type text here...' : activeTool === 'signature' ? window.currentSignatureDataUrl : '',
      style: { fontSize: 16 }
    };

    if (activeTool === 'signature') {
      if (!window.currentSignatureDataUrl) {
        setShowSignatureModal(true);
        return;
      }
      newObj.content = window.currentSignatureDataUrl;
    }

    const updated = [...objects, newObj];
    pushHistory(updated);
    setSelectedObjectId(newObj.id);
    setActiveTool('select');
  };

  const handleCanvasBackgroundClick = () => {
    if (selectedObjectId) {
      setSelectedObjectId(null);
    }
  };

  const handleDeleteSelected = () => {
    if (!selectedObjectId) return;
    console.log("Deleting object:", selectedObjectId);
    const updated = objects.filter(o => o.id !== selectedObjectId);
    pushHistory(updated);
    setSelectedObjectId(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const modifiedPdfBytes = await exportModifiedPdf(arrayBuffer, objects, pageDimensions);
      const base64 = btoa(
        String.fromCharCode.apply(null, new Uint8Array(modifiedPdfBytes))
      );
      await documentService.saveDocument(id, base64);
      toast.success('Document saved successfully!');
    } catch (err) {
      console.error("Save error:", err);
      toast.error('Failed to save document');
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    try {
      console.log("Download triggered, objects count:", objects.length);
      const modifiedPdfBytes = await exportModifiedPdf(arrayBuffer, objects, pageDimensions);
      const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${documentMeta?.documentName || 'document'}_edited.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('PDF downloaded successfully!');
    } catch (err) {
      console.error("PDF EXPORT / DOWNLOAD ERROR:", err);
      toast.error(`Failed to export PDF: ${err?.message || 'Unknown error'}`);
    }
  };

  // Object drag start handler
  const handleObjectPointerDown = (e, obj) => {
    e.stopPropagation();
    setSelectedObjectId(obj.id);
    if (activeTool !== 'select') return;

    draggingRef.current = {
      id: obj.id,
      startX: e.clientX,
      startY: e.clientY,
      initialX: obj.x,
      initialY: obj.y
    };
    setDraggingState(true);
  };

  // Signature Canvas Drawing Handlers
  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = signatureCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = signatureCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = () => {
    const canvas = signatureCanvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    window.currentSignatureDataUrl = dataUrl;
    setShowSignatureModal(false);
    toast.success('Signature saved! Click on PDF to place it.');
    setActiveTool('signature');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">Loading editor workspace...</div>;
  }

  const currentObjects = objects.filter(o => o.pageNumber === currentPage);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Toolbar */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-slate-700 rounded-lg text-slate-300 transition flex items-center gap-2 text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </button>
          <div className="h-5 w-px bg-slate-700" />
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-400" />
            <span className="font-semibold text-sm truncate max-w-xs">{documentMeta?.documentName || 'Untitled PDF'}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-2 hover:bg-slate-700 disabled:opacity-40 rounded-lg text-slate-300 transition"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 hover:bg-slate-700 disabled:opacity-40 rounded-lg text-slate-300 transition"
            title="Redo"
          >
            <Redo2 className="h-4 w-4" />
          </button>
          <div className="h-5 w-px bg-slate-700" />
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-slate-700 hover:bg-slate-600 px-3.5 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition"
          >
            <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={handleDownload}
            className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition"
          >
            <Download className="h-4 w-4" /> Download PDF
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Toolbar */}
        <aside className="w-16 bg-slate-800 border-r border-slate-700 flex flex-col items-center py-4 gap-3 shrink-0">
          <button
            onClick={() => setActiveTool('select')}
            className={`p-3 rounded-xl transition ${activeTool === 'select' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
            title="Select & Move"
          >
            <FileText className="h-5 w-5" />
          </button>
          <button
            onClick={() => setActiveTool('text')}
            className={`p-3 rounded-xl transition ${activeTool === 'text' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
            title="Add Text"
          >
            <Type className="h-5 w-5" />
          </button>
          <button
            onClick={() => setActiveTool('whiteout')}
            className={`p-3 rounded-xl transition ${activeTool === 'whiteout' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
            title="Whiteout Rectangle"
          >
            <Square className="h-5 w-5" />
          </button>
          <button
            onClick={() => {
              if (!window.currentSignatureDataUrl) {
                setShowSignatureModal(true);
              } else {
                setActiveTool('signature');
              }
            }}
            className={`p-3 rounded-xl transition ${activeTool === 'signature' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
            title="Signature Tool"
          >
            <PenTool className="h-5 w-5" />
          </button>
          {selectedObjectId && (
            <button
              onClick={handleDeleteSelected}
              className="p-3 rounded-xl text-red-400 hover:bg-red-500/20 transition mt-auto"
              title="Delete Selected Object"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}
        </aside>

        {/* PDF Canvas Viewport */}
        <main className="flex-1 overflow-auto bg-slate-950 flex flex-col items-center p-8 relative" onClick={handleCanvasBackgroundClick}>
          {/* Zoom & Page Navigation Subbar */}
          <div className="absolute top-4 bg-slate-800/90 backdrop-blur border border-slate-700 px-4 py-2 rounded-2xl shadow-xl flex items-center gap-4 z-20 text-sm">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="hover:text-white disabled:opacity-40"
            >
              Previous
            </button>
            <span>Page {currentPage} of {numPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))}
              disabled={currentPage >= numPages}
              className="hover:text-white disabled:opacity-40"
            >
              Next
            </button>
            <div className="h-4 w-px bg-slate-700" />
            <button onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} title="Zoom Out">
              <ZoomOut className="h-4 w-4" />
            </button>
            <span>{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(3, z + 0.25))} title="Zoom In">
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>

          {/* Canvas Wrapper */}
          <div className="relative mt-12 shadow-2xl rounded-lg overflow-hidden border border-slate-800 bg-white">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="cursor-crosshair block"
            />

            {/* Overlay Objects */}
            {currentObjects.map((obj) => (
              <div
                key={obj.id}
                onPointerDown={(e) => handleObjectPointerDown(e, obj)}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedObjectId(obj.id);
                }}
                style={{
                  position: 'absolute',
                  left: `${obj.x}px`,
                  top: `${obj.y}px`,
                  width: `${obj.width}px`,
                  height: `${obj.height}px`,
                  border: selectedObjectId === obj.id ? '2px solid #2563eb' : '1px dashed transparent',
                  background: obj.type === 'whiteout' ? 'white' : 'transparent',
                  touchAction: 'none'
                }}
                className="cursor-move flex items-center justify-center group select-none"
              >
                {obj.type === 'text' && (
                  <input
                    type="text"
                    value={obj.content}
                    onChange={(e) => {
                      const val = e.target.value;
                      const updated = objects.map(o => o.id === obj.id ? { ...o, content: val } : o);
                      setObjects(updated);
                    }}
                    className="w-full h-full bg-transparent border-none focus:outline-none px-1 text-slate-900 font-medium"
                    style={{ fontSize: `${(obj.style?.fontSize || 16) * (zoom / 1.5)}px` }}
                  />
                )}
                {obj.type === 'signature' && obj.content && (
                  <img src={obj.content} alt="Signature" className="w-full h-full object-contain pointer-events-none" />
                )}
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Signature Modal */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Create Your Signature</h3>
              <button onClick={() => setShowSignatureModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">Draw your signature in the box below using your mouse or touch screen.</p>

            <div className="border border-slate-700 rounded-xl bg-white overflow-hidden mb-4">
              <canvas
                ref={signatureCanvasRef}
                width={380}
                height={160}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="cursor-crosshair w-full bg-white"
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={clearSignature}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition"
              >
                Clear
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSignatureModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={saveSignature}
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-medium transition flex items-center gap-2"
                >
                  <Check className="h-4 w-4" /> Save & Place
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
