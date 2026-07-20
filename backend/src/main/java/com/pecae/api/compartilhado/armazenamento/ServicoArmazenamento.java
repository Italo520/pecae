package com.pecae.api.compartilhado.armazenamento;

import org.springframework.web.multipart.MultipartFile;

/**
 * Interface de abstração para serviço de armazenamento de arquivos.
 * Implementações possíveis: Supabase Storage, AWS S3, local filesystem.
 * Segue o princípio DIP — consumidores dependem da interface, não da implementação.
 */
public interface ServicoArmazenamento {

    /**
     * Faz upload de um arquivo e retorna a URL pública.
     *
     * @param arquivo Arquivo a ser enviado
     * @param bucket  Nome do bucket/pasta
     * @param caminho Caminho dentro do bucket (ex: "vehicles/uuid/photo.jpg")
     * @return URL pública do arquivo
     */
    String upload(MultipartFile arquivo, String bucket, String caminho);

    /**
     * Remove um arquivo do storage.
     *
     * @param bucket  Nome do bucket
     * @param caminho Caminho do arquivo
     */
    void delete(String bucket, String caminho);

    /**
     * Gera uma URL pública (ou signed URL) para um arquivo.
     *
     * @param bucket  Nome do bucket
     * @param caminho Caminho do arquivo
     * @return URL de acesso
     */
    String getPublicUrl(String bucket, String caminho);
}
