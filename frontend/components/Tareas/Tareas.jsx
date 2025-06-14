import React, { useState } from "react";
import Container from "../Layout/Container";
import { Tabs, Tab, Select, Button, SelectItem, useDisclosure } from "@heroui/react";
import { FiPlus } from "react-icons/fi";
import TareaAccordion from "./TareaAccordion";
import TareaModal from "./TareaModal";


const tareasMock = [
	{
		id: 1,
		titulo: "Crear sistema de asignación de tareas",
		descripcion:
			"Un sistema de asignación de tareas debe, en primer lugar, definir claramente los roles y responsabilidades de cada miembro del equipo. Esto garantiza que las tareas se distribuyan de manera equitativa y que cada persona tenga claro qué se espera de ella. Además, el sistema debe incluir herramientas que faciliten el seguimiento del progreso y la comunicación dentro del equipo, lo cual contribuye a mejorar la eficiencia y la colaboración. Con un sistema bien estructurado, se optimiza el uso de recursos y se incrementa la productividad general del equipo.",
		estado: 1, // Completada
		fechaEntrega: "21-04-2024",
		subtareas: [
			{ id: "01.1", titulo: "Subtarea 1: Crear sistema de asignación de tareas" },
			{ id: "01.2", titulo: "Subtarea 2: Crear sistema de asignación de tareas" },
		],
		prioridad: 1,
	},
	{
		id: 2,
		titulo: "Establecer un sistema para la asignación de tareas",
		descripcion: "Otra descripción para la tarea 2...",
		estado: 3, // Pendiente
		fechaEntrega: "25-04-2024",
		subtareas: [],
		prioridad: 5,
	},
	{
		id: 3,
		titulo: "Crear sistema de asignación de tareas",
		descripcion: "Descripción para la tarea 3...",
		estado: 2, // En progreso
		fechaEntrega: "30-04-2024",
		subtareas: [],
		prioridad: 3,
	},
];

const tabs = [
	{
		id: "misTareas",
		label: "Mis Tareas",
		filter: (tareas) => tareas.filter((tarea) => tarea.estado === 1), // Completada
	},
	{
		id: "seguimiento",
		label: "En seguimiento",
		filter: (tareas) => tareas.filter((tarea) => tarea.estado === 2), // En progreso
	},
	{
		id: "revision",
		label: "En revisión",
		filter: (tareas) => tareas.filter((tarea) => tarea.estado === 3), // Pendiente
	},
	{
		id: "incumplimiento",
		label: "Incumplimiento",
		filter: (tareas) => tareas.filter((tarea) => tarea.estado === 4), // Incumplimiento
	},
];

const Tareas = () => {
	const [tareas, setTareas] = useState(tareasMock);
	const [isModalOpen, setModalOpen] = useState(false);
	const [selectedTarea, setSelectedTarea] = useState(null);
	const { isOpen, onOpen, onOpenChange } = useDisclosure();

	const handleOpenModal = (tarea = null) => {
		setSelectedTarea(tarea);
		onOpen();
	};

	const handleCloseModal = () => {
		setSelectedTarea(null);
		onOpenChange(false);
		setSelectedTarea(null);
	};

	const handleSubmit = (formData) => {
		if (selectedTarea) {
			setTareas((prev) =>
				prev.map((tarea) => (tarea.id === selectedTarea.id ? { ...tarea, ...formData } : tarea))
			);
		} else {
			setTareas((prev) => [...prev, { ...formData, id: prev.length + 1 }]);
		}
		handleCloseModal();
	};

	return (
		<Container className="max-w-4xl mx-auto mt-10">
			<Tabs
				aria-label="Categorías de tareas"
				className="mb-4"
				variant="underlined"
				items={tabs}
				color="primary"
				classNames={{
					tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
					cursor: "w-full bg-[#22d3ee]",
					tab: "max-w-fit px-0 h-12",
					tabContent: "group-data-[selected=true]:text-[#06b6d4]",
				}}
			>
				{(tab) => (
					<Tab key={tab.id} title={tab.label}>
						<div className="flex justify-between items-center mb-4 ml-2">
							<Select placeholder="Estados" className="w-1/4">
								<SelectItem value="1">Completada</SelectItem>
								<SelectItem value="2">En progreso</SelectItem>
								<SelectItem value="3">Pendiente</SelectItem>
							</Select>

							<Button
								color="primary"
								endContent={<FiPlus width={40} height={10} className="w-6 h-6" />}
								className="flex items-center mr-2"
								onPress={() => handleOpenModal()}
							>
								Agregar
							</Button>
						</div>
						<TareaAccordion tareas={tab.filter(tareas)} onEdit={handleOpenModal} />
					</Tab>
				)}
			</Tabs>

			<TareaModal
				isOpen={isOpen}
				onOpenChange={onOpenChange}
				onClose={handleCloseModal}
				onSubmit={handleSubmit}
				tarea={selectedTarea}
			/>
		</Container>
	);
};

export default Tareas;
