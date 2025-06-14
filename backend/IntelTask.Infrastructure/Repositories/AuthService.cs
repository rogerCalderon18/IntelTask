using IntelTask.Domain.Entities;
using IntelTask.Domain.Interfaces;
using IntelTask.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

namespace IntelTask.Infrastructure.Repositories
{
    public class AuthService : IAuthService
    {
        private readonly IntelTaskDbContext _context;

        public AuthService(IntelTaskDbContext context)
        {
            _context = context;
        }
        
        public async Task<EUsuarios?> F_PUB_ValidarCredenciales(string correo, string contrasenna)
        {
            var usuario = await _context.T_Usuarios.FirstOrDefaultAsync(u => u.CT_Correo_usuario == correo);

            // Verificar si el usuario existe y la contraseña es válida usando BCrypt
            if (usuario != null && BCrypt.Net.BCrypt.Verify(contrasenna, usuario.CT_Contrasenna))
            {
                return usuario; // Devuelve el usuario si las credenciales son válidas
            }

            return null; // Credenciales inválidas
        }
    }
}