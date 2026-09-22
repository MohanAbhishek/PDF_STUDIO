package com.example.pdfstudio.repository;

import com.example.pdfstudio.entity.Document;
import com.example.pdfstudio.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Document> findByUserOrderByCreatedAtDesc(User user);
}