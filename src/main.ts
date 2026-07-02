import "./style.css";
import { games, type GameEntry } from "./games";
import { LeaderboardPanel } from "./shared/LeaderboardPanel";
import { getScoring } from "./shared/scoring";
import { isLeaderboardEnabled } from "./shared/supabase";

const app = document.querySelector<HTMLDivElement>("#app")!;

const header = document.createElement("header");
header.className = "menu__header";
header.innerHTML = `
  <h1 class="menu__title">MiniGames</h1>
  <p class="menu__subtitle">Elegí un juego para empezar</p>
`;

// Salas multijugador: solo si hay credenciales (misma condicion que el ranking).
if (isLeaderboardEnabled()) {
  const roomsLink = document.createElement("a");
  roomsLink.className = "menu__rooms";
  roomsLink.href = "/rooms/";
  roomsLink.textContent = "Jugar con amigos";
  header.append(roomsLink);
}

const grid = document.createElement("div");
grid.className = "menu__grid";

const rankingsOn = isLeaderboardEnabled();

games.forEach((game, i) => {
  const card = document.createElement("a");
  card.className = "card";
  card.href = game.path;
  card.style.setProperty("--i", String(i));
  if (game.accent) card.style.setProperty("--accent", game.accent);
  card.innerHTML = `
    <span class="card__index">${String(i + 1).padStart(2, "0")}</span>
    <div class="card__info">
      <h2 class="card__title">${game.title}</h2>
      <p class="card__description">${game.description}</p>
      <div class="card__actions">
        <span class="card__cta">Jugar<span class="card__arrow">&rarr;</span></span>
      </div>
    </div>
  `;

  if (rankingsOn) {
    const rankBtn = document.createElement("button");
    rankBtn.className = "card__ranking";
    rankBtn.type = "button";
    rankBtn.textContent = "Ranking";
    rankBtn.addEventListener("click", (e) => {
      // El card es un <a>; evitar que el clic navegue al juego.
      e.preventDefault();
      e.stopPropagation();
      openRankingModal(game);
    });
    card.querySelector(".card__actions")!.append(rankBtn);
  }

  grid.append(card);
});

const footer = document.createElement("footer");
footer.className = "menu__footer";
footer.textContent = `${games.length} ${games.length === 1 ? "juego" : "juegos"} disponibles`;

app.append(header, grid, footer);

// ---------- Ranking modal (solo lectura) ----------

const modalPanel = new LeaderboardPanel();
let modalEl: HTMLDivElement | null = null;

function buildModal(): HTMLDivElement {
  const overlay = document.createElement("div");
  overlay.className = "rank-modal";

  const box = document.createElement("div");
  box.className = "rank-modal__box";

  const head = document.createElement("div");
  head.className = "rank-modal__head";

  const titleEl = document.createElement("h3");
  titleEl.className = "rank-modal__title";

  const closeBtn = document.createElement("button");
  closeBtn.className = "rank-modal__close";
  closeBtn.type = "button";
  closeBtn.setAttribute("aria-label", "Cerrar");
  closeBtn.textContent = "×";
  closeBtn.addEventListener("click", closeRankingModal);

  head.append(titleEl, closeBtn);

  const variantBar = document.createElement("div");
  variantBar.className = "rank-modal__variants";

  box.append(head, variantBar);
  modalPanel.mount(box);
  overlay.append(box);

  // Cerrar al hacer clic fuera de la caja.
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeRankingModal();
  });

  document.body.append(overlay);
  return overlay;
}

function openRankingModal(game: GameEntry): void {
  if (!modalEl) modalEl = buildModal();

  const titleEl = modalEl.querySelector<HTMLElement>(".rank-modal__title")!;
  const variantBar = modalEl.querySelector<HTMLElement>(".rank-modal__variants")!;
  titleEl.textContent = game.title;

  const scoring = getScoring(game.id);
  variantBar.innerHTML = "";

  if (scoring.variants && scoring.variants.length > 0) {
    variantBar.style.display = "flex";
    scoring.variants.forEach((variant, idx) => {
      const btn = document.createElement("button");
      btn.className = "rank-modal__variant" + (idx === 0 ? " is-active" : "");
      btn.type = "button";
      btn.textContent = scoring.variantLabel ? scoring.variantLabel(variant) : variant;
      btn.addEventListener("click", () => {
        variantBar.querySelectorAll(".rank-modal__variant").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        void modalPanel.render(game.id, { variant });
      });
      variantBar.append(btn);
    });
    void modalPanel.render(game.id, { variant: scoring.variants[0] });
  } else {
    variantBar.style.display = "none";
    void modalPanel.render(game.id, {});
  }

  modalEl.classList.add("is-open");
  document.addEventListener("keydown", onModalKeydown);
}

function closeRankingModal(): void {
  if (!modalEl) return;
  modalEl.classList.remove("is-open");
  document.removeEventListener("keydown", onModalKeydown);
}

function onModalKeydown(e: KeyboardEvent): void {
  if (e.key === "Escape") closeRankingModal();
}
