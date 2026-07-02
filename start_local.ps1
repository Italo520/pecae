Write-Host "Iniciando o projeto PECAÊ localmente usando Docker no WSL..." -ForegroundColor Cyan

if (Test-Path .env) {
    Write-Host "Carregando configurações do .env..." -ForegroundColor Yellow
} else {
    Write-Host "Arquivo .env não encontrado. Garantindo que o Supabase e as outras variáveis estejam corretas." -ForegroundColor Yellow
}

# 1. Garantir que o daemon do Docker esteja rodando no WSL
Write-Host "Verificando o daemon do Docker no WSL..." -ForegroundColor Yellow
$dockerStatus = wsl -u root service docker status 2>&1
if ($dockerStatus -like "*is not running*") {
    Write-Host "Docker está parado no WSL. Iniciando o serviço..." -ForegroundColor Yellow
    wsl -u root service docker start
    Start-Sleep -Seconds 3
} else {
    Write-Host "Docker Daemon já está rodando no WSL." -ForegroundColor Green
}

# 2. Garantir que a rede externa 'coolify' existe no WSL
Write-Host "Verificando rede externa 'coolify'..." -ForegroundColor Yellow
$networks = wsl docker network ls 2>&1
if ($networks -notlike "*coolify*") {
    Write-Host "Rede 'coolify' não encontrada no Docker. Criando..." -ForegroundColor Yellow
    wsl docker network create coolify
} else {
    Write-Host "Rede 'coolify' já configurada." -ForegroundColor Green
}

# 3. Subir os serviços no WSL
Write-Host "Subindo os serviços via Docker Compose no WSL (PostgreSQL, Redis, API e Web)..." -ForegroundColor Green
wsl docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d

Write-Host ""
Write-Host "Serviços iniciados com sucesso!" -ForegroundColor Green
Write-Host "---------------------------------------------------"
Write-Host "Web Frontend : http://localhost:3001"
Write-Host "API Backend  : http://localhost:3333"
Write-Host "PostgreSQL   : localhost:5432"
Write-Host "Redis        : localhost:6379"
Write-Host "---------------------------------------------------"
Write-Host "Para visualizar os logs em tempo real, execute:"
Write-Host "wsl docker compose logs -f" -ForegroundColor Cyan
Write-Host "Para parar o projeto, execute:"
Write-Host "wsl docker compose down" -ForegroundColor Cyan
