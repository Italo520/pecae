# Debug Cache Plan - Atualizações não Aplicadas

## Visão Geral
Investigação de cache impedindo que as alterações visuais (Chat, Detalhes, Busca) apareçam no navegador mesmo após o `docker compose build`.

## Causa Raiz Provável
Os containers não foram reiniciados com as novas imagens geradas pelo build. O comando `docker compose build` apenas atualiza a imagem no disco, mas não substitui os containers em execução.

## Plano de Ação

### Fase 1: Atualização dos Containers
- [ ] Rodar `docker compose up -d --force-recreate` para forçar o Docker a usar as novas imagens.

### Fase 2: Limpeza de Cache (Se necessário)
Se o passo acima não resolver:
- [ ] Limpar o cache do Redis: `docker exec -it pecae-redis redis-cli FLUSHALL`.
- [ ] Limpar cache do Expo/Metro: Reconstruir as imagens com `--no-cache` (`docker compose build --no-cache`).

## Critérios de Sucesso
- [ ] Containers rodando com as imagens atualizadas.
- [ ] Funcionalidades do Chat, Detalhes e Busca visíveis no navegador.
