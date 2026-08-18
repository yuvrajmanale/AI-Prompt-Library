export type CategoryType =
  | 'Coding'
  | 'Marketing'
  | 'Content Writing'
  | 'Email'
  | 'Resume'
  | 'SQL'
  | 'Design'
  | 'Social Media'
  | 'Productivity'
  | 'Others';

export interface IPrompt {
  id: string;
  title: string;
  prompt: string;
  category: CategoryType;
  tags: string[];
  description: string;
  createdDate: string;
  lastUpdatedDate: string;
  isFavorite: boolean;
  isPinned: boolean;
  orderIndex: number;
}

export const CATEGORIES: CategoryType[] = [
  'Coding',
  'Marketing',
  'Content Writing',
  'Email',
  'Resume',
  'SQL',
  'Design',
  'Social Media',
  'Productivity',
  'Others',
];

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
