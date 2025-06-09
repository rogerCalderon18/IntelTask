
namespace IntelTask.API.Controllers;

using IntelTask.Domain.Interfaces;
using IntelTask.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class OficinasController : ControllerBase
{
    private readonly IOficinasRepository _oficinasRepository;

    public OficinasController(IOficinasRepository oficinasRepository)
    {
        _oficinasRepository = oficinasRepository;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<EOficinas>>> GetOficinas()
    {
        var oficinas = await _oficinasRepository.GetAllOficinasAsync();
        return Ok(oficinas);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<EOficinas>> GetOficina(int id)
    {
        var oficina = await _oficinasRepository.GetOficinaByIdAsync(id);
        if (oficina == null)
        {
            return NotFound();
        }
        return Ok(oficina);
    }

    [HttpPost]
    public async Task<ActionResult<EOficinas>> CreateOficina(EOficinas oficina)
    {
        if (oficina == null)
        {
            return BadRequest("Oficina no puede ser null.");
        }

        await _oficinasRepository.AddOficinaAsync(oficina);
        return CreatedAtAction(nameof(GetOficina), new { id = oficina.CN_Codigo_oficina }, oficina);
    }
   
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateOficina(int id, EOficinas oficina)
    {
        if (id != oficina.CN_Codigo_oficina)
        {
            return BadRequest("El ID de la oficina no coincide.");
        }

        var existingOficina = await _oficinasRepository.GetOficinaByIdAsync(id);
        if (existingOficina == null)
        {
            return NotFound();
        }

        await _oficinasRepository.UpdateOficinaAsync(oficina);
        return NoContent();
    }
}
