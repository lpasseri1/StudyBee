import { ClassColor, EventType, GradeType, TaskType, Weekday } from './types';

export const WEEKDAYS: Weekday[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const SCHOOL_WEEKDAYS: Weekday[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

export const CLASS_COLORS: ClassColor[] = [
  'violet',
  'blue',
  'emerald',
  'amber',
  'rose',
  'cyan',
  'orange',
  'pink'
];

// Tailwind-safe static class map (no dynamic string interpolation)
export const CLASS_COLOR_STYLES: Record<
  ClassColor,
  { bg: string; text: string; dot: string; border: string }
> = {
  violet: {
    bg: 'bg-violet-100',
    text: 'text-violet-700',
    dot: 'bg-violet-500',
    border: 'border-violet-200'
  },
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
    border: 'border-blue-200'
  },
  emerald: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
    border: 'border-emerald-200'
  },
  amber: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
    border: 'border-amber-200'
  },
  rose: {
    bg: 'bg-rose-100',
    text: 'text-rose-700',
    dot: 'bg-rose-500',
    border: 'border-rose-200'
  },
  cyan: {
    bg: 'bg-cyan-100',
    text: 'text-cyan-700',
    dot: 'bg-cyan-500',
    border: 'border-cyan-200'
  },
  orange: {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    dot: 'bg-orange-500',
    border: 'border-orange-200'
  },
  pink: {
    bg: 'bg-pink-100',
    text: 'text-pink-700',
    dot: 'bg-pink-500',
    border: 'border-pink-200'
  }
};

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  class: 'Class',
  club: 'Club',
  sport: 'Sport',
  meeting: 'Meeting',
  event: 'Event'
};

export const GRADE_TYPE_LABELS: Record<GradeType, string> = {
  test: 'Test',
  quiz: 'Quiz',
  homework: 'Homework',
  project: 'Project'
};

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  homework: 'Homework',
  study: 'Study',
  assignment: 'Assignment',
  reminder: 'Reminder'
};
