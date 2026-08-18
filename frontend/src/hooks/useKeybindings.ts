import { useEffect } from 'react';

interface KeybindingsActions {
  onSearchFocus?: () => void;
  onOpenAddModal?: () => void;
  onCloseModals?: () => void;
}

export const useKeybindings = (actions: KeybindingsActions) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // Escape should close modal even if typing inside it
      if (e.key === 'Escape') {
        if (actions.onCloseModals) {
          actions.onCloseModals();
        }
        return;
      }

      if (isTyping) return;

      // Focus Search: '/'
      if (e.key === '/') {
        if (actions.onSearchFocus) {
          e.preventDefault();
          actions.onSearchFocus();
        }
      }

      // Add Prompt: Ctrl+Alt+N (or Ctrl+Alt+n)
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'n') {
        if (actions.onOpenAddModal) {
          e.preventDefault();
          actions.onOpenAddModal();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [actions]);
};
