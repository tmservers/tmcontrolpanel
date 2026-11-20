import type { Node } from "maniatsx";

export interface Vector2 {
  x: number;
  y: number;
}

// What every page component receives from Manialink.render()
export interface ManialinkPageProps {
  id: string;
  position: Vector2;
  size: Vector2;
  title: string;
  hideWhileDriving: boolean;
  data: unknown;
}

export type ManialinkComponent = (props: ManialinkPageProps) => Node;
