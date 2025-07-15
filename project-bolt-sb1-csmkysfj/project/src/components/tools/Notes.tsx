import React, { useState, useEffect } from 'react';
import { StickyNote, Plus, Edit3, Trash2, Save, X } from 'lucide-react';
import { Note } from '../types';

const Notes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Load notes from localStorage on component mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  const createNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: '',
      content: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setEditingNote(newNote);
    setIsCreating(true);
  };

  const saveNote = (note: Note) => {
    if (isCreating) {
      setNotes([...notes, note]);
      setIsCreating(false);
    } else {
      setNotes(notes.map(n => n.id === note.id ? { ...note, updatedAt: new Date() } : n));
    }
    setEditingNote(null);
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const cancelEdit = () => {
    setEditingNote(null);
    setIsCreating(false);
  };

  const NoteEditor: React.FC<{ note: Note; onSave: (note: Note) => void; onCancel: () => void }> = ({
    note,
    onSave,
    onCancel
  }) => {
    const [title, setTitle] = useState(note.title);
    const [content, setContent] = useState(note.content);

    const handleSave = () => {
      if (title.trim() === '' && content.trim() === '') {
        onCancel();
        return;
      }
      onSave({
        ...note,
        title: title.trim() || 'Untitled Note',
        content: content.trim()
      });
    };

    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title..."
          className="w-full text-xl font-semibold border-none outline-none mb-4 p-2 bg-gray-50 rounded-lg"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your note here..."
          className="w-full h-64 border-none outline-none resize-none p-2 bg-gray-50 rounded-lg"
        />
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSave}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <StickyNote className="w-8 h-8 text-yellow-500" />
          Notes
        </h2>
        <button
          onClick={createNote}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Note
        </button>
      </div>

      {editingNote && (
        <NoteEditor
          note={editingNote}
          onSave={saveNote}
          onCancel={cancelEdit}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map((note) => (
          <div key={note.id} className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-800 truncate">
                {note.title || 'Untitled Note'}
              </h3>
              <div className="flex gap-1">
                <button
                  onClick={() => setEditingNote(note)}
                  className="p-1 text-gray-500 hover:text-blue-500 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-3 line-clamp-4">
              {note.content}
            </p>
            <div className="text-xs text-gray-500">
              Created: {new Date(note.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {notes.length === 0 && !editingNote && (
        <div className="text-center py-12">
          <StickyNote className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No notes yet</p>
          <p className="text-gray-400 text-sm">Click "New Note" to get started</p>
        </div>
      )}
    </div>
  );
};

export default Notes;