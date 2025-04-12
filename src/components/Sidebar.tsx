
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, Book, FileText, Hash, ChevronDown, ChevronRight, 
  PlusCircle, Menu, X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onNewNote: () => void;
  onCategoryClick: (category: string | null) => void;
  onTagClick: (tag: string) => void;
  selectedCategory: string | null;
  notebooks: string[];
  tags: string[];
}

export function Sidebar({
  collapsed,
  onToggle,
  onNewNote,
  onCategoryClick,
  onTagClick,
  selectedCategory,
  notebooks,
  tags
}: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [notebooksExpanded, setNotebooksExpanded] = useState(true);
  const [tagsExpanded, setTagsExpanded] = useState(true);

  return (
    <div 
      className={cn(
        "h-screen bg-sidebar border-r border-border flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header with toggle button */}
      <div className="p-4 flex justify-between items-center border-b">
        {!collapsed && (
          <h1 className="text-lg font-semibold text-note-purple">笔记本</h1>
        )}
        <Button variant="ghost" size="icon" onClick={onToggle} className="text-note-neutral-gray">
          {collapsed ? <Menu /> : <X />}
        </Button>
      </div>

      {/* Create New Note Button */}
      <div className="p-4">
        <Button 
          onClick={onNewNote} 
          className={cn(
            "bg-note-purple hover:bg-note-purple/90 text-white w-full",
            collapsed && "p-2"
          )}
        >
          <PlusCircle className={cn("h-5 w-5", !collapsed && "mr-2")} />
          {!collapsed && "新建笔记"}
        </Button>
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-2 top-2.5 text-note-neutral-gray" />
            <Input
              placeholder="搜索笔记..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      )}

      <ScrollArea className="flex-grow">
        {/* All Notes */}
        <div className={cn("py-1", collapsed && "px-2", !collapsed && "px-4")}>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start font-normal",
              selectedCategory === null && "bg-note-soft-gray text-note-purple",
              collapsed && "justify-center p-2"
            )}
            onClick={() => onCategoryClick(null)}
          >
            <FileText className={cn("h-5 w-5", !collapsed && "mr-2")} />
            {!collapsed && "所有笔记"}
          </Button>
        </div>

        {/* Notebooks Section */}
        {!collapsed && (
          <div className="py-1">
            <div
              className="flex items-center px-4 py-2 text-sm font-medium cursor-pointer"
              onClick={() => setNotebooksExpanded(!notebooksExpanded)}
            >
              {notebooksExpanded ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
              <Book className="h-4 w-4 mr-2" />
              笔记本
            </div>

            {notebooksExpanded && (
              <div className="pl-9 pr-4">
                {notebooks.map((notebook) => (
                  <Button
                    key={notebook}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start py-1 px-2 font-normal text-sm",
                      selectedCategory === notebook && "bg-note-soft-gray text-note-purple"
                    )}
                    onClick={() => onCategoryClick(notebook)}
                  >
                    {notebook}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tags Section */}
        {!collapsed && (
          <div className="py-1">
            <div
              className="flex items-center px-4 py-2 text-sm font-medium cursor-pointer"
              onClick={() => setTagsExpanded(!tagsExpanded)}
            >
              {tagsExpanded ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
              <Hash className="h-4 w-4 mr-2" />
              标签
            </div>

            {tagsExpanded && (
              <div className="pl-9 pr-4">
                {tags.map((tag) => (
                  <Button
                    key={tag}
                    variant="ghost"
                    className="w-full justify-start py-1 px-2 font-normal text-sm"
                    onClick={() => onTagClick(tag)}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
