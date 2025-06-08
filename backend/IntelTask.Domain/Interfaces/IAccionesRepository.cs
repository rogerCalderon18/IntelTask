using IntelTask.Domain.Entities;

namespace IntelTask.Domain.Interfaces
{
    public interface IAccionesRepository
    {
        Task<IEnumerable<EAcciones>> GetAllAccionesAsync();
        Task<EAcciones?> GetAccionByIdAsync(byte id);
        Task AddAccionAsync(EAcciones accion);
        Task UpdateAccionAsync(EAcciones accion);
    }
}
