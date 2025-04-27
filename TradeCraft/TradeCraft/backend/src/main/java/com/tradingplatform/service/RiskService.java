package com.tradingplatform.service;

import com.tradingplatform.dto.RiskDataDto;
import com.tradingplatform.exception.ResourceNotFoundException;
import com.tradingplatform.exception.UnauthorizedException;
import com.tradingplatform.model.Portfolio;
import com.tradingplatform.model.Trade;
import com.tradingplatform.repository.PortfolioRepository;
import com.tradingplatform.repository.TradeRepository;
import com.tradingplatform.security.UserPrincipal;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RiskService {
    private final PortfolioRepository portfolioRepository;
    private final TradeRepository tradeRepository;

    public RiskService(PortfolioRepository portfolioRepository, TradeRepository tradeRepository) {
        this.portfolioRepository = portfolioRepository;
        this.tradeRepository = tradeRepository;
    }

    public RiskDataDto getPortfolioRisk(Long portfolioId, UserPrincipal currentUser) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found with id: " + portfolioId));
        
        // Check if user has access to this portfolio (same organization)
        if (currentUser.getOrganizationId() != null && 
                !currentUser.getOrganizationId().equals(portfolio.getOrganization().getId())) {
            throw new UnauthorizedException("You don't have access to this portfolio");
        }
        
        List<Trade> trades = tradeRepository.findByPortfolioId(portfolioId);
        
        // Calculate risk metrics
        RiskDataDto riskData = calculateRiskMetrics(portfolio, trades);
        
        return riskData;
    }

    public Map<String, Double> getValueAtRisk(Long portfolioId, double confidenceLevel, UserPrincipal currentUser) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found with id: " + portfolioId));
        
        // Check if user has access to this portfolio (same organization)
        if (currentUser.getOrganizationId() != null && 
                !currentUser.getOrganizationId().equals(portfolio.getOrganization().getId())) {
            throw new UnauthorizedException("You don't have access to this portfolio");
        }
        
        List<Trade> trades = tradeRepository.findByPortfolioId(portfolioId);
        
        // Calculate VaR at different time horizons
        Map<String, Double> varData = calculateValueAtRisk(portfolio, trades, confidenceLevel);
        
        return varData;
    }

    public List<Map<String, Object>> getSectorExposure(Long portfolioId, UserPrincipal currentUser) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found with id: " + portfolioId));
        
        // Check if user has access to this portfolio (same organization)
        if (currentUser.getOrganizationId() != null && 
                !currentUser.getOrganizationId().equals(portfolio.getOrganization().getId())) {
            throw new UnauthorizedException("You don't have access to this portfolio");
        }
        
        List<Trade> trades = tradeRepository.findByPortfolioId(portfolioId);
        
        // Calculate sector exposure
        List<Map<String, Object>> sectorExposure = calculateSectorExposure(portfolio, trades);
        
        return sectorExposure;
    }

    public List<Map<String, Object>> getConcentrationRisk(Long portfolioId, UserPrincipal currentUser) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found with id: " + portfolioId));
        
        // Check if user has access to this portfolio (same organization)
        if (currentUser.getOrganizationId() != null && 
                !currentUser.getOrganizationId().equals(portfolio.getOrganization().getId())) {
            throw new UnauthorizedException("You don't have access to this portfolio");
        }
        
        List<Trade> trades = tradeRepository.findByPortfolioId(portfolioId);
        
        // Calculate concentration risk
        List<Map<String, Object>> concentrationRisk = calculateConcentrationRisk(portfolio, trades);
        
        return concentrationRisk;
    }

    public Map<String, Object> getMarketRisk(Long portfolioId, UserPrincipal currentUser) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found with id: " + portfolioId));
        
        // Check if user has access to this portfolio (same organization)
        if (currentUser.getOrganizationId() != null && 
                !currentUser.getOrganizationId().equals(portfolio.getOrganization().getId())) {
            throw new UnauthorizedException("You don't have access to this portfolio");
        }
        
        List<Trade> trades = tradeRepository.findByPortfolioId(portfolioId);
        
        // Calculate market risk
        Map<String, Object> marketRisk = calculateMarketRisk(portfolio, trades);
        
        return marketRisk;
    }

    public Map<String, Object> getLiquidityRisk(Long portfolioId, UserPrincipal currentUser) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found with id: " + portfolioId));
        
        // Check if user has access to this portfolio (same organization)
        if (currentUser.getOrganizationId() != null && 
                !currentUser.getOrganizationId().equals(portfolio.getOrganization().getId())) {
            throw new UnauthorizedException("You don't have access to this portfolio");
        }
        
        List<Trade> trades = tradeRepository.findByPortfolioId(portfolioId);
        
        // Calculate liquidity risk
        Map<String, Object> liquidityRisk = calculateLiquidityRisk(portfolio, trades);
        
        return liquidityRisk;
    }

    public RiskDataDto getOrganizationRisk(Long organizationId, UserPrincipal currentUser) {
        // Check if user has access to this organization
        if (currentUser.getOrganizationId() != null && 
                !currentUser.getOrganizationId().equals(organizationId)) {
            throw new UnauthorizedException("You don't have access to this organization");
        }
        
        List<Portfolio> portfolios = portfolioRepository.findByOrganizationId(organizationId);
        
        if (portfolios.isEmpty()) {
            throw new ResourceNotFoundException("No portfolios found for organization with id: " + organizationId);
        }
        
        // Aggregate risk data across all portfolios
        RiskDataDto aggregatedRiskData = new RiskDataDto();
        
        for (Portfolio portfolio : portfolios) {
            List<Trade> trades = tradeRepository.findByPortfolioId(portfolio.getId());
            RiskDataDto portfolioRiskData = calculateRiskMetrics(portfolio, trades);
            
            // Aggregate risk metrics (weighted by portfolio value)
            // In a real application, this would involve more sophisticated calculations
            aggregateRiskMetrics(aggregatedRiskData, portfolioRiskData, portfolio);
        }
        
        return aggregatedRiskData;
    }

    // Helper methods for risk calculations
    private RiskDataDto calculateRiskMetrics(Portfolio portfolio, List<Trade> trades) {
        // In a real application, these calculations would be much more sophisticated
        // and would likely involve market data, statistical models, etc.
        
        RiskDataDto riskData = new RiskDataDto();
        
        // Set portfolio ID
        riskData.setPortfolioId(portfolio.getId());
        
        // Calculate Value at Risk (VaR)
        Map<String, Double> varData = calculateValueAtRisk(portfolio, trades, 95.0); // 95% confidence level
        riskData.setValueAtRisk(varData);
        
        // Calculate Sharpe Ratio (example)
        double expectedReturn = 0.08; // 8% annualized return (example)
        double riskFreeRate = 0.02; // 2% risk-free rate (example)
        double volatility = 0.15; // 15% annualized volatility (example)
        double sharpeRatio = (expectedReturn - riskFreeRate) / volatility;
        riskData.setSharpeRatio(sharpeRatio);
        
        // Calculate Beta (example)
        double beta = 1.15; // Example beta
        riskData.setBeta(beta);
        
        // Calculate Volatility
        riskData.setVolatility("15.0%"); // Example volatility
        
        // Calculate Drawdown
        riskData.setDrawdown("8.5%"); // Example max drawdown
        
        // Calculate Tracking Error
        riskData.setTrackingError("3.2%"); // Example tracking error
        
        // Calculate Information Ratio
        riskData.setInformationRatio(0.85); // Example information ratio
        
        // Calculate Sortino Ratio
        riskData.setSortinoRatio(1.25); // Example sortino ratio
        
        // Calculate Liquidity Risk
        riskData.setLiquidityRisk("Low"); // Example liquidity risk
        
        // Calculate Stress Test Loss
        riskData.setStressTestLoss("12.5%"); // Example stress test loss
        
        return riskData;
    }

    private Map<String, Double> calculateValueAtRisk(Portfolio portfolio, List<Trade> trades, double confidenceLevel) {
        // In a real application, VaR calculation would involve:
        // 1. Historical return data
        // 2. Volatility calculations
        // 3. Statistical distributions
        // 4. Monte Carlo simulations
        
        // Example VaR calculations (simplified)
        double dailyVaR = 0.032; // 3.2% daily VaR at 95% confidence
        double weeklyVaR = dailyVaR * Math.sqrt(5); // Assuming 5 trading days
        double monthlyVaR = dailyVaR * Math.sqrt(21); // Assuming 21 trading days
        
        // Adjust for different confidence levels
        double adjustmentFactor = (confidenceLevel - 95) * 0.0008; // Example adjustment
        dailyVaR += adjustmentFactor;
        weeklyVaR += adjustmentFactor * Math.sqrt(5);
        monthlyVaR += adjustmentFactor * Math.sqrt(21);
        
        Map<String, Double> varData = new HashMap<>();
        varData.put("daily", dailyVaR);
        varData.put("weekly", weeklyVaR);
        varData.put("monthly", monthlyVaR);
        
        return varData;
    }

    private List<Map<String, Object>> calculateSectorExposure(Portfolio portfolio, List<Trade> trades) {
        // In a real application, sector information would come from a market data provider
        // For this example, we'll use a static mapping of symbols to sectors
        Map<String, String> symbolSectorMap = new HashMap<>();
        symbolSectorMap.put("AAPL", "Technology");
        symbolSectorMap.put("MSFT", "Technology");
        symbolSectorMap.put("GOOGL", "Technology");
        symbolSectorMap.put("AMZN", "Consumer");
        symbolSectorMap.put("TSLA", "Automotive");
        symbolSectorMap.put("JPM", "Financial");
        symbolSectorMap.put("BAC", "Financial");
        symbolSectorMap.put("PFE", "Healthcare");
        symbolSectorMap.put("JNJ", "Healthcare");
        symbolSectorMap.put("XOM", "Energy");
        
        // Calculate holdings
        Map<String, Map<String, Object>> holdings = calculateHoldings(trades);
        
        // Group by sector
        Map<String, Double> sectorExposure = new HashMap<>();
        double totalMarketValue = 0.0;
        
        for (Map<String, Object> holding : holdings.values()) {
            String symbol = (String) holding.get("symbol");
            double marketValue = (double) holding.get("marketValue");
            totalMarketValue += marketValue;
            
            String sector = symbolSectorMap.getOrDefault(symbol, "Other");
            sectorExposure.put(sector, sectorExposure.getOrDefault(sector, 0.0) + marketValue);
        }
        
        // Convert to percentages
        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<String, Double> entry : sectorExposure.entrySet()) {
            Map<String, Object> sectorData = new HashMap<>();
            sectorData.put("sector", entry.getKey());
            sectorData.put("exposure", (entry.getValue() / totalMarketValue) * 100);
            result.add(sectorData);
        }
        
        // Sort by exposure (descending)
        result.sort((a, b) -> Double.compare((double) b.get("exposure"), (double) a.get("exposure")));
        
        return result;
    }

    private List<Map<String, Object>> calculateConcentrationRisk(Portfolio portfolio, List<Trade> trades) {
        // Calculate holdings
        Map<String, Map<String, Object>> holdings = calculateHoldings(trades);
        
        // Calculate total market value
        double totalMarketValue = holdings.values().stream()
                .mapToDouble(h -> (double) h.get("marketValue"))
                .sum();
        
        // Calculate concentration percentages
        List<Map<String, Object>> result = new ArrayList<>();
        for (Map<String, Object> holding : holdings.values()) {
            Map<String, Object> concentrationData = new HashMap<>();
            concentrationData.put("symbol", holding.get("symbol"));
            double weight = ((double) holding.get("marketValue") / totalMarketValue) * 100;
            concentrationData.put("weight", weight);
            
            // Example risk contribution calculation
            double beta = 1.0 + Math.random() * 0.5; // Example beta between 1.0 and 1.5
            double riskContribution = weight * beta / holdings.size();
            concentrationData.put("riskContribution", riskContribution);
            
            result.add(concentrationData);
        }
        
        // Sort by weight (descending)
        result.sort((a, b) -> Double.compare((double) b.get("weight"), (double) a.get("weight")));
        
        return result;
    }

    private Map<String, Object> calculateMarketRisk(Portfolio portfolio, List<Trade> trades) {
        // In a real application, market risk would involve:
        // 1. Beta calculations for each holding
        // 2. Market factor exposure
        // 3. Sensitivity to interest rates, currencies, etc.
        
        Map<String, Object> marketRisk = new HashMap<>();
        
        // Example market risk metrics
        marketRisk.put("beta", 1.15);
        marketRisk.put("interestRateSensitivity", 0.25);
        marketRisk.put("currencyRisk", "Low");
        marketRisk.put("commodityExposure", "Medium");
        
        return marketRisk;
    }

    private Map<String, Object> calculateLiquidityRisk(Portfolio portfolio, List<Trade> trades) {
        // In a real application, liquidity risk would involve:
        // 1. Trading volumes for each holding
        // 2. Bid-ask spreads
        // 3. Time to liquidate positions
        
        Map<String, Object> liquidityRisk = new HashMap<>();
        
        // Example liquidity risk metrics
        liquidityRisk.put("overallRisk", "Low");
        liquidityRisk.put("daysToLiquidate", 2.5);
        liquidityRisk.put("liquidationCost", 0.8); // percentage cost to liquidate entire portfolio
        
        Map<String, String> symbolLiquidityMap = new HashMap<>();
        symbolLiquidityMap.put("AAPL", "High");
        symbolLiquidityMap.put("MSFT", "High");
        symbolLiquidityMap.put("GOOGL", "High");
        symbolLiquidityMap.put("AMZN", "High");
        symbolLiquidityMap.put("TSLA", "Medium");
        
        liquidityRisk.put("symbolLiquidity", symbolLiquidityMap);
        
        return liquidityRisk;
    }

    private void aggregateRiskMetrics(RiskDataDto aggregated, RiskDataDto portfolio, Portfolio portfolioEntity) {
        // This is a simplified aggregation approach
        // In a real application, risk aggregation would be more sophisticated
        
        // For numeric values, use weighted averages
        double weight = 1.0 / portfolioEntity.getTotalValue(); // Simplified weighting
        
        // Weighted average for Sharpe ratio, beta, etc.
        if (aggregated.getSharpeRatio() == 0) {
            aggregated.setSharpeRatio(portfolio.getSharpeRatio());
        } else {
            aggregated.setSharpeRatio((aggregated.getSharpeRatio() + portfolio.getSharpeRatio()) / 2);
        }
        
        if (aggregated.getBeta() == 0) {
            aggregated.setBeta(portfolio.getBeta());
        } else {
            aggregated.setBeta((aggregated.getBeta() + portfolio.getBeta()) / 2);
        }
        
        // For VaR, use sum approach with diversification benefit
        if (aggregated.getValueAtRisk() == null) {
            aggregated.setValueAtRisk(portfolio.getValueAtRisk());
        } else {
            Map<String, Double> aggregatedVaR = aggregated.getValueAtRisk();
            Map<String, Double> portfolioVaR = portfolio.getValueAtRisk();
            
            // Apply a diversification benefit (simplified)
            double diversificationFactor = 0.9; // 10% diversification benefit
            
            for (String timeframe : portfolioVaR.keySet()) {
                double combined = aggregatedVaR.getOrDefault(timeframe, 0.0) + 
                                 portfolioVaR.getOrDefault(timeframe, 0.0);
                aggregatedVaR.put(timeframe, combined * diversificationFactor);
            }
        }
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
                double costBasisPerShare = currentQuantity > 0 ? currentTotalCost / currentQuantity : 0;
                double costBasisSold = costBasisPerShare * trade.getQuantity();
                
                holding.put("quantity", newQuantity);
                holding.put("totalCost", currentTotalCost - costBasisSold);
            }
            
            // Calculate current market value and profit/loss
            // Using the most recent trade price as an approximation
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
}
