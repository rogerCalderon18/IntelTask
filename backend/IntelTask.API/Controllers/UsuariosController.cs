using IntelTask.Domain.Entities;
using IntelTask.Domain.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace IntelTask.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsuariosController : ControllerBase
    {
        private readonly IUsuariosRepository _usuariosRepository;

        public UsuariosController(IUsuariosRepository usuariosRepository)
        {
            _usuariosRepository = usuariosRepository;
        }

        [HttpPost]
        public async Task<ActionResult> M_PUB_CrearUsuario([FromBody] EUsuarios usuario)
        {
            await _usuariosRepository.M_PUB_CrearUsuario(usuario);
            return Ok("Usuario creado exitosamente");
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<EUsuarios>> F_PUB_ObtenerUsuario(int id)
        {
            var usuario = await _usuariosRepository.F_PUB_ObtenerUsuarioPorId(id);
            if (usuario == null)
                return NotFound("Usuario no encontrado");

            return Ok(usuario);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<EUsuarios>>> F_PUB_ObtenerUsuarios()
        {
            var usuarios = await _usuariosRepository.F_PUB_ObtenerTodosLosUsuarios();
            return Ok(usuarios);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> M_PUB_ActualizarUsuario(int id, [FromBody] EUsuarios usuario)
        {
            if (id != usuario.CN_Id_usuario)
                return BadRequest("El ID del usuario no coincide");

            var usuarioExistente = await _usuariosRepository.F_PUB_ObtenerUsuarioPorId(id);
            if (usuarioExistente == null)
                return NotFound("Usuario no encontrado");

            await _usuariosRepository.M_PUB_ActualizarUsuario(usuario);
            return Ok("Usuario actualizado exitosamente");
        }

        [HttpGet("asignables/{id}")]
        public async Task<ActionResult<IEnumerable<EUsuarios>>> F_PUB_ObtenerUsuariosAsignables(int id)
        {
            var usuarios = await _usuariosRepository.F_PUB_ObtenerUsuariosAsignables(id);
            return Ok(usuarios);
        }
    }
}