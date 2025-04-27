package com.tradingplatform.model;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @NotBlank
    @Size(max = 50)
    private String username;

    @NotBlank
    @Size(max = 50)
    @Enumerated(EnumType.STRING)
    private AuditAction action;

    @NotBlank
    @Size(max = 1000)
    private String details;

    @NotBlank
    @Size(max = 45)
    private String ip;

    @Size(max = 255)
    @Column(name = "user_agent")
    private String userAgent;

    @NotNull
    private LocalDateTime timestamp;

    public AuditLog() {
    }

    public AuditLog(User user, String username, AuditAction action, String details, String ip, String userAgent) {
        this.user = user;
        this.username = username;
        this.action = action;
        this.details = details;
        this.ip = ip;
        this.userAgent = userAgent;
        this.timestamp = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public AuditAction getAction() {
        return action;
    }

    public void setAction(AuditAction action) {
        this.action = action;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public String getIp() {
        return ip;
    }

    public void setIp(String ip) {
        this.ip = ip;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public enum AuditAction {
        LOGIN, LOGOUT, CREATE, UPDATE, DELETE, EXPORT, IMPORT
    }
}
