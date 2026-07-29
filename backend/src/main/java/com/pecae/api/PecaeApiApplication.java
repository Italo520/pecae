package com.pecae.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.net.URI;

/**
 * Ponto de entrada da aplicação PECAÊ API.
 * Habilita cache, processamento assíncrono e agendamento de tarefas.
 */
@SpringBootApplication
@EnableCaching
@EnableAsync
@EnableScheduling
public class PecaeApiApplication {

	public static void main(String[] args) {
		String dbUrl = System.getenv("DATABASE_URL");
		if (dbUrl != null && !dbUrl.trim().isEmpty() && (dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://"))) {
			try {
				URI uri = new URI(dbUrl);
				String host = uri.getHost();
				int port = uri.getPort();
				String path = uri.getPath();
				String query = uri.getQuery();

				if (query == null || query.isEmpty()) {
					query = "sslmode=require&prepareThreshold=0";
				} else {
					if (!query.contains("sslmode=")) {
						query += "&sslmode=require";
					}
					if (!query.contains("prepareThreshold=")) {
						query += "&prepareThreshold=0";
					}
				}

				String jdbcUrl = "jdbc:postgresql://" + host + (port != -1 ? ":" + port : "") + path + "?" + query;
				System.setProperty("spring.datasource.url", jdbcUrl);
				System.setProperty("SPRING_DATASOURCE_URL", jdbcUrl);

				if (uri.getUserInfo() != null) {
					String[] userInfo = uri.getUserInfo().split(":", 2);
					System.setProperty("spring.datasource.username", userInfo[0]);
					System.setProperty("SPRING_DATASOURCE_USERNAME", userInfo[0]);
					if (userInfo.length > 1) {
						System.setProperty("spring.datasource.password", userInfo[1]);
						System.setProperty("SPRING_DATASOURCE_PASSWORD", userInfo[1]);
					}
				}
			} catch (Exception e) {
				System.err.println("Erro ao converter DATABASE_URL para JDBC: " + e.getMessage());
			}
		}
		SpringApplication.run(PecaeApiApplication.class, args);
	}

}
