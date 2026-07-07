export type ClassColor =
  | 'violet'
  | 'blue'
  | 'emerald'
  | 'amber'
  | 'rose'
  | 'cyan'
  | 'orange'
  | 'pink';

export interface ClassItem {
  id: string;
  name: string;
  teacher: string;
  room: string;
  color: ClassColor;
}

export type Weekday =
  | 'Mon'
  | 'Tue'
  | 'Wed'
  | 'Thu'
  | 'Fri'
  | 'Sat'
  | 'Sun';

export type EventType = 'class' | 'club' | 'sport' | 'meeting' | 'event';

export interface ScheduleEvent {
  id: string;
  title: string;
  classId?: string;
  day: Weekday;
  startTime: string; // "08:00"
  endTime: string; // "08:50"
  location: string;
  type: EventType;
  bringItems?: string[];
}

export type GradeType = 'test' | 'quiz' | 'homework' | 'project';

export interface Grade {
  id: string;
  classId: string;
  title: string;
  type: GradeType;
  score: number;
  maxScore: number;
  date: string; // ISO date
}

export interface Note {
  id: string;
  classId: string;
  unit: string;
  title: string;
  content: string;
  updatedAt: string; // ISO date
}

export type TaskType = 'homework' | 'study' | 'assignment' | 'reminder';

export interface Task {
  id: string;
  title: string;
  classId?: string;
  type: TaskType;
  dueDate: string; // ISO date
  done: boolean;
  notes?: string;
}
