import { LeaderboardPanel } from "../../../shared/LeaderboardPanel";
import { formatClock } from "../../../shared/scoring-core";

export class Hud {
  private readonly timeEl: HTMLDivElement;
  private readonly crashEl: HTMLDivElement;
  private readonly levelEl: HTMLDivElement;
  private readonly overlayEl: HTMLDivElement;
  private readonly titleEl: HTMLDivElement;
  private readonly subtitleEl: HTMLDivElement;
  private readonly scoreLineEl: HTMLDivElement;
  private readonly bestLineEl: HTMLDivElement;
  private readonly hintEl: HTMLDivElement;
  private readonly countdownEl: HTMLDivElement;
  private readonly bannerEl: HTMLDivElement;
  private readonly leaderboard = new LeaderboardPanel();

  constructor(container: HTMLElement) {
    const hud = document.createElement("div");
    hud.className = "hud";

    this.timeEl = document.createElement("div");
    this.timeEl.className = "hud__time";
    this.timeEl.textContent = "0:00.00";

    this.crashEl = document.createElement("div");
    this.crashEl.className = "hud__crash";
    this.crashEl.textContent = "CHOQUES: 0";

    this.levelEl = document.createElement("div");
    this.levelEl.className = "hud__level";
    this.levelEl.textContent = "NIVEL 1";

    hud.append(this.levelEl, this.timeEl, this.crashEl);

    this.overlayEl = document.createElement("div");
    this.overlayEl.className = "overlay";

    this.titleEl = document.createElement("div");
    this.titleEl.className = "overlay__title";

    this.subtitleEl = document.createElement("div");
    this.subtitleEl.className = "overlay__subtitle";

    this.scoreLineEl = document.createElement("div");
    this.scoreLineEl.className = "overlay__score";

    this.bestLineEl = document.createElement("div");
    this.bestLineEl.className = "overlay__best";

    this.hintEl = document.createElement("div");
    this.hintEl.className = "overlay__hint";

    this.overlayEl.append(this.titleEl, this.subtitleEl, this.scoreLineEl, this.bestLineEl, this.hintEl);
    this.leaderboard.mount(this.overlayEl);
    this.leaderboard.clear();

    this.countdownEl = document.createElement("div");
    this.countdownEl.className = "countdown";

    this.bannerEl = document.createElement("div");
    this.bannerEl.className = "banner";

    container.append(hud, this.overlayEl, this.countdownEl, this.bannerEl);
  }

  showCountdown(text: string | null): void {
    if (text === null) {
      this.countdownEl.classList.remove("is-shown");
      this.countdownEl.textContent = "";
      return;
    }
    if (this.countdownEl.textContent === text) return;
    this.countdownEl.textContent = text;
    this.countdownEl.classList.remove("is-shown");
    void this.countdownEl.offsetWidth;
    this.countdownEl.classList.add("is-shown");
  }

  showBanner(text: string, color = "#ff5555"): void {
    this.bannerEl.textContent = text;
    this.bannerEl.style.color = color;
    this.bannerEl.classList.remove("is-shown");
    void this.bannerEl.offsetWidth;
    this.bannerEl.classList.add("is-shown");
  }

  setTimer(seconds: number): void {
    this.timeEl.textContent = formatClock(Math.round(seconds * 100));
  }

  setCrashes(n: number): void {
    this.crashEl.textContent = `CHOQUES: ${n}`;
  }

  setLevel(index: number, count: number): void {
    this.levelEl.textContent = count > 1 ? `NIVEL ${index}/${count}` : `NIVEL ${index}`;
  }

  showHud(visible: boolean): void {
    const v = visible ? "visible" : "hidden";
    this.timeEl.style.visibility = v;
    this.crashEl.style.visibility = v;
    this.levelEl.style.visibility = v;
  }

  showStart(best: string | null): void {
    this.titleEl.textContent = "CIRCUIT BREAKER";
    this.subtitleEl.textContent =
      "lleva la senal desde el pad de origen hasta el conector destino sin tocar las paredes: si chocas, volves al inicio";
    this.scoreLineEl.textContent = best ? `MEJOR: ${best}` : "";
    this.scoreLineEl.style.display = best ? "block" : "none";
    this.bestLineEl.textContent = "";
    this.bestLineEl.style.display = "none";
    this.hintEl.textContent = "ENTER o toca para empezar - avanza sola, gira con flechas / WASD";
    this.leaderboard.clear();
    this.overlayEl.classList.remove("hidden");
  }

  showWin(seconds: number, crashes: number, best: string, isNewBest: boolean): void {
    this.titleEl.textContent = isNewBest ? "NUEVO RECORD!" : "CONECTADO!";
    this.subtitleEl.textContent = "presiona ENTER o toca para reintentar";
    this.scoreLineEl.textContent = `TIEMPO: ${formatClock(Math.round(seconds * 100))} - ${crashes} choques`;
    this.scoreLineEl.style.display = "block";
    this.bestLineEl.textContent = isNewBest ? "NUEVO MEJOR!" : `MEJOR: ${best}`;
    this.bestLineEl.style.display = "block";
    this.hintEl.textContent = "";
    this.overlayEl.classList.remove("hidden");
  }

  showRanking(gameId: string, score: number): void {
    void this.leaderboard.render(gameId, { score });
  }

  hide(): void {
    this.overlayEl.classList.add("hidden");
  }
}
