package com.cdweb.be.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateMatchRequest {

    private Integer venueId;

    @NotBlank(message = "Môn thể thao không được để trống")
    private String sport;

    private String customSport;

    @NotBlank(message = "Tiêu đề trận đấu không được để trống")
    private String title;

    private String description;

    @NotNull(message = "Số lượng người chơi tối đa không được để trống")
    @Min(value = 2, message = "Số lượng người chơi tối đa tối thiểu phải là 2")
    private Short maxPlayers;

    @Min(value = 0, message = "Phí tham gia không được là số âm")
    private Integer feePerPerson;

    @NotNull(message = "Giờ bắt đầu không được để trống")
    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private String locationText;

    private String skillLevel;
}
