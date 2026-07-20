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

    @Mapping(target = "ano", source = "anoNome", qualifiedByName = "extrairAno")
    @Mapping(target = "urlFotoPrincipal", expression = "java(extrairFotoPrincipal(entidade))")
    @Mapping(source = "status", target = "status")
    RespostaVeiculo paraResposta(Veiculo entidade);

    @Mapping(source = "perfilVendedor.id", target = "perfilVendedorId")
    @Mapping(target = "ano", source = "anoNome", qualifiedByName = "extrairAno")
    @Mapping(source = "status", target = "status")
    @Mapping(source = "tipoCombustivel", target = "tipoCombustivel")
    RespostaDetalheVeiculo paraRespostaDetalhe(Veiculo entidade);

    @Mapping(source = "tipo", target = "tipo")
    RespostaFotoVeiculo paraRespostaFoto(FotoVeiculo foto);

    @Named("extrairAno")
    default Integer extrairAno(String anoNome) {
        if (anoNome == null) return null;
        try {
            String[] partes = anoNome.split(" ");
            return Integer.parseInt(partes[0]);
        } catch (Exception e) {
            return null;
        }
    }

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
