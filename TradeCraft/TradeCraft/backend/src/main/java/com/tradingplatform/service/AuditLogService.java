package com.tradingplatform.service;

import com.tradingplatform.model.AuditLog;
import com.tradingplatform.model.AuditLog.AuditAction;
import com.tradingplatform.model.User;
import com.tradingplatform.repository.AuditLogRepository;
import com.tradingplatform.repository.UserRepository;
import com.tradingplatform.security.UserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AuditLogService {
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public AuditLogService(AuditLogRepository auditLogRepository, UserRepository userRepository) {
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    public Page<AuditLog> getAllAuditLogs(Pageable pageable) {
        return auditLogRepository.findAll(pageable);
    }

    public Page<AuditLog> getAuditLogsByUser(Long userId, Pageable pageable) {
        return auditLogRepository.findByUserId(userId, pageable);
    }

    public Page<AuditLog> getAuditLogsByAction(AuditAction action, Pageable pageable) {
        return auditLogRepository.findByAction(action, pageable);
    }

    public Page<AuditLog> getAuditLogsByDateRange(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        return auditLogRepository.findByTimestampBetween(startDate, endDate, pageable);
    }

    @Transactional
    public void logUserAction(UserPrincipal userPrincipal, String actionStr, String details) {
        AuditAction action;
        try {
            action = AuditAction.valueOf(actionStr);
        } catch (IllegalArgumentException e) {
            // Default to UPDATE if action is not recognized
            action = AuditAction.UPDATE;
        }
        
        User user = null;
        if (userPrincipal != null) {
            Optional<User> userOpt = userRepository.findById(userPrincipal.getId());
            if (userOpt.isPresent()) {
                user = userOpt.get();
            }
        }
        
        String username = userPrincipal != null ? userPrincipal.getUsername() : "system";
        
        // Get IP address and user agent from request
        String ipAddress = "0.0.0.0";
        String userAgent = "";
        
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                HttpServletRequest request = attrs.getRequest();
                ipAddress = getClientIpAddress(request);
                userAgent = request.getHeader("User-Agent");
            }
        } catch (Exception e) {
            // Ignore if we can't get request info
        }
        
        AuditLog auditLog = new AuditLog(user, username, action, details, ipAddress, userAgent);
        auditLogRepository.save(auditLog);
    }

    // Helper method to get client IP address
    private String getClientIpAddress(HttpServletRequest request) {
        String ipAddress = request.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("Proxy-Client-IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("HTTP_CLIENT_IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getRemoteAddr();
        }
        return ipAddress;
    }
}
