import { ClassItem, Grade, Note, ScheduleEvent, Task } from './types';

export const SEED_CLASSES: ClassItem[] = [
  { id: 'c1', name: 'AP Biology', teacher: 'Ms. Alvarez', room: 'Rm 214', color: 'emerald' },
  { id: 'c2', name: 'Algebra II', teacher: 'Mr. Chen', room: 'Rm 108', color: 'blue' },
  { id: 'c3', name: 'US History', teacher: 'Mr. Douglas', room: 'Rm 301', color: 'amber' },
  { id: 'c4', name: 'English 11', teacher: 'Ms. Patel', room: 'Rm 220', color: 'violet' },
  { id: 'c5', name: 'Spanish III', teacher: 'Sra. Ortiz', room: 'Rm 115', color: 'rose' }
];

export const SEED_EVENTS: ScheduleEvent[] = [
  { id: 'e1', title: 'AP Biology', classId: 'c1', day: 'Mon', startTime: '08:00', endTime: '08:50', location: 'Rm 214', type: 'class', bringItems: ['Lab notebook', 'Calculator'] },
  { id: 'e2', title: 'Algebra II', classId: 'c2', day: 'Mon', startTime: '09:00', endTime: '09:50', location: 'Rm 108', type: 'class', bringItems: ['Graphing calculator'] },
  { id: 'e3', title: 'US History', classId: 'c3', day: 'Mon', startTime: '10:00', endTime: '10:50', location: 'Rm 301', type: 'class' },
  { id: 'e4', title: 'English 11', classId: 'c4', day: 'Mon', startTime: '11:00', endTime: '11:50', location: 'Rm 220', type: 'class', bringItems: ['Annotated chapter 5'] },
  { id: 'e5', title: 'Spanish III', classId: 'c5', day: 'Mon', startTime: '13:00', endTime: '13:50', location: 'Rm 115', type: 'class' },
  { id: 'e6', title: 'Robotics Club', day: 'Mon', startTime: '15:30', endTime: '17:00', location: 'Rm 118', type: 'club', bringItems: ['Laptop'] },

  { id: 'e7', title: 'AP Biology', classId: 'c1', day: 'Tue', startTime: '08:00', endTime: '08:50', location: 'Rm 214', type: 'class' },
  { id: 'e8', title: 'Algebra II', classId: 'c2', day: 'Tue', startTime: '09:00', endTime: '09:50', location: 'Rm 108', type: 'class' },
  { id: 'e9', title: 'US History', classId: 'c3', day: 'Tue', startTime: '10:00', endTime: '10:50', location: 'Rm 301', type: 'class', bringItems: ['Unit 4 essay draft'] },
  { id: 'e10', title: 'English 11', classId: 'c4', day: 'Tue', startTime: '11:00', endTime: '11:50', location: 'Rm 220', type: 'class' },
  { id: 'e11', title: 'Track Practice', day: 'Tue', startTime: '16:00', endTime: '17:30', location: 'Track', type: 'sport', bringItems: ['Cleats', 'Water bottle'] },

  { id: 'e12', title: 'AP Biology', classId: 'c1', day: 'Wed', startTime: '08:00', endTime: '08:50', location: 'Rm 214', type: 'class', bringItems: ['Lab notebook'] },
  { id: 'e13', title: 'Algebra II', classId: 'c2', day: 'Wed', startTime: '09:00', endTime: '09:50', location: 'Rm 108', type: 'class' },
  { id: 'e14', title: 'Spanish III', classId: 'c5', day: 'Wed', startTime: '13:00', endTime: '13:50', location: 'Rm 115', type: 'class' },
  { id: 'e15', title: 'Student Council', day: 'Wed', startTime: '15:30', endTime: '16:30', location: 'Rm 101', type: 'meeting' },

  { id: 'e16', title: 'US History', classId: 'c3', day: 'Thu', startTime: '10:00', endTime: '10:50', location: 'Rm 301', type: 'class' },
  { id: 'e17', title: 'English 11', classId: 'c4', day: 'Thu', startTime: '11:00', endTime: '11:50', location: 'Rm 220', type: 'class', bringItems: ['Vocabulary quiz notes'] },
  { id: 'e18', title: 'Track Practice', day: 'Thu', startTime: '16:00', endTime: '17:30', location: 'Track', type: 'sport', bringItems: ['Cleats'] },

  { id: 'e19', title: 'AP Biology', classId: 'c1', day: 'Fri', startTime: '08:00', endTime: '08:50', location: 'Rm 214', type: 'class' },
  { id: 'e20', title: 'Algebra II', classId: 'c2', day: 'Fri', startTime: '09:00', endTime: '09:50', location: 'Rm 108', type: 'class', bringItems: ['Ch. 6 problem set'] },
  { id: 'e21', title: 'Spanish III', classId: 'c5', day: 'Fri', startTime: '13:00', endTime: '13:50', location: 'Rm 115', type: 'class' },
  { id: 'e22', title: 'Robotics Club', day: 'Fri', startTime: '15:30', endTime: '17:00', location: 'Rm 118', type: 'club' }
];

