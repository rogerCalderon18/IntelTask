using IntelTask.Domain.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace IntelTask.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<ActionResult> F_PUB_Login([FromBody] LoginRequest request)
        {
            var usuario = await _authService.F_PUB_ValidarCredenciales(request.cT_Correo_usuario, request.cT_Contrasenna);
            if (usuario == null)
                return Unauthorized(new { message = "Credenciales inválidas" });

            return Ok(new
            {
                CN_Id_usuario = usuario.CN_Id_usuario,
                CT_Nombre_usuario = usuario.CT_Nombre_usuario,
                CT_Correo_usuario = usuario.CT_Correo_usuario,
                CN_Id_rol = usuario.CN_Id_rol
            });
        }

        public class LoginRequest
        {
            public required string cT_Correo_usuario { get; set; }
            public required string cT_Contrasenna { get; set; }
        }
    }

}