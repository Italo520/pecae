package com.pecae.api.usuario;

import com.pecae.api.compartilhado.AbstractIntegrationTest;
import com.pecae.api.usuario.entities.Usuario;
import com.pecae.api.usuario.repositories.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;

public class UsuarioRepositoryIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Test
    void deveSalvarEBuscarUsuarioComSucesso() {
        // Arrange
        Usuario usuario = new Usuario();
        usuario.setNome("Usuário de Integração");
        usuario.setEmail("integracao@teste.com");
        usuario.setProviderId("int-1234");
        usuario.setAvatarUrl("http://avatar.com/123");

        // Act
        Usuario salvo = usuarioRepository.save(usuario);
        Usuario recuperado = usuarioRepository.findById(salvo.getId()).orElse(null);

        // Assert
        assertThat(recuperado).isNotNull();
        assertThat(recuperado.getEmail()).isEqualTo("integracao@teste.com");
    }
}
