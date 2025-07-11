using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace IntelTask.Domain.Entities
{
    public class EUsuarios
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CN_Id_usuario { get; set; }
        public string CT_Nombre_usuario { get; set; } = string.Empty;
        public string CT_Correo_usuario { get; set; } = string.Empty;
        public DateTime? CF_Fecha_nacimiento { get; set; }
        public string CT_Contrasenna { get; set; } = string.Empty;
        public bool CB_Estado_usuario { get; set; }
        public DateTime CF_Fecha_creacion_usuario { get; set; }
        public DateTime? CF_Fecha_modificacion_usuario { get; set; }
        public required int CN_Id_rol { get; set; }

        // Relación de navegación
        [ForeignKey("CN_Id_rol")]
        public virtual required ERoles Rol { get; set; }

        // Propiedad computada para el frontend
        [NotMapped]
        [JsonPropertyName("cT_Nombre_rol")]
        public string CT_Nombre_rol => Rol?.CT_Nombre_rol ?? string.Empty;
    }
}