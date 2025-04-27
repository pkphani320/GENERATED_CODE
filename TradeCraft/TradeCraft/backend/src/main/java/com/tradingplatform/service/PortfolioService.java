package com.tradingplatform.service;

import com.tradingplatform.dto.PortfolioDto;
import com.tradingplatform.dto.PortfolioPerformanceDto;
import com.tradingplatform.exception.BadRequestException;
import com.tradingplatform.exception.ResourceNotFoundException;
import com.tradingplatform.exception.UnauthorizedException;
import com.tradingplatform.model.Organization;
import com.tradingplatform.model.Portfolio;
import com.tradingplatform.model.Trade;
import com.tradingplatform.repository.OrganizationRepository;
import com.tradingplatform.repository.PortfolioRepository;
import com.tradingplatform.repository.TradeRepository;
import com.tradingplatform.security.UserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PortfolioService {
    private final PortfolioRepository portfolioRepository;
    private final OrganizationRepository organizationRepository;
    private final TradeRepository tradeRepository;
    private final AuditLogService auditLogService;

    public PortfolioService(PortfolioRepository portfolioRepository,
                           OrganizationRepository organizationRepository,
                           TradeRepository tradeRepository,
                           AuditLogService auditLogService) {
        this.portfolioRepository = portfolioRepository;
        this.organizationRepository = organizationRepository;
        this.tradeRepository = tradeRepository;
        this.auditLogService = auditLogService;
    }

    public Page<Portfolio> getAllPortfolios(Pageable pageable, UserPrincipal currentUser) {
        Page<Portfolio> portfolios = portfolioRepository.findAll(pageable);
        
        // Calculate portfolio values
        portfolios.forEach(this::calculatePortfolioValues);
        
        return portfolios;
    }

    public Portfolio getPortfolioById(Long id, UserPrincipal currentUser) {
        Portfolio portfolio = portfolioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found with id: " + id));
        
        // Check if user has access to this portfolio (same organization)
        if (currentUser.getOrganizationId() != null && 
                !currentUser.getOrganizationId().equals(portfolio.getOrganization().getId())) {
            throw new UnauthorizedException("You don't have access to this portfolio");
        }
        
        // Calculate portfolio values
        calculatePortfolioValues(portfolio);
        
        return portfolio;
    }

    @Transactional
    public Portfolio createPortfolio(PortfolioDto portfolioDto, UserPrincipal currentUser) {
        // Check if organization exists
        Organization organization = organizationRepository.findById(portfolioDto.getOrganizationId())
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with id: " + portfolioDto.getOrganizationId()));
        
        // Check if user belongs to the organization
        if (currentUser.getOrganizationId() != null && 
                !currentUser.getOrganizationId().equals(organization.getId())) {
            throw new UnauthorizedException("You can only create portfolios for your organization");
        }
        
        Portfolio portfolio = new Portfolio(portfolioDto.getName(), organization);
        portfolio.setDescription(portfolioDto.getDescription());
        
        Portfolio savedPortfolio = portfolioRepository.save(portfolio);
        
        // Audit log
        auditLogService.logUserAction(currentUser, "CREATE", 
                "Created new portfolio: " + savedPortfolio.getName());
        
        return savedPortfolio;
    }

    @Transactional
    public Portfolio updatePortfolio(Long id, PortfolioDto portfolioDto, UserPrincipal currentUser) {
        Portfolio portfolio = portfolioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found with id: " + id));
        
        // Check if user has access to this portfolio (same organization)
        if (currentUser.getOrganizationId() != null && 
                !currentUser.getOrganizationId().equals(portfolio.getOrganization().getId())) {
            throw new UnauthorizedException("You don't have access to this portfolio");
        }
        
        // Check if organization changed and exists
        if (!portfolio.getOrganization().getId().equals(portfolioDto.getOrganizationId())) {
            Organization organization = organizationRepository.findById(portfolioDto.getOrganizationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Organization not found with id: " + portfolioDto.getOrganizationId()));
            
            // Check if user belongs to the new organization
            if (currentUser.getOrganizationId() != null && 
                    !currentUser.getOrganizationId().equals(organization.getId())) {
                throw new UnauthorizedException("You can only assign portfolios to your organization");
            }
            
            portfolio.setOrganization(organization);
        }
        
        portfolio.setName(portfolioDto.getName());
        portfolio.setDescription(portfolioDto.getDescription());
        
        Portfolio updatedPortfolio = portfolioRepository.save(portfolio);
        
        // Audit log
        auditLogService.logUserAction(currentUser, "UPDATE", 
                "Updated portfolio: " + updatedPortfolio.getName());
        
        // Calculate portfolio values
        calculatePortfolioValues(updatedPortfolio);
        
        return updatedPortfolio;
    }

    @Transactional
    public void deletePortfolio(Long id, UserPrincipal currentUser) {
        Portfolio portfolio = portfolioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found with id: " + id));
        
        // Check if user has access to this portfolio (same organization)
        if (currentUser.getOrganizationId() != null && 
                !currentUser.getOrganizationId().equals(portfolio.getOrganization().getId())) {
            throw new UnauthorizedException("You don't have access to this portfolio");
        }
        
        // Check if portfolio has trades
        List<Trade> trades = tradeRepository.findByPortfolioId(id);
        if (!trades.isEmpty()) {
            throw new BadRequestException("Cannot delete portfolio as it has associated trades");
        }
        
        // Audit log
        auditLogService.logUserAction(currentUser, "DELETE", 
                "Deleted portfolio: " + portfolio.getName());
        
        portfolioRepository.delete(portfolio);
    }

    public List<Portfolio> getPortfoliosByOrganization(Long organizationId, UserPrincipal currentUser) {
        // Check if organization exists
        if (!organizationRepository.existsById(organizationId)) {
            throw new ResourceNotFoundException("Organization not found with id: " + organizationId);
        }
        
        // Check if user belongs to the organization
        if (currentUser.getOrganizationId() != null && 
                !currentUser.getOrganizationId().equals(organizationId)) {
            throw new UnauthorizedException("You can only view portfolios for your organization");
        }
        
        List<Portfolio> portfolios = portfolioRepository.findByOrganizationId(organizationId);
        
        // Calculate portfolio values
        portfolios.forEach(this::calculatePortfolioValues);
        
        return portfolios;
    }

    public Page<Portfolio> getPortfoliosByOrganization(Long organizationId, Pageable pageable, UserPrincipal currentUser) {
        // Check if organization exists
        if (!organizationRepository.existsById(organizationId)) {
            throw new ResourceNotFoundException("Organization not found with id: " + organizationId);
        }
        
        // Check if user belongs to the organization
        if (currentUser.getOrganizationId() != null && 
                !currentUser.getOrganizationId().equals(organizationId)) {
            throw new UnauthorizedException("You can only view portfolios for your organization");
        }
        
        Page<Portfolio> portfolios = portfolioRepository.findByOrganizationId(organizationId, pageable);
        
        // Calculate portfolio values
        portfolios.forEach(this::calculatePortfolioValues);
        
        return portfolios;
    }

    public PortfolioPerformanceDto getPortfolioPerformance(Long id, String period, UserPrincipal currentUser) {
        Portfolio portfolio = portfolioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found with id: " + id));
        
        // Check if user has access to this portfolio (same organization)
        if (currentUser.getOrganizationId() != null && 
                !currentUser.getOrganizationId().equals(portfolio.getOrganization().getId())) {
            throw new UnauthorizedException("You don't have access to this portfolio");
        }
        
        LocalDate endDate = LocalDate.now();
        LocalDate startDate;
        
        switch (period.toLowerCase()) {
            case "1m":
                startDate = endDate.minusMonths(1);
                break;
            case "3m":
                startDate = endDate.minusMonths(3);
                break;
            case "6m":
                startDate = endDate.minusMonths(6);
                break;
            case "1y":
                startDate = endDate.minusYears(1);
                break;
            case "ytd":
                startDate = LocalDate.of(endDate.getYear(), 1, 1);
                break;
            default:
                startDate = endDate.minusMonths(1); // Default to 1 month
        }
        
        // Get trades for the period
        List<Trade> trades = tradeRepository.findByPortfolioIdAndTradeDateBetween(id, startDate, endDate);
        
        // Generate performance data (simplified implementation)
        // In a real-world scenario, this would likely involve more complex calculations
        // and potentially use market data from external sources
        Map<LocalDate, Double> dailyValues = new LinkedHashMap<>();
        
        // Generate a series of dates from start to end
        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            dailyValues.put(currentDate, calculatePortfolioValueAtDate(portfolio, trades, currentDate));
            currentDate = currentDate.plusDays(1);
        }
        
        PortfolioPerformanceDto performanceDto = new PortfolioPerformanceDto();
        performanceDto.setPortfolioId(id);
        performanceDto.setPeriod(period);
        performanceDto.setDates(new ArrayList<>(dailyValues.keySet()));
        performanceDto.setValues(new ArrayList<>(dailyValues.values()));
        
        // Calculate benchmark data (simplified)
        // In a real application, this would pull from a market index or other benchmark
        List<Double> benchmarkValues = calculateBenchmarkValues(dailyValues.keySet());
        performanceDto.setBenchmarkValues(benchmarkValues);
        
        return performanceDto;
    }

    public Map<String, Object> getPortfolioHoldings(Long id, UserPrincipal currentUser) {
        Portfolio portfolio = portfolioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found with id: " + id));
        
        // Check if user has access to this portfolio (same organization)
        if (currentUser.getOrganizationId() != null && 
                !currentUser.getOrganizationId().equals(portfolio.getOrganization().getId())) {
            throw new UnauthorizedException("You don't have access to this portfolio");
        }
        
        List<Trade> trades = tradeRepository.findByPortfolioId(id);
        
        // Calculate holdings
        Map<String, Map<String, Object>> holdingsMap = calculateHoldings(trades);
        
        // Convert to list for API response
        List<Map<String, Object>> holdingsList = holdingsMap.values().stream()
                .collect(Collectors.toList());
        
        // Calculate totals
        double totalMarketValue = holdingsList.stream()
                .mapToDouble(h -> (double) h.get("marketValue"))
                .sum();
        
        double totalCost = holdingsList.stream()
                .mapToDouble(h -> (double) h.get("totalCost"))
                .sum();
        
        double totalProfitLoss = holdingsList.stream()
                .mapToDouble(h -> (double) h.get("profitLoss"))
                .sum();
        
        Map<String, Object> result = new HashMap<>();
        result.put("holdings", holdingsList);
        result.put("totalMarketValue", totalMarketValue);
        result.put("totalCost", totalCost);
        result.put("totalProfitLoss", totalProfitLoss);
        result.put("profitLossPercent", totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0);
        
        return result;
    }

    // Helper methods
    private void calculatePortfolioValues(Portfolio portfolio) {
        List<Trade> trades = tradeRepository.findByPortfolioId(portfolio.getId());
        
        Map<String, Map<String, Object>> holdings = calculateHoldings(trades);
        
        double totalValue = holdings.values().stream()
                .mapToDouble(h -> (double) h.get("marketValue"))
                .sum();
        
        double totalCost = holdings.values().stream()
                .mapToDouble(h -> (double) h.get("totalCost"))
                .sum();
        
        double profitLoss = totalValue - totalCost;
        
        portfolio.setTotalValue(totalValue);
        portfolio.setTotalCost(totalCost);
        portfolio.setProfitLoss(profitLoss);
    }

    private Map<String, Map<String, Object>> calculateHoldings(List<Trade> trades) {
        Map<String, Map<String, Object>> holdings = new HashMap<>();
        
        for (Trade trade : trades) {
            String symbol = trade.getSymbol();
            
            if (!holdings.containsKey(symbol)) {
                Map<String, Object> holding = new HashMap<>();
                holding.put("symbol", symbol);
                holding.put("quantity", 0);
                holding.put("totalCost", 0.0);
                holdings.put(symbol, holding);
            }
            
            Map<String, Object> holding = holdings.get(symbol);
            int currentQuantity = (int) holding.get("quantity");
            double currentTotalCost = (double) holding.get("totalCost");
            
            if (trade.getSide() == Trade.TradeSide.BUY) {
                int newQuantity = currentQuantity + trade.getQuantity();
                double additionalCost = trade.getPrice() * trade.getQuantity();
                
                if (trade.getCommission() != null) {
                    additionalCost += trade.getCommission();
                }
                
                holding.put("quantity", newQuantity);
                holding.put("totalCost", currentTotalCost + additionalCost);
            } else { // SELL
                int newQuantity = currentQuantity - trade.getQuantity();
                
                // Assume FIFO (First In, First Out) for cost basis calculation
                // In a real application, you might have different cost basis methods
                double costBasisPerShare = currentQuantity > 0 ? currentTotalCost / currentQuantity : 0;
                double costBasisSold = costBasisPerShare * trade.getQuantity();
                
                holding.put("quantity", newQuantity);
                holding.put("totalCost", currentTotalCost - costBasisSold);
            }
            
            // Calculate current market value and profit/loss
            // In a real application, you would get current prices from market data
            // For this example, we'll use the latest trade price as an approximation
            double currentPrice = trade.getPrice();
            int quantity = (int) holding.get("quantity");
            double totalCost = (double) holding.get("totalCost");
            
            double marketValue = currentPrice * quantity;
            double profitLoss = marketValue - totalCost;
            double profitLossPercent = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;
            
            holding.put("averageCost", quantity > 0 ? totalCost / quantity : 0);
            holding.put("currentPrice", currentPrice);
            holding.put("marketValue", marketValue);
            holding.put("profitLoss", profitLoss);
            holding.put("profitLossPercent", profitLossPercent);
        }
        
        // Remove holdings with zero quantity
        holdings.entrySet().removeIf(entry -> (int) entry.getValue().get("quantity") == 0);
        
        return holdings;
    }

    private double calculatePortfolioValueAtDate(Portfolio portfolio, List<Trade> trades, LocalDate date) {
        // Filter trades up to the given date
        List<Trade> tradesUpToDate = trades.stream()
                .filter(trade -> !trade.getTradeDate().isAfter(date))
                .collect(Collectors.toList());
        
        Map<String, Map<String, Object>> holdings = calculateHoldings(tradesUpToDate);
        
        // Sum up market values
        return holdings.values().stream()
                .mapToDouble(h -> (double) h.get("marketValue"))
                .sum();
    }

    private List<Double> calculateBenchmarkValues(Set<LocalDate> dates) {
        // In a real application, this would fetch benchmark data from a market data source
        // For this example, we'll generate some synthetic benchmark values
        List<Double> benchmarkValues = new ArrayList<>();
        double baseValue = 100.0;
        double dailyChangePercent = 0.0005; // 0.05% daily change on average
        
        for (int i = 0; i < dates.size(); i++) {
            // Add some random variation
            double randomFactor = 1.0 + (Math.random() * 0.002 - 0.001); // ±0.1%
            baseValue *= (1 + dailyChangePercent * randomFactor);
            benchmarkValues.add(baseValue);
        }
        
        return benchmarkValues;
    }
}
