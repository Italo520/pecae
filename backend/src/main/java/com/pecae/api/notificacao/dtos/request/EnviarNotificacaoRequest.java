package com.pecae.api.notificacao.dtos.request;

import com.pecae.api.notificacao.entities.enums.CanalNotificacao;
import com.pecae.api.notificacao.entities.enums.TipoNotificacao;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.Set;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/**
 * DTO para solicitação de envio de uma notificação (normalmente via chamadas internas ou administrativas).
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnviarNotificacaoRequest {

    @NotNull(message = "O ID do usuário destinatário é obrigatório")
    @JdbcTypeCode(SqlTypes.VARCHAR)

    private UUID usuarioId;

    @NotBlank(message = "O título da notificação não pode estar vazio")
    private String titulo;

    @NotBlank(message = "O conteúdo da notificação não pode estar vazio")
    private String conteudo;

    @NotNull(message = "O tipo da notificação é obrigatório")
    private TipoNotificacao tipo;

    private String urlAcao;

    @NotEmpty(message = "Pelo menos um canal de notificação deve ser selecionado")
    private Set<CanalNotificacao> canais;
}
