package com.pecae.api.configuracao;

import com.pecae.api.compartilhado.seguranca.FiltroAutenticacaoJwt;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Configuração de segurança com Spring Security 6.x.
 * JWT Filter adicionado no pacote compartilhado.seguranca.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class ConfiguracaoSeguranca {

    private final FiltroAutenticacaoJwt filtroAutenticacaoJwt;

    // Endpoints públicos que não requerem autenticação
    private static final String[] ENDPOINTS_PUBLICOS = {
            "/auth/**",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/api-docs/**",
            "/v3/api-docs/**",
            "/actuator/health",
            "/actuator/info",
            "/ws/**",
            "/api/v1/ads/**"
    };

    // Endpoints de leitura pública (apenas GET)
    private static final String[] ENDPOINTS_LEITURA_PUBLICA = {
            "/catalog/**",
            "/search/**",
            "/sellers/*/public",
            "/listings",
            "/listings/*",
            "/vehicles/public/*",
            "/api/v1/avaliacoes/vendedor/*"
    };

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // Habilitar CORS explicitamente na cadeia do Spring Security
                .cors(org.springframework.security.config.Customizer.withDefaults())

                // Desabilitar CSRF (API stateless com JWT)
                .csrf(csrf -> csrf.disable())

                // Sessão stateless (JWT)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Regras de autorização
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(ENDPOINTS_PUBLICOS).permitAll()
                        .requestMatchers(HttpMethod.GET, ENDPOINTS_LEITURA_PUBLICA).permitAll()
                        .anyRequest().authenticated()
                )

                // Registrar o FiltroAutenticacaoJwt antes do UsernamePasswordAuthenticationFilter
                .addFilterBefore(filtroAutenticacaoJwt, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}
