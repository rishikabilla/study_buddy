# 📚 StudyBuddy: AI-Powered Study Organizer

**StudyBuddy** is a high-performance productivity tool that helps students organize course materials and generate instant, AI-driven summaries of complex notes using the **Groq LPU Inference Engine**.

---

## ✨ Key Features
* **Hierarchical Organization:** Organize study materials by Course/Subject.
* **Instant Summarization:** Powered by **Groq (Llama 3.3 70B)** for sub-second AI summaries.
* **Persistent Storage:** Uses **SQLite** via Knex.js to ensure your data stays safe locally.
* **Clean UI/UX:** Built with a modern sidebar and focus-driven editor.
* **Automatic Cleanup:** Deleting a course automatically wipes all nested notes (Cascade Delete).

---

## 🛠️ Tech Stack
* **Frontend:** React (Vite), Axios, React Router
* **Backend:** Node.js, Express, Knex.js
* **Database:** SQLite3
* **AI Inference:** Groq Cloud SDK

---

## 📊 Database Schema
The application follows a relational structure where one course can contain many notes.
<img width="684" height="312" alt="Untitled" src="https://github.com/user-attachments/assets/b3ff2740-802b-439e-9461-5ec51484f74c" />

---
## 📝 API Documentation (Endpoints)

| Method | Endpoint | Description | Request Body (JSON) |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/courses` | Fetch all courses | N/A |
| `POST` | `/api/courses` | Create a new course | `{"title": "Course Name"}` |
| `DELETE` | `/api/courses/:id` | Delete course & notes | N/A |
| `GET` | `/api/courses/:id/notes` | Get notes for a specific course | N/A |
| `POST` | `/api/courses/:id/notes` | **Add a new note** to a course | `{"title": "Note Title", "content": "..."}` |
| `PUT` | `/api/notes/:id` | Update note title or content | `{"title": "New Title", "content": "..."}` |
| `PUT` | `/api/notes/:id/summarize` | **AI:** Generate summary via Groq | N/A |
| `DELETE` | `/api/notes/:id` | Delete a specific note | N/A |

---
## ⚙️ Setup & Installation

### 1. Prerequisites
* Node.js (v18+)
* Groq API Key (Get one at [console.groq.com](https://console.groq.com))

### 2. Server Configuration
```bash
cd server
npm install
