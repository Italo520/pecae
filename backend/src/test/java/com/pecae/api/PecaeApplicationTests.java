package com.pecae.api;

import com.pecae.api.compartilhado.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

public class PecaeApplicationTests extends AbstractIntegrationTest {

    @Test
    void contextLoads() {
        // Se este teste passar, significa que o contexto do Spring (com os containers) subiu corretamente.
        assertThat(true).isTrue();
    }
}
