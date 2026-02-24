import React, { useState, useEffect } from 'react';

import axios from 'axios';

import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';



const API_BASE = "http://localhost:5000/api";



const THEME = {
  sidebar: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)', // Gradient for depth
  sidebarHover: 'rgba(255, 255, 255, 0.08)',
  accentBlue: '#3b82f6',
  accentGreen: '#10b981',
  bgLight: '#f8fafc',
  border: '#e2e8f0',
  textMain: '#1e293b',
  textMute: '#64748b',
  sidebarText: '#94a3b8', // Softer text for non-active items
  danger: '#ef4444',
  editorBg: '#ffffff',
  glass: 'rgba(255, 255, 255, 0.7)',
  shadowSoft: '0 4px 20px -5px rgba(0,0,0,0.05)'
};



function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route path="/" element={<StudyBuddy />} />

        <Route path="/course/:courseId" element={<StudyBuddy />} />

        <Route path="/course/:courseId/note/:noteId" element={<StudyBuddy />} />

      </Routes>

    </BrowserRouter>

  );

}



function StudyBuddy() {

  const { courseId, noteId } = useParams();

  const navigate = useNavigate();

 

  const [courses, setCourses] = useState([]);

  const [notes, setNotes] = useState([]);

  const [activeNote, setActiveNote] = useState(null);

  const [newCourseTitle, setNewCourseTitle] = useState("");

  const [isSummarizing, setIsSummarizing] = useState(false);



  const fetchCourses = async () => {

    try {

      const res = await axios.get(`${API_BASE}/courses`);

      setCourses(res.data);

    } catch (err) { console.error(err); }

  };



  const fetchNotes = async (id) => {

    try {

      const res = await axios.get(`${API_BASE}/courses/${id}/notes`);

      setNotes(res.data);

    } catch (err) { console.error(err); }

  };



  useEffect(() => { fetchCourses(); }, []);

  useEffect(() => { if (courseId) fetchNotes(courseId); }, [courseId]);

 

  useEffect(() => {

    if (noteId && notes.length > 0) {

      const current = notes.find(n => n.id === parseInt(noteId));

      setActiveNote(current || null);

    } else if (!noteId) {

      setActiveNote(null);

    }

  }, [noteId, notes]);



  const addCourse = async (e) => {

    e.preventDefault();

    if (!newCourseTitle) return;

    await axios.post(`${API_BASE}/courses`, { title: newCourseTitle });

    setNewCourseTitle("");

    fetchCourses();

  };



  const deleteCourse = async (e, id) => {

    e.stopPropagation();

    if (!window.confirm("Delete this course and all its notes?")) return;

    try {

      await axios.delete(`${API_BASE}/courses/${id}`);

      if (courseId === id.toString()) navigate("/");

      fetchCourses();

    } catch (err) { console.error(err); }

  };



  const addNote = async () => {

    if (!courseId) return alert("Select a course first!");

    const res = await axios.post(`${API_BASE}/courses/${courseId}/notes`, { title: "New Note", content: "" });

    fetchNotes(courseId);

    navigate(`/course/${courseId}/note/${res.data.id}`);

  };



  const deleteNote = async (e, id) => {

    e.stopPropagation();

    if (!window.confirm("Delete this note?")) return;

    try {

      await axios.delete(`${API_BASE}/notes/${id}`);

      if (noteId === id.toString()) navigate(`/course/${courseId}`);

      fetchNotes(courseId);

    } catch (err) { console.error(err); }

  };



  const saveNote = async () => {
    if (!activeNote) return;

    // --- Validation Logic Start ---
    const isTitleEmpty = !activeNote.title || activeNote.title.trim() === "";
    const isContentEmpty = !activeNote.content || activeNote.content.trim() === "";

    if (isTitleEmpty && isContentEmpty) {
      return alert("Please enter both a title and content before saving.");
    } else if (isTitleEmpty) {
      return alert("Title is required to save the note.");
    } else if (isContentEmpty) {
      return alert("Content cannot be empty.");
    }
    // --- Validation Logic End ---

    try {
      await axios.put(`${API_BASE}/notes/${activeNote.id}`, { 
        title: activeNote.title, 
        content: activeNote.content 
      });
      alert("Note Saved!");
      fetchNotes(courseId);
    } catch (err) { 
      alert(err.message); 
    }
  };



  const generateSummary = async () => {

    if (!activeNote?.content) return alert("Add content first!");

    setIsSummarizing(true);

    try {

      const res = await axios.put(`${API_BASE}/notes/${activeNote.id}/summarize`);

      setActiveNote({ ...activeNote, summary: res.data.summary });

      fetchNotes(courseId);

    } finally { setIsSummarizing(false); }

  };



  return (

    <div style={{ display: 'flex', height: '100vh', backgroundColor: THEME.bgLight, color: THEME.textMain, fontFamily: "'Inter', sans-serif" }}>

     

{/* 1. SIDEBAR: Enhanced Dark Gradient */}
<div style={{ 
        width: '280px', 
        background: THEME.sidebar, 
        color: 'white', 
        padding: '30px 20px', 
        display: 'flex', 
        flexDirection: 'column',
        boxShadow: '4px 0 10px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '45px', paddingLeft: '5px' }}>
          <div style={{ 
            background: THEME.accentBlue, 
            width: '32px', 
            height: '32px', 
            borderRadius: '8px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '1.2rem'
          }}>🎓</div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, letterSpacing: '-0.02em', color: '#fff' }}>StudyBuddy</h2>
        </div>
        
        <div style={{ marginBottom: '35px' }}>
          <label style={{ fontSize: '0.7rem', fontWeight: '800', color: THEME.textMute, letterSpacing: '0.1em', marginBottom: '12px', display: 'block' }}>ADD COURSE</label>
          <form onSubmit={addCourse} style={{ position: 'relative' }}>
            <input 
              style={{ 
                width: '100%', 
                padding: '12px 14px', 
                borderRadius: '8px', 
                border: '1px solid #334155', 
                background: 'rgba(15, 23, 42, 0.5)', 
                color: 'white', 
                fontSize: '0.85rem', 
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s'
              }} 
              onFocus={(e) => e.target.style.borderColor = THEME.accentBlue}
              onBlur={(e) => e.target.style.borderColor = '#334155'}
              value={newCourseTitle} 
              onChange={e => setNewCourseTitle(e.target.value)} 
              placeholder="New course name..." 
            />
          </form>
        </div>

        <label style={{ fontSize: '0.7rem', fontWeight: '800', color: THEME.textMute, letterSpacing: '0.1em', marginBottom: '12px', display: 'block' }}>COURSES</label>
        <div style={{ flex: 1, overflowY: 'auto', margin: '0 -5px', padding: '0 5px' }}>
          {courses.map(c => {
            const isSelected = courseId === c.id.toString();
            return (
              <div 
                key={c.id} 
                onClick={() => navigate(`/course/${c.id}`)} 
                onMouseEnter={(e) => {
                   if(!isSelected) e.currentTarget.style.background = THEME.sidebarHover;
                   e.currentTarget.querySelector('.del-btn').style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                   if(!isSelected) e.currentTarget.style.background = 'transparent';
                   e.currentTarget.querySelector('.del-btn').style.opacity = '0';
                }}
                style={{ 
                  padding: '12px 14px', 
                  cursor: 'pointer', 
                  borderRadius: '10px', 
                  marginBottom: '6px', 
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  background: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                  color: isSelected ? '#fff' : THEME.sidebarText,
                  border: isSelected ? `1px solid rgba(59, 130, 246, 0.3)` : '1px solid transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ 
                    width: '6px', 
                    height: '6px', 
                    borderRadius: '50%', 
                    background: isSelected ? THEME.accentBlue : '#475569' 
                  }} />
                  <span style={{ fontSize: '0.9rem', fontWeight: isSelected ? '600' : '400' }}>{c.title}</span>
                </div>
                <button 
                  className="del-btn" 
                  onClick={(e) => deleteCourse(e, c.id)} 
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: THEME.danger, 
                    opacity: '0', 
                    cursor: 'pointer',
                    fontSize: '1rem',
                    padding: '0 5px',
                    transition: 'opacity 0.2s'
                  }}
                >✕</button>
              </div>
            );
          })}
        </div>
      </div>



      {/* 2. NOTE LIST: Clean & Airy */}

      <div style={{ width: '320px', borderRight: `1px solid ${THEME.border}`, padding: '25px', background: 'white' }}>

        <button

          onClick={addNote}

          style={{

            width: '100%', padding: '10px', marginBottom: '25px', cursor: 'pointer',

            background: 'white', color: THEME.accentBlue, border: `1px solid ${THEME.accentBlue}`,

            borderRadius: '6px', fontWeight: '600', transition: '0.2s'

          }}

          onMouseEnter={(e) => { e.target.style.background = THEME.accentBlue; e.target.style.color = 'white'; }}

          onMouseLeave={(e) => { e.target.style.background = 'white'; e.target.style.color = THEME.accentBlue; }}

        >

          + New Note

        </button>

       

        {notes.map(n => {

          const isSelected = noteId === n.id.toString();

          return (

            <div

              key={n.id}

              onClick={() => navigate(`/course/${courseId}/note/${n.id}`)}

              onMouseEnter={(e) => e.currentTarget.querySelector('.del-note').style.opacity = '1'}

              onMouseLeave={(e) => e.currentTarget.querySelector('.del-note').style.opacity = '0'}

              style={{

                padding: '16px', cursor: 'pointer', borderRadius: '8px', marginBottom: '10px', transition: '0.2s',

                display: 'flex', justifyContent: 'space-between',

                background: isSelected ? '#f0f7ff' : 'transparent',

                border: isSelected ? `1px solid #bfdbfe` : '1px solid transparent'

              }}

            >

              <div style={{ flex: 1 }}>

                <div style={{ fontWeight: '600', fontSize: '0.95rem', color: isSelected ? THEME.accentBlue : THEME.textMain }}>{n.title || "Untitled"}</div>

                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>{n.content ? n.content.substring(0, 40) + "..." : "Empty note"}</div>

              </div>

              <button className="del-note" onClick={(e) => deleteNote(e, n.id)} style={{ background: 'none', border: 'none', color: '#cbd5e1', opacity: '0', transition: '0.2s', cursor: 'pointer' }}>✕</button>

            </div>

          );

        })}

      </div>



      {/* 3. EDITOR: Modern Typography */}

      <div style={{ flex: 1, padding: '50px', overflowY: 'auto', background: 'white' }}>

        {activeNote ? (

          <div style={{ maxWidth: '800px', margin: '0 auto' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>

              <input

                style={{ fontSize: '2rem', fontWeight: '800', border: 'none', outline: 'none', width: '60%', color: THEME.textMain }}

                value={activeNote.title}

                onChange={e => setActiveNote({...activeNote, title: e.target.value})}

              />

              <div style={{ display: 'flex', gap: '10px' }}>

                <button onClick={generateSummary} disabled={isSummarizing} style={{ background: '#f0fdf4', color: THEME.accentGreen, border: `1px solid ${THEME.accentGreen}`, padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>

                  {isSummarizing ? "⌛" : "Summarize"}

                </button>

                <button onClick={saveNote} style={{ background: THEME.accentBlue, color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Save</button>

              </div>

            </div>



            {activeNote.summary && (

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>

                <div style={{ fontSize: '0.7rem', fontWeight: '800', color: THEME.accentGreen, marginBottom: '8px' }}>AI SUMMARY</div>

                <p style={{ margin: 0, color: '#475569', lineHeight: '1.6', fontSize: '0.95rem' }}>{activeNote.summary}</p>

              </div>

            )}



            <textarea

              style={{

                width: '100%', minHeight: '60vh', padding: '0', fontSize: '1.1rem', lineHeight: '1.8',

                border: 'none', outline: 'none', resize: 'none', color: '#334155', background: 'transparent'

              }}

              value={activeNote.content}

              onChange={e => setActiveNote({...activeNote, content: e.target.value})}

              placeholder="Write your notes here..."

            />

          </div>

        ) : (

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#cbd5e1' }}>

            <div style={{ fontSize: '3rem', marginBottom: '20px', filter: 'grayscale(1)' }}>📖</div>

            <h3 style={{ fontWeight: '500', color: '#94a3b8' }}>Select a note to begin</h3>

          </div>

        )}

      </div>

    </div>

  );

}



export default App;