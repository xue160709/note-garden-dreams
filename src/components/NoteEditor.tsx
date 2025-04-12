import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Tag, Save, Trash, Sparkles, Brain } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { type Note } from './NoteListItem';
import { toast } from 'sonner';

// 在文件顶部添加环境变量
const SILICONFLOW_API_KEY = import.meta.env.VITE_SILICONFLOW_API_KEY;
const MCP_URL = 'http://127.0.0.1:8090';

// 添加 callOpenAIFunctionAndProcessToolCalls 函数
async function callOpenAIFunctionAndProcessToolCalls(systemPrompt: string | undefined, tools: any[], noteContent: string) {
  const url = 'https://api.siliconflow.cn/v1/chat/completions';

  let messages = systemPrompt
    ? [
        {
          role: 'system',
          content: systemPrompt
        }
      ]
    : [];

  const requestBody = {
    model: 'Qwen/Qwen2.5-72B-Instruct-128K',
    messages: [
      ...messages,
      {
        role: 'user',
        content: noteContent
      }
    ],
    tools,
    tool_choice: 'auto'
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SILICONFLOW_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    const toolCalls = data.choices[0].message.tool_calls;
    if (!toolCalls || toolCalls.length === 0) {
      console.log('No tool calls in response.');
      return null;
    }

    const processedToolCalls = toolCalls
      .map(toolCall => {
        const functionName = toolCall.function.name;
        try {
          const functionArgs = JSON.parse(toolCall.function.arguments.trim());
          return {
            id: toolCall.id,
            name: functionName,
            arguments: functionArgs
          };
        } catch (error) {
          console.log(error);
        }
      })
      .filter(Boolean);

    return processedToolCalls;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

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
  const [isGenerating, setIsGenerating] = useState(false);

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

  const handleGenerateAI = async () => {
    console.log('开始 AI 生成流程...');
    if (!content.trim()) {
      console.log('错误：笔记内容为空');
      toast.error('请先输入笔记内容');
      return;
    }

    if (!SILICONFLOW_API_KEY) {
      console.log('错误：API Key 未配置');
      toast.error('API Key 未配置');
      return;
    }

    console.log('准备发送请求到 SiliconFlow API...');
    setIsGenerating(true);
    try {
      console.log('发送请求中...');
      const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SILICONFLOW_API_KEY}`
        },
        body: JSON.stringify({
          model: "Qwen/Qwen2.5-7B-Instruct",
          messages: [
            {
              role: "system",
              content: "你是一个专业的笔记助手。请根据提供的笔记内容，生成3-5个相关的标签（用逗号分隔）和一段简短的摘要。格式：标签：tag1,tag2,tag3\n摘要：这里是摘要内容"
            },
            {
              role: "user",
              content: content
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      console.log('收到 API 响应');
      const data = await response.json();
      console.log('API 响应数据:', data);

      if (data.choices && data.choices[0]?.message?.content) {
        const result = data.choices[0].message.content;
        console.log('AI 生成结果:', result);
        
        const [tagsLine, summaryLine] = result.split('\n');
        
        // 处理标签
        const newTags = tagsLine.replace('标签：', '').split(',').map(tag => tag.trim());
        console.log('新生成的标签:', newTags);
        setTags([...new Set([...tags, ...newTags])]);
        
        // 处理摘要
        const summary = summaryLine.replace('摘要：', '').trim();
        console.log('生成的摘要:', summary);
        const newContent = summary + '\n\n---\n\n' + content;
        setContent(newContent);
        
        console.log('AI 生成完成');
        toast.success('AI 生成完成');
        
        // 自动保存生成的标签和内容
        if (onSave) {
          console.log('正在保存生成的标签和内容...');
          onSave({
            id: note?.id,
            title,
            content: newContent,
            tags: [...new Set([...tags, ...newTags])],
            updatedAt: new Date()
          });
          console.log('保存完成');
        }
      } else {
        console.log('错误：API 响应格式不正确');
      }
    } catch (error) {
      console.error('AI 生成失败:', error);
      toast.error('AI 生成失败，请重试');
    } finally {
      console.log('结束 AI 生成流程');
      setIsGenerating(false);
    }
  };

  const handleMemory = async () => {
    if (!content.trim()) {
      toast.error('请先输入笔记内容');
      return;
    }

    try {
      // 准备 MCP 工具
      const { prepareTools } = await import('mcp-uiux/dist/MCPClient.js');
      const { mcpClient, tools, toolsFunctionCall, systemPrompts } = await prepareTools(MCP_URL);

      // 获取知识提取器提示
      const knowledgeExtractorPrompt = systemPrompts.find(
        s => s.name === 'knowledge_extractor'
      );

      // 获取知识工具
      const knowledgeTools = toolsFunctionCall.filter(t =>
        ['create_relations', 'create_entities'].includes(t.function.name)
      );

      // 调用函数
      const toolsResult = await callOpenAIFunctionAndProcessToolCalls(
        knowledgeExtractorPrompt?.systemPrompt,
        knowledgeTools,
        content
      );

      if (toolsResult) {
        for (const item of toolsResult) {
          const tool = tools.find(t => t.name === item.name);
          if (tool) {
            const result = await tool.execute(item.arguments);
            console.log('工具执行结果', item.name, result);
          }
        }
        toast.success('知识提取完成');
      }

      await mcpClient.disconnect();
    } catch (error) {
      console.error('知识提取失败:', error);
      toast.error('知识提取失败，请重试');
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
        <div className="flex items-center gap-2 flex-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateAI}
            disabled={isGenerating}
            className="bg-note-light-purple hover:bg-note-light-purple/80"
          >
            <Sparkles className="h-4 w-4 mr-1" />
            {isGenerating ? '生成中...' : 'AI 生成'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleMemory}
            className="bg-note-light-purple hover:bg-note-light-purple/80"
          >
            <Brain className="h-4 w-4 mr-1" />
            记忆
          </Button>
          <Input
            placeholder="笔记标题..."
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setIsEditing(true);
            }}
            className="text-xl font-medium border-none bg-transparent focus-visible:ring-0 p-0 mb-2 flex-1"
            readOnly={!isEditing}
          />
        </div>
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
