import { useState, useEffect } from 'react';
import { Note } from '@/components/NoteListItem';

const NOTES_STORAGE_KEY = 'note-garden-notes';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>(() => {
    // 从 localStorage 中读取初始数据
    const savedNotes = localStorage.getItem(NOTES_STORAGE_KEY);
    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes);
        // 将字符串日期转换为 Date 对象，并确保 tags 数组存在
        return parsedNotes.map((note: any) => ({
          ...note,
          tags: note.tags || [],
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt)
        }));
      } catch (error) {
        console.error('Failed to parse saved notes:', error);
        return [];
      }
    }
    return [];
  });

  // 当 notes 变化时保存到 localStorage
  useEffect(() => {
    try {
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
    } catch (error) {
      console.error('Failed to save notes:', error);
    }
  }, [notes]);

  return { notes, setNotes };
} 