using IntelTask.Domain.Entities;
using IntelTask.Domain.Interfaces;
using IntelTask.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

namespace IntelTask.Infrastructure.Services
{
    public class TareaFechaService : ITareaFechaService
    {
        private readonly IntelTaskDbContext _context;
        private readonly IBitacoraCambioEstadoService _bitacoraCambioEstadoService;

        public TareaFechaService(IntelTaskDbContext context, IBitacoraCambioEstadoService bitacoraCambioEstadoService)
        {
            _context = context;
            _bitacoraCambioEstadoService = bitacoraCambioEstadoService;
        }

        public async Task<bool> M_PUB_ActualizarFechaPrincipalSiEsNecesarioAsync(int subtareaId, DateTime nuevaFechaLimite, int usuarioEditor)
        {
            try
            {
                // 1. Obtener la subtarea y verificar si tiene tarea principal
                var subtarea = await _context.T_Tareas
                    .Include(t => t.TareaOrigen)
                    .FirstOrDefaultAsync(t => t.CN_Id_tarea == subtareaId);

                if (subtarea?.CN_Tarea_origen == null)
                {
                    // No es una subtarea, no hay nada que hacer
                    return false;
                }

                // 2. Obtener la tarea principal
                var tareaPrincipal = await _context.T_Tareas
                    .FirstOrDefaultAsync(t => t.CN_Id_tarea == subtarea.CN_Tarea_origen);

                if (tareaPrincipal == null)
                {
                    throw new Exception("TAREA_PRINCIPAL_NO_ENCONTRADA: La tarea principal asociada no existe.");
                }

                // 3. Verificar si la nueva fecha de la subtarea supera la fecha de la tarea principal
                if (nuevaFechaLimite <= tareaPrincipal.CF_Fecha_limite)
                {
                    // No es necesario actualizar la tarea principal
                    return false;
                }

                // 4. Obtener todas las subtareas de la tarea principal (incluyendo la que se está modificando)
                var todasLasSubtareas = await F_PUB_ObtenerSubtareasAsync(tareaPrincipal.CN_Id_tarea);
                
                // Crear una lista temporal que incluya la fecha actualizada de la subtarea actual
                var subtareasConNuevaFecha = todasLasSubtareas.Select(s => 
                {
                    if (s.CN_Id_tarea == subtareaId)
                    {
                        s.CF_Fecha_limite = nuevaFechaLimite;
                    }
                    return s;
                }).ToList();

                // 5. Calcular la nueva fecha límite para la tarea principal
                var nuevaFechaPrincipal = F_PUB_CalcularNuevaFechaPrincipal(subtareasConNuevaFecha);

                // 6. Actualizar la tarea principal
                var fechaAnterior = tareaPrincipal.CF_Fecha_limite;
                tareaPrincipal.CF_Fecha_limite = nuevaFechaPrincipal;

                _context.Entry(tareaPrincipal).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                // 7. Registrar en bitácora el cambio automático
                var bitacora = new EBitacoraCambioEstado
                {
                    CN_Id_tarea_permiso = tareaPrincipal.CN_Id_tarea,
                    CN_Id_tipo_documento = 1,
                    CN_Id_estado_anterior = tareaPrincipal.CN_Id_estado,
                    CN_Id_estado_nuevo = tareaPrincipal.CN_Id_estado,
                    CF_Fecha_hora_cambio = DateTime.Now,
                    CN_Id_usuario_responsable = usuarioEditor,
                    CT_Observaciones = $"Fecha límite actualizada automáticamente de {fechaAnterior:dd/MM/yyyy HH:mm} a {nuevaFechaPrincipal:dd/MM/yyyy HH:mm} debido a cambio en subtarea #{subtareaId}"
                };
                await _bitacoraCambioEstadoService.M_PUB_RegistrarCambioEstadoAsync(bitacora);

                Console.WriteLine($"Fecha principal actualizada automáticamente: Tarea #{tareaPrincipal.CN_Id_tarea} de {fechaAnterior:dd/MM/yyyy HH:mm} a {nuevaFechaPrincipal:dd/MM/yyyy HH:mm}");
                
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al actualizar fecha principal: {ex.Message}");
                throw new Exception($"ERROR_ACTUALIZACION_FECHA_PRINCIPAL: {ex.Message}", ex);
            }
        }

        public async Task<IEnumerable<ETareas>> F_PUB_ObtenerSubtareasAsync(int tareaId)
        {
            return await _context.T_Tareas
                .Where(t => t.CN_Tarea_origen == tareaId)
                .ToListAsync();
        }

        public DateTime F_PUB_CalcularNuevaFechaPrincipal(IEnumerable<ETareas> subtareas, int bufferDias = 1)
        {
            if (!subtareas.Any())
            {
                // Si no hay subtareas, devolver una fecha por defecto
                return DateTime.Now.AddDays(7);
            }

            // Encontrar la fecha límite más tardía entre todas las subtareas
            var fechaMasTardia = subtareas.Max(s => s.CF_Fecha_limite);

            // Agregar el buffer de días (por defecto 1 día)
            var nuevaFechaPrincipal = fechaMasTardia.AddDays(bufferDias);

            // Asegurar que la nueva fecha sea al menos en horario laboral
            // Si cae en fin de semana, mover al siguiente lunes
            while (nuevaFechaPrincipal.DayOfWeek == DayOfWeek.Saturday || 
                   nuevaFechaPrincipal.DayOfWeek == DayOfWeek.Sunday)
            {
                nuevaFechaPrincipal = nuevaFechaPrincipal.AddDays(1);
            }

            // Ajustar la hora a las 4:30 PM (16:30) si está fuera del horario laboral
            if (nuevaFechaPrincipal.Hour < 7)
            {
                nuevaFechaPrincipal = nuevaFechaPrincipal.Date.AddHours(16).AddMinutes(30);
            }
            else if (nuevaFechaPrincipal.Hour > 16 || (nuevaFechaPrincipal.Hour == 16 && nuevaFechaPrincipal.Minute > 30))
            {
                nuevaFechaPrincipal = nuevaFechaPrincipal.Date.AddDays(1).AddHours(16).AddMinutes(30);
                
                // Verificar nuevamente si el día siguiente es fin de semana
                while (nuevaFechaPrincipal.DayOfWeek == DayOfWeek.Saturday || 
                       nuevaFechaPrincipal.DayOfWeek == DayOfWeek.Sunday)
                {
                    nuevaFechaPrincipal = nuevaFechaPrincipal.AddDays(1);
                }
            }

            return nuevaFechaPrincipal;
        }
    }
}
