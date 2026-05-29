package com.cdweb.be.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class CreateMatchRequest {

    @NotBlank(message = "Môn thể thao không được để trống")
    private String sport;
    private String customSport;

    private Integer venueId;
    private String location;

    @NotBlank(message = "Tiêu đề trận đấu không được để trống")
    private String title;

    private String description;

    @NotNull(message = "Ngày diễn ra không được để trống")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;

    @NotNull(message = "Giờ bắt đầu không được để trống")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;

    @NotNull(message = "Giờ kết thúc không được để trống")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;

    private String skillLevel;

    @NotNull(message = "Số lượng người chơi tối đa không được để trống")
    @Min(value = 2, message = "Số lượng người chơi tối đa tối thiểu phải là 2")
    private Short maxPlayers;

    private String feeType;

    @Min(value = 0, message = "Phí tham gia không được là số âm")
    private Integer fee;

    private String imageUrl;
}
