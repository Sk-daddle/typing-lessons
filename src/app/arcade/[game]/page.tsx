import { notFound } from "next/navigation";
import { GamePlayer } from "@/components/games/game-player";
import { GAMES, GameId } from "@/lib/curriculum";

export default async function GamePage({ params }: { params: Promise<{ game: string }> }) {
  const { game } = await params;
  if (!(game in GAMES)) notFound();
  return <GamePlayer gameId={game as GameId} />;
}
