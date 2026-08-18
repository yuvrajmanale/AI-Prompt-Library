import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { IPrompt, CategoryType, ToastMessage } from '../types';

interface PromptContextType {
  prompts: IPrompt[];
  filteredPrompts: IPrompt[];
  isLoading: boolean;
  error: string | null;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  searchText: string;
  setSearchText: (text: string) => void;
  selectedCategory: CategoryType | 'All';
  setSelectedCategory: (category: CategoryType | 'All') => void;
  showFavoritesOnly: boolean;
  setShowFavoritesOnly: (show: boolean) => void;
  sortBy: 'newest' | 'oldest' | 'az' | 'za';
  setSortBy: (sort: 'newest' | 'oldest' | 'az' | 'za') => void;
  addPrompt: (prompt: Omit<IPrompt, 'id' | 'createdDate' | 'lastUpdatedDate' | 'orderIndex' | 'isFavorite' | 'isPinned'>) => Promise<void>;
  updatePrompt: (id: string, updates: Partial<IPrompt>) => Promise<void>;
  deletePrompt: (id: string) => Promise<void>;
  duplicatePrompt: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  reorderPromptsState: (draggedId: string, targetId: string) => Promise<void>;
  importPrompts: (imported: IPrompt[]) => Promise<boolean>;
  toasts: ToastMessage[];
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const PromptContext = createContext<PromptContextType | undefined>(undefined);

const API_BASE = 'http://localhost:5000/api';

const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
};

