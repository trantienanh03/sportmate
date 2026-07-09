package com.cdweb.be.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import java.util.Map;
import java.util.List;
import java.util.HashMap;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class GeminiService {

    @Value("${GEMINI_API_KEY:}")
    private String geminiApiKey;

    public String generateMatchDescription(Map<String, Object> matchInfo) {
        if (geminiApiKey == null || geminiApiKey.isEmpty()) {
            return "Vui lòng cấu hình GEMINI_API_KEY trong file .env để sử dụng tính năng này.";
        }

        String url = "https://generativelanguage.googleapis.com/v1/models/gemini-3.1-flash-lite:generateContent?key="
                + geminiApiKey;
        RestTemplate restTemplate = new RestTemplate();

        String prompt = "Bạn là một người yêu thể thao đang cần tìm đồng đội. " +
                "Dựa vào các thông tin sau, hãy viết một đoạn mô tả (khoảng 2-3 câu) " +
                "ngắn gọn, thu hút, thân thiện để rủ mọi người tham gia trận đấu:\n" +
                "Môn thể thao: " + matchInfo.get("sport") + "\n" +
                "Địa điểm: " + matchInfo.get("location") + "\n" +
                "Thời gian: " + matchInfo.get("date") + " từ " + matchInfo.get("startTime") + " đến "
                + matchInfo.get("endTime") + "\n" +
                "Trình độ yêu cầu: " + matchInfo.get("skillLevel") + "\n" +
                "Số người cần: " + matchInfo.get("maxPlayers") + "\n" +
                "Lưu ý: Viết thật tự nhiên như người bình thường đang nhắn tin rủ bạn bè đi tập. Chỉ trả về đoạn văn bản, không thêm các tiền tố giới thiệu.";

        Map<String, Object> requestBody = new HashMap<>();
        Map<String, Object> parts = new HashMap<>();
        parts.put("text", prompt);

        Map<String, Object> content = new HashMap<>();
        content.put("parts", List.of(parts));

        requestBody.put("contents", List.of(content));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            Map<String, Object> responseBody = response.getBody();
            if (responseBody != null && responseBody.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> firstCandidate = candidates.get(0);
                    Map<String, Object> contentMap = (Map<String, Object>) firstCandidate.get("content");
                    List<Map<String, Object>> resParts = (List<Map<String, Object>>) contentMap.get("parts");
                    if (!resParts.isEmpty()) {
                        return (String) resParts.get(0).get("text");
                    }
                }
            }
            return "Không thể tạo mô tả lúc này.";
        } catch (Exception e) {
            log.error("Failed to generate description from Gemini", e);
            return "Đã xảy ra lỗi khi kết nối tới AI. Chi tiết: " + e.getMessage();
        }
    }
}
