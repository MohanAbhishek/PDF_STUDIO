import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentService } from '../services/documentService';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { FileText, Upload, Trash2, Edit3, LogOut, Plus, Search } from 'lucide-react';

export default function DashboardPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await documentService.getMyDocuments();
      setDocuments(data.documents || []);
    } catch (err) {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Please select a valid PDF file');
      return;
    }

    try {
      setUploading(true);
      const uploaded = await documentService.uploadDocument(file);
      toast.success('Document uploaded successfully!');
      navigate(`/editor/${uploaded.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      await documentService.deleteDocument(id);
      toast.success('Document deleted');
      setDocuments(documents.filter(d => d.id !== id));
    } catch (err) {
      toast.error('Failed to delete document');
    }
  };

  const filteredDocs = documents.filter(d =>
    d.documentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.originalFileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-white p-2 rounded-xl">
              <FileText className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              PDF Studio
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-600 hidden sm:inline">
              Welcome, {user?.fullName || user?.email}
            </span>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-red-600 transition p-2 rounded-lg hover:bg-slate-100"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Your Documents</h1>
            <p className="text-sm text-slate-600 mt-1">Upload and manage your PDF documents for client-side editing.</p>
          </div>

          <label className={`cursor-pointer bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-medium shadow-sm flex items-center gap-2 transition ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
            <Upload className="h-5 w-5" />
            <span>{uploading ? 'Uploading...' : 'Upload PDF'}</span>
            <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex items-center gap-3">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search documents..."
            className="w-full bg-transparent border-none focus:outline-none text-sm text-slate-900 placeholder:text-slate-400"
          />
        </div>

        {/* Document List */}
        {loading ? (
          <div className="text-center py-20 text-slate-500">Loading documents...</div>
        ) : filteredDocs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="bg-blue-50 text-primary p-4 rounded-full w-fit mx-auto mb-4">
              <FileText className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">No documents found</h3>
            <p className="text-sm text-slate-500 mb-6">Get started by uploading your first PDF document.</p>
            <label className="cursor-pointer bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-medium shadow-sm inline-flex items-center gap-2 transition">
              <Plus className="h-5 w-5" />
              <span>Upload PDF</span>
              <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Document Name</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">File Name</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Modified</th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredDocs.map((doc) => (
                  <tr
                    key={doc.id}
                    onClick={() => navigate(`/editor/${doc.id}`)}
                    className="hover:bg-slate-50 cursor-pointer transition"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="bg-red-50 text-red-600 p-2 rounded-lg">
                          <FileText className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-medium text-slate-900">{doc.documentName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {doc.originalFileName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${doc.status === 'SAVED' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>
                        {doc.status || 'READY'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString() : 'Today'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/editor/${doc.id}`);
                          }}
                          className="p-2 text-slate-600 hover:text-primary hover:bg-blue-50 rounded-lg transition"
                          title="Edit Document"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(doc.id, e)}
                          className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete Document"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}