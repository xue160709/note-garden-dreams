
import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { NoteListItem, type Note } from '@/components/NoteListItem';
import { NoteEditor } from '@/components/NoteEditor';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';

// Mock data for initial notes
const initialNotes: Note[] = [
  {
    id: '1',
    title: '欢迎使用笔记本',
    content: '这是您的第一个笔记。您可以在这里记录您的想法、创意和任务。',
    tags: ['欢迎', '入门'],
    createdAt: new Date('2025-04-10T12:00:00'),
    updatedAt: new Date('2025-04-10T12:00:00'),
  },
  {
    id: '2',
    title: '如何使用标签',
    content: '标签是一种强大的组织工具，可以帮助您快速找到相关笔记。点击添加标签按钮来创建新标签。',
    tags: ['提示', '标签', '组织'],
    createdAt: new Date('2025-04-11T08:30:00'),
    updatedAt: new Date('2025-04-11T08:30:00'),
  },
  {
    id: '3',
    title: '每日任务',
    content: '1. 完成项目报告\n2. 回复邮件\n3. 准备明天的会议',
    tags: ['任务', '工作'],
    createdAt: new Date('2025-04-12T09:15:00'),
    updatedAt: new Date('2025-04-12T09:15:00'),
  },
];

export default function Index() {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const { toast } = useToast();

  // Get the currently selected note
  const selectedNote = selectedNoteId ? notes.find(note => note.id === selectedNoteId) : undefined;

  // Get all notebooks and tags from notes
  const notebooks = Array.from(new Set(notes.map(note => {
    // Here you would extract the notebook from the note
    // For now, we'll simulate with the first tag
    return note.tags[0] || 'Untitled';
  })));
  
  const tags = Array.from(new Set(notes.flatMap(note => note.tags)));

  // Filter notes based on selected category or tag
  const filteredNotes = notes.filter(note => {
    if (selectedCategory) {
      // For demo purposes, we're using the first tag as a category
      // In a real app, you'd have a specific notebook field
      return note.tags[0] === selectedCategory;
    }
    if (selectedTag) {
      return note.tags.includes(selectedTag);
    }
    return true;
  });

  // Create a new note
  const handleNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: '新笔记',
      content: '',
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setNotes([newNote, ...notes]);
    setSelectedNoteId(newNote.id);
    
    toast({
      title: "已创建新笔记",
      description: "您可以开始编辑笔记了",
    });
  };

  // Save note
  const handleSaveNote = (updatedNote: Partial<Note>) => {
    setNotes(prevNotes => 
      prevNotes.map(note => 
        note.id === updatedNote.id 
          ? { ...note, ...updatedNote } as Note
          : note
      )
    );
    
    toast({
      title: "已保存",
      description: "您的笔记已成功保存",
    });
  };

  // Delete note
  const handleDeleteNote = (id: string) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
    setSelectedNoteId(null);
    
    toast({
      title: "已删除",
      description: "笔记已被删除",
      variant: "destructive",
    });
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Handle category click
  const handleCategoryClick = (category: string | null) => {
    setSelectedCategory(category);
    setSelectedTag(null);
  };

  // Handle tag click
  const handleTagClick = (tag: string) => {
    setSelectedTag(tag);
    setSelectedCategory(null);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        onNewNote={handleNewNote}
        onCategoryClick={handleCategoryClick}
        onTagClick={handleTagClick}
        selectedCategory={selectedCategory}
        notebooks={notebooks}
        tags={tags}
      />
      
      {/* Notes List */}
      <div className={`border-r border-border ${selectedNoteId ? 'w-1/3' : 'w-2/3'} flex flex-col h-full`}>
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">
            {selectedCategory ? selectedCategory : selectedTag ? `标签: ${selectedTag}` : '所有笔记'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {filteredNotes.length} 个笔记
          </p>
        </div>
        
        <ScrollArea className="flex-grow">
          <div className="p-4">
            {filteredNotes.map(note => (
              <NoteListItem
                key={note.id}
                note={note}
                isSelected={selectedNoteId === note.id}
                onClick={() => setSelectedNoteId(note.id)}
              />
            ))}
            
            {filteredNotes.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>没有找到笔记</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
      
      {/* Note Editor */}
      {selectedNoteId ? (
        <div className="w-2/3 h-full">
          <NoteEditor 
            note={selectedNote} 
            onSave={handleSaveNote}
            onDelete={handleDeleteNote}
          />
        </div>
      ) : (
        <div className="w-1/3 h-full hidden md:flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p>选择一个笔记来查看和编辑</p>
            <p>或</p>
            <button
              onClick={handleNewNote}
              className="text-note-purple hover:underline mt-2"
            >
              创建新笔记
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
