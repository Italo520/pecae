package com.pecae.api.anuncio.mappers;

import com.pecae.api.anuncio.dtos.RespostaAnuncio;
import com.pecae.api.anuncio.dtos.RespostaDetalheAnuncio;
import com.pecae.api.anuncio.entities.Anuncio;
import com.pecae.api.veiculo.dtos.RespostaFotoVeiculo;
import com.pecae.api.veiculo.entities.FotoVeiculo;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface MapperAnuncio {

    // Listagem pública resumida
    @Mapping(source = "veiculo.versao.modelo.marca.nome", target = "marcaNome")
    @Mapping(source = "veiculo.versao.modelo.nome", target = "modeloNome")
    @Mapping(source = "veiculo.versao.nome", target = "versaoNome")
    @Mapping(source = "veiculo.anoFabricacao.ano", target = "anoFabricacao")
    @Mapping(source = "veiculo.cor", target = "cor")
    @Mapping(source = "veiculo.cidade", target = "cidade")
    @Mapping(source = "veiculo.estado", target = "estado")
    @Mapping(source = "perfilVendedor.id", target = "perfilVendedorId")
    @Mapping(source = "perfilVendedor.nome", target = "nomeVendedor")
    @Mapping(target = "vendedorVerificado", expression = "java(isVendedorVerificado(anuncio))")
    @Mapping(target = "urlFotoPrincipal", expression = "java(extrairFotoPrincipal(anuncio))")
    @Mapping(source = "status", target = "status")
    RespostaAnuncio paraResposta(Anuncio anuncio);

    // Detalhe completo
    @Mapping(source = "veiculo.id", target = "veiculoId")
    @Mapping(source = "veiculo.versao.modelo.marca.nome", target = "marcaNome")
    @Mapping(source = "veiculo.versao.modelo.nome", target = "modeloNome")
    @Mapping(source = "veiculo.versao.nome", target = "versaoNome")
    @Mapping(source = "veiculo.anoFabricacao.ano", target = "anoFabricacao")
    @Mapping(source = "veiculo.cor", target = "cor")
    @Mapping(source = "veiculo.observacoes", target = "observacoes")
    @Mapping(source = "veiculo.quilometragem", target = "quilometragem")
    @Mapping(source = "veiculo.fotos", target = "fotos")
    @Mapping(source = "veiculo.pecasDisponiveis", target = "pecasDisponiveis")
    @Mapping(source = "veiculo.cidade", target = "cidade")
    @Mapping(source = "veiculo.estado", target = "estado")
    @Mapping(source = "veiculo.latitude", target = "latitude")
    @Mapping(source = "veiculo.longitude", target = "longitude")
    @Mapping(source = "perfilVendedor.id", target = "perfilVendedorId")
    @Mapping(source = "perfilVendedor.nome", target = "nomeVendedor")
    @Mapping(source = "perfilVendedor.telefone", target = "telefoneVendedor")
    @Mapping(source = "perfilVendedor.urlLogo", target = "urlLogoVendedor")
    @Mapping(target = "vendedorVerificado", expression = "java(isVendedorVerificado(anuncio))")
    @Mapping(source = "perfilVendedor.estatisticas.mediaAvaliacao", target = "ratingVendedor")
    @Mapping(source = "perfilVendedor.estatisticas.totalAvaliacoes", target = "totalAvaliacoesVendedor")
    @Mapping(source = "status", target = "status")
    RespostaDetalheAnuncio paraRespostaDetalhe(Anuncio anuncio);

    // Mapeamento individual de fotos de veículo
    @Mapping(source = "tipo", target = "tipo")
    RespostaFotoVeiculo paraRespostaFoto(FotoVeiculo foto);

    // Método auxiliar para extrair a foto principal do veículo
    default String extrairFotoPrincipal(Anuncio anuncio) {
        if (anuncio.getVeiculo() == null || anuncio.getVeiculo().getFotos() == null || anuncio.getVeiculo().getFotos().isEmpty()) {
            return null;
        }
        return anuncio.getVeiculo().getFotos().stream()
            .filter(f -> f.getOrdem() != null && f.getOrdem() == 1)
            .findFirst()
            .map(FotoVeiculo::getUrlFoto)
            .orElse(anuncio.getVeiculo().getFotos().get(0).getUrlFoto());
    }

    default Boolean isVendedorVerificado(Anuncio anuncio) {
        if (anuncio.getPerfilVendedor() == null || anuncio.getPerfilVendedor().getVerificacao() == null) {
            return false;
        }
        return anuncio.getPerfilVendedor().getVerificacao().getStatus() == com.pecae.api.vendedor.entities.enums.StatusVerificacao.APROVADO;
    }
}
