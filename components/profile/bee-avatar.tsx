import type { AvatarColor, AvatarSlots } from '@/lib/avatar';

// Body color changes with the selected avatar color; wings/head stay a
// constant slate-blue to match the reference artwork regardless of color.
const BODY_COLOR_MAP: Record<AvatarColor, string> = {
  amber: '#e8a13d',
  violet: '#a78bfa',
  blue: '#5b9bd5',
  emerald: '#4fb488',
  rose: '#e8778f',
  cyan: '#4fc3d9'
};

const WING_COLOR = '#5c7896';
const OUTLINE_COLOR = '#33363b';

/**
 * Renders the bee base sprite plus whatever is plugged into each
 * customization slot. Hat/accessory ids are looked up in HAT_ARTWORK /
 * ACCESSORY_ARTWORK (see below and lib/cosmetics.ts for the shop catalog
 * these ids come from) — unknown/null ids simply render nothing.
 */
export function BeeAvatar({
  slots,
  size = 96
}: {
  slots: AvatarSlots;
  size?: number;
}) {
  const bodyColor = BODY_COLOR_MAP[slots.color] ?? BODY_COLOR_MAP.amber;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Your bee avatar"
    >
      {/* antennae */}
      <path
        d="M42 26 Q34 14 26 12"
        stroke={OUTLINE_COLOR}
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M58 26 Q66 14 74 12"
        stroke={OUTLINE_COLOR}
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="26" cy="12" r="3" fill={OUTLINE_COLOR} />
      <circle cx="74" cy="12" r="3" fill={OUTLINE_COLOR} />

      {/* wings */}
      <path
        d="M42,38 C20,32 6,48 10,64 C14,78 32,76 42,62 C46,56 46,44 42,38 Z"
        fill={WING_COLOR}
        stroke={OUTLINE_COLOR}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M58,38 C80,32 94,48 90,64 C86,78 68,76 58,62 C54,56 54,44 58,38 Z"
        fill={WING_COLOR}
        stroke={OUTLINE_COLOR}
        strokeWidth="4"
        strokeLinejoin="round"
      />

      {/* head */}
      <circle cx="50" cy="34" r="10" fill={WING_COLOR} stroke={OUTLINE_COLOR} strokeWidth="4" />

      {/* body */}
      <path
        d="M50,46 C64,46 70,60 66,74 C63,86 56,94 50,94 C44,94 37,86 34,74 C30,60 36,46 50,46 Z"
        fill={bodyColor}
        stroke={OUTLINE_COLOR}
        strokeWidth="4"
        strokeLinejoin="round"
      />

      <HatLayer id={slots.hat} />
      <AccessoryLayer id={slots.accessory} />

      {/* Mario/Luigi caps bundle a mustache automatically — it's part of
          the "outfit" rather than a separately-equippable accessory. */}
      {slots.hat === 'mario-cap' && <MarioMustache />}
      {slots.hat === 'luigi-cap' && <LuigiMustache />}
    </svg>
  );
}

