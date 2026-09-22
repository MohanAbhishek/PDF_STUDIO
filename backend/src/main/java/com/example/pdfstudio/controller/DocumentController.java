package com.example.pdfstudio.controller;

import com.example.pdfstudio.dto.DocumentListResponse;
import com.example.pdfstudio.dto.DocumentPreview;
import com.example.pdfstudio.dto.DocumentSaveRequest;
import com.example.pdfstudio.dto.HistoryRequest;
import com.example.pdfstudio.service.DocumentService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping("/upload")
    public ResponseEntity<DocumentPreview> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "name", required = false) String name) throws IOException {
        DocumentPreview result = documentService.upload(file, name);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/my-documents")
    public ResponseEntity<DocumentListResponse> getMyDocuments() {
        List<DocumentPreview> previews = documentService.getMyDocuments();
        return ResponseEntity.ok(new DocumentListResponse(previews, previews.size()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocumentPreview> getDocument(@PathVariable Long id) {
        DocumentPreview preview = documentService.getDocument(id);
        return ResponseEntity.ok(preview);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable Long id) throws IOException {
        byte[] pdfBytes = documentService.getDocumentBytes(id);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("inline", "document.pdf");
        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        documentService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/save")
    public ResponseEntity<DocumentPreview> saveDocument(
            @PathVariable Long id,
            @RequestBody DocumentSaveRequest request) throws IOException {
        DocumentPreview result = documentService.saveEditedPdf(id, request.getPdfContentBase64());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{id}/history")
    public ResponseEntity<Void> addHistory(@PathVariable Long id, @RequestBody HistoryRequest request) {
        documentService.addHistory(id, request);
        return ResponseEntity.ok().build();
    }
}