'use client';

import { useState } from 'react';
import { CalendarDays, Pencil, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EventForm } from '@/components/schedule/event-form';
import { EmptyState } from '@/components/shared/empty-state';
import { PageHeader } from '@/components/shared/page-header';
import { CLASS_COLOR_STYLES, SCHOOL_WEEKDAYS, WEEKDAYS } from '@/lib/constants';
import { useStudyBee } from '@/lib/store';
import { Weekday } from '@/lib/types';
import { cn, formatTime12h } from '@/lib/utils';

const WEEKDAY_MAP: Weekday[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function SchedulePage() {
  const { classes, events, addEvent, updateEvent, deleteEvent } = useStudyBee();
  const today = WEEKDAY_MAP[new Date().getDay()];
  const [day, setDay] = useState<Weekday>(SCHOOL_WEEKDAYS.includes(today) ? today : 'Mon');

  const dayEvents = events
    .filter((e) => e.day === day && e.type === 'class')
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Schedule"
        description="Your weekly class timetable."
        action={
          <EventForm
            classes={classes}
            allowedTypes={['class']}
            onSubmit={addEvent}
            trigger={
              <Button size="sm">
                <Plus className="mr-1.5 h-4 w-4" /> Add class
              </Button>
            }
          />
        }
      />

      <Tabs value={day} onValueChange={(v) => setDay(v as Weekday)}>
        <TabsList>
          {WEEKDAYS.map((d) => (
            <TabsTrigger key={d} value={d}>
              {d}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="pt-6">
          {dayEvents.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title={`Nothing on ${day}`}
              description="Add a class for this day."
            />
          ) : (
            <div className="grid gap-2">
              {dayEvents.map((event) => {
                const classItem = classes.find((c) => c.id === event.classId);
                const styles = classItem ? CLASS_COLOR_STYLES[classItem.color] : null;
                return (
                  <div
                    key={event.id}
                    className={cn(
                      'flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between',
                      styles ? styles.border : 'border-border'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'h-9 w-1 shrink-0 rounded-full',
                          styles ? styles.dot : 'bg-muted-foreground'
                        )}
                      />
                      <div>
                        <p className="text-sm font-medium">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatTime12h(event.startTime)}–{formatTime12h(event.endTime)}
                          {event.location ? ` · ${event.location}` : ''}
                        </p>
                        {event.bringItems && event.bringItems.length > 0 && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Bring: {event.bringItems.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 self-end sm:self-auto">
                      <EventForm
                        event={event}
                        classes={classes}
                        allowedTypes={['class']}
                        onSubmit={(item) => updateEvent(event.id, item)}
                        trigger={
                          <Button size="icon" variant="ghost">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteEvent(event.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
