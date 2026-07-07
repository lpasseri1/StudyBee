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
import { CLASS_COLORS, CLASS_COLOR_STYLES } from '@/lib/constants';
import { ClassColor, ClassItem } from '@/lib/types';
import { cn } from '@/lib/utils';

export function ClassForm({
  classItem,
  onSubmit,
  trigger
}: {
  classItem?: ClassItem;
  onSubmit: (item: Omit<ClassItem, 'id'>) => void;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(classItem?.name ?? '');
  const [teacher, setTeacher] = useState(classItem?.teacher ?? '');
  const [room, setRoom] = useState(classItem?.room ?? '');
  const [color, setColor] = useState<ClassColor>(classItem?.color ?? 'violet');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), teacher: teacher.trim(), room: room.trim(), color });
    setOpen(false);
    if (!classItem) {
      setName('');
      setTeacher('');
      setRoom('');
      setColor('violet');
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{classItem ? 'Edit class' : 'Add a class'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="class-name">Class name</Label>
            <Input
              id="class-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. AP Biology"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="class-teacher">Teacher</Label>
              <Input
                id="class-teacher"
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
                placeholder="e.g. Ms. Alvarez"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="class-room">Room</Label>
              <Input
                id="class-room"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="e.g. Rm 214"
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {CLASS_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    'h-7 w-7 rounded-full ring-offset-2 ring-offset-background',
                    CLASS_COLOR_STYLES[c].dot,
                    color === c && 'ring-2 ring-foreground'
                  )}
                  aria-label={c}
                />
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">{classItem ? 'Save changes' : 'Add class'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
