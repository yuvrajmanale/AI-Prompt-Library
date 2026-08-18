import { useState } from 'react';
import { PromptProvider, usePrompts } from './context/PromptContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { PromptCard } from './components/PromptCard';
import { ToastContainer } from './components/Toast';
import { useDragAndDrop } from './hooks/useDragAndDrop';
import { useKeybindings } from './hooks/useKeybindings';
import type { IPrompt } from './types';
import {
  AddEditPromptModal,
  DeleteConfirmDialog,
  PromptDetailsModal,
} from './components/PromptModals';
import { PlusCircle, SearchX } from 'lucide-react';

function AppContent() {
  const {
    filteredPrompts,
    isLoading,
    error,
    addPrompt,
    updatePrompt,
    deletePrompt,
    reorderPromptsState,
    setSelectedCategory,
    setShowFavoritesOnly,
    setSearchText,
  } = usePrompts();

  // Mobile sidebar drawer state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals visibility states
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<IPrompt | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingPrompt, setDeletingPrompt] = useState<IPrompt | null>(null);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [viewingPrompt, setViewingPrompt] = useState<IPrompt | null>(null);

  // Drag and drop handlers using custom hook
  const dragHandlers = useDragAndDrop(reorderPromptsState);

  // Keyboard shortcut to close modals
  const handleCloseAllModals = () => {
    setIsAddEditOpen(false);
    setIsDeleteOpen(false);
    setIsDetailsOpen(false);
    setEditingPrompt(null);
    setDeletingPrompt(null);
    setViewingPrompt(null);
  };

  useKeybindings({
    onCloseModals: handleCloseAllModals,
  });

  // Modal event triggers
  const handleOpenAddModal = () => {
    setEditingPrompt(null);
    setIsAddEditOpen(true);
  };

  const handleEditClick = (prompt: IPrompt) => {
    setEditingPrompt(prompt);
    setIsAddEditOpen(true);
  };

  const handleDeleteClick = (prompt: IPrompt) => {
    setDeletingPrompt(prompt);
    setIsDeleteOpen(true);
  };

  const handleViewClick = (prompt: IPrompt) => {
    setViewingPrompt(prompt);
    setIsDetailsOpen(true);
  };

  // Submission CRUD triggers
  const handleAddEditSubmit = async (formData: {
    title: string;
    prompt: string;
    category: any;
    tags: string[];
    description: string;
  }) => {
    if (editingPrompt) {
      await updatePrompt(editingPrompt.id, formData);
    } else {
      await addPrompt(formData);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deletingPrompt) {
      await deletePrompt(deletingPrompt.id);
    }
  };

  const handleClearFilters = () => {
    setSelectedCategory('All');
    setShowFavoritesOnly(false);
    setSearchText('');
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Header navbar */}
      <Navbar
        onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        onOpenAddModal={handleOpenAddModal}
      />

      {/* Main Workspace split */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left pane: Sidebar (toggles mobile drawer / sits fixed on desktop) */}
        <Sidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />

        {/* Right pane: Dashboard + Prompts Grid scroll area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8">
          {/* Fallback API connection warning */}
          {error && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 px-4 py-3 rounded-2xl text-amber-700 dark:text-amber-400 text-sm font-semibold shadow-sm animate-pulse">
              {error}
            </div>
          )}

          {/* Stats Dashboard */}
          <Dashboard
            onViewPrompt={handleViewClick}
            onOpenAddModal={handleOpenAddModal}
          />

          {/* Prompts list section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-extrabold text-slate-800 dark:text-white">
                Prompt Library
              </h2>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                {filteredPrompts.length} match{filteredPrompts.length !== 1 ? 'es' : ''}
              </span>
            </div>

            {/* Loading / Grid view / Empty states */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-3">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-slate-400 dark:text-slate-500 font-semibold animate-pulse">
                  Retrieving library content...
                </p>
              </div>
            ) : filteredPrompts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-900/20 text-center px-4">
                <SearchX className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  No prompts match your criteria
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm">
                  Try adjusting your search terms, filter tags, category select, or create a brand new prompt.
                </p>
                <div className="flex gap-3 mt-5">
                  <button
                    onClick={handleClearFilters}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-850 text-slate-600 dark:text-slate-400 font-bold text-xs rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                  >
                    Clear Filters
                  </button>
                  <button
                    onClick={handleOpenAddModal}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-md"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    New Prompt
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
                {filteredPrompts.map((prompt) => (
                  <PromptCard
                    key={prompt.id}
                    prompt={prompt}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                    onView={handleViewClick}
                    dragHandlers={dragHandlers}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal dialog overlays */}
      <AddEditPromptModal
        isOpen={isAddEditOpen}
        onClose={handleCloseAllModals}
        onSubmit={handleAddEditSubmit}
        initialData={editingPrompt}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={handleCloseAllModals}
        onConfirm={handleDeleteConfirm}
        promptTitle={deletingPrompt?.title || ''}
      />

      <PromptDetailsModal
        isOpen={isDetailsOpen}
        onClose={handleCloseAllModals}
        prompt={viewingPrompt}
      />

      {/* Toast Alert stack */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <PromptProvider>
      <AppContent />
    </PromptProvider>
  );
}
