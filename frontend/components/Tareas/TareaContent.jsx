import React, { useState } from "react";
import { FiPlusCircle, FiMoreHorizontal, FiEdit, FiTrash2, FiEye } from "react-icons/fi";
import { useDisclosure } from "@heroui/react";
import SubTareaItem from "./SubTareaItem";
import SubtareasManager from "./SubtareasManager";
import DetalleModal from "./DetalleModal";

// Ahora recibimos tipoSeccion y restriccionesAcciones como props
const TareaContent = ({ descripcion, fechaEntrega, subtareas, tarea, onEdit, onDelete, tipoSeccion, restriccionesAcciones = {} }) => {
  const [subtareasActuales, setSubtareasActuales] = useState(subtareas || []);
  const { isOpen: isDetalleOpen, onOpen: onDetalleOpen, onOpenChange: onDetalleOpenChange } = useDisclosure();

  console.log("restriccionesAcciones", restriccionesAcciones, "tipoSeccion", tipoSeccion, tarea);

  const handleSubtareasChange = (nuevasSubtareas) => {
    setSubtareasActuales(nuevasSubtareas);
  };

  const handleEditClick = () => {
    if (onEdit && tarea) {
      onEdit(tarea);
    }
  };

  const handleDeleteClick = () => {
    if (onDelete && tarea) {
      onDelete(tarea);
    }
  };

  const handleDetalleClick = () => {
    onDetalleOpen();
  };
  const handleEditFromDetalle = () => {
    if (onEdit) {
      onEdit(tarea);
    }
  };

  return (
    <div className="p-4 border border-gray-100 rounded-md -mt-1">
      <p className="text-sm text-gray-700 mb-4">{descripcion}</p>

      {/* Gestor de subtareas */}
      <SubtareasManager 
        tareaId={tarea?.cN_Id_tarea || tarea?.id} 
        tareaPadre={tarea}
        tipoSeccion={tipoSeccion}
        onSubtareasChange={handleSubtareasChange}
      />
      <div className="flex justify-between items-center pt-3 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <FiEye 
            className="text-gray-600 cursor-pointer hover:text-blue-500 transition-colors" 
            onClick={handleDetalleClick}
            title="Ver detalle"
          />
          {/* Mostrar el icono de editar solo si está permitido */}
          {restriccionesAcciones.editar && (
            <FiEdit 
              className="text-gray-600 cursor-pointer hover:text-blue-500 transition-colors" 
              onClick={handleEditClick}
              title="Editar tarea"
            />
          )}
          {/* Mostrar el icono de eliminar solo si está permitido */}
          {restriccionesAcciones.eliminar && (
            <FiTrash2 
              className="text-gray-600 cursor-pointer hover:text-red-500 transition-colors" 
              onClick={handleDeleteClick}
              title="Eliminar tarea"
            />
          )}
        </div>
        <span className="text-xs text-gray-500">Fecha de entrega: {fechaEntrega}</span>
      </div>

      {/* Modal de detalle */}
      <DetalleModal 
        isOpen={isDetalleOpen}
        onOpenChange={onDetalleOpenChange}
        onClose={() => onDetalleOpenChange(false)}
        tarea={tarea}
        onEdit={handleEditFromDetalle}
        esSubtarea={false}
      />
    </div>
  );
};

export default TareaContent;