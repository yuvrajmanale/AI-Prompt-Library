import { CATEGORIES } from '../types';
import type { IPrompt } from '../types';

export const exportPromptsToJSON = (prompts: IPrompt[]) => {
  try {
    const dataStr = JSON.stringify(prompts, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `ai-prompts-export-${date}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Failed to export prompts:', error);
    return false;
  }
};

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  validatedData: IPrompt[];
}

export const validateImportedJSON = (jsonData: any): ValidationResult => {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    validatedData: [],
  };

  if (!Array.isArray(jsonData)) {
    result.isValid = false;
    result.errors.push('Imported data must be a JSON array of prompts.');
    return result;
  }

  if (jsonData.length === 0) {
    result.isValid = false;
    result.errors.push('The JSON array is empty.');
    return result;
  }

  jsonData.forEach((item, index) => {
    const errorPrefix = `Prompt #${index + 1} (${item.title || 'Untitled'}):`;

    // 1. Required string validation
    if (!item.title || typeof item.title !== 'string') {
      result.errors.push(`${errorPrefix} Missing or invalid 'title' (must be a non-empty string).`);
    }
    if (!item.prompt || typeof item.prompt !== 'string') {
      result.errors.push(`${errorPrefix} Missing or invalid 'prompt' content (must be a non-empty string).`);
    }

    // 2. Category enum validation
    if (!item.category || typeof item.category !== 'string') {
      result.errors.push(`${errorPrefix} Missing or invalid 'category'.`);
    } else if (!CATEGORIES.includes(item.category as any)) {
      result.errors.push(
        `${errorPrefix} Invalid 'category' '${item.category}'. Must be one of: ${CATEGORIES.join(', ')}`
      );
    }

    // 3. Fallbacks and parsing of optional fields
    const validatedPrompt: IPrompt = {
      id: typeof item.id === 'string' ? item.id : '',
      title: item.title?.trim() || '',
      prompt: item.prompt || '',
      category: item.category,
      tags: Array.isArray(item.tags) ? item.tags.map((t: any) => String(t).trim()) : [],
      description: typeof item.description === 'string' ? item.description.trim() : '',
      isFavorite: !!item.isFavorite,
      isPinned: !!item.isPinned,
      orderIndex: typeof item.orderIndex === 'number' ? item.orderIndex : 0,
      createdDate: typeof item.createdDate === 'string' ? item.createdDate : new Date().toISOString(),
      lastUpdatedDate: typeof item.lastUpdatedDate === 'string' ? item.lastUpdatedDate : new Date().toISOString(),
    };

    result.validatedData.push(validatedPrompt);
  });

  if (result.errors.length > 0) {
    result.isValid = false;
  }

  return result;
};