export const SEED_GRADES: Grade[] = [
  { id: 'g1', classId: 'c1', title: 'Cell Structure Quiz', type: 'quiz', score: 18, maxScore: 20, date: '2026-06-10' },
  { id: 'g2', classId: 'c1', title: 'Genetics Test', type: 'test', score: 88, maxScore: 100, date: '2026-06-20' },
  { id: 'g3', classId: 'c2', title: 'Quadratics Homework', type: 'homework', score: 9, maxScore: 10, date: '2026-06-12' },
  { id: 'g4', classId: 'c2', title: 'Unit 5 Test', type: 'test', score: 76, maxScore: 100, date: '2026-06-24' },
  { id: 'g5', classId: 'c3', title: 'WWII Essay', type: 'project', score: 92, maxScore: 100, date: '2026-06-18' },
  { id: 'g6', classId: 'c4', title: 'Vocabulary Quiz', type: 'quiz', score: 15, maxScore: 15, date: '2026-06-15' },
  { id: 'g7', classId: 'c5', title: 'Verb Conjugation Test', type: 'test', score: 81, maxScore: 100, date: '2026-06-22' }
];

export const SEED_NOTES: Note[] = [
  {
    id: 'n1',
    classId: 'c1',
    unit: 'Unit 4: Genetics',
    title: 'Mendelian Inheritance',
    content:
      'Dominant vs recessive alleles. Punnett squares predict offspring ratios. Homozygous = same alleles, heterozygous = different alleles. Genotype is the genetic makeup, phenotype is the observable trait.',
    updatedAt: '2026-06-19'
  },
  {
    id: 'n2',
    classId: 'c2',
    unit: 'Unit 5: Quadratics',
    title: 'Solving by Factoring',
    content:
      'Set equation to zero, factor into two binomials, use zero product property. Quadratic formula works when factoring is hard: x = (-b ± √(b²-4ac)) / 2a. Discriminant tells you how many real solutions exist.',
    updatedAt: '2026-06-21'
  },
  {
    id: 'n3',
    classId: 'c3',
    unit: 'Unit 4: WWII',
    title: 'Causes of WWII',
    content:
      'Treaty of Versailles created resentment in Germany. Rise of fascism in Italy and Germany. Policy of appeasement failed to stop expansion. Invasion of Poland in 1939 triggered declarations of war.',
    updatedAt: '2026-06-17'
  }
];

export const SEED_TASKS: Task[] = [
  { id: 't1', title: 'Finish Ch. 6 problem set', classId: 'c2', type: 'homework', dueDate: '2026-07-06', done: false },
  { id: 't2', title: 'Study for Genetics test', classId: 'c1', type: 'study', dueDate: '2026-07-08', done: false },
  { id: 't3', title: 'Read chapters 7-8', classId: 'c4', type: 'homework', dueDate: '2026-07-05', done: false },
  { id: 't4', title: 'Bring permission slip', type: 'reminder', dueDate: '2026-07-04', done: false },
  { id: 't5', title: 'Outline WWII essay revision', classId: 'c3', type: 'assignment', dueDate: '2026-07-10', done: false }
];
