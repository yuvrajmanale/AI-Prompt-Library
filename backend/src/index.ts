import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, disconnectDB } from './db';
import Prompt from './models/Prompt';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Seed function to pre-populate database if empty
const seedSamplePrompts = async () => {
  try {
    const count = await Prompt.countDocuments();
    if (count === 0) {
      console.log('Seeding initial sample prompts into MongoDB...');
      const samples = [
        {
          id: 'sample-1',
          title: 'React Custom Hook Creator',
          prompt: 'You are an expert React developer. Write a custom React hook that manages [state/feature description]. The hook should support TypeScript, handle loading/error states, and include a clear usage example component. Please follow functional programming principles.',
          category: 'Coding',
          tags: ['React', 'TypeScript', 'Hooks'],
          description: 'Generates robust custom React hooks with TypeScript and usage examples.',
          isFavorite: true,
          isPinned: true,
          orderIndex: 0,
          createdDate: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
          lastUpdatedDate: new Date(Date.now() - 3600000 * 24).toISOString(),
        },
        {
          id: 'sample-2',
          title: 'SQL Query Optimizer',
          prompt: 'Analyze the following SQL query and suggest performance optimizations. Identify any potential full table scans, slow joins, or suboptimal subqueries. Rewrite the query for optimal performance on [Database Engine, e.g., PostgreSQL/BigQuery]:\n\n[INSERT YOUR QUERY HERE]',
          category: 'SQL',
          tags: ['Database', 'SQL', 'Performance'],
          description: 'Tunes and optimizes slow SQL queries for performance.',
          isFavorite: false,
          isPinned: false,
          orderIndex: 1,
          createdDate: new Date(Date.now() - 3600000 * 12).toISOString(), // 12 hours ago
          lastUpdatedDate: new Date(Date.now() - 3600000 * 12).toISOString(),
        },
        {
          id: 'sample-3',
          title: 'Eisenhower Daily Planner',
          prompt: 'I will list my tasks for today. Act as a productivity coach, categorize them using the Eisenhower Matrix (Urgent vs Important), estimate time required for each, and structure a realistic hourly schedule for my workday. Here are my tasks:\n\n[INSERT TASKS HERE]',
          category: 'Productivity',
          tags: ['Planning', 'Eisenhower', 'Productivity'],
          description: 'Helps structure daily schedule based on Eisenhower matrix prioritization.',
          isFavorite: true,
          isPinned: false,
          orderIndex: 2,
          createdDate: new Date().toISOString(),
          lastUpdatedDate: new Date().toISOString(),
        }
      ];
      await Prompt.insertMany(samples);
      console.log('Sample prompts seeded successfully.');
    }
  } catch (error) {
    console.error('Error seeding sample prompts:', error);
  }
};

// API Endpoints

// 1. Fetch all prompts
app.get('/api/prompts', async (req, res) => {
  try {
    const prompts = await Prompt.find().sort({
      isPinned: -1,
      orderIndex: 1,
      createdDate: -1
    });
    res.json(prompts);
  } catch (error) {
    console.error('Error fetching prompts:', error);
    res.status(500).json({ error: 'Failed to fetch prompts' });
  }
});

// 2. Create a new prompt
app.post('/api/prompts', async (req, res) => {
  try {
    const { id, title, prompt, category, tags, description, isFavorite, isPinned, orderIndex } = req.body;

    if (!title || !prompt || !category) {
      return res.status(400).json({ error: 'Title, prompt content, and category are required' });
    }

    const newPrompt = new Prompt({
      id,
      title,
      prompt,
      category,
      tags: tags || [],
      description: description || '',
      isFavorite: !!isFavorite,
      isPinned: !!isPinned,
      orderIndex: orderIndex || 0,
      createdDate: new Date().toISOString(),
      lastUpdatedDate: new Date().toISOString()
    });

    await newPrompt.save();
    res.status(201).json(newPrompt);
  } catch (error) {
    console.error('Error creating prompt:', error);
    res.status(500).json({ error: 'Failed to create prompt' });
  }
});

// 3. Update an existing prompt
app.put('/api/prompts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      lastUpdatedDate: new Date().toISOString()
    };

    // Prevent overriding createdDate directly unless specifically importing
    if (updateData.createdDate) {
      delete updateData.createdDate;
    }

    const updatedPrompt = await Prompt.findOneAndUpdate({ id }, updateData, { new: true });

    if (!updatedPrompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    res.json(updatedPrompt);
  } catch (error) {
    console.error('Error updating prompt:', error);
    res.status(500).json({ error: 'Failed to update prompt' });
  }
});

// 4. Delete a prompt
app.delete('/api/prompts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPrompt = await Prompt.findOneAndDelete({ id });

    if (!deletedPrompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    res.json({ message: 'Prompt deleted successfully', deletedPrompt });
  } catch (error) {
    console.error('Error deleting prompt:', error);
    res.status(500).json({ error: 'Failed to delete prompt' });
  }
});

// 5. Bulk Reorder prompts
app.post('/api/prompts/reorder', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) {
      return res.status(400).json({ error: 'Invalid payload: ids must be an array of strings' });
    }

    const bulkOps = ids.map((id, index) => ({
      updateOne: {
        filter: { id },
        update: { orderIndex: index }
      }
    }));

    await Prompt.bulkWrite(bulkOps);
    res.json({ message: 'Prompt order updated successfully' });
  } catch (error) {
    console.error('Error reordering prompts:', error);
    res.status(500).json({ error: 'Failed to reorder prompts' });
  }
});

// Start Server
const server = app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await connectDB();
  await seedSamplePrompts();
});

// Graceful Shutdown
const shutdown = async () => {
  console.log('Shutting down server...');
  server.close(async () => {
    await disconnectDB();
    console.log('Server stopped.');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
