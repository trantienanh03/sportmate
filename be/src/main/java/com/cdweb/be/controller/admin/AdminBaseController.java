package com.cdweb.be.controller.admin;

import com.cdweb.be.entity.User;
import com.cdweb.be.enums.UserRole;
import com.cdweb.be.exception.AppException;
import com.cdweb.be.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;

public abstract class AdminBaseController {
    
    protected final UserRepository userRepository;

    protected AdminBaseController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    protected Integer requireAdminId(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "Vui lòng đăng nhập");
        }
        Integer userId = (Integer) session.getAttribute("userId");
        
        // Cẩn thận check thêm role ở DB cho an toàn
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(HttpStatus.UNAUTHORIZED, "User không tồn tại"));
                
        if (user.getRole() != UserRole.admin) {
            throw new AppException(HttpStatus.FORBIDDEN, "Bạn không có quyền truy cập trang quản trị");
        }
        
        return userId;
    }
}
