using IntelTask.Domain.Entities;
using IntelTask.Domain.Interfaces;
using IntelTask.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

namespace IntelTask.Infrastructure.Repositories
{
    public class PantallasRepository : IPantallasRepository
    {
        private readonly IntelTaskDbContext _context;

        public PantallasRepository(IntelTaskDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<EPantallas>> GetAllPantallasAsync()
        {
            return await _context.T_Pantallas.ToListAsync();
        }

        public async Task<EPantallas?> GetPantallaByIdAsync(int id)
        {
            return await _context.T_Pantallas.FindAsync(id);
        }

        public async Task AddPantallaAsync(EPantallas pantalla)
        {
            await _context.T_Pantallas.AddAsync(pantalla);
            await _context.SaveChangesAsync();
        }

        public async Task UpdatePantallaAsync(EPantallas pantalla)
        {
            var existingPantalla = await _context.T_Pantallas.FindAsync(pantalla.CN_Id_pantalla);
            if (existingPantalla != null)
            {
                existingPantalla.CT_Descripcion = pantalla.CT_Descripcion;
                await _context.SaveChangesAsync();
            }
        }
    }
}
