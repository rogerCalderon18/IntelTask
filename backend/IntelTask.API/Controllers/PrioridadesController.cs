
namespace IntelTask.API.Controllers;

using IntelTask.Domain.Interfaces;
using IntelTask.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class PrioridadesController : ControllerBase
{
    private readonly IPrioridadesRepository _prioridadesRepository;

    public PrioridadesController(IPrioridadesRepository prioridadesRepository)
    {
        _prioridadesRepository = prioridadesRepository;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<EPrioridades>>> GetPrioridades()
    {
        var prioridades = await _prioridadesRepository.GetAllPrioridadesAsync();
        return Ok(prioridades);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<EPrioridades>> GetPrioridad(byte id)
    {
        var prioridad = await _prioridadesRepository.GetPrioridadByIdAsync(id);
        if (prioridad == null)
        {
            return NotFound();
        }
        return Ok(prioridad);
    }

    [HttpPost]
    public async Task<ActionResult<EPrioridades>> CreatePrioridad(EPrioridades prioridad)
    {
        if (prioridad == null)
        {
            return BadRequest("Prioridad no puede ser null.");
        }

        await _prioridadesRepository.AddPrioridadAsync(prioridad);
        return CreatedAtAction(nameof(GetPrioridad), new { id = prioridad.CN_Id_prioridad }, prioridad);
    }
   
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePrioridad(byte id, EPrioridades prioridad)
    {
        if (id != prioridad.CN_Id_prioridad)
        {
            return BadRequest("El ID de la prioridad no coincide.");
        }

        var existingPrioridad = await _prioridadesRepository.GetPrioridadByIdAsync(id);
        if (existingPrioridad == null)
        {
            return NotFound();
        }

        await _prioridadesRepository.UpdatePrioridadAsync(prioridad);
        return NoContent();
    }
}
