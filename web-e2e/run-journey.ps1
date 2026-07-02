$ErrorActionPreference = "Stop"

Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "🚀 Iniciando a Jornada E2E de Usabilidade da PECAÊ (Web)" -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan

# Aguarda a API Spring Boot subir completamente (Porta 3333)
Write-Host "Aguardando inicialização da API (http://localhost:3333)..." -ForegroundColor Yellow
$apiReady = $false
for ($j = 0; $j -lt 30; $j++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3333/api/v1/auth/login" -Method GET -ErrorAction Stop
        $apiReady = $true; break
    } catch {
        if ($_.Exception.Response.StatusCode -eq 405 -or $_.Exception.Response.StatusCode -eq 401) {
            $apiReady = $true; break
        }
    }
    Start-Sleep -Seconds 2
}

if (-not $apiReady) {
    Write-Host "⚠️ Aviso: API parece não estar online na porta 3333, tentando iniciar testes mesmo assim..." -ForegroundColor DarkYellow
} else {
    Write-Host "✅ API está pronta para receber conexões!" -ForegroundColor Green
}

# Definindo a ordem cronológica da jornada do usuário
$tests = @(
    "guest-access.spec.ts",
    "identity-verification.spec.ts",
    "vendedor-fluxo.spec.ts",
    "moderacao-fluxo.spec.ts",
    "core-marketplace.spec.ts",
    "combined-missing-flows.spec.ts",
    "rbac-security.spec.ts"
)

# Loop para rodar sequencialmente
for ($i = 0; $i -lt $tests.Length; $i++) {
    $testFile = $tests[$i]
    $stepNumber = $i + 1
    
    Write-Host "`n[$stepNumber/$($tests.Length)] Executando: $testFile..." -ForegroundColor Yellow
    
    # Executando o teste no modo headed com Chromium e pegando o código de saída
    $process = Start-Process -FilePath "npx.cmd" -ArgumentList "playwright test web-e2e/$testFile --config=web-e2e/playwright.config.ts --headed --project=chromium" -Wait -NoNewWindow -PassThru
    
    if ($process.ExitCode -ne 0) {
        Write-Host "`n❌ Falha detectada no arquivo: $testFile. Parando a jornada E2E." -ForegroundColor Red
        exit $process.ExitCode
    } else {
        Write-Host "✅ Sucesso no fluxo: $testFile" -ForegroundColor Green
    }
}

Write-Host "`n🎉 Todos os testes da jornada de usabilidade passaram com sucesso!" -ForegroundColor Cyan
