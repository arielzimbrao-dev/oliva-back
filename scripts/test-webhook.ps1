#!/usr/bin/env pwsh
# Script para testar webhook localmente usando Stripe CLI

Write-Host "=== Teste de Webhook Stripe ===" -ForegroundColor Cyan
Write-Host ""

# Verificar se Stripe CLI está instalado
$stripeExists = Get-Command stripe -ErrorAction SilentlyContinue
if (-not $stripeExists) {
    Write-Host "❌ Stripe CLI não encontrado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Instale com:" -ForegroundColor Yellow
    Write-Host "  scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git"
    Write-Host "  scoop install stripe"
    Write-Host ""
    Write-Host "Ou baixe de: https://github.com/stripe/stripe-cli/releases/latest"
    exit 1
}

Write-Host "✓ Stripe CLI encontrado" -ForegroundColor Green
Write-Host ""

# Verificar se já está logado
$loginStatus = stripe config --list 2>&1
if ($loginStatus -match "device_name") {
    Write-Host "✓ Stripe CLI já autenticado" -ForegroundColor Green
} else {
    Write-Host "Fazendo login no Stripe..." -ForegroundColor Yellow
    stripe login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Falha no login" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Iniciando listener de webhooks..." -ForegroundColor Cyan
Write-Host "A aplicação deve estar rodando em http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔑 IMPORTANTE: Copie o webhook signing secret exibido abaixo" -ForegroundColor Magenta
Write-Host "   e adicione ao .env como: STRIPE_WEBHOOK_SECRET=whsec_..." -ForegroundColor Magenta
Write-Host ""

# Iniciar listener
stripe listen --forward-to localhost:3000/payment
