'use client';

import Link from 'next/link';
import {
  BookOpen,
  CalendarDays,
  GraduationCap,
  Home,
  NotebookPen,
  PanelLeft,
  Settings,
  Sparkles,
  Trophy,
  User
} from 'lucide-react';
import { usePathname } from 'next/navigation';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { NavItem } from './nav-item';
import { StudyBeeProvider } from '@/lib/store';
import { FocusSessionProvider, useFocusSession } from '@/lib/focus-session-context';
import { AvatarProvider } from '@/lib/avatar-context';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { NavAvatar } from '@/components/shared/nav-avatar';

const NAV_LINKS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/schedule', label: 'Schedule', icon: CalendarDays },
  { href: '/extracurriculars', label: 'Extracurriculars', icon: Trophy },
  { href: '/grades', label: 'Grades', icon: GraduationCap },
  { href: '/study', label: 'Study', icon: Sparkles },
  { href: '/notes', label: 'Notes', icon: NotebookPen }
];

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <StudyBeeProvider>
      <FocusSessionProvider>
        <AvatarProvider>
          <TooltipProvider>
            <main className="flex min-h-screen w-full flex-col bg-muted/40">
              <DesktopNav />
              <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                  <MobileNav />
                  <DashboardBreadcrumb />
                  <div className="ml-auto flex items-center gap-3">
                    <ThemeToggle />
                    <NavAvatar />
                  </div>
                </header>
                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-6">
                  {children}
                </main>
              </div>
            </main>
          </TooltipProvider>
        </AvatarProvider>
      </FocusSessionProvider>
    </StudyBeeProvider>
  );
}

function DesktopNav() {
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Link
          href="/"
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
        >
          <BookOpen className="h-4 w-4 transition-all group-hover:scale-110" />
          <span className="sr-only">StudyBee</span>
        </Link>

        {NAV_LINKS.map((link) => (
          <NavItem key={link.href} href={link.href} label={link.label}>
            <link.icon className="h-5 w-5" />
          </NavItem>
        ))}
      </nav>
    </aside>
  );
}

function MobileNav() {
  const pathname = usePathname();
  const { isBlocking } = useFocusSession();

  const links = [
    ...NAV_LINKS,
    { href: '/profile', label: 'Profile', icon: User },
    { href: '/settings', label: 'Settings', icon: Settings }
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="outline" className="sm:hidden">
          <PanelLeft className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="sm:max-w-xs">
        <nav className="grid gap-6 text-lg font-medium">
          <Link
            href="/"
            className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
          >
            <BookOpen className="h-5 w-5 transition-all group-hover:scale-110" />
            <span className="sr-only">StudyBee</span>
          </Link>
          {links.map((link) => {
            const disabled =
              isBlocking && !pathname.startsWith('/study') && !link.href.startsWith('/study');
            if (disabled) {
              return (
                <span
                  key={link.href}
                  className="flex items-center gap-4 px-2.5 text-muted-foreground/40"
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </span>
              );
            }
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
              >
                <link.icon className="h-5 w-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

function DashboardBreadcrumb() {
  return (
    <Breadcrumb className="flex">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbPage className="font-semibold text-foreground">StudyBee</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
