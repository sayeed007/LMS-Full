"use client"
// ============================================
// MODAL UTILITY FUNCTIONS
// ============================================

import React, { useEffect } from "react";
import { ModalContextType, ModalOptions, ModalProvider, useModal } from "./modal-context";

// Utility functions for managing modals outside of React components
let globalModalContext: ModalContextType | null = null;

/**
 * Sets the global modal context for use with showModal, hideModal, and hideAllModals.
 * Called automatically by ModalProviderWithGlobal.
 * @internal
 */
export const setGlobalModalContext = (context: ModalContextType | null) => {
    globalModalContext = context;
};

/**
 * Opens a modal globally with the specified component and options.
 * @param component The React component to render in the modal
 * @param options Modal configuration options
 * @returns The modal ID, or empty string if context is not initialized
 * @throws Error if ModalProviderWithGlobal is not used in the app root
 */
export const showModal = (component: React.ReactNode, options?: ModalOptions): string => {
    if (!globalModalContext) {
        console.warn(
            "Modal context not initialized. Ensure ModalProviderWithGlobal wraps your app root."
        );
        return "";
    }
    return globalModalContext.openModal(component, options);
};

/**
 * Closes a specific modal by ID, or the topmost modal if no ID is provided.
 * @param id Optional modal ID to close
 * @throws Error if ModalProviderWithGlobal is not used in the app root
 */
export const hideModal = (id?: string): void => {
    if (!globalModalContext) {
        console.warn(
            "Modal context not initialized. Ensure ModalProviderWithGlobal wraps your app root."
        );
        return;
    }
    globalModalContext.closeModal(id);
};

/**
 * Closes all open modals.
 * @throws Error if ModalProviderWithGlobal is not used in the app root
 */
export const hideAllModals = (): void => {
    if (!globalModalContext) {
        console.warn(
            "Modal context not initialized. Ensure ModalProviderWithGlobal wraps your app root."
        );
        return;
    }
    globalModalContext.closeAllModals();
};

/**
 * Hook to access modal actions within React components.
 * Must be used within a ModalProvider.
 * @returns Modal action functions (openModal, closeModal, closeAllModals)
 */
export const useModalActions = () => {
    const context = useModal();
    return {
        openModal: context.openModal,
        closeModal: context.closeModal,
        closeAllModals: context.closeAllModals,
        modals: context.modals,
    };
};

/**
 * A provider that sets up the modal context and enables global modal utilities.
 * Must wrap your application root to use showModal, hideModal, and hideAllModals.
 * @example
 * ```tsx
    * // app/layout.tsx
 * import { ModalProviderWithGlobal } from '@/lib/modal-utils';
 *
 * export default function RootLayout({ children }) {
 *     return (
 * <html lang="en">
            *             <body>
                *                 <ModalProviderWithGlobal>
                    *                     {children}
                    *                 </ModalProviderWithGlobal>
                *             </body>
            *         </html>
        *     );
 * }
 * ```
 */
export const ModalProviderWithGlobal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <ModalProvider>
            <ModalContextSetter>{children}</ModalContextSetter>
        </ModalProvider>
    );
};

/**
 * Internal component to set the global modal context when the provider mounts.
 * @internal
 */
const ModalContextSetter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const modalContext = useModal();

    useEffect(() => {
        setGlobalModalContext(modalContext);
        // No cleanup to avoid resetting context unnecessarily
    }, [modalContext]);

    return <>{children}</>;
};




















































// "use client"
// // ============================================
// // MODAL UTILITY FUNCTIONS
// // ============================================

// import React, { useEffect } from "react"
// import { ModalContextType, ModalOptions, ModalProvider, useModal } from "./modal-context"

// // modal-utils.tsx
// export const openModal = (component: React.ReactNode, options?: ModalOptions): string => {
//     // This will be overridden by the hook in components
//     throw new Error(`openModal must be used within a ModalProvider - ${component} - ${options}`)
// }

// export const closeModal = (id?: string): void => {
//     throw new Error(`closeModal must be used within a ModalProvider - ${id}`)
// }

// export const closeAllModals = (): void => {
//     throw new Error('closeAllModals must be used within a ModalProvider')
// }

// // Hook for components to use modal functions
// export const useModalActions = () => {
//     const { openModal, closeModal, closeAllModals } = useModal()
//     return { openModal, closeModal, closeAllModals }
// }

// // Utility functions that can be called from anywhere (requires context)
// let globalModalContext: ModalContextType | null = null

// export const setGlobalModalContext = (context: ModalContextType) => {
//     globalModalContext = context
// }

// export const showModal = (component: React.ReactNode, options?: ModalOptions): string => {
//     if (!globalModalContext) {
//         console.warn('Modal context not initialized. Wrap your app with ModalProviderWithGlobal.');
//         return '';
//     }
//     return globalModalContext.openModal(component, options)
// }

// export const hideModal = (id?: string): void => {
//     if (!globalModalContext) {
//         throw new Error('Modal context not initialized. Make sure ModalProvider is in your app root.')
//     }
//     globalModalContext.closeModal(id)
// }

// export const hideAllModals = (): void => {
//     if (!globalModalContext) {
//         throw new Error('Modal context not initialized. Make sure ModalProvider is in your app root.')
//     }
//     globalModalContext.closeAllModals()
// }

// /**
//  * A provider that sets up the modal context and enables global modal utilities.
//  * Must be used at the root of your application to use showModal, hideModal, and hideAllModals.
//  */
// export const ModalProviderWithGlobal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//     return (
//         <ModalProvider>
//             <ModalContextSetter>
//                 {children}
//             </ModalContextSetter>
//         </ModalProvider>
//     )
// }

// const ModalContextSetter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//     const modalContext = useModal()

//     useEffect(() => {
//         setGlobalModalContext(modalContext)
//         // No cleanup needed, or use a safer reset mechanism
//         // return () => setGlobalModalContext(null as ModalContextType)
//     }, [modalContext])

//     return <>{children}</>
// }