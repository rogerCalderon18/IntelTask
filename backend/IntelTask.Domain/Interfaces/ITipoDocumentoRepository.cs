using IntelTask.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IntelTask.Domain.Interfaces
{
    public interface ITipoDocumentoRepository
    {
        Task<IEnumerable<ETiposDocumentos>> F_PUB_ObtenerTodosLosTiposDocumento();
        Task<ETiposDocumentos?> F_PUB_ObtenerTipoDocumentoPorId(int id);
        Task M_PUB_AgregarTipoDocumento(ETiposDocumentos tipoDocumento);
        Task M_PUB_ActualizarTipoDocumento(ETiposDocumentos tipoDocumento);
    }
}
