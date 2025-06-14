
namespace IntelTask.API.Controllers;

using IntelTask.Domain.Interfaces;
using IntelTask.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class DiasNoHabilesController : ControllerBase
{
    private readonly IDiasNoHabilesRepository _diasNoHabilesRepository;

    public DiasNoHabilesController(IDiasNoHabilesRepository diasNoHabilesRepository)
    {
        _diasNoHabilesRepository = diasNoHabilesRepository;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<EDiasNoHabiles>>> F_PUB_ObtenerDiasNoHabiles()
    {
        var diasNoHabiles = await _diasNoHabilesRepository.F_PUB_ObtenerTodosLosDiasNoHabiles();
        return Ok(diasNoHabiles);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<EDiasNoHabiles>> F_PUB_ObtenerDiaNoHabil(int id)
    {
        var diaNoHabil = await _diasNoHabilesRepository.F_PUB_ObtenerDiaNoHabilPorId(id);
        if (diaNoHabil == null)
        {
            return NotFound();
        }
        return Ok(diaNoHabil);
    }

    [HttpPost]
    public async Task<ActionResult<EDiasNoHabiles>> M_PUB_CrearDiaNoHabil(EDiasNoHabiles diaNoHabil)
    {
        if (diaNoHabil == null)
        {
            return BadRequest("Día no hábil no puede ser null.");
        }

        await _diasNoHabilesRepository.M_PUB_AgregarDiaNoHabil(diaNoHabil);
        return CreatedAtAction(nameof(F_PUB_ObtenerDiaNoHabil), new { id = diaNoHabil.CN_Id_dias_no_habiles }, diaNoHabil);
    }
   
    [HttpPut("{id}")]
    public async Task<IActionResult> M_PUB_ActualizarDiaNoHabil(int id, EDiasNoHabiles diaNoHabil)
    {
        if (id != diaNoHabil.CN_Id_dias_no_habiles)
        {
            return BadRequest("El ID del día no hábil no coincide.");
        }

        var existingDiaNoHabil = await _diasNoHabilesRepository.F_PUB_ObtenerDiaNoHabilPorId(id);
        if (existingDiaNoHabil == null)
        {
            return NotFound();
        }

        await _diasNoHabilesRepository.M_PUB_ActualizarDiaNoHabil(diaNoHabil);
        return NoContent();
    }
}
