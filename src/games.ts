export interface GameEntry {
  id: string;
  title: string;
  description: string;
  path: string;
}

export const games: GameEntry[] = [
  {
    id: "neon-cylinder",
    title: "Neon Cylinder Runner",
    description: "Esquiva las porciones que giran alrededor del cilindro neón y sobrevive el mayor tiempo posible.",
    path: "/games/neon-cylinder/",
  },
  {
    id: "flappy-bird",
    title: "Flappy Bird",
    description: "Aletea para mantener al pájaro en el aire y cruza la mayor cantidad de tubos sin chocar.",
    path: "/games/flappy-bird/",
  },
];
