using IntelTask.Domain.Entities;

namespace IntelTask.Domain.Interfaces
{
    public interface IPantallasRepository
    {
        Task<IEnumerable<EPantallas>> GetAllPantallasAsync();
        Task<EPantallas?> GetPantallaByIdAsync(int id);
        Task AddPantallaAsync(EPantallas pantalla);
        Task UpdatePantallaAsync(EPantallas pantalla);
    }
}
