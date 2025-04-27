package com.tradingplatform.repository;

import com.tradingplatform.model.Portfolio;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {
    List<Portfolio> findByOrganizationId(Long organizationId);
    
    Page<Portfolio> findByOrganizationId(Long organizationId, Pageable pageable);
}
