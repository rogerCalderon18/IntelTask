
namespace IntelTask.API.Controllers;

using IntelTask.Domain.Interfaces;
using IntelTask.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class RolesController : ControllerBase
{
    private readonly IRolesRepository _rolesRepository;

    public RolesController(IRolesRepository rolesRepository)
    {
        _rolesRepository = rolesRepository;
    }    [HttpGet]
    public async Task<ActionResult<IEnumerable<ERoles>>> F_PUB_ObtenerRoles()
    {
        var roles = await _rolesRepository.F_PUB_ObtenerTodosLosRoles();
        return Ok(roles);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ERoles>> F_PUB_ObtenerRol(int id)
    {
        var rol = await _rolesRepository.F_PUB_ObtenerRolPorId(id);
        if (rol == null)
        {
            return NotFound();
        }
        return Ok(rol);
    }

    [HttpPost]
    public async Task<ActionResult<ERoles>> M_PUB_CrearRol(ERoles rol)
    {
        if (rol == null)
        {
            return BadRequest("Rol no puede ser null.");
        }

        await _rolesRepository.M_PUB_AgregarRol(rol);
        return CreatedAtAction(nameof(F_PUB_ObtenerRol), new { id = rol.CN_Id_rol }, rol);
    }
   
    [HttpPut("{id}")]
    public async Task<IActionResult> M_PUB_ActualizarRol(int id, ERoles rol)
    {
        if (id != rol.CN_Id_rol)
        {
            return BadRequest("El ID del rol no coincide.");
        }

        var existingRol = await _rolesRepository.F_PUB_ObtenerRolPorId(id);
        if (existingRol == null)
        {
            return NotFound();
        }        await _rolesRepository.M_PUB_ActualizarRol(rol);
        return NoContent();
    }
}
