using IntelTask.Domain.Entities;
using IntelTask.Domain.Interfaces;
using IntelTask.Domain.DTOs;
using IntelTask.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

namespace IntelTask.Infrastructure.Repositories
{
    public class TareasRepository : ITareasRepository
    {
        private readonly IntelTaskDbContext _context;
        private readonly IBitacoraCambioEstadoService _bitacoraCambioEstadoService;
        private readonly ITareaFechaService _tareaFechaService;

        public TareasRepository(IntelTaskDbContext context, IBitacoraCambioEstadoService bitacoraCambioEstadoService, ITareaFechaService tareaFechaService)
        {
            _context = context;
            _bitacoraCambioEstadoService = bitacoraCambioEstadoService;
            _tareaFechaService = tareaFechaService;
        }

        public async Task<IEnumerable<ETareas>> F_PUB_ObtenerTodasLasTareas()
        {
            return await _context.T_Tareas
                .Include(t => t.Complejidad)
                .Include(t => t.Estado)
                .Include(t => t.Prioridad)
                .Include(t => t.UsuarioCreador)
                .Include(t => t.UsuarioAsignado)
                .Include(t => t.TareaOrigen)
                .ToListAsync();
        }

        public async Task<IEnumerable<ETareas>> F_PUB_ObtenerTareasPorUsuario(int usuarioId)
        {
            return await _context.T_Tareas
                .Include(t => t.Complejidad)
                .Include(t => t.Estado)
                .Include(t => t.Prioridad)
                .Include(t => t.UsuarioCreador)
                .Include(t => t.UsuarioAsignado)
                .Include(t => t.TareaOrigen)
                .Where(t => t.CN_Usuario_creador == usuarioId || t.CN_Usuario_asignado == usuarioId)
                .ToListAsync();
        }

        public async Task<ETareas?> F_PUB_ObtenerTareaPorId(int id)
        {
            return await _context.T_Tareas
                .Include(t => t.Complejidad)
                .Include(t => t.Estado)
                .Include(t => t.Prioridad)
                .Include(t => t.UsuarioCreador)
                .Include(t => t.UsuarioAsignado)
                .Include(t => t.TareaOrigen)
                .FirstOrDefaultAsync(t => t.CN_Id_tarea == id);
        }

        public async Task M_PUB_AgregarTarea(ETareas tarea)
        {
            try
            {
                // Verificar si existen las relaciones
                await ValidarRelaciones(tarea);
                await _context.T_Tareas.AddAsync(tarea);
                await _context.SaveChangesAsync();

                // Registrar bitácora de creación
                var bitacora = new EBitacoraCambioEstado
                {
                    CN_Id_tarea_permiso = tarea.CN_Id_tarea,
                    CN_Id_tipo_documento = 1, // Ajusta según tu lógica
                    CN_Id_estado_anterior = tarea.CN_Id_estado == 2 ? (byte) 1 : tarea.CN_Id_estado, // Si es nueva, el estado anterior es 1 (registrado)
                    CN_Id_estado_nuevo = tarea.CN_Id_estado,
                    CF_Fecha_hora_cambio = DateTime.Now,
                    CN_Id_usuario_responsable = tarea.CN_Usuario_creador, // Usuario creador
                    CT_Observaciones = "Tarea creada"
                };
                await _bitacoraCambioEstadoService.M_PUB_RegistrarCambioEstadoAsync(bitacora);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al agregar tarea: {ex.Message}");
                throw new Exception("DB_ERROR: Error al crear la tarea en la base de datos.", ex);
            }
        }

