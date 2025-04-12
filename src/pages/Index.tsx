import React, { useState } from 'react';
import { NoteEditor } from '@/components/NoteEditor';
import { NoteListItem, type Note } from '@/components/NoteListItem';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger
} from '@/components/ui/sidebar';

// Sample data
const sampleNotes: Note[] = [
  {
    id: '1',
    title: '会议记录',
    content: '今天的会议我们讨论了项目进度...',
    tags: ['工作', '会议'],
    createdAt: new Date('2023-04-10'),
    updatedAt: new Date('2023-04-10')
  },
  {
    id: '2',
    title: '购物清单',
    content: '1. 牛奶\n2. 面包\n3. 水果',
    tags: ['个人', '购物'],
    createdAt: new Date('2023-04-08'),
    updatedAt: new Date('2023-04-09')
  },
  {
    id: '3',
    title: '学习计划',
    content: '本周学习React和TypeScript...',
    tags: ['学习', '编程'],
    createdAt: new Date('2023-04-05'),
    updatedAt: new Date('2023-04-07')
  }
];

const Index = () => {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [notes, setNotes] = useState<Note[]>(sampleNotes);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedNotebook, setSelectedNotebook] = useState<string | null>(null);

  // Get unique notebooks and tags
  const notebooks = Array.from(new Set(notes.map(note => note.tags[0] || 'Uncategorized')));
  const tags = Array.from(new Set(notes.flatMap(note => note.tags)));

  const filteredNotes = notes.filter(note => {
    if (selectedTag && !note.tags.includes(selectedTag)) return false;
    if (selectedNotebook && !note.tags.includes(selectedNotebook)) return false;
    return true;
  });

  const handleSaveNote = (updatedNote: Partial<Note>) => {
    if (updatedNote.id) {
      // Update existing note
      setNotes(notes.map(note => 
        note.id === updatedNote.id ? { ...note, ...updatedNote } as Note : note
      ));
    } else {
      // Create new note
      const newNote: Note = {
        id: Date.now().toString(),
        title: updatedNote.title || 'Untitled',
        content: updatedNote.content || '',
        tags: updatedNote.tags || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setNotes([newNote, ...notes]);
      setSelectedNote(newNote);
    }
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
    if (selectedNote && selectedNote.id === id) {
      setSelectedNote(null);
    }
  };

  const handleNewNote = () => {
    setSelectedNote(null);
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <Sidebar>
          <SidebarHeader>
            <div className="p-4">
              <h1 className="text-lg font-semibold">笔记本</h1>
              <button 
                className="bg-note-purple hover:bg-note-purple/90 text-white w-full p-2 rounded mt-2 flex items-center justify-center"
                onClick={handleNewNote}
              >
                新建笔记
              </button>
            </div>
          </SidebarHeader>
          <SidebarContent>
            {/* Sidebar content goes here */}
          </SidebarContent>
          <SidebarFooter>
            {/* Footer content */}
          </SidebarFooter>
        </Sidebar>

        {/* Note List */}
        <div className="w-1/3 border-r border-border h-full">
          <div className="p-4 border-b">
            <h2 className="text-lg font-medium">所有笔记</h2>
          </div>
          <ScrollArea className="h-[calc(100vh-60px)]">
            <div className="p-4">
              {filteredNotes.map(note => (
                <NoteListItem
                  key={note.id}
                  note={note}
                  isSelected={selectedNote?.id === note.id}
                  onClick={() => setSelectedNote(note)}
                />
              ))}
              {filteredNotes.length === 0 && (
                <p className="text-center text-muted-foreground p-4">No notes found</p>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Note Editor */}
        <div className="flex-1 h-full overflow-auto">
          <NoteEditor 
            note={selectedNote || undefined} 
            onSave={handleSaveNote}
            onDelete={handleDeleteNote}
          />
        </div>

        {/* Sidebar trigger for mobile */}
        <div className="fixed bottom-4 right-4 md:hidden">
          <SidebarTrigger />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
