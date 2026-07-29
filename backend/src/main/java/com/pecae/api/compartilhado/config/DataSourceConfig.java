package com.pecae.api.compartilhado.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;

@Configuration
public class DataSourceConfig {

    @Value("${DATABASE_URL:}")
    private String databaseUrl;

    @Value("${spring.datasource.url:}")
    private String springDatasourceUrl;

    @Value("${spring.datasource.username:postgres}")
    private String defaultUsername;

    @Value("${spring.datasource.password:postgres}")
    private String defaultPassword;

    @Bean
    @Primary
    public DataSource dataSource() throws URISyntaxException {
        DataSourceBuilder<?> builder = DataSourceBuilder.create();
        
        if (databaseUrl != null && !databaseUrl.trim().isEmpty() && 
           (databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://"))) {
            
            URI dbUri = new URI(databaseUrl);
            
            String username = defaultUsername;
            String password = defaultPassword;
            
            if (dbUri.getUserInfo() != null) {
                String[] userInfo = dbUri.getUserInfo().split(":", 2);
                username = userInfo[0];
                if (userInfo.length > 1) {
                    password = userInfo[1];
                }
            }
            
            String dbUrl = "jdbc:postgresql://" + dbUri.getHost() + 
                           (dbUri.getPort() != -1 ? ":" + dbUri.getPort() : "") + 
                           dbUri.getPath() +
                           (dbUri.getQuery() != null ? "?" + dbUri.getQuery() : "");
            
            builder.url(dbUrl);
            builder.username(username);
            builder.password(password);
        } else {
            builder.url(springDatasourceUrl);
            builder.username(defaultUsername);
            builder.password(defaultPassword);
        }
        
        return builder.build();
    }
}
