import { Avatar } from "@heroui/react";
import {
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger
} from "@heroui/react";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { useCallback } from "react";
import { FaUserCircle, FaKey, FaSignOutAlt } from "react-icons/fa";

export function UserButton() {
    const { data: session } = useSession();

    const handleLogout = useCallback(async () => {
        await signOut({ redirect: true });
        window.location.href = "/";
    }, []);

    if (!session) {
        return <p className="text-sm text-gray-500">No estás autenticado</p>;
    }

    return (
        <div className="absolute top-4 right-4 z-50">
            <Dropdown placement="bottom-end">
                <DropdownTrigger>
                    <Avatar
                        isBordered
                        as="button"
                        className="transition-transform hover:scale-105 shadow-md bg-white text-gray-800 text-md"
                        size="sm"
                        src={session.user.image ?? undefined}
                        name={session.user.name ?? "US"}
                    />
                </DropdownTrigger>

                <DropdownMenu
                    aria-label="Acciones de perfil"
                    variant="flat"
                    size="lg"
                    className="min-w-[320px] p-2 rounded-lg shadow-lg"
                >
                    <DropdownItem
                        key="profile"
                        isReadOnly
                        className="cursor-default px-3 py-2 flex items-center gap-3 text-left hover:bg-transparent active:bg-transparent focus:bg-transparent"
                        startContent={<FaUserCircle className="text-gray-500 w-10 h-10 mt-[2px]" />}
                    >
                        <div>
                            <p className="text-sm font-semibold text-black leading-tight">
                                {session.user.name || "Usuario"}
                            </p>
                            <p className="text-xs text-gray-500">{session.user.email}</p>
                        </div>
                    </DropdownItem>

                    <DropdownItem
                        key="settings"
                        className="flex items-center gap-3 text-sm"
                        startContent={
                            <FaKey className="w-4 h-4 mt-[1px] text-gray-500" />
                        }
                    >

                        Cambiar contraseña
                    </DropdownItem>

                    <DropdownItem
                        key="logout"
                        color="danger"
                        className="flex items-center gap-3 text-sm text-danger"
                        onPress={handleLogout}
                        startContent={<FaSignOutAlt className="w-4 h-4 mt-[1px]" />}
                    >

                        Cerrar sesión
                    </DropdownItem>
                </DropdownMenu>
            </Dropdown>
        </div>
    );
}
export default UserButton;