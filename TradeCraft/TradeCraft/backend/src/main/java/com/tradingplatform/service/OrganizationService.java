package com.tradingplatform.service;

import com.tradingplatform.dto.OrganizationDto;
import com.tradingplatform.exception.BadRequestException;
import com.tradingplatform.exception.ResourceNotFoundException;
import com.tradingplatform.model.Organization;
import com.tradingplatform.model.User;
import com.tradingplatform.repository.OrganizationRepository;
import com.tradingplatform.repository.UserRepository;
import com.tradingplatform.security.UserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OrganizationService {
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public OrganizationService(OrganizationRepository organizationRepository, 
                              UserRepository userRepository,
                              AuditLogService auditLogService) {
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    public Page<Organization> getAllOrganizations(Pageable pageable) {
        return organizationRepository.findAll(pageable);
    }

    public Organization getOrganizationById(Long id) {
        return organizationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with id: " + id));
    }

    @Transactional
    public Organization createOrganization(OrganizationDto organizationDto, UserPrincipal currentUser) {
        if (organizationRepository.existsByName(organizationDto.getName())) {
            throw new BadRequestException("Organization name is already taken");
        }

        Organization organization = new Organization(organizationDto.getName());
        organization.setDescription(organizationDto.getDescription());
        organization.setContactEmail(organizationDto.getContactEmail());
        organization.setContactPhone(organizationDto.getContactPhone());
        organization.setAddress(organizationDto.getAddress());
        organization.setActive(organizationDto.isActive());

        Organization savedOrganization = organizationRepository.save(organization);
        
        // Audit log
        auditLogService.logUserAction(currentUser, "CREATE", 
                "Created new organization: " + savedOrganization.getName());
        
        return savedOrganization;
    }

    @Transactional
    public Organization updateOrganization(Long id, OrganizationDto organizationDto, UserPrincipal currentUser) {
        Organization organization = organizationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with id: " + id));

        if (!organization.getName().equals(organizationDto.getName()) &&
                organizationRepository.existsByName(organizationDto.getName())) {
            throw new BadRequestException("Organization name is already taken");
        }

        organization.setName(organizationDto.getName());
        organization.setDescription(organizationDto.getDescription());
        organization.setContactEmail(organizationDto.getContactEmail());
        organization.setContactPhone(organizationDto.getContactPhone());
        organization.setAddress(organizationDto.getAddress());
        organization.setActive(organizationDto.isActive());

        Organization updatedOrganization = organizationRepository.save(organization);
        
        // Audit log
        auditLogService.logUserAction(currentUser, "UPDATE", 
                "Updated organization: " + updatedOrganization.getName());
        
        return updatedOrganization;
    }

    @Transactional
    public void deleteOrganization(Long id, UserPrincipal currentUser) {
        Organization organization = organizationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with id: " + id));
        
        // Check if the organization has users
        List<User> users = userRepository.findByOrganizationId(id);
        if (!users.isEmpty()) {
            throw new BadRequestException("Cannot delete organization as it has associated users");
        }
        
        // Audit log before deletion
        auditLogService.logUserAction(currentUser, "DELETE", 
                "Deleted organization: " + organization.getName());
        
        organizationRepository.delete(organization);
    }

    @Transactional
    public User assignUserToOrganization(Long userId, Long organizationId, UserPrincipal currentUser) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with id: " + organizationId));
        
        user.setOrganization(organization);
        User updatedUser = userRepository.save(user);
        
        // Audit log
        auditLogService.logUserAction(currentUser, "UPDATE", 
                "Assigned user " + user.getUsername() + " to organization: " + organization.getName());
        
        return updatedUser;
    }

    @Transactional
    public User removeUserFromOrganization(Long userId, Long organizationId, UserPrincipal currentUser) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with id: " + organizationId));
        
        if (user.getOrganization() == null || !user.getOrganization().getId().equals(organizationId)) {
            throw new BadRequestException("User is not part of this organization");
        }
        
        user.setOrganization(null);
        User updatedUser = userRepository.save(user);
        
        // Audit log
        auditLogService.logUserAction(currentUser, "UPDATE", 
                "Removed user " + user.getUsername() + " from organization: " + organization.getName());
        
        return updatedUser;
    }

    public List<Organization> getActiveOrganizations() {
        return organizationRepository.findByActive(true);
    }

    public Page<Organization> getActiveOrganizations(Pageable pageable) {
        return organizationRepository.findByActive(true, pageable);
    }
}
