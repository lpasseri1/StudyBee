'use client';

import { useState } from 'react';
import { GraduationCap, Pencil, Plus, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { GradeForm } from '@/components/grades/grade-form';
import { EmptyState } from '@/components/shared/empty-state';
import { PageHeader } from '@/components/shared/page-header';
import { CLASS_COLOR_STYLES, GRADE_TYPE_LABELS } from '@/lib/constants';
import { useStudyBee } from '@/lib/store';
import { ClassItem, Grade } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function GradesPage() {
  const { classes, grades, addGrade, updateGrade, deleteGrade } = useStudyBee();
  const [tab, setTab] = useState('all');

  const overallPercent = average(grades.map((g) => (g.score / g.maxScore) * 100));

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Grades"
        description="Tests and homework, tracked in one place."
        action={
          <GradeForm
            classes={classes}
            onSubmit={addGrade}
            trigger={
              <Button size="sm" disabled={classes.length === 0}>
                <Plus className="mr-1.5 h-4 w-4" /> Log grade
              </Button>
            }
          />
        }
      />

      {classes.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              icon={GraduationCap}
              title="Add a class first"
              description="Once you've added a class, you can start logging grades for it."
            />
          </CardContent>
        </Card>
      ) : (
        <Tabs value={tab} onValueChange={setTab}>
          <div className="overflow-x-auto pb-1">
            <TabsList className="w-max">
              <TabsTrigger value="all">All classes</TabsTrigger>
              {classes.slice(0, 20).map((c) => (
                <TabsTrigger key={c.id} value={c.id} className="gap-1.5">
                  <span
                    className={cn('h-1.5 w-1.5 rounded-full', CLASS_COLOR_STYLES[c.color].dot)}
                  />
                  {c.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="all" className="mt-4 grid gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Overall average
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">
                  {overallPercent === null ? '—' : `${overallPercent.toFixed(1)}%`}
                </div>
                <Progress value={overallPercent ?? 0} className="mt-3" />
              </CardContent>
            </Card>
            <GradesTable
              grades={grades}
              classes={classes}
              showClassColumn
              onEdit={updateGrade}
              onDelete={deleteGrade}
              emptyTitle="No grades logged yet"
              emptyDescription="Log your first test or homework grade to see it here."
            />
          </TabsContent>

          {classes.map((c) => (
            <TabsContent key={c.id} value={c.id} className="mt-4 grid gap-6">
              <ClassGradesPanel
                classItem={c}
                grades={grades.filter((g) => g.classId === c.id)}
                classes={classes}
                onEdit={updateGrade}
                onDelete={deleteGrade}
              />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}

function ClassGradesPanel({
  classItem,
  grades,
  classes,
  onEdit,
  onDelete
}: {
  classItem: ClassItem;
  grades: Grade[];
  classes: ClassItem[];
  onEdit: (id: string, item: Omit<Grade, 'id'>) => void;
  onDelete: (id: string) => void;
}) {
  const pct = average(grades.map((g) => (g.score / g.maxScore) * 100));
  const styles = CLASS_COLOR_STYLES[classItem.color];

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <span className={cn('h-2 w-2 rounded-full', styles.dot)} />
            {classItem.name} average
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-semibold">
            {pct === null ? '—' : `${pct.toFixed(1)}%`}
          </div>
          <Progress value={pct ?? 0} className="mt-3" />
        </CardContent>
      </Card>
      <GradesTable
        grades={grades}
        classes={classes}
        showClassColumn={false}
        onEdit={onEdit}
        onDelete={onDelete}
        emptyTitle={`No grades for ${classItem.name} yet`}
        emptyDescription="Log a test or homework grade for this class to see it here."
      />
    </>
  );
}

function GradesTable({
  grades,
  classes,
  showClassColumn,
  onEdit,
  onDelete,
  emptyTitle,
  emptyDescription
}: {
  grades: Grade[];
  classes: ClassItem[];
  showClassColumn: boolean;
  onEdit: (id: string, item: Omit<Grade, 'id'>) => void;
  onDelete: (id: string) => void;
  emptyTitle: string;
  emptyDescription: string;
}) {
  const sorted = [...grades].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <GraduationCap className="h-4 w-4 text-muted-foreground" />
          Grades
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <EmptyState icon={GraduationCap} title={emptyTitle} description={emptyDescription} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                {showClassColumn && <TableHead>Class</TableHead>}
                <TableHead>Type</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((grade) => {
                const classItem = classes.find((c) => c.id === grade.classId);
                const pct = (grade.score / grade.maxScore) * 100;
                return (
                  <TableRow key={grade.id}>
                    <TableCell className="font-medium">{grade.title}</TableCell>
                    {showClassColumn && (
                      <TableCell>
                        {classItem && (
                          <span className="inline-flex items-center gap-1.5">
                            <span
                              className={cn(
                                'h-1.5 w-1.5 rounded-full',
                                CLASS_COLOR_STYLES[classItem.color].dot
                              )}
                            />
                            {classItem.name}
                          </span>
                        )}
                      </TableCell>
                    )}
                    <TableCell>
                      <Badge variant="secondary">{GRADE_TYPE_LABELS[grade.type]}</Badge>
                    </TableCell>
                    <TableCell>
                      {grade.score}/{grade.maxScore}{' '}
                      <span className="text-muted-foreground">({pct.toFixed(0)}%)</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(grade.date + 'T00:00:00').toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <GradeForm
                          grade={grade}
                          classes={classes}
                          onSubmit={(item) => onEdit(grade.id, item)}
                          trigger={
                            <Button size="icon" variant="ghost">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <Button size="icon" variant="ghost" onClick={() => onDelete(grade.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}
