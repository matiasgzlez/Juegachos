import {
  BIRD_RADIUS,
  BIRD_X,
  FLAP_VELOCITY,
  GRAVITY,
  MAX_FALL_TILT_SPEED,
  TILT_DOWN,
  TILT_UP,
  VIEW_HEIGHT,
} from "./constants";

/** The player: fixed X, gravity-driven Y, flap gives an instant upward impulse. */
export class Bird {
  y = VIEW_HEIGHT * 0.45;
  velocity = 0;
  /** Wing flap phase, advanced for the idle/animated wing. */
  private wingPhase = 0;

  readonly x = BIRD_X;
  readonly radius = BIRD_RADIUS;

  reset(): void {
    this.y = VIEW_HEIGHT * 0.45;
    this.velocity = 0;
    this.wingPhase = 0;
  }

  flap(): void {
    this.velocity = FLAP_VELOCITY;
  }

  update(dt: number): void {
    this.velocity += GRAVITY * dt;
    this.y += this.velocity * dt;
    this.wingPhase += dt * 14;
  }

  /** Nose-up when rising, nose-down as it falls, clamped for readability. */
  get tilt(): number {
    const t = Math.min(Math.max(this.velocity / MAX_FALL_TILT_SPEED, -1), 1);
    return t < 0 ? TILT_UP * -t : TILT_DOWN * t;
  }

  get wingOffset(): number {
    return Math.sin(this.wingPhase) * 4;
  }
}
