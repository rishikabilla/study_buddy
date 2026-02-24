import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = "http://localhost:5000/api";

function App() {
  const [courses, setCourses] = useState([]);
  const [activeCourse, setActiveCourse] = useState(null);
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);

  // 1. Fetch Courses
  const fetchCourses = async () => {
    try {
      const res = await axios.get(`${API_BASE}/courses`);
      setCourses(res.data);
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  // 2. Fetch Notes for the active course (Nested GET)
  const fetchNotes = async (courseId) => {
    try {
      const res = await axios.get(`${API_BASE}/courses/${courseId}/notes`);
      setNotes(res.data);
    } catch (err) {
      console.error("Error fetching notes:", err);
    }
  };

  useEffect(() => { fetchCourses(); }, []);

  const addCourse = async (e) => {
    e.preventDefault();
    if (!newCourseTitle) return;
    await axios.post(`${API_BASE}/courses`, { title: newCourseTitle });
    setNewCourseTitle("");
    fetchCourses();
  };

  // 3. FIXED: Add Note (Nested POST)
  const addNote = async () => {
    if (!activeCourse) {
      alert("Please click a course in the left sidebar first!");
      return;
    }
    
    try {
      // URL now correctly uses the Course ID as a param
      // Body only contains data specific to the Note resource
      await axios.post(`${API_BASE}/courses/${activeCourse.id}/notes`, {
        title: "New Note",
        content: ""
      });
      fetchNotes(activeCourse.id);
    } catch (err) {
      console.error("Error creating note:", err.response?.data || err.message);
    }
  };

  const saveNote = async () => {
    if (!activeNote) return;
    try {
      await axios.put(`${API_BASE}/notes/${activeNote.id}`, {
        title: activeNote.title,
        content: activeNote.content
      });
      alert("✅ Note saved successfully!"); 
      fetchNotes(activeCourse.id);
    } catch (err) {
      alert("❌ Error saving note: " + err.message);
    }
  };

  const deleteNote = async (id) => {
    if (!window.confirm("Delete this note?")) return;
    try {
      await axios.delete(`${API_BASE}/notes/${id}`);
      fetchNotes(activeCourse.id);
      if (activeNote?.id === id) setActiveNote(null);
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Could not delete note.");
    }
  };

  const deleteCourse = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Warning: This will delete the course and ALL notes inside it. Continue?")) return;
    try {
      await axios.delete(`${API_BASE}/courses/${id}`);
      fetchCourses();
      if (activeCourse?.id === id) {
        setActiveCourse(null);
        setNotes([]);
        setActiveNote(null);
      }
    } catch (err) {
      console.error("Failed to delete course:", err);
    }
  };

  const generateSummary = async () => {
    if (!activeNote || !activeNote.content) {
      alert("Please add some content and SAVE the note before summarizing.");
      return;
    }

    setIsSummarizing(true);
    try {
      const res = await axios.put(`${API_BASE}/notes/${activeNote.id}/summarize`);
      setActiveNote({ ...activeNote, summary: res.data.summary });
      fetchNotes(activeCourse.id); 
    } catch (err) {
      alert("AI Error: " + (err.response?.data?.error || "Connection failed"));
    } finally {
      setIsSummarizing(false);
    }
  };

  const clearSummary = async () => {
    if (!activeNote || !window.confirm("Remove this summary?")) return;
    try {
      await axios.put(`${API_BASE}/notes/${activeNote.id}/clear-summary`);
      setActiveNote({ ...activeNote, summary: null });
      fetchNotes(activeCourse.id);
    } catch (err) {
      alert("Error clearing summary: " + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif', overflow: 'hidden' }}>
      
      {/* COLUMN 1: COURSES */}
      <div style={{ width: '220px', background: '#1a202c', color: 'white', padding: '15px' }}>
        <h3 style={{ marginTop: 0 }}>Courses</h3>
        <form onSubmit={addCourse} style={{ marginBottom: '20px' }}>
          <input 
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: 'none' }} 
            value={newCourseTitle} 
            onChange={e => setNewCourseTitle(e.target.value)} 
            placeholder="+ Add Course" 
          />
        </form>
        {courses.map(c => (
          <div 
            key={c.id} 
            onClick={() => { setActiveCourse(c); fetchNotes(c.id); setActiveNote(null); }} 
            style={{ 
              padding: '10px', cursor: 'pointer', borderRadius: '4px', marginBottom: '5px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: activeCourse?.id === c.id ? '#4a5568' : 'transparent' 
            }}
          >
            <span>{c.title}</span>
            <button onClick={(e) => deleteCourse(e, c.id)} style={{ background: 'none', border: 'none', color: '#fc8181', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
          </div>
        ))}
      </div>

      {/* COLUMN 2: NOTES LIST */}
      <div style={{ width: '280px', borderRight: '1px solid #ddd', padding: '15px', background: '#fff', overflowY: 'auto' }}>
        <button onClick={addNote} style={{ width: '100%', padding: '10px', marginBottom: '15px', cursor: 'pointer', background: '#edf2f7', border: '1px solid #cbd5e0', borderRadius: '4px', fontWeight: 'bold' }}>
          + New Note
        </button>
        {notes.map(n => (
          <div key={n.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
            <div onClick={() => setActiveNote(n)} style={{ flex: 1, padding: '12px 10px', cursor: 'pointer', background: activeNote?.id === n.id ? '#edf2f7' : 'transparent' }}>
              {n.title || "Untitled Note"}
            </div>
            <button onClick={() => deleteNote(n.id)} style={{ background: 'none', border: 'none', color: '#e53e3e', cursor: 'pointer', padding: '10px', fontSize: '16px' }}>✕</button>
          </div>
        ))}
      </div>

      {/* COLUMN 3: THE EDITOR */}
      <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', background: '#f7fafc' }}>
        {activeNote ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <input 
                style={{ fontSize: '24px', fontWeight: 'bold', border: 'none', outline: 'none', background: 'transparent', flex: 1 }}
                value={activeNote.title}
                onChange={e => setActiveNote({...activeNote, title: e.target.value})}
                placeholder="Note Title"
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={generateSummary} 
                  disabled={isSummarizing}
                  style={{ 
                    background: isSummarizing ? '#9f7aea' : '#805ad5', 
                    color: 'white', border: 'none', padding: '6px 15px', borderRadius: '4px', 
                    cursor: isSummarizing ? 'not-allowed' : 'pointer', fontWeight: 'bold' 
                  }}
                >
                  {isSummarizing ? "⌛ Thinking..." : "✨ Summarize"}
                </button>
                <button 
                  onClick={() => setActiveNote(null)} 
                  style={{ background: '#cbd5e0', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}
                >
                  Close ✕
                </button>
              </div>
            </div>

            {activeNote.summary && (
              <div style={{ background: '#fff9db', border: '1px solid #fab005', padding: '15px', borderRadius: '8px', marginBottom: '15px', color: '#856404', fontSize: '14px', lineHeight: '1.4' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span><strong>💡 AI Summary:</strong> {activeNote.summary}</span>
                  <button onClick={clearSummary} style={{ background: 'none', border: 'none', color: '#e67e22', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', marginLeft: '10px' }}>
                    Clear ✕
                  </button>
                </div>
              </div>
            )}

            <textarea 
              style={{ flex: 1, padding: '15px', fontSize: '16px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none', resize: 'none', lineHeight: '1.5' }}
              value={activeNote.content}
              onChange={e => setActiveNote({...activeNote, content: e.target.value})}
              placeholder="Start typing your notes here..."
            />
            
            <button 
              onClick={saveNote} 
              style={{ marginTop: '15px', padding: '12px', background: '#3182ce', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
            >
              Save Changes
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#a0aec0' }}>
            <span style={{ fontSize: '50px', marginBottom: '10px' }}>📝</span>
            <h3>Select a note to start writing</h3>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;