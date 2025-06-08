using IntelTask.Domain.Entities;

namespace IntelTask.Domain.Interfaces
{
    public interface IEstadosRepository
    {
        Task<IEnumerable<EEstados>> GetAllEstadosAsync();
        Task<EEstados?> GetEstadoByIdAsync(byte id);
        Task AddEstadoAsync(EEstados estado);
        Task UpdateEstadoAsync(EEstados estado);
    }
}
