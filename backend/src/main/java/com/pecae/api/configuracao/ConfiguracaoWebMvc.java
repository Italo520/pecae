package com.pecae.api.configuracao;

import com.pecae.api.compartilhado.seguranca.ResolvedorArgumentoUsuarioAtual;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

/**
 * Configurações Web MVC do Spring, incluindo o registro de Argument Resolvers customizados.
 */
@Configuration
@RequiredArgsConstructor
public class ConfiguracaoWebMvc implements WebMvcConfigurer {

    private final ResolvedorArgumentoUsuarioAtual resolvedorArgumentoUsuarioAtual;

    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
        resolvers.add(resolvedorArgumentoUsuarioAtual);
    }
}
