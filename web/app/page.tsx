import { BejeweledGame } from "@/components/game/BejeweledGame";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-lg flex-1 flex-col px-3 pb-6 pt-4">
      <BejeweledGame />
    </main>
  );
}
