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
import { Button } from '@/components/ui/button';
import { Search, Book, Hash, ChevronDown, ChevronRight, PlusCircle } from 'lucide-react';
import { useNotes } from '@/hooks/useNotes';

const Index = () => {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const { notes, setNotes } = useNotes();
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
        note.id === updatedNote.id ? { 
          ...note, 
          ...updatedNote,
          updatedAt: new Date() 
        } as Note : note
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

  const handleCategoryClick = (category: string | null) => {
    setSelectedNotebook(category);
  };

  const handleTagClick = (tag: string) => {
    setSelectedTag(tag);
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <Sidebar>
          <SidebarHeader>
            <div className="p-4">
              <h1 className="text-lg font-semibold">笔记本</h1>
              <Button 
                className="bg-note-purple hover:bg-note-purple/90 text-white w-full p-2 rounded mt-2 flex items-center justify-center"
                onClick={handleNewNote}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                新建笔记
              </Button>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <div className="px-4">
              <Button
                variant="ghost"
                className="w-full justify-start font-normal mb-1"
                onClick={() => handleCategoryClick(null)}
              >
                <Book className="h-5 w-5 mr-2" />
                所有笔记
              </Button>

              {/* Notebooks Section */}
              <div className="py-1">
                <div className="flex items-center py-2 text-sm font-medium">
                  <ChevronDown className="h-4 w-4 mr-1" />
                  <Book className="h-4 w-4 mr-2" />
                  笔记本
                </div>
                <div className="pl-9">
                  {notebooks.map((notebook) => (
                    <Button
                      key={notebook}
                      variant="ghost"
                      className="w-full justify-start py-1 px-2 font-normal text-sm"
                      onClick={() => handleCategoryClick(notebook)}
                    >
                      {notebook}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Tags Section */}
              <div className="py-1">
                <div className="flex items-center py-2 text-sm font-medium">
                  <ChevronDown className="h-4 w-4 mr-1" />
                  <Hash className="h-4 w-4 mr-2" />
                  标签
                </div>
                <div className="pl-9">
                  {tags.map((tag) => (
                    <Button
                      key={tag}
                      variant="ghost"
                      className="w-full justify-start py-1 px-2 font-normal text-sm"
                      onClick={() => handleTagClick(tag)}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
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
        <SidebarTrigger />
      </div>
    </SidebarProvider>
  );
};

export default Index;
