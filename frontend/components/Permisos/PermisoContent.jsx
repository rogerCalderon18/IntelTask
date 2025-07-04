import React, { useState } from "react";
import { Button, Chip, Divider, Tooltip, useDisclosure } from "@heroui/react";
import { FiEdit2, FiTrash2, FiCalendar, FiUser, FiClock, FiFileText } from "react-icons/fi";
import GestorAdjuntosPermisos from "./GestorAdjuntosPermisos";

const PermisoContent = ({ permiso, onEdit, onDelete, tipoSeccion, currentUserId }) => {
  const [expandirDescripcion, setExpandirDescripcion] = useState(false);
  const { isOpen: isAdjuntosOpen, onOpen: onAdjuntosOpen, onOpenChange: onAdjuntosOpenChange } = useDisclosure();

  // Función para formatear fecha y hora
  const formatearFechaHora = (fecha) => {
    if (!fecha) return '';
    return new Date(fecha).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Función para calcular duración del permiso
  const calcularDuracion = (fechaInicio, fechaFin) => {
    if (!fechaInicio || !fechaFin) return '';
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diferencia = fin - inicio;
    const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24));
    
    if (dias === 1) return '1 día';
    if (dias < 1) return 'Menos de 1 día';
    return `${dias} días`;
  };

  // Función para obtener el color del estado
  const obtenerColorEstado = (estadoId) => {
    const colores = {
      1: "default",     // Registrado
      2: "success",     // Aprobado
      15: "danger",     // Rechazado
    };
    return colores[estadoId] || "default";
  };

  // Función para obtener el nombre del estado
  const obtenerNombreEstado = (estadoId) => {
    const estados = {
      1: "Registrado",
      2: "Aprobado",
      15: "Rechazado"
    };
    return estados[estadoId] || `Estado ${estadoId}`;
  };

  // Verificar si el usuario puede editar
  const puedeEditar = () => {
    const esCreador = (permiso.cN_Usuario_creador || permiso.usuarioCreador) === currentUserId;
    const estadoActual = permiso.cN_Id_estado || permiso.estado;
    
    if (tipoSeccion === "misSolicitudes") {
      // En mis solicitudes, solo puedo editar si soy el creador y está en estado registrado
      return esCreador && estadoActual === 1;
    } else if (tipoSeccion === "solicitudes") {
      // En solicitudes para revisar, puedo editar (aprobar/rechazar) si está en estado registrado
      return estadoActual === 1;
    }
    
    return false;
  };

  // Verificar si el usuario puede eliminar
  const puedeEliminar = () => {
    const esCreador = (permiso.cN_Usuario_creador || permiso.usuarioCreador) === currentUserId;
    const estadoActual = permiso.cN_Id_estado || permiso.estado;
    
    // Solo el creador puede eliminar y solo si está en estado registrado
    return tipoSeccion === "misSolicitudes" && esCreador && estadoActual === 1;
  };

  const descripcion = permiso.cT_Descripcion_permiso || permiso.descripcion || '';
  const mostrarBotonExpandir = descripcion.length > 150;
  const descripcionMostrada = expandirDescripcion ? descripcion : descripcion.substring(0, 150);

  return (
    <div className="space-y-6 p-1">
      {/* Información Principal con diseño mejorado */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Fechas del Permiso */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-700 mb-3">
            <FiCalendar className="w-5 h-5" />
            <span>Período del Permiso</span>
          </div>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <span className="font-medium text-green-600">Inicio:</span>
              <span>{formatearFechaHora(permiso.cF_Fecha_hora_inicio_permiso || permiso.fechaInicio)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-red-600">Fin:</span>
              <span>{formatearFechaHora(permiso.cF_Fecha_hora_fin_permiso || permiso.fechaFin)}</span>
            </div>
          </div>
        </div>

        {/* Duración */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
          <div className="flex items-center gap-2 text-sm font-semibold text-purple-700 mb-3">
            <FiClock className="w-5 h-5" />
            <span>Duración</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {calcularDuracion(
              permiso.cF_Fecha_hora_inicio_permiso || permiso.fechaInicio,
              permiso.cF_Fecha_hora_fin_permiso || permiso.fechaFin
            )}
          </div>
        </div>

        {/* Usuario Creador */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
          <div className="flex items-center gap-2 text-sm font-semibold text-green-700 mb-3">
            <FiUser className="w-5 h-5" />
            <span>Solicitante</span>
          </div>
          <div className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
              <span className="text-green-700 font-bold text-xs">
                {(permiso.usuarioCreador?.cT_Nombre_usuario || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
            <span>{permiso.usuarioCreador?.cT_Nombre_usuario || 'Usuario desconocido'}</span>
          </div>
        </div>

        {/* Estado */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-100">
          <div className="flex items-center gap-2 text-sm font-semibold text-yellow-700 mb-3">
            <span>Estado Actual</span>
          </div>
          <div className="flex items-center gap-2">
            <Chip
              color={obtenerColorEstado(permiso.cN_Id_estado || permiso.estado)}
              variant="flat"
              size="md"
              className="font-semibold"
            >
              {obtenerNombreEstado(permiso.cN_Id_estado || permiso.estado)}
            </Chip>
          </div>
        </div>
      </div>

      <Divider className="my-6" />

      {/* Descripción mejorada */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-100">
        <div className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
          <FiFileText className="w-5 h-5 text-blue-600" />
          <span>Descripción del Permiso</span>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <p className="text-gray-700 leading-relaxed">
            {descripcionMostrada}
            {mostrarBotonExpandir && !expandirDescripcion && '...'}
          </p>
          {mostrarBotonExpandir && (
            <button
              onClick={() => setExpandirDescripcion(!expandirDescripcion)}
              className="mt-3 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
            >
              {expandirDescripcion ? 'Ver menos' : 'Ver más'}
            </button>
          )}
        </div>
      </div>

      {/* Motivo de rechazo mejorado */}
      {(permiso.cN_Id_estado || permiso.estado) === 15 && (permiso.cT_Descripcion_rechazo || permiso.descripcionRechazo) && (
        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6 border border-red-200">
          <div className="flex items-center gap-2 text-lg font-semibold text-red-700 mb-3">
            <span>Motivo de Rechazo</span>
          </div>
          <div className="bg-white rounded-lg p-4 border-l-4 border-red-500 shadow-sm">
            <p className="text-red-700 leading-relaxed">
              {permiso.cT_Descripcion_rechazo || permiso.descripcionRechazo}
            </p>
          </div>
        </div>
      )}

      <Divider className="my-6" />

      {/* Acciones mejoradas */}
      <div className="flex flex-wrap gap-3 justify-end bg-gray-50 rounded-xl p-4">
        {/* Botón de Adjuntos */}
        <Button
          size="md"
          variant="flat"
          color="default"
          onPress={onAdjuntosOpen}
          className="bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
          startContent={<span className="text-lg">📎</span>}
        >
          Adjuntos
        </Button>

        {/* Botón de Editar */}
        {puedeEditar() && (
          <Tooltip content={tipoSeccion === "solicitudes" ? "Aprobar/Rechazar permiso" : "Editar permiso"}>
            <Button
              size="md"
              color="primary"
              variant="flat"
              startContent={<FiEdit2 className="w-4 h-4" />}
              onPress={() => onEdit(permiso)}
              className="bg-blue-500 hover:bg-blue-600 text-white border-none hover:shadow-lg transition-all duration-200"
            >
              {tipoSeccion === "solicitudes" ? "Revisar" : "Editar"}
            </Button>
          </Tooltip>
        )}

        {/* Botón de Eliminar */}
        {puedeEliminar() && (
          <Tooltip content="Eliminar permiso">
            <Button
              size="md"
              color="danger"
              variant="flat"
              startContent={<FiTrash2 className="w-4 h-4" />}
              onPress={() => onDelete(permiso.id || permiso.cN_Id_permiso)}
              className="bg-red-500 hover:bg-red-600 text-white border-none hover:shadow-lg transition-all duration-200"
            >
              Eliminar
            </Button>
          </Tooltip>
        )}
      </div>

      {/* Modal de Adjuntos */}
      <GestorAdjuntosPermisos
        isOpen={isAdjuntosOpen}
        onOpenChange={onAdjuntosOpenChange}
        permisoId={permiso.id || permiso.cN_Id_permiso}
        permisoTitulo={permiso.cT_Titulo_permiso || permiso.titulo}
        currentUserId={currentUserId}
        estadoPermiso={permiso.cN_Id_estado || permiso.estado}
        usuarioCreadorId={permiso.cN_Usuario_creador || permiso.usuarioCreador}
      />
    </div>
  );
};

export default PermisoContent;
