using IntelTask.Domain.Entities;

namespace IntelTask.Domain.Interfaces
{
    public interface INotificacionesRepository
    {
        Task<int> F_PUB_ObtenerSiguienteIdNotificacion();
        Task<int> M_PUB_CrearNotificacion(ENotificaciones notificacion);
        Task M_PUB_CrearNotificacionXUsuario(ENotificacionesXUsuarios notificacionXUsuario);
        Task<IEnumerable<ENotificaciones>> F_PUB_ObtenerNotificacionesPorUsuario(int usuarioId);
        Task<ENotificaciones?> F_PUB_ObtenerNotificacionPorId(int notificacionId);
        Task<IEnumerable<ENotificaciones>> F_PUB_ObtenerTodasLasNotificaciones();
        Task<bool> F_PUB_ExisteNotificacionReciente(int usuarioId, string tipoNotificacion, string tituloContiene, int horasAtras = 24);
    }
}
