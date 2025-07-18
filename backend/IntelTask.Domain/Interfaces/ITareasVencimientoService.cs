using IntelTask.Domain.Entities;

namespace IntelTask.Domain.Interfaces
{
    public interface ITareasVencimientoService
    {
        Task VerificarYNotificarTareasVencidas();
        Task<IEnumerable<ETareas>> F_PUB_ObtenerTareasVencidas();
        Task<IEnumerable<ETareas>> F_PUB_ObtenerTareasParaRecordatorio();
    }
}
