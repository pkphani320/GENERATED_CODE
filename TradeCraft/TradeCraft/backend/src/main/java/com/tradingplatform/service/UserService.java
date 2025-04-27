package com.tradingplatform.service;

import com.tradingplatform.dto.UserDto;
import com.tradingplatform.exception.BadRequestException;
import com.tradingplatform.exception.ResourceNotFoundException;
import com.tradingplatform.model.Organization;
import com.tradingplatform.model.Role;
import com.tradingplatform.model.Role.RoleName;
import com.tradingplatform.model.User;
import com.tradingplatform.repository.OrganizationRepository;
import com.tradingplatform.repository.RoleRepository;
import com.tradingplatform.repository.UserRepository;
import com.tradingplatform.security.UserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final OrganizationRepository organizationRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    public UserService(UserRepository userRepository, RoleRepository roleRepository,
                      OrganizationRepository organizationRepository,
                      PasswordEncoder passwordEncoder, AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.organizationRepository = organizationRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogService = auditLogService;
    }

    public Page<User> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    @Transactional
    public User createUser(UserDto userDto, UserPrincipal currentUser) {
        if (userRepository.existsByUsername(userDto.getUsername())) {
            throw new BadRequestException("Username is already taken");
        }

        if (userRepository.existsByEmail(userDto.getEmail())) {
            throw new BadRequestException("Email is already in use");
        }

        User user = new User(userDto.getUsername(), userDto.getEmail(), 
                passwordEncoder.encode(userDto.getPassword()));
        
        user.setFirstName(userDto.getFirstName());
        user.setLastName(userDto.getLastName());

        // Set organization if provided
        if (userDto.getOrganizationId() != null) {
            Organization organization = organizationRepository.findById(userDto.getOrganizationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Organization not found with id: " + userDto.getOrganizationId()));
            user.setOrganization(organization);
        }

        // Assign roles
        Set<Role> roles = new HashSet<>();
        if (userDto.getRoles() != null && !userDto.getRoles().isEmpty()) {
            userDto.getRoles().forEach(roleName -> {
                switch (roleName) {
                    case "ADMIN":
                        Role adminRole = roleRepository.findByName(RoleName.ROLE_ADMIN)
                                .orElseThrow(() -> new RuntimeException("Error: Role ADMIN not found"));
                        roles.add(adminRole);
                        break;
                    case "TRADER":
                        Role traderRole = roleRepository.findByName(RoleName.ROLE_TRADER)
                                .orElseThrow(() -> new RuntimeException("Error: Role TRADER not found"));
                        roles.add(traderRole);
                        break;
                    default:
                        Role viewerRole = roleRepository.findByName(RoleName.ROLE_VIEWER)
                                .orElseThrow(() -> new RuntimeException("Error: Role VIEWER not found"));
                        roles.add(viewerRole);
                }
            });
        } else {
            // Default role: VIEWER
            Role viewerRole = roleRepository.findByName(RoleName.ROLE_VIEWER)
                    .orElseThrow(() -> new RuntimeException("Error: Default Role VIEWER not found"));
            roles.add(viewerRole);
        }

        user.setRoles(roles);
        User savedUser = userRepository.save(user);
        
        // Audit log
        auditLogService.logUserAction(currentUser, "CREATE", 
                "Created new user: " + savedUser.getUsername());
        
        return savedUser;
    }

    @Transactional
    public User updateUser(Long id, UserDto userDto, UserPrincipal currentUser) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (!user.getUsername().equals(userDto.getUsername()) &&
                userRepository.existsByUsername(userDto.getUsername())) {
            throw new BadRequestException("Username is already taken");
        }

        if (!user.getEmail().equals(userDto.getEmail()) &&
                userRepository.existsByEmail(userDto.getEmail())) {
            throw new BadRequestException("Email is already in use");
        }

        user.setUsername(userDto.getUsername());
        user.setEmail(userDto.getEmail());
        user.setFirstName(userDto.getFirstName());
        user.setLastName(userDto.getLastName());

        // Update organization if provided
        if (userDto.getOrganizationId() != null) {
            Organization organization = organizationRepository.findById(userDto.getOrganizationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Organization not found with id: " + userDto.getOrganizationId()));
            user.setOrganization(organization);
        } else {
            user.setOrganization(null);
        }

        // Update roles if provided
        if (userDto.getRoles() != null) {
            Set<Role> roles = new HashSet<>();
            userDto.getRoles().forEach(roleName -> {
                switch (roleName) {
                    case "ADMIN":
                        Role adminRole = roleRepository.findByName(RoleName.ROLE_ADMIN)
                                .orElseThrow(() -> new RuntimeException("Error: Role ADMIN not found"));
                        roles.add(adminRole);
                        break;
                    case "TRADER":
                        Role traderRole = roleRepository.findByName(RoleName.ROLE_TRADER)
                                .orElseThrow(() -> new RuntimeException("Error: Role TRADER not found"));
                        roles.add(traderRole);
                        break;
                    default:
                        Role viewerRole = roleRepository.findByName(RoleName.ROLE_VIEWER)
                                .orElseThrow(() -> new RuntimeException("Error: Role VIEWER not found"));
                        roles.add(viewerRole);
                }
            });
            user.setRoles(roles);
        }

        User updatedUser = userRepository.save(user);
        
        // Audit log
        auditLogService.logUserAction(currentUser, "UPDATE", 
                "Updated user: " + updatedUser.getUsername());
        
        return updatedUser;
    }

    @Transactional
    public void deleteUser(Long id, UserPrincipal currentUser) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        
        // Audit log before deletion
        auditLogService.logUserAction(currentUser, "DELETE", 
                "Deleted user: " + user.getUsername());
        
        userRepository.delete(user);
    }

    @Transactional
    public User changePassword(Long id, String currentPassword, String newPassword, UserPrincipal currentUser) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        User updatedUser = userRepository.save(user);
        
        // Audit log
        auditLogService.logUserAction(currentUser, "UPDATE", 
                "Changed password for user: " + updatedUser.getUsername());
        
        return updatedUser;
    }

    public List<User> getUsersByOrganization(Long organizationId) {
        if (!organizationRepository.existsById(organizationId)) {
            throw new ResourceNotFoundException("Organization not found with id: " + organizationId);
        }
        return userRepository.findByOrganizationId(organizationId);
    }

    public Page<User> getUsersByOrganization(Long organizationId, Pageable pageable) {
        if (!organizationRepository.existsById(organizationId)) {
            throw new ResourceNotFoundException("Organization not found with id: " + organizationId);
        }
        return userRepository.findByOrganizationId(organizationId, pageable);
    }

    @Transactional
    public User assignRole(Long userId, Long roleId, UserPrincipal currentUser) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + roleId));
        
        Set<Role> roles = user.getRoles();
        roles.add(role);
        user.setRoles(roles);
        
        User updatedUser = userRepository.save(user);
        
        // Audit log
        auditLogService.logUserAction(currentUser, "UPDATE", 
                "Assigned role " + role.getName() + " to user: " + updatedUser.getUsername());
        
        return updatedUser;
    }

    @Transactional
    public User removeRole(Long userId, Long roleId, UserPrincipal currentUser) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + roleId));
        
        Set<Role> roles = user.getRoles();
        roles.remove(role);
        
        if (roles.isEmpty()) {
            throw new BadRequestException("Cannot remove the last role from a user");
        }
        
        user.setRoles(roles);
        User updatedUser = userRepository.save(user);
        
        // Audit log
        auditLogService.logUserAction(currentUser, "UPDATE", 
                "Removed role " + role.getName() + " from user: " + updatedUser.getUsername());
        
        return updatedUser;
    }

    public List<String> getUserRoles(User user) {
        return user.getRoles().stream()
                .map(role -> role.getName().name().replace("ROLE_", ""))
                .collect(Collectors.toList());
    }
}
