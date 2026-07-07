'use client';

import { useMemo, useState } from 'react';
import { ClipboardCheck, FileInput, Sparkles, Timer } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { EmptyState } from '@/components/shared/empty-state';
import { PageHeader } from '@/components/shared/page-header';
import { useStudyBee } from '@/lib/store';
import {
  HomeworkFeedback,
  ImportedSummary,
  StudyGuide,
  generateStudyGuide,
  getHomeworkFeedback,
  summarizeImportedContent
} from '@/lib/study-ai';

export default function StudyPage() {
  const { classes, notes, addNote } = useStudyBee();

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Study"
        description="Feedback on homework, auto-generated study guides, and content import."
        action={
          <Button asChild variant="outline">
            <Link href="/study/focus">
              <Timer className="mr-1.5 h-4 w-4" />
              Focus Study
            </Link>
          </Button>
        }
      />

      <Tabs defaultValue="feedback">
        <TabsList>
          <TabsTrigger value="feedback">Homework feedback</TabsTrigger>
          <TabsTrigger value="guide">Study guide</TabsTrigger>
          <TabsTrigger value="import">Import content</TabsTrigger>
        </TabsList>


        <TabsContent value="feedback" className="mt-4">
          <HomeworkFeedbackTab />
        </TabsContent>
        <TabsContent value="guide" className="mt-4">
          <StudyGuideTab classes={classes} notes={notes} />
        </TabsContent>
        <TabsContent value="import" className="mt-4">
          <ImportContentTab classes={classes} onSaveAsNote={addNote} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function HomeworkFeedbackTab() {
  const [text, setText] = useState('');
  const [feedback, setFeedback] = useState<HomeworkFeedback | null>(null);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            Paste your homework
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your written answer, essay paragraph, or response here..."
            className="min-h-[220px]"
          />
          <Button
            onClick={() => setFeedback(getHomeworkFeedback(text))}
            disabled={!text.trim()}
          >
            Get feedback
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          {!feedback ? (
            <EmptyState
              icon={ClipboardCheck}
              title="No feedback yet"
              description='Paste your homework and click "Get feedback" to see suggestions.'
            />
          ) : (
            <div className="grid gap-4">
              <div className="flex items-center gap-2">
                <Badge
                  variant={feedback.score === 'strong' ? 'default' : 'secondary'}
                  className="capitalize"
                >
                  {feedback.score}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {feedback.wordCount} words
                </span>
              </div>
              <div>
                <p className="mb-1.5 text-sm font-medium">What's working</p>
                <ul className="grid gap-1.5">
                  {feedback.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-muted-foreground">
                      + {s}
                    </li>
                  ))}
                </ul>
              </div>
              {feedback.improvements.length > 0 && (
                <div>
                  <p className="mb-1.5 text-sm font-medium">Ways to improve</p>
                  <ul className="grid gap-1.5">
                    {feedback.improvements.map((s, i) => (
                      <li key={i} className="text-sm text-muted-foreground">
                        → {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StudyGuideTab({
  classes,
  notes
}: {
  classes: ReturnType<typeof useStudyBee>['classes'];
  notes: ReturnType<typeof useStudyBee>['notes'];
}) {
  const [classId, setClassId] = useState(classes[0]?.id ?? '');
  const units = useMemo(
    () => Array.from(new Set(notes.filter((n) => n.classId === classId).map((n) => n.unit))),
    [notes, classId]
  );
  const [unit, setUnit] = useState('all');
  const [guide, setGuide] = useState<StudyGuide | null>(null);

  const relevantNotes = notes.filter(
    (n) => n.classId === classId && (unit === 'all' || n.unit === unit)
  );

  if (classes.length === 0) {
    return (
      <EmptyState
        icon={Sparkles}
        title="Add a class first"
        description="Study guides are generated from your class notes."
      />
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-muted-foreground" />
            Generate from your notes
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="grid gap-1.5">
            <label className="text-sm font-medium">Class</label>
            <Select
              value={classId}
              onChange={(e) => {
                setClassId(e.target.value);
                setUnit('all');
              }}
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid gap-1.5">
            <label className="text-sm font-medium">Unit</label>
            <Select value={unit} onChange={(e) => setUnit(e.target.value)}>
              <option value="all">All units</option>
              {units.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </Select>
          </div>
          <p className="text-xs text-muted-foreground">
            {relevantNotes.length} note{relevantNotes.length === 1 ? '' : 's'} will be used.
          </p>
          <Button
            onClick={() => setGuide(generateStudyGuide(relevantNotes, unit === 'all' ? 'All units' : unit))}
            disabled={relevantNotes.length === 0}
          >
            Generate study guide
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Study guide</CardTitle>
        </CardHeader>
        <CardContent>
          {!guide ? (
            <EmptyState
              icon={Sparkles}
              title="No guide yet"
              description="Pick a class and generate a study guide from your notes."
            />
          ) : (
            <div className="grid gap-4">
              <div>
                <p className="mb-1.5 text-sm font-medium">Key terms</p>
                <div className="flex flex-wrap gap-1.5">
                  {guide.keyTerms.map((term) => (
                    <Badge key={term} variant="secondary">
                      {term}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-sm font-medium">Summary</p>
                <ul className="grid gap-1.5">
                  {guide.summaryPoints.map((s, i) => (
                    <li key={i} className="text-sm text-muted-foreground">
                      • {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-1.5 text-sm font-medium">Review questions</p>
                <ul className="grid gap-1.5">
                  {guide.reviewQuestions.map((q, i) => (
                    <li key={i} className="text-sm text-muted-foreground">
                      {i + 1}. {q}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ImportContentTab({
  classes,
  onSaveAsNote
}: {
  classes: ReturnType<typeof useStudyBee>['classes'];
  onSaveAsNote: ReturnType<typeof useStudyBee>['addNote'];
}) {
  const [content, setContent] = useState('');
  const [classId, setClassId] = useState(classes[0]?.id ?? '');
  const [unit, setUnit] = useState('');
  const [summary, setSummary] = useState<ImportedSummary | null>(null);
  const [saved, setSaved] = useState(false);

  function handleSummarize() {
    setSummary(summarizeImportedContent(content));
    setSaved(false);
  }

  function handleSave() {
    if (!summary || !classId) return;
    onSaveAsNote({
      classId,
      unit: unit.trim() || 'Imported',
      title: summary.title,
      content: summary.bulletPoints.join(' ')
    });
    setSaved(true);
  }

  if (classes.length === 0) {
    return (
      <EmptyState
        icon={FileInput}
        title="Add a class first"
        description="Imported content is saved as notes under a class."
      />
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileInput className="h-4 w-4 text-muted-foreground" />
            Paste content
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Select value={classId} onChange={(e) => setClassId(e.target.value)}>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            <input
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Unit (optional)"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            />
          </div>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste text from a Google Doc, slides, or any class material..."
            className="min-h-[220px]"
          />
          <Button onClick={handleSummarize} disabled={!content.trim()}>
            Summarize
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {!summary ? (
            <EmptyState
              icon={FileInput}
              title="Nothing summarized yet"
              description="Paste content on the left and summarize it into note-ready bullets."
            />
          ) : (
            <div className="grid gap-4">
              <div>
                <p className="mb-1.5 text-sm font-medium">Key terms</p>
                <div className="flex flex-wrap gap-1.5">
                  {summary.keyTerms.map((term) => (
                    <Badge key={term} variant="secondary">
                      {term}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-sm font-medium">Key points</p>
                <ul className="grid gap-1.5">
                  {summary.bulletPoints.map((s, i) => (
                    <li key={i} className="text-sm text-muted-foreground">
                      • {s}
                    </li>
                  ))}
                </ul>
              </div>
              <Button variant="outline" onClick={handleSave}>
                {saved ? 'Saved to Notes ✓' : 'Save as note'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
