// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Truong Quoc Tri
// ID: 4010989

export type UiStatus = 'PENDING' | 'ACTIVE' | 'DELIVERED' | 'CANCELED';

type Props = {
  status: UiStatus;
  className?: string;
};

const STEPS: { key: UiStatus; label: string }[] = [
  { key: 'PENDING', label: 'Pending' },
  { key: 'ACTIVE', label: 'Active' },
  { key: 'DELIVERED', label: 'Delivered' },
];

export default function OrderStatusBar({ status, className = '' }: Props) {
  const currentIndex = Math.max(
    0,
    STEPS.findIndex((s) => s.key === status),
  );

  // % width of the green progress line (0, 50, 100)
  const progressPct = (currentIndex / (STEPS.length - 1)) * 100;

  return (
    <div className={`relative w-full max-w-xl ${className}`}>
      {/* Base track */}
      <div className="absolute left-4 right-4 top-4 h-1 rounded bg-gray-200" />

      <div
        className="absolute left-4 right-4 top-4 h-1 rounded bg-emerald-500 transition-transform duration-300 origin-left"
        style={{
          transform: `scaleX(${currentIndex / (STEPS.length - 1) || 0})`,
        }}
      />

      <ol className="relative flex items-center justify-between px-2">
        {STEPS.map((step, idx) => {
          const isReached = idx <= currentIndex;
          const circleClasses = isReached
            ? 'bg-emerald-500 text-white ring-emerald-500'
            : 'bg-gray-200 text-gray-400 ring-gray-300';

          const labelClasses = isReached ? 'text-gray-900' : 'text-gray-500';

          return (
            <li
              key={step.key}
              className="flex flex-col items-center text-center"
            >
              {/* Circle node (put icon inside later) */}
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ring-2 ${circleClasses}`}
              >
                {/* TODO: replace with your icons */}
                <span className="text-xs font-semibold leading-none">
                  {idx + 1}
                </span>
              </div>
              <span className={`mt-1 text-xs ${labelClasses}`}>
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** Maps vendor + order statuses to the 3-step UI status bar. */
export function vendorUiStatus(args: {
  status: 'PENDING' | 'ACTIVE' | 'DELIVERED' | 'CANCELED';
}): UiStatus {
  if (args.status === 'DELIVERED') return 'DELIVERED';
  if (args.status === 'ACTIVE') return 'ACTIVE';
  // Everything else (including REJECTED) shows as PENDING in this 3-step bar
  return 'PENDING';
}