        private async Task PonerEnEsperaOtrasTareasEnProcesoAsync(ETareas tarea, int usuarioResponsable)
        {
            // Sólo aplicar si la tarea va a "En Proceso" (estado 3) y tiene usuario asignado
            if (tarea.CN_Id_estado != 3 || !tarea.CN_Usuario_asignado.HasValue)
                return;

            // 1) Obtener IDs y estados anteriores de las demás tareas "En Proceso"
            var tareasEnProceso = await _context.T_Tareas
                .Where(t =>
                    t.CN_Usuario_asignado == tarea.CN_Usuario_asignado.Value &&
                    t.CN_Id_estado == 3 &&
                    t.CN_Id_tarea != tarea.CN_Id_tarea)
                .Select(t => new { t.CN_Id_tarea, t.CN_Id_estado })
                .ToListAsync();

            if (!tareasEnProceso.Any())
                return;

            // 2) Construir bitácoras y actualizar entidades en memoria
            var bitacoras = new List<EBitacoraCambioEstado>();
            foreach (var info in tareasEnProceso)
            {
                // Cargar la tarea completa para modificar su estado
                var tareaEnProceso = new ETareas { CN_Id_tarea = info.CN_Id_tarea };
                _context.T_Tareas.Attach(tareaEnProceso);
                tareaEnProceso.CN_Id_estado = 4; // "En Espera"

                bitacoras.Add(new EBitacoraCambioEstado
                {
                    CN_Id_tarea_permiso = info.CN_Id_tarea,
                    CN_Id_tipo_documento = 1, // 1 = tarea
                    CN_Id_estado_anterior = info.CN_Id_estado,
                    CN_Id_estado_nuevo = 4,
                    CF_Fecha_hora_cambio = DateTime.UtcNow,
                    CN_Id_usuario_responsable = usuarioResponsable,
                    CT_Observaciones = $"Automático: tarea {tarea.CN_Id_tarea} puesta en proceso"
                });
            }

            // 3) Aplicar todo en una sola transacción y un único SaveChanges
            using var tx = await _context.Database.BeginTransactionAsync();
            try
            {
                // Agregar las bitácoras en lote
                _context.T_Bitacora_Cambio_Estado.AddRange(bitacoras);
                await _context.SaveChangesAsync();

                await tx.CommitAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                // Manejo de concurrencia: informar al cliente o reintentar
                throw new InvalidOperationException("No se pudo actualizar porque la tarea cambió simultáneamente.");
            }
        }

        public async Task<ETareas> M_PUB_ActualizarTarea(int id, TareaUpdateRequest request)
        {
            try
            {
                var tareaExistente = await _context.T_Tareas
                    .Include(t => t.Complejidad)
                    .Include(t => t.Estado)
                    .Include(t => t.Prioridad)
                    .Include(t => t.UsuarioCreador)
                    .Include(t => t.UsuarioAsignado)
                    .Include(t => t.TareaOrigen)
                    .FirstOrDefaultAsync(t => t.CN_Id_tarea == id);

                if (tareaExistente == null)
                {
                    throw new Exception("TAREA_NO_ENCONTRADA: La tarea especificada no existe.");
                }

                // Validar relaciones antes de actualizar
                await ValidarRelacionesParaActualizacion(request);

                var estadoAnterior = tareaExistente.CN_Id_estado;
                var usuarioAsignadoAnterior = tareaExistente.CN_Usuario_asignado;
                var fechaLimiteAnterior = tareaExistente.CF_Fecha_limite;

                // Actualizar solo los campos permitidos
                tareaExistente.CT_Titulo_tarea = request.CT_Titulo_tarea;
                tareaExistente.CT_Descripcion_tarea = request.CT_Descripcion_tarea;
                tareaExistente.CN_Id_complejidad = request.CN_Id_complejidad;
                tareaExistente.CN_Id_prioridad = request.CN_Id_prioridad;
                tareaExistente.CN_Id_estado = request.CN_Id_estado;
                tareaExistente.CF_Fecha_limite = request.CF_Fecha_limite;
                tareaExistente.CN_Numero_GIS = request.CN_Numero_GIS;
                tareaExistente.CN_Usuario_asignado = request.CN_Usuario_asignado;

                if (estadoAnterior == 1 && usuarioAsignadoAnterior != request.CN_Usuario_asignado)
                {
                    tareaExistente.CN_Id_estado = 2;
                }
                // Si el usuario asignado cambió (incluye el caso de asignar por primera vez o cambiar de usuario), actualiza la fecha de asignación
                if (usuarioAsignadoAnterior != request.CN_Usuario_asignado)
                {
                    tareaExistente.CF_Fecha_asignacion = DateTime.Now;
                }

                if (request.CN_Id_estado == 5 && tareaExistente.CF_Fecha_finalizacion == new DateTime(1900, 1, 1))
                {
                    tareaExistente.CF_Fecha_finalizacion = DateTime.Now;
                }

                _context.Entry(tareaExistente).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                // NUEVA LÓGICA: Verificar extensión automática de fecha límite en tarea principal
                // Solo si la fecha límite cambió
                if (fechaLimiteAnterior != request.CF_Fecha_limite)
                {
                    try
                    {
                        var seActualizoPrincipal = await _tareaFechaService.M_PUB_ActualizarFechaPrincipalSiEsNecesarioAsync(
                            id, 
                            request.CF_Fecha_limite, 
                            request.CN_Usuario_editor
                        );
                        
                        if (seActualizoPrincipal)
                        {
                            Console.WriteLine($"Se actualizó automáticamente la fecha de la tarea principal debido a cambio en subtarea #{id}");
                        }
                    }
                    catch (Exception ex)
                    {
                        // Loggear el error pero no fallar la actualización principal
                        Console.WriteLine($"Advertencia: No se pudo actualizar la fecha de la tarea principal: {ex.Message}");
                    }
                }

                // Si la tarea cambia a "En Proceso" (estado 3), poner otras tareas del mismo usuario en espera
                if (request.CN_Id_estado == 3 && estadoAnterior != 3)
                {
                    await PonerEnEsperaOtrasTareasEnProcesoAsync(tareaExistente, request.CN_Usuario_editor);
                }

                // Guardar cambio de estado en la bitácora si el estado cambió
                if (estadoAnterior != request.CN_Id_estado)
                {
                    var bitacora = new EBitacoraCambioEstado
                    {
                        CN_Id_tarea_permiso = tareaExistente.CN_Id_tarea,
                        CN_Id_tipo_documento = 1, // Ajusta según tu lógica
                        CN_Id_estado_anterior = estadoAnterior,
                        CN_Id_estado_nuevo = request.CN_Id_estado,
                        CF_Fecha_hora_cambio = DateTime.Now,
                        CN_Id_usuario_responsable = request.CN_Usuario_editor, // Usuario que edita
                        CT_Observaciones = null
                    };
                    await _bitacoraCambioEstadoService.M_PUB_RegistrarCambioEstadoAsync(bitacora);
                }

                return await F_PUB_ObtenerTareaPorId(id) ?? tareaExistente;
            }
            catch (Exception ex)
            {
                throw new Exception($"DB_ERROR: Error al actualizar la tarea: {ex.Message}", ex);
            }
        }

