package com.example.pdfstudio.dto;

import java.util.List;

public class DocumentListResponse {
    private List<DocumentPreview> documents;
    private long total;

    public DocumentListResponse() {}
    public DocumentListResponse(List<DocumentPreview> documents, long total) {
        this.documents = documents;
        this.total = total;
    }

    public List<DocumentPreview> getDocuments() { return documents; }
    public void setDocuments(List<DocumentPreview> documents) { this.documents = documents; }

    public long getTotal() { return total; }
    public void setTotal(long total) { this.total = total; }
}