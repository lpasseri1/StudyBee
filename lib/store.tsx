'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import {
  ClassItem,
  Grade,
  Note,
  ScheduleEvent,
  Task
} from './types';
import {
  CoreData,
  deleteClassRow,
  deleteEventRow,
  deleteGradeRow,
  deleteNoteRow,
  deleteTaskRow,
  fetchAllCoreData,
  insertClass,
  insertEvent,
  insertGrade,
  insertNote,
  insertTask,
  toggleTaskRow,
  updateClassRow,
  updateEventRow,
  updateGradeRow,
  updateNoteRow,
  updateTaskRow
} from './core-data';

const EMPTY: CoreData = {
  classes: [],
  events: [],
  grades: [],
  notes: [],
  tasks: []
};

interface StudyBeeContextValue extends CoreData {
  loading: boolean;

  addClass: (item: Omit<ClassItem, 'id'>) => void;
  updateClass: (id: string, item: Omit<ClassItem, 'id'>) => void;
  deleteClass: (id: string) => void;

  addEvent: (item: Omit<ScheduleEvent, 'id'>) => void;
  updateEvent: (id: string, item: Omit<ScheduleEvent, 'id'>) => void;
  deleteEvent: (id: string) => void;

  addGrade: (item: Omit<Grade, 'id'>) => void;
  updateGrade: (id: string, item: Omit<Grade, 'id'>) => void;
  deleteGrade: (id: string) => void;

  addNote: (item: Omit<Note, 'id' | 'updatedAt'>) => void;
  updateNote: (id: string, item: Omit<Note, 'id' | 'updatedAt'>) => void;
  deleteNote: (id: string) => void;

