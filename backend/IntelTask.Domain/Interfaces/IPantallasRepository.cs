using IntelTask.Domain.Entities;

namespace IntelTask.Domain.Interfaces
{
    public interface IPantallasRepository
    {
        Task<IEnumerable<EPantallas>> F_PUB_ObtenerTodasLasPantallas();
        Task<EPantallas?> F_PUB_ObtenerPantallaPorId(int id);
        Task M_PUB_AgregarPantalla(EPantallas pantalla);
        Task M_PUB_ActualizarPantalla(EPantallas pantalla);
    }
}
