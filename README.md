# IntelTask - Sistema de Gestión de Tareas y Permisos

![IntelTask](./docs/images/logo.png)

## 🚀 Descripción

**IntelTask** es un sistema web integral diseñado para optimizar la gestión de tareas y permisos en organizaciones. Proporciona una plataforma moderna, intuitiva y robusta para mejorar la productividad y colaboración entre equipos.

### ✨ Características Principales

- **📋 Gestión Completa de Tareas**: Creación, asignación, seguimiento y control de tareas con flujo de estados configurable
- **📝 Sistema de Permisos**: Solicitud y aprobación de permisos laborales con validaciones automáticas  
- **📎 Gestión de Adjuntos**: Subida, descarga y gestión de documentos relacionados
- **📧 Notificaciones Automáticas**: Alertas por email para cambios importantes
- **🔐 Control de Acceso**: Sistema granular de permisos basado en roles y estados
- **📱 Diseño Responsivo**: Interfaz adaptada para dispositivos móviles y de escritorio
- **⚡ Tiempo Real**: Actualizaciones instantáneas y sincronización automática

## 🏗️ Arquitectura Tecnológica

### Frontend
- **Framework**: Next.js 15.x (React 18)
- **UI Library**: HeroUI + Tailwind CSS
- **Autenticación**: NextAuth.js
- **Estado**: React Hooks + Context API
- **Iconos**: React Icons + Framer Motion

### Backend
- **Framework**: ASP.NET Core 6.0 Web API
- **Base de Datos**: SQL Server 2019+
- **ORM**: Entity Framework Core
- **Autenticación**: JWT Tokens
- **Documentación**: Swagger/OpenAPI

## 📁 Estructura del Proyecto

```
IntelTask/
├── 📄 Manual_Usuario_IntelTask.md           # Manual completo para usuarios finales
├── 📄 Manual_Tecnico_IntelTask.md           # Documentación técnica para desarrolladores
├── 📄 Guias_Paso_a_Paso_IntelTask.md       # Guías rápidas y tutoriales
├── 📁 docs/                                 # Documentación y recursos
│   ├── 📁 images/                          # Imágenes del manual
│   └── 📄 README_IMAGENES.md               # Especificaciones de imágenes
├── 📁 frontend/                            # Aplicación Next.js
│   ├── 📁 components/                      # Componentes React
│   │   ├── 📁 Tareas/                     # Módulo de tareas
│   │   ├── 📁 Permisos/                   # Módulo de permisos
│   │   ├── 📁 Layout/                     # Componentes de layout
│   │   └── 📁 utils/                      # Utilidades y helpers
│   ├── 📁 pages/                          # Páginas de Next.js
│   ├── 📁 services/                       # Servicios de API
│   ├── 📁 hooks/                          # Custom React hooks
│   └── 📁 styles/                         # Estilos globales
└── 📁 backend/                            # API .NET Core
    ├── 📁 IntelTask.API/                  # Proyecto principal
    ├── 📁 IntelTask.Domain/               # Lógica de dominio
    └── 📁 IntelTask.Infrastructure/       # Infraestructura
```

## 🎯 Módulos Principales

### 📋 Gestión de Tareas

**Estados de Flujo de Trabajo**:
- 📝 **Registrado** → 👤 **Asignado** → ⚙️ **En Proceso** → 🔍 **En Revisión** → ✅ **Terminado**
- **Estados Especiales**: ⏳ En Espera, ❌ Rechazada, ⚠️ Incumplida

**Funcionalidades**:
- Creación y asignación de tareas
- Sistema de prioridades (Alta, Media, Baja)
- Niveles de complejidad (Simple, Intermedio, Complejo)
- Gestión de subtareas
- Seguimiento con comentarios y bitácora
- Control granular de permisos por estado

### 📝 Sistema de Permisos

**Flujo Simplificado**:
- 📝 **Registrado** → ✅ **Aprobado** / ❌ **Rechazado**

