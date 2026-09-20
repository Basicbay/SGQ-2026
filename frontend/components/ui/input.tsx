import { forwardRef, type InputHTMLAttributes } from 'react';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...props }, ref) => (
    <input
      ref={ref}
      className={`flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:!border-destructive aria-invalid:focus:!border-destructive aria-invalid:focus-visible:!border-destructive aria-invalid:ring-1 aria-invalid:!ring-destructive/30 ${className}`}
      {...props}
    />
  ),
);

Input.displayName = 'Input';
