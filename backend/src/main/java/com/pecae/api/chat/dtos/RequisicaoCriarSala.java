package com.pecae.api.chat.dtos;

import jakarta.validation.constraints.AssertTrue;
import java.util.UUID;

public record RequisicaoCriarSala(
    UUID anuncioId,
    UUID veiculoId
) {
    @AssertTrue(message = "Informe exatamente um entre anuncioId e veiculoId.")
    public boolean isContextoValido() {
        return (anuncioId != null) ^ (veiculoId != null);
    }
}
