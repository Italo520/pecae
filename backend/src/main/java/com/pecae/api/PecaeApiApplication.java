package com.pecae.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

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
		if (dbUrl != null && !dbUrl.isEmpty()) {
			String jdbcUrl = dbUrl;
			if (jdbcUrl.startsWith("postgresql://")) {
				jdbcUrl = "jdbc:" + jdbcUrl;
			}
			if (!jdbcUrl.contains("sslmode=")) {
				jdbcUrl += (jdbcUrl.contains("?") ? "&" : "?") + "sslmode=require";
			}
			System.setProperty("spring.datasource.url", jdbcUrl);
			System.setProperty("SPRING_DATASOURCE_URL", jdbcUrl);
		}
		SpringApplication.run(PecaeApiApplication.class, args);
	}

}
