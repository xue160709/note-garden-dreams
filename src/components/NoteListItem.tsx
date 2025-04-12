
import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface NoteListItemProps {
  note: Note;
  isSelected?: boolean;
  onClick?: () => void;
}

export function NoteListItem({ note, isSelected, onClick }: NoteListItemProps) {
  // Get a preview of the content (first 100 characters)
  const contentPreview = note.content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .slice(0, 100) + (note.content.length > 100 ? '...' : '');

  // Format the date
  const formattedDate = formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true });

  return (
    <Card 
      className={cn(
        "p-4 cursor-pointer hover:bg-note-soft-gray transition-colors mb-2",
        isSelected && "border-note-purple bg-note-soft-gray"
      )}
      onClick={onClick}
    >
      <h3 className="font-medium text-lg text-left truncate">{note.title}</h3>
      <p className="text-sm text-muted-foreground text-left mt-1 line-clamp-2">{contentPreview}</p>
      
      <div className="flex justify-between items-center mt-3">
        <div className="flex gap-1">
          {note.tags.slice(0, 2).map(tag => (
            <span key={tag} className="bg-note-light-purple text-note-dark-purple text-xs px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
          {note.tags.length > 2 && (
            <span className="text-note-neutral-gray text-xs px-2 py-0.5">
              +{note.tags.length - 2}
            </span>
          )}
        </div>
        
        <span className="text-xs text-note-neutral-gray">{formattedDate}</span>
      </div>
    </Card>
  );
}
