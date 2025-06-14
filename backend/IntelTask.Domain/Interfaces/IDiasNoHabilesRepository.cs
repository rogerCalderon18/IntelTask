using IntelTask.Domain.Entities;

namespace IntelTask.Domain.Interfaces
{
    public interface IDiasNoHabilesRepository
    {
        Task<IEnumerable<EDiasNoHabiles>> F_PUB_ObtenerTodosLosDiasNoHabiles();
        Task<EDiasNoHabiles?> F_PUB_ObtenerDiaNoHabilPorId(int id);
        Task M_PUB_AgregarDiaNoHabil(EDiasNoHabiles diaNoHabil);
        Task M_PUB_ActualizarDiaNoHabil(EDiasNoHabiles diaNoHabil);

    }
}
