import { toast } from 'react-toastify';

const useConfirmation = () => {
    const showConfirmation = ({
        title = "¿Estás seguro?",
        message,
        description = "Esta acción no se puede deshacer.",
        confirmText = "Confirmar",
        cancelText = "Cancelar",
        onConfirm,
        onCancel,
        type = "warning"
    }) => {

        const iconClass = "w-6 h-6";
        const getIcon = () => {
            switch (type) {
                case 'danger':
                    return (
                        <svg className={`${iconClass} text-red-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    );
                case 'warning':
                    return (
                        <svg className={`${iconClass} text-yellow-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    );
                default:
                    return (
                        <svg className={`${iconClass} text-blue-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    );
            }
        };

        const getIconBg = () => {
            switch (type) {
                case 'danger': return 'bg-red-100';
                case 'warning': return 'bg-yellow-100';
                default: return 'bg-blue-100';
            }
        };

        const getConfirmButtonStyle = () => {
            switch (type) {
                case 'danger': return 'bg-red-600 hover:bg-red-700';
                case 'warning': return 'bg-yellow-600 hover:bg-yellow-700';
                default: return 'bg-blue-600 hover:bg-blue-700';
            }
        };

        toast(
            ({ closeToast }) => (
                <div className="p-4 bg-white rounded-lg shadow-lg w-full max-w-md space-y-6">
                    {/* Encabezado */}
                    <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getIconBg()}`}>
                            {getIcon()}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
                            {message && <p className="text-sm text-gray-800 mt-1">{message}</p>}
                            {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
                            onClick={() => {
                                closeToast();
                                if (onCancel) onCancel();
                            }}
                        >
                            {cancelText}
                        </button>
                        <button
                            className={`px-3 py-1.5 text-sm text-white rounded-md transition ${getConfirmButtonStyle()}`}
                            onClick={async () => {
                                closeToast();
                                if (onConfirm) await onConfirm();
                            }}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            ),
            {
                position: "top-center",
                autoClose: false,
                hideProgressBar: true,
                closeOnClick: false,
                pauseOnHover: false,
                draggable: false,
                closeButton: false,
                className: "!bg-transparent !p-0 !shadow-none"
            }
        );
    };

    return { showConfirmation };
};

export default useConfirmation;
