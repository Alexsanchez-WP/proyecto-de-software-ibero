# Despliegue en Vercel (Backend)

Para desplegar el backend en Vercel, sigue estos pasos:

1.  **Instala Vercel CLI** (opcional, si quieres desplegar desde terminal):
    ```bash
    npm i -g vercel
    ```

2.  **Estructura preparada**:
    - Se ha creado `backend/api/index.ts` como punto de entrada para Vercel.
    - Se ha creado `backend/vercel.json` para redirigir todo el tráfico a la API.
    - Se ha separado la lógica del servidor (`src/server.ts`) de la aplicación (`src/app.ts`).

3.  **Despliegue**:
    - Ve a la carpeta `backend`: `cd backend`
    - Ejecuta `vercel` y sigue las instrucciones.
    - O conecta tu repositorio de GitHub a Vercel y configura el "Root Directory" como `backend`.

4.  **Configuración de Build (Project Settings)**:
    - **Framework Preset**: Other
    - **Build Command**: `echo 'No build step'` (o dejar vacío activando Override).
    - **Output Directory**: `.` (o dejar por defecto).
    - **Install Command**: `npm install` (o dejar por defecto).

5.  **Variables de Entorno**:
    - En el panel de Vercel, agrega las variables de entorno definidas en `.env` (`MONGO_URI`, `JWT_SECRET`, `MERCADOPAGO_ACCESS_TOKEN`, `FRONTEND_URL`).

Nota: Vercel tiene un límite de tiempo de ejecución para funciones serverless (10s en plan gratuito). Asegúrate de que tu conexión a MongoDB sea eficiente (ya usamos Singleton).
