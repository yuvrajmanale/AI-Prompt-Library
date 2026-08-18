# AI Prompt Library

A responsive, feature-rich web application that allows users to create, organize, search, and manage reusable AI prompts. It is built as a full-stack JavaScript application using a React + TypeScript frontend and a Node.js + Express + MongoDB backend.

---

## Technical Stack

* **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, and React Context API for global state management.
* **Backend**: Node.js, Express, TypeScript, and Mongoose.
* **Database**: MongoDB (runs using `mongodb-memory-server` out-of-the-box, or connects to a remote MongoDB Atlas instance).
* **Storage**: Double-buffered offline-first syncing between MongoDB REST endpoints and browser `LocalStorage`.

---

## Features Implemented

1. **Dashboard**: Summary metrics for Total Prompts, Favorites count, active categories, and a "Recently Added" quick-access panel.
2. **Prompt Management**:
   * **Full CRUD**: Create, Edit, Delete (with confirmation popup), and Duplicate prompts.
   * **Custom Statuses**: Pin important prompts to the top and mark/unmark Favorites.
   * **Metadata**: Handles Title, Category, Description, Tags, Created Date, Last Updated Date, Favorite Status, Pin Status, and Order Index.
   * **Clipboard Copy**: Integrates the native Clipboard API to copy prompts.
3. **Drag & Drop Reordering**: Reorder prompt cards via an HTML5 drag-and-drop handle, persisting order in both MongoDB and LocalStorage.
4. **Search & Filter**:
   * Instant search (de-bounced) targeting title, description, tags, and prompt content.
   * Category selector (displays counts for each of the 10 exact categories).
   * Toggle to filter "Favorites Only".
   * Sorting options: Newest, Oldest, Alphabetical A→Z, Alphabetical Z→A.
5. **10 Mandatory Categories**: Coding, Marketing, Content Writing, Email, Resume, SQL, Design, Social Media, Productivity, and Others.
6. **Import & Export**:
   * **Export**: Saves current prompt list as a formatted JSON file.
   * **Import**: Reads files, validates schema (validates required fields and categories), and bulk inserts them.
7. **Theme Toggling**: Dark / Light theme toggle persisted in local storage.
8. **Keyboard Shortcuts**:
   * `/` : Focuses the search input bar.
   * `Ctrl + Alt + N` : Opens the "Create Prompt" modal.
   * `Escape` : Closes any active modal/dialog.

---

## Getting Started

The project has been configured to work immediately with zero manual setup.

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+)

### Running the Application

1. **Clone/Open Workspace**:
   Navigate to the project root:
   ```bash
   cd C:\Users\yuvraj manale\.gemini\antigravity\scratch\ai-prompt-library
   ```

2. **Start the Backend Server**:
   ```bash
   cd backend
   npm run dev
   ```
   *Note: If no `MONGODB_URI` environment variable is defined in `backend/.env`, it will automatically download and start an in-memory MongoDB server instance. This ensures you do not need MongoDB running on your machine.*

3. **Start the React Frontend**:
   Open a separate terminal window:
   ```bash
   cd frontend
   npm run dev
   ```
   Open the browser link displayed in the console (usually `http://localhost:5173` or `http://localhost:5174`).

---

## Connecting a Custom Database (Optional)

To connect the application to a real database (e.g. MongoDB Atlas):
1. Create a file named `.env` inside the `backend/` folder.
2. Add your MongoDB connection string:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/prompt-library?retryWrites=true&w=majority
   PORT=5000
   ```
3. Restart the backend server. It will automatically detect the `.env` variable and hook up to your database.
