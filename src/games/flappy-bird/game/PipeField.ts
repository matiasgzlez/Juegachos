import {
  GROUND_HEIGHT,
  PIPE_GAP,
  PIPE_MARGIN,
  PIPE_SPACING,
  PIPE_SPEED,
  PIPE_WIDTH,
  VIEW_HEIGHT,
  VIEW_WIDTH,
} from "./constants";
import type { Bird } from "./Bird";

interface Pipe {
  x: number;
  /** Y of the bottom edge of the top pipe (top of the gap). */
  gapTop: number;
  /** Whether the bird has already cleared this pipe (for scoring). */
  passed: boolean;
}

/** Spawns, scrolls, recycles and collision-tests the pipe pairs. */
export class PipeField {
  private pipes: Pipe[] = [];
  /** X the next pipe will spawn at; seeds the initial off-screen gap. */
  private nextSpawnX = VIEW_WIDTH + 120;

  reset(): void {
    this.pipes = [];
    this.nextSpawnX = VIEW_WIDTH + 120;
  }

  get all(): readonly { x: number; gapTop: number }[] {
    return this.pipes;
  }

  /** Advances pipes, spawns new ones, returns how many were newly passed. */
  update(dt: number, birdX: number): number {
    const dx = PIPE_SPEED * dt;
    this.nextSpawnX -= dx;

    while (this.nextSpawnX <= VIEW_WIDTH) {
      this.spawn(this.nextSpawnX);
      this.nextSpawnX += PIPE_SPACING;
    }

    let scored = 0;
    for (const pipe of this.pipes) {
      pipe.x -= dx;
      if (!pipe.passed && pipe.x + PIPE_WIDTH < birdX) {
        pipe.passed = true;
        scored++;
      }
    }

    this.pipes = this.pipes.filter((p) => p.x + PIPE_WIDTH > -20);
    return scored;
  }

  private spawn(x: number): void {
    const playable = VIEW_HEIGHT - GROUND_HEIGHT;
    const minTop = PIPE_MARGIN;
    const maxTop = playable - PIPE_GAP - PIPE_MARGIN;
    const gapTop = minTop + Math.random() * (maxTop - minTop);
    this.pipes.push({ x, gapTop, passed: false });
  }

  /** True if the bird's circle overlaps any pipe rectangle. */
  collides(bird: Bird): boolean {
    for (const pipe of this.pipes) {
      if (pipe.x + PIPE_WIDTH < bird.x - bird.radius) continue;
      if (pipe.x > bird.x + bird.radius) continue;
      if (
        circleHitsRect(bird.x, bird.y, bird.radius, pipe.x, 0, PIPE_WIDTH, pipe.gapTop) ||
        circleHitsRect(
          bird.x,
          bird.y,
          bird.radius,
          pipe.x,
          pipe.gapTop + PIPE_GAP,
          PIPE_WIDTH,
          VIEW_HEIGHT - (pipe.gapTop + PIPE_GAP),
        )
      ) {
        return true;
      }
    }
    return false;
  }
}

function circleHitsRect(
  cx: number,
  cy: number,
  r: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number,
): boolean {
  const nearestX = Math.max(rx, Math.min(cx, rx + rw));
  const nearestY = Math.max(ry, Math.min(cy, ry + rh));
  const dx = cx - nearestX;
  const dy = cy - nearestY;
  return dx * dx + dy * dy < r * r;
}
