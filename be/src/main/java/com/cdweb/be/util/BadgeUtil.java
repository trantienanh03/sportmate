package com.cdweb.be.util;

import com.cdweb.be.entity.UserStat;

import java.util.ArrayList;
import java.util.List;

public class BadgeUtil {

    public static List<String> calculateBadges(UserStat stat, long reportsCount) {
        List<String> badges = new ArrayList<>();
        boolean hasWarning = false;
        if (reportsCount >= 3) {
            hasWarning = true;
        }
        if (stat != null && stat.getAvgAttitudeScore() != null && stat.getAvgAttitudeScore() > 0 && stat.getAvgAttitudeScore() < 3.0) {
            hasWarning = true;
        }
        
        if (hasWarning) {
            badges.add("Cảnh báo uy tín");
        }

        if (stat == null) {
            if (!hasWarning) badges.add("Tân binh");
            return badges;
        }

        if (stat.getCompletedMatches() != null && stat.getCompletedMatches() < 5) {
            badges.add("Tân binh");
        } else if (stat.getCompletedMatches() != null && stat.getCompletedMatches() >= 5) {
            badges.add("Tích cực");
        }
        
        if (stat.getAvgAttitudeScore() != null && stat.getAvgAttitudeScore() >= 4.0) {
            badges.add("Thân thiện");
        }
        if (stat.getAvgSkillScore() != null && stat.getAvgSkillScore() >= 4.0) {
            badges.add("Chuyên nghiệp");
        }
        
        if (badges.isEmpty() && !hasWarning) {
            badges.add("Tân binh");
        }

        return badges;
    }
}
