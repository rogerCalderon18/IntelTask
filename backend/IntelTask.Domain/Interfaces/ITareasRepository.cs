using IntelTask.Domain.Entities;

namespace IntelTask.Domain.Interfaces
{
    public interface ITareasRepository
    {
        Task<IEnumerable<ETareas>> F_PUB_ObtenerTodasLasTareas();
        Task<ETareas?> F_PUB_ObtenerTareaPorId(int id);
        Task M_PUB_AgregarTarea(ETareas tarea);
        Task M_PUB_ActualizarTarea(ETareas tarea);
    }
}
