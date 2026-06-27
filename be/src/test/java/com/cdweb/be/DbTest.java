package com.cdweb.be;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import java.util.List;
import java.util.Map;

@SpringBootTest
public class DbTest {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    public void checkDb() {
        System.out.println("====== DB CHECK ======");
        List<Map<String, Object>> users = jdbcTemplate.queryForList("SELECT id, email, role FROM users ORDER BY id DESC LIMIT 5");
        for (Map<String, Object> u : users) {
            System.out.println("User: " + u);
        }

        try {
            Long matchesToday = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM matches WHERE DATE(created_at) = CURRENT_DATE", Long.class);
            System.out.println("matchesToday: " + matchesToday);
        } catch (Exception e) {
            System.out.println("matchesToday error: " + e.getMessage());
        }

        try {
            Double avgFillRate = jdbcTemplate.queryForObject("SELECT AVG(CAST(joined_count AS FLOAT) / NULLIF(max_players, 0)) FROM (  SELECT m.max_players, COUNT(mp.id) as joined_count   FROM matches m   LEFT JOIN match_participants mp ON m.id = mp.match_id AND mp.status = 'joined'   GROUP BY m.id, m.max_players) subquery", Double.class);
            System.out.println("avgFillRate: " + avgFillRate);
        } catch (Exception e) {
            System.out.println("avgFillRate error: " + e.getCause().getMessage());
        }

        try {
            Object res = jdbcTemplate.queryForList("SELECT m.* FROM matches m WHERE CAST(m.status AS text) = 'open' LIMIT 1");
            System.out.println("cast status ok: " + res);
        } catch (Exception e) {
            System.out.println("cast status error: " + e.getCause().getMessage());
        }

        try {
            Object res = jdbcTemplate.queryForList("SELECT u.* FROM users u WHERE ('test' IS NULL OR LOWER(u.full_name) LIKE LOWER(CONCAT('%', 'test', '%'))) AND ('ACTIVE' IS NULL OR ('ACTIVE' = 'ACTIVE' AND u.is_active = true AND u.is_banned = false)) LIMIT 1");
            System.out.println("users ok: " + res);
        } catch (Exception e) {
            System.out.println("users error: " + e.getCause().getMessage());
        }
        System.out.println("======================");
    }
}
