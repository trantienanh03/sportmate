package com.cdweb.be.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateSplitBillRequest {

    @NotNull(message = "Mã phòng không được để trống")
    private Integer roomId;

    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;

    @NotNull(message = "Tổng số tiền không được để trống")
    private Integer totalAmount;

    @NotBlank(message = "Mã ngân hàng không được để trống")
    private String bankCode;

    @NotBlank(message = "Số tài khoản không được để trống")
    private String accountNumber;

    @NotBlank(message = "Tên tài khoản không được để trống")
    private String accountName;

    private String note;
}
