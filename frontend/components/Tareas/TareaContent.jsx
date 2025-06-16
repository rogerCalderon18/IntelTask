import React from "react";
import { FiPlusCircle, FiMoreHorizontal, FiEdit, FiTrash2 } from "react-icons/fi";
import SubTareaItem from "./SubTareaItem";

const TareaContent = ({ descripcion, fechaEntrega, subtareas, tarea, onEdit, onDelete }) => {
  
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

  return (
    <div className="p-4 border border-gray-100 rounded-md -mt-1">
      <p className="text-sm text-gray-700 mb-4">{descripcion}</p>

      {subtareas.length > 0 && (
        <div className="mb-4">
          {subtareas.map((subtarea) => (
            <SubTareaItem key={subtarea.id} titulo={subtarea.titulo} />
          ))}
        </div>
      )}

      <div className="flex justify-between items-center pt-3 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <FiPlusCircle className="text-gray-600 cursor-pointer hover:text-blue-500" />
          <FiMoreHorizontal className="text-gray-600 cursor-pointer hover:text-blue-500" />
          <FiEdit 
            className="text-gray-600 cursor-pointer hover:text-blue-500 transition-colors" 
            onClick={handleEditClick}
            title="Editar tarea"
          />
          <FiTrash2 
            className="text-gray-600 cursor-pointer hover:text-red-500 transition-colors" 
            onClick={handleDeleteClick}
            title="Eliminar tarea"
          />
        </div>
        <span className="text-xs text-gray-500">Fecha de entrega: {fechaEntrega}</span>
      </div>
    </div>
  );
};

export default TareaContent;