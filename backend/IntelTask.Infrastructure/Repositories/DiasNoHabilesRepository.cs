using IntelTask.Domain.Entities;
using IntelTask.Domain.Interfaces;
using IntelTask.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

namespace IntelTask.Infrastructure.Repositories
{
    public class DiasNoHabilesRepository : IDiasNoHabilesRepository
    {
        private readonly IntelTaskDbContext _context;

        public DiasNoHabilesRepository(IntelTaskDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<EDiasNoHabiles>> GetAllDiasNoHabilesAsync()
        {
            return await _context.T_Dias_No_Habiles.ToListAsync();
        }

        public async Task<EDiasNoHabiles?> GetDiaNoHabilByIdAsync(int id)
        {
            return await _context.T_Dias_No_Habiles.FindAsync(id);
        }

        public async Task AddDiaNoHabilAsync(EDiasNoHabiles diaNoHabil)
        {
            await _context.T_Dias_No_Habiles.AddAsync(diaNoHabil);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateDiaNoHabilAsync(EDiasNoHabiles diaNoHabil)
        {
            var existingDiasNoHabil = await _context.T_Dias_No_Habiles.FindAsync(diaNoHabil.CN_Id_dias_no_habiles);
            if (existingDiasNoHabil != null)
            {
                existingDiasNoHabil.CF_Fecha_inicio = diaNoHabil.CF_Fecha_inicio;
                existingDiasNoHabil.CF_Fecha_fin = diaNoHabil.CF_Fecha_fin;
                existingDiasNoHabil.CT_Descripcion = diaNoHabil.CT_Descripcion;
                existingDiasNoHabil.CB_Activo = diaNoHabil.CB_Activo;

                await _context.SaveChangesAsync();
            }
        }
    }
    
}
