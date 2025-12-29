'use client';

import { useModal } from '@/lib/modal-context';
import LoginModal from '@/components/auth/LoginModal';

/**
 * Custom hook to handle login modal functionality
 * Provides a reusable way to prompt users to log in
 */
export const useLoginModal = () => {
  const { openModal, closeModal } = useModal();

  const openLoginModal = (message: string, title: string = "Sign in to continue") => {
    // Get current URL for redirect after login
    const currentUrl = window.location.pathname + window.location.search;

    openModal(
      <LoginModal
        isOpen={true}
        onClose={() => closeModal()}
        title={title}
        message={message}
        callbackUrl={currentUrl}
      />,
      {
        size: 'md',
        position: 'center',
        showCloseButton: false,
      }
    );
  };

  return { openLoginModal, closeModal };
};
