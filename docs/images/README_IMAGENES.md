# Especificaciones de Imágenes para el Manual de Usuario - IntelTask

Este archivo contiene las descripciones detalladas de cada imagen mencionada en el manual de usuario. Estas descripciones pueden usarse para generar mockups o capturas de pantalla reales del sistema.

## Imágenes Requeridas

### 1. logo.png
**Descripción**: Logo de IntelTask
- **Contenido**: Texto "IntelTask" con fuente moderna y profesional
- **Colores**: Gradiente azul (#3B82F6 a #1E40AF)
- **Estilo**: Minimalista, con ícono de tarea (checklist) integrado
- **Dimensiones**: 300x100px
- **Formato**: PNG con fondo transparente

### 2. login-screen.png
**Descripción**: Pantalla de inicio de sesión
- **Contenido**: 
  - Header con gradiente azul y título "IntelTask"
  - Subtítulo "Gestión inteligente de tus tareas"
  - Formulario centrado con:
    - Campo "Usuario" (email)
    - Campo "Contraseña" con botón mostrar/ocultar
    - Enlace "¿Olvidaste tu contraseña?"
    - Botón azul "Login"
  - Fondo con gradiente suave
- **Dimensiones**: 1200x800px
- **Estilo**: Moderno, limpio, profesional

### 3. main-interface.png
**Descripción**: Interfaz principal del sistema
- **Contenido**:
  - Barra superior con logo, menú (Tareas, Permisos), info usuario
  - Área principal con dashboard
  - Panel lateral opcional
- **Dimensiones**: 1400x900px
- **Estilo**: Limpio, organizado, con espacios blancos

### 4. task-states.png
**Descripción**: Diagrama de estados de tareas
- **Contenido**: Flujo visual mostrando:
  - Registrado → Asignado → En Proceso → En Revisión → Terminado
  - Ramificaciones: En Espera, Rechazada, Incumplida
  - Iconos y colores distintivos para cada estado
- **Dimensiones**: 1000x600px
- **Estilo**: Diagrama de flujo con flechas y colores

### 5. tasks-interface.png
**Descripción**: Interfaz del módulo de tareas
- **Contenido**:
  - Pestañas superiores (Pendientes, En Proceso, etc.)
  - Filtros (Por Rol: Todos, Creador, Asignado)
  - Lista de tareas en formato accordion
  - Botón "Nueva Tarea" destacado
  - Estadísticas o contadores por pestaña
- **Dimensiones**: 1400x900px
- **Estilo**: Organizado, con elementos UI modernos

### 6. create-task.png
**Descripción**: Modal para crear nueva tarea
- **Contenido**:
  - Modal centrado con título "Nueva Tarea"
  - Formulario con campos:
    - Título (obligatorio)
    - Descripción (textarea)
    - Usuario Asignado (select)
    - Prioridad (select con colores)
    - Complejidad (select)
    - Fecha Límite (date picker)
    - Número GIS (input)
  - Botones "Cancelar" y "Crear Tarea"
- **Dimensiones**: 800x600px
- **Estilo**: Modal moderno con sombra

### 7. task-details.png
**Descripción**: Vista expandida de detalles de tarea
- **Contenido**:
  - Accordion expandido mostrando:
    - Información básica (título, descripción)
    - Metadatos (prioridad, complejidad, fechas)
    - Usuario asignado y creador
    - Lista de subtareas con checkboxes
    - Sección de adjuntos
    - Historial de seguimientos
    - Botones de acción (Editar, Eliminar, etc.)
- **Dimensiones**: 1200x800px
- **Estilo**: Organizado en secciones claras

### 8. edit-task.png
**Descripción**: Modal de edición de tarea
- **Contenido**:
  - Similar al modal de creación pero con datos prellenados
  - Campos habilitados/deshabilitados según permisos
  - Indicación de campos editables vs bloqueados
  - Botones "Cancelar" y "Guardar Cambios"
- **Dimensiones**: 800x700px
- **Estilo**: Modal con indicadores visuales de restricciones

### 9. change-task-state.png
**Descripción**: Selector de cambio de estado
- **Contenido**:
  - Dropdown con estados disponibles
  - Cada opción con ícono y color distintivo
  - Campo de comentarios para justificar cambio
  - Advertencias según el estado seleccionado
- **Dimensiones**: 500x400px
- **Estilo**: Interfaz intuitiva con códigos de color

### 10. subtasks.png
**Descripción**: Gestión de subtareas
- **Contenido**:
  - Lista de subtareas con checkboxes
  - Campo de entrada para nueva subtarea
  - Botones de editar/eliminar por subtarea
  - Indicador de progreso general
- **Dimensiones**: 600x400px
- **Estilo**: Lista limpia y funcional

### 11. task-tracking.png
**Descripción**: Sistema de seguimiento de tareas
- **Contenido**:
  - Timeline con seguimientos cronológicos
  - Campo para agregar nuevo seguimiento
  - Información de usuario y fecha por seguimiento
  - Diferentes tipos de seguimientos (comentarios, cambios de estado)
- **Dimensiones**: 800x600px
- **Estilo**: Timeline vertical con burbujas

### 12. permission-states.png
**Descripción**: Estados de permisos
- **Contenido**: Diagrama simple:
  - Registrado → Aprobado
  - Registrado → Rechazado
  - Iconos y colores para cada estado
- **Dimensiones**: 600x300px
- **Estilo**: Diagrama limpio y simple

### 13. permissions-interface.png
**Descripción**: Interfaz del módulo de permisos
- **Contenido**:
  - Pestañas "Mis Solicitudes" y "Solicitudes"
  - Filtros por estado
  - Lista de permisos en cards
  - Botón "Nuevo Permiso"
  - Información resumida por permiso
- **Dimensiones**: 1400x900px
- **Estilo**: Cards con información clara

### 14. request-permission.png
**Descripción**: Modal para solicitar permiso
- **Contenido**:
  - Formulario con:
    - Título del permiso
    - Descripción detallada
    - Fecha y hora de inicio (date/time picker)
    - Fecha y hora de fin (date/time picker)
    - Restricciones de horario mostradas
  - Validaciones en tiempo real
  - Botones "Cancelar" y "Solicitar Permiso"
- **Dimensiones**: 700x600px
- **Estilo**: Modal con date pickers modernos

### 15. permission-details.png
**Descripción**: Detalles de un permiso
- **Contenido**:
  - Información en cards organizadas:
    - Fechas del permiso
    - Duración calculada
    - Estado con chip colorido
    - Descripción expandible
    - Información del solicitante
    - Motivo de rechazo (si aplica)
  - Botones de acción contextual
- **Dimensiones**: 1000x700px
- **Estilo**: Layout en grid con cards

### 16. edit-permission.png
**Descripción**: Modal de edición de permiso
- **Contenido**:
  - Formulario similar al de creación
  - Campos bloqueados según estado
  - Validaciones de fechas y horarios
  - Botones contextuales según rol
- **Dimensiones**: 700x600px
- **Estilo**: Modal con restricciones visuales

### 17. review-permission.png
**Descripción**: Modal de revisión de permiso (supervisor)
- **Contenido**:
  - Vista de solo lectura de detalles
  - Selector de estado (Aprobar/Rechazar)
  - Campo obligatorio para motivo de rechazo
  - Botones "Cancelar" y "Guardar Decisión"
- **Dimensiones**: 600x500px
- **Estilo**: Modal de decisión con colores semáforo

### 18. upload-attachments.png
**Descripción**: Modal de gestión de adjuntos
- **Contenido**:
  - Zona de drag & drop
  - Botón "Seleccionar Archivo"
  - Barra de progreso de subida
  - Lista de archivos existentes
  - Limitaciones mostradas (10MB, tipos permitidos)
- **Dimensiones**: 800x600px
- **Estilo**: Interfaz moderna de upload

### 19. manage-attachments.png
**Descripción**: Lista de adjuntos
- **Contenido**:
  - Lista con iconos por tipo de archivo
  - Información: nombre, fecha, tamaño, usuario
  - Botones "Descargar" y "Eliminar"
  - Estados según permisos
- **Dimensiones**: 700x500px
- **Estilo**: Lista organizada con iconografía

### 20. task-notification.png
**Descripción**: Ejemplo de notificación de tarea por email
- **Contenido**:
  - Encabezado con logo de IntelTask
  - Asunto: "Nueva tarea asignada: [Título]"
  - Detalles de la tarea
  - Botón "Ver Tarea"
  - Footer corporativo
- **Dimensiones**: 600x800px
- **Estilo**: Email template profesional

### 21. permission-notification.png
**Descripción**: Ejemplo de notificación de permiso por email
- **Contenido**:
  - Encabezado con logo
  - Asunto: "Permiso aprobado/rechazado"
  - Detalles del permiso
  - Motivo (si es rechazo)
  - Botón "Ver Permiso"
- **Dimensiones**: 600x800px
- **Estilo**: Email template profesional

## Paleta de Colores Sugerida

- **Azul Primario**: #3B82F6
- **Azul Oscuro**: #1E40AF
- **Verde Éxito**: #10B981
- **Rojo Error**: #EF4444
- **Amarillo Advertencia**: #F59E0B
- **Gris Neutral**: #6B7280
- **Gris Claro**: #F3F4F6
- **Blanco**: #FFFFFF

## Iconografía

- **Tareas**: ✅ 📋 ⚙️ ⏳ 🔍 ❌ ⚠️
- **Usuarios**: 👤 👥
- **Acciones**: ✏️ 🗑️ ➕ 💾 ↩️
- **Estados**: 🔴 🟡 🟢 🔵 ⚪
- **Archivos**: 📁 📄 📊 🖼️ 📦

## Notas de Implementación

1. **Consistencia**: Mantener el mismo estilo visual en todas las imágenes
2. **Responsive**: Considerar cómo se verán en diferentes tamaños
3. **Accesibilidad**: Usar suficiente contraste y texto legible
4. **Localización**: Todo el texto debe estar en español
5. **Branding**: Mantener la identidad visual de IntelTask

---

**Nota**: Estas especificaciones pueden usarse para crear mockups, wireframes o capturas de pantalla reales del sistema funcionando. Las dimensiones son sugeridas y pueden ajustarse según necesidades específicas de presentación.
