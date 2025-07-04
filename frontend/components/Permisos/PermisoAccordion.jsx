import React from "react";
import { Accordion, AccordionItem, Tooltip, Chip } from "@heroui/react";
import { FiCalendar, FiClock, FiUser, FiFileText } from "react-icons/fi";
import PermisoContent from "./PermisoContent";

const PermisoAccordion = ({ permisos, onEdit, onDelete, tipoSeccion, currentUserId }) => {
  // Función para obtener el nombre del estado
  const obtenerNombreEstado = (estadoId) => {
    const estados = {
      1: "Registrado",
      6: "Aprobado", 
      15: "Rechazado"
    };
    return estados[estadoId] || `Estado ${estadoId}`;
  };

  console.log("Permisos:", permisos);

  // Función para obtener el color del chip del estado
  const obtenerColorEstado = (estadoId) => {
    const colores = {
      1: "default",      // Registrado
      6: "success",      // Aprobado
      15: "danger",      // Rechazado
    };
    return colores[estadoId] || "default";
  };

  // Función para obtener el indicador de urgencia basado en las fechas
  const obtenerUrgencia = (fechaInicio, fechaFin) => {
    const hoy = new Date();
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    
    // Si ya comenzó o está por comenzar (menos de 7 días)
    const diasParaInicio = Math.ceil((inicio - hoy) / (1000 * 60 * 60 * 24));
    
    if (hoy >= inicio && hoy <= fin) {
      return { color: "bg-yellow-500", tooltip: "Permiso activo" };
    } else if (diasParaInicio <= 7 && diasParaInicio > 0) {
      return { color: "bg-orange-500", tooltip: "Próximo a iniciar" };
    } else if (diasParaInicio <= 0) {
      return { color: "bg-red-500", tooltip: "Vencido o finalizado" };
    }
    
    return { color: "bg-blue-500", tooltip: "Programado" };
  };

  // Función para formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Accordion 
      variant="splitted"
      selectionMode="multiple"
      className="px-2 gap-4 py-5"
      itemClasses={{
        base: "bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300",
        title: "font-medium text-gray-800",
        trigger: "px-6 py-4 rounded-2xl transition-colors",
        content: "px-6 pb-6",
      }}
    >
      {permisos.map((permiso) => {
        const urgencia = obtenerUrgencia(
          permiso.cF_Fecha_hora_inicio_permiso || permiso.fechaInicio,
          permiso.cF_Fecha_hora_fin_permiso || permiso.fechaFin
        );
        const estadoId = permiso.cN_Id_estado || permiso.estado;

        return (
          <AccordionItem
            key={permiso.id || permiso.cN_Id_permiso}
            aria-label={permiso.titulo || permiso.cT_Titulo_permiso}
            title={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4 flex-1">
                  <Tooltip content={urgencia.tooltip} placement="top">
                    <span className={`w-3 h-3 rounded-full ${urgencia.color}`}></span>
                  </Tooltip>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800 truncate text-lg mb-1">
                      {permiso.cT_Titulo_permiso || permiso.titulo || 'Sin título'}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <FiCalendar className="w-3 h-3" />
                        <span>{formatearFecha(permiso.cF_Fecha_hora_inicio_permiso || permiso.fechaInicio)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiClock className="w-3 h-3" />
                        <span>{formatearFecha(permiso.cF_Fecha_hora_fin_permiso || permiso.fechaFin)}</span>
                      </div>
                      {tipoSeccion === "solicitudes" && (
                        <div className="flex items-center gap-1">
                          <FiUser className="w-3 h-3" />
                          <span>{permiso.usuarioCreador?.cT_Nombre_usuario || 'Usuario desconocido'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Estado mejorado */}
                <div className="flex items-center gap-3">
                  <Chip
                    color={obtenerColorEstado(estadoId)}
                    variant="flat"
                    size="sm"
                    className="font-medium"
                  >
                    {obtenerNombreEstado(estadoId)}
                  </Chip>
                </div>
              </div>
            }
          >
            <PermisoContent
              permiso={permiso}
              onEdit={onEdit}
              onDelete={onDelete}
              tipoSeccion={tipoSeccion}
              currentUserId={currentUserId}
            />
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};

export default PermisoAccordion;