**Características**:
- Solicitud de permisos laborales
- Validación automática de horarios (7:00 AM - 4:30 PM, días hábiles)
- Revisión y aprobación por supervisores
- Justificación obligatoria para rechazos
- Cálculo automático de duración

### 📎 Gestión de Adjuntos

**Capacidades**:
- Subida de archivos múltiples formatos (PDF, DOC, DOCX, JPG, PNG, XLS, XLSX, ZIP, RAR)
- Límite de 10MB por archivo
- Control de permisos por estado y rol
- Descarga segura de documentos
- Historial de adjuntos por usuario

## 🔐 Sistema de Permisos y Seguridad

### Control de Acceso

**Basado en**:
- **Estado de la entidad** (Tarea/Permiso)
- **Relación del usuario** (Creador/Asignado)
- **Acción solicitada** (Editar/Eliminar/Ver)

### Matriz de Restricciones

Cada combinación de estado + rol tiene permisos específicos para:
- Edición de campos
- Cambio de estados
- Gestión de adjuntos
- Eliminación de registros

## 📧 Sistema de Notificaciones

### Notificaciones Automáticas

**Para Tareas**:
- Nueva asignación
- Cambios de estado
- Proximidad a vencimiento
- Incumplimientos

**Para Permisos**:
- Nueva solicitud (a supervisores)
- Aprobación/Rechazo (a solicitantes)
- Recordatorios de solicitudes pendientes

### Configuración de Email

- Servidor SMTP configurable
- Templates HTML personalizables
- Información detallada en cada notificación
- Enlaces directos al sistema

## 🚀 Instalación y Configuración

### Requisitos Previos

**Desarrollo**:
- Node.js 18.x+
- .NET 6.0 SDK+
- SQL Server 2019+
- Visual Studio Code / Visual Studio

**Producción**:
- Servidor Windows/Linux
- IIS / Nginx
- SQL Server
- Certificado SSL

### Configuración Rápida

#### 1. Frontend

```bash
cd frontend
npm install
npm run dev
```

#### 2. Backend

```bash
cd backend
dotnet restore
dotnet run --project IntelTask.API
```

#### 3. Base de Datos

```sql
-- Crear base de datos
CREATE DATABASE IntelTaskDB;

-- Ejecutar migraciones
dotnet ef database update
```

### Variables de Entorno

#### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

#### Backend (appsettings.json)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=.;Database=IntelTaskDB;Trusted_Connection=true;"
  },
  "EmailSettings": {
    "SmtpServer": "smtp.gmail.com",
    "SmtpPort": 587,
    "SmtpUsername": "your-email@domain.com",
    "SmtpPassword": "your-app-password"
  }
}
```

## 📖 Documentación

### Para Usuarios Finales
- **[Manual de Usuario](./Manual_Usuario_IntelTask.md)**: Guía completa con capturas de pantalla
- **[Guías Paso a Paso](./Guias_Paso_a_Paso_IntelTask.md)**: Tutoriales rápidos para tareas específicas

### Para Desarrolladores
- **[Manual Técnico](./Manual_Tecnico_IntelTask.md)**: Arquitectura, API y configuración
- **[Especificaciones de Imágenes](./docs/images/README_IMAGENES.md)**: Mockups y diseños

### API Documentation
- **Swagger UI**: Disponible en `/swagger` cuando se ejecuta en desarrollo
- **Endpoints**: Documentación completa de todos los endpoints REST

## 🛠️ Desarrollo

### Scripts Disponibles

#### Frontend
```bash
npm run dev          # Servidor de desarrollo
npm run build        # Construcción para producción
npm run start        # Servidor de producción
npm run lint         # Linter de código
```

#### Backend
```bash
dotnet run           # Ejecutar en desarrollo
dotnet build         # Compilar proyecto
dotnet test          # Ejecutar pruebas
dotnet publish       # Publicar para producción
```

### Estructura de Commits

Usando [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: agregar sistema de notificaciones por email
fix: corregir validación de fechas en permisos
docs: actualizar manual de usuario
style: mejorar diseño de modal de tareas
refactor: optimizar consultas de base de datos
test: agregar pruebas unitarias para servicios
```

