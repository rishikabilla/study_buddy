const express = require('express');
const cors = require('cors');
const db = require('./db'); // Imports the DB we just made

const app = express();
app.use(cors());
app.use(express.json());

// --- ROUTES ---

// Get all courses
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await db('courses').select('*');
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new course
app.post('/api/courses', async (req, res) => {
  try {
    const [id] = await db('courses').insert({ title: req.body.title });
    res.json({ id, title: req.body.title });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get notes for a specific course
app.get('/api/courses/:courseId/notes', async (req, res) => {
  try {
    const notes = await db('notes').where({ course_id: req.params.courseId });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new note
app.post('/api/notes', async (req, res) => {
  try {
    const { title, content, course_id } = req.body;
    const [id] = await db('notes').insert({ title, content, course_id });
    res.json({ id, title, content, course_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));