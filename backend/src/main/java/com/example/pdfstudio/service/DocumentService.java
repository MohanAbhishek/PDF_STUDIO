package com.example.pdfstudio.service;

import com.example.pdfstudio.dto.DocumentPreview;
import com.example.pdfstudio.dto.HistoryRequest;
import com.example.pdfstudio.entity.Document;
import com.example.pdfstudio.entity.DocumentHistory;
import com.example.pdfstudio.entity.User;
import com.example.pdfstudio.repository.DocumentRepository;
import com.example.pdfstudio.repository.DocumentHistoryRepository;
import com.example.pdfstudio.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final DocumentHistoryRepository historyRepository;
    private final UserRepository userRepository;

    @Value("${file.storage-dir:uploads}")
    private String storageDir;

    public DocumentService(DocumentRepository documentRepository,
                           DocumentHistoryRepository historyRepository,
                           UserRepository userRepository) {
        this.documentRepository = documentRepository;
        this.historyRepository = historyRepository;
        this.userRepository = userRepository;
    }

    public DocumentPreview upload(MultipartFile file, String name) throws IOException {
        String originalName = file.getOriginalFilename();
        if (originalName == null || !originalName.toLowerCase().endsWith(".pdf")) {
            throw new IllegalArgumentException("Only PDF files are allowed");
        }

        if (file.getSize() > 50 * 1024 * 1024) {
            throw new IllegalArgumentException("File size exceeds 50MB limit");
        }

        User user = getCurrentUser();

        Path storagePath = Paths.get(storageDir);
        if (!Files.exists(storagePath)) {
            Files.createDirectories(storagePath);
        }

        String uniqueFileName = user.getId() + "_" + System.currentTimeMillis() + "_" + originalName;
        Path filePath = storagePath.resolve(uniqueFileName);
        Files.copy(file.getInputStream(), filePath);

        Document doc = new Document();
        doc.setUser(user);
        doc.setDocumentName(name != null && !name.trim().isEmpty() ? name : originalName.replaceAll("\\.[^/.]+$", ""));
        doc.setOriginalFileName(originalName);
        doc.setFileSize(file.getSize());
        doc.setStoragePath(filePath.toString());
        doc.setStatus("READY");
        doc.setCreatedAt(LocalDateTime.now());
        doc.setUpdatedAt(LocalDateTime.now());
        documentRepository.save(doc);

        addHistoryInternal(doc, "UPLOADED");

        return toPreview(doc);
    }

    public List<DocumentPreview> getMyDocuments() {
        User user = getCurrentUser();
        List<Document> docs = documentRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        return docs.stream().map(this::toPreview).collect(Collectors.toList());
    }

    public DocumentPreview getDocument(Long id) {
        Document doc = getDocumentOrThrow(id);
        checkOwnership(doc);
        return toPreview(doc);
    }

    public byte[] getDocumentBytes(Long id) throws IOException {
        Document doc = getDocumentOrThrow(id);
        checkOwnership(doc);
        if (doc.getStoragePath() == null) {
            throw new RuntimeException("Document storage path is missing");
        }
        Path path = Paths.get(doc.getStoragePath());
        if (!Files.exists(path)) {
            throw new RuntimeException("Stored PDF file not found on disk");
        }
        return Files.readAllBytes(path);
    }

    public void deleteDocument(Long id) {
        Document doc = getDocumentOrThrow(id);
        checkOwnership(doc);

        // Delete associated history records first to prevent foreign key constraint violation
        List<DocumentHistory> histories = historyRepository.findByDocumentIdOrderByCreatedAtDesc(id);
        if (histories != null && !histories.isEmpty()) {
            historyRepository.deleteAll(histories);
        }

        if (doc.getStoragePath() != null) {
            try {
                Files.deleteIfExists(Path.of(doc.getStoragePath()));
            } catch (IOException e) {
                // Ignore file deletion errors if file already missing
            }
        }
        documentRepository.delete(doc);
    }

    public DocumentPreview saveEditedPdf(Long id, String pdfContentBase64) throws IOException {
        Document doc = getDocumentOrThrow(id);
        checkOwnership(doc);

        byte[] pdfBytes = Base64.getDecoder().decode(pdfContentBase64);

        Path storagePath = Paths.get(storageDir);
        if (!Files.exists(storagePath)) {
            Files.createDirectories(storagePath);
        }

        String newFileName = doc.getUser().getId() + "_" + System.currentTimeMillis() + "_edited_" + doc.getOriginalFileName();
        Path filePath = storagePath.resolve(newFileName);
        Files.write(filePath, pdfBytes);

        doc.setStoragePath(filePath.toString());
        doc.setStatus("SAVED");
        doc.setUpdatedAt(LocalDateTime.now());
        documentRepository.save(doc);

        addHistoryInternal(doc, "EDITED & SAVED");

        return toPreview(doc);
    }

    public void addHistory(Long id, HistoryRequest request) {
        Document doc = getDocumentOrThrow(id);
        checkOwnership(doc);
        String action = (request != null && request.getAction() != null && !request.getAction().trim().isEmpty())
                ? request.getAction()
                : "ACTION";
        addHistoryInternal(doc, action);
    }

    private void addHistoryInternal(Document doc, String action) {
        DocumentHistory history = new DocumentHistory();
        history.setDocument(doc);
        history.setAction(action);
        historyRepository.save(history);
    }

    private Document getDocumentOrThrow(Long id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));
    }

    private void checkOwnership(Document doc) {
        User user = getCurrentUser();
        if (!doc.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied: You do not own this document");
        }
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new RuntimeException("Unauthorized");
        }
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found in database"));
    }

    private DocumentPreview toPreview(Document doc) {
        DocumentPreview preview = new DocumentPreview();
        preview.setId(doc.getId());
        preview.setDocumentName(doc.getDocumentName());
        preview.setOriginalFileName(doc.getOriginalFileName());
        preview.setFileSize(doc.getFileSize());
        preview.setPageCount(doc.getPageCount());
        preview.setStatus(doc.getStatus());
        preview.setCreatedAt(doc.getCreatedAt() != null ? doc.getCreatedAt().toString() : null);
        preview.setUpdatedAt(doc.getUpdatedAt() != null ? doc.getUpdatedAt().toString() : null);
        return preview;
    }
}
