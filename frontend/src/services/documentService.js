import api from './api';

export const documentService = {
  async uploadDocument(file, name) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name || file.name.replace(/\.[^/.]+$/, ''));

    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getMyDocuments() {
    const response = await api.get('/documents/my-documents');
    return response.data;
  },

  async getDocument(id) {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  async downloadDocument(id) {
    const response = await api.get(`/documents/${id}/download`, {
      responseType: 'arraybuffer',
    });
    return response.data;
  },

  async deleteDocument(id) {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  },

  async saveDocument(id, pdfContentBase64) {
    const response = await api.post(`/documents/${id}/save`, {
      pdfContentBase64,
    });
    return response.data;
  },
};