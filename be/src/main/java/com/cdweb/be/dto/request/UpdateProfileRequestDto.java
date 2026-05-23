package com.cdweb.be.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequestDto {
    @NotBlank(message = "Họ tên không được để trống")
    @Size(max = 100, message = "Họ tên không được vượt quá 100 ký tự")
    private String fullName;

    private String avatarUrl;

    private String bio;

    @Size(max = 60, message = "Quận/Huyện không được vượt quá 60 ký tự")
    private String district;

    private Double lat;

    private Double lng;
}