'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useFocusSession } from '@/lib/focus-session-context';

export function NavItem({
  href,
  label,
  children
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isBlocking } = useFocusSession();

  // A Focus Study session is active — restrict in-app navigation away from
  // /study (where the focus session lives) until it ends or the user stops it.
  const disabled = isBlocking && !pathname.startsWith('/study');

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {disabled ? (
          <span
            aria-disabled="true"
            className="flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-lg text-muted-foreground/40 md:h-8 md:w-8"
          >
            {children}
            <span className="sr-only">{label} (disabled during Focus Study)</span>
          </span>
        ) : (
          <Link
            href={href}
            className={clsx(
              'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8',
              {
                'bg-accent text-black': pathname === href
              }
            )}
          >
            {children}
            <span className="sr-only">{label}</span>
          </Link>
        )}
      </TooltipTrigger>
      <TooltipContent side="right">
        {disabled ? 'Locked during Focus Study' : label}
      </TooltipContent>
    </Tooltip>
  );
}
