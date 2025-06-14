using IntelTask.Domain.Entities;
using IntelTask.Domain.Interfaces;
using IntelTask.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

namespace IntelTask.Infrastructure.Repositories
{    public class RolesRepository : IRolesRepository
    {
        private readonly IntelTaskDbContext _context;

        public RolesRepository(IntelTaskDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ERoles>> F_PUB_ObtenerTodosLosRoles()
        {
            return await _context.T_Roles.ToListAsync();
        }

        public async Task<ERoles?> F_PUB_ObtenerRolPorId(int id)
        {
            return await _context.T_Roles.FindAsync(id);
        }

        public async Task M_PUB_AgregarRol(ERoles rol)
        {
            await _context.T_Roles.AddAsync(rol);
            await _context.SaveChangesAsync();
        }

        public async Task M_PUB_ActualizarRol(ERoles rol)
        {
            var existingRole = await _context.T_Roles.FindAsync(rol.CN_Id_rol);
            if (existingRole != null)
            {
                existingRole.CT_Nombre_rol = rol.CT_Nombre_rol;
                existingRole.CN_Jerarquia = rol.CN_Jerarquia;
                await _context.SaveChangesAsync();
            }
        }
    }
}
