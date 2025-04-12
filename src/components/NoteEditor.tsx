
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Tag, Save, Trash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { type Note } from './NoteListItem';

interface NoteEditorProps {
  note?: Note;
  onSave?: (note: Partial<Note>) => void;
  onDelete?: (id: string) => void;
}

export function NoteEditor({ note, onSave, onDelete }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [tags, setTags] = useState<string[]>(note?.tags || []);
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = () => {
    if (onSave) {
      onSave({
        id: note?.id,
        title,
        content,
        tags,
        updatedAt: new Date()
      });
    }
  };

  const handleDelete = () => {
    if (note?.id && onDelete) {
      onDelete(note.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <Card className="p-6 h-full flex flex-col">
      <div className="mb-4">
        <Input
          placeholder="笔记标题..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-xl font-medium border-none bg-transparent focus-visible:ring-0 p-0 mb-2"
        />
        
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map(tag => (
            <Badge 
              key={tag} 
              className="bg-note-light-purple text-note-dark-purple hover:bg-note-light-purple/80"
              onClick={() => handleRemoveTag(tag)}
            >
              {tag}
              <span className="ml-1">×</span>
            </Badge>
          ))}
          
          <div className="flex items-center">
            <Tag className="h-4 w-4 text-note-neutral-gray mr-1" />
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="添加标签..."
              className="border-none bg-transparent focus-visible:ring-0 p-0 h-auto w-24"
            />
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0" 
              onClick={handleAddTag}
            >
              <PlusCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Textarea
        placeholder="开始您的笔记..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-grow resize-none border-none focus-visible:ring-0"
      />

      <div className="flex justify-between mt-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleDelete} 
          className="text-destructive hover:bg-destructive/10"
          disabled={!note?.id}
        >
          <Trash className="h-4 w-4 mr-1" />
          删除
        </Button>
        <Button onClick={handleSave} className="bg-note-purple hover:bg-note-purple/90">
          <Save className="h-4 w-4 mr-1" />
          保存
        </Button>
      </div>
    </Card>
  );
}
