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

        public TareasRepository(IntelTaskDbContext context)
        {
            _context = context;
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
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al agregar tarea: {ex.Message}");
                throw new Exception("DB_ERROR: Error al crear la tarea en la base de datos.", ex);
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

                // Actualizar solo los campos permitidos
                tareaExistente.CT_Titulo_tarea = request.CT_Titulo_tarea;
                tareaExistente.CT_Descripcion_tarea = request.CT_Descripcion_tarea;
                tareaExistente.CN_Id_complejidad = request.CN_Id_complejidad;
                tareaExistente.CN_Id_prioridad = request.CN_Id_prioridad;
                tareaExistente.CN_Id_estado = request.CN_Id_estado;
                tareaExistente.CF_Fecha_limite = request.CF_Fecha_limite;
                tareaExistente.CN_Numero_GIS = request.CN_Numero_GIS;                tareaExistente.CN_Usuario_asignado = request.CN_Usuario_asignado;

                // Si el estado es completado y no tiene fecha de finalización, establecerla
                if (request.CN_Id_estado == 1 && tareaExistente.CF_Fecha_finalizacion == null)
                {
                    tareaExistente.CF_Fecha_finalizacion = DateTime.Now;
                }

                _context.Entry(tareaExistente).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                // Devolver la tarea actualizada con todas las relaciones cargadas
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
    }
}