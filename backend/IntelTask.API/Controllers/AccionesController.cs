
namespace IntelTask.API.Controllers;

using IntelTask.Domain.Interfaces;
using IntelTask.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class AccionesController : ControllerBase
{
    private readonly IAccionesRepository _accionesRepository;

    public AccionesController(IAccionesRepository accionesRepository)
    {
        _accionesRepository = accionesRepository;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<EAcciones>>> GetAcciones()
    {
        var acciones = await _accionesRepository.GetAllAccionesAsync();
        return Ok(acciones);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<EAcciones>> GetAccion(int id)
    {
        var accion = await _accionesRepository.GetAccionByIdAsync(id);
        if (accion == null)
        {
            return NotFound();
        }
        return Ok(accion);
    }

    [HttpPost]
    public async Task<ActionResult<EAcciones>> CreateAccion(EAcciones accion)
    {
        if (accion == null)
        {
            return BadRequest("Accion no puede ser null.");
        }

        await _accionesRepository.AddAccionAsync(accion);
        return CreatedAtAction(nameof(GetAccion), new { id = accion.CN_Id_accion }, accion);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateAccion(int id, EAcciones accion)
    {
        if (id != accion.CN_Id_accion)
        {
            return BadRequest("El ID de la acción no coincide.");
        }

        var existingAccion = await _accionesRepository.GetAccionByIdAsync(id);
        if (existingAccion == null)
        {
            return NotFound();
        }

        await _accionesRepository.UpdateAccionAsync(accion);
        return NoContent();
    }
}
