using IntelTask.Domain.Entities;

namespace IntelTask.Domain.Interfaces
{
    public interface IComplejidadesRepository
    {
        Task<IEnumerable<EComplejidades>> GetAllComplejidadesAsync();
        Task<EComplejidades?> GetComplejidadByIdAsync(byte id);
        Task AddComplejidadAsync(EComplejidades complejidad);
        Task UpdateComplejidadAsync(EComplejidades complejidad);
    }
}
