package com.pecae.api;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Disabled;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@Disabled("Desabilitado pois requer que o banco de dados PostgreSQL esteja ativo localmente.")
class PecaeApiApplicationTests {

	@Test
	void contextLoads() {
	}

}
