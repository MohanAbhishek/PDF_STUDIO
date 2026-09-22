package com.example.pdfstudio.dto;

public class DocumentSaveRequest {
    private String pdfContentBase64;

    public DocumentSaveRequest() {}

    public DocumentSaveRequest(String pdfContentBase64) {
        this.pdfContentBase64 = pdfContentBase64;
    }

    public String getPdfContentBase64() { return pdfContentBase64; }
    public void setPdfContentBase64(String pdfContentBase64) { this.pdfContentBase64 = pdfContentBase64; }
}