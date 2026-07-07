'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react';

import { earnCredits } from '@/lib/credits';
import { startFocusSession, updateFocusSession } from '@/lib/study-sessions';

const ACTIVE_SECONDS_PER_CREDIT = 10 * 60; // 10 minutes of active study
const BREAK_SECONDS = 2 * 60; // 2 minute break
const MAX_MINUTES = 120;

type FocusStatus = 'idle' | 'active' | 'break' | 'ending';

interface FocusSessionState {
  status: FocusStatus;
  plannedMinutes: number;
  activeSeconds: number;
  remainingSeconds: number; // countdown for the overall planned duration
  breakSecondsRemaining: number;
  creditsThisSession: number;
  /** True while in-app navigation to other pages should be restricted. */
  isBlocking: boolean;
}

interface FocusSessionContextValue extends FocusSessionState {
  startSession: (minutes: number) => Promise<void>;
  endSession: () => Promise<void>;
}

const FocusSessionContext = createContext<FocusSessionContextValue | null>(null);

const initialState: FocusSessionState = {
  status: 'idle',
  plannedMinutes: 0,
  activeSeconds: 0,
  remainingSeconds: 0,
  breakSecondsRemaining: 0,
  creditsThisSession: 0,
  isBlocking: false
};

export function FocusSessionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<FocusSessionState>(initialState);
  const sessionIdRef = useRef<string | null>(null);
  const activeSecondsSinceCreditRef = useRef(0);

  const startSession = useCallback(async (minutes: number) => {
    const clamped = Math.min(Math.max(1, Math.round(minutes)), MAX_MINUTES);
    const row = await startFocusSession(clamped);
    sessionIdRef.current = row.id;
    activeSecondsSinceCreditRef.current = 0;
    setState({
      status: 'active',
      plannedMinutes: clamped,
      activeSeconds: 0,
      remainingSeconds: clamped * 60,
      breakSecondsRemaining: 0,
      creditsThisSession: 0,
      isBlocking: true
    });
  }, []);

  const endSession = useCallback(async () => {
    const sessionId = sessionIdRef.current;
    setState((prev) => ({ ...prev, status: 'ending', isBlocking: false }));
    if (sessionId) {
      try {
        await updateFocusSession(sessionId, {
          activeSeconds: state.activeSeconds,
          creditsEarned: state.creditsThisSession,
          ended: true
        });
      } catch {
        // Best-effort — don't block the user from leaving if this fails.
      }
    }
    sessionIdRef.current = null;
    setState(initialState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.activeSeconds, state.creditsThisSession]);

  // Main ticking loop — only runs while a session exists.
  useEffect(() => {
    if (state.status !== 'active' && state.status !== 'break') return;

    const interval = setInterval(() => {
      setState((prev) => {
        if (prev.status === 'break') {
          const nextBreakRemaining = prev.breakSecondsRemaining - 1;
          if (nextBreakRemaining <= 0) {
            return { ...prev, status: 'active', breakSecondsRemaining: 0, isBlocking: true };
          }
          return { ...prev, breakSecondsRemaining: nextBreakRemaining };
        }

        // status === 'active'
        const nextActiveSeconds = prev.activeSeconds + 1;
        const nextRemaining = Math.max(0, prev.remainingSeconds - 1);
        activeSecondsSinceCreditRef.current += 1;

        let nextCredits = prev.creditsThisSession;
        let nextStatus: FocusStatus = 'active';
        let nextBlocking = true;
        let breakSecondsRemaining = 0;

        if (activeSecondsSinceCreditRef.current >= ACTIVE_SECONDS_PER_CREDIT) {
          activeSecondsSinceCreditRef.current = 0;
          nextCredits += 1;
          nextStatus = 'break';
          nextBlocking = false;
          breakSecondsRemaining = BREAK_SECONDS;
          earnCredits(1).catch(() => {
            // Balance still tracked locally in creditsThisSession even if the
            // network call fails; it will simply be missing from the synced total.
          });
        }

        if (sessionIdRef.current) {
          updateFocusSession(sessionIdRef.current, {
            activeSeconds: nextActiveSeconds,
            creditsEarned: nextCredits
          }).catch(() => {});
        }

        if (nextRemaining <= 0 && nextStatus === 'active') {
          // Planned duration is up — end automatically.
          nextStatus = 'ending';
        }

        return {
          ...prev,
          status: nextStatus,
          activeSeconds: nextActiveSeconds,
          remainingSeconds: nextRemaining,
          creditsThisSession: nextCredits,
          breakSecondsRemaining,
          isBlocking: nextBlocking
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.status]);

  // Auto-finalize once the planned duration naturally elapses.
  useEffect(() => {
    if (state.status === 'ending') {
      endSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status]);

  // Warn on tab close / hard navigation while a session is running. Browsers
  // no longer show custom text here — this triggers their generic prompt.
  useEffect(() => {
    if (state.status === 'idle') return;

    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = '';
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state.status]);

  return (
    <FocusSessionContext.Provider value={{ ...state, startSession, endSession }}>
      {children}
    </FocusSessionContext.Provider>
  );
}

export function useFocusSession() {
  const ctx = useContext(FocusSessionContext);
  if (!ctx) throw new Error('useFocusSession must be used within FocusSessionProvider');
  return ctx;
}
