package com.cdweb.be.service;

import com.cdweb.be.dto.ReportDto;
import com.cdweb.be.dto.request.ReportRequestDto;

public interface ReportService {
    ReportDto checkReport(Integer reporterId, Integer matchId);
    ReportDto createReport(Integer reporterId, ReportRequestDto request);
    void deleteReport(Integer reporterId, Long reportId);
}
