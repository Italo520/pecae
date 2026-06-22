package com.pecae.api.anuncio.services;

import com.pecae.api.anuncio.entities.enums.StatusAnuncio;
import com.pecae.api.anuncio.services.impl.MaquinaEstadoAnuncio;
import com.pecae.api.compartilhado.excecao.ExcecaoNegocio;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DisplayName("Testes da Máquina de Estado do Anúncio")
class MaquinaEstadoAnuncioTest {

    private final MaquinaEstadoAnuncio maquinaEstado = new MaquinaEstadoAnuncio();

    @Nested
    @DisplayName("Transições Válidas")
    class TransicoesValidas {

        @Test
        @DisplayName("RASCUNHO para PENDENTE deve ser permitida")
        void rascunhoParaPendente() {
            assertThatCode(() -> maquinaEstado.validarTransicao(StatusAnuncio.RASCUNHO, StatusAnuncio.PENDENTE))
                .doesNotThrowAnyException();
        }

        @Test
        @DisplayName("PENDENTE para PUBLICADO ou REJEITADO deve ser permitida")
        void pendenteParaFinais() {
            assertThatCode(() -> maquinaEstado.validarTransicao(StatusAnuncio.PENDENTE, StatusAnuncio.PUBLICADO))
                .doesNotThrowAnyException();
            assertThatCode(() -> maquinaEstado.validarTransicao(StatusAnuncio.PENDENTE, StatusAnuncio.REJEITADO))
                .doesNotThrowAnyException();
        }

        @Test
        @DisplayName("PUBLICADO para VENDIDO, EXPIRADO ou PENDENTE deve ser permitida")
        void publicadoTransicoes() {
            assertThatCode(() -> maquinaEstado.validarTransicao(StatusAnuncio.PUBLICADO, StatusAnuncio.VENDIDO))
                .doesNotThrowAnyException();
            assertThatCode(() -> maquinaEstado.validarTransicao(StatusAnuncio.PUBLICADO, StatusAnuncio.EXPIRADO))
                .doesNotThrowAnyException();
            assertThatCode(() -> maquinaEstado.validarTransicao(StatusAnuncio.PUBLICADO, StatusAnuncio.PENDENTE))
                .doesNotThrowAnyException();
        }

        @Test
        @DisplayName("Mesmo status de origem e destino deve ser permitida (idempotência)")
        void mesmoStatus() {
            assertThatCode(() -> maquinaEstado.validarTransicao(StatusAnuncio.PUBLICADO, StatusAnuncio.PUBLICADO))
                .doesNotThrowAnyException();
        }
    }

    @Nested
    @DisplayName("Transições Inválidas")
    class TransicoesInvalidas {

        @Test
        @DisplayName("RASCUNHO para PUBLICADO deve lançar ExcecaoNegocio")
        void rascunhoParaPublicado() {
            assertThatThrownBy(() -> maquinaEstado.validarTransicao(StatusAnuncio.RASCUNHO, StatusAnuncio.PUBLICADO))
                .isInstanceOf(ExcecaoNegocio.class)
                .hasMessageContaining("Transição inválida de status");
        }

        @Test
        @DisplayName("PENDENTE para VENDIDO deve lançar ExcecaoNegocio")
        void pendenteParaVendido() {
            assertThatThrownBy(() -> maquinaEstado.validarTransicao(StatusAnuncio.PENDENTE, StatusAnuncio.VENDIDO))
                .isInstanceOf(ExcecaoNegocio.class)
                .hasMessageContaining("Transição inválida de status");
        }
    }
}
