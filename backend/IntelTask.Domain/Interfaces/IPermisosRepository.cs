using IntelTask.Domain.Entities;
using IntelTask.Domain.DTOs;

namespace IntelTask.Domain.Interfaces
{
    public interface IPermisosRepository
    {
        Task<IEnumerable<EPermisos>> F_PUB_ObtenerTodosLosPermisos();
        Task<IEnumerable<EPermisos>> F_PUB_ObtenerPermisosPorUsuario(int usuarioId);
        Task<EPermisos?> F_PUB_ObtenerPermisoPorId(int id);
        Task M_PUB_AgregarPermiso(EPermisos permiso);
        Task<EPermisos> M_PUB_ActualizarPermiso(int id, PermisoUpdateRequest request);
        Task M_PUB_EliminarPermiso(int id);
    }
}