  addTask: (item: Omit<Task, 'id'>) => void;
  updateTask: (id: string, item: Omit<Task, 'id'>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
}

const StudyBeeContext = createContext<StudyBeeContextValue | null>(null);

function makeTempId() {
  return `tmp_${Math.random().toString(36).slice(2, 10)}`;
}

export function StudyBeeProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<CoreData>(EMPTY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchAllCoreData()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => console.error('Failed to load StudyBee data:', err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // === Classes ================================================================
  const addClass = useCallback((item: Omit<ClassItem, 'id'>) => {
    const tempId = makeTempId();
    setData((d) => ({ ...d, classes: [...d.classes, { ...item, id: tempId }] }));

    insertClass(item)
      .then((created) => {
        setData((d) => ({
          ...d,
          classes: d.classes.map((c) => (c.id === tempId ? created : c))
        }));
      })
      .catch((err) => {
        console.error('Failed to save class:', err);
        setData((d) => ({ ...d, classes: d.classes.filter((c) => c.id !== tempId) }));
      });
  }, []);

  const updateClass = useCallback((id: string, item: Omit<ClassItem, 'id'>) => {
    setData((d) => ({
      ...d,
      classes: d.classes.map((c) => (c.id === id ? { ...item, id } : c))
    }));
    updateClassRow(id, item).catch((err) => console.error('Failed to update class:', err));
  }, []);

  const deleteClass = useCallback((id: string) => {
    // Mirrors the DB's own cascade/set-null behavior locally for an instant UI update.
    setData((d) => ({
      ...d,
      classes: d.classes.filter((c) => c.id !== id),
      events: d.events.filter((e) => e.classId !== id),
      grades: d.grades.filter((g) => g.classId !== id),
      notes: d.notes.filter((n) => n.classId !== id),
      tasks: d.tasks.map((t) => (t.classId === id ? { ...t, classId: undefined } : t))
    }));
    deleteClassRow(id).catch((err) => console.error('Failed to delete class:', err));
  }, []);

  // === Schedule events =========================================================
  const addEvent = useCallback((item: Omit<ScheduleEvent, 'id'>) => {
    const tempId = makeTempId();
    setData((d) => ({ ...d, events: [...d.events, { ...item, id: tempId }] }));

    insertEvent(item)
      .then((created) => {
        setData((d) => ({
          ...d,
          events: d.events.map((e) => (e.id === tempId ? created : e))
        }));
      })
      .catch((err) => {
        console.error('Failed to save schedule event:', err);
        setData((d) => ({ ...d, events: d.events.filter((e) => e.id !== tempId) }));
      });
  }, []);

  const updateEvent = useCallback((id: string, item: Omit<ScheduleEvent, 'id'>) => {
    setData((d) => ({
      ...d,
      events: d.events.map((e) => (e.id === id ? { ...item, id } : e))
    }));
    updateEventRow(id, item).catch((err) => console.error('Failed to update event:', err));
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setData((d) => ({ ...d, events: d.events.filter((e) => e.id !== id) }));
    deleteEventRow(id).catch((err) => console.error('Failed to delete event:', err));
  }, []);

  // === Grades ====================================================================
  const addGrade = useCallback((item: Omit<Grade, 'id'>) => {
    const tempId = makeTempId();
    setData((d) => ({ ...d, grades: [...d.grades, { ...item, id: tempId }] }));

    insertGrade(item)
      .then((created) => {
        setData((d) => ({
          ...d,
          grades: d.grades.map((g) => (g.id === tempId ? created : g))
        }));
      })
      .catch((err) => {
        console.error('Failed to save grade:', err);
        setData((d) => ({ ...d, grades: d.grades.filter((g) => g.id !== tempId) }));
      });
  }, []);

  const updateGrade = useCallback((id: string, item: Omit<Grade, 'id'>) => {
    setData((d) => ({
      ...d,
      grades: d.grades.map((g) => (g.id === id ? { ...item, id } : g))
    }));
    updateGradeRow(id, item).catch((err) => console.error('Failed to update grade:', err));
  }, []);

  const deleteGrade = useCallback((id: string) => {
    setData((d) => ({ ...d, grades: d.grades.filter((g) => g.id !== id) }));
    deleteGradeRow(id).catch((err) => console.error('Failed to delete grade:', err));
  }, []);

  // === Notes ====================================================================
  const addNote = useCallback((item: Omit<Note, 'id' | 'updatedAt'>) => {
    const tempId = makeTempId();
    const optimisticUpdatedAt = new Date().toISOString().slice(0, 10);
    setData((d) => ({
      ...d,
      notes: [...d.notes, { ...item, id: tempId, updatedAt: optimisticUpdatedAt }]
    }));

    insertNote(item)
      .then((created) => {
        setData((d) => ({
          ...d,
          notes: d.notes.map((n) => (n.id === tempId ? created : n))
        }));
      })
      .catch((err) => {
        console.error('Failed to save note:', err);
        setData((d) => ({ ...d, notes: d.notes.filter((n) => n.id !== tempId) }));
      });
  }, []);

  const updateNote = useCallback((id: string, item: Omit<Note, 'id' | 'updatedAt'>) => {
    const optimisticUpdatedAt = new Date().toISOString().slice(0, 10);
    setData((d) => ({
      ...d,
      notes: d.notes.map((n) =>
        n.id === id ? { ...item, id, updatedAt: optimisticUpdatedAt } : n
      )
    }));

    updateNoteRow(id, item)
      .then((updated) => {
        setData((d) => ({ ...d, notes: d.notes.map((n) => (n.id === id ? updated : n)) }));
      })
      .catch((err) => console.error('Failed to update note:', err));
  }, []);

  const deleteNote = useCallback((id: string) => {
    setData((d) => ({ ...d, notes: d.notes.filter((n) => n.id !== id) }));
    deleteNoteRow(id).catch((err) => console.error('Failed to delete note:', err));
  }, []);

  // === Tasks ====================================================================
  const addTask = useCallback((item: Omit<Task, 'id'>) => {
    const tempId = makeTempId();
    setData((d) => ({ ...d, tasks: [...d.tasks, { ...item, id: tempId }] }));

    insertTask(item)
      .then((created) => {
        setData((d) => ({
          ...d,
          tasks: d.tasks.map((t) => (t.id === tempId ? created : t))
        }));
      })
      .catch((err) => {
        console.error('Failed to save task:', err);
        setData((d) => ({ ...d, tasks: d.tasks.filter((t) => t.id !== tempId) }));
      });
  }, []);

  const updateTask = useCallback((id: string, item: Omit<Task, 'id'>) => {
    setData((d) => ({
      ...d,
      tasks: d.tasks.map((t) => (t.id === id ? { ...item, id } : t))
    }));
    updateTaskRow(id, item).catch((err) => console.error('Failed to update task:', err));
  }, []);

  const toggleTask = useCallback((id: string) => {
    let nextDone = false;
    setData((d) => ({
      ...d,
      tasks: d.tasks.map((t) => {
        if (t.id !== id) return t;
        nextDone = !t.done;
        return { ...t, done: nextDone };
      })
    }));
    toggleTaskRow(id, nextDone).catch((err) => console.error('Failed to toggle task:', err));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setData((d) => ({ ...d, tasks: d.tasks.filter((t) => t.id !== id) }));
    deleteTaskRow(id).catch((err) => console.error('Failed to delete task:', err));
  }, []);

  const value = useMemo<StudyBeeContextValue>(
    () => ({
      ...data,
      loading,
      addClass,
      updateClass,
      deleteClass,
      addEvent,
      updateEvent,
      deleteEvent,
      addGrade,
      updateGrade,
      deleteGrade,
      addNote,
      updateNote,
      deleteNote,
      addTask,
      updateTask,
      toggleTask,
      deleteTask
    }),
    [
      data,
      loading,
      addClass,
      updateClass,
      deleteClass,
      addEvent,
      updateEvent,
      deleteEvent,
      addGrade,
      updateGrade,
      deleteGrade,
      addNote,
      updateNote,
      deleteNote,
      addTask,
      updateTask,
      toggleTask,
      deleteTask
    ]
  );

  return (
    <StudyBeeContext.Provider value={value}>{children}</StudyBeeContext.Provider>
  );
}

export function useStudyBee() {
  const ctx = useContext(StudyBeeContext);
  if (!ctx) throw new Error('useStudyBee must be used within StudyBeeProvider');
  return ctx;
}
