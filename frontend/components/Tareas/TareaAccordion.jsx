import React from "react";
import { Accordion, AccordionItem, Tooltip } from "@heroui/react";
import TareaContent from "./TareaContent";
import getColorClass from "../utils/getColorClass";

const TareaAccordion = ({ tareas, onEdit, onDelete, tipoSeccion }) => {
  // Función para obtener el nombre del estado
  const obtenerNombreEstado = (estadoId) => {
    const estados = {
      1: "Registrado",
      2: "Asignado", 
      3: "En Proceso",
      4: "En Espera",
      5: "Terminado",
      14: "Incumplido",
      15: "Rechazado",
      17: "En Revisión"
    };
    return estados[estadoId] || `Estado ${estadoId}`;
  };

  // Función para obtener el color del badge del estado
  const obtenerEstiloEstado = (estadoId) => {
    const estilos = {
      1: "bg-gray-100 text-gray-700 border-gray-300",      // Registrado
      2: "bg-blue-100 text-blue-700 border-blue-300",      // Asignado
      3: "bg-yellow-100 text-yellow-700 border-yellow-300", // En Proceso
      4: "bg-orange-100 text-orange-700 border-orange-300", // En Espera
      5: "bg-green-100 text-green-700 border-green-300",    // Terminado
      14: "bg-red-100 text-red-700 border-red-300",         // Incumplido
      15: "bg-red-100 text-red-600 border-red-300",         // Rechazado
      17: "bg-purple-100 text-purple-700 border-purple-300" // En Revisión
    };
    return estilos[estadoId] || "bg-gray-100 text-gray-600 border-gray-300";
  };

  return (
    <Accordion variant="splitted">
      {tareas.map((tarea) => (
        <AccordionItem
          key={tarea.id}
          aria-label={tarea.titulo}
          title={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 flex-1">
                <span className={`w-3 h-3 rounded-full ${getColorClass(tarea.prioridad)}`}></span>
                <span className="flex-1 truncate">{tarea.titulo}</span>
              </div>
              <Tooltip 
                content={`${obtenerNombreEstado(tarea.estado || tarea.cN_Id_estado)}`}
                placement="top"
              >
                <span 
                  className={`text-xs font-medium px-2 py-1 rounded-md border cursor-help ml-2 ${obtenerEstiloEstado(tarea.estado || tarea.cN_Id_estado)}`}
                >
                  {obtenerNombreEstado(tarea.estado || tarea.cN_Id_estado)}
                </span>
              </Tooltip>
            </div>
          }
        >
          <TareaContent
            descripcion={tarea.descripcion}
            fechaEntrega={tarea.fechaEntrega}
            subtareas={tarea.subtareas}
            tarea={tarea}
            onEdit={onEdit}
            onDelete={onDelete}
            tipoSeccion={tipoSeccion}
            restriccionesAcciones={tarea.restriccionesAcciones}
          />
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default TareaAccordion;