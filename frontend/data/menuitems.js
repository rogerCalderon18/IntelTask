import { FaChalkboardTeacher, FaBookReader } from "react-icons/fa";
import { GiLockers } from "react-icons/gi";
import { BsPersonFillExclamation, BsPersonFillGear } from "react-icons/bs";
import { BiSolidReport } from "react-icons/bi";
import { FiCalendar } from "react-icons/fi";
import { link } from "@heroui/react";

export const menuItems = [
  {
    id: 1,
    label: "Admin",
    icon: BsPersonFillGear,
    subItems: [
      { label: "Administradores", link: "/administrador/admin" },
    ],
  },
  {
    id: 2,
    label: "Tareas",
    icon: FaChalkboardTeacher,
    link: "/tareas",
  },
  {
    id: 3,
    label: "Permisos",
    icon: FiCalendar,
    link: "/permisos",
  }
];