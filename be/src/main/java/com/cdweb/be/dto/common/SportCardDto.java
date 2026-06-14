package com.cdweb.be.dto.common;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SportCardDto {
    private String name;
    private String tag;
    private String level;
    private String note;
}
