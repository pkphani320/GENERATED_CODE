package com.tradingplatform.service;

import com.tradingplatform.dto.TradeDto;
import com.tradingplatform.exception.BadRequestException;
import com.tradingplatform.exception.ResourceNotFoundException;
import com.tradingplatform.exception.UnauthorizedException;
import com.tradingplatform.model.Portfolio;
import com.tradingplatform.model.Trade;
import com.tradingplatform.model.Trade.TradeStatus;
import com.tradingplatform.model.User;
import com.tradingplatform.repository.PortfolioRepository;
import com.tradingplatform.repository.TradeRepository;
import com.tradingplatform.repository.UserRepository;
import com.tradingplatform.security.UserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class TradeService {
    private final TradeRepository tradeRepository;
    private final PortfolioRepository portfolioRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public TradeService(TradeRepository tradeRepository, 
                       PortfolioRepository portfolioRepository,
                       UserRepository userRepository,
                       AuditLogService auditLogService) {
        this.tradeRepository = tradeRepository;
        this.portfolioRepository = portfolioRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    public Page<Trade> getAllTrades(Pageable pageable, UserPrincipal currentUser) {
        return tradeRepository.findAll(pageable);
    }

    public Trade getTradeById(Long id, UserPrincipal currentUser) {
        Trade trade = tradeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trade not found with id: " + id));
        
        // Check if user has access to this trade (same organization)
        if (currentUser.getOrganizationId() != null && 
                !currentUser.getOrganizationId().equals(trade.getPortfolio().getOrganization().getId())) {
            throw new UnauthorizedException("You don't have access to this trade");
        }
        
        return trade;
    }

    @Transactional
    public Trade createTrade(TradeDto tradeDto, UserPrincipal currentUser) {
        // Check if portfolio exists
        Portfolio portfolio = portfolioRepository.findById(tradeDto.getPortfolioId())
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found with id: " + tradeDto.getPortfolioId()));
        
        // Check if user has access to this portfolio (same organization)
        if (currentUser.getOrganizationId() != null && 
                !currentUser.getOrganizationId().equals(portfolio.getOrganization().getId())) {
            throw new UnauthorizedException("You don't have access to this portfolio");
        }
        
        // Get user
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        // Create trade
        Trade trade = new Trade();
        trade.setPortfolio(portfolio);
        trade.setSymbol(tradeDto.getSymbol().toUpperCase());
        trade.setQuantity(tradeDto.getQuantity());
        trade.setPrice(tradeDto.getPrice());
        trade.setSide(Trade.TradeSide.valueOf(tradeDto.getSide()));
        trade.setTradeDate(tradeDto.getTradeDate());
        trade.setSettlementDate(tradeDto.getTradeDate().plusDays(2)); // T+2 settlement
        trade.setStatus(TradeStatus.PENDING);
        trade.setUser(user);
        trade.setNotes(tradeDto.getNotes());
        
        // Calculate commission and total amount
        double commission = calculateCommission(tradeDto.getQuantity(), tradeDto.getPrice());
        trade.setCommission(commission);
        
        double totalAmount = tradeDto.getQuantity() * tradeDto.getPrice();
        if (trade.getSide() == Trade.TradeSide.BUY) {
            totalAmount += commission;
        } else {
            totalAmount -= commission;
        }
        trade.setTotalAmount(totalAmount);
        
        Trade savedTrade = tradeRepository.save(trade);
        
        // Audit log
        auditLogService.logUserAction(currentUser, "CREATE", 
                "Created new trade: " + savedTrade.getSide() + " " + 
                        savedTrade.getQuantity() + " " + savedTrade.getSymbol());
        
        return savedTrade;
    }

    @Transactional
    public Trade updateTrade(Long id, TradeDto tradeDto, UserPrincipal currentUser) {
        Trade trade = tradeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trade not found with id: " + id));
        
        // Check if user has access to this trade (same organization)
        if (currentUser.getOrganizationId() != null && 
                !currentUser.getOrganizationId().equals(trade.getPortfolio().getOrganization().getId())) {
            throw new UnauthorizedException("You don't have access to this trade");
        }
        
        // Check if trade can be updated
        if (trade.getStatus() != TradeStatus.PENDING) {
            throw new BadRequestException("Only pending trades can be updated");
        }
        
        // Check if portfolio changed and exists
        if (!trade.getPortfolio().getId().equals(tradeDto.getPortfolioId())) {
            Portfolio portfolio = portfolioRepository.findById(tradeDto.getPortfolioId())
                    .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found with id: " + tradeDto.getPortfolioId()));
            
            // Check if user has access to the new portfolio
            if (currentUser.getOrganizationId() != null && 
                    !currentUser.getOrganizationId().equals(portfolio.getOrganization().getId())) {
                throw new UnauthorizedException("You don't have access to this portfolio");
            }
            
            trade.setPortfolio(portfolio);
        }
        
        trade.setSymbol(tradeDto.getSymbol().toUpperCase());
        trade.setQuantity(tradeDto.getQuantity());
        trade.setPrice(tradeDto.getPrice());
        trade.setSide(Trade.TradeSide.valueOf(tradeDto.getSide()));
        trade.setTradeDate(tradeDto.getTradeDate());
        trade.setSettlementDate(tradeDto.getTradeDate().plusDays(2)); // T+2 settlement
        trade.setNotes(tradeDto.getNotes());
        
        // Recalculate commission and total amount
        double commission = calculateCommission(tradeDto.getQuantity(), tradeDto.getPrice());
        trade.setCommission(commission);
        
        double totalAmount = tradeDto.getQuantity() * tradeDto.getPrice();
        if (trade.getSide() == Trade.TradeSide.BUY) {
            totalAmount += commission;
        } else {
            totalAmount -= commission;
        }
        trade.setTotalAmount(totalAmount);
        
        Trade updatedTrade = tradeRepository.save(trade);
        
        // Audit log
        auditLogService.logUserAction(currentUser, "UPDATE", 
                "Updated trade: " + updatedTrade.getSide() + " " + 
                        updatedTrade.getQuantity() + " " + updatedTrade.getSymbol());
        
        return updatedTrade;
    }

    @Transactional
    public void deleteTrade(Long id, UserPrincipal currentUser) {
        Trade trade = tradeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trade not found with id: " + id));
        
        // Check if user has access to this trade (same organization)
        if (currentUser.getOrganizationId() != null && 
                !currentUser.getOrganizationId().equals(trade.getPortfolio().getOrganization().getId())) {
            throw new UnauthorizedException("You don't have access to this trade");
        }
        
        // Check if trade can be deleted
        if (trade.getStatus() != TradeStatus.PENDING) {
            throw new BadRequestException("Only pending trades can be deleted");
        }
        
        // Audit log
        auditLogService.logUserAction(currentUser, "DELETE", 
                "Deleted trade: " + trade.getSide() + " " + 
                        trade.getQuantity() + " " + trade.getSymbol());
        
        tradeRepository.delete(trade);
    }

    public Page<Trade> getTradesByPortfolio(Long portfolioId, Pageable pageable, UserPrincipal currentUser) {
        // Check if portfolio exists
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found with id: " + portfolioId));
        
        // Check if user has access to this portfolio (same organization)
        if (currentUser.getOrganizationId() != null && 
                !currentUser.getOrganizationId().equals(portfolio.getOrganization().getId())) {
            throw new UnauthorizedException("You don't have access to this portfolio");
        }
        
        return tradeRepository.findByPortfolioId(portfolioId, pageable);
    }

    public Page<Trade> getTradesByUser(Long userId, Pageable pageable, UserPrincipal currentUser) {
        // Only admins or the user themselves can see their trades
        if (!currentUser.getId().equals(userId) && 
                !currentUser.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            throw new UnauthorizedException("You don't have permission to view these trades");
        }
        
        return tradeRepository.findByUserId(userId, pageable);
    }

    @Transactional
    public Trade executeTrade(Long id, UserPrincipal currentUser) {
        Trade trade = tradeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trade not found with id: " + id));
        
        // Check if user has access to this trade (same organization)
        if (currentUser.getOrganizationId() != null && 
                !currentUser.getOrganizationId().equals(trade.getPortfolio().getOrganization().getId())) {
            throw new UnauthorizedException("You don't have access to this trade");
        }
        
        // Check if trade can be executed
        if (trade.getStatus() != TradeStatus.PENDING) {
            throw new BadRequestException("Only pending trades can be executed");
        }
        
        trade.setStatus(TradeStatus.EXECUTED);
        Trade executedTrade = tradeRepository.save(trade);
        
        // Audit log
        auditLogService.logUserAction(currentUser, "UPDATE", 
                "Executed trade: " + executedTrade.getSide() + " " + 
                        executedTrade.getQuantity() + " " + executedTrade.getSymbol());
        
        return executedTrade;
    }

    @Transactional
    public Trade settleTrade(Long id, UserPrincipal currentUser) {
        Trade trade = tradeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trade not found with id: " + id));
        
        // Check if user has access to this trade (same organization)
        if (currentUser.getOrganizationId() != null && 
                !currentUser.getOrganizationId().equals(trade.getPortfolio().getOrganization().getId())) {
            throw new UnauthorizedException("You don't have access to this trade");
        }
        
        // Check if trade can be settled
        if (trade.getStatus() != TradeStatus.EXECUTED) {
            throw new BadRequestException("Only executed trades can be settled");
        }
        
        trade.setStatus(TradeStatus.SETTLED);
        Trade settledTrade = tradeRepository.save(trade);
        
        // Audit log
        auditLogService.logUserAction(currentUser, "UPDATE", 
                "Settled trade: " + settledTrade.getSide() + " " + 
                        settledTrade.getQuantity() + " " + settledTrade.getSymbol());
        
        return settledTrade;
    }

    @Transactional
    public Trade cancelTrade(Long id, UserPrincipal currentUser) {
        Trade trade = tradeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trade not found with id: " + id));
        
        // Check if user has access to this trade (same organization)
        if (currentUser.getOrganizationId() != null && 
                !currentUser.getOrganizationId().equals(trade.getPortfolio().getOrganization().getId())) {
            throw new UnauthorizedException("You don't have access to this trade");
        }
        
        // Check if trade can be canceled
        if (trade.getStatus() == TradeStatus.SETTLED) {
            throw new BadRequestException("Settled trades cannot be canceled");
        }
        
        trade.setStatus(TradeStatus.CANCELED);
        Trade canceledTrade = tradeRepository.save(trade);
        
        // Audit log
        auditLogService.logUserAction(currentUser, "UPDATE", 
                "Canceled trade: " + canceledTrade.getSide() + " " + 
                        canceledTrade.getQuantity() + " " + canceledTrade.getSymbol());
        
        return canceledTrade;
    }

    // Helper method to calculate commission
    private double calculateCommission(int quantity, double price) {
        // Example commission calculation: 0.5% of trade value with min $1.00
        double commission = quantity * price * 0.005;
        return Math.max(1.00, commission);
    }
}
