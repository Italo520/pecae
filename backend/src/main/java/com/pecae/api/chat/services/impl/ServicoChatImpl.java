package com.pecae.api.chat.services.impl;

import com.pecae.api.anuncio.entities.Anuncio;
import com.pecae.api.anuncio.repositories.RepositorioAnuncio;
import com.pecae.api.chat.dtos.*;
import com.pecae.api.chat.entities.LeituraSala;
import com.pecae.api.chat.entities.MensagemChat;
import com.pecae.api.chat.entities.SalaChat;
import com.pecae.api.chat.mappers.MapperChat;
import com.pecae.api.chat.repositories.RepositorioLeituraSala;
import com.pecae.api.chat.repositories.RepositorioMensagemChat;
import com.pecae.api.chat.repositories.RepositorioSalaChat;
import com.pecae.api.chat.services.IServicoChat;
import com.pecae.api.compartilhado.excecao.ExcecaoNegocio;
import com.pecae.api.compartilhado.excecao.ExcecaoRecursoNaoEncontrado;
import com.pecae.api.usuario.entities.Usuario;
import com.pecae.api.usuario.repositories.UsuarioRepository;
import com.pecae.api.veiculo.entities.FotoVeiculo;
import com.pecae.api.veiculo.entities.Veiculo;
import com.pecae.api.veiculo.repositories.RepositorioVeiculo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.data.redis.core.StringRedisTemplate;
import com.pecae.api.notificacao.services.IServicoNotificacao;
import com.pecae.api.notificacao.entities.enums.TipoNotificacao;
import com.pecae.api.notificacao.entities.enums.CanalNotificacao;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ServicoChatImpl implements IServicoChat {

    private final RepositorioSalaChat repositorioSalaChat;
    private final RepositorioMensagemChat repositorioMensagemChat;
    private final RepositorioLeituraSala repositorioLeituraSala;
    private final UsuarioRepository usuarioRepository;
    private final RepositorioAnuncio repositorioAnuncio;
    private final RepositorioVeiculo repositorioVeiculo;
    private final MapperChat mapperChat;
    private final StringRedisTemplate redisTemplate;
    private final IServicoNotificacao servicoNotificacao;

    @Override
    @Transactional
    public RespostaSalaChat obterOuCriarSala(UUID compradorId, RequisicaoCriarSala requisicao) {
        UUID vendedorId;
        Anuncio anuncio = null;
        Veiculo veiculo = null;

        if (requisicao.anuncioId() != null) {
            anuncio = repositorioAnuncio.findById(requisicao.anuncioId())
                    .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Anúncio", "id", requisicao.anuncioId()));
            vendedorId = anuncio.getPerfilVendedor().getUsuario().getId();

            // Retorna sala existente se houver
            Optional<SalaChat> salaExistente = repositorioSalaChat.findByCompradorIdAndAnuncioId(compradorId, requisicao.anuncioId());
            if (salaExistente.isPresent()) {
                return mapearParaRespostaSala(salaExistente.get(), compradorId);
            }
        } else if (requisicao.veiculoId() != null) {
            veiculo = repositorioVeiculo.findById(requisicao.veiculoId())
                    .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Veículo", "id", requisicao.veiculoId()));
            vendedorId = veiculo.getPerfilVendedor().getUsuario().getId();

            // Retorna sala existente se houver
            Optional<SalaChat> salaExistente = repositorioSalaChat.findByCompradorIdAndVeiculoId(compradorId, requisicao.veiculoId());
            if (salaExistente.isPresent()) {
                return mapearParaRespostaSala(salaExistente.get(), compradorId);
            }
        } else {
            throw new ExcecaoNegocio("É necessário informar anuncioId ou veiculoId.");
        }

        if (compradorId.equals(vendedorId)) {
            throw new ExcecaoNegocio("Vendedores não podem iniciar chat no próprio anúncio/veículo.");
        }

        Usuario comprador = usuarioRepository.findById(compradorId)
                .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Usuário", "id", compradorId));
        Usuario vendedor = usuarioRepository.findById(vendedorId)
                .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Usuário", "id", vendedorId));

        SalaChat novaSala = SalaChat.builder()
                .comprador(comprador)
                .vendedor(vendedor)
                .anuncio(anuncio)
                .veiculo(veiculo)
                .ativa(true)
                .arquivada(false)
                .build();

        novaSala = repositorioSalaChat.save(novaSala);
        log.info("Nova sala de chat criada: {} entre comprador {} e vendedor {}", novaSala.getId(), compradorId, vendedorId);

        return mapearParaRespostaSala(novaSala, compradorId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RespostaSalaChat> listarMinhasSalas(UUID usuarioId) {
        List<SalaChat> salas = repositorioSalaChat.buscarSalasAtivasDoUsuario(usuarioId);
        return salas.stream()
                .map(sala -> mapearParaRespostaSala(sala, usuarioId))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public RespostaSalaChat buscarSalaPorId(UUID salaId, UUID usuarioId) {
        SalaChat sala = repositorioSalaChat.findById(salaId)
                .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Sala de chat", "id", salaId));

        validarParticipante(sala, usuarioId);

        return mapearParaRespostaSala(sala, usuarioId);
    }

    @Override
    @Transactional(readOnly = true)
    public RespostaCursorMensagens buscarMensagens(UUID salaId, UUID usuarioId, String cursor) {
        SalaChat sala = repositorioSalaChat.findById(salaId)
                .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Sala de chat", "id", salaId));

        validarParticipante(sala, usuarioId);

        LocalDateTime cursorCriadoEm = null;
        UUID cursorId = null;

        if (StringUtils.hasText(cursor)) {
            try {
                String decoded = new String(Base64.getDecoder().decode(cursor), StandardCharsets.UTF_8);
                String[] parts = decoded.split("\\|");
                if (parts.length == 2) {
                    cursorCriadoEm = LocalDateTime.parse(parts[0]);
                    cursorId = UUID.fromString(parts[1]);
                }
            } catch (Exception e) {
                log.warn("Cursor de paginação de chat inválido fornecido: {}", cursor);
            }
        }

        int limite = 20;
        Pageable pageable = PageRequest.of(0, limite + 1);
        List<MensagemChat> mensagens = repositorioMensagemChat.buscarMensagensPorCursor(salaId, cursorCriadoEm, cursorId, pageable);

        String proximoCursor = null;
        if (mensagens.size() > limite) {
            MensagemChat ultimoItem = mensagens.get(limite - 1);
            mensagens = mensagens.subList(0, limite);
            String rawCursor = ultimoItem.getCriadaEm().toString() + "|" + ultimoItem.getId().toString();
            proximoCursor = Base64.getEncoder().encodeToString(rawCursor.getBytes(StandardCharsets.UTF_8));
        }

        List<RespostaMensagemChat> dtos = mensagens.stream()
                .map(mapperChat::paraRespostaMensagem)
                .toList();

        return new RespostaCursorMensagens(dtos, proximoCursor);
    }

    @Override
    @Transactional
    public RespostaMensagemChat enviarMensagem(UUID salaId, UUID remetenteId, String conteudo) {
        SalaChat sala = repositorioSalaChat.findById(salaId)
                .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Sala de chat", "id", salaId));

        validarParticipante(sala, remetenteId);

        Usuario remetente = usuarioRepository.findById(remetenteId)
                .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Usuário", "id", remetenteId));

        MensagemChat mensagem = MensagemChat.builder()
                .sala(sala)
                .remetente(remetente)
                .conteudo(conteudo)
                .deletada(false)
                .build();

        mensagem = repositorioMensagemChat.save(mensagem);
        repositorioSalaChat.atualizarTimestamp(salaId, LocalDateTime.now());

        log.debug("Mensagem persistida na sala {}: {}", salaId, mensagem.getId());

        // Identificar o destinatário
        UUID destinatarioId = sala.getComprador().getId().equals(remetenteId)
                ? sala.getVendedor().getId()
                : sala.getComprador().getId();

        // Verificar presença do destinatário na sala de chat (chat:active:{salaId}:{destinatarioId})
        String presencaKey = "chat:active:" + salaId.toString() + ":" + destinatarioId.toString();
        Boolean ativoNaSala = redisTemplate.hasKey(presencaKey);

        if (Boolean.FALSE.equals(ativoNaSala)) {
            // Destinatário ausente -> despacha notificação in-app
            String titulo = "Nova mensagem de " + remetente.getNome();
            String linkAcao = "/chat/" + salaId.toString(); // URL/Action link
            
            servicoNotificacao.despacharNotificacao(
                destinatarioId,
                titulo,
                conteudo,
                TipoNotificacao.MENSAGEM_CHAT,
                linkAcao,
                Set.of(CanalNotificacao.APP, CanalNotificacao.PUSH)
            );
            log.info("Notificação in-app enviada para o usuário {} (ausente da sala {})", destinatarioId, salaId);
        }

        return mapperChat.paraRespostaMensagem(mensagem);
    }

    @Override
    @Transactional
    public void marcarComoLido(UUID salaId, UUID usuarioId) {
        SalaChat sala = repositorioSalaChat.findById(salaId)
                .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Sala de chat", "id", salaId));

        validarParticipante(sala, usuarioId);

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Usuário", "id", usuarioId));

        LeituraSala leitura = repositorioLeituraSala.findBySalaIdAndUsuarioId(salaId, usuarioId)
                .orElseGet(() -> LeituraSala.builder()
                        .sala(sala)
                        .usuario(usuario)
                        .build());

        leitura.setLeuEm(LocalDateTime.now());
        repositorioLeituraSala.save(leitura);
    }

    // ── Métodos Auxiliares Privados ──────────────────────────────────────────

    private void validarParticipante(SalaChat sala, UUID usuarioId) {
        if (!sala.getComprador().getId().equals(usuarioId) && !sala.getVendedor().getId().equals(usuarioId)) {
            throw new AccessDeniedException("Você não tem permissão para acessar esta conversa.");
        }
    }

    private RespostaSalaChat mapearParaRespostaSala(SalaChat sala, UUID usuarioLogadoId) {
        Usuario interlocutor = sala.getComprador().getId().equals(usuarioLogadoId) ? sala.getVendedor() : sala.getComprador();
        RespostaInterlocutor interlocutorDto = new RespostaInterlocutor(interlocutor.getId(), interlocutor.getNome(), interlocutor.getAvatar());

        Optional<MensagemChat> ultimaMsgOpt = repositorioMensagemChat.findFirstBySalaIdAndDeletadaFalseOrderByCriadaEmDescIdDesc(sala.getId());
        RespostaUltimaMensagem ultimaMensagemDto = ultimaMsgOpt.map(m -> new RespostaUltimaMensagem(
                m.getConteudo(), m.getRemetente().getId(), m.getCriadaEm()
        )).orElse(null);

        LocalDateTime leuEm = repositorioLeituraSala.findBySalaIdAndUsuarioId(sala.getId(), usuarioLogadoId)
                .map(LeituraSala::getLeuEm)
                .orElse(LocalDateTime.of(1970, 1, 1, 0, 0));

        long naoLidos = repositorioSalaChat.contarNaoLidos(sala.getId(), usuarioLogadoId, leuEm);

        UUID anuncioId = sala.getAnuncio() != null ? sala.getAnuncio().getId() : null;
        UUID veiculoId = sala.getVeiculo() != null ? sala.getVeiculo().getId() : null;

        return new RespostaSalaChat(
                sala.getId(),
                anuncioId,
                veiculoId,
                obterTituloDaConversa(sala),
                obterMiniaturaConversa(sala),
                sala.getVendedor().getId(),
                interlocutorDto,
                ultimaMensagemDto,
                naoLidos,
                sala.getAtualizadaEm()
        );
    }

    private String obterTituloDaConversa(SalaChat sala) {
        if (sala.getAnuncio() != null) {
            return sala.getAnuncio().getTitulo();
        }
        if (sala.getVeiculo() != null && sala.getVeiculo().getVersao() != null) {
            var v = sala.getVeiculo().getVersao();
            return v.getModelo().getMarca().getNome() + " " + v.getModelo().getNome() + " " + v.getNome();
        }
        return "Conversa";
    }

    private String obterMiniaturaConversa(SalaChat sala) {
        if (sala.getAnuncio() != null && sala.getAnuncio().getVeiculo() != null) {
            return sala.getAnuncio().getVeiculo().getFotos().stream()
                    .findFirst()
                    .map(FotoVeiculo::getUrlFoto)
                    .orElse(null);
        }
        if (sala.getVeiculo() != null) {
            return sala.getVeiculo().getFotos().stream()
                    .findFirst()
                    .map(FotoVeiculo::getUrlFoto)
                    .orElse(null);
        }
        return null;
    }
}
