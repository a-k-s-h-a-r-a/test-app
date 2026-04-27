/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  FileText, 
  ChevronLeft, 
  MoreVertical,
  Clock,
  Layout,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import { cn } from './lib/utils';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'nova-notes-data';

export default function App() {
  // State
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  // Derived data
  const filteredNotes = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase();
    return notes
      .filter(n => n.title.toLowerCase().includes(lowerQuery) || n.content.toLowerCase().includes(lowerQuery))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [notes, searchQuery]);

  const selectedNote = notes.find(n => n.id === selectedNoteId) || null;

  // Actions
  const createNote = () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: 'Untitled Note',
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes(prev => [newNote, ...prev]);
    setSelectedNoteId(newNote.id);
    setIsPreviewMode(false);
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(n => 
      n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n
    ));
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (selectedNoteId === id) setSelectedNoteId(null);
  };

  return (
    <div className="flex h-screen bg-natural-bg text-natural-text font-serif selection:bg-[#5a5a40]/10 overflow-hidden">
      {/* Sidebar / Notes List */}
      <AnimatePresence initial={false}>
        {isSidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="bg-natural-sidebar border-r border-black/5 flex flex-col relative z-20"
          >
            <div className="p-6 flex flex-col h-full">
              <header className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-natural-accent flex items-center justify-center">
                    <Layout className="w-5 h-5 text-natural-bg" />
                  </div>
                  <h1 className="font-bold text-xl tracking-tight font-serif text-natural-accent">Oasis Notes</h1>
                </div>
                <button 
                  onClick={createNote}
                  className="w-10 h-10 rounded-full bg-white/50 border border-black/5 flex items-center justify-center hover:bg-white transition-colors"
                  title="New Note"
                >
                  <Plus className="w-5 h-5 text-natural-accent" />
                </button>
              </header>

              <div className="flex flex-col gap-1 mb-8 font-sans font-medium text-sm">
                <div className="flex items-center gap-2 px-3 py-2 bg-natural-accent/10 text-natural-accent rounded-lg cursor-pointer">
                  <BookOpen className="w-4 h-4" />
                  All Notes
                </div>
                <div className="flex items-center gap-2 px-3 py-2 text-natural-text/60 hover:bg-black/5 rounded-lg cursor-pointer">
                  <FileText className="w-4 h-4" />
                  Favorites
                </div>
                <div className="flex items-center gap-2 px-3 py-2 text-natural-text/60 hover:bg-black/5 rounded-lg cursor-pointer">
                  <Layout className="w-4 h-4" />
                  Work
                </div>
              </div>

              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-natural-muted" />
                <input 
                  type="text"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-black/10 rounded-full py-2.5 pl-10 pr-4 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-natural-accent/20 transition-all placeholder:text-natural-muted/60"
                />
              </div>

              <div className="flex-1 overflow-y-auto -mx-2 px-2 custom-scrollbar">
                <div className="space-y-px">
                  {filteredNotes.map((note) => (
                    <motion.div
                      layout
                      key={note.id}
                      onClick={() => setSelectedNoteId(note.id)}
                      className={cn(
                        "p-5 cursor-pointer transition-all border-b border-black/5 flex flex-col gap-1 group",
                        selectedNoteId === note.id 
                          ? "bg-white border-l-4 border-l-natural-accent" 
                          : "hover:bg-black/5"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={cn(
                          "font-bold truncate text-base",
                          selectedNoteId === note.id ? "text-natural-text" : "text-natural-text/80"
                        )}>
                          {note.title || 'Untitled'}
                        </h3>
                        {selectedNoteId === note.id && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNote(note.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-700 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="text-sm font-sans text-natural-muted line-clamp-2 leading-relaxed">
                        {note.content || 'No content yet...'}
                      </p>
                      <div className="flex items-center gap-1 mt-2 opacity-60 font-sans">
                        <span className="text-[10px] text-natural-muted uppercase tracking-widest font-bold">
                          {format(note.updatedAt, 'MMM d, h:mm a')}
                        </span>
                      </div>
                    </motion.div>
                  ))}

                  {filteredNotes.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 text-center opacity-40">
                      <FileText className="w-8 h-8 mb-2" />
                      <p className="text-xs font-bold font-sans">No notes found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Area (Natural Tones card-style editor) */}
      <main className="flex-1 flex flex-col relative min-w-0 bg-natural-bg">
        {/* Toolbar */}
        <header className="h-16 flex items-center justify-between px-8 shrink-0 relative z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-natural-sidebar rounded-full transition-colors text-natural-muted"
            >
              {isSidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5 rotate-180" />}
            </button>
            <div className="h-4 w-px bg-natural-muted/20" />
            <div className="flex items-center gap-2 font-sans">
              <button 
                onClick={() => setIsPreviewMode(false)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5",
                  !isPreviewMode ? "bg-natural-accent text-white" : "text-natural-muted hover:text-natural-text"
                )}
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit
              </button>
              <button 
                onClick={() => setIsPreviewMode(true)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5",
                  isPreviewMode ? "bg-natural-accent text-white" : "text-natural-muted hover:text-natural-text"
                )}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Preview
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <button className="p-2 hover:bg-natural-sidebar rounded-full transition-colors text-natural-muted">
               <MoreVertical className="w-5 h-5" />
             </button>
          </div>
        </header>

        {/* Editor Container (The white card) */}
        <div className="flex-1 overflow-y-auto relative no-scrollbar">
          <AnimatePresence mode="wait">
            {selectedNote ? (
              <motion.div 
                key={selectedNote.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="max-w-4xl mx-auto mb-8 px-12 py-16 w-full min-h-[calc(100%-2rem)] bg-white rounded-[32px] shadow-[0_4px_24px_rgba(0,0,0,0.02)]"
              >
                <div className="mb-1 text-sm font-sans text-natural-muted uppercase tracking-wider font-bold">
                  {format(selectedNote.updatedAt, 'EEEE, MMMM d, yyyy')}
                </div>
                <input 
                  type="text"
                  value={selectedNote.title}
                  onChange={(e) => updateNote(selectedNote.id, { title: e.target.value })}
                  placeholder="Note Title"
                  className="w-full text-5xl font-bold text-natural-text bg-transparent border-none outline-none mb-8 placeholder:opacity-10"
                />

                {isPreviewMode ? (
                  <div className="prose prose-stone max-w-none text-natural-text leading-relaxed markdown-container text-lg">
                    <ReactMarkdown>{selectedNote.content || '*No content yet*'}</ReactMarkdown>
                  </div>
                ) : (
                  <textarea 
                    value={selectedNote.content}
                    onChange={(e) => updateNote(selectedNote.id, { content: e.target.value })}
                    placeholder="Start typing your thoughts..."
                    className="w-full h-[calc(100%-12rem)] bg-transparent border-none outline-none resize-none text-xl text-natural-text leading-relaxed placeholder:opacity-10"
                    autoFocus
                  />
                )}

                <div className="flex gap-2 mt-12 font-sans overflow-x-auto no-scrollbar">
                  <span className="text-xs bg-natural-sidebar px-3 py-1.5 rounded-full text-natural-muted font-bold">#thoughts</span>
                  <span className="text-xs bg-natural-sidebar px-3 py-1.5 rounded-full text-natural-muted font-bold">#notes</span>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full text-center p-8 font-sans"
              >
                <div className="w-24 h-24 rounded-[32px] bg-natural-sidebar flex items-center justify-center mb-6 shadow-inner border border-black/5">
                  <Layout className="w-12 h-12 text-natural-accent/20" />
                </div>
                <h2 className="text-2xl font-bold text-natural-accent mb-2">Capture your thoughts</h2>
                <p className="text-natural-muted max-w-xs mb-8 text-sm leading-relaxed">
                  Every great idea starts with a simple note. Pick an existing one or start fresh.
                </p>
                <button 
                  onClick={createNote}
                  className="bg-natural-accent text-white px-8 py-4 rounded-full font-bold hover:opacity-90 transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-natural-accent/20"
                >
                  <Plus className="w-5 h-5" />
                  Create New Note
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Floating Action Button */}
        {!selectedNoteId && isSidebarOpen && (
           <button 
            onClick={createNote}
            className="md:hidden fixed right-8 bottom-8 w-16 h-16 rounded-full bg-natural-accent text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-30"
          >
            <Plus className="w-6 h-6" />
          </button>
        )}
      </main>

      {/* Global CSS Overrides for custom components */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0,0,0,0.1);
        }
        
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .markdown-container h1 { font-size: 2.25em; font-weight: 700; margin-bottom: 0.5em; color: var(--color-natural-text); }
        .markdown-container h2 { font-size: 1.75em; font-weight: 700; margin-top: 1.25em; margin-bottom: 0.5em; color: var(--color-natural-text); }
        .markdown-container p { margin-bottom: 1.25em; line-height: 1.7; color: var(--color-natural-text); }
        .markdown-container ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 1.25em; }
        .markdown-container ol { list-style-type: decimal; padding-left: 1.5em; margin-bottom: 1.25em; }
        .markdown-container blockquote { border-left: 4px solid var(--color-natural-accent); padding-left: 1.5em; color: var(--color-natural-muted); font-style: italic; margin-bottom: 1.25em; opacity: 0.8; }
        .markdown-container code { background: var(--color-natural-sidebar); padding: 0.2rem 0.4rem; border-radius: 4px; font-size: 0.85em; font-family: monospace; }
        .markdown-container pre { background: var(--color-natural-text); color: white; padding: 1.5em; border-radius: 16px; overflow-x: auto; margin-bottom: 1.25em; }
        .markdown-container strong { font-weight: 700; color: var(--color-natural-accent); }
      `}</style>
    </div>
  );
}

