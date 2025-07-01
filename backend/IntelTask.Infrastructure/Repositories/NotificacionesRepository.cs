using IntelTask.Domain.Entities;
using IntelTask.Domain.Interfaces;
using IntelTask.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

namespace IntelTask.Infrastructure.Repositories
{
    public class NotificacionesRepository : INotificacionesRepository
    {
        private readonly IntelTaskDbContext _context;

        public NotificacionesRepository(IntelTaskDbContext context)
        {
            _context = context;
        }

        public async Task<int> F_PUB_ObtenerSiguienteIdNotificacion()
        {
            var maxId = await _context.T_Notificaciones
                .AsNoTracking()
                .MaxAsync(n => (int?)n.CN_Id_notificacion) ?? 0;
            
            return maxId + 1;
        }

        public async Task<int> M_PUB_CrearNotificacion(ENotificaciones notificacion)
        {
            // Si el ID no está establecido (es 0), obtener el siguiente ID disponible
            if (notificacion.CN_Id_notificacion == 0)
            {
                notificacion.CN_Id_notificacion = await F_PUB_ObtenerSiguienteIdNotificacion();
            }
            
            await _context.T_Notificaciones.AddAsync(notificacion);
            await _context.SaveChangesAsync();
            return notificacion.CN_Id_notificacion;
        }

        public async Task M_PUB_CrearNotificacionXUsuario(ENotificacionesXUsuarios notificacionXUsuario)
        {
            await _context.TI_Notificaciones_X_Usuarios.AddAsync(notificacionXUsuario);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<ENotificaciones>> F_PUB_ObtenerNotificacionesPorUsuario(int usuarioId)
        {
            return await _context.T_Notificaciones
                .Include(n => n.NotificacionesXUsuarios)
                .Where(n => n.NotificacionesXUsuarios.Any(nu => nu.CN_Id_usuario == usuarioId))
                .OrderByDescending(n => n.CF_Fecha_registro)
                .ToListAsync();
        }

        public async Task<ENotificaciones?> F_PUB_ObtenerNotificacionPorId(int notificacionId)
        {
            return await _context.T_Notificaciones
                .Include(n => n.NotificacionesXUsuarios)
                .ThenInclude(nu => nu.Usuario)
                .FirstOrDefaultAsync(n => n.CN_Id_notificacion == notificacionId);
        }

        public async Task<IEnumerable<ENotificaciones>> F_PUB_ObtenerTodasLasNotificaciones()
        {
            return await _context.T_Notificaciones
                .Include(n => n.NotificacionesXUsuarios)
                .ThenInclude(nu => nu.Usuario)
                .OrderByDescending(n => n.CF_Fecha_registro)
                .ToListAsync();
        }
    }
}
