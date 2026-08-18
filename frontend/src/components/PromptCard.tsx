import type { IPrompt } from '../types';
import { usePrompts } from '../context/PromptContext';
import { Heart, Pin, Copy, Edit, Trash, Copyleft, Eye, GripVertical } from 'lucide-react';

interface PromptCardProps {
  prompt: IPrompt;
  onEdit: (prompt: IPrompt) => void;
  onDelete: (prompt: IPrompt) => void;
  onView: (prompt: IPrompt) => void;
  dragHandlers: {
    handleDragStart: (e: React.DragEvent, id: string) => void;
    handleDragOver: (e: React.DragEvent) => void;
    handleDrop: (e: React.DragEvent, targetId: string) => void;
    handleDragEnd: () => void;
    draggedId: string | null;
  };
}

export const PromptCard: React.FC<PromptCardProps> = ({
  prompt,
  onEdit,
  onDelete,
  onView,
  dragHandlers,
}) => {
  const { toggleFavorite, togglePin, duplicatePrompt, addToast } = usePrompts();
  const { handleDragStart, handleDragOver, handleDrop, handleDragEnd, draggedId } = dragHandlers;

  const isCurrentlyDragging = draggedId === prompt.id;

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(prompt.prompt);
      addToast('Prompt copied to clipboard!', 'success');
    } catch (err) {
      console.error('Failed to copy text: ', err);
      addToast('Failed to copy prompt.', 'error');
    }
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    duplicatePrompt(prompt.id);
  };

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(prompt.id);
  };

  const handlePinToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    togglePin(prompt.id);
  };


  return (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, prompt.id)}
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, prompt.id)}
      onDragEnd={handleDragEnd}
      className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between select-none relative group ${
        isCurrentlyDragging ? 'opacity-40 border-indigo-400 border-dashed' : 'border-slate-200 dark:border-slate-800'
      }`}
    >
      {/* Top Bar: Pins, Categories, Grip, Favorites */}
      <div>
        <div className="flex justify-between items-start gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            {/* Grip handle */}
            <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 dark:text-slate-700 dark:hover:text-slate-400 p-0.5 rounded transition-colors" title="Drag to reorder">
              <GripVertical className="w-4 h-4 shrink-0" />
            </div>
            
            {/* Category badge */}
            <span className="text-xs px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold rounded-full uppercase tracking-wider">
              {prompt.category}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Pin action */}
            <button
              onClick={handlePinToggle}
              className={`p-1.5 rounded-lg transition-colors ${
                prompt.isPinned
                  ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-500 hover:text-amber-600'
                  : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
              title={prompt.isPinned ? 'Unpin from top' : 'Pin to top'}
            >
              <Pin className={`w-4 h-4 ${prompt.isPinned ? 'fill-amber-500' : ''}`} />
            </button>

            {/* Favorite action */}
            <button
              onClick={handleFavoriteToggle}
              className={`p-1.5 rounded-lg transition-colors ${
                prompt.isFavorite
                  ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-500 hover:text-rose-600'
                  : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
              title={prompt.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`w-4 h-4 ${prompt.isFavorite ? 'fill-rose-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Title & Description */}
        <div className="cursor-pointer" onClick={() => onView(prompt)}>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-1">
            {prompt.title}
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 line-clamp-1 h-4">
            {prompt.description || 'No description provided.'}
          </p>

          {/* Prompt Preview */}
          <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl text-sm font-mono text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-900/60 line-clamp-3 h-16 leading-relaxed select-text overflow-hidden">
            {prompt.prompt}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-4">
          {prompt.tags && prompt.tags.length > 0 ? (
            prompt.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md font-medium"
              >
                #{tag}
              </span>
            ))
          ) : (
            <span className="text-[10px] text-slate-300 dark:text-slate-700 italic">No tags</span>
          )}
        </div>
      </div>

      {/* Footer Actions & Last Updated */}
      <div className="border-t border-slate-100 dark:border-slate-800/80 mt-5 pt-3.5 flex justify-between items-center gap-2">
        <span className="text-[10px] text-slate-400 dark:text-slate-500">
          Updated: {new Date(prompt.lastUpdatedDate).toLocaleDateString()}
        </span>

        <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
          {/* View Details */}
          <button
            onClick={() => onView(prompt)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="View full details"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Copy prompt */}
          <button
            onClick={handleCopy}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Copy prompt to clipboard"
          >
            <Copy className="w-4 h-4" />
          </button>

          {/* Duplicate prompt */}
          <button
            onClick={handleDuplicate}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Duplicate prompt"
          >
            <Copyleft className="w-4 h-4" />
          </button>

          {/* Edit prompt */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(prompt);
            }}
            className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Edit prompt"
          >
            <Edit className="w-4 h-4" />
          </button>

          {/* Delete prompt */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(prompt);
            }}
            className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Delete prompt"
          >
            <Trash className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
