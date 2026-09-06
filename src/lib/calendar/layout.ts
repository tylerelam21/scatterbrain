import type { CalendarEventRow } from "./types";

export interface PositionedEvent {
  event: CalendarEventRow;
  column: number;
  columnCount: number;
}

// Simple greedy column assignment so overlapping timed events sit side by
// side instead of stacking on top of each other. Not a perfect interval
// graph coloring, but good enough for typical day-view density.
export function layoutTimedEvents(events: CalendarEventRow[]): PositionedEvent[] {
  const sorted = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());
  const columnEnds: number[] = [];
  const assigned: { event: CalendarEventRow; column: number }[] = [];

  for (const event of sorted) {
    let placed = false;
    for (let col = 0; col < columnEnds.length; col++) {
      if (columnEnds[col] <= event.start.getTime()) {
        columnEnds[col] = event.end.getTime();
        assigned.push({ event, column: col });
        placed = true;
        break;
      }
    }
    if (!placed) {
      columnEnds.push(event.end.getTime());
      assigned.push({ event, column: columnEnds.length - 1 });
    }
  }

  return assigned.map(({ event, column }) => {
    const overlapping = assigned.filter(
      (other) =>
        other.event.start.getTime() < event.end.getTime() &&
        other.event.end.getTime() > event.start.getTime(),
    );
    const columnCount = Math.max(...overlapping.map((other) => other.column)) + 1;
    return { event, column, columnCount };
  });
}
