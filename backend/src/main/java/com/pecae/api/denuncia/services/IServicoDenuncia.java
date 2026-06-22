package com.pecae.api.denuncia.services;

import com.pecae.api.denuncia.dtos.request.CriarDenunciaRequest;
import com.pecae.api.denuncia.dtos.response.RespostaDenuncia;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface IServicoDenuncia {
    RespostaDenuncia submeterDenuncia(UUID reporterId, CriarDenunciaRequest request);
    Page<RespostaDenuncia> listarMinhasDenuncias(UUID reporterId, Pageable pageable);
}
