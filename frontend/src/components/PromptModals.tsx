import { useState, useEffect } from 'react';
import { CATEGORIES } from '../types';
import type { IPrompt, CategoryType } from '../types';
import { X, Calendar, Copy, Hash, Bookmark, BookOpen } from 'lucide-react';
import { usePrompts } from '../context/PromptContext';

// --- 1. ADD / EDIT PROMPT MODAL ---
interface AddEditPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    prompt: string;
    category: CategoryType;
    tags: string[];
    description: string;
  }) => void;
  initialData?: IPrompt | null;
}

export const AddEditPromptModal: React.FC<AddEditPromptModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [category, setCategory] = useState<CategoryType>('Coding');
  const [tagsInput, setTagsInput] = useState('');
  const [description, setDescription] = useState('');

  const [errors, setErrors] = useState<{ title?: string; prompt?: string }>({});

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setPrompt(initialData.prompt);
      setCategory(initialData.category);
      setTagsInput(initialData.tags.join(', '));
      setDescription(initialData.description || '');
    } else {
      setTitle('');
      setPrompt('');
      setCategory('Coding');
      setTagsInput('');
      setDescription('');
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { title?: string; prompt?: string } = {};

    if (!title.trim()) newErrors.title = 'Title is required';
    if (!prompt.trim()) newErrors.prompt = 'Prompt content is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Split tags by comma, trim whitespace and filter empty tags
    const tags = tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    onSubmit({
      title: title.trim(),
      prompt: prompt.trim(),
      category,
      tags,
      description: description.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-850">
          <h2 className="text-lg font-extrabold text-slate-800 dark:text-white">
            {initialData ? 'Edit AI Prompt' : 'Create New AI Prompt'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
                errors.title ? 'border-rose-400 dark:border-rose-900/50' : 'border-slate-200 dark:border-slate-800'
              }`}
              placeholder="e.g. Code Review Checklist"
            />
            {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CategoryType)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              placeholder="Brief summary of what the prompt does"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
              Tags (Optional)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              placeholder="Comma separated, e.g. review, react, best-practices"
            />
          </div>

          {/* Prompt Content */}
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
              Prompt Content <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
              className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
                errors.prompt ? 'border-rose-400 dark:border-rose-900/50' : 'border-slate-200 dark:border-slate-800'
              }`}
              placeholder="Write or paste your system prompt here..."
            />
            {errors.prompt && <p className="text-xs text-rose-500 mt-1">{errors.prompt}</p>}
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-850">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-950 hover:text-slate-800 dark:hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold hover:shadow-indigo-500/10 hover:scale-[1.01] transition-all"
            >
              {initialData ? 'Save Changes' : 'Create Prompt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- 2. DELETE CONFIRMATION DIALOG ---
interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  promptTitle: string;
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  promptTitle,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <h3 className="text-lg font-black text-slate-800 dark:text-white">Delete Prompt?</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
          Are you sure you want to delete <span className="font-semibold text-slate-700 dark:text-slate-300">"{promptTitle}"</span>? This action is permanent and cannot be undone.
        </p>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold text-sm rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-xl transition-all"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// --- 3. PROMPT DETAILS MODAL ---
interface PromptDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: IPrompt | null;
}

export const PromptDetailsModal: React.FC<PromptDetailsModalProps> = ({
  isOpen,
  onClose,
  prompt,
}) => {
  const { addToast } = usePrompts();
  if (!isOpen || !prompt) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.prompt);
      addToast('Prompt copied to clipboard!', 'success');
    } catch {
      addToast('Failed to copy prompt.', 'error');
    }
  };

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-850">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-black text-slate-800 dark:text-white">
              Prompt Details
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Title & Metadata */}
          <div>
            <span className="text-xs px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold rounded-full uppercase tracking-wider">
              {prompt.category}
            </span>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white mt-2">
              {prompt.title}
            </h1>
            {prompt.description && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {prompt.description}
              </p>
            )}
          </div>

          {/* Tags */}
          {prompt.tags && prompt.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Hash className="w-4 h-4 text-slate-400" />
              {prompt.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Prompt Code Block */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                System Prompt
              </span>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-semibold transition-all"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy Prompt
              </button>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950 text-sm font-mono text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-900 rounded-2xl whitespace-pre-wrap select-all leading-relaxed overflow-x-auto max-h-[30vh]">
              {prompt.prompt}
            </div>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-100 dark:border-slate-850 pt-4 text-xs text-slate-400 dark:text-slate-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>Created: {formatDate(prompt.createdDate)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bookmark className="w-4 h-4" />
              <span>Last Updated: {formatDate(prompt.lastUpdatedDate)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/30 border-t border-slate-100 dark:border-slate-850 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
