import type { GameEntry } from "../../games";
import { type GameScoring, formatClock } from "../../shared/scoring-core";

export const meta: GameEntry = {
  id: "circuit-breaker",
  title: "Circuit Breaker",
  description:
    "Lleva la senal por el circuito hasta el conector destino sin tocar las paredes: si chocas, volves al inicio. Inspirado en el Circuit Breaker de GTA Online.",
  path: "/games/circuit-breaker/",
  accent: "#33e39a",
  category: "Precisión",
  order: 320,
};

// El ranking se ordena por tiempo (menor mejor). Cada puntaje codifica el tiempo
// y la cantidad de choques en un solo numero (encodeTimeMoves): el tiempo manda el
// orden y los choques desempatan / se muestran al lado.
const TIME_MOVES_BASE = 100000;
export const scoring: GameScoring = {
  direction: "lower",
  format: (encoded) =>
    `${formatClock(Math.floor(encoded / TIME_MOVES_BASE))} - ${encoded % TIME_MOVES_BASE} choques`,
};
