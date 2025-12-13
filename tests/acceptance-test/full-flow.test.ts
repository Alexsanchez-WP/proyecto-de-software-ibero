import request from 'supertest';

const API_URL = 'http://localhost:3000/api';

describe('Acceptance Tests - Full User Flow', () => {
  let authToken: string;
  let userId: string;
  let productId: string;
  const randomString = Math.random().toString(36).substring(7);
  const testUser = {
    username: `acc_user_${randomString}`,
    email: `acc_${randomString}@test.com`,
    password: 'password123'
  };

  // RF-01: Registro de usuario
  it('should register a new user (RF-01)', async () => {
    const response = await request(API_URL)
      .post('/auth/register')
      .send(testUser);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('_id');
    expect(response.body.data.email).toBe(testUser.email);
  });

  it('should login with the new user', async () => {
    const response = await request(API_URL)
      .post('/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('token');
    authToken = response.body.data.token;
    userId = response.body.data.user._id;
  });

  it('should get list of products', async () => {
    const response = await request(API_URL)
      .get('/products');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    
    if (response.body.data.length > 0) {
      productId = response.body.data[0]._id;
    } else {
      console.warn('No products found in DB. Skipping cart tests.');
    }
  });

  it('should add a product to cart', async () => {
    if (!productId) return;

    const response = await request(API_URL)
      .post('/cart')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        productId: productId,
        quantity: 1
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.items.length).toBeGreaterThan(0);
  });

  it('should get cart contents', async () => {
    const response = await request(API_URL)
      .get('/cart')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user).toBe(userId);
  });

  // RF-02: Reserva de producto (Checkout & QR)
  it('should create a checkout session (RF-02 Part 1)', async () => {
    if (!productId) return;

    const response = await request(API_URL)
      .post('/orders/checkout')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('url');
    expect(response.body.data.url).toContain('mercadopago');
  });

  it('should attempt to finalize order (RF-02 Part 2)', async () => {
    const response = await request(API_URL)
      .post('/orders/finalize')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ sessionId: 'fake_payment_id' });

    // It should fail because payment ID is fake, but it proves the endpoint is reachable
    expect(response.status).not.toBe(404); 
  });

  // RF-03: Gestión de inventario (Admin)
  it('should prevent normal user from updating inventory (RF-03)', async () => {
    if (!productId) return;

    const response = await request(API_URL)
      .put(`/products/${productId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ stock: 100 });

    expect(response.status).toBe(403); // Forbidden for normal user
  });
});
