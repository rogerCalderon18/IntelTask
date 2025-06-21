import React from "react";
import { Accordion, AccordionItem } from "@heroui/react";
import TareaContent from "./TareaContent";
import getColorClass from "../utils/getColorClass";

const TareaAccordion = ({ tareas, onEdit, onDelete, tipoSeccion }) => {
  return (
    <Accordion variant="splitted">
      {tareas.map((tarea) => (
        <AccordionItem
          key={tarea.id}
          aria-label={tarea.titulo}
          title={
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${getColorClass(tarea.prioridad)}`}></span>
              <span>{tarea.titulo}</span>
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
          />
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default TareaAccordion;