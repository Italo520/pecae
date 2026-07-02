import { test, expect } from '@playwright/test';

test.describe('Autenticação Web - Fase 1', () => {
  test('Deve renderizar a página de Recuperar Senha e validar fluxo', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.locator('h1')).toContainText('Recuperar Senha');
    
    // Tenta enviar vazio
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('text=E-mail inválido')).toBeVisible();

    // Preenche correto
    await page.fill('input[type="email"]', 'teste@pecae.com.br');
    // Teste de snapshot do formulário preenchido pode ser feito
  });

  test('Deve renderizar a página de Nova Senha e validar mismatch', async ({ page }) => {
    // Simulando que o usuário chegou com um token na URL
    await page.goto('/reset-password?token=123abc456');
    await expect(page.locator('h1')).toContainText('Nova Senha');
    
    // Preenche senhas diferentes
    await page.fill('input[name="newPassword"]', '12345678');
    await page.fill('input[name="confirmPassword"]', '87654321');
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('text=As senhas não coincidem')).toBeVisible();
  });

  test('Deve renderizar a página de Acesso via Telefone', async ({ page }) => {
    await page.goto('/otp-login');
    await expect(page.locator('h1')).toContainText('Acesso via Telefone');
    
    // Tenta enviar curto
    await page.fill('input[type="tel"]', '123');
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('text=Telefone inválido')).toBeVisible();
  });

  test('Deve renderizar a página de Verificação (Verify Email)', async ({ page }) => {
    await page.goto('/verify-email');
    await expect(page.locator('h1')).toContainText('Verificação');
    
    // Tenta enviar código incompleto
    await page.fill('input[name="code"]', '123');
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('text=O código deve ter 6 dígitos')).toBeVisible();
  });
});
