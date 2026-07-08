package com.cdweb.be.security;

import com.cdweb.be.entity.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Getter
@AllArgsConstructor
@Builder
public class UserPrincipal implements UserDetails {

    private final Integer id;
    private final String email;

    @JsonIgnore
    private final String password;

    private final String fullName;
    private final Collection<? extends GrantedAuthority> authorities;
    private final boolean active;
    private final boolean banned;

    public static UserPrincipal create(User user) {
        String roleName = (user.getRole() != null) ? user.getRole().name().toUpperCase() : "USER";
        if (!roleName.startsWith("ROLE_")) {
            roleName = "ROLE_" + roleName;
        }

        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(roleName));

        return UserPrincipal.builder()
                .id(user.getId())
                .email(user.getEmail())
                .password(user.getPasswordHash())
                .fullName(user.getFullName())
                .authorities(authorities)
                .active(Boolean.TRUE.equals(user.getIsActive()))
                .banned(Boolean.TRUE.equals(user.getIsBanned()))
                .build();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return !banned;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return active && !banned;
    }
}
