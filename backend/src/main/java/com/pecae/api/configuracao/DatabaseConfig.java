package com.pecae.api.configuracao;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;

@Configuration
public class DatabaseConfig {

    @Value("${spring.datasource.url}")
    private String defaultUrl;

    @Value("${spring.datasource.username}")
    private String defaultUsername;

    @Value("${spring.datasource.password}")
    private String defaultPassword;

    @Bean
    public DataSource dataSource() throws URISyntaxException {
        // Verifica se a URL foi passada no formato PaaS (postgres:// ou postgresql://)
        String urlToParse = defaultUrl;

        if (urlToParse != null && (urlToParse.startsWith("postgres://") || urlToParse.startsWith("postgresql://"))) {
            URI dbUri = new URI(urlToParse);
            
            String username = defaultUsername;
            String password = defaultPassword;
            
            if (dbUri.getUserInfo() != null) {
                String[] userInfo = dbUri.getUserInfo().split(":");
                username = userInfo[0];
                if (userInfo.length > 1) {
                    password = userInfo[1];
                }
            }

            String query = dbUri.getQuery();
            if (query == null) {
                query = "prepareThreshold=0";
            } else if (!query.contains("prepareThreshold")) {
                query += "&prepareThreshold=0";
            }

            String dbUrl = "jdbc:postgresql://" + dbUri.getHost() + ':' + 
                           (dbUri.getPort() != -1 ? dbUri.getPort() : 5432) + 
                           dbUri.getPath() + "?" + query;

            return DataSourceBuilder.create()
                    .url(dbUrl)
                    .username(username)
                    .password(password)
                    .build();
        }

        // Retorna o padrão configurado
        return DataSourceBuilder.create()
                .url(defaultUrl)
                .username(defaultUsername)
                .password(defaultPassword)
                .build();
    }
}
