
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
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ERoles>>> GetRoles()
    {
        var roles = await _rolesRepository.GetAllRolesAsync();
        return Ok(roles);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ERoles>> GetRol(int id)
    {
        var rol = await _rolesRepository.GetRolByIdAsync(id);
        if (rol == null)
        {
            return NotFound();
        }
        return Ok(rol);
    }

    [HttpPost]
    public async Task<ActionResult<ERoles>> CreateRol(ERoles rol)
    {
        if (rol == null)
        {
            return BadRequest("Rol no puede ser null.");
        }

        await _rolesRepository.AddRolAsync(rol);
        return CreatedAtAction(nameof(GetRol), new { id = rol.CN_Id_rol }, rol);
    }
   
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateRol(int id, ERoles rol)
    {
        if (id != rol.CN_Id_rol)
        {
            return BadRequest("El ID del rol no coincide.");
        }

        var existingRol = await _rolesRepository.GetRolByIdAsync(id);
        if (existingRol == null)
        {
            return NotFound();
        }

        await _rolesRepository.UpdateRolAsync(rol);
        return NoContent();
    }
}
