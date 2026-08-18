import React, { useRef } from 'react';
import { usePrompts } from '../context/PromptContext';
import { exportPromptsToJSON, validateImportedJSON } from '../utils/importExport';
import { useKeybindings } from '../hooks/useKeybindings';
import { Sun, Moon, Search, Download, Upload, Menu, X } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
  onOpenAddModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onOpenAddModal }) => {
  const {
    prompts,
    searchText,
    setSearchText,
    theme,
    toggleTheme,
    importPrompts,
    addToast,
  } = usePrompts();

  const searchInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hook up focus-search keyboard binding here
  useKeybindings({
    onSearchFocus: () => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    },
    onOpenAddModal,
  });

  const handleExport = () => {
    if (prompts.length === 0) {
      addToast('No prompts to export.', 'info');
      return;
    }
    const success = exportPromptsToJSON(prompts);
    if (success) {
      addToast('Prompts exported successfully!', 'success');
    } else {
      addToast('Failed to export prompts.', 'error');
    }
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result;
        if (typeof text !== 'string') throw new Error('Failed to read file');

        const parsedData = JSON.parse(text);
        const validation = validateImportedJSON(parsedData);

        if (!validation.isValid) {
          console.error('Import validation errors:', validation.errors);
          // Show the first error in a toast
          addToast(`Import failed: ${validation.errors[0]}`, 'error');
          return;
        }

        const success = await importPrompts(validation.validatedData);
        if (success) {
          addToast(`Imported prompts successfully!`, 'success');
        }
      } catch (err) {
        console.error('Failed to parse JSON file:', err);
        addToast('Invalid JSON file format.', 'error');
      } finally {
        // Reset file input value to allow re-importing the same file if needed
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <nav className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3.5 flex items-center justify-between gap-4">
      {/* Left: Mobile Menu & Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 p-1 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 select-none">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm">
            AG
          </div>
          <span className="hidden sm:inline font-extrabold text-sm tracking-tight text-slate-800 dark:text-white">
            PromptLib
          </span>
        </div>
      </div>

      {/* Center: Search input */}
      <div className="flex-1 max-w-md relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          ref={searchInputRef}
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search prompts (Press '/' to focus)"
          className="w-full pl-9 pr-8 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
        />
        {searchText && (
          <button
            onClick={() => setSearchText('')}
            className="absolute inset-y-0 right-2.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Right: Actions (Import/Export, Theme, Create) */}
      <div className="flex items-center gap-2">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Import */}
        <button
          onClick={handleImportClick}
          className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-950/60 rounded-xl transition-all"
          title="Import JSON Prompts"
        >
          <Upload className="w-4.5 h-4.5" />
        </button>

        {/* Export */}
        <button
          onClick={handleExport}
          className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-950/60 rounded-xl transition-all"
          title="Export Prompts to JSON"
        >
          <Download className="w-4.5 h-4.5" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-950/60 rounded-xl transition-all"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? <Moon className="w-4.5 h-4.5" /> : <Sun className="w-4.5 h-4.5" />}
        </button>
      </div>
    </nav>
  );
};
