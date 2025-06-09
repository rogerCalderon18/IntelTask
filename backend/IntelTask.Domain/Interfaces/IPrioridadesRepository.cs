using IntelTask.Domain.Entities;

namespace IntelTask.Domain.Interfaces
{
    public interface IPrioridadesRepository
    {
        Task<IEnumerable<EPrioridades>> GetAllPrioridadesAsync();
        Task<EPrioridades?> GetPrioridadByIdAsync(byte id);
        Task AddPrioridadAsync(EPrioridades prioridad);
        Task UpdatePrioridadAsync(EPrioridades prioridad);
    }
}
