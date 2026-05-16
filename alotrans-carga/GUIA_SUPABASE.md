# 🗄️ Guía rápida: Conectar Supabase

Esta guía te lleva paso a paso a conectar la app con una base de datos real.
Tiempo estimado: **10 minutos**.

---

## ¿Por qué Supabase?

| Sin Supabase (localStorage) | Con Supabase |
|------------------------------|--------------|
| Datos solo en TU navegador | Datos en la nube |
| No se comparten entre usuarios | Todos ven los mismos datos |
| Se pierden si limpias caché | Datos seguros y respaldados |
| Gratis | Gratis (plan Free generoso) |

**Sí, Supabase te ayuda a crear y gestionar las 64 columnas** — el archivo `supabase/schema.sql` ya las tiene todas listas, solo lo ejecutas.

---

## PASO 1 · Crear cuenta y proyecto

1. Ve a 👉 **https://supabase.com**
2. Click en **"Start your project"** → regístrate (puedes usar GitHub)
3. Click en **"New Project"**
4. Llena los datos:
   - **Name**: `alotrans-carga`
   - **Database Password**: crea una fuerte y **guárdala**
   - **Region**: `South America (São Paulo)` (la más cercana a Colombia)
5. Click **"Create new project"** y espera ~2 min

---

## PASO 2 · Crear las tablas (64 columnas)

1. En el menú lateral izquierdo, click en **SQL Editor**
2. Click en **"+ New query"**
3. Abre el archivo **`supabase/schema.sql`** de este proyecto
4. **Selecciona todo** el contenido (Ctrl+A) y **cópialo** (Ctrl+C)
5. **Pégalo** en el editor SQL de Supabase (Ctrl+V)
6. Click en el botón **"Run"** (abajo a la derecha) ▶️

Verás un mensaje verde de éxito. ✅

**Esto crea automáticamente:**
- Tabla `servicios` con las **64 columnas**
- Tabla `usuarios` (con admin y coord demo)
- Tabla `config_columnas` (para el gestor de columnas)
- Tabla `auditoria` (registro de cambios)
- Índices para búsquedas rápidas
- Vista del dashboard con los totales

---

## PASO 3 · Copiar las credenciales

1. En el menú lateral, click en **Settings** (engranaje) → **API**
2. Verás dos valores que necesitas copiar:

   **Project URL**
   ```
   https://abcdefghijk.supabase.co
   ```

   **Project API keys → anon public**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ...
   ```

> ⚠️ La key `anon public` es segura para usar en el navegador.
> NUNCA uses la `service_role` key en el frontend.

---

## PASO 4 · Configurar el proyecto

1. En la carpeta del proyecto, busca el archivo **`.env.example`**
2. Haz una copia y renómbrala a **`.env`** (sin nada antes del punto)
3. Abre `.env` y reemplaza los valores:

   ```env
   VITE_SUPABASE_URL=https://abcdefghijk.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ...
   ```

4. Guarda el archivo
5. Si el servidor está corriendo, reinícialo:
   ```bash
   # Ctrl+C para detener, luego:
   npm run dev
   ```

---

## PASO 5 · Verificar

1. Abre la app en el navegador
2. Inicia sesión con `admin` / `admin123`
3. En el menú de usuario (arriba derecha) verás un indicador verde:
   **🟢 Supabase**
4. En la pestaña **Columnas** también aparece **"Supabase conectado"**

🎉 **¡Listo!** Ahora todos los datos se guardan en la nube.

---

## Desplegar en Vercel con Supabase

Cuando subas a Vercel, agrega las variables de entorno:

1. En Vercel → tu proyecto → **Settings → Environment Variables**
2. Agrega:
   | Name | Value |
   |------|-------|
   | `VITE_SUPABASE_URL` | tu Project URL |
   | `VITE_SUPABASE_ANON_KEY` | tu anon key |
3. Redespliega (**Deployments → ... → Redeploy**)

---

## Preguntas frecuentes

**¿Puedo agregar más columnas después?**
Sí. Desde la pestaña **Columnas** (como admin) puedes agregar columnas custom.
Para que se guarden en Supabase, también agrégalas con SQL:
```sql
ALTER TABLE servicios ADD COLUMN mi_columna TEXT;
```

**¿Es gratis?**
El plan Free de Supabase incluye 500 MB de base de datos, suficiente para
cientos de miles de servicios. Si creces, hay planes desde $25/mes.

**¿Qué pasa con los datos que ya tengo en localStorage?**
Al activar Supabase, empieza vacío. Puedes exportar tu JSON
(menú → Exportar JSON) y luego importarlo, o ingresarlos con la captura masiva.

**¿Necesito saber SQL?**
No. Solo copiar y pegar el `schema.sql` una vez. El resto lo maneja la app.
