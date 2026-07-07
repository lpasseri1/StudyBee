'use client';

import { useMemo, useState } from 'react';
import { NotebookPen, Pencil, Plus, Search, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { NoteEditor } from '@/components/notes/note-editor';
import { EmptyState } from '@/components/shared/empty-state';
import { PageHeader } from '@/components/shared/page-header';
import { CLASS_COLOR_STYLES } from '@/lib/constants';
import { useStudyBee } from '@/lib/store';
import { cn } from '@/lib/utils';

export default function NotesPage() {
  const { classes, notes, addNote, updateNote, deleteNote } = useStudyBee();
  const [query, setQuery] = useState('');
  const [classFilter, setClassFilter] = useState('all');

  const filtered = useMemo(() => {
    return notes
      .filter((n) => classFilter === 'all' || n.classId === classFilter)
      .filter((n) => {
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return (
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.unit.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [notes, query, classFilter]);

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Notes"
        description="Your notebook, organized by class and unit."
        action={
          <NoteEditor
            classes={classes}
            onSubmit={addNote}
            trigger={
              <Button size="sm" disabled={classes.length === 0}>
                <Plus className="mr-1.5 h-4 w-4" /> New note
              </Button>
            }
          />
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="sm:w-48"
        >
          <option value="all">All classes</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>

      {classes.length === 0 ? (
        <EmptyState
          icon={NotebookPen}
          title="Add a class first"
          description="Once you've added a class, you can start taking notes for it."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={NotebookPen}
          title="No notes found"
          description="Try a different search, or create your first note."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((note) => {
            const classItem = classes.find((c) => c.id === note.classId);
            const styles = classItem ? CLASS_COLOR_STYLES[classItem.color] : null;
            return (
              <Card key={note.id} className={cn(styles ? styles.border : undefined)}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">{note.title}</CardTitle>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        {classItem && (
                          <Badge
                            variant="secondary"
                            className={cn(styles?.bg, styles?.text)}
                          >
                            {classItem.name}
                          </Badge>
                        )}
                        <Badge variant="outline">{note.unit}</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-4 text-sm text-muted-foreground">
                    {note.content || 'No content yet.'}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Updated{' '}
                      {new Date(note.updatedAt + 'T00:00:00').toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    <div className="flex gap-1">
                      <NoteEditor
                        note={note}
                        classes={classes}
                        onSubmit={(item) => updateNote(note.id, item)}
                        trigger={
                          <Button size="icon" variant="ghost">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteNote(note.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
