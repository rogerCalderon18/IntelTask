using IntelTask.Domain.Entities;

namespace IntelTask.Domain.Interfaces
{
    public interface IEstadosRepository
    {
        Task<IEnumerable<EEstados>> F_PUB_ObtenerTodosLosEstados();
        Task<EEstados?> F_PUB_ObtenerEstadoPorId(byte id);
        Task M_PUB_AgregarEstado(EEstados estado);
        Task M_PUB_ActualizarEstado(EEstados estado);
    }
}
