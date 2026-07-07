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
 * customization slot. `hat` and `accessory` are cosmetic ids — the catalog
 * that maps ids to actual artwork is a future pass, so unknown/null ids
 * simply render nothing. This keeps the component ready to grow without any
 * restructuring once cosmetics exist.
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
    </svg>
  );
}

/** Hat slot — plug real cosmetic artwork in here by id once the catalog exists. */
function HatLayer({ id }: { id: string | null }) {
  if (!id) return null;
  // Placeholder rendering for any equipped id until real hat art is added.
  return <rect x="32" y="6" width="36" height="10" rx="4" fill="#57534e" opacity="0.9" />;
}

/** Accessory slot — same idea as HatLayer, kept separate so slots stay independent. */
function AccessoryLayer({ id }: { id: string | null }) {
  if (!id) return null;
  return <circle cx="50" cy="76" r="4" fill="#57534e" opacity="0.9" />;
}