/** Hat slot — looks up artwork by the cosmetic id from the shop catalog (lib/cosmetics.ts). */
function HatLayer({ id }: { id: string | null }) {
  switch (id) {
    case 'chef-hat':
      return (
        <g>
          <path
            d="M35,22 Q29,22 28,15 Q27,7 36,6 Q37,1 44,3 Q47,0 50,0 Q53,0 56,3 Q63,1 64,6 Q73,7 72,15 Q71,22 65,22 Z"
            fill="#fff"
            stroke={OUTLINE_COLOR}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <rect x="35" y="20" width="30" height="8" rx="1" fill="#fff" stroke={OUTLINE_COLOR} strokeWidth="3" />
          <line x1="42" y1="9" x2="42" y2="18" stroke={OUTLINE_COLOR} strokeWidth="2" strokeLinecap="round" />
          <line x1="50" y1="6" x2="50" y2="18" stroke={OUTLINE_COLOR} strokeWidth="2" strokeLinecap="round" />
          <line x1="58" y1="9" x2="58" y2="18" stroke={OUTLINE_COLOR} strokeWidth="2" strokeLinecap="round" />
        </g>
      );

    case 'cap':
      return (
        <g>
          <path
            d="M30,26 Q30,8 50,7 Q70,8 70,26 Z"
            fill="#e8622c"
            stroke={OUTLINE_COLOR}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M31,25 Q16,26 13,22 Q18,31 33,29 Q41,28 34,25 Z"
            fill="#c94f22"
            stroke={OUTLINE_COLOR}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <circle cx="50" cy="7" r="2.3" fill="#c94f22" stroke={OUTLINE_COLOR} strokeWidth="1.5" />
          <path d="M50,9 Q45,17 46,26" fill="none" stroke={OUTLINE_COLOR} strokeWidth="1.5" />
        </g>
      );

    case 'santa-hat':
      // Traced directly from the user's own reference art (public/cosmetics/santa-hat.png)
      // rather than hand-drawn paths — aspect ratio matches the source exactly.
      return <image href="/cosmetics/santa-hat.png" x="34" y="0" width="32" height="32.7" />;

    case 'pirate-hat':
      return (
        <g>
          <path
            d="M8,32 Q20,16 34,15 Q42,8 50,12 Q58,8 66,15 Q80,16 92,32 Q80,30 72,26 Q64,32 56,28 Q52,30 50,28 Q48,30 44,28 Q36,32 28,26 Q20,30 8,32 Z"
            fill="#1c1c1c"
            stroke="#1c1c1c"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <circle cx="50" cy="19" r="6" fill="#fff" />
          <circle cx="47.5" cy="18" r="1.3" fill="#1c1c1c" />
          <circle cx="52.5" cy="18" r="1.3" fill="#1c1c1c" />
          <line x1="42" y1="26" x2="58" y2="32" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="58" y1="26" x2="42" y2="32" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="42" cy="26" r="1.8" fill="#fff" />
          <circle cx="58" cy="26" r="1.8" fill="#fff" />
          <circle cx="42" cy="32" r="1.8" fill="#fff" />
          <circle cx="58" cy="32" r="1.8" fill="#fff" />
        </g>
      );

    case 'viking-helmet':
      return (
        <g>
          <path
            d="M34,26 C24,26 14,20 10,10 C10,8 12,7 14,9 C20,18 30,22 38,22 Z"
            fill="#fff"
            stroke="#1c1c1c"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d="M66,26 C76,26 86,20 90,10 C90,8 88,7 86,9 C80,18 70,22 62,22 Z"
            fill="#fff"
            stroke="#1c1c1c"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path d="M32,30 Q32,14 50,12 Q68,14 68,30 Z" fill="#fff" stroke="#1c1c1c" strokeWidth="3" strokeLinejoin="round" />
          <line x1="47" y1="13" x2="47" y2="29" stroke="#1c1c1c" strokeWidth="1.8" />
          <line x1="53" y1="13" x2="53" y2="29" stroke="#1c1c1c" strokeWidth="1.8" />
          <rect x="30" y="28" width="40" height="5" rx="2.5" fill="#fff" stroke="#1c1c1c" strokeWidth="3" />
        </g>
      );

    case 'mario-cap':
      return (
        <g>
          <path
            d="M27,27 Q23,9 50,6 Q77,9 73,27 Q74,30 66,30 L34,30 Q26,30 27,27 Z"
            fill="#d13a2d"
            stroke={OUTLINE_COLOR}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <ellipse cx="50" cy="19" rx="10" ry="7.5" fill="#fff" stroke={OUTLINE_COLOR} strokeWidth="2" />
          <text x="50" y="23" fontSize="12" fontWeight="700" textAnchor="middle" fill="#d13a2d">
            M
          </text>
        </g>
      );

    case 'luigi-cap':
      return (
        <g>
          <path
            d="M27,27 Q23,9 50,6 Q77,9 73,27 Q74,30 66,30 L34,30 Q26,30 27,27 Z"
            fill="#3a9648"
            stroke={OUTLINE_COLOR}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <ellipse cx="50" cy="19" rx="10" ry="7.5" fill="#fff" stroke={OUTLINE_COLOR} strokeWidth="2" />
          <text x="50" y="23" fontSize="12" fontWeight="700" textAnchor="middle" fill="#3a9648">
            L
          </text>
        </g>
      );

    default:
      return null;
  }
}

/** Accessory slot — same lookup idea as HatLayer, kept independent so slots don't interfere. */
function AccessoryLayer({ id }: { id: string | null }) {
  if (!id) return null;
  return <circle cx="50" cy="76" r="4" fill="#57534e" opacity="0.9" />;
}

function MarioMustache() {
  return (
    <g>
      <path
        d="M31,38 Q31,34 36,34 L64,34 Q69,34 69,38 Q69,42 60,42 Q55,45 50,42 Q45,45 40,42 Q31,42 31,38 Z"
        fill="#1c1c1c"
      />
    </g>
  );
}

function LuigiMustache() {
  return (
    <g>
      <path d="M32,39 Q38,44 50,43 Q62,44 68,39 Q62,41 50,41 Q38,41 32,39 Z" fill="#1c1c1c" />
    </g>
  );
}
