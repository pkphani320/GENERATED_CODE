package com.tradingplatform.repository;

import com.tradingplatform.model.Trade;
import com.tradingplatform.model.Trade.TradeStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TradeRepository extends JpaRepository<Trade, Long> {
    List<Trade> findByPortfolioId(Long portfolioId);
    
    Page<Trade> findByPortfolioId(Long portfolioId, Pageable pageable);
    
    List<Trade> findByUserId(Long userId);
    
    Page<Trade> findByUserId(Long userId, Pageable pageable);
    
    List<Trade> findByStatus(TradeStatus status);
    
    Page<Trade> findByStatus(TradeStatus status, Pageable pageable);
    
    @Query("SELECT t FROM Trade t WHERE t.portfolio.id = ?1 AND t.tradeDate BETWEEN ?2 AND ?3")
    List<Trade> findByPortfolioIdAndTradeDateBetween(Long portfolioId, LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT t FROM Trade t WHERE t.portfolio.id = ?1 AND t.tradeDate BETWEEN ?2 AND ?3")
    Page<Trade> findByPortfolioIdAndTradeDateBetween(Long portfolioId, LocalDate startDate, LocalDate endDate, Pageable pageable);
    
    @Query("SELECT t FROM Trade t WHERE t.portfolio.organization.id = ?1")
    List<Trade> findByOrganizationId(Long organizationId);
    
    @Query("SELECT t FROM Trade t WHERE t.portfolio.organization.id = ?1")
    Page<Trade> findByOrganizationId(Long organizationId, Pageable pageable);
}
