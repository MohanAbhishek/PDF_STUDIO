package com.example.pdfstudio.repository;

import com.example.pdfstudio.entity.DocumentHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DocumentHistoryRepository extends JpaRepository<DocumentHistory, Long> {
    List<DocumentHistory> findByDocumentIdOrderByCreatedAtDesc(Long documentId);
}