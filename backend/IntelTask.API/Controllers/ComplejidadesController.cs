
namespace IntelTask.API.Controllers;

using IntelTask.Domain.Interfaces;
using IntelTask.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class ComplejidadesController : ControllerBase
{
    private readonly IComplejidadesRepository _complejidadesRepository;

    public ComplejidadesController(IComplejidadesRepository complejidadesRepository)
    {
        _complejidadesRepository = complejidadesRepository;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<EComplejidades>>> F_PUB_ObtenerComplejidades()
    {
        var complejidades = await _complejidadesRepository.F_PUB_ObtenerTodasLasComplejidades();
        return Ok(complejidades);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<EComplejidades>> F_PUB_ObtenerComplejidad(byte id)
    {
        var complejidad = await _complejidadesRepository.F_PUB_ObtenerComplejidadPorId(id);
        if (complejidad == null)
        {
            return NotFound();
        }
        return Ok(complejidad);
    }    [HttpPost]
    public async Task<ActionResult<EComplejidades>> M_PUB_CrearComplejidad(EComplejidades complejidad)
    {
        if (complejidad == null)
        {
            return BadRequest("Complejidad no puede ser null.");
        }

        await _complejidadesRepository.M_PUB_AgregarComplejidad(complejidad);
        return CreatedAtAction(nameof(F_PUB_ObtenerComplejidad), new { id = complejidad.CN_Id_complejidad }, complejidad);
    }
   
    [HttpPut("{id}")]
    public async Task<IActionResult> M_PUB_ActualizarComplejidad(byte id, EComplejidades complejidad)
    {
        if (id != complejidad.CN_Id_complejidad)
        {
            return BadRequest("El ID de la complejidad no coincide.");
        }

        var existingComplejidad = await _complejidadesRepository.F_PUB_ObtenerComplejidadPorId(id);
        if (existingComplejidad == null)
        {
            return NotFound();
        }

        await _complejidadesRepository.M_PUB_ActualizarComplejidad(complejidad);
        return NoContent();
    }
}
