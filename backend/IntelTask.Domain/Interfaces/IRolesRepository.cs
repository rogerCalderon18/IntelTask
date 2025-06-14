using IntelTask.Domain.Entities;

namespace IntelTask.Domain.Interfaces
{
    public interface IRolesRepository
    {
        Task<IEnumerable<ERoles>> F_PUB_ObtenerTodosLosRoles();
        Task<ERoles?> F_PUB_ObtenerRolPorId(int id);
        Task M_PUB_AgregarRol(ERoles rol);
        Task M_PUB_ActualizarRol(ERoles rol);
    }
}
