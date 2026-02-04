'use client';

import { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface MarkdownEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  error?: string;
  id?: string;
  disabled?: boolean;
}

export function MarkdownEditor({
  label,
  value,
  onChange,
  placeholder = 'Write markdown...',
  helperText,
  required,
  error,
  id,
  disabled = false,
}: MarkdownEditorProps) {
  const editorId = useMemo(() => id || `markdown-${label.replace(/\s+/g, '-').toLowerCase()}`, [id, label]);
  const [activeTab, setActiveTab] = useState('write');

  return (
    <div className='space-y-2'>
      <Label htmlFor={editorId} className={cn(error && 'text-red-600')}>
        {label} {required ? <span className='text-red-500'>*</span> : null}
      </Label>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value='write'>Write</TabsTrigger>
          <TabsTrigger value='preview'>Preview</TabsTrigger>
        </TabsList>
        <TabsContent value='write' className='mt-4'>
          <Textarea
            id={editorId}
            value={value}
            onChange={event => onChange(event.target.value)}
            placeholder={placeholder}
            rows={10}
            disabled={disabled}
            className={cn(
              'min-h-[220px] resize-y border-gray-300 focus:ring-green-500',
              error && 'border-red-500 focus:ring-red-500',
            )}
          />
        </TabsContent>
        <TabsContent value='preview' className='mt-4'>
          <div className='rounded-md border border-gray-200 bg-white p-4 text-sm text-slate-700 min-h-[220px]'>
            {value.trim() ? (
              <div className='prose prose-slate max-w-none whitespace-pre-wrap'>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
              </div>
            ) : (
              <p className='text-slate-400'>Nothing to preview yet.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
      {helperText ? <p className='text-xs text-slate-500'>{helperText}</p> : null}
      {error ? <p className='text-xs text-red-600'>{error}</p> : null}
    </div>
  );
}

