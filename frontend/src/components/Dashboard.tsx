import { usePrompts } from '../context/PromptContext';
import type { IPrompt } from '../types';
import { FileText, Heart, FolderPlus, Clock } from 'lucide-react';

interface DashboardProps {
  onViewPrompt: (prompt: IPrompt) => void;
  onOpenAddModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onViewPrompt, onOpenAddModal }) => {
  const { prompts } = usePrompts();

  // 1. Calculations for stats
  const totalCount = prompts.length;
  const favoriteCount = prompts.filter((p) => p.isFavorite).length;
  
  // Unique categories count that actually contain prompts
  const activeCategoriesCount = new Set(prompts.map((p) => p.category)).size;

  // Recently added prompts (sort by createdDate desc, slice first 3)
  const recentlyAdded = [...prompts]
    .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
    .slice(0, 3);

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            AI Prompt Workspace
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Organize, design, and search all your reusable AI prompts in one place.
          </p>
        </div>
        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium text-sm rounded-xl transition-all shadow-md hover:shadow-indigo-500/20 hover:scale-[1.02]"
        >
          Create Prompt
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Prompts */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Total Prompts
            </p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1">
              {totalCount}
            </h3>
          </div>
        </div>

        {/* Favorite Prompts */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl">
            <Heart className="w-6 h-6 fill-rose-600 dark:fill-none" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Favorites
            </p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1">
              {favoriteCount}
            </h3>
          </div>
        </div>

        {/* Active Categories */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <FolderPlus className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Active Categories
            </p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1">
              {activeCategoriesCount} <span className="text-xs text-slate-400 dark:text-slate-600 font-normal">/ 10</span>
            </h3>
          </div>
        </div>
      </div>

      {/* Recently Added Section */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
          <Clock className="w-5 h-5 text-slate-400" />
          <h2 className="text-base font-bold text-slate-800 dark:text-white">
            Recently Added Prompts
          </h2>
        </div>

        {recentlyAdded.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">
            No prompts added yet. Click "Create Prompt" to get started.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentlyAdded.map((prompt) => (
              <div
                key={prompt.id}
                onClick={() => onViewPrompt(prompt)}
                className="flex justify-between items-center py-3.5 hover:bg-slate-50 dark:hover:bg-slate-900/50 px-2 rounded-xl transition-all cursor-pointer group"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {prompt.title}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    {prompt.description || 'No description provided'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md font-medium">
                    {prompt.category}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-600 shrink-0">
                    {formatDate(prompt.createdDate)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
