'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Coins, Loader2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/page-header';
import { BeeAvatar } from '@/components/profile/bee-avatar';
import { useAvatar } from '@/lib/avatar-context';
import { HAT_CATALOG } from '@/lib/cosmetics';
import { listOwnedCosmeticIds, purchaseCosmetic } from '@/lib/cosmetic-purchases';
import { getCreditsBalance } from '@/lib/credits';

export default function ShopPage() {
  const { slots, updateSlots } = useAvatar();
  const [owned, setOwned] = useState<Set<string>>(new Set());
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    setLoading(true);
    try {
      const [ownedIds, credits] = await Promise.all([listOwnedCosmeticIds(), getCreditsBalance()]);
      setOwned(ownedIds);
      setBalance(credits.balance);
    } catch (err) {
      console.error('Failed to load shop:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleBuy(id: string, cost: number) {
    setPendingId(id);
    setError(null);
    try {
      await purchaseCosmetic(id, cost);
      setOwned((prev) => new Set(prev).add(id));
      setBalance((prev) => prev - cost);
    } catch (err) {
      setError(
        err instanceof Error && err.message.includes('insufficient')
          ? "You don't have enough credits for this yet."
          : 'Could not complete that purchase.'
      );
    } finally {
      setPendingId(null);
    }
  }

  async function handleEquip(id: string) {
    setPendingId(id);
    try {
      await updateSlots({ hat: slots.hat === id ? null : id });
    } catch (err) {
      console.error('Failed to equip:', err);
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Cosmetics shop"
        description="Spend credits from Focus Study on hats for your bee."
        action={
          <Button asChild variant="outline">
            <Link href="/profile">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back to Profile
            </Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="flex items-center gap-3 pt-6">
          <Coins className="h-5 w-5 text-amber-500" />
          <span className="text-sm text-muted-foreground">Your balance:</span>
          <span className="text-lg font-semibold">{loading ? '—' : balance} credits</span>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {HAT_CATALOG.map((item) => {
          const isOwned = owned.has(item.id);
          const isEquipped = slots.hat === item.id;
          const canAfford = balance >= item.cost;
          const isPending = pendingId === item.id;

          return (
            <Card key={item.id}>
              <CardHeader className="items-center pb-2 text-center">
                <BeeAvatar slots={{ ...slots, hat: item.id }} size={100} />
                <CardTitle className="text-base">{item.name}</CardTitle>
                {item.description && (
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                )}
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-3">
                {!isOwned && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Coins className="h-3.5 w-3.5 text-amber-500" />
                    {item.cost} credits
                  </div>
                )}

                {isOwned ? (
                  <Button
                    size="sm"
                    variant={isEquipped ? 'secondary' : 'outline'}
                    className="w-full"
                    disabled={isPending || loading}
                    onClick={() => handleEquip(item.id)}
                  >
                    {isPending ? (
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    ) : isEquipped ? (
                      <Check className="mr-1.5 h-3.5 w-3.5" />
                    ) : null}
                    {isEquipped ? 'Equipped' : 'Equip'}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="w-full"
                    disabled={isPending || loading || !canAfford}
                    onClick={() => handleBuy(item.id, item.cost)}
                  >
                    {isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                    {canAfford ? 'Buy' : 'Not enough credits'}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
