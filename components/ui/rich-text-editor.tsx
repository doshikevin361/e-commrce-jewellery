'use client';

import { useEffect, useRef, useState } from 'react';
import { Bold, Italic, List, ListOrdered, Quote, Underline, Link, Heading1, Heading2, Heading3, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToolbarCommand = 'bold' | 'italic' | 'underline' | 'insertUnorderedList' | 'insertOrderedList' | 'formatBlock' | 'createLink' | 'justifyLeft' | 'justifyCenter' | 'justifyRight';

interface RichTextEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  id?: string;
  disabled?: boolean;
}

export function RichTextEditor({
  label,
  value,
  onChange,
  placeholder = 'Write something...',
  required,
  error,
  helperText,
  id,
  disabled = false,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const exec = (command: ToolbarCommand, value?: string) => {
    if (disabled || typeof document === 'undefined') return;
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    handleInput();
  };

  const handleInput = () => {
    if (!editorRef.current) return;
    onChange(editorRef.current.innerHTML);
  };

  const handleLink = () => {
    if (showLinkInput && linkUrl) {
      exec('createLink', linkUrl);
      setLinkUrl('');
      setShowLinkInput(false);
    } else {
      setShowLinkInput(true);
    }
  };

  const handleHeading = (level: 'h1' | 'h2' | 'h3') => {
    exec('formatBlock', level);
  };

  return (
    <div className='space-y-2'>
      <label htmlFor={id} className='block text-sm font-medium text-slate-700 dark:text-slate-300'>
        {label}
        {required && <span className='text-red-500'> *</span>}
      </label>

      <div
        className={cn(
          'rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/40',
          disabled && 'opacity-70 pointer-events-none',
          error && 'border-red-500',
        )}
      >
        <div className='border-b border-slate-200 dark:border-slate-800'>
          <div className='flex items-center gap-1 px-3 py-2 flex-wrap'>
            {/* Text Formatting */}
            <div className='flex items-center gap-1 border-r border-slate-200 dark:border-slate-700 pr-2 mr-2'>
              <button
                type='button'
                onClick={() => exec('bold')}
                className='p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
                aria-label='Bold'
                title='Bold (Ctrl+B)'
              >
                <Bold className='w-4 h-4' />
              </button>
              <button
                type='button'
                onClick={() => exec('italic')}
                className='p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
                aria-label='Italic'
                title='Italic (Ctrl+I)'
              >
                <Italic className='w-4 h-4' />
              </button>
              <button
                type='button'
                onClick={() => exec('underline')}
                className='p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
                aria-label='Underline'
                title='Underline (Ctrl+U)'
              >
                <Underline className='w-4 h-4' />
              </button>
            </div>

            {/* Headings */}
            <div className='flex items-center gap-1 border-r border-slate-200 dark:border-slate-700 pr-2 mr-2'>
              <button
                type='button'
                onClick={() => handleHeading('h1')}
                className='p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
                aria-label='Heading 1'
                title='Heading 1'
              >
                <Heading1 className='w-4 h-4' />
              </button>
              <button
                type='button'
                onClick={() => handleHeading('h2')}
                className='p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
                aria-label='Heading 2'
                title='Heading 2'
              >
                <Heading2 className='w-4 h-4' />
              </button>
              <button
                type='button'
                onClick={() => handleHeading('h3')}
                className='p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
                aria-label='Heading 3'
                title='Heading 3'
              >
                <Heading3 className='w-4 h-4' />
              </button>
            </div>

            {/* Lists */}
            <div className='flex items-center gap-1 border-r border-slate-200 dark:border-slate-700 pr-2 mr-2'>
              <button
                type='button'
                onClick={() => exec('insertUnorderedList')}
                className='p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
                aria-label='Bullet list'
                title='Bullet List'
              >
                <List className='w-4 h-4' />
              </button>
              <button
                type='button'
                onClick={() => exec('insertOrderedList')}
                className='p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
                aria-label='Numbered list'
                title='Numbered List'
              >
                <ListOrdered className='w-4 h-4' />
              </button>
            </div>

            {/* Alignment */}
            <div className='flex items-center gap-1 border-r border-slate-200 dark:border-slate-700 pr-2 mr-2'>
              <button
                type='button'
                onClick={() => exec('justifyLeft')}
                className='p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
                aria-label='Align Left'
                title='Align Left'
              >
                <AlignLeft className='w-4 h-4' />
              </button>
              <button
                type='button'
                onClick={() => exec('justifyCenter')}
                className='p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
                aria-label='Align Center'
                title='Align Center'
              >
                <AlignCenter className='w-4 h-4' />
              </button>
              <button
                type='button'
                onClick={() => exec('justifyRight')}
                className='p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
                aria-label='Align Right'
                title='Align Right'
              >
                <AlignRight className='w-4 h-4' />
              </button>
            </div>

            {/* Quote & Link */}
            <div className='flex items-center gap-1'>
              <button
                type='button'
                onClick={() => exec('formatBlock', 'blockquote')}
                className='p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
                aria-label='Quote'
                title='Quote'
              >
                <Quote className='w-4 h-4' />
              </button>
              <button
                type='button'
                onClick={handleLink}
                className='p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
                aria-label='Insert Link'
                title='Insert Link'
              >
                <Link className='w-4 h-4' />
              </button>
            </div>
          </div>

          {/* Link Input */}
          {showLinkInput && (
            <div className='px-3 py-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-2'>
              <input
                type='text'
                value={linkUrl}
                onChange={e => setLinkUrl(e.target.value)}
                placeholder='Enter URL (e.g., https://example.com)'
                className='flex-1 px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900'
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleLink();
                  } else if (e.key === 'Escape') {
                    setShowLinkInput(false);
                    setLinkUrl('');
                  }
                }}
                autoFocus
              />
              <button
                type='button'
                onClick={handleLink}
                className='px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors'
              >
                Insert
              </button>
              <button
                type='button'
                onClick={() => {
                  setShowLinkInput(false);
                  setLinkUrl('');
                }}
                className='px-3 py-1 text-sm bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors'
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className='relative'>
          {!value && (
            <div className='absolute left-4 top-3 text-sm text-slate-400 pointer-events-none select-none'>
              {placeholder}
            </div>
          )}
          <div
            ref={editorRef}
            id={id}
            role='textbox'
            aria-multiline='true'
            contentEditable={!disabled}
            suppressContentEditableWarning
            onInput={handleInput}
            className='min-h-[200px] px-4 py-3 text-sm text-slate-800 dark:text-slate-100 focus:outline-none prose prose-sm max-w-none'
          />
        </div>
      </div>

      {helperText && <p className='text-xs text-slate-500'>{helperText}</p>}
      {error && <p className='text-xs text-red-500'>{error}</p>}
    </div>
  );
}

