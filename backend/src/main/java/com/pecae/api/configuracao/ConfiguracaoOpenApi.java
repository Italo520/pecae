package com.pecae.api.configuracao;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuração do SpringDoc OpenAPI 3 (Swagger UI).
 * Documentação acessível em /swagger-ui.html.
 */
@Configuration
public class ConfiguracaoOpenApi {

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth";

        return new OpenAPI()
                .info(new Info()
                        .title("PECAÊ API")
                        .version("1.0.0")
                        .description("API do marketplace PECAÊ para comércio de peças automotivas de sucatas/desmanches.")
                        .contact(new Contact()
                                .name("PECAÊ Team")
                                .email("contato@pecae.com.br"))
                        .license(new License()
                                .name("Proprietária")
                                .url("https://pecae.com.br")))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Token JWT obtido via login ou registro de usuário")));
    }
}
