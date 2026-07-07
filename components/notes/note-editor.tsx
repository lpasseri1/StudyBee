'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ClassItem, Note } from '@/lib/types';

export function NoteEditor({
  note,
  classes,
  onSubmit,
  trigger
}: {
  note?: Note;
  classes: ClassItem[];
  onSubmit: (item: Omit<Note, 'id' | 'updatedAt'>) => void;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [classId, setClassId] = useState(note?.classId ?? classes[0]?.id ?? '');
  const [unit, setUnit] = useState(note?.unit ?? '');
  const [title, setTitle] = useState(note?.title ?? '');
  const [content, setContent] = useState(note?.content ?? '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !classId) return;
    onSubmit({ classId, unit: unit.trim() || 'General', title: title.trim(), content });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{note ? 'Edit note' : 'New note'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label>Class</Label>
              <Select value={classId} onChange={(e) => setClassId(e.target.value)} required>
                {classes.length === 0 && <option value="">Add a class first</option>}
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="note-unit">Unit</Label>
              <Input
                id="note-unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. Unit 4: Genetics"
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="note-title">Title</Label>
            <Input
              id="note-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Mendelian Inheritance"
              required
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="note-content">Content</Label>
            <Textarea
              id="note-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your notes here..."
              className="min-h-[160px]"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={classes.length === 0}>
              {note ? 'Save changes' : 'Save note'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
