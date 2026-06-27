import java.sql.*;

public class CheckDB {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres";
        String user = "postgres.khdoccvmdinkbqbmcubb";
        String password = "sportmate@123";

        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            System.out.println("Connected to DB!");
            
            try (Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery("SELECT id, email, role FROM users ORDER BY id DESC LIMIT 5")) {
                while (rs.next()) {
                    System.out.println("User: " + rs.getInt("id") + " - " + rs.getString("email") + " - Role: " + rs.getString("role"));
                }
            }

            try (Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM matches WHERE DATE(created_at) = CURRENT_DATE")) {
                if (rs.next()) System.out.println("matchesToday: " + rs.getLong(1));
            } catch (Exception e) {
                System.out.println("matchesToday error: " + e.getMessage());
            }

            try (Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery("SELECT AVG(CAST(joined_count AS FLOAT) / NULLIF(max_participants, 0)) FROM (  SELECT m.max_participants, COUNT(mp.id) as joined_count   FROM matches m   LEFT JOIN match_participants mp ON m.id = mp.match_id AND mp.status = 'joined'   GROUP BY m.id, m.max_participants) subquery")) {
                if (rs.next()) System.out.println("avgFillRate: " + rs.getDouble(1));
            } catch (Exception e) {
                System.out.println("avgFillRate error: " + e.getMessage());
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
