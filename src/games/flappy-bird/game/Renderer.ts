import {
  GROUND_HEIGHT,
  PIPE_GAP,
  PIPE_WIDTH,
  VIEW_HEIGHT,
  VIEW_WIDTH,
} from "./constants";
import type { Bird } from "./Bird";
import type { PipeField } from "./PipeField";

interface Cloud {
  x: number;
  y: number;
  scale: number;
  speed: number;
}

/** Draws the whole scene into the 2D canvas context (in view units). */
export class Renderer {
  private readonly clouds: Cloud[] = [];

  constructor() {
    for (let i = 0; i < 5; i++) {
      this.clouds.push({
        x: Math.random() * VIEW_WIDTH,
        y: 40 + Math.random() * (VIEW_HEIGHT * 0.4),
        scale: 0.6 + Math.random() * 0.8,
        speed: 8 + Math.random() * 10,
      });
    }
  }

  update(dt: number): void {
    for (const cloud of this.clouds) {
      cloud.x -= cloud.speed * dt;
      if (cloud.x < -80 * cloud.scale) {
        cloud.x = VIEW_WIDTH + 80 * cloud.scale;
        cloud.y = 40 + Math.random() * (VIEW_HEIGHT * 0.4);
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D, bird: Bird, pipes: PipeField, groundScroll: number): void {
    this.drawSky(ctx);
    for (const cloud of this.clouds) this.drawCloud(ctx, cloud);
    for (const pipe of pipes.all) this.drawPipe(ctx, pipe.x, pipe.gapTop);
    this.drawGround(ctx, groundScroll);
    this.drawBird(ctx, bird);
  }

  private drawSky(ctx: CanvasRenderingContext2D): void {
    const g = ctx.createLinearGradient(0, 0, 0, VIEW_HEIGHT);
    g.addColorStop(0, "#4ec0e6");
    g.addColorStop(1, "#8fe3f0");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  }

  private drawCloud(ctx: CanvasRenderingContext2D, cloud: Cloud): void {
    ctx.save();
    ctx.translate(cloud.x, cloud.y);
    ctx.scale(cloud.scale, cloud.scale);
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.arc(26, 6, 18, 0, Math.PI * 2);
    ctx.arc(-24, 6, 16, 0, Math.PI * 2);
    ctx.arc(4, 14, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private drawPipe(ctx: CanvasRenderingContext2D, x: number, gapTop: number): void {
    const bottomY = gapTop + PIPE_GAP;
    const bodyGrad = ctx.createLinearGradient(x, 0, x + PIPE_WIDTH, 0);
    bodyGrad.addColorStop(0, "#5aa832");
    bodyGrad.addColorStop(0.35, "#8ed14e");
    bodyGrad.addColorStop(0.65, "#74b83e");
    bodyGrad.addColorStop(1, "#3f7d22");

    // Top pipe
    this.pipeSegment(ctx, bodyGrad, x, 0, gapTop, false);
    // Bottom pipe
    this.pipeSegment(ctx, bodyGrad, x, bottomY, VIEW_HEIGHT - GROUND_HEIGHT - bottomY, true);
  }

  private pipeSegment(
    ctx: CanvasRenderingContext2D,
    body: CanvasGradient,
    x: number,
    y: number,
    h: number,
    capOnTop: boolean,
  ): void {
    if (h <= 0) return;
    const lipH = 26;
    const lipOverhang = 5;

    ctx.fillStyle = body;
    ctx.fillRect(x, y, PIPE_WIDTH, h);
    ctx.strokeStyle = "#2f5e18";
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, PIPE_WIDTH, h);

    // Lip at the mouth of the pipe (facing the gap).
    const lipY = capOnTop ? y : y + h - lipH;
    ctx.fillStyle = body;
    ctx.fillRect(x - lipOverhang, lipY, PIPE_WIDTH + lipOverhang * 2, lipH);
    ctx.strokeRect(x - lipOverhang, lipY, PIPE_WIDTH + lipOverhang * 2, lipH);

    // Highlight streak.
    ctx.fillStyle = "rgba(255,255,255,0.28)";
    ctx.fillRect(x + 8, y, 8, h);
  }

  private drawGround(ctx: CanvasRenderingContext2D, scroll: number): void {
    const top = VIEW_HEIGHT - GROUND_HEIGHT;
    ctx.fillStyle = "#ded895";
    ctx.fillRect(0, top, VIEW_WIDTH, GROUND_HEIGHT);
    ctx.fillStyle = "#c9b866";
    ctx.fillRect(0, top, VIEW_WIDTH, 12);

    // Diagonal stripes scrolling with the pipes.
    ctx.fillStyle = "#b7a94f";
    const stripeW = 24;
    const offset = scroll % (stripeW * 2);
    for (let sx = -stripeW * 2 - offset; sx < VIEW_WIDTH + stripeW; sx += stripeW * 2) {
      ctx.beginPath();
      ctx.moveTo(sx, top + 12);
      ctx.lineTo(sx + stripeW, top + 12);
      ctx.lineTo(sx + stripeW - 14, GROUND_HEIGHT + top);
      ctx.lineTo(sx - 14, GROUND_HEIGHT + top);
      ctx.closePath();
      ctx.fill();
    }
  }

  private drawBird(ctx: CanvasRenderingContext2D, bird: Bird): void {
    ctx.save();
    ctx.translate(bird.x, bird.y);
    ctx.rotate(bird.tilt);

    const r = bird.radius;

    // Body
    ctx.fillStyle = "#ffd23f";
    ctx.strokeStyle = "#c98a1e";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 1.15, r, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Belly
    ctx.fillStyle = "#fff0a8";
    ctx.beginPath();
    ctx.ellipse(-2, 5, r * 0.7, r * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wing
    ctx.fillStyle = "#f4a72c";
    ctx.strokeStyle = "#c98a1e";
    ctx.beginPath();
    ctx.ellipse(-3, bird.wingOffset, r * 0.6, r * 0.4, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Eye
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(r * 0.55, -r * 0.4, r * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1b1b1b";
    ctx.beginPath();
    ctx.arc(r * 0.68, -r * 0.4, r * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = "#ff8c1a";
    ctx.strokeStyle = "#d96a0a";
    ctx.beginPath();
    ctx.moveTo(r * 1.0, -r * 0.1);
    ctx.lineTo(r * 1.7, r * 0.1);
    ctx.lineTo(r * 1.0, r * 0.35);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }
}
