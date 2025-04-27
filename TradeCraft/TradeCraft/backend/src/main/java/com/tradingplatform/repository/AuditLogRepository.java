package com.tradingplatform.repository;

import com.tradingplatform.model.AuditLog;
import com.tradingplatform.model.AuditLog.AuditAction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByUserId(Long userId);
    
    Page<AuditLog> findByUserId(Long userId, Pageable pageable);
    
    List<AuditLog> findByAction(AuditAction action);
    
    Page<AuditLog> findByAction(AuditAction action, Pageable pageable);
    
    List<AuditLog> findByTimestampBetween(LocalDateTime startTime, LocalDateTime endTime);
    
    Page<AuditLog> findByTimestampBetween(LocalDateTime startTime, LocalDateTime endTime, Pageable pageable);
    
    Page<AuditLog> findByUserIdAndAction(Long userId, AuditAction action, Pageable pageable);
    
    Page<AuditLog> findByUserIdAndTimestampBetween(Long userId, LocalDateTime startTime, LocalDateTime endTime, Pageable pageable);
}
