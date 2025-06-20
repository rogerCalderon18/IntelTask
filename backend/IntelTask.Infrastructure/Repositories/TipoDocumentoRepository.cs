using IntelTask.Domain.Entities;
using IntelTask.Domain.Interfaces;
using IntelTask.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

namespace IntelTask.Infrastructure.Repositories
{
    public class TipoDocumentoRepository : ITipoDocumentoRepository
    {
        private readonly IntelTaskDbContext _context;
        public TipoDocumentoRepository(IntelTaskDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ETiposDocumentos>> F_PUB_ObtenerTodosLosTiposDocumento()
        {
            return await _context.T_Tipos_documentos.ToListAsync();
        }

        public async Task<ETiposDocumentos?> F_PUB_ObtenerTipoDocumentoPorId(int id)
        {
            return await _context.T_Tipos_documentos.FirstOrDefaultAsync(t => t.CN_Id_tipo_documento == id);
        }

        public async Task M_PUB_AgregarTipoDocumento(ETiposDocumentos tipoDocumento)
        {
            await _context.T_Tipos_documentos.AddAsync(tipoDocumento);
            await _context.SaveChangesAsync();
        }

        public async Task M_PUB_ActualizarTipoDocumento(ETiposDocumentos tipoDocumento)
        {
            _context.T_Tipos_documentos.Update(tipoDocumento);
            await _context.SaveChangesAsync();
        }
    }
}
