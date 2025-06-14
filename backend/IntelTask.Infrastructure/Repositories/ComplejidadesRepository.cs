using IntelTask.Domain.Entities;
using IntelTask.Domain.Interfaces;
using IntelTask.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

namespace IntelTask.Infrastructure.Repositories
{
    public class ComplejidadesRepository : IComplejidadesRepository
    {
        private readonly IntelTaskDbContext _context;

        public ComplejidadesRepository(IntelTaskDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<EComplejidades>> F_PUB_ObtenerTodasLasComplejidades()
        {
            return await _context.T_Complejidades.ToListAsync();
        }

        public async Task<EComplejidades?> F_PUB_ObtenerComplejidadPorId(byte id)
        {
            return await _context.T_Complejidades.FindAsync(id);
        }

        public async Task M_PUB_AgregarComplejidad(EComplejidades complejidad)
        {
            await _context.T_Complejidades.AddAsync(complejidad);
            await _context.SaveChangesAsync();
        }

        public async Task M_PUB_ActualizarComplejidad(EComplejidades complejidad)
        {
            var existingComplejidad = await _context.T_Complejidades.FindAsync(complejidad.CN_Id_complejidad);
            if (existingComplejidad != null)
            {
                existingComplejidad.CT_Nombre = complejidad.CT_Nombre;
                await _context.SaveChangesAsync();
            }
        }
    }
}
