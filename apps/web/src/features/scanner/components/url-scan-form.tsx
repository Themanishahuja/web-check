'use client';

import { URL_ERROR_MESSAGES, parseScanUrl } from '@whc/shared';
import { useRouter } from 'next/navigation';
import { useId, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRightIcon, LinkIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';

interface UrlScanFormProps {
  className?: string;
  /** Label for the submit button. */
  submitLabel?: string;
  autoFocus?: boolean;
}

/** The single entry point to the product: validates a URL, then starts a scan. */
export function UrlScanForm({
  className,
  submitLabel = 'Check now',
  autoFocus,
}: UrlScanFormProps) {
  const router = useRouter();
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = parseScanUrl(value);
    if (!result.ok) {
      setError(URL_ERROR_MESSAGES[result.reason]);
      return;
    }
    setError(null);
    router.push(`/scan?url=${encodeURIComponent(result.url)}`);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={cn('w-full', className)}>
      <label htmlFor={inputId} className="sr-only">
        Website address
      </label>
      <div
        className={cn(
          'flex items-center gap-2 rounded-full border bg-surface p-2 pl-5 shadow-[0_1px_0_rgb(22_25_28/0.04),0_12px_32px_-12px_rgb(8_69_82/0.25)] transition-[border-color,box-shadow] duration-300 ease-soft focus-within:border-brand-500',
          error ? 'border-bad' : 'border-line',
        )}
      >
        <LinkIcon className="size-5 shrink-0 text-ink-faint" />
        <input
          id={inputId}
          type="text"
          inputMode="url"
          autoComplete="url"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          autoFocus={autoFocus}
          placeholder="https://yourwebsite.com"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="min-w-0 flex-1 bg-transparent py-2 font-mono text-[0.95rem] text-ink outline-none placeholder:text-ink-faint"
        />
        <Button type="submit" size="lg" className="h-12 px-6 sm:px-8">
          <span>{submitLabel}</span>
          <ArrowRightIcon className="size-4" />
        </Button>
      </div>
      <p id={errorId} role="alert" className="mt-3 min-h-5 pl-5 text-sm text-bad">
        {error}
      </p>
    </form>
  );
}
