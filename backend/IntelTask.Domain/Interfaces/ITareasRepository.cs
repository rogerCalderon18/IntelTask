using IntelTask.Domain.Entities;
using IntelTask.Domain.DTOs;

namespace IntelTask.Domain.Interfaces
{
    public interface ITareasRepository
    {
        Task<IEnumerable<ETareas>> F_PUB_ObtenerTodasLasTareas();
        Task<ETareas?> F_PUB_ObtenerTareaPorId(int id);
        Task M_PUB_AgregarTarea(ETareas tarea);
        Task<ETareas> M_PUB_ActualizarTarea(int id, TareaUpdateRequest request);
    }
}
