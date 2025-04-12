import React, { useState, useEffect } from 'react';
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
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setTitle(note?.title || '');
    setContent(note?.content || '');
    setTags(note?.tags || []);
    setIsEditing(false);
  }, [note]);

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
      setIsEditing(false);
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

  if (!note) {
    return (
      <Card className="absolute inset-0 m-4 p-6 flex flex-col items-center justify-center text-muted-foreground">
        <p>选择或创建一个笔记开始编辑</p>
      </Card>
    );
  }

  return (
    <Card className="absolute inset-0 m-4 p-6 flex flex-col">
      <div className="mb-4 flex justify-between items-center">
        <Input
          placeholder="笔记标题..."
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setIsEditing(true);
          }}
          className="text-xl font-medium border-none bg-transparent focus-visible:ring-0 p-0 mb-2 flex-1 mr-4"
          readOnly={!isEditing}
        />
        <Button 
          variant={isEditing ? "default" : "outline"}
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className={isEditing ? "bg-note-purple hover:bg-note-purple/90" : ""}
        >
          {isEditing ? (
            <>
              <Save className="h-4 w-4 mr-1" />
              保存
            </>
          ) : (
            <>
              <PlusCircle className="h-4 w-4 mr-1" />
              编辑
            </>
          )}
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map(tag => (
          <Badge 
            key={tag} 
            className="bg-note-light-purple text-note-dark-purple hover:bg-note-light-purple/80"
            onClick={() => isEditing && handleRemoveTag(tag)}
          >
            {tag}
            {isEditing && <span className="ml-1 cursor-pointer">×</span>}
          </Badge>
        ))}
        
        {isEditing && (
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
        )}
      </div>

      <Textarea
        placeholder="开始您的笔记..."
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          setIsEditing(true);
        }}
        className="flex-1 min-h-[300px] resize-none border-none focus-visible:ring-0"
        readOnly={!isEditing}
      />

      <div className="flex justify-between mt-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleDelete} 
          className="text-destructive hover:bg-destructive/10"
        >
          <Trash className="h-4 w-4 mr-1" />
          删除
        </Button>
      </div>
    </Card>
  );
}
