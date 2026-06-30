package com.pecae.api.usuario.controllers;

import com.pecae.api.usuario.dtos.AtualizarTipoRequest;
import com.pecae.api.usuario.dtos.UsuarioResponse;
import com.pecae.api.usuario.entities.enums.TipoUsuario;
import com.pecae.api.usuario.services.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/**
 * Controller administrativo para gerenciamento de usuários.
 */
@RestController
@RequestMapping("/admin/users")
@RequiredArgsConstructor
@Tag(name = "Admin Usuários", description = "Endpoints administrativos para gerenciamento e moderação de usuários")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUsuarioController {

    private final UsuarioService usuarioService;

    /**
     * Atualiza o papel de acesso (tipo/role) de um usuário específico.
     */
    @PostMapping("/{id}/role")
    @Operation(summary = "Atualizar a role de um usuário", description = "Endpoint restrito a administradores. Altera a role/tipo do usuário informado.")
    public ResponseEntity<AdminRespostaAtualizacaoTipo> updateRole(
            @PathVariable UUID id,
            @Valid @RequestBody AdminUpdateRoleRequest request) {
        
        usuarioService.atualizarTipoUsuario(id, request.getRole());
        UsuarioResponse userResponse = usuarioService.obterPerfilUsuario(id);

        AdminRespostaAtualizacaoTipo response = AdminRespostaAtualizacaoTipo.builder()
                .mensagem("Tipo do usuário atualizado para " + request.getRole())
                .usuario(AdminResumoUsuario.builder()
                        .id(userResponse.getId())
                        .email(userResponse.getEmail())
                        .tipo(userResponse.getTipo())
                        .build())
                .build();

        return ResponseEntity.ok(response);
    }

    @Getter
    @Builder
    public static class AdminRespostaAtualizacaoTipo {
        private String mensagem;
        private AdminResumoUsuario usuario;
    }

    @Getter
    @Builder
    public static class AdminResumoUsuario {
        

        private UUID id;
        private String email;
        private TipoUsuario tipo;
    }

    // Record para a requisição, correspondente a AtualizarTipoRequest interno
    @Getter
    @Setter
    @NoArgsConstructor
    public static class AdminUpdateRoleRequest {
        private TipoUsuario role;
    }
}
