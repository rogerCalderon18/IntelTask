using IntelTask.Domain.DTOs;
using IntelTask.Domain.Entities;

namespace IntelTask.Domain.Interfaces
{
    public interface INotificacionesService
    {
        Task<int> M_PUB_GuardarNotificacion(NotificacionEmailRequest request, int? usuarioId = null);
        Task<IEnumerable<ENotificaciones>> F_PUB_ObtenerHistorialNotificaciones(int usuarioId);
        Task<IEnumerable<ENotificaciones>> F_PUB_ObtenerTodasLasNotificaciones();
        Task<int> M_PUB_GuardarYEnviarNotificacion(NotificacionEmailRequest request, int? usuarioId = null);
        Task<bool> F_PUB_ExisteNotificacionRecienteParaTarea(int usuarioId, int tareaId, string tipoNotificacion, int horasAtras = 24);
    }
}
