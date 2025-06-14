using System.Threading.Tasks;
using IntelTask.Domain.Entities;

namespace IntelTask.Domain.Interfaces
{
    public interface IAuthService
    {
        Task<EUsuarios?> F_PUB_ValidarCredenciales(string correo, string contrasenna);
    }
}