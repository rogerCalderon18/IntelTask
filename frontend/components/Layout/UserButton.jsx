import { Avatar, Badge } from "@heroui/react";
import {
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger
} from "@heroui/react";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { useCallback } from "react";
import { FaUserCircle, FaKey, FaSignOutAlt, FaUserShield } from "react-icons/fa";

export function UserButton() {
    const { data: session } = useSession();

    const handleLogout = useCallback(async () => {
        await signOut({ redirect: true });
        window.location.href = "/";
    }, []);

    // Función para obtener nombre del rol basado en el ID
    const getRoleName = (roleId) => {
        const roleNames = {
            1: 'Director',
            2: 'Subdirector', 
            3: 'Jefe',
            4: 'Coordinador',
            5: 'Profesional 3',
            6: 'Profesional 2',
            7: 'Profesional 1',
            8: 'Técnico'
        };
        return roleNames[roleId] || 'Sin rol asignado';
    };

    // Función para obtener color del avatar basado en el rol
    const getRoleColor = (roleId) => {
        const roleName = getRoleName(roleId);
        const roleColors = {
            'Director': 'bg-gradient-to-br from-red-600 to-red-800',
            'Subdirector': 'bg-gradient-to-br from-orange-500 to-red-600',
            'Jefe': 'bg-gradient-to-br from-yellow-500 to-orange-500',
            'Coordinador': 'bg-gradient-to-br from-blue-500 to-cyan-500',
            'Profesional 3': 'bg-gradient-to-br from-green-500 to-emerald-500',
            'Profesional 2': 'bg-gradient-to-br from-teal-500 to-green-500',
            'Profesional 1': 'bg-gradient-to-br from-cyan-500 to-teal-500',
            'Técnico': 'bg-gradient-to-br from-gray-500 to-slate-600'
        };
        return roleColors[roleName] || 'bg-gradient-to-br from-indigo-500 to-purple-500';
    };

    // Función para obtener iniciales del nombre
    const getInitials = (name) => {
        if (!name) return "US";
        return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
    };

    if (!session) {
        return <p className="text-sm text-gray-500">No estás autenticado</p>;
    }

    return (
        <div className="absolute top-3 right-4 z-50">
            <Dropdown placement="bottom-end">
                <DropdownTrigger>
                    <Avatar
                        isBordered
                        as="button"
                        className={`transition-all duration-300 hover:scale-105 shadow-lg border-2 border-white ${getRoleColor(session.user.role)} text-white font-bold`}
                        size="md"
                        src={session.user.image ?? undefined}
                        name={getInitials(session.user.name)}
                    />
                </DropdownTrigger>

                <DropdownMenu
                    aria-label="Acciones de perfil"
                    variant="flat"
                    className="min-w-[320px] p-3"
                >
                    <DropdownItem
                        key="profile"
                        isReadOnly
                        className="cursor-default opacity-100"
                        startContent={<FaUserCircle className="text-gray-400 w-8 h-8" />}
                    >
                        <div className="flex flex-col gap-1">
                            <p className="text-sm font-bold">
                                {session.user.name || "Usuario"}
                            </p>
                            <p className="text-xs text-gray-500">
                                {session.user.email}
                            </p>
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${getRoleColor(session.user.role)} mt-1`}>
                                <FaUserShield className="w-3 h-3 mr-1" />
                                {getRoleName(session.user.role)}
                            </div>
                        </div>
                    </DropdownItem>

                    <DropdownItem
                        key="settings"
                        startContent={<FaKey className="w-4 h-4" />}
                    >
                        Cambiar contraseña
                    </DropdownItem>

                    <DropdownItem
                        key="logout"
                        color="danger"
                        onPress={handleLogout}
                        startContent={<FaSignOutAlt className="w-4 h-4" />}
                    >
                        Cerrar sesión
                    </DropdownItem>
                </DropdownMenu>
            </Dropdown>
        </div>
    );
}
export default UserButton;