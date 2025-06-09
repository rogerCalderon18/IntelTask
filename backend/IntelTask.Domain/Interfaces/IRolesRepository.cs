using IntelTask.Domain.Entities;

namespace IntelTask.Domain.Interfaces
{
    public interface IRolesRepository
    {
        Task<IEnumerable<ERoles>> GetAllRolesAsync();
        Task<ERoles?> GetRolByIdAsync(int id);
        Task AddRolAsync(ERoles rol);
        Task UpdateRolAsync(ERoles rol);
    }
}
