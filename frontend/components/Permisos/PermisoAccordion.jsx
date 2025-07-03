import React from "react";
import { Accordion, AccordionItem, Tooltip } from "@heroui/react";
import PermisoContent from "./PermisoContent";

const PermisoAccordion = ({ permisos, onEdit, onDelete, tipoSeccion, currentUserId }) => {
  // Función para obtener el nombre del estado
  const obtenerNombreEstado = (estadoId) => {
    const estados = {
      1: "Registrado",
      2: "Aprobado", 
      15: "Rechazado"
    };
    return estados[estadoId] || `Estado ${estadoId}`;
  };

  // Función para obtener el color del badge del estado
  const obtenerEstiloEstado = (estadoId) => {
    const estilos = {
      1: "bg-gray-100 text-gray-700 border-gray-300",      // Registrado
      2: "bg-green-100 text-green-700 border-green-300",   // Aprobado
      15: "bg-red-100 text-red-600 border-red-300",        // Rechazado
    };
    return estilos[estadoId] || "bg-gray-100 text-gray-600 border-gray-300";
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
    <Accordion variant="splitted">
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
                <div className="flex items-center gap-3 flex-1">
                  <Tooltip content={urgencia.tooltip}>
                    <span className={`w-3 h-3 rounded-full ${urgencia.color}`}></span>
                  </Tooltip>
                  <div className="flex-1">
                    <div className="font-medium truncate">
                      {permiso.cT_Titulo_permiso || permiso.titulo || 'Sin título'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatearFecha(permiso.cF_Fecha_hora_inicio_permiso || permiso.fechaInicio)} - {formatearFecha(permiso.cF_Fecha_hora_fin_permiso || permiso.fechaFin)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Tooltip content={obtenerNombreEstado(estadoId)}>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${obtenerEstiloEstado(estadoId)}`}>
                      {obtenerNombreEstado(estadoId)}
                    </span>
                  </Tooltip>
                </div>
              </div>
            }
            className="shadow-xl"
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
