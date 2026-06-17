package com.cdweb.be.controller;

import com.cdweb.be.entity.Report;
import com.cdweb.be.entity.User;
import com.cdweb.be.entity.UserStat;
import com.cdweb.be.repository.ReportRepository;
import com.cdweb.be.repository.UserRepository;
import com.cdweb.be.repository.UserStatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
public class TestController {

    private final UserRepository userRepository;
    private final UserStatRepository userStatRepository;
    private final ReportRepository reportRepository;

    @GetMapping("/seed-badges")
    public String seedBadges(@RequestParam Integer userId, @RequestParam String type) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        UserStat stat = userStatRepository.findByUserId(userId).orElse(new UserStat());
        stat.setUser(user);

        if ("pro".equals(type)) {
            // Seed Chuyên nghiệp + Thân thiện + Tích cực
            stat.setCompletedMatches(10);
            stat.setAvgAttitudeScore(4.8);
            stat.setAvgSkillScore(4.9);
            userStatRepository.save(stat);
            return "Đã set user " + userId + " thành Chuyên nghiệp + Thân thiện + Tích cực.";
        } else if ("warning".equals(type)) {
            // Seed Cảnh báo uy tín (Thái độ thấp)
            stat.setCompletedMatches(5);
            stat.setAvgAttitudeScore(2.0);
            stat.setAvgSkillScore(4.0);
            userStatRepository.save(stat);
            return "Đã set user " + userId + " có cảnh báo uy tín (Thái độ 2.0).";
        } else if ("report".equals(type)) {
            // Seed 3 reports cho user này
            for (int i = 0; i < 3; i++) {
                Report report = new Report();
                report.setReportedUser(user);
                report.setReporter(user); // Tạm lấy chính họ làm người report cho nhanh
                report.setReason("Gian lận - Bùng kèo test " + i);
                reportRepository.save(report);
            }
            return "Đã tạo 3 reports cho user " + userId + ". Sẽ có cảnh báo đỏ.";
        } else if ("reset".equals(type)) {
            stat.setCompletedMatches(0);
            stat.setAvgAttitudeScore(0.0);
            stat.setAvgSkillScore(0.0);
            userStatRepository.save(stat);
            return "Đã reset stat của user " + userId + " về Tân binh.";
        }

        return "Loại test không hợp lệ (pro, warning, report, reset)";
    }
}
