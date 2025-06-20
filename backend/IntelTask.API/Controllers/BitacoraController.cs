using IntelTask.Domain.Entities;
using IntelTask.Domain.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IntelTask.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BitacoraController : ControllerBase
    {
        private readonly IBitacoraCambioEstadoService _bitacoraService;

        public BitacoraController(IBitacoraCambioEstadoService bitacoraService)
        {
            _bitacoraService = bitacoraService;
        }

        [HttpGet("tarea/{idTareaPermiso}/tipo-documento/{idTipoDocumento}")]
        public async Task<ActionResult<IEnumerable<EBitacoraCambioEstado>>> GetBitacoraPorTareaYTipoDocumento(int idTareaPermiso, int idTipoDocumento)
        {
            var result = await _bitacoraService.F_PUB_ObtenerPorTareaYTipoDocumentoAsync(idTareaPermiso, idTipoDocumento);
            return Ok(result);
        }
    }
}
