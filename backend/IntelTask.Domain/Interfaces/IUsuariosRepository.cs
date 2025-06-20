using IntelTask.Domain.Entities;

namespace IntelTask.Domain.Interfaces
{
    public interface IUsuariosRepository
    {
        Task M_PUB_CrearUsuario(EUsuarios usuario);
        Task<EUsuarios?> F_PUB_ObtenerUsuarioPorCorreo(string correo);
        Task<EUsuarios?> F_PUB_ObtenerUsuarioPorId(int id);
        Task<IEnumerable<EUsuarios>> F_PUB_ObtenerTodosLosUsuarios();
        Task M_PUB_ActualizarUsuario(EUsuarios usuario);
        Task<List<EUsuarios>> F_PUB_ObtenerUsuariosAsignables(int idUsuario);
    }
}