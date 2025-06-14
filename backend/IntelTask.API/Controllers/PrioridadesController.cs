
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
    }    [HttpGet]
    public async Task<ActionResult<IEnumerable<EPrioridades>>> F_PUB_ObtenerPrioridades()
    {
        var prioridades = await _prioridadesRepository.F_PUB_ObtenerTodasLasPrioridades();
        return Ok(prioridades);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<EPrioridades>> F_PUB_ObtenerPrioridad(byte id)
    {
        var prioridad = await _prioridadesRepository.F_PUB_ObtenerPrioridadPorId(id);
        if (prioridad == null)
        {
            return NotFound();
        }
        return Ok(prioridad);
    }

    [HttpPost]
    public async Task<ActionResult<EPrioridades>> M_PUB_CrearPrioridad(EPrioridades prioridad)
    {
        if (prioridad == null)
        {
            return BadRequest("Prioridad no puede ser null.");
        }

        await _prioridadesRepository.M_PUB_AgregarPrioridad(prioridad);
        return CreatedAtAction(nameof(F_PUB_ObtenerPrioridad), new { id = prioridad.CN_Id_prioridad }, prioridad);
    }
   
    [HttpPut("{id}")]
    public async Task<IActionResult> M_PUB_ActualizarPrioridad(byte id, EPrioridades prioridad)
    {
        if (id != prioridad.CN_Id_prioridad)
        {
            return BadRequest("El ID de la prioridad no coincide.");
        }

        var existingPrioridad = await _prioridadesRepository.F_PUB_ObtenerPrioridadPorId(id);
        if (existingPrioridad == null)
        {
            return NotFound();
        }        await _prioridadesRepository.M_PUB_ActualizarPrioridad(prioridad);
        return NoContent();
    }
}
