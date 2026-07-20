package com.pecae.api.compartilhado.seguranca;

import com.pecae.api.usuario.entities.Usuario;
import com.pecae.api.usuario.repositories.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Serviço que carrega as credenciais do usuário para o Spring Security baseando-se no e-mail.
 */
@Service
@RequiredArgsConstructor
public class ServicoDetalhesUsuarioCustomizado implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado com o e-mail: " + email));

        return PrincipalUsuario.criar(usuario);
    }
}
