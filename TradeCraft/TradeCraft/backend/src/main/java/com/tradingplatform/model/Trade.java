package com.tradingplatform.model;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Positive;
import javax.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "trades")
public class Trade {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portfolio_id", nullable = false)
    @NotNull
    private Portfolio portfolio;

    @NotBlank
    @Size(max = 20)
    private String symbol;

    @NotNull
    @Positive
    private Integer quantity;

    @NotNull
    @Positive
    private Double price;

    @NotNull
    @Enumerated(EnumType.STRING)
    private TradeSide side;

    @NotNull
    @Column(name = "trade_date")
    private LocalDate tradeDate;

    @Column(name = "settlement_date")
    private LocalDate settlementDate;

    @NotNull
    @Enumerated(EnumType.STRING)
    private TradeStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @NotNull
    private User user;

    private Double commission;

    @NotNull
    @Column(name = "total_amount")
    private Double totalAmount;

    @Size(max = 500)
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Trade() {
    }

    public Trade(Portfolio portfolio, String symbol, Integer quantity, Double price,
                TradeSide side, LocalDate tradeDate, User user) {
        this.portfolio = portfolio;
        this.symbol = symbol;
        this.quantity = quantity;
        this.price = price;
        this.side = side;
        this.tradeDate = tradeDate;
        this.settlementDate = tradeDate.plusDays(2); // T+2 settlement
        this.status = TradeStatus.PENDING;
        this.user = user;
        this.totalAmount = calculateTotalAmount();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Double calculateTotalAmount() {
        double amount = price * quantity;
        if (commission != null) {
            amount += commission;
        }
        return amount;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Portfolio getPortfolio() {
        return portfolio;
    }

    public void setPortfolio(Portfolio portfolio) {
        this.portfolio = portfolio;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public TradeSide getSide() {
        return side;
    }

    public void setSide(TradeSide side) {
        this.side = side;
    }

    public LocalDate getTradeDate() {
        return tradeDate;
    }

    public void setTradeDate(LocalDate tradeDate) {
        this.tradeDate = tradeDate;
    }

    public LocalDate getSettlementDate() {
        return settlementDate;
    }

    public void setSettlementDate(LocalDate settlementDate) {
        this.settlementDate = settlementDate;
    }

    public TradeStatus getStatus() {
        return status;
    }

    public void setStatus(TradeStatus status) {
        this.status = status;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Double getCommission() {
        return commission;
    }

    public void setCommission(Double commission) {
        this.commission = commission;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum TradeSide {
        BUY, SELL
    }

    public enum TradeStatus {
        PENDING, EXECUTED, SETTLED, CANCELED
    }
}