        private async Task ValidarRelaciones(ETareas tarea)
        {
            // Validar que exista la complejidad
            if (!await _context.T_Complejidades.AnyAsync(c => c.CN_Id_complejidad == tarea.CN_Id_complejidad))
            {
                throw new Exception("RELACION_ERROR: La complejidad especificada no existe.");
            }

            // Validar que exista el estado
            if (!await _context.T_Estados.AnyAsync(e => e.CN_Id_estado == tarea.CN_Id_estado))
            {
                throw new Exception("RELACION_ERROR: El estado especificado no existe.");
            }

            // Validar que exista la prioridad
            if (!await _context.T_Prioridades.AnyAsync(p => p.CN_Id_prioridad == tarea.CN_Id_prioridad))
            {
                throw new Exception("RELACION_ERROR: La prioridad especificada no existe.");
            }

            // Validar que exista el usuario creador
            if (!await _context.T_Usuarios.AnyAsync(u => u.CN_Id_usuario == tarea.CN_Usuario_creador))
            {
                throw new Exception("RELACION_ERROR: El usuario creador especificado no existe.");
            }

            // Validar que exista el usuario asignado, si se especificó
            if (tarea.CN_Usuario_asignado.HasValue &&
                !await _context.T_Usuarios.AnyAsync(u => u.CN_Id_usuario == tarea.CN_Usuario_asignado))
            {
                throw new Exception("RELACION_ERROR: El usuario asignado especificado no existe.");
            }

            // Validar que exista la tarea origen, si se especificó
            if (tarea.CN_Tarea_origen.HasValue &&
                !await _context.T_Tareas.AnyAsync(t => t.CN_Id_tarea == tarea.CN_Tarea_origen))
            {
                throw new Exception("RELACION_ERROR: La tarea origen especificada no existe.");
            }
        }

