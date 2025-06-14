using IntelTask.Domain.Entities;

namespace IntelTask.Domain.Interfaces
{
    public interface IPrioridadesRepository
    {
        Task<IEnumerable<EPrioridades>> F_PUB_ObtenerTodasLasPrioridades();
        Task<EPrioridades?> F_PUB_ObtenerPrioridadPorId(byte id);
        Task M_PUB_AgregarPrioridad(EPrioridades prioridad);
        Task M_PUB_ActualizarPrioridad(EPrioridades prioridad);
    }
}
