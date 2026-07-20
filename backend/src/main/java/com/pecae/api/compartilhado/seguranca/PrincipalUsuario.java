package com.pecae.api.compartilhado.seguranca;

import com.pecae.api.usuario.entities.Usuario;
import com.pecae.api.usuario.entities.enums.StatusUsuario;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.UUID;

/**
 * Representa os detalhes do usuário autenticado no contexto do Spring Security.
 */
@Getter
@Builder
@AllArgsConstructor
public class PrincipalUsuario implements UserDetails {

    private final UUID id;
    private final String email;
    private final String senha;
    private final Collection<? extends GrantedAuthority> autoridades;
    private final boolean ativo;

    /**
     * Cria um PrincipalUsuario a partir da entidade Usuario.
     *
     * @param usuario Entidade de usuário.
     * @return PrincipalUsuario.
     */
    public static PrincipalUsuario criar(Usuario usuario) {
        String nomePerfil = "ROLE_" + usuario.getTipo().name();
        Collection<GrantedAuthority> autoridades = Collections.singletonList(
                new SimpleGrantedAuthority(nomePerfil)
        );

        return PrincipalUsuario.builder()
                .id(usuario.getId())
                .email(usuario.getEmail())
                .senha(usuario.getSenhaHash())
                .autoridades(autoridades)
                .ativo(usuario.getStatus() == StatusUsuario.ATIVO)
                .build();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return autoridades;
    }

    @Override
    public String getPassword() {
        return senha;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return ativo; // Bloqueia login se o status não for ATIVO
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return ativo;
    }
}
