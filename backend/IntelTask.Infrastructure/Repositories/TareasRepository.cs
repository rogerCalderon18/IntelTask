using IntelTask.Domain.Entities;
using IntelTask.Domain.Interfaces;
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
                throw new Exception("DB_ERROR: Error al crear la tarea en la base de datos.", ex);
            }
        }

        public async Task M_PUB_ActualizarTarea(ETareas tarea)
        {
            var existingTarea = await _context.T_Tareas.FindAsync(tarea.CN_Id_tarea);
            if (existingTarea != null)
            {
                try
                {
                    // Verificar si existen las relaciones
                    await ValidarRelaciones(tarea);
                    
                    // Actualizar solo las propiedades que no son navegación
                    _context.Entry(existingTarea).State = EntityState.Detached;
                    _context.Entry(tarea).State = EntityState.Modified;
                    
                    await _context.SaveChangesAsync();
                }
                catch (Exception ex)
                {
                    throw new Exception("DB_ERROR: Error al actualizar la tarea en la base de datos.", ex);
                }
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
    }
}
