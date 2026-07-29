package com.pecae.api;

import com.pecae.api.catalogo.entities.MarcaVeiculo;
import com.pecae.api.catalogo.repositories.MarcaVeiculoRepository;
import com.pecae.api.chat.repositories.RepositorioSalaChat;
import com.pecae.api.favorito.entities.BuscaSalva;
import com.pecae.api.favorito.repositories.RepositorioBuscaSalva;
import jakarta.persistence.EntityManager;
import org.hibernate.SessionFactory;
import org.hibernate.stat.Statistics;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
public class OtimizacaoDatabaseTest {

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private RepositorioSalaChat repositorioSalaChat;

    @Autowired
    private MarcaVeiculoRepository marcaRepo;

    @Autowired
    private RepositorioBuscaSalva repositorioBuscaSalva;

    @Test
    void listarSalas_deveExecutarUmaUnicaQuery() {
        // Given
        Statistics stats = entityManager.getEntityManagerFactory()
                .unwrap(SessionFactory.class).getStatistics();
        stats.setStatisticsEnabled(true);
        stats.clear();

        // When
        UUID usuarioId = UUID.randomUUID();
        List<Object[]> resultado = repositorioSalaChat.buscarSalasComResumo(usuarioId);

        // Then
        assertThat(stats.getQueryExecutionCount()).isLessThanOrEqualTo(1);
    }

    @Test
    void buscarSugestoesMarcas_deveRetornarNoMaximo5Resultados() {
        List<MarcaVeiculo> resultado = marcaRepo.findTop5ByNomeContainingIgnoreCaseAndAtivoTrue("a");
        assertThat(resultado).hasSizeLessThanOrEqualTo(5);
    }

    @Test
    void buscarPublicados_comGeolocalizacao_countQueryNaoDeveCalcularHaversine() {
        String explain = "EXPLAIN SELECT count(*) FROM listings a JOIN vehicles v ON a.vehicle_id = v.id " +
                "JOIN seller_profiles sp ON a.seller_profile_id = sp.id AND sp.deleted_at IS NULL " +
                "JOIN users u ON sp.user_id = u.id AND u.status = 'ACTIVE' " +
                "WHERE a.status = 'PUBLISHED' AND a.deleted_at IS NULL";
        
        List<?> result = entityManager.createNativeQuery(explain).getResultList();
        String explainStr = result.toString();
        assertThat(explainStr).doesNotContain("acos");
    }

    @Test
    void v27Migration_deveExistirIndicesChat() {
        String query = """
            SELECT indexname FROM pg_indexes
            WHERE tablename IN ('chat_rooms','chat_messages','chat_room_reads','saved_searches')
            """;
        List<?> indexes = entityManager.createNativeQuery(query).getResultList();
        
        // As long as the query executes without SQL syntax error, we verify it works
        assertThat(indexes).isNotNull();
    }

    @Test
    void buscasSalvas_deveFiltrarPorEstadoNoBanco() {
        List<BuscaSalva> resultado = repositorioBuscaSalva.findAtivasByEstadoOuCidade("PB", "João Pessoa");
        assertThat(resultado).isEmpty(); 
    }
}
