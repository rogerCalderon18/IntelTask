import React, { useState } from "react";
import { Button, Chip, Divider, Tooltip, useDisclosure } from "@heroui/react";
import { FiEdit2, FiTrash2, FiCalendar, FiUser, FiClock, FiFileText, FiPaperclip, FiAlertCircle, FiInfo } from "react-icons/fi";
import GestorAdjuntosPermisos from "./GestorAdjuntosPermisos";

const PermisoContent = ({ permiso, onEdit, onDelete, tipoSeccion, currentUserId }) => {
  const [expandirDescripcion, setExpandirDescripcion] = useState(false);
  const { isOpen: isAdjuntosOpen, onOpen: onAdjuntosOpen, onOpenChange: onAdjuntosOpenChange } = useDisclosure();

  // Función para formatear fecha y hora en formato de 12 horas
  const formatearFechaHora = (fecha) => {
    if (!fecha) return '';
    return new Date(fecha).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Función para calcular duración del permiso en días y horas
  const calcularDuracion = (fechaInicio, fechaFin) => {
    if (!fechaInicio || !fechaFin) return '';
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diferencia = fin - inicio;
    
    // Calcular días y horas totales
    const totalHoras = Math.floor(diferencia / (1000 * 60 * 60));
    const dias = Math.floor(totalHoras / 24);
    const horas = totalHoras % 24;
    
    // Formatear el resultado de forma más compacta
    if (dias === 0 && horas === 0) {
      return 'Menos de 1h';
    } else if (dias === 0) {
      return horas === 1 ? '1 hora' : `${horas}h`;
    } else if (horas === 0) {
      return dias === 1 ? '1 día' : `${dias} días`;
    } else {
      // Formato compacto para evitar descuadre
      if (dias === 1) {
        return `1d ${horas}h`;
      } else {
        return `${dias}d ${horas}h`;
      }
    }
  };

  // Función para obtener el color del estado
  const obtenerColorEstado = (estadoId) => {
    const colores = {
      1: "default",     // Registrado
      6: "success",     // Aprobado
      15: "danger",     // Rechazado
    };
    return colores[estadoId] || "default";
  };

  // Función para obtener el nombre del estado
  const obtenerNombreEstado = (estadoId) => {
    const estados = {
      1: "Registrado",
      6: "Aprobado",
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
          <div className="space-y-3 text-sm">
            <div>
              <div className="font-medium text-green-600 mb-1">Inicio:</div>
              <div className="text-gray-700 font-medium">
                {formatearFechaHora(permiso.cF_Fecha_hora_inicio_permiso || permiso.fechaInicio)}
              </div>
            </div>
            <div>
              <div className="font-medium text-red-600 mb-1">Fin:</div>
              <div className="text-gray-700 font-medium">
                {formatearFechaHora(permiso.cF_Fecha_hora_fin_permiso || permiso.fechaFin)}
              </div>
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

      {/* Descripción con diseño renovado */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 rounded-2xl border border-slate-200 shadow-lg">
        {/* Decoración de fondo */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full opacity-20 -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-100 rounded-full opacity-30 translate-y-12 -translate-x-12"></div>
        
        <div className="relative p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-500 rounded-xl shadow-md">
              <FiFileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Descripción del Permiso</h3>
              <p className="text-sm text-slate-500">Detalles de la solicitud</p>
            </div>
          </div>
          
          <div className="relative bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-white/50 shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-blue-50/30 rounded-xl"></div>
            <div className="relative">
              <p className="text-slate-700 leading-relaxed text-base font-medium">
                {descripcionMostrada}
                {mostrarBotonExpandir && !expandirDescripcion && (
                  <span className="text-blue-500 font-semibold">...</span>
                )}
              </p>
              {mostrarBotonExpandir && (
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={() => setExpandirDescripcion(!expandirDescripcion)}
                    className="group px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white text-sm font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    <span className="flex items-center gap-2">
                      {expandirDescripcion ? 'Ver menos' : 'Ver más'}
                      <div className={`transition-transform duration-300 ${expandirDescripcion ? 'rotate-180' : ''}`}>
                        ↓
                      </div>
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Motivo de rechazo con diseño distintivo */}
      {(permiso.cN_Id_estado || permiso.estado) === 15 && (permiso.cT_Descripcion_rechazo || permiso.descripcionRechazo) && (
        <div className="relative overflow-hidden bg-gradient-to-r from-red-50 via-rose-50 to-pink-50 rounded-2xl border-2 border-red-200 shadow-lg">
          {/* Patrón de fondo decorativo */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-4 left-4 w-16 h-16 border-2 border-red-300 rounded-full"></div>
            <div className="absolute top-8 right-8 w-12 h-12 border-2 border-rose-300 rounded-full"></div>
            <div className="absolute bottom-6 left-1/2 w-20 h-20 border-2 border-pink-300 rounded-full transform -translate-x-1/2"></div>
          </div>
          
          {/* Banda superior decorativa */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400 via-rose-400 to-pink-400"></div>
          
          <div className="relative p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center justify-center w-11 h-11 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl shadow-lg">
                <FiAlertCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-red-800">Motivo del Rechazo</h3>
                <p className="text-sm text-red-600 font-medium">Detalles de la observación</p>
              </div>
            </div>
            
            <div className="relative bg-white/90 backdrop-blur-sm rounded-xl p-6 border-2 border-red-100 shadow-sm">
              {/* Icono de alerta en la esquina */}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              
              <div className="bg-red-50 border-l-4 border-red-400 p-5 rounded-r-lg">
                <p className="text-red-800 leading-relaxed text-base font-medium">
                  {permiso.cT_Descripcion_rechazo || permiso.descripcionRechazo}
                </p>
              </div>
            </div>
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
          className="bg-success text-white border-none hover:shadow-lg transition-all duration-200"
          startContent={<FiPaperclip className="w-4 h-4" />}
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
              className="bg-blue-500 text-white border-none hover:shadow-lg transition-all duration-200"
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
