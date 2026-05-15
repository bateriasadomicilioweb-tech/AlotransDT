# 🚛 AloTrans Carga · Panel Maestro de Operaciones

Sistema de gestión logística para **AloTrans Carga**, cliente principal del **Grupo UMA**.

![License](https://img.shields.io/badge/license-MIT-orange)
![React](https://img.shields.io/badge/React-18.3-blue)
![Vite](https://img.shields.io/badge/Vite-5.3-purple)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-cyan)

## ✨ Características

- 🔐 **Autenticación completa** con login y registro de usuarios
- 👥 **Roles y permisos**: Admin (acceso total) y Coordinador (sin eliminar)
- 📊 **Dashboard** con KPIs en tiempo real y reglas de negocio corregidas
- 📋 **Gestión de servicios** con búsqueda y filtros
- 📑 **Captura masiva tipo Excel** (copiar/pegar con `Ctrl+V`)
- 👤 **Gestión de usuarios** (solo admin)
- 💰 **Formato COP** ($1.200.000) en todos los valores
- 📱 **100% Responsive** (móvil, tablet, desktop)
- 🎨 **Diseño profesional** con tema dark y colores de marca
- 💾 **Persistencia local** con `localStorage`

## 🚀 Inicio rápido

### Requisitos previos
- Node.js 18+ ([descargar](https://nodejs.org/))
- npm 9+ (incluido con Node)

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/TU_USUARIO/alotrans-carga.git
cd alotrans-carga

# 2. Instalar dependencias
npm install

# 3. Levantar servidor de desarrollo
npm run dev
```

La app estará disponible en `http://localhost:5173`

### Scripts disponibles

```bash
npm run dev       # Servidor de desarrollo
npm run build     # Build de producción → /dist
npm run preview   # Preview del build localmente
```

## 🔑 Credenciales de demostración

| Usuario  | Contraseña  | Rol           | Permisos                    |
|----------|-------------|---------------|------------------------------|
| `admin`  | `admin123`  | ADMIN         | Acceso completo + eliminar  |
| `coord`  | `coord123`  | COORDINADOR   | Crear, editar (sin eliminar) |

Además puedes crear usuarios nuevos desde la pantalla de registro.

## 📦 Despliegue en Vercel

### Opción 1: Deploy desde GitHub (recomendado)

1. **Sube el proyecto a GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/alotrans-carga.git
   git push -u origin main
   ```

2. **Conecta con Vercel**:
   - Entra a [vercel.com](https://vercel.com) y crea una cuenta
   - Click en **"Add New Project"**
   - Importa el repositorio de GitHub
   - Vercel detecta automáticamente que es un proyecto Vite
   - Click en **"Deploy"** ✨

3. Tu app estará disponible en `https://TU_PROYECTO.vercel.app` en menos de 1 minuto.

### Opción 2: Deploy con Vercel CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login y deploy
vercel login
vercel --prod
```

## 🌐 Configurar dominio personalizado

1. En el dashboard de Vercel, ve a tu proyecto → **Settings → Domains**
2. Agrega tu dominio (ej. `operaciones.alotrans.co`)
3. Configura los DNS según las instrucciones que te muestra Vercel:
   - Tipo `A` apuntando a `76.76.21.21`
   - O tipo `CNAME` apuntando a `cname.vercel-dns.com`
4. Vercel emite el certificado SSL automáticamente (Let's Encrypt)

## 📁 Estructura del proyecto

```
alotrans-carga/
├── public/
│   └── favicon.svg          # Favicon con el rayo de la marca
├── src/
│   ├── App.jsx              # Aplicación principal (componente único)
│   ├── main.jsx             # Entry point de React
│   └── index.css            # Estilos globales + Tailwind
├── index.html               # HTML principal
├── package.json             # Dependencias y scripts
├── vite.config.js           # Configuración de Vite
├── tailwind.config.js       # Configuración de Tailwind
├── postcss.config.js        # Configuración de PostCSS
├── vercel.json              # Configuración de despliegue
├── .gitignore               # Archivos ignorados por Git
└── README.md                # Esta documentación
```

## 🛠️ Stack tecnológico

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| **React** | 18.3 | Framework UI |
| **Vite** | 5.3 | Build tool y dev server |
| **Tailwind CSS** | 3.4 | Estilos utility-first |
| **Lucide React** | 0.395 | Iconografía SVG |
| **localStorage** | — | Persistencia de datos en el navegador |

## ⚙️ Variables de entorno (futuro backend)

Cuando se conecte un backend real, crea un archivo `.env` en la raíz:

```env
VITE_API_URL=https://api.alotrans.co
VITE_APP_NAME="AloTrans Carga"
```

Estas variables se leen en el código con `import.meta.env.VITE_API_URL`.

## 🔮 Roadmap (próximas mejoras)

- [ ] Backend con Node.js + Express + PostgreSQL
- [ ] Autenticación con JWT
- [ ] Importación real de archivos `.xlsx` (SheetJS)
- [ ] Exportación a PDF de reportes
- [ ] Gráficos avanzados con Recharts
- [ ] Notificaciones push
- [ ] Sistema de auditoría de cambios
- [ ] 2FA (autenticación de dos factores)

## ⚠️ Notas importantes

> Esta versión usa `localStorage` para guardar los datos. Esto significa que:
> - Los datos se guardan **solo en el navegador del usuario**
> - No se sincronizan entre dispositivos
> - Si el usuario limpia el caché, se pierden los datos
> - **Para uso en producción real con múltiples usuarios** se requiere un backend con base de datos

## 📄 Licencia

MIT © 2026 AloTrans Carga · Grupo UMA

## 📞 Contacto

Para soporte técnico o reportar issues, crea un ticket en el repositorio.

---

Desarrollado con ❤️ para optimizar las operaciones logísticas del Grupo UMA
