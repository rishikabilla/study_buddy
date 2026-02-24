# 📚 StudyBuddy: AI-Powered Study Organizer

**StudyBuddy** is a high-performance productivity tool that helps students organize course materials and generate instant, AI-driven summaries of complex notes using the **Groq LPU Inference Engine**.

[🎥 Watch the Demo Video](https://drive.google.com/file/d/1cv9I8RPatSihvC2T1UxZyBzkvGBTT-lr/view?usp=sharing)
---
## ✨ Key Features and Technical Implementation:
* **Data Validation:** The system implements strict validation logic that prevents the creation of empty notes, ensuring a clean and useful database.
* **Breadcrumb Navigation:** To enhance user experience, the frontend features breadcrumb navigation that provides a clear, folder-like structure of the current route.
* **Transactional Cascade Delete:** When a course is removed, the backend automatically deletes all associated notes first to maintain relational integrity.
* **Dynamic Database Updates:** Every time a summary is generated via the AI, the database is immediately updated to ensure that the summary persists across user sessions.
* **Sub-Second Latency:** Leveraging Groq's hardware allows for summarization responses in under 500ms, providing a seamless flow for the student.
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

The backend follows RESTful principles, providing endpoints for managing courses and notes, integrated with AI summarization.

| Method | Endpoint | Description | Request Body (JSON) |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/courses` | Fetch all available courses. | N/A |
| `POST` | `/api/courses` | Create a new course category. | `{"title": "Subject Name"}` |
| `DELETE` | `/api/courses/:id` | **Cascade Delete:** Removes a course and all associated notes. | N/A |
| `GET` | `/api/courses/:courseId/notes` | Fetch all notes belonging to a specific course. | N/A |
| `POST` | `/api/courses/:courseId/notes` | **Add Note:** Create a new note within a course context. | `{"title": "Note Title", "content": "..."}` |
| `PUT` | `/api/notes/:id` | Update a note's title or text content. | `{"title": "New Title", "content": "..."}` |
| `PUT` | `/api/notes/:id/summarize` | **AI Feature:** Generate a 1-2 sentence summary via Groq (Llama 3.3). | N/A |
| `PUT` | `/api/notes/:id/clear-summary` | Reset and remove the AI summary for a note. | N/A |
| `DELETE` | `/api/notes/:id` | Delete a specific note. | N/A |

---
### Data Validation while adding Course and Notes
<img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/ca84de9c-6fae-434d-bb17-fda94a7a79e0" />
<img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/cfffabf7-6698-4bdc-8b2a-062c1c9caa14" />

## Summarizing the Notes
<img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/64af13dc-1982-48e2-bc75-9101badbfdba" />

## ⚙️ Setup & Installation

### 1. Prerequisites
* Node.js (v18+)
* Groq API Key (Get one at [console.groq.com](https://console.groq.com))

### 2. Server Configuration
```bash
cd server
npm install







