import type { ComponentPropsWithoutRef, ElementType } from 'react';
import { cn } from '@/lib/cn';

type ContainerProps<T extends ElementType> = {
  as?: T;
  size?: 'default' | 'narrow' | 'wide';
} & Omit<ComponentPropsWithoutRef<T>, 'as'>;

const sizes = {
  narrow: 'max-w-3xl',
  default: 'max-w-6xl',
  wide: 'max-w-7xl',
} as const;

export function Container<T extends ElementType = 'div'>({
  as,
  size = 'default',
  className,
  ...props
}: ContainerProps<T>) {
  const Tag: ElementType = as ?? 'div';
  return (
    <Tag
      className={cn('mx-auto w-full px-5 sm:px-8', sizes[size], className)}
      {...props}
    />
  );
}
