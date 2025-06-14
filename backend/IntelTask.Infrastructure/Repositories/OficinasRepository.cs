using IntelTask.Domain.Entities;
using IntelTask.Domain.Interfaces;
using IntelTask.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

namespace IntelTask.Infrastructure.Repositories
{
    public class OficinasRepository : IOficinasRepository
    {
        private readonly IntelTaskDbContext _context;

        public OficinasRepository(IntelTaskDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<EOficinas>> F_PUB_ObtenerTodasLasOficinas()
        {
            return await _context.T_Oficinas.ToListAsync();
        }

        public async Task<EOficinas?> F_PUB_ObtenerOficinaPorId(int id)
        {
            return await _context.T_Oficinas.FindAsync(id);
        }

        public async Task M_PUB_AgregarOficina(EOficinas oficina)
        {
            await _context.T_Oficinas.AddAsync(oficina);
            await _context.SaveChangesAsync();
        }

        public async Task M_PUB_ActualizarOficina(EOficinas oficina)
        {
            var existingOficina = await _context.T_Oficinas.FindAsync(oficina.CN_Codigo_oficina);
            if (existingOficina != null)
            {
                existingOficina.CT_Nombre_oficina = oficina.CT_Nombre_oficina;
                existingOficina.CN_Oficina_encargada = oficina.CN_Oficina_encargada;
                await _context.SaveChangesAsync();
            }
        }
    }
    
}
