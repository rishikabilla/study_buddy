const express = require('express');
const cors = require('cors');
const db = require('./db'); 
const Groq = require("groq-sdk");

const app = express();
app.use(cors());
app.use(express.json());

// --- AI CONFIGURATION ---
const groq = new Groq({ 
  apiKey: "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" 
});

// --- COURSE ROUTES (Root Resources) ---

app.get('/api/courses', async (req, res) => {
  try {
    const courses = await db('courses').select('*');
    res.json(courses);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/courses', async (req, res) => {
  try {
    const [id] = await db('courses').insert({ title: req.body.title });
    res.json({ id, title: req.body.title });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/courses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Database integrity: Ensure notes are deleted when a course is removed
    await db('notes').where({ course_id: id }).del();
    await db('courses').where({ id }).del();
    res.json({ message: "Course and associated notes deleted" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- NOTE ROUTES (Nested Sub-Resources) ---

/**
 * REFACTOR: Nested GET
 * Why: /api/courses/:courseId/notes clearly shows we are fetching 
 * resources that "belong" to a parent course.
 */
app.get('/api/courses/:courseId/notes', async (req, res) => {
  try {
    const notes = await db('notes').where({ course_id: req.params.courseId });
    res.json(notes);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * REFACTOR: Nested POST
 * Why: Using the ID in the URL path ensures the note is created 
 * within the correct context.
 */
app.post('/api/courses/:courseId/notes', async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, content } = req.body;
    const [id] = await db('notes').insert({ title, content, course_id: courseId });
    res.status(201).json({ id, title, content, course_id: courseId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- INDIVIDUAL NOTE ACTIONS ---
// Note: We keep these "flat" (/api/notes/:id) because once a note has a 
// unique ID, we no longer need the Course ID to find it.

app.put('/api/notes/:id', async (req, res) => {
  try {
    const { title, content } = req.body;
    await db('notes').where({ id: req.params.id }).update({ title, content });
    res.json({ message: "Note updated" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/notes/:id', async (req, res) => {
  try {
    await db('notes').where({ id: req.params.id }).del();
    res.json({ message: "Note deleted" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/notes/:id/clear-summary', async (req, res) => {
  try {
    await db('notes').where({ id: req.params.id }).update({ summary: null });
    res.json({ message: "Summary cleared" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/notes/:id/summarize', async (req, res) => {
  const { id } = req.params;
  try {
    const note = await db('notes').where({ id }).first();
    if (!note || !note.content) return res.status(400).json({ error: "No content to summarize" });

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "Summarize the study note in 1-2 concise sentences." },
        { role: "user", content: note.content }
      ],
      model: "llama-3.3-70b-versatile",
      max_tokens: 150,
    });

    const aiSummary = chatCompletion.choices[0]?.message?.content || "Summary failed.";
    await db('notes').where({ id }).update({ summary: aiSummary });
    res.json({ summary: aiSummary });

  } catch (err) {
    res.status(500).json({ error: "AI Error: " + err.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));