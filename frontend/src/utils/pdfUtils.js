import * as pdfjsLib from 'pdfjs-dist';

// Configure worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export async function loadPdfDocument(arrayBuffer) {
  // PDF.js can transfer/detach the provided ArrayBuffer if passed directly.
  // To protect the original bytes, we pass a safe copy to PDF.js.
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer.slice(0) });
  return await loadingTask.promise;
}

export async function renderPageToCanvas(pdfDoc, pageNumber, canvas, scale = 1.5, renderTaskRef = null) {
  const page = await pdfDoc.getPage(pageNumber);
  // PDF.js getViewport automatically accounts for page.rotate by default.
  const viewport = page.getViewport({ scale });

  console.log("INITIAL/RENDER", {
    pageNumber,
    scale,
    pageRotation: page.rotate,
    viewportRotation: viewport.rotation,
    viewportWidth: viewport.width,
    viewportHeight: viewport.height,
    canvasWidth: canvas.width,
    canvasHeight: canvas.height
  });

  const context = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  canvas.width = Math.ceil(viewport.width * dpr);
  canvas.height = Math.ceil(viewport.height * dpr);

  canvas.style.width = `${viewport.width}px`;
  canvas.style.height = `${viewport.height}px`;

  context.setTransform(dpr, 0, 0, dpr, 0, 0);

  const renderContext = {
    canvasContext: context,
    viewport: viewport,
  };

  const renderTask = page.render(renderContext);
  if (renderTaskRef) {
    renderTaskRef.current = renderTask;
  }

  try {
    await renderTask.promise;
  } catch (error) {
    if (error?.name !== "RenderingCancelledException") {
      throw error;
    }
  } finally {
    if (renderTaskRef.current === renderTask) {
      renderTaskRef.current = null;
    }
  }

  return { viewport, page };
}
