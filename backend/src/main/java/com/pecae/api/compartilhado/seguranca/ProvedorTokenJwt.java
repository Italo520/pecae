package com.pecae.api.compartilhado.seguranca;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * Provedor de utilitários para geração, validação e extração de informações de tokens JWT.
 */
@Component
@Slf4j
public class ProvedorTokenJwt {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpirationMs;

    private SecretKey signingKey;

    @PostConstruct
    public void init() {
        try {
            byte[] keyBytes;
            // Garante que a chave possua pelo menos 256 bits (32 bytes) para o algoritmo HS256
            if (jwtSecret.getBytes(StandardCharsets.UTF_8).length < 32) {
                log.warn("O segredo JWT configurado é menor que 32 bytes. Aplicando hash SHA-256 para segurança.");
                MessageDigest digest = MessageDigest.getInstance("SHA-256");
                keyBytes = digest.digest(jwtSecret.getBytes(StandardCharsets.UTF_8));
            } else {
                keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
            }
            this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        } catch (NoSuchAlgorithmException e) {
            log.error("Erro ao inicializar chaves JWT", e);
            throw new IllegalStateException("Falha ao inicializar o algoritmo SHA-256 para chaves JWT", e);
        }
    }

    /**
     * Gera um token de acesso para o usuário autenticado.
     *
     * @param principalUsuario Usuário autenticado.
     * @return String JWT.
     */
    public String gerarToken(PrincipalUsuario principalUsuario) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("id", principalUsuario.getId().toString());
        claims.put("role", principalUsuario.getAuthorities().stream()
                .map(auth -> auth.getAuthority().replace("ROLE_", ""))
                .findFirst()
                .orElse("BUYER"));

        return gerarToken(principalUsuario.getUsername(), claims);
    }

    /**
     * Gera um token de acesso baseado apenas no e-mail (usado para fins de teste ou recuperação).
     *
     * @param email E-mail do usuário.
     * @return String JWT.
     */
    public String gerarTokenAPartirDoEmail(String email) {
        return gerarToken(email, new HashMap<>());
    }

    private String gerarToken(String subject, Map<String, Object> claims) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .subject(subject)
                .claims(claims)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(signingKey)
                .compact();
    }

    /**
     * Extrai o e-mail (subject) de um token JWT.
     *
     * @param token Token JWT.
     * @return E-mail do usuário.
     */
    public String obterEmailDoToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.getSubject();
    }

    /**
     * Valida a integridade e expiração de um token JWT.
     *
     * @param token Token JWT.
     * @return True se for válido, false caso contrário.
     */
    public boolean validarToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(signingKey)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (MalformedJwtException ex) {
            log.error("Token JWT inválido");
        } catch (ExpiredJwtException ex) {
            log.error("Token JWT expirado");
        } catch (UnsupportedJwtException ex) {
            log.error("Token JWT não suportado");
        } catch (IllegalArgumentException ex) {
            log.error("String de claims do JWT vazia");
        } catch (JwtException ex) {
            log.error("Erro na assinatura ou decodificação do JWT");
        }
        return false;
    }
}
