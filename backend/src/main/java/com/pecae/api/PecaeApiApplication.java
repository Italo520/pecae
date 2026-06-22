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
		SpringApplication.run(PecaeApiApplication.class, args);
	}

}
