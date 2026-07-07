package com.cdweb.be.controller.admin;

import com.cdweb.be.exception.AppException;
import com.cdweb.be.repository.UserRepository;
import com.cdweb.be.util.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;

@PreAuthorize("hasRole('ADMIN')")
public abstract class AdminBaseController {
    
    protected final UserRepository userRepository;

    protected AdminBaseController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    protected Integer requireAdminId(HttpServletRequest request) {
        Integer userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "Vui lòng đăng nhập");
        }
        return userId;
    }
}
