package com.example.pdfstudio.dto;

public class UploadResponse {
    private Long documentId;
    private String documentName;
    private String fileUrl;
    private Integer pageCount;
    private String status;

    public UploadResponse() {}

    public UploadResponse(Long documentId, String documentName, String fileUrl, Integer pageCount, String status) {
        this.documentId = documentId;
        this.documentName = documentName;
        this.fileUrl = fileUrl;
        this.pageCount = pageCount;
        this.status = status;
    }

    public Long getDocumentId() { return documentId; }
    public void setDocumentId(Long documentId) { this.documentId = documentId; }

    public String getDocumentName() { return documentName; }
    public void setDocumentName(String documentName) { this.documentName = documentName; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public Integer getPageCount() { return pageCount; }
    public void setPageCount(Integer pageCount) { this.pageCount = pageCount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}