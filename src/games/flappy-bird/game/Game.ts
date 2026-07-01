import { GROUND_HEIGHT, MAX_DT, PIPE_SPEED, VIEW_HEIGHT, VIEW_WIDTH } from "./constants";
import { Bird } from "./Bird";
import { PipeField } from "./PipeField";
import { Renderer } from "./Renderer";
import { InputController } from "./InputController";
import { Hud } from "./Hud";

type State = "ready" | "playing" | "dead";

const BEST_KEY = "flappy-bird:best";

/** Orchestrates canvas, state machine and the fixed-view game loop. */
export class Game {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly bird = new Bird();
  private readonly pipes = new PipeField();
  private readonly renderer = new Renderer();
  private readonly hud: Hud;
  private readonly input: InputController;

  private state: State = "ready";
  private score = 0;
  private best = Number(localStorage.getItem(BEST_KEY)) || 0;
  private groundScroll = 0;
  private lastTime = 0;
  /** Delay before flap can restart after dying, avoids an instant retry. */
  private deadFor = 0;

  constructor(container: HTMLElement) {
    this.canvas = document.createElement("canvas");
    this.canvas.className = "game-canvas";
    container.append(this.canvas);
    this.ctx = this.canvas.getContext("2d")!;

    this.hud = new Hud(container);
    this.hud.setBest(this.best);
    this.hud.showScore(false);
    this.hud.showStart();

    this.input = new InputController(this.canvas, () => this.onFlap());

    this.resize();
    window.addEventListener("resize", this.resize);

    this.lastTime = performance.now();
    requestAnimationFrame(this.tick);
  }

  private onFlap(): void {
    switch (this.state) {
      case "ready":
        this.start();
        this.bird.flap();
        break;
      case "playing":
        this.bird.flap();
        break;
      case "dead":
        if (this.deadFor > 0.6) this.reset();
        break;
    }
  }

  private start(): void {
    this.state = "playing";
    this.score = 0;
    this.hud.setScore(0);
    this.hud.showScore(true);
    this.hud.hide();
  }

  private reset(): void {
    this.bird.reset();
    this.pipes.reset();
    this.state = "ready";
    this.hud.showScore(false);
    this.hud.showStart();
  }

  private die(): void {
    this.state = "dead";
    this.deadFor = 0;
    this.hud.showScore(false);
    if (this.score > this.best) {
      this.best = this.score;
      localStorage.setItem(BEST_KEY, String(this.best));
      this.hud.setBest(this.best);
    }
    this.hud.showGameOver(this.score, this.best);
  }

  private tick = (now: number): void => {
    const dt = Math.min((now - this.lastTime) / 1000, MAX_DT);
    this.lastTime = now;

    this.update(dt);
    this.render();

    requestAnimationFrame(this.tick);
  };

  private update(dt: number): void {
    this.renderer.update(dt);

    if (this.state === "playing") {
      this.groundScroll += PIPE_SPEED * dt;
      this.bird.update(dt);
      this.score += this.pipes.update(dt, this.bird.x);
      this.hud.setScore(this.score);

      const floor = VIEW_HEIGHT - GROUND_HEIGHT - this.bird.radius;
      if (this.bird.y >= floor) {
        this.bird.y = floor;
        this.die();
      } else if (this.bird.y - this.bird.radius <= 0 || this.pipes.collides(this.bird)) {
        this.die();
      }
    } else if (this.state === "ready") {
      // Gentle idle bob so the bird reads as alive on the start screen.
      this.bird.y = VIEW_HEIGHT * 0.45 + Math.sin(this.lastTime / 260) * 8;
    } else if (this.state === "dead") {
      this.deadFor += dt;
      // Let the bird finish falling to the ground after a mid-air death.
      const floor = VIEW_HEIGHT - GROUND_HEIGHT - this.bird.radius;
      if (this.bird.y < floor) {
        this.bird.update(dt);
        if (this.bird.y > floor) this.bird.y = floor;
      }
    }
  }

  private render(): void {
    const { ctx } = this;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.save();
    ctx.scale(this.scale, this.scale);
    ctx.translate(this.offsetX, this.offsetY);
    // Clip to the fixed view box so pipes scrolling past the left edge don't
    // linger in the letterbox side bars on wide windows.
    ctx.beginPath();
    ctx.rect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
    ctx.clip();
    this.renderer.draw(ctx, this.bird, this.pipes, this.groundScroll);
    ctx.restore();
  }

  // --- Canvas scaling: fit the fixed VIEW box into the window, letterboxed. ---
  private scale = 1;
  private offsetX = 0;
  private offsetY = 0;

  private resize = (): void => {
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.canvas.width = Math.floor(w * dpr);
    this.canvas.height = Math.floor(h * dpr);
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;

    const fit = Math.min(w / VIEW_WIDTH, h / VIEW_HEIGHT);
    this.scale = fit * dpr;
    this.offsetX = (w / fit - VIEW_WIDTH) / 2;
    this.offsetY = (h / fit - VIEW_HEIGHT) / 2;
  };

  dispose(): void {
    window.removeEventListener("resize", this.resize);
    this.input.dispose();
  }
}
