using IntelTask.Domain.Entities;

namespace IntelTask.Domain.Interfaces
{
    public interface IAccionesRepository
    {
        Task<IEnumerable<EAcciones>> F_PUB_ObtenerTodasLasAcciones();
        Task<EAcciones?> F_PUB_ObtenerAccionPorId(int id);
        Task M_PUB_AgregarAccion(EAcciones accion);
        Task M_PUB_ActualizarAccion(EAcciones accion);
    }
}
