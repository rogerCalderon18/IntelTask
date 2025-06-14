using IntelTask.Domain.Entities;
using IntelTask.Domain.Interfaces;
using IntelTask.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;
using System.Threading.Tasks;

namespace IntelTask.Infrastructure.Repositories
{
    public class UsuariosRepository : IUsuariosRepository
    {
        private readonly IntelTaskDbContext _context;

        public UsuariosRepository(IntelTaskDbContext context)
        {
            _context = context;
        }

        public async Task M_PUB_CrearUsuario(EUsuarios usuario)
        {
            usuario.CT_Contrasenna = BCrypt.Net.BCrypt.HashPassword(usuario.CT_Contrasenna);
            await _context.T_Usuarios.AddAsync(usuario);
            await _context.SaveChangesAsync();
        }

        public async Task<EUsuarios?> F_PUB_ObtenerUsuarioPorCorreo(string correo)
        {
            return await _context.T_Usuarios.FirstOrDefaultAsync(u => u.CT_Correo_usuario == correo);
        }

        public async Task<EUsuarios?> F_PUB_ObtenerUsuarioPorId(int id)
        {
            return await _context.T_Usuarios.FindAsync(id);
        }

        public async Task<IEnumerable<EUsuarios>> F_PUB_ObtenerTodosLosUsuarios()
        {
            return await _context.T_Usuarios.ToListAsync();
        }

        public async Task M_PUB_ActualizarUsuario(EUsuarios usuario)
        {
            var existingUsuario = await _context.T_Usuarios.FindAsync(usuario.CN_Id_usuario);
            if (existingUsuario != null)
            {
                existingUsuario.CT_Nombre_usuario = usuario.CT_Nombre_usuario;
                existingUsuario.CT_Correo_usuario = usuario.CT_Correo_usuario;
                existingUsuario.CF_Fecha_nacimiento = usuario.CF_Fecha_nacimiento;
                existingUsuario.CB_Estado_usuario = usuario.CB_Estado_usuario;
                existingUsuario.CF_Fecha_modificacion_usuario = DateTime.Now;
                existingUsuario.CN_Id_rol = usuario.CN_Id_rol;
                
                if (!string.IsNullOrEmpty(usuario.CT_Contrasenna))
                {
                    existingUsuario.CT_Contrasenna = BCrypt.Net.BCrypt.HashPassword(usuario.CT_Contrasenna);
                }
                
                await _context.SaveChangesAsync();
            }
        }
    }
}