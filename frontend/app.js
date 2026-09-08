const form = document.getElementById("wish-form");
const textInput = document.getElementById("wish-text");
const authorInput = document.getElementById("wish-author");
const formError = document.getElementById("form-error");
const wishesEl = document.getElementById("wishes");
const emptyState = document.getElementById("empty-state");
const wishCountEl = document.getElementById("wish-count");
const randomBtn = document.getElementById("random-btn");

const TILTS = [-2, -1, 0, 1, 2];

function tiltFor(id) {
  return TILTS[id % TILTS.length];
}

function formatDate(iso) {
  const date = new Date(iso);
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function wishCard(wish) {
  const card = document.createElement("article");
  card.className = "wish-card";
  card.dataset.id = wish.id;
  card.style.setProperty("--tilt", `${tiltFor(wish.id)}deg`);

  const text = document.createElement("p");
  text.className = "wish-text";
  text.textContent = `"${wish.text}"`;

  const meta = document.createElement("div");
  meta.className = "wish-meta";

  const author = document.createElement("span");
  author.className = "wish-author";
  author.textContent = wish.author || "Anónimo";

  const date = document.createElement("span");
  date.textContent = formatDate(wish.created_at);

  meta.append(author, date);
  card.append(text, meta);
  return card;
}

function renderWishes(wishes) {
  wishesEl.innerHTML = "";
  wishCountEl.textContent = wishes.length
    ? `${wishes.length} ${wishes.length === 1 ? "deseo" : "deseos"}`
    : "";
  emptyState.hidden = wishes.length > 0;
  wishes.forEach((wish) => wishesEl.appendChild(wishCard(wish)));
}

async function loadWishes() {
  try {
    const res = await fetch("/api/wishes");
    if (!res.ok) throw new Error("No se pudieron cargar los deseos");
    const wishes = await res.json();
    renderWishes(wishes);
  } catch (err) {
    emptyState.hidden = false;
    emptyState.textContent = "No se pudieron cargar los deseos. Intenta de nuevo.";
  }
}

function setFormError(message) {
  if (message) {
    formError.textContent = message;
    formError.hidden = false;
  } else {
    formError.textContent = "";
    formError.hidden = true;
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = textInput.value.trim();
  const author = authorInput.value.trim();

  if (!text) {
    setFormError("Escribe un deseo antes de soltarlo.");
    textInput.focus();
    return;
  }

  setFormError(null);
  const submitBtn = form.querySelector("button[type=submit]");
  submitBtn.disabled = true;

  try {
    const res = await fetch("/api/wishes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, author }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "No se pudo guardar el deseo.");
    }

    textInput.value = "";
    authorInput.value = "";
    await loadWishes();
  } catch (err) {
    setFormError(err.message);
  } finally {
    submitBtn.disabled = false;
  }
});

randomBtn.addEventListener("click", async () => {
  randomBtn.disabled = true;
  try {
    const res = await fetch("/api/wishes/random");
    if (!res.ok) {
      throw new Error("Todavía no hay deseos en el tablero.");
    }
    const wish = await res.json();

    document
      .querySelectorAll(".wish-card.spotlight")
      .forEach((el) => el.classList.remove("spotlight"));

    const card = wishesEl.querySelector(`[data-id="${wish.id}"]`);
    if (card) {
      card.classList.add("spotlight");
      card.scrollIntoView({ behavior: "smooth", block: "center" });
      card.addEventListener(
        "animationend",
        () => card.classList.remove("spotlight"),
        { once: true }
      );
    }
  } catch (err) {
    setFormError(err.message);
  } finally {
    randomBtn.disabled = false;
  }
});

loadWishes();