        private async Task ValidarRelacionesParaActualizacion(TareaUpdateRequest request)
        {
            // Validar que exista la complejidad
            if (!await _context.T_Complejidades.AnyAsync(c => c.CN_Id_complejidad == request.CN_Id_complejidad))
            {
                throw new Exception("RELACION_ERROR: La complejidad especificada no existe.");
            }

            // Validar que exista el estado
            if (!await _context.T_Estados.AnyAsync(e => e.CN_Id_estado == request.CN_Id_estado))
            {
                throw new Exception("RELACION_ERROR: El estado especificado no existe.");
            }

            // Validar que exista la prioridad
            if (!await _context.T_Prioridades.AnyAsync(p => p.CN_Id_prioridad == request.CN_Id_prioridad))
            {
                throw new Exception("RELACION_ERROR: La prioridad especificada no existe.");
            }
            // Validar que exista el usuario asignado solo si se especifica
            if (request.CN_Usuario_asignado.HasValue &&
                !await _context.T_Usuarios.AnyAsync(u => u.CN_Id_usuario == request.CN_Usuario_asignado))
            {
                throw new Exception("RELACION_ERROR: El usuario asignado especificado no existe.");
            }
        }

        public async Task M_PUB_EliminarTarea(int id)
        {
            try
            {
                var tareaExistente = await _context.T_Tareas
                    .FirstOrDefaultAsync(t => t.CN_Id_tarea == id);

                if (tareaExistente == null)
                {
                    throw new Exception("TAREA_NO_ENCONTRADA: La tarea especificada no existe.");
                }

                // Validar que no tenga subtareas asociadas
                var tieneSubtareas = await _context.T_Tareas
                    .AnyAsync(t => t.CN_Tarea_origen == id);

                if (tieneSubtareas)
                {
                    throw new Exception("SUBTAREAS_EXISTENTES: No se puede eliminar una tarea que tiene subtareas asociadas. Elimine primero las subtareas.");
                }

                _context.T_Tareas.Remove(tareaExistente);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw new Exception($"DB_ERROR: Error al eliminar la tarea: {ex.Message}", ex);
            }
        }

        public async Task<IEnumerable<ETareasSeguimiento>> F_PUB_ObtenerSeguimientosPorTarea(int tareaId)
        {
            return await _context.T_Tareas_Seguimiento
                .Where(s => s.CN_Id_tarea == tareaId)
                .OrderByDescending(s => s.CF_Fecha_seguimiento)
                .ToListAsync();
        }

        public async Task M_PUB_AgregarSeguimiento(ETareasSeguimiento seguimiento)
        {
            await _context.T_Tareas_Seguimiento.AddAsync(seguimiento);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<ETareasIncumplimiento>> F_PUB_ObtenerIncumplimientosPorTarea(int tareaId)
        {
            return await _context.T_Tareas_Incumplimientos
                .Where(i => i.CN_Id_tarea == tareaId)
                .OrderByDescending(i => i.CF_Fecha_incumplimiento)
                .ToListAsync();
        }

        public async Task M_PUB_AgregarIncumplimiento(ETareasIncumplimiento incumplimiento)
        {
            // Generar el ID automáticamente
            var maxId = await _context.T_Tareas_Incumplimientos.MaxAsync(i => (int?)i.CN_Id_tarea_incumplimiento) ?? 0;
            incumplimiento.CN_Id_tarea_incumplimiento = maxId + 1;
            incumplimiento.CF_Fecha_incumplimiento = DateTime.Now;
            await _context.T_Tareas_Incumplimientos.AddAsync(incumplimiento);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<ETareasJustificacionRechazo>> F_PUB_ObtenerRechazosPorTarea(int tareaId)
        {
            return await _context.T_Tareas_Justificacion_Rechazo
                .Where(r => r.CN_Id_tarea == tareaId)
                .OrderByDescending(r => r.CF_Fecha_hora_rechazo)
                .ToListAsync();
        }

        public async Task M_PUB_AgregarRechazo(ETareasJustificacionRechazo rechazo)
        {
            var maxId = await _context.T_Tareas_Justificacion_Rechazo.MaxAsync(i => (int?)i.CN_Id_tarea_rechazo) ?? 0;
            rechazo.CN_Id_tarea_rechazo = maxId + 1;
            rechazo.CF_Fecha_hora_rechazo = DateTime.Now;
            await _context.T_Tareas_Justificacion_Rechazo.AddAsync(rechazo);
            await _context.SaveChangesAsync();
        }
    }
}