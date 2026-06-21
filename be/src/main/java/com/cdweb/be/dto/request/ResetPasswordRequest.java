package com.cdweb.be.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ResetPasswordRequest {
    @NotBlank(message = "Token rỗng")
    private String token;

    @NotBlank(message = "Mật khẩu mới không được để trống")
    @Size(min = 8, message = "Mật khẩu mới phải có ít nhất 8 ký tự")
    @Pattern(
        regexp = "^(?=.*[A-Z])(?=.*[\\W_]).+$",
        message = "Mật khẩu phải chứa ít nhất 1 chữ hoa và 1 ký tự đặc biệt"
    )
    private String newPassword;
}