export const PromptProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Prompt and API States
  const [prompts, setPrompts] = useState<IPrompt[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchText, setSearchText] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'All'>('All');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'az' | 'za'>('newest');

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // 1. Toast Helpers
  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    const id = generateUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Theme effect
  useEffect(() => {
    localStorage.setItem('theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  // Fetch Prompts from API
  const fetchPrompts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/prompts`);
      if (!res.ok) throw new Error('API server returned an error');
      const data = await res.json();
      setPrompts(data);
      localStorage.setItem('prompts', JSON.stringify(data));
    } catch (err) {
      console.warn('API error, falling back to LocalStorage cache:', err);
      setError('Offline Mode: Connected to local cache.');
      const localData = localStorage.getItem('prompts');
      if (localData) {
        setPrompts(JSON.parse(localData));
      }
      addToast('Loaded cache. Server connection failed.', 'info');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  // Initial Fetch
  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  // Sync to LocalStorage helper
  const syncToLocalStorage = (updatedPrompts: IPrompt[]) => {
    localStorage.setItem('prompts', JSON.stringify(updatedPrompts));
  };

  // 2. CRUD Operations

  // Create
  const addPrompt = async (newPromptData: Omit<IPrompt, 'id' | 'createdDate' | 'lastUpdatedDate' | 'orderIndex' | 'isFavorite' | 'isPinned'>) => {
    const id = generateUUID();
    const now = new Date().toISOString();
    // Calculate new order index
    const maxOrder = prompts.length > 0 ? Math.max(...prompts.map(p => p.orderIndex)) : -1;
    const newPrompt: IPrompt = {
      ...newPromptData,
      id,
      createdDate: now,
      lastUpdatedDate: now,
      isFavorite: false,
      isPinned: false,
      orderIndex: maxOrder + 1,
    };

    // Optimistic state update
    const updated = [newPrompt, ...prompts];
    setPrompts(updated);
    syncToLocalStorage(updated);

    try {
      const res = await fetch(`${API_BASE}/prompts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPrompt),
      });
      if (!res.ok) throw new Error('Failed to save to database');
      const savedPrompt = await res.json();
      // Ensure backend data replaces client-side representation
      setPrompts((prev) => prev.map((p) => (p.id === id ? savedPrompt : p)));
      addToast('Prompt created successfully!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Saved locally. Failed to sync with server.', 'error');
    }
  };

  // Update
  const updatePrompt = async (id: string, updates: Partial<IPrompt>) => {
    const now = new Date().toISOString();
    const updated = prompts.map((p) => {
      if (p.id === id) {
        return { ...p, ...updates, lastUpdatedDate: now };
      }
      return p;
    });

    setPrompts(updated);
    syncToLocalStorage(updated);

    try {
      const res = await fetch(`${API_BASE}/prompts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updates, lastUpdatedDate: now }),
      });
      if (!res.ok) throw new Error('Failed to update in database');
      const updatedPrompt = await res.json();
      setPrompts((prev) => prev.map((p) => (p.id === id ? updatedPrompt : p)));
      addToast('Prompt updated successfully!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Updated locally. Failed to sync with server.', 'error');
    }
  };

  // Delete
  const deletePrompt = async (id: string) => {
    const updated = prompts.filter((p) => p.id !== id);
    setPrompts(updated);
    syncToLocalStorage(updated);

    try {
      const res = await fetch(`${API_BASE}/prompts/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete from database');
      addToast('Prompt deleted successfully!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Deleted locally. Failed to sync with server.', 'error');
    }
  };

  // Duplicate
  const duplicatePrompt = async (id: string) => {
    const original = prompts.find((p) => p.id === id);
    if (!original) return;

    const newId = generateUUID();
    const now = new Date().toISOString();
    const maxOrder = prompts.length > 0 ? Math.max(...prompts.map(p => p.orderIndex)) : -1;

    const duplicated: IPrompt = {
      ...original,
      id: newId,
      title: `${original.title} (Copy)`,
      isPinned: false, // Don't pin duplicates by default
      orderIndex: maxOrder + 1,
      createdDate: now,
      lastUpdatedDate: now,
    };

    const updated = [duplicated, ...prompts];
    setPrompts(updated);
    syncToLocalStorage(updated);

    try {
      const res = await fetch(`${API_BASE}/prompts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicated),
      });
      if (!res.ok) throw new Error('Failed to duplicate in database');
      const savedPrompt = await res.json();
      setPrompts((prev) => prev.map((p) => (p.id === newId ? savedPrompt : p)));
      addToast('Prompt duplicated successfully!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Duplicated locally. Failed to sync with server.', 'error');
    }
  };

  // Toggle Favorite
  const toggleFavorite = async (id: string) => {
    const target = prompts.find((p) => p.id === id);
    if (!target) return;
    const isFavorite = !target.isFavorite;
    await updatePrompt(id, { isFavorite });
  };

  // Toggle Pin
  const togglePin = async (id: string) => {
    const target = prompts.find((p) => p.id === id);
    if (!target) return;
    const isPinned = !target.isPinned;
    await updatePrompt(id, { isPinned });
  };

  // Drag and Drop State Reordering
  const reorderPromptsState = async (draggedId: string, targetId: string) => {
    const draggedIndex = prompts.findIndex((p) => p.id === draggedId);
    const targetIndex = prompts.findIndex((p) => p.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) return;

    // Create a new array and re-order
    const updatedList = [...prompts];
    const [draggedItem] = updatedList.splice(draggedIndex, 1);
    updatedList.splice(targetIndex, 0, draggedItem);

    // Re-assign orderIndex values sequentially based on their position
    const finalized = updatedList.map((p, idx) => ({
      ...p,
      orderIndex: idx,
    }));

    setPrompts(finalized);
    syncToLocalStorage(finalized);

    try {
      const res = await fetch(`${API_BASE}/prompts/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: finalized.map((p) => p.id) }),
      });
      if (!res.ok) throw new Error('Failed to update order in database');
    } catch (err) {
      console.error('Failed to sync reorder with server:', err);
      addToast('Reordered locally. Failed to sync order with server.', 'error');
    }
  };

  // Import Prompts with validation and batch saving
  const importPrompts = async (importedList: IPrompt[]): Promise<boolean> => {
    try {
      // Deduplicate with existing IDs or generate new IDs
      const now = new Date().toISOString();
      let maxOrder = prompts.length > 0 ? Math.max(...prompts.map(p => p.orderIndex)) : -1;

      const sanitizedList = importedList.map((p) => {
        maxOrder += 1;
        return {
          ...p,
          id: p.id || generateUUID(),
          createdDate: p.createdDate || now,
          lastUpdatedDate: p.lastUpdatedDate || now,
          isFavorite: !!p.isFavorite,
          isPinned: !!p.isPinned,
          orderIndex: p.orderIndex !== undefined ? p.orderIndex : maxOrder,
        };
      });

      // Filter out duplicates from existing state if needed (or combine)
      const existingIds = new Set(prompts.map((p) => p.id));
      const filteredImport = sanitizedList.filter((p) => !existingIds.has(p.id));

      if (filteredImport.length === 0) {
        addToast('No new prompts to import (all duplicate IDs)', 'info');
        return false;
      }

      const mergedList = [...filteredImport, ...prompts];
      setPrompts(mergedList);
      syncToLocalStorage(mergedList);

      // Save each imported prompt in the database
      let successCount = 0;
      await Promise.all(
        filteredImport.map(async (p) => {
          try {
            const res = await fetch(`${API_BASE}/prompts`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(p),
            });
            if (res.ok) successCount += 1;
          } catch (err) {
            console.error(`Failed to import ${p.title} to server:`, err);
          }
        })
      );

      addToast(`Successfully imported ${successCount}/${filteredImport.length} prompts to database`, 'success');
      return true;
    } catch (error) {
      console.error(error);
      addToast('Failed to import prompts', 'error');
      return false;
    }
  };

  // 3. Search & Filter Memoized List
  const filteredPrompts = useMemo(() => {
    let result = [...prompts];

    // Filter by Category
    if (selectedCategory !== 'All') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Filter Favorites
    if (showFavoritesOnly) {
      result = result.filter((p) => p.isFavorite);
    }

    // Filter by Search Query (Title or Prompt content)
    if (searchText.trim()) {
      const query = searchText.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.prompt.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Sorting logic (Note: Pinned items are always kept at the top)
    result.sort((a, b) => {
      // Pin overrides general sorting
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      // Secondary sorting
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
        case 'az':
          return a.title.localeCompare(b.title);
        case 'za':
          return b.title.localeCompare(a.title);
        case 'newest':
        default:
          return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
      }
    });

    return result;
  }, [prompts, selectedCategory, showFavoritesOnly, searchText, sortBy]);

  return (
    <PromptContext.Provider
      value={{
        prompts,
        filteredPrompts,
        isLoading,
        error,
        theme,
        toggleTheme,
        searchText,
        setSearchText,
        selectedCategory,
        setSelectedCategory,
        showFavoritesOnly,
        setShowFavoritesOnly,
        sortBy,
        setSortBy,
        addPrompt,
        updatePrompt,
        deletePrompt,
        duplicatePrompt,
        toggleFavorite,
        togglePin,
        reorderPromptsState,
        importPrompts,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </PromptContext.Provider>
  );
};

export const usePrompts = () => {
  const context = useContext(PromptContext);
  if (context === undefined) {
    throw new Error('usePrompts must be used within a PromptProvider');
  }
  return context;
};
