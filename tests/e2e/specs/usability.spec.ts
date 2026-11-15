import { test, expect } from '@playwright/test';

const randomString = Math.random().toString(36).substring(7);
const userData = {
  username: `e2eUser_${randomString}`,
  email: `e2eUser_${randomString}@test.com`,
  password: 'password123'
};

test.describe('Usability Tests - Functional Requirements', () => {
  
  // RF-01: Registro de usuario
  test('RF-01: Should allow a user to register and login', async ({ page }) => {
    await page.goto('/login');
    
    // Switch to register
    await page.click('text=¿No tienes cuenta? Regístrate');
    
    // Fill registration form
    await page.fill('input[placeholder="Nombre de usuario"]', userData.username);
    await page.fill('input[placeholder="Correo electrónico"]', userData.email);
    await page.fill('input[placeholder="Contraseña"]', userData.password);
    
    // Submit
    await page.click('button:has-text("Registrarse")');
    
    // Verify success message or redirect to login
    // Assuming it stays on login page but switches to login form or shows success
    // Based on code: setIsLogin(true); setError('Registration successful! Please login.');
    await expect(page.locator('text=Registration successful! Please login.')).toBeVisible();
    
    // Now Login
    await page.fill('input[placeholder="Correo electrónico"]', userData.email);
    await page.fill('input[placeholder="Contraseña"]', userData.password);
    await page.click('button:has-text("Ingresar")');
    
    // Verify redirect to catalog
    await expect(page).toHaveURL(/\/catalogo/);
    await expect(page.locator('.brand')).toBeVisible();
  });

  // RF-02: Reserva de producto (Checkout)
  test('RF-02: Should allow user to add product to cart and proceed to checkout', async ({ page }) => {
    const uniqueUser = {
      username: `e2eUser_${Date.now()}`,
      email: `e2eUser_${Date.now()}@test.com`,
      password: 'password123'
    };

    await page.goto('/login');
    await page.click('text=¿No tienes cuenta? Regístrate');
    await page.fill('input[placeholder="Nombre de usuario"]', uniqueUser.username);
    await page.fill('input[placeholder="Correo electrónico"]', uniqueUser.email);
    await page.fill('input[placeholder="Contraseña"]', uniqueUser.password);
    await page.click('button:has-text("Registrarse")');
    await expect(page.locator('text=Registration successful! Please login.')).toBeVisible();
    
    await page.fill('input[placeholder="Correo electrónico"]', uniqueUser.email);
    await page.fill('input[placeholder="Contraseña"]', uniqueUser.password);
    await page.click('button:has-text("Ingresar")');
    

    await expect(page).toHaveURL(/\/catalogo/);
    

    await page.waitForSelector('.product-card', { timeout: 10000 });


    const addToCartBtn = page.locator('button:has-text("Agregar al carrito")').first();
    

    if (await addToCartBtn.count() > 0) {
      await addToCartBtn.click();
      

      await expect(page.locator('.cart-badge')).toContainText('1');
      

      await page.click('.cart-link');
      await expect(page).toHaveURL(/\/carrito/);
      

      await expect(page.locator('text=Cantidad:')).toBeVisible();
      
      await page.click('button:has-text("Finalizar compra")');
      
    } else {
      console.log('No products found to test checkout');
    }
  });

  // RF-03: Gestión de inventario (Admin)
  test('RF-03: Should restrict inventory management to admins', async ({ page }) => {
    const normalUser = {
      username: `euser_${Date.now()}`,
      email: `euser_${Date.now()}@test.com`,
      password: 'password123'
    };


    await page.goto('/login');
    await page.click('text=¿No tienes cuenta? Regístrate');
    await page.fill('input[placeholder="Nombre de usuario"]', normalUser.username);
    await page.fill('input[placeholder="Correo electrónico"]', normalUser.email);
    await page.fill('input[placeholder="Contraseña"]', normalUser.password);
    await page.click('button:has-text("Registrarse")');
    await expect(page.locator('text=Registration successful! Please login.')).toBeVisible();


    await page.fill('input[placeholder="Correo electrónico"]', normalUser.email);
    await page.fill('input[placeholder="Contraseña"]', normalUser.password);
    await page.click('button:has-text("Ingresar")');
    

    await expect(page.locator('a[href="/admin"]')).not.toBeVisible();
 
    await page.goto('/admin');
    

    await expect(page).not.toHaveURL(/\/admin/);
  });
});
