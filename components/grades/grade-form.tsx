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
import { GRADE_TYPE_LABELS } from '@/lib/constants';
import { ClassItem, Grade, GradeType } from '@/lib/types';

export function GradeForm({
  grade,
  classes,
  onSubmit,
  trigger
}: {
  grade?: Grade;
  classes: ClassItem[];
  onSubmit: (item: Omit<Grade, 'id'>) => void;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [classId, setClassId] = useState(grade?.classId ?? classes[0]?.id ?? '');
  const [title, setTitle] = useState(grade?.title ?? '');
  const [type, setType] = useState<GradeType>(grade?.type ?? 'test');
  const [score, setScore] = useState(grade?.score?.toString() ?? '');
  const [maxScore, setMaxScore] = useState(grade?.maxScore?.toString() ?? '100');
  const [date, setDate] = useState(
    grade?.date ?? new Date().toISOString().slice(0, 10)
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !classId) return;
    onSubmit({
      classId,
      title: title.trim(),
      type,
      score: Number(score) || 0,
      maxScore: Number(maxScore) || 100,
      date
    });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{grade ? 'Edit grade' : 'Log a grade'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
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
            <Label htmlFor="grade-title">Title</Label>
            <Input
              id="grade-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Genetics Test"
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-1.5">
              <Label>Type</Label>
              <Select value={type} onChange={(e) => setType(e.target.value as GradeType)}>
                {Object.entries(GRADE_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="grade-score">Score</Label>
              <Input
                id="grade-score"
                type="number"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="grade-max">Out of</Label>
              <Input
                id="grade-max"
                type="number"
                value={maxScore}
                onChange={(e) => setMaxScore(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="grade-date">Date</Label>
            <Input
              id="grade-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={classes.length === 0}>
              {grade ? 'Save changes' : 'Add grade'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
