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
import { EVENT_TYPE_LABELS, WEEKDAYS } from '@/lib/constants';
import { ClassItem, EventType, ScheduleEvent, Weekday } from '@/lib/types';

export function EventForm({
  event,
  classes,
  onSubmit,
  trigger,
  allowedTypes
}: {
  event?: ScheduleEvent;
  classes: ClassItem[];
  onSubmit: (item: Omit<ScheduleEvent, 'id'>) => void;
  trigger: React.ReactNode;
  allowedTypes?: EventType[];
}) {
  const typeOptions = allowedTypes ?? (Object.keys(EVENT_TYPE_LABELS) as EventType[]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(event?.title ?? '');
  const [classId, setClassId] = useState(event?.classId ?? '');
  const [day, setDay] = useState<Weekday>(event?.day ?? 'Mon');
  const [startTime, setStartTime] = useState(event?.startTime ?? '08:00');
  const [endTime, setEndTime] = useState(event?.endTime ?? '08:50');
  const [location, setLocation] = useState(event?.location ?? '');
  const [type, setType] = useState<EventType>(event?.type ?? typeOptions[0] ?? 'class');
  const [bringItems, setBringItems] = useState(event?.bringItems?.join(', ') ?? '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      classId: classId || undefined,
      day,
      startTime,
      endTime,
      location: location.trim(),
      type,
      bringItems: bringItems
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{event ? 'Edit event' : 'Add to schedule'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="event-title">Title</Label>
            <Input
              id="event-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Robotics Club"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {typeOptions.length > 1 ? (
              <div className="grid gap-1.5">
                <Label>Type</Label>
                <Select value={type} onChange={(e) => setType(e.target.value as EventType)}>
                  {typeOptions.map((value) => (
                    <option key={value} value={value}>
                      {EVENT_TYPE_LABELS[value]}
                    </option>
                  ))}
                </Select>
              </div>
            ) : (
              <input type="hidden" value={type} />
            )}
            <div className="grid gap-1.5">
              <Label>Linked class (optional)</Label>
              <Select value={classId} onChange={(e) => setClassId(e.target.value)}>
                <option value="">None</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-1.5">
              <Label>Day</Label>
              <Select value={day} onChange={(e) => setDay(e.target.value as Weekday)}>
                {WEEKDAYS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="event-start">Start</Label>
              <Input
                id="event-start"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="event-end">End</Label>
              <Input
                id="event-end"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="event-location">Location</Label>
            <Input
              id="event-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Rm 214"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="event-bring">What to bring (comma separated)</Label>
            <Input
              id="event-bring"
              value={bringItems}
              onChange={(e) => setBringItems(e.target.value)}
              placeholder="e.g. Calculator, Lab notebook"
            />
          </div>
          <DialogFooter>
            <Button type="submit">{event ? 'Save changes' : 'Add event'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
