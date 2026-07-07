'use client';

import Link from 'next/link';
import { Backpack, CalendarDays, CheckCircle2, Circle, ChevronRight, GraduationCap, ListTodo, Plus, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClassForm } from '@/components/classes/class-form';
import { TaskForm } from '@/components/tasks/task-form';
import { ClassBadge } from '@/components/shared/class-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { PageHeader } from '@/components/shared/page-header';
import { CLASS_COLOR_STYLES, TASK_TYPE_LABELS } from '@/lib/constants';
import { useStudyBee } from '@/lib/store';
import { ScheduleEvent, Weekday } from '@/lib/types';
import { cn, formatTime12h } from '@/lib/utils';

const WEEKDAY_MAP: Weekday[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getToday(): Weekday {
  return WEEKDAY_MAP[new Date().getDay()];
}

function sortByTime(events: ScheduleEvent[]) {
  return [...events].sort((a, b) => a.startTime.localeCompare(b.startTime));
}

export default function HomePage() {
  const { classes, events, tasks, addClass, addTask, toggleTask, deleteTask } = useStudyBee();

  const today = getToday();
  const todayEvents = sortByTime(events.filter((e) => e.day === today));
  const todayClasses = todayEvents.filter((e) => e.type === 'class');
  const bringItems = Array.from(
    new Set(todayEvents.flatMap((e) => e.bringItems ?? []))
  );

  const upcomingTasks = [...tasks]
    .filter((t) => !t.done)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  const greeting = getGreeting();

  return (
    <div className="grid gap-6">
      <PageHeader
        title={`${greeting}!`}
        description={`Here's what's happening on ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.`}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              Today's schedule
            </CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/schedule">
                Full week <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {todayClasses.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="Nothing scheduled today"
                description="Enjoy the day off, or add something to your schedule."
              />
            ) : (
              <div className="grid gap-2">
                {todayClasses.map((event) => {
                  const classItem = classes.find((c) => c.id === event.classId);
                  const styles = classItem ? CLASS_COLOR_STYLES[classItem.color] : null;
                  return (
                    <div
                      key={event.id}
                      className={cn(
                        'flex items-center justify-between rounded-lg border p-3',
                        styles ? styles.border : 'border-border'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'h-9 w-1 rounded-full',
                            styles ? styles.dot : 'bg-muted-foreground'
                          )}
                        />
                        <div>
                          <p className="text-sm font-medium">{event.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatTime12h(event.startTime)}–{formatTime12h(event.endTime)}
                            {event.location ? ` · ${event.location}` : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Backpack className="h-4 w-4 text-muted-foreground" />
              Don't forget
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bringItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nothing special to bring today — just the basics.
              </p>
            ) : (
              <ul className="grid gap-2">
                {bringItems.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <ListTodo className="h-4 w-4 text-muted-foreground" />
              Upcoming tasks
            </CardTitle>
            <div className="flex items-center gap-1">
              <TaskForm
                classes={classes}
                onSubmit={addTask}
                trigger={
                  <Button size="sm" variant="outline">
                    <Plus className="mr-1.5 h-3.5 w-3.5" /> Add task
                  </Button>
                }
              />
              <Button asChild variant="ghost" size="sm">
                <Link href="/study">
                  Study tools <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingTasks.length === 0 ? (
              <EmptyState
                icon={ListTodo}
                title="You're all caught up"
                description="No pending tasks right now."
              />
            ) : (
              <div className="grid gap-2">
                {upcomingTasks.map((task) => {
                  const classItem = classes.find((c) => c.id === task.classId);
                  return (
                    <div
                      key={task.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <button onClick={() => toggleTask(task.id)} className="shrink-0">
                          <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
                        </button>
                        <div>
                          <p className="text-sm font-medium">{task.title}</p>
                          <div className="mt-1 flex items-center gap-2">
                            <ClassBadge classItem={classItem} />
                            <span className="text-xs text-muted-foreground">
                              Due {new Date(task.dueDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{TASK_TYPE_LABELS[task.type]}</Badge>
                        <Button size="icon" variant="ghost" onClick={() => deleteTask(task.id)}>
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              Your classes
            </CardTitle>
            <ClassForm
              onSubmit={addClass}
              trigger={
                <Button size="icon" variant="ghost" className="h-7 w-7">
                  <span className="sr-only">Add class</span>+
                </Button>
              }
            />
          </CardHeader>
          <CardContent>
            {classes.length === 0 ? (
              <EmptyState
                icon={GraduationCap}
                title="No classes yet"
                description="Add your classes to unlock schedule, grades, and notes."
                action={
                  <ClassForm
                    onSubmit={addClass}
                    trigger={<Button size="sm">Add your first class</Button>}
                  />
                }
              />
            ) : (
              <div className="grid gap-2">
                {classes.map((c) => {
                  const styles = CLASS_COLOR_STYLES[c.color];
                  return (
                    <div key={c.id} className="flex items-center gap-2 rounded-lg border p-2.5">
                      <span className={cn('h-2 w-2 rounded-full', styles.dot)} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{c.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {c.teacher} {c.room ? `· ${c.room}` : ''}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
