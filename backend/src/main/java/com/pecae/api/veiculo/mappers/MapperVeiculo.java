package com.pecae.api.veiculo.mappers;

import com.pecae.api.veiculo.dtos.CriarVeiculoRequest;
import com.pecae.api.veiculo.dtos.AtualizarVeiculoRequest;
import com.pecae.api.veiculo.dtos.RespostaVeiculo;
import com.pecae.api.veiculo.dtos.RespostaDetalheVeiculo;
import com.pecae.api.veiculo.dtos.RespostaFotoVeiculo;
import com.pecae.api.veiculo.entities.Veiculo;
import com.pecae.api.veiculo.entities.FotoVeiculo;
import com.pecae.api.veiculo.entities.enums.TipoFoto;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface MapperVeiculo {

    @Mapping(target = "status", constant = "RASCUNHO")
    @Mapping(target = "pecasDisponiveis", source = "pecasDisponiveis")
    Veiculo paraEntidade(CriarVeiculoRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void atualizarEntidadeDoDto(AtualizarVeiculoRequest dto, @MappingTarget Veiculo entidade);

    @Mapping(source = "versao.modelo.marca.nome", target = "marcaNome")
    @Mapping(source = "versao.modelo.nome", target = "modeloNome")
    @Mapping(source = "anoFabricacao.ano", target = "ano")
    @Mapping(target = "urlFotoPrincipal", expression = "java(extrairFotoPrincipal(entidade))")
    @Mapping(source = "status", target = "status")
    RespostaVeiculo paraResposta(Veiculo entidade);

    @Mapping(source = "perfilVendedor.id", target = "perfilVendedorId")
    @Mapping(source = "versao.modelo.marca.nome", target = "marcaNome")
    @Mapping(source = "versao.modelo.nome", target = "modeloNome")
    @Mapping(source = "versao.nome", target = "versaoNome")
    @Mapping(source = "anoFabricacao.ano", target = "ano")
    @Mapping(source = "status", target = "status")
    @Mapping(source = "tipoCombustivel", target = "tipoCombustivel")
    RespostaDetalheVeiculo paraRespostaDetalhe(Veiculo entidade);

    @Mapping(source = "tipo", target = "tipo")
    RespostaFotoVeiculo paraRespostaFoto(FotoVeiculo foto);

    default String extrairFotoPrincipal(Veiculo veiculo) {
        if (veiculo.getFotos() == null || veiculo.getFotos().isEmpty()) {
            return null;
        }
        return veiculo.getFotos().stream()
                .filter(f -> f.getOrdem() != null && f.getOrdem() == 1)
                .findFirst()
                .map(FotoVeiculo::getUrlFoto)
                .orElse(veiculo.getFotos().get(0).getUrlFoto());
    }
}
