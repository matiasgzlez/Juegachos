/** Turns keyboard / mouse / touch into a single "flap" callback. */
export class InputController {
  private readonly target: HTMLElement;
  private readonly onFlap: () => void;

  constructor(target: HTMLElement, onFlap: () => void) {
    this.target = target;
    this.onFlap = onFlap;
    window.addEventListener("keydown", this.onKeyDown);
    target.addEventListener("pointerdown", this.onPointerDown);
  }

  dispose(): void {
    window.removeEventListener("keydown", this.onKeyDown);
    this.target.removeEventListener("pointerdown", this.onPointerDown);
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
      e.preventDefault();
      this.onFlap();
    }
  };

  private onPointerDown = (e: PointerEvent): void => {
    e.preventDefault();
    this.onFlap();
  };
}
