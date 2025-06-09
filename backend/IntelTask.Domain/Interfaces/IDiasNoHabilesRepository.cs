using IntelTask.Domain.Entities;

namespace IntelTask.Domain.Interfaces
{
    public interface IDiasNoHabilesRepository
    {
        Task<IEnumerable<EDiasNoHabiles>> GetAllDiasNoHabilesAsync();
        Task<EDiasNoHabiles?> GetDiaNoHabilByIdAsync(int id);
        Task AddDiaNoHabilAsync(EDiasNoHabiles diaNoHabil);
        Task UpdateDiaNoHabilAsync(EDiasNoHabiles diaNoHabil);

    }
}
