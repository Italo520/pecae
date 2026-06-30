package com.pecae.api.notificacao.dtos.response;

import com.pecae.api.notificacao.entities.enums.TipoNotificacao;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/**
 * DTO de resposta contendo os detalhes de uma notificação in-app.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RespostaNotificacao {

    


    private UUID id;
    private String titulo;
    private String conteudo;
    private TipoNotificacao tipo;
    private String urlAcao;
    private boolean lida;
    private LocalDateTime criadaEm;
}
