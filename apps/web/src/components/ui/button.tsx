import { cva, type VariantProps } from 'class-variance-authority';
import Link from 'next/link';
import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/cn';

export const buttonStyles = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-[background-color,color,box-shadow,transform] duration-300 ease-soft focus-visible:outline-offset-4 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary: 'bg-brand-500 text-ink hover:bg-brand-600',
        secondary: 'border border-line bg-surface text-ink hover:border-ink-faint',
        ghost: 'text-ink-soft hover:text-ink',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-6 text-[0.95rem]',
        lg: 'h-14 px-8 text-base',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

type ButtonVariants = VariantProps<typeof buttonStyles>;

type ButtonProps = ButtonVariants & ComponentPropsWithoutRef<'button'>;

export function Button({
  variant,
  size,
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonStyles({ variant, size }), className)}
      {...props}
    />
  );
}

type ButtonLinkProps = ButtonVariants & ComponentPropsWithoutRef<typeof Link>;

export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return <Link className={cn(buttonStyles({ variant, size }), className)} {...props} />;
}
