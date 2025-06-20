using Microsoft.AspNetCore.Mvc;
using IntelTask.Domain.Entities;
using IntelTask.Domain.Interfaces;
using System.Threading.Tasks;

namespace IntelTask.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TipoDocumentoController : ControllerBase
    {
        private readonly ITipoDocumentoRepository _repo;

        public TipoDocumentoController(ITipoDocumentoRepository repo)
        {
            _repo = repo;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ETiposDocumentos>> GetById(int id)
        {
            var tipo = await _repo.F_PUB_ObtenerTipoDocumentoPorId(id);
            if (tipo == null) return NotFound();
            return Ok(tipo);
        }

        [HttpGet]
        public async Task<ActionResult> GetAll()
        {
            var tipos = await _repo.F_PUB_ObtenerTodosLosTiposDocumento();
            return Ok(tipos);
        }

        [HttpPost]
        public async Task<ActionResult> Create([FromBody] ETiposDocumentos tipo)
        {
            await _repo.M_PUB_AgregarTipoDocumento(tipo);
            return CreatedAtAction(nameof(GetById), new { id = tipo.CN_Id_tipo_documento }, tipo);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Update(int id, [FromBody] ETiposDocumentos tipo)
        {
            if (id != tipo.CN_Id_tipo_documento) return BadRequest();
            await _repo.M_PUB_ActualizarTipoDocumento(tipo);
            return NoContent();
        }
    }
}