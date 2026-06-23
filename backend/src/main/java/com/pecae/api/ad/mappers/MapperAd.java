package com.pecae.api.ad.mappers;

import com.pecae.api.ad.dtos.response.RespostaAnunciante;
import com.pecae.api.ad.dtos.response.RespostaCampanhaAd;
import com.pecae.api.ad.dtos.response.RespostaCriativoAd;
import com.pecae.api.ad.dtos.response.RespostaAdServido;
import com.pecae.api.ad.entities.Anunciante;
import com.pecae.api.ad.entities.CampanhaAd;
import com.pecae.api.ad.entities.CriativoAd;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

/**
 * Mapper MapStruct para conversões entre entidades JPA do módulo de ads e seus respectivos DTOs.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface MapperAd {

    RespostaAnunciante paraResposta(Anunciante entidade);

    RespostaCampanhaAd paraResposta(CampanhaAd entidade);

    @Mapping(source = "campanha.id", target = "campanhaId")
    RespostaCriativoAd paraResposta(CriativoAd entidade);

    @Mapping(source = "id", target = "criativoId")
    RespostaAdServido paraRespostaServido(CriativoAd criativo);

    List<RespostaAnunciante> paraListaAnunciantes(List<Anunciante> lista);

    List<RespostaCampanhaAd> paraListaCampanhas(List<CampanhaAd> lista);

    List<RespostaCriativoAd> paraListaCriativos(List<CriativoAd> lista);
}
