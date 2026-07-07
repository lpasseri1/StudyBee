'use client';

import { useEffect, useState } from 'react';
import { Loader2, Lock, Plus, Shirt, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/shared/page-header';
import { BeeAvatar } from '@/components/profile/bee-avatar';
import { useAvatar } from '@/lib/avatar-context';
import { AvatarColor } from '@/lib/avatar';
import { AvatarOutfit, deleteOutfit, listOutfits, saveOutfit } from '@/lib/avatar-outfits';

const COLOR_OPTIONS: { value: AvatarColor; label: string; swatch: string }[] = [
  { value: 'amber', label: 'Amber', swatch: '#fbbf24' },
  { value: 'violet', label: 'Violet', swatch: '#c4b5fd' },
  { value: 'blue', label: 'Blue', swatch: '#93c5fd' },
  { value: 'emerald', label: 'Emerald', swatch: '#6ee7b7' },
  { value: 'rose', label: 'Rose', swatch: '#fda4af' },
  { value: 'cyan', label: 'Cyan', swatch: '#67e8f9' }
];

export default function ProfilePage() {
  const { slots, loading, updateSlots } = useAvatar();
  const [saving, setSaving] = useState(false);

  const [outfits, setOutfits] = useState<AvatarOutfit[]>([]);
  const [outfitsLoading, setOutfitsLoading] = useState(true);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    listOutfits()
      .then(setOutfits)
      .catch((err) => console.error('Failed to load outfits:', err))
      .finally(() => setOutfitsLoading(false));
  }, []);

  async function handleColorChange(color: AvatarColor) {
    setSaving(true);
    try {
      await updateSlots({ color });
    } catch (err) {
      console.error('Failed to save avatar color:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveOutfit(name: string) {
    const outfit = await saveOutfit(name, slots);
    setOutfits((prev) => [outfit, ...prev]);
  }

  async function handleApplyOutfit(outfit: AvatarOutfit) {
    setApplyingId(outfit.id);
    try {
      await updateSlots(outfit.slots);
    } catch (err) {
      console.error('Failed to apply outfit:', err);
    } finally {
      setApplyingId(null);
    }
  }

  async function handleDeleteOutfit(id: string) {
    setDeletingId(id);
    try {
      await deleteOutfit(id);
      setOutfits((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      console.error('Failed to delete outfit:', err);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Profile"
        description="Your bee avatar — customize it with cosmetics you earn from Focus Study."
      />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 pt-6">
            <BeeAvatar slots={slots} size={160} />
            {saving && <p className="text-xs text-muted-foreground">Saving…</p>}

            <div className="mt-2 w-full border-t pt-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium">Saved outfits</p>
                <SaveOutfitDialog onSave={handleSaveOutfit} />
              </div>

              {outfitsLoading ? (
                <p className="text-xs text-muted-foreground">Loading…</p>
              ) : outfits.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Save your current look to switch between outfits later.
                </p>
              ) : (
                <div className="grid gap-2">
                  {outfits.map((outfit) => (
                    <div
                      key={outfit.id}
                      className="flex items-center gap-2 rounded-lg border p-2 pr-1"
                    >
                      <button
                        type="button"
                        onClick={() => handleApplyOutfit(outfit)}
                        disabled={applyingId === outfit.id}
                        className="flex flex-1 items-center gap-2 text-left"
                      >
                        <BeeAvatar slots={outfit.slots} size={28} />
                        <span className="truncate text-sm">{outfit.name}</span>
                        {applyingId === outfit.id && (
                          <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-muted-foreground" />
                        )}
                      </button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 shrink-0"
                        onClick={() => handleDeleteOutfit(outfit.id)}
                        disabled={deletingId === outfit.id}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Color</CardTitle>
              <CardDescription>Recolor your bee's base sprite.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              {COLOR_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  disabled={loading}
                  onClick={() => handleColorChange(option.value)}
                  aria-label={option.label}
                  className={`h-9 w-9 rounded-full border-2 transition-transform hover:scale-105 ${
                    slots.color === option.value ? 'border-foreground' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: option.swatch }}
                />
              ))}
            </CardContent>
          </Card>

          <SlotCard
            title="Hat"
            description="Equip a hat cosmetic."
            filled={Boolean(slots.hat)}
          />
          <SlotCard
            title="Accessory"
            description="Equip an accessory cosmetic."
            filled={Boolean(slots.accessory)}
          />
        </div>
      </div>
    </div>
  );
}

function SaveOutfitDialog({ onSave }: { onSave: (name: string) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!name.trim()) {
      setError('Give this outfit a name.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(name.trim());
      setName('');
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save this outfit.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Save
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save current look</DialogTitle>
          <DialogDescription>
            Snapshot your bee's current color (and hat/accessory, once you have any equipped) as
            a named outfit you can switch back to later.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-1.5">
          <Label htmlFor="outfit-name">Outfit name</Label>
          <Input
            id="outfit-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Study mode"
            maxLength={40}
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Shirt className="mr-1.5 h-4 w-4" />
            )}
            Save outfit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SlotCard({
  title,
  description,
  filled
}: {
  title: string;
  description: string;
  filled: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Badge variant="outline">{filled ? 'Equipped' : 'Empty'}</Badge>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 rounded-md border border-dashed p-3 text-sm text-muted-foreground">
          <Lock className="h-4 w-4" />
          Cosmetics shop coming soon — spend credits from Focus Study to unlock items here.
        </div>
      </CardContent>
    </Card>
  );
}
