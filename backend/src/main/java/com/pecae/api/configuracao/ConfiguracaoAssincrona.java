package com.pecae.api.configuracao;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.AsyncConfigurer;

import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

/**
 * Configuração de execução assíncrona com Virtual Threads (Java 25).
 * Virtual Threads são leves e gerenciados pela JVM, permitindo milhares
 * de tarefas concorrentes sem overhead de threads do sistema operacional.
 */
@Configuration
public class ConfiguracaoAssincrona implements AsyncConfigurer {

    @Override
    @Bean(name = "taskExecutor")
    public Executor getAsyncExecutor() {
        // Utiliza Virtual Threads do Java 25 para processamento assíncrono
        return Executors.newVirtualThreadPerTaskExecutor();
    }
}
