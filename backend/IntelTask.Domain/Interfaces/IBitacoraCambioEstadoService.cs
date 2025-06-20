using System.Collections.Generic;
using System.Threading.Tasks;
using IntelTask.Domain.Entities;

namespace IntelTask.Domain.Interfaces
{
    public interface IBitacoraCambioEstadoService
    {
        Task M_PUB_RegistrarCambioEstadoAsync(EBitacoraCambioEstado bitacora);
        Task<IEnumerable<EBitacoraCambioEstado>> F_PUB_ObtenerPorTareaYTipoDocumentoAsync(int idTareaPermiso, int idTipoDocumento);
    }
}
