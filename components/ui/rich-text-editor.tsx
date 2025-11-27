'use client';

import { useEffect, useRef, useState } from 'react';
import { 
  Bold, Italic, List, ListOrdered, Quote, Underline, Link, 
  Heading1, Heading2, Heading3, AlignLeft, AlignCenter, AlignRight,
  Strikethrough, Code, Image, Table, Indent, Outdent, 
  Type, Palette, Undo, Redo, Copy, Scissors, FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ToolbarCommand = 'bold' | 'italic' | 'underline' | 'strikeThrough' | 'insertUnorderedList' | 'insertOrderedList' | 'formatBlock' | 'createLink' | 'justifyLeft' | 'justifyCenter' | 'justifyRight' | 'indent' | 'outdent' | 'insertHTML' | 'foreColor' | 'backColor' | 'fontSize' | 'undo' | 'redo' | 'copy' | 'cut' | 'paste';

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
  const [showImageInput, setShowImageInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [selectedBgColor, setSelectedBgColor] = useState('#ffffff');

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.rich-text-editor')) {
        setShowColorPicker(false);
        setShowBgColorPicker(false);
        setShowLinkInput(false);
        setShowImageInput(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleImage = () => {
    if (showImageInput && imageUrl) {
      const imgHtml = `<img src="${imageUrl}" alt="Image" style="max-width: 100%; height: auto; margin: 10px 0;" />`;
      exec('insertHTML', imgHtml);
      setImageUrl('');
      setShowImageInput(false);
    } else {
      setShowImageInput(true);
    }
  };

  const handleTable = () => {
    const tableHtml = `
      <table style="border-collapse: collapse; width: 100%; margin: 10px 0;">
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">Cell 1</td>
          <td style="border: 1px solid #ddd; padding: 8px;">Cell 2</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">Cell 3</td>
          <td style="border: 1px solid #ddd; padding: 8px;">Cell 4</td>
        </tr>
      </table>
    `;
    exec('insertHTML', tableHtml);
  };

  const handleColor = (color: string) => {
    exec('foreColor', color);
    setShowColorPicker(false);
  };

  const handleBgColor = (color: string) => {
    exec('backColor', color);
    setShowBgColorPicker(false);
  };

  const handleFontSize = (size: string) => {
    exec('fontSize', size);
  };

  const insertHorizontalRule = () => {
    exec('insertHTML', '<hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;" />');
  };

  const insertCodeBlock = () => {
    const codeHtml = `<pre style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0; overflow-x: auto;"><code>// Your code here</code></pre>`;
    exec('insertHTML', codeHtml);
  };

  const colors = [
    '#000000', '#333333', '#666666', '#999999', '#cccccc', '#ffffff',
    '#ff0000', '#ff6600', '#ffcc00', '#33cc00', '#0066cc', '#6600cc',
    '#cc0066', '#ff3366', '#ff9933', '#ccff33', '#33ffcc', '#3366ff',
  ];

  return (
    <div className='space-y-2 rich-text-editor'>
      <label htmlFor={id} className='block text-sm font-medium text-slate-700 dark:text-slate-300'>
        {label}
        {required && <span className='text-red-500'> *</span>}
      </label>

      <div
        className={cn(
          'rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/40 shadow-sm',
          disabled && 'opacity-70 pointer-events-none',
          error && 'border-red-500',
        )}
      >
        <div className='border-b border-slate-200 dark:border-slate-800'>
          {/* First Row - Main Formatting */}
          <div className='flex items-center gap-1 px-3 py-2 flex-wrap border-b border-slate-100 dark:border-slate-700'>
            {/* Undo/Redo */}
            <div className='flex items-center gap-1 border-r border-slate-200 dark:border-slate-700 pr-2 mr-2'>
              <button
                type='button'
                onClick={() => exec('undo')}
                className='p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
                aria-label='Undo'
                title='Undo (Ctrl+Z)'
              >
                <Undo className='w-4 h-4' />
              </button>
              <button
                type='button'
                onClick={() => exec('redo')}
                className='p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
                aria-label='Redo'
                title='Redo (Ctrl+Y)'
              >
                <Redo className='w-4 h-4' />
              </button>
            </div>

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
              <button
                type='button'
                onClick={() => exec('strikeThrough')}
                className='p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
                aria-label='Strikethrough'
                title='Strikethrough'
              >
                <Strikethrough className='w-4 h-4' />
              </button>
            </div>

            {/* Font Size */}
            <div className='flex items-center gap-1 border-r border-slate-200 dark:border-slate-700 pr-2 mr-2'>
              <select
                onChange={(e) => handleFontSize(e.target.value)}
                className='text-xs px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800'
                title='Font Size'
              >
                <option value='1'>Small</option>
                <option value='3' selected>Normal</option>
                <option value='4'>Medium</option>
                <option value='5'>Large</option>
                <option value='6'>X-Large</option>
                <option value='7'>XX-Large</option>
              </select>
            </div>

            {/* Colors */}
            <div className='flex items-center gap-1 border-r border-slate-200 dark:border-slate-700 pr-2 mr-2 relative'>
              <button
                type='button'
                onClick={() => setShowColorPicker(!showColorPicker)}
                className='p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
                aria-label='Text Color'
                title='Text Color'
              >
                <Type className='w-4 h-4' />
              </button>
              <button
                type='button'
                onClick={() => setShowBgColorPicker(!showBgColorPicker)}
                className='p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
                aria-label='Background Color'
                title='Background Color'
              >
                <Palette className='w-4 h-4' />
              </button>

              {/* Color Picker */}
              {showColorPicker && (
                <div className='absolute top-full left-0 mt-1 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow-lg z-10'>
                  <div className='grid grid-cols-6 gap-1'>
                    {colors.map((color) => (
                      <button
                        key={color}
                        type='button'
                        onClick={() => handleColor(color)}
                        className='w-6 h-6 rounded border border-slate-300 hover:scale-110 transition-transform'
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Background Color Picker */}
              {showBgColorPicker && (
                <div className='absolute top-full left-0 mt-1 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow-lg z-10'>
                  <div className='grid grid-cols-6 gap-1'>
                    {colors.map((color) => (
                      <button
                        key={color}
                        type='button'
                        onClick={() => handleBgColor(color)}
                        className='w-6 h-6 rounded border border-slate-300 hover:scale-110 transition-transform'
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Second Row - Structure & Media */}
          <div className='flex items-center gap-1 px-3 py-2 flex-wrap'>

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

            {/* Lists & Indentation */}
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
              <button
                type='button'
                onClick={() => exec('outdent')}
                className='p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
                aria-label='Decrease Indent'
                title='Decrease Indent'
              >
                <Outdent className='w-4 h-4' />
              </button>
              <button
                type='button'
                onClick={() => exec('indent')}
                className='p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
                aria-label='Increase Indent'
                title='Increase Indent'
              >
                <Indent className='w-4 h-4' />
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

            {/* Media & Special */}
            <div className='flex items-center gap-1 border-r border-slate-200 dark:border-slate-700 pr-2 mr-2'>
              <button
                type='button'
                onClick={handleLink}
                className='p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
                aria-label='Insert Link'
                title='Insert Link'
              >
                <Link className='w-4 h-4' />
              </button>
              <button
                type='button'
                onClick={() => setShowImageInput(true)}
                className='p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
                aria-label='Insert Image'
                title='Insert Image'
              >
                <Image className='w-4 h-4' />
              </button>
              <button
                type='button'
                onClick={handleTable}
                className='p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
                aria-label='Insert Table'
                title='Insert Table'
              >
                <Table className='w-4 h-4' />
              </button>
            </div>

            {/* Blocks & Formatting */}
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
                onClick={insertCodeBlock}
                className='p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
                aria-label='Code Block'
                title='Code Block'
              >
                <Code className='w-4 h-4' />
              </button>
              <button
                type='button'
                onClick={insertHorizontalRule}
                className='p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
                aria-label='Horizontal Line'
                title='Horizontal Line'
              >
                <FileText className='w-4 h-4' />
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

          {/* Image Input */}
          {showImageInput && (
            <div className='px-3 py-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-2'>
              <input
                type='text'
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder='Enter image URL (e.g., https://example.com/image.jpg)'
                className='flex-1 px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900'
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleImage();
                  } else if (e.key === 'Escape') {
                    setShowImageInput(false);
                    setImageUrl('');
                  }
                }}
                autoFocus
              />
              <button
                type='button'
                onClick={handleImage}
                className='px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'
              >
                Insert
              </button>
              <button
                type='button'
                onClick={() => {
                  setShowImageInput(false);
                  setImageUrl('');
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
            onPaste={(e) => {
              // Allow paste but clean up formatting
              setTimeout(() => handleInput(), 10);
            }}
            className='min-h-[300px] px-4 py-3 text-sm text-slate-800 dark:text-slate-100 focus:outline-none prose prose-sm max-w-none'
            style={{
              lineHeight: '1.6',
              wordBreak: 'break-word',
            }}
          />
        </div>
      </div>

      {helperText && <p className='text-xs text-slate-500'>{helperText}</p>}
      {error && <p className='text-xs text-red-500'>{error}</p>}
    </div>
  );
}

