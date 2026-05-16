# 🚛 AloTrans Carga · Panel Maestro de Operaciones v2.0

Sistema de gestión logística para **AloTrans Carga**, cliente del **Grupo UMA**.

![React](https://img.shields.io/badge/React-18.3-blue)
![Vite](https://img.shields.io/badge/Vite-5.3-purple)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-cyan)

## ✨ Novedades v2.0

- 🗂️ **Gestor de Columnas** — el admin agrega, edita, oculta y reordena columnas sin tocar código
- 📊 **64 columnas completas** del Excel maestro precargadas
- 🗄️ **Integración con Supabase** — base de datos PostgreSQL real en la nube
- 🔄 **Modo dual** — funciona con `localStorage` por defecto, o con Supabase si lo configuras

## 🎯 Funcionalidades

- 🔐 Autenticación con login y registro de usuarios
- 👥 Roles: **Admin** (acceso total) y **Coordinador** (sin eliminar)
- 📊 Dashboard con KPIs y reglas de negocio corregidas
- 📋 Gestión de servicios con búsqueda y filtros
- 📑 Captura masiva tipo Excel (`Ctrl+V`) con columnas dinámicas
- 🗂️ **Gestor de columnas** (solo admin)
- 👤 Gestión de usuarios (solo admin)
- 💰 Formato COP `$1.200.000`
- 📱 100% responsive

---

## 🚀 Inicio rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Levantar en desarrollo
npm run dev
```

Abre `http://localhost:5173`

### Credenciales demo
| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| `admin` | `admin123` | Administrador |
| `coord` | `coord123` | Coordinador |

---

## 🗂️ Gestor de Columnas (Admin)

El administrador tiene una pestaña **"Columnas"** donde puede:

- ✅ **Mostrar/ocultar** cualquiera de las 64 columnas (toggle)
- ✏️ **Editar** nombre, tipo, ancho y grupo de cada columna
- ➕ **Agregar columnas nuevas** personalizadas
- 🔼🔽 **Reordenar** columnas (subir/bajar)
- 🗑️ **Eliminar** columnas custom (las del sistema solo se ocultan)
- 🔄 **Restablecer** a la configuración predeterminada

Los cambios afectan automáticamente la **hoja de captura** y los **listados**.
La configuración se guarda en `localStorage` (o Supabase si está conectado).

---

## 🗄️ Conectar con Supabase (recomendado para producción)

[Supabase](https://supabase.com) es PostgreSQL gestionado, con plan **gratuito** generoso.
Te da una base de datos real, accesible desde cualquier dispositivo.

### Paso 1 — Crear proyecto en Supabase

1. Entra a [supabase.com](https://supabase.com) y crea una cuenta gratis
2. Click en **"New Project"**
3. Ponle nombre (ej. `alotrans-carga`), elige región más cercana (ej. `South America (São Paulo)`)
4. Crea una contraseña fuerte para la base de datos y guárdala
5. Espera ~2 minutos a que se cree

### Paso 2 — Crear las tablas (las 64 columnas)

1. En tu proyecto Supabase, ve a **SQL Editor** (icono en la barra lateral)
2. Click en **"New Query"**
3. Abre el archivo `supabase/schema.sql` de este proyecto
4. Copia **todo** su contenido y pégalo en el editor
5. Click en **"Run"** (▶️)

✅ Esto crea las tablas `servicios` (64 columnas), `usuarios`, `config_columnas`, `auditoria`, índices y la vista del dashboard.

### Paso 3 — Obtener las credenciales

1. En Supabase ve a **Settings → API**
2. Copia dos valores:
   - **Project URL** → ej. `https://abcdxyz.supabase.co`
   - **anon public** key → una cadena larga que empieza con `eyJ...`

### Paso 4 — Configurar el proyecto

1. Copia el archivo `.env.example` y renómbralo a `.env`:
   ```bash
   cp .env.example .env
   ```
2. Edita `.env` con tus valores:
   ```env
   VITE_SUPABASE_URL=https://abcdxyz.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. Reinicia el servidor (`npm run dev`)

🎉 **Listo.** La app detecta Supabase automáticamente y empieza a usarlo como base de datos. Verás un indicador verde "Supabase conectado".

> **¿Cómo sé si está usando Supabase o localStorage?**
> Sin las variables `.env` → usa `localStorage` (datos en el navegador).
> Con las variables → usa Supabase (datos en la nube, compartidos entre todos).

---

## 📦 Despliegue en Vercel

### Subir a GitHub

```bash
git init
git add .
git commit -m "AloTrans Carga v2.0"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/alotrans-carga.git
git push -u origin main
```

### Desplegar

1. Entra a [vercel.com](https://vercel.com) → **"Add New Project"**
2. Importa el repositorio de GitHub
3. **IMPORTANTE**: en la sección **Environment Variables**, agrega:
   - `VITE_SUPABASE_URL` = tu URL de Supabase
   - `VITE_SUPABASE_ANON_KEY` = tu anon key
4. Click en **"Deploy"** 🚀

> Si no agregas las variables de entorno, la app igual funciona pero con `localStorage`.

### Dominio personalizado

En Vercel → tu proyecto → **Settings → Domains** → agrega `operaciones.alotrans.co` y configura el DNS según las instrucciones.

---

## 📁 Estructura del proyecto

```
alotrans-carga/
├── public/
│   └── favicon.svg
├── src/
│   ├── lib/
│   │   ├── columns.js       ← Las 64 columnas + utilidades
│   │   ├── supabase.js      ← Cliente de Supabase
│   │   └── db.js            ← Capa de datos (localStorage o Supabase)
│   ├── App.jsx              ← Aplicación principal
│   ├── main.jsx             ← Entry point
│   └── index.css            ← Estilos + Tailwind
├── supabase/
│   └── schema.sql           ← SQL completo para crear las tablas
├── .env.example             ← Plantilla de variables de entorno
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── vercel.json
└── README.md
```

## 📊 Las 64 columnas

Todas las columnas del Excel maestro están precargadas en `src/lib/columns.js`:

`VIAJE INTERNO`, `COORDINA`, `DIG`, `DOC`, `TM`, `FAC`, `ESTADO`, `CONTRATO`, `EXPEDIENTE`, `DESTINO FINAL`, `ORDEN DE COMPRA`, `MANIFIESTO`, `ESTADO MANIFIESTO`, `REMESA`, `RADICADO REMESA`, `OBSERVACIONES MANIFIESTOS`, `FECHA SOLICITUD`, `FECHA INICIO SERVICIO`, `FECHA FINALIZACIÓN`, `CATEGORÍA`, `VEHÍCULO`, `CHASIS`, `DEPARTAMENTO ORIGEN`, `CIUDAD ORIGEN`, `DIRECCIÓN ORIGEN`, `DEPARTAMENTO DESTINO`, `CIUDAD DESTINO`, `DIRECCIÓN DESTINO`, `NOMBRE DESTINATARIO`, `CONTACTO DESTINO`, `COORDINADO CON`, `APROBADO POR`, `PROVEEDOR`, `NOMBRE TÉCNICO`, `CÉDULA`, `PLACA RECURSO`, `OBSERVACIONES`, `VALOR RUTA`, `VALOR REMESA`, `VALOR OK`, `NETO OK`, `VALOR TOTAL`, `COD ORIGEN`, `COD DESTINO`, `RUTA`, `TIPO DE RUTA`, `KMS ORIGEN-DESTINO`, `EXPEDIENTE RUTA`, `KM REALES`, `# VEHÍCULOS`, `TIPO MOV`, `TIPO DE SERVICIO`, `NS`, `DÍAS ENTREGA`, `DÍAS ENTREGA HÁBIL`, `HORAS ENTREGA`, `RANGO`, `HORAS ENTREGA HÁBILES`, `CUMPLIMIENTO`, `CUMPLIMIENTO 2`, `OBSERVACIÓN INCUMPLIMIENTO`, `CLIENTE`.

Por defecto se muestran ~18 columnas clave; el resto están ocultas pero disponibles desde el **Gestor de Columnas**.

## 🛠️ Stack tecnológico

| Tecnología | Uso |
|-----------|-----|
| React 18 + Vite 5 | Frontend |
| Tailwind CSS 3 | Estilos |
| Lucide React | Iconos |
| Supabase | Base de datos PostgreSQL (opcional) |
| localStorage | Persistencia local (por defecto) |

## ⚠️ Notas

- **Sin Supabase**: los datos viven en `localStorage` (solo en ese navegador)
- **Con Supabase**: los datos viven en la nube, accesibles desde cualquier dispositivo y compartidos entre usuarios
- En `schema.sql`, las contraseñas demo están en texto plano para pruebas. **En producción usa bcrypt** y la autenticación nativa de Supabase

## 📄 Licencia

MIT © 2026 AloTrans Carga · Grupo UMA

---

Desarrollado para optimizar las operaciones logísticas del Grupo UMA 🚛
