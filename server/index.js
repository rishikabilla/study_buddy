const express = require('express');
const cors = require('cors');
const db = require('./db'); 

const app = express();
app.use(cors());
app.use(express.json());

// --- ROUTES ---

// 1. Get all courses
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await db('courses').select('*');
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Create a new course
app.post('/api/courses', async (req, res) => {
  try {
    const [id] = await db('courses').insert({ title: req.body.title });
    res.json({ id, title: req.body.title });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Get notes for a specific course
app.get('/api/notes/:courseId', async (req, res) => {
  try {
    const notes = await db('notes').where({ course_id: req.params.courseId });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Create a new note
app.post('/api/notes', async (req, res) => {
  try {
    const { title, content, course_id } = req.body;
    const [id] = await db('notes').insert({ 
      title: title || "New Note", 
      content: content || "", 
      course_id 
    });
    res.json({ id, title, content, course_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. UPDATE an existing note (The missing piece!)
app.put('/api/notes/:id', async (req, res) => {
  try {
    const { title, content } = req.body;
    await db('notes').where({ id: req.params.id }).update({ title, content });
    res.json({ message: "Updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. DELETE a note
app.delete('/api/notes/:id', async (req, res) => {
  try {
    await db('notes').where({ id: req.params.id }).del();
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`✅ Database routes for GET, POST, PUT, and DELETE are active!`);
});