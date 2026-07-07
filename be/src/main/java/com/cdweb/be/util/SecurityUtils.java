package com.cdweb.be.util;

import com.cdweb.be.security.UserPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Utility helper for accessing the currently authenticated user
 * from the Spring Security SecurityContextHolder.
 */
public final class SecurityUtils {

    private SecurityUtils() {
        // Utility class — no instantiation
    }

    /**
     * Returns the UserPrincipal of the currently authenticated user,
     * or null if no authentication is present.
     */
    public static UserPrincipal getCurrentUserPrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserPrincipal) {
            return (UserPrincipal) principal;
        }
        return null;
    }

    /**
     * Returns the ID of the currently authenticated user,
     * or null if no authentication is present.
     */
    public static Integer getCurrentUserId() {
        UserPrincipal principal = getCurrentUserPrincipal();
        return (principal != null) ? principal.getId() : null;
    }

    /**
     * Returns true if a user is currently authenticated.
     */
    public static boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.isAuthenticated()
                && !(authentication.getPrincipal() instanceof String);
    }

    /**
     * Returns true if the current user has the given role (e.g. "ROLE_ADMIN").
     */
    public static boolean hasRole(String role) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) return false;
        return authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals(role));
    }
}
