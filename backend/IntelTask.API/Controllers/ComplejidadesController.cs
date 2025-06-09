
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
    public async Task<ActionResult<IEnumerable<EComplejidades>>> GetComplejidades()
    {
        var complejidades = await _complejidadesRepository.GetAllComplejidadesAsync();
        return Ok(complejidades);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<EComplejidades>> GetComplejidad(byte id)
    {
        var complejidad = await _complejidadesRepository.GetComplejidadByIdAsync(id);
        if (complejidad == null)
        {
            return NotFound();
        }
        return Ok(complejidad);
    }

    [HttpPost]
    public async Task<ActionResult<EComplejidades>> CreateComplejidad(EComplejidades complejidad)
    {
        if (complejidad == null)
        {
            return BadRequest("Complejidad no puede ser null.");
        }

        await _complejidadesRepository.AddComplejidadAsync(complejidad);
        return CreatedAtAction(nameof(GetComplejidad), new { id = complejidad.CN_Id_complejidad }, complejidad);
    }
   
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateComplejidad(byte id, EComplejidades complejidad)
    {
        if (id != complejidad.CN_Id_complejidad)
        {
            return BadRequest("El ID de la complejidad no coincide.");
        }

        var existingComplejidad = await _complejidadesRepository.GetComplejidadByIdAsync(id);
        if (existingComplejidad == null)
        {
            return NotFound();
        }

        await _complejidadesRepository.UpdateComplejidadAsync(complejidad);
        return NoContent();
    }
}
