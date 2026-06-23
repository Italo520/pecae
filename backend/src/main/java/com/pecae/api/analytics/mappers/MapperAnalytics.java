package com.pecae.api.analytics.mappers;

import com.pecae.api.analytics.dtos.response.RespostaMetricaAdminDiaria;
import com.pecae.api.analytics.dtos.response.RespostaMetricaVendedorDiaria;
import com.pecae.api.analytics.entities.MetricaAdmin;
import com.pecae.api.analytics.entities.MetricaVendedor;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface MapperAnalytics {

    @Mapping(target = "data", source = "dataReferencia")
    RespostaMetricaVendedorDiaria paraRespostaDiaria(MetricaVendedor metrica);

    @Mapping(target = "data", source = "dataReferencia")
    RespostaMetricaAdminDiaria paraRespostaDiaria(MetricaAdmin metrica);
}
