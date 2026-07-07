import { createClient } from '@/lib/supabase/client';
import { ClassItem, Grade, Note, ScheduleEvent, Task } from '@/lib/types';

export interface CoreData {
  classes: ClassItem[];
  events: ScheduleEvent[];
  grades: Grade[];
  notes: Note[];
  tasks: Task[];
}

// === Row <-> app-type mapping ================================================
// DB columns are snake_case; app types are camelCase. Keeping the conversion
// in one place means the rest of the app never has to think about it.

function classFromRow(row: any): ClassItem {
  return { id: row.id, name: row.name, teacher: row.teacher, room: row.room, color: row.color };
}

function eventFromRow(row: any): ScheduleEvent {
  return {
    id: row.id,
    title: row.title,
    classId: row.class_id ?? undefined,
    day: row.day,
    startTime: row.start_time,
    endTime: row.end_time,
    location: row.location,
    type: row.type,
    bringItems: row.bring_items ?? undefined
  };
}

function gradeFromRow(row: any): Grade {
  return {
    id: row.id,
    classId: row.class_id,
    title: row.title,
    type: row.type,
    score: Number(row.score),
    maxScore: Number(row.max_score),
    date: row.date
  };
}

function noteFromRow(row: any): Note {
  return {
    id: row.id,
    classId: row.class_id,
    unit: row.unit,
    title: row.title,
    content: row.content,
    updatedAt: row.updated_at
  };
}

function taskFromRow(row: any): Task {
  return {
    id: row.id,
    title: row.title,
    classId: row.class_id ?? undefined,
    type: row.type,
    dueDate: row.due_date,
    done: row.done,
    notes: row.notes ?? undefined
  };
}

/** Fetches everything for the signed-in user in parallel. Returns all-empty if not signed in. */
export async function fetchAllCoreData(): Promise<CoreData> {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { classes: [], events: [], grades: [], notes: [], tasks: [] };
  }

  const [classesRes, eventsRes, gradesRes, notesRes, tasksRes] = await Promise.all([
    supabase.from('classes').select('*').eq('user_id', user.id).order('created_at'),
    supabase.from('schedule_events').select('*').eq('user_id', user.id).order('created_at'),
    supabase.from('grades').select('*').eq('user_id', user.id).order('created_at'),
    supabase.from('notes').select('*').eq('user_id', user.id).order('created_at'),
    supabase.from('tasks').select('*').eq('user_id', user.id).order('created_at')
  ]);

  for (const res of [classesRes, eventsRes, gradesRes, notesRes, tasksRes]) {
    if (res.error) throw res.error;
  }

  return {
    classes: (classesRes.data ?? []).map(classFromRow),
    events: (eventsRes.data ?? []).map(eventFromRow),
    grades: (gradesRes.data ?? []).map(gradeFromRow),
    notes: (notesRes.data ?? []).map(noteFromRow),
    tasks: (tasksRes.data ?? []).map(taskFromRow)
  };
}

async function currentUserId(): Promise<string> {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');
  return user.id;
}

// === Classes ==================================================================
export async function insertClass(item: Omit<ClassItem, 'id'>): Promise<ClassItem> {
  const supabase = createClient();
  const userId = await currentUserId();
  const { data, error } = await supabase
    .from('classes')
    .insert({
      user_id: userId,
      name: item.name,
      teacher: item.teacher,
      room: item.room,
      color: item.color
    })
    .select('*')
    .single();
  if (error) throw error;
  return classFromRow(data);
}

export async function updateClassRow(id: string, item: Omit<ClassItem, 'id'>): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('classes')
    .update({ name: item.name, teacher: item.teacher, room: item.room, color: item.color })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteClassRow(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('classes').delete().eq('id', id);
  if (error) throw error;
}

// === Schedule events ==========================================================
export async function insertEvent(item: Omit<ScheduleEvent, 'id'>): Promise<ScheduleEvent> {
  const supabase = createClient();
  const userId = await currentUserId();
  const { data, error } = await supabase
    .from('schedule_events')
    .insert({
      user_id: userId,
      title: item.title,
      class_id: item.classId ?? null,
      day: item.day,
      start_time: item.startTime,
      end_time: item.endTime,
      location: item.location,
      type: item.type,
      bring_items: item.bringItems ?? null
    })
    .select('*')
    .single();
  if (error) throw error;
  return eventFromRow(data);
}

export async function updateEventRow(id: string, item: Omit<ScheduleEvent, 'id'>): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('schedule_events')
    .update({
      title: item.title,
      class_id: item.classId ?? null,
      day: item.day,
      start_time: item.startTime,
      end_time: item.endTime,
      location: item.location,
      type: item.type,
      bring_items: item.bringItems ?? null
    })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteEventRow(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('schedule_events').delete().eq('id', id);
  if (error) throw error;
}

// === Grades ====================================================================
export async function insertGrade(item: Omit<Grade, 'id'>): Promise<Grade> {
  const supabase = createClient();
  const userId = await currentUserId();
  const { data, error } = await supabase
    .from('grades')
    .insert({
      user_id: userId,
      class_id: item.classId,
      title: item.title,
      type: item.type,
      score: item.score,
      max_score: item.maxScore,
      date: item.date
    })
    .select('*')
    .single();
  if (error) throw error;
  return gradeFromRow(data);
}

export async function updateGradeRow(id: string, item: Omit<Grade, 'id'>): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('grades')
    .update({
      class_id: item.classId,
      title: item.title,
      type: item.type,
      score: item.score,
      max_score: item.maxScore,
      date: item.date
    })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteGradeRow(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('grades').delete().eq('id', id);
  if (error) throw error;
}

// === Notes ====================================================================
export async function insertNote(item: Omit<Note, 'id' | 'updatedAt'>): Promise<Note> {
  const supabase = createClient();
  const userId = await currentUserId();
  const updatedAt = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from('notes')
    .insert({
      user_id: userId,
      class_id: item.classId,
      unit: item.unit,
      title: item.title,
      content: item.content,
      updated_at: updatedAt
    })
    .select('*')
    .single();
  if (error) throw error;
  return noteFromRow(data);
}

export async function updateNoteRow(
  id: string,
  item: Omit<Note, 'id' | 'updatedAt'>
): Promise<Note> {
  const supabase = createClient();
  const updatedAt = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from('notes')
    .update({
      class_id: item.classId,
      unit: item.unit,
      title: item.title,
      content: item.content,
      updated_at: updatedAt
    })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return noteFromRow(data);
}

export async function deleteNoteRow(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('notes').delete().eq('id', id);
  if (error) throw error;
}

// === Tasks ====================================================================
export async function insertTask(item: Omit<Task, 'id'>): Promise<Task> {
  const supabase = createClient();
  const userId = await currentUserId();
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id: userId,
      title: item.title,
      class_id: item.classId ?? null,
      type: item.type,
      due_date: item.dueDate,
      done: item.done,
      notes: item.notes ?? null
    })
    .select('*')
    .single();
  if (error) throw error;
  return taskFromRow(data);
}

export async function updateTaskRow(id: string, item: Omit<Task, 'id'>): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('tasks')
    .update({
      title: item.title,
      class_id: item.classId ?? null,
      type: item.type,
      due_date: item.dueDate,
      done: item.done,
      notes: item.notes ?? null
    })
    .eq('id', id);
  if (error) throw error;
}

export async function toggleTaskRow(id: string, done: boolean): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('tasks').update({ done }).eq('id', id);
  if (error) throw error;
}

export async function deleteTaskRow(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) throw error;
}
