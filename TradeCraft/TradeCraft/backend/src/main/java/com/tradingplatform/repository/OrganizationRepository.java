package com.tradingplatform.repository;

import com.tradingplatform.model.Organization;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, Long> {
    List<Organization> findByActive(boolean active);
    
    Page<Organization> findByActive(boolean active, Pageable pageable);
    
    Boolean existsByName(String name);
}
