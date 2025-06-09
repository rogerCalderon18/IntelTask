
namespace IntelTask.API.Controllers;

using IntelTask.Domain.Interfaces;
using IntelTask.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class PantallasController : ControllerBase
{
    private readonly IPantallasRepository _pantallasRepository;

    public PantallasController(IPantallasRepository pantallasRepository)
    {
        _pantallasRepository = pantallasRepository;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<EPantallas>>> GetPantallas()
    {
        var acciones = await _pantallasRepository.GetAllPantallasAsync();
        return Ok(acciones);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<EPantallas>> GetPantalla(int id)
    {
        var pantalla = await _pantallasRepository.GetPantallaByIdAsync(id);
        if (pantalla == null)
        {
            return NotFound();
        }
        return Ok(pantalla);
    }

    [HttpPost]
    public async Task<ActionResult<EPantallas>> CreatePantalla(EPantallas pantalla)
    {
        if (pantalla == null)
        {
            return BadRequest("Pantalla no puede ser null.");
        }

        await _pantallasRepository.AddPantallaAsync(pantalla);
        return CreatedAtAction(nameof(GetPantalla), new { id = pantalla.CN_Id_pantalla }, pantalla);
    }
   
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePantalla(int id, EPantallas pantalla)
    {
        if (id != pantalla.CN_Id_pantalla)
        {
            return BadRequest("El ID de la pantalla no coincide.");
        }

        var existingPantalla = await _pantallasRepository.GetPantallaByIdAsync(id);
        if (existingPantalla == null)
        {
            return NotFound();
        }

        await _pantallasRepository.UpdatePantallaAsync(pantalla);
        return NoContent();
    }
}
