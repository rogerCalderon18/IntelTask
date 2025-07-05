import React from "react";
import { Card, CardBody, Button } from "@heroui/react";
import { FiPlus, FiInbox, FiCheckCircle, FiClock, FiAlertTriangle, FiEye } from "react-icons/fi";

const EmptyState = ({ tabId, onAddTask, session }) => {
    const getEmptyContent = () => {
        switch (tabId) {
            case "misTareas":
                return {
                    icon: <FiCheckCircle className="w-16 h-16 text-green-400" />,
                    title: "¡Excelente trabajo!",
                    subtitle: "No tienes tareas pendientes",
                    description: "Cuando registres tareas, aparecerán aquí para que puedas hacer un seguimiento del progreso.",
                    buttonText: "Crear nueva tarea",
                    showButton: true,
                    bgColor: "bg-gradient-to-br from-green-50 to-emerald-50",
                    borderColor: "border-green-200"
                };
            case "seguimiento":
                return {
                    icon: <FiClock className="w-16 h-16 text-blue-400" />,
                    title: "Todo bajo control",
                    subtitle: "No hay tareas en seguimiento",
                    description: "Las tareas que estés desarrollando actualmente aparecerán aquí para que puedas monitorear su progreso.",
                    buttonText: "Agregar tarea",
                    showButton: true,
                    bgColor: "bg-gradient-to-br from-blue-50 to-sky-50",
                    borderColor: "border-blue-200"
                };
            case "revision":
                return {
                    icon: <FiEye className="w-16 h-16 text-purple-400" />,
                    title: "Área despejada",
                    subtitle: "No hay tareas en revisión",
                    description: "Cuando tengas tareas pendientes de revisión o aprobación, las encontrarás organizadas aquí.",
                    buttonText: "Nueva tarea",
                    showButton: true,
                    bgColor: "bg-gradient-to-br from-purple-50 to-violet-50",
                    borderColor: "border-purple-200"
                };
            case "incumplimiento":
                return {
                    icon: <FiAlertTriangle className="w-16 h-16 text-red-400" />,
                    title: "¡Genial!",
                    subtitle: "No hay tareas en incumplimiento",
                    description: "Mantén este buen ritmo. Las tareas que superen su fecha límite aparecerán aquí para una acción inmediata.",
                    buttonText: "Crear tarea",
                    showButton: true,
                    bgColor: "bg-gradient-to-br from-red-50 to-rose-50",
                    borderColor: "border-red-200"
                };
            default:
                return {
                    icon: <FiInbox className="w-16 h-16 text-gray-400" />,
                    title: "Sin tareas",
                    subtitle: "Esta sección está vacía",
                    description: "No hay tareas disponibles en esta categoría.",
                    buttonText: "Agregar tarea",
                    showButton: true,
                    bgColor: "bg-gradient-to-br from-gray-50 to-slate-50",
                    borderColor: "border-gray-200"
                };
        }
    };

    const content = getEmptyContent();
    
    // Verificar si el usuario tiene permisos para crear tareas
    const puedeCrearTareas = ![6, 7, 8].includes(parseInt(session?.user?.role));

    return (
        <div className="flex justify-center items-center py-12">
            <Card className={`w-full max-w-md ${content.bgColor} ${content.borderColor} border-2 border-dashed shadow-lg`}>
                <CardBody className="flex flex-col items-center text-center p-8">
                    <div className="mb-4 p-4 rounded-full bg-white shadow-sm">
                        {content.icon}
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {content.title}
                    </h3>
                    
                    <p className="text-lg font-medium text-gray-600 mb-3">
                        {content.subtitle}
                    </p>
                    
                    <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                        {content.description}
                    </p>
                    
                    {content.showButton && puedeCrearTareas && (
                        <Button
                            color="primary"
                            variant="solid"
                            startContent={<FiPlus className="w-4 h-4" />}
                            onPress={onAddTask}
                            className="font-medium"
                        >
                            {content.buttonText}
                        </Button>
                    )}
                </CardBody>
            </Card>
        </div>
    );
};

export default EmptyState;