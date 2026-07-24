package com.pecae.api;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import java.util.List;
import java.util.Map;

@SpringBootTest
public class CheckSchemaTest {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    public void dumpSellerProfilesSchema() {
        System.out.println("=== SELLER_PROFILES SCHEMA ===");
        List<Map<String, Object>> columns = jdbcTemplate.queryForList(
                "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'seller_profiles'"
        );
        for (Map<String, Object> col : columns) {
            System.out.println(col.get("column_name") + " | " + col.get("data_type") + " | " + col.get("is_nullable"));
        }
        System.out.println("==============================");
    }
}