## 🧪 Testing

### Frontend
```bash
npm run test         # Jest + React Testing Library
npm run test:e2e     # Cypress (end-to-end)
```

### Backend
```bash
dotnet test          # xUnit + Moq
```

### Cobertura de Pruebas
- **Unitarias**: Servicios y componentes críticos
- **Integración**: Endpoints de API
- **E2E**: Flujos principales de usuario

## 🚀 Deployment

### Docker

#### Frontend
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

#### Backend
```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:6.0
WORKDIR /app
COPY ./publish .
ENTRYPOINT ["dotnet", "IntelTask.API.dll"]
```

### Producción

1. **Frontend**: Deploy en Vercel/Netlify o servidor propio
2. **Backend**: IIS, Docker, o Azure App Service
3. **Base de Datos**: SQL Server local o Azure SQL Database

## 📊 Monitoreo y Logs

### Logs Disponibles
- **Frontend**: Console logs + Error boundaries
- **Backend**: ILogger + Serilog (opcional)
- **Base de Datos**: SQL Server logs

### Métricas Importantes
- Tiempo de respuesta de API
- Errores de autenticación
- Uso de almacenamiento (adjuntos)
- Concurrencia de usuarios

## 🤝 Contribución

### Flujo de Desarrollo

1. **Fork** del repositorio
2. **Crear rama** para nueva funcionalidad
3. **Desarrollar** con pruebas
4. **Commit** siguiendo convenciones
5. **Pull Request** con descripción detallada

### Estándares de Código

- **Frontend**: ESLint + Prettier
- **Backend**: StyleCop + EditorConfig
- **Documentación**: Markdown con formato consistente

## 📋 Roadmap

### Versión 1.1 (Q3 2025)
- [ ] Dashboard con métricas y gráficos
- [ ] Integración con calendario (Outlook/Google)
- [ ] Notificaciones push en el navegador
- [ ] Exportación de reportes (PDF/Excel)

### Versión 1.2 (Q4 2025)
- [ ] API REST pública con autenticación
- [ ] Integración con Active Directory
- [ ] Aplicación móvil (React Native)
- [ ] Plantillas de tareas predefinidas

### Futuro
- [ ] Inteligencia artificial para estimación de tiempos
- [ ] Integración con herramientas externas (Slack, Teams)
- [ ] Flujos de trabajo personalizables
- [ ] Multi-tenancy para múltiples organizaciones

## 🐛 Reporte de Bugs

Para reportar problemas:

1. **Verificar** que no existe un issue similar
2. **Crear issue** con:
   - Descripción detallada del problema
   - Pasos para reproducir
   - Capturas de pantalla (si aplica)
   - Información del navegador/sistema
3. **Etiquetas** apropiadas (bug, enhancement, question)

## 📞 Soporte

### Contacto
- **Email**: soporte@inteltask.com
- **Documentación**: [Manual de Usuario](./Manual_Usuario_IntelTask.md)
- **Issues**: GitHub Issues para bugs y mejoras

### Horarios de Soporte
- **Lunes a Viernes**: 8:00 AM - 6:00 PM
- **Tiempo de respuesta**: Máximo 24 horas

## 📜 Licencia

© 2025 IntelTask. Todos los derechos reservados.

Este proyecto es de uso interno organizacional. Para más información sobre licenciamiento, contactar al equipo de desarrollo.

---

## 🙏 Agradecimientos

Desarrollado con ❤️ por el equipo de IntelTask para mejorar la productividad y colaboración organizacional.

**Tecnologías Open Source utilizadas**:
- React.js y el ecosistema de JavaScript
- .NET Core y Microsoft ecosystem
- Comunidad de desarrolladores que contribuyen con librerías y herramientas

---

**¿Listo para comenzar?** 

👉 Consulta el [Manual de Usuario](./Manual_Usuario_IntelTask.md) para comenzar a usar IntelTask

👩‍💻 Para desarrollo, revisa el [Manual Técnico](./Manual_Tecnico_IntelTask.md)
