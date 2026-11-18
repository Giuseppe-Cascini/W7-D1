// Mini-libreria — Settimana VII Giorno I — Versione completa
// class, campi, extends, override, static + form che crea istanze.


// === Classi ===

class Libro {
  letto = false; // campo pubblico con valore di default (ES2022)

  constructor(titolo, autore, anno) {
    // id univoco anche dopo un reload (servirà domani con localStorage).
    // crypto.randomUUID() richiede HTTPS o localhost: apri la pagina con Live Server.
    this.id = crypto.randomUUID();
    this.titolo = titolo;
    this.autore = autore;
    this.anno = anno;
    
  }

  segnaComeLetto() {
    this.letto = !this.letto;
  }

  formato() {
    return "cartaceo";
  }

  // Factory: crea un Libro da una stringa "titolo|autore|anno" (EXTRA, passo 17)
  static daStringa(s) {
    const [titolo, autore, anno] = s.split("|");
    return new Libro(titolo, autore, Number(anno));
  }
}

class LibroDigitale extends Libro {
  constructor(titolo, autore, anno, dimensioneMb) {
    super(titolo, autore, anno); // prima di usare this
    this.dimensioneMb = dimensioneMb;
  }

  // Override: stesso nome del metodo del parent, vince questo
  formato() {
    return `digitale (${this.dimensioneMb} MB)`;
  }
}
const STORAGE_KEY = "libri";
function salvaLibri() {
    localStorage.setItem(STORAGE_KEY,JSON.stringify(libri));
}
function caricaLibri() {
   const dati = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return dati.map(l => {
        let libro;

        if (l.dimensioneMb !== undefined) {
            libro = new LibroDigitale(l.titolo, l.autore, l.anno, l.dimensioneMb);
        } else {
            libro = new Libro(l.titolo, l.autore, l.anno);
        }

        libro.id = l.id;
        libro.letto = l.letto;

        return libro;
    });
}



// === Stato ===

let libri = caricaLibri(); // let: l'EXTRA "Rimuovi" riassegna l'array con filter

// === Funzioni helper ===
function mostraSpinner() {
document.getElementById("spinner").hidden = false;
document.getElementById("errore").hidden = true;

}

function nascondiSpinner() {
document.getElementById("spinner").hidden = true;
}

function mostraErrore(msg) {
document.getElementById(errore).textContent = "msg"
document.getElementById("errore").hidden = false;
}

// === Render ===

// Crea un elemento con una classe e un testo (textContent: niente HTML interpretato)
function crea(tag, classe, testo) {
  const el = document.createElement(tag);
  if (classe) el.className = classe;
  if (testo !== undefined) el.textContent = testo;
  return el;
}

function creaBottone(azione, testo) {
  const b = crea("button", "", testo);
  b.type = "button";
  b.dataset.azione = azione;
  return b;
}

function renderLibri() {
  const righe = libri.map((l) => {
    const li = crea("li", l.letto ? "letto" : "");
    li.dataset.id = l.id; // serve all'event delegation per ritrovare il libro

    const info = crea("div", "info");
    info.append(
      crea("span", "titolo", l.titolo),
      crea("span", "badge-formato", l.formato()),
      crea("div", "meta", `${l.autore} — ${l.anno}`),
    );

    const azioni = crea("div", "azioni");
    azioni.append(
      l.letto ? crea("span", "", "✓ letto") : creaBottone("leggi", l.letto ? "Segna come non letto" : "Segna come letto"),
      creaBottone("rimuovi", "Rimuovi"),
    );

    li.append(info, azioni);
    return li;
  });

  const lista = document.getElementById("lista-libri");
  if (righe.length === 0) {
    lista.replaceChildren(crea("li", "vuota", "Nessun libro in catalogo."));
  } else {
    lista.replaceChildren(...righe);
  }
  document.getElementById("contatore").textContent = libri.length;
}


// === Eventi ===

// Mostra/nasconde il campo "dimensione" in base al formato selezionato
document.getElementById("formato").addEventListener("change", (e) => {
  document.getElementById("campo-dimensione").hidden = e.target.value !== "digitale";
});

// Submit del form: legge tutti i campi con FormData e crea l'istanza giusta
document.getElementById("aggiungi-libro").addEventListener("submit", (e) => {
  e.preventDefault();

  const { titolo, autore, anno, formato, dimensione } =
    Object.fromEntries(new FormData(e.target));

  const nuovo = formato === "digitale"
    ? new LibroDigitale(titolo, autore, Number(anno), Number(dimensione) || 0)
    : new Libro(titolo, autore, Number(anno));

  libri.push(nuovo);
  salvaLibri();
  renderLibri();
  e.target.reset();
  document.getElementById("campo-dimensione").hidden = true;
});

// Event delegation: un solo listener per tutti i bottoni della lista
document.getElementById("lista-libri").addEventListener("click", (e) => {
  const bottone = e.target.closest("[data-azione]");
  if (!bottone) return;

  const id = bottone.closest("li").dataset.id; // stringa (UUID): niente parseInt

  if (bottone.dataset.azione === "leggi") {
    libri.find((l) => l.id === id)?.segnaComeLetto();
  } else if (bottone.dataset.azione === "rimuovi") {
    libri = libri.filter((l) => l.id !== id);
  }

  renderLibri();
  salvaLibri();
});

// Bottone "Svuota tutto"
document.getElementById("svuota-tutto").addEventListener("click", () => {
  libri = [];
  localStorage.removeItem(STORAGE_KEY);
  renderLibri();
});

// Un'altra tab ha modificato localStorage: ricarichiamo la lista (evento storage)
window.addEventListener("storage", (e) => {
  if (e.key !== STORAGE_KEY && e.key !== null) return;
  libri = caricaLibri();
  renderLibri();
});


// === Avvio ===
renderLibri();
console.log(libri);