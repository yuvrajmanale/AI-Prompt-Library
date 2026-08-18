import { usePrompts } from '../context/PromptContext';
import { CATEGORIES } from '../types';
import type { CategoryType } from '../types';
import { Heart, Grid, Folder, ArrowUpDown, RefreshCw } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const {
    prompts,
    selectedCategory,
    setSelectedCategory,
    showFavoritesOnly,
    setShowFavoritesOnly,
    sortBy,
    setSortBy,
    setSearchText,
  } = usePrompts();

  // Helper to count prompts per category
  const getCategoryCount = (category: CategoryType | 'All') => {
    if (category === 'All') return prompts.length;
    return prompts.filter((p) => p.category === category).length;
  };

  const handleCategorySelect = (category: CategoryType | 'All') => {
    setSelectedCategory(category);
    if (onClose) onClose(); // Close on mobile when selecting
  };

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setShowFavoritesOnly(false);
    setSortBy('newest');
    setSearchText('');
    if (onClose) onClose();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-5 space-y-6 overflow-y-auto">
      {/* Category List */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-2 flex items-center gap-1">
          <Folder className="w-3.5 h-3.5" />
          Categories
        </h3>
        <ul className="space-y-1.5">
          {/* All option */}
          <li>
            <button
              onClick={() => handleCategorySelect('All')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                selectedCategory === 'All'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/10'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                <Grid className="w-4 h-4" />
                All Prompts
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  selectedCategory === 'All'
                    ? 'bg-indigo-700/50 text-indigo-50'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {getCategoryCount('All')}
              </span>
            </button>
          </li>

          {/* Individual categories */}
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <li key={cat}>
                <button
                  onClick={() => handleCategorySelect(cat)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/10'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span className="truncate">{cat}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold shrink-0 ${
                      isActive
                        ? 'bg-indigo-700/50 text-indigo-50'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {getCategoryCount(cat)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Favorites Filter Toggle */}
      <div className="border-t border-slate-100 dark:border-slate-800/80 pt-5">
        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-2 flex items-center gap-1">
          <Heart className="w-3.5 h-3.5" />
          Filter
        </h3>
        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
            showFavoritesOnly
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/10'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-white' : ''}`} />
          Favorites Only
        </button>
      </div>

      {/* Sorting options */}
      <div className="border-t border-slate-100 dark:border-slate-800/80 pt-5">
        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-2 flex items-center gap-1">
          <ArrowUpDown className="w-3.5 h-3.5" />
          Sort By
        </h3>
        <div className="space-y-1">
          {[
            { value: 'newest', label: 'Newest Added' },
            { value: 'oldest', label: 'Oldest Added' },
            { value: 'az', label: 'Alphabetical A-Z' },
            { value: 'za', label: 'Alphabetical Z-A' },
          ].map((opt) => {
            const isActive = sortBy === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setSortBy(opt.value as any)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Reset Filters */}
      <div className="border-t border-slate-100 dark:border-slate-800/80 pt-5 flex-1 flex flex-col justify-end">
        <button
          onClick={handleResetFilters}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-all active:scale-[0.98]"
        >
          <RefreshCw className="w-4 h-4" />
          Reset Filters
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden md:block w-64 h-full shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (visible when open) */}
      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          {/* Backdrop overlay */}
          <div
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
          />
          {/* Sidebar Drawer */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-slate-900 transition-transform duration-300 animate-slide-in">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
