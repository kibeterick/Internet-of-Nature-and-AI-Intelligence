import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
  category?: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return shortcuts;
}

export const DEFAULT_SHORTCUTS: KeyboardShortcut[] = [
  {
    key: 'k',
    ctrl: true,
    description: 'Open search',
    category: 'Navigation',
    action: () => {}
  },
  {
    key: 's',
    ctrl: true,
    description: 'Save current work',
    category: 'Actions',
    action: () => {}
  },
  {
    key: 'd',
    ctrl: true,
    description: 'Toggle dark mode',
    category: 'Appearance',
    action: () => {}
  },
  {
    key: 'g',
    ctrl: true,
    description: 'Open Genie AI',
    category: 'AI',
    action: () => {}
  },
  {
    key: '/',
    ctrl: true,
    description: 'Show keyboard shortcuts',
    category: 'Help',
    action: () => {}
  },
  {
    key: 'e',
    ctrl: true,
    description: 'Export data',
    category: 'Actions',
    action: () => {}
  },
  {
    key: 'n',
    ctrl: true,
    description: 'New project',
    category: 'Actions',
    action: () => {}
  },
  {
    key: 'p',
    ctrl: true,
    shift: true,
    description: 'Open command palette',
    category: 'Navigation',
    action: () => {}
  }
];
  EXPORT_DATA: { key: "e", ctrl: true, description: "Export data" },
};
