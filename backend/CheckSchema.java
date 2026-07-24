import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class CheckSchema {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/pecae";
        String user = "postgres";
        String password = "postgres";

        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'seller_profiles'")) {

            System.out.println("Columns in seller_profiles:");
            while (rs.next()) {
                System.out.println(rs.getString("column_name") + " | " + 
                                   rs.getString("data_type") + " | " + 
                                   rs.getString("is_nullable"));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
