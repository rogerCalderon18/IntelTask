const getColorClass = (prioridad) => {
  switch (prioridad) {
    case 1:
      return "bg-green-500"; // Prioridad baja
    case 2:
      return "bg-blue-500"; // Prioridad moderada
    case 3:
      return "bg-yellow-500"; // Prioridad media
    case 4:
      return "bg-orange-500"; // Prioridad alta
    case 5:
      return "bg-red-500"; // Prioridad crítica
    default:
      return "bg-gray-500"; // Sin prioridad
  }
};

export default getColorClass;