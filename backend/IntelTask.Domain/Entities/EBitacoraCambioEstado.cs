using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IntelTask.Domain.Entities
{
    public class EBitacoraCambioEstado
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CN_Id_cambio_estado { get; set; }
        public int CN_Id_tarea_permiso { get; set; }
        public int CN_Id_tipo_documento { get; set; }
        public byte CN_Id_estado_anterior { get; set; }
        public byte CN_Id_estado_nuevo { get; set; }
        public DateTime CF_Fecha_hora_cambio { get; set; }
        public int CN_Id_usuario_responsable { get; set; }
        public string? CT_Observaciones { get; set; }

        // Relaciones de navegación
        [ForeignKey("CN_Id_tarea_permiso")]
        public virtual ETareas? Tarea { get; set; }

        [ForeignKey("CN_Id_usuario_responsable")]
        public virtual EUsuarios? UsuarioResponsable { get; set; }

        [ForeignKey("CN_Id_estado_anterior")]
        public virtual EEstados? EstadoAnterior { get; set; }

        [ForeignKey("CN_Id_estado_nuevo")]
        public virtual EEstados? EstadoNuevo { get; set; }

        [ForeignKey("CN_Id_tipo_documento")]
        public virtual ETiposDocumentos? TipoDocumento { get; set; }

    }
}
