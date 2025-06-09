
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
    public async Task<ActionResult<IEnumerable<EDiasNoHabiles>>> GetDiasNoHabiles()
    {
        var diasNoHabiles = await _diasNoHabilesRepository.GetAllDiasNoHabilesAsync();
        return Ok(diasNoHabiles);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<EDiasNoHabiles>> GetDiaNoHabil(int id)
    {
        var diaNoHabil = await _diasNoHabilesRepository.GetDiaNoHabilByIdAsync(id);
        if (diaNoHabil == null)
        {
            return NotFound();
        }
        return Ok(diaNoHabil);
    }

    [HttpPost]
    public async Task<ActionResult<EDiasNoHabiles>> CreateDiaNoHabil(EDiasNoHabiles diaNoHabil)
    {
        if (diaNoHabil == null)
        {
            return BadRequest("Complejidad no puede ser null.");
        }

        await _diasNoHabilesRepository.AddDiaNoHabilAsync(diaNoHabil);
        return CreatedAtAction(nameof(GetDiaNoHabil), new { id = diaNoHabil.CN_Id_dias_no_habiles }, diaNoHabil);
    }
   
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateDiaNoHabil(int id, EDiasNoHabiles diaNoHabil)
    {
        if (id != diaNoHabil.CN_Id_dias_no_habiles)
        {
            return BadRequest("El ID de la complejidad no coincide.");
        }

        var existingDiaNoHabil = await _diasNoHabilesRepository.GetDiaNoHabilByIdAsync(id);
        if (existingDiaNoHabil == null)
        {
            return NotFound();
        }

        await _diasNoHabilesRepository.UpdateDiaNoHabilAsync(diaNoHabil);
        return NoContent();
    }
}
