'use client';

import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const PasswordInput = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, disabled, type: _ignored, ...props }, ref) => {
    const [show, setShow] = React.useState(false);
    return (
      <div className="relative w-full">
        <Input
          ref={ref}
          type={show ? 'text' : 'password'}
          autoComplete={props.autoComplete ?? 'current-password'}
          className={cn('pr-11', className)}
          disabled={disabled}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          tabIndex={-1}
          className="absolute right-0.5 top-1/2 h-10 w-10 -translate-y-1/2 shrink-0 text-slate-500 hover:bg-transparent hover:text-slate-800 dark:hover:text-slate-200"
          onClick={() => setShow((s) => !s)}
          disabled={disabled}
          aria-label={show ? 'Hide password' : 'Show password'}
          title={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
        </Button>
      </div>
    );
  },
);
PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };
