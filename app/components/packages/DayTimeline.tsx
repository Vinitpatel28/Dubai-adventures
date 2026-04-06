'use client';

interface DayTimelineProps {
  days: { dayNumber: number; title: string }[];
  activeDay: number;
  onDayClick: (day: number) => void;
}

export default function DayTimeline({ days, activeDay, onDayClick }: DayTimelineProps) {
  return (
    <div className="sticky top-28 space-y-1">
      <p className="text-[0.55rem] uppercase tracking-[0.3em] font-black text-[var(--g300)] mb-4 px-2">Day Plan</p>
      {days.map((day) => {
        const isActive = activeDay === day.dayNumber;
        return (
          <button
            key={day.dayNumber}
            onClick={() => onDayClick(day.dayNumber)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 group ${
              isActive
                ? 'bg-[var(--g300)]/10 border border-[var(--g300)]/30 shadow-[0_0_15px_rgba(212,150,42,0.1)]'
                : 'border border-transparent hover:bg-[var(--bw1)] hover:border-[var(--bw2)]'
            }`}
          >
            {/* Timeline dot */}
            <div className="relative flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full transition-all ${
                isActive ? 'bg-[var(--g300)] shadow-[0_0_8px_rgba(212,150,42,0.5)]' : 'bg-[var(--bw2)] group-hover:bg-[var(--t3)]'
              }`} />
              {day.dayNumber < days.length && (
                <div className={`w-px h-6 mt-1 ${isActive ? 'bg-[var(--g300)]/30' : 'bg-[var(--bw1)]'}`} />
              )}
            </div>
            <div className="min-w-0">
              <p className={`text-[0.55rem] uppercase tracking-widest font-black ${
                isActive ? 'text-[var(--g300)]' : 'text-[var(--t3)]'
              }`}>Day {day.dayNumber}</p>
              <p className={`text-xs font-medium truncate ${
                isActive ? 'text-[var(--t1)]' : 'text-[var(--t2)]'
              }`}>{day.title || 'Untitled'}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
