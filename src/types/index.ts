export type Player = {
  id: string;
  name: string;
  wins: number;
  losses: number;
  draws: number;
};

export type Board = {
  squares: (Player["id"] | undefined)[][];
};

export type Message = {
  type: "join" | "play" | "reset" | "info";
};
