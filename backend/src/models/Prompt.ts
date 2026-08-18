import mongoose, { Schema, Document } from 'mongoose';

export interface IPromptDocument extends Document {
  id: string;
  title: string;
  prompt: string;
  category: 'Coding' | 'Marketing' | 'Content Writing' | 'Email' | 'Resume' | 'SQL' | 'Design' | 'Social Media' | 'Productivity' | 'Others';
  tags: string[];
  description: string;
  isFavorite: boolean;
  isPinned: boolean;
  orderIndex: number;
  createdDate: Date;
  lastUpdatedDate: Date;
}

const PromptSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    prompt: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: [
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
      ],
    },
    tags: { type: [String], default: [] },
    description: { type: String, default: '' },
    isFavorite: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false },
    orderIndex: { type: Number, default: 0 },
    createdDate: { type: Date, default: Date.now },
    lastUpdatedDate: { type: Date, default: Date.now },
  },
  {
    timestamps: false, // We handle our own createdDate and lastUpdatedDate properties
  }
);

// Indexing for search performance optimization
PromptSchema.index({ title: 'text', prompt: 'text' });
PromptSchema.index({ isPinned: -1, orderIndex: 1, createdDate: -1 });

export default mongoose.model<IPromptDocument>('Prompt', PromptSchema);
