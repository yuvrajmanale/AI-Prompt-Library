export interface IPrompt {
  id: string; // Unique identifier used on frontend
  title: string;
  prompt: string;
  category: 'Coding' | 'Marketing' | 'Content Writing' | 'Email' | 'Resume' | 'SQL' | 'Design' | 'Social Media' | 'Productivity' | 'Others';
  tags: string[];
  description: string;
  createdDate: string;
  lastUpdatedDate: string;
  isFavorite: boolean;
  isPinned: boolean;
  orderIndex: number;
}
