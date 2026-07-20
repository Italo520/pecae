package com.pecae.api.favorito.mappers;

import com.pecae.api.anuncio.mappers.MapperAnuncio;
import com.pecae.api.favorito.dtos.response.RespostaBuscaSalva;
import com.pecae.api.favorito.dtos.response.RespostaFavorito;
import com.pecae.api.favorito.entities.BuscaSalva;
import com.pecae.api.favorito.entities.Favorito;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE, uses = {MapperAnuncio.class})
public interface MapperFavoritoBusca {

    RespostaFavorito paraResposta(Favorito favorito);

    RespostaBuscaSalva paraResposta(BuscaSalva buscaSalva);
}
