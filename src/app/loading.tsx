import { DoorMark } from "@/components/brand/door-mark";

export default function Loading() {
  return (
    <main className="flex w-full flex-1 items-center justify-center px-6 py-24">
      <DoorMark aria-hidden className="h-10 w-auto animate-pulse text-accent" />
    </main>
  );
}
