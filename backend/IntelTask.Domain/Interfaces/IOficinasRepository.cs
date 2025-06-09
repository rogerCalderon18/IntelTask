using IntelTask.Domain.Entities;

namespace IntelTask.Domain.Interfaces
{
    public interface IOficinasRepository
    {
        Task<IEnumerable<EOficinas>> GetAllOficinasAsync();
        Task<EOficinas?> GetOficinaByIdAsync(int id);
        Task AddOficinaAsync(EOficinas oficina);
        Task UpdateOficinaAsync(EOficinas oficina);
    }

}
