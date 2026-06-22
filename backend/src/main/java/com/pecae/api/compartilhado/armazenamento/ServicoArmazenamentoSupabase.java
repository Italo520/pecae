package com.pecae.api.compartilhado.armazenamento;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * Implementação do ServicoArmazenamento usando Supabase Storage.
 * Faz upload/delete via REST API do Supabase.
 */
@Service
public class ServicoArmazenamentoSupabase implements ServicoArmazenamento {

    private static final Logger log = LoggerFactory.getLogger(ServicoArmazenamentoSupabase.class);

    private final RestTemplate restTemplate;

    @Value("${storage.supabase.url:}")
    private String supabaseUrl;

    @Value("${storage.supabase.key:}")
    private String supabaseKey;

    @Value("${storage.supabase.bucket:uploads}")
    private String defaultBucket;

    public ServicoArmazenamentoSupabase() {
        this.restTemplate = new RestTemplate();
    }

    @Override
    public String upload(MultipartFile arquivo, String bucket, String caminho) {
        String targetBucket = (bucket != null && !bucket.isBlank()) ? bucket : defaultBucket;
        String url = String.format("%s/storage/v1/object/%s/%s", supabaseUrl, targetBucket, caminho);

        try {
            var headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + supabaseKey);
            headers.set("apikey", supabaseKey);
            headers.setContentType(MediaType.valueOf(
                    arquivo.getContentType() != null ? arquivo.getContentType() : "application/octet-stream"));

            var entity = new HttpEntity<>(arquivo.getBytes(), headers);
            restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

            log.info("Upload realizado: {}/{}", targetBucket, caminho);
            return getPublicUrl(targetBucket, caminho);

        } catch (IOException e) {
            log.error("Erro ao ler arquivo para upload: {}", e.getMessage());
            throw new RuntimeException("Falha ao fazer upload do arquivo.", e);
        }
    }

    @Override
    public void delete(String bucket, String caminho) {
        String targetBucket = (bucket != null && !bucket.isBlank()) ? bucket : defaultBucket;
        String url = String.format("%s/storage/v1/object/%s/%s", supabaseUrl, targetBucket, caminho);

        var headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + supabaseKey);
        headers.set("apikey", supabaseKey);

        var entity = new HttpEntity<>(headers);
        restTemplate.exchange(url, HttpMethod.DELETE, entity, Void.class);

        log.info("Arquivo removido: {}/{}", targetBucket, caminho);
    }

    @Override
    public String getPublicUrl(String bucket, String caminho) {
        String targetBucket = (bucket != null && !bucket.isBlank()) ? bucket : defaultBucket;
        return String.format("%s/storage/v1/object/public/%s/%s", supabaseUrl, targetBucket, caminho);
    }
}
