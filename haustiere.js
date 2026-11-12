/* HAUSTIERE
 * Dieses Skript wird nach dem Hauptspiel geladen und nutzt dessen Vorräte.
 * Zeiten werden mit Date.now() gemessen. Es gibt keine Speicherung nach Neuladen.
 * Lieblingsessen ist eine Fantasie-Spielregel, keine Anleitung zur echten Tierhaltung.
 */
const tierArten = [
  { id: 'katze', name: '🐈 Katze', liebling: 4, kraft: 'Gibt Rechentipps.' },
  { id: 'hund', name: '🐕 Hund', liebling: 13, kraft: 'Gibt Rechentipps.' },
  { id: 'kaninchen', name: '🐇 Kaninchen', liebling: 12, kraft: 'Löst alle 15 Minuten eine Aufgabe.' },
  { id: 'schlange', name: '🐍 Schlange', liebling: 4, kraft: 'Bringt alle 10 Minuten Essen.' },
  { id: 'huhn', name: '🐔 Huhn', liebling: 5, kraft: 'Warnt 30 Sekunden vor dem Angriff.' },
  { id: 'wellensittich', name: '🦜 Wellensittich', liebling: 5, kraft: 'Bringt alle 10 Minuten ein normales oder besonderes Item.' },
  { id: 'minion', name: 'Minion', liebling: 11, kraft: 'Repariert alle 15 Minuten eine Baustelle ohne Items. Laborumbau kostet nur 5 Items.' },
  { id: 'elefant', name: '🐘 Elefant', liebling: 11, kraft: 'Verringert Monster-Schaden von 25 auf 15.' }
];
const spezialItems = ['🛢️ Öl', '🌾 Körner', '💍 Ring', '🎨 Farbe', '🎀 Haarspange', '🍉 Melone', '💻 Laptop'];
const spezialVorrat = spezialItems.map(function() { return 0; });
const haustiere = [];
let zweiTierPlaetze = false;
const ERWACHSEN_NACH = 30 * 60 * 1000;
const LEBENSDAUER = 6 * 60 * 60 * 1000;
const HILFE_PAUSE = 15 * 60 * 1000;
const FUND_PAUSE = 10 * 60 * 1000;
const tierZimmer = document.getElementById('haustierZimmer');
const meineTiere = document.getElementById('meineTiere');
const tierAuswahl = document.getElementById('tierAuswahl');
const tierTipp = document.getElementById('tierTipp');
const tierPromenade = document.getElementById('tierPromenade');
let sichtbareTierListe = '';

// Eine kleine Vektorzeichnung: bleibt auch beim Vergrössern scharf.
// Die Figur besteht aus einfachen Formen für Körper, Latzhose und Schutzbrille.
function erstelleTierBild(art) {
  const bild = document.createElement('span');
  bild.className = 'tierBild';
  bild.setAttribute('aria-hidden', 'true');
  if (art.id !== 'minion') {
    bild.textContent = art.name.split(' ')[0];
    return bild;
  }
  bild.className = 'tierBild minionBild';
  bild.innerHTML = `<svg viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg" focusable="false">
    <!-- Haare und Arme -->
    <path d="M35 17Q28 5 22 9 M39 15Q39 2 44 5 M43 17Q51 6 56 11" fill="none" stroke="#2d3036" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M19 54Q9 59 11 72 M61 53Q72 49 69 37" fill="none" stroke="#d7a419" stroke-width="9" stroke-linecap="round"/>
    <path d="M19 53Q11 59 13 70 M61 52Q70 48 67 38" fill="none" stroke="#ffdf38" stroke-width="5" stroke-linecap="round"/>
    <ellipse cx="12" cy="74" rx="7" ry="8" fill="#30333a"/>
    <path d="M64 39Q60 36 62 32L65 27Q67 25 68 30L68 23Q71 20 73 25L73 30Q79 27 78 32L74 39Z" fill="#30333a"/>
    <!-- Runder gelber Körper mit Lichtkante -->
    <rect x="16" y="14" width="48" height="73" rx="23" fill="#efbd22" stroke="#b88517" stroke-width="1.5"/>
    <path d="M39 16Q19 16 19 38V65Q19 79 38 83V16Z" fill="#ffdf3a"/>
    <path d="M23 28Q26 20 34 20" fill="none" stroke="#fff2a1" stroke-width="3" stroke-linecap="round"/>
    <!-- Latzhose, Träger und kleine Tasche -->
    <path d="M17 61 29 69H51L63 61V75Q63 87 50 88H30Q17 87 17 75Z" fill="#2c659b"/>
    <path d="M20 61 29 69 M60 61 51 69" stroke="#174777" stroke-width="6"/>
    <rect x="28" y="63" width="24" height="20" rx="3" fill="#4a90c7"/>
    <path d="M29 65V80H51" fill="none" stroke="#83b7d9" stroke-width="1" stroke-dasharray="2 2"/>
    <path d="M34 70H46V76Q40 82 34 76Z" fill="#285d91" stroke="#163c63" stroke-width="1"/>
    <circle cx="29" cy="67" r="2" fill="#dfba58"/><circle cx="51" cy="67" r="2" fill="#dfba58"/>
    <path d="M30 85V93 M50 85V93" stroke="#285d91" stroke-width="10"/>
    <path d="M32 95H21 M48 95H59" stroke="#252a32" stroke-width="8" stroke-linecap="round"/>
    <!-- Ein grosses Auge hinter einer silbernen Schutzbrille -->
    <path d="M17 36H63" stroke="#30333a" stroke-width="8"/>
    <rect x="19" y="32" width="5" height="8" rx="1" fill="#9aaab5"/>
    <rect x="56" y="32" width="5" height="8" rx="1" fill="#9aaab5"/>
    <circle cx="40" cy="36" r="18" fill="#687783" stroke="#3e4853" stroke-width="1.5"/>
    <circle cx="40" cy="35" r="15.5" fill="#dce5ea"/>
    <circle cx="40" cy="36" r="12.5" fill="#fffdf2" stroke="#8a969e" stroke-width="1.5"/>
    <path d="M29 24Q40 17 51 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
    <g class="minionPupillen">
      <circle cx="40" cy="37" r="6.5" fill="#a66935"/>
      <circle cx="40" cy="37" r="4.5" fill="#69462e"/>
      <circle cx="40" cy="37" r="3" fill="#20232a"/>
      <circle cx="42" cy="34" r="2" fill="white"/>
    </g>
    <!-- Schiefes Grinsen -->
    <path d="M30 56Q42 64 52 53Q49 65 40 64Q33 63 30 56Z" fill="#653728"/>
    <path d="M33 57Q42 61 49 56" fill="none" stroke="#fffbed" stroke-width="3"/>
    <path d="M35 63Q41 59 46 62" fill="#e88b79"/>
  </svg>`;
  return bild;
}

// Der vorhandene Minion bekommt für sechs Sekunden eine kleine Baustelle.
let minionBauTimer;
let minionBauSzene = null;
function zeigeMinionBauarbeit(ziel, text, tier) {
  tier = tier || lebendeTiere().find(function(t) { return t.art.id === 'minion'; });
  if (!tier || !tier.lebt || tier.art.id !== 'minion') return;
  clearTimeout(minionBauTimer);
  if (minionBauSzene) minionBauSzene.remove();
  const szene = document.createElement('span');
  szene.className = 'minionBauSzene';
  szene.setAttribute('role', 'status');
  const figur = document.createElement('span'); figur.className = 'minionBauFigur';
  figur.setAttribute('aria-hidden', 'true');
  figur.appendChild(erstelleTierBild(tier.art));
  for (const [klasse, symbol] of [['minionHammer', '🔨'], ['minionSaege', '🪚'], ['minionPinsel', '🖌️']]) {
    const werkzeug = document.createElement('span'); werkzeug.className = 'minionWerkzeug ' + klasse;
    werkzeug.textContent = symbol; figur.appendChild(werkzeug);
  }
  const beschreibung = document.createElement('span'); beschreibung.className = 'minionBauText';
  beschreibung.textContent = text + ' Hämmern, sägen, malen …';
  const farbe = document.createElement('span'); farbe.className = 'minionFarbstrich'; farbe.setAttribute('aria-hidden', 'true');
  beschreibung.appendChild(farbe); szene.appendChild(figur); szene.appendChild(beschreibung);
  ziel.after(szene);
  minionBauSzene = szene;
  tier.bauBis = Date.now() + 6500;
  zeigeTiereAufKonsole();
  szene.scrollIntoView({ block: 'nearest', behavior: 'auto' });
  minionBauTimer = setTimeout(function() {
    szene.remove();
    if (minionBauSzene === szene) minionBauSzene = null;
    tier.bauBis = 0;
    zeigeTiereAufKonsole();
  }, 6500);
}

// Unsere Tiere sitzen auf der oberen Aussenkante der Konsole, wie auf einem Dach.
// Nur die Tiere fangen Klicks ab. Bei reduzierter Bewegung bleiben sie ruhig.
function zeigeTiereAufKonsole() {
  const tiere = lebendeTiere();
  tierPromenade.hidden = tiere.length === 0;
  document.querySelector('main').classList.toggle('mitHaustieren', tiere.length > 0);
  const liste = tiere.map(function(tier) { return haustiere.indexOf(tier); }).join(',');
  if (liste !== sichtbareTierListe) {
    sichtbareTierListe = liste;
    tierPromenade.replaceChildren();
    for (const tier of tiere) {
      const bereich = document.createElement('div');
      bereich.className = 'tierBereich';
      const figur = document.createElement('span');
      figur.setAttribute('role', 'button');
      figur.tabIndex = 0;
      figur.setAttribute('aria-haspopup', 'dialog');
      figur.title = tierName(tier) + ' – Rechtsklick: Streicheln oder Spielen';
      const blick = document.createElement('span');
      blick.className = 'tierBlick';
      const bild = erstelleTierBild(tier.art);
      blick.appendChild(bild);
      figur.appendChild(blick);
      const reaktion = document.createElement('span');
      reaktion.className = 'tierReaktion';
      reaktion.hidden = true;
      reaktion.setAttribute('aria-hidden', 'true');
      figur.appendChild(reaktion);
      figur.addEventListener('contextmenu', function(event) {
        event.preventDefault();
        oeffneTierMenue(tier, event.clientX, event.clientY);
      });
      // Ein normaler Klick funktioniert ebenfalls, zum Beispiel auf einem Tablet.
      figur.addEventListener('click', function() {
        const ort = figur.getBoundingClientRect();
        oeffneTierMenue(tier, ort.left, ort.bottom);
      });
      figur.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' || event.key === ' ' || (event.shiftKey && event.key === 'F10')) {
          event.preventDefault();
          const ort = figur.getBoundingClientRect();
          oeffneTierMenue(tier, ort.left, ort.bottom);
        }
      });
      bereich.appendChild(figur);
      tierPromenade.appendChild(bereich);
      tier.figur = figur;
      tier.blick = blick;
      tier.reaktion = reaktion;
    }
  }
  tiere.forEach(function(tier, index) {
    const aktionen = ['sitzen', 'laufen', 'liegen'];
    const aktion = aktionen[(Math.floor((Date.now() - tier.geburt) / 12000) + index) % 3];
    const interaktion = Date.now() < (tier.interaktionBis || 0) ? tier.interaktion : '';
    tier.figur.title = tierName(tier) + ' – Rechtsklick: Streicheln oder Spielen';
    tier.figur.hidden = Date.now() < (tier.bauBis || 0);
    const antwortet = Date.now() < (tier.rufBis || 0);
    // Beim Namensruf pausiert der Spaziergang, bis die Sprechblase verschwindet.
    const bewegung = antwortet ? 'stehen' : interaktion ? 'sitzen ' + interaktion : aktion;
    tier.figur.className = 'tierBegleiter ' + bewegung + (tier.erwachsen ? ' erwachsen' : '');
    tier.reaktion.hidden = !interaktion && !antwortet;
    tier.reaktion.classList.toggle('tierRuf', antwortet);
    tier.reaktion.textContent = antwortet ? tier.rufText : interaktion === 'streicheln' ? '💕' : '🎾';
    tier.figur.setAttribute('aria-label', tierName(tier) + ' · ' + (tier.erwachsen ? 'erwachsen' : 'jung') + ' · ' + bewegung);
  });
}

// Die Blickrichtung liegt auf einer eigenen Ebene, damit die Laufanimation weitergeht.
function folgeMitBlick(x, y) {
  for (const tier of lebendeTiere()) {
    if (!tier.figur || !tier.blick) continue;
    const ort = tier.figur.getBoundingClientRect();
    const dx = x - (ort.left + ort.width / 2);
    const dy = y - (ort.top + ort.height / 2);
    const neigung = Math.max(-12, Math.min(12, dy / 15));
    const richtung = tier.art.id === 'minion' ? 1 : dx > 0 ? -1 : 1;
    tier.blick.style.transform = 'scaleX(' + richtung + ') rotate(' + (neigung * richtung) + 'deg)';
    const pupillen = tier.blick.querySelector('.minionPupillen');
    if (pupillen) pupillen.setAttribute('transform', 'translate(' + Math.max(-2, Math.min(2, dx / 70)) + ' ' + Math.max(-2, Math.min(2, dy / 70)) + ')');
  }
}
document.addEventListener('pointermove', function(event) { folgeMitBlick(event.clientX, event.clientY); });

const tierMenue = document.createElement('div');
tierMenue.id = 'tierMenue';
tierMenue.hidden = true;
tierMenue.setAttribute('role', 'dialog');
tierMenue.setAttribute('aria-label', 'Mit deinem Haustier interagieren');
const tierMenueTitel = document.createElement('p');
tierMenue.appendChild(tierMenueTitel);
let menueTier = null;
const streichelnKnopf = document.createElement('button');
streichelnKnopf.type = 'button';
streichelnKnopf.textContent = '💕 Streicheln';
streichelnKnopf.addEventListener('click', function() { interagiereMitTier('streicheln'); });
tierMenue.appendChild(streichelnKnopf);
const spielenKnopf = document.createElement('button');
spielenKnopf.type = 'button';
spielenKnopf.textContent = '🎾 Spielen';
spielenKnopf.addEventListener('click', function() { interagiereMitTier('spielen'); });
tierMenue.appendChild(spielenKnopf);
const tierMenueZu = document.createElement('button');
tierMenueZu.type = 'button';
tierMenueZu.textContent = 'Schliessen';
tierMenueZu.addEventListener('click', function() { schliesseTierMenue(true); });
tierMenue.appendChild(tierMenueZu);
document.body.appendChild(tierMenue);

function oeffneTierMenue(tier, x, y) {
  aktualisiereTiere();
  if (!tier.lebt || !haustiere.includes(tier)) return;
  menueTier = tier;
  tierMenueTitel.textContent = tierName(tier);
  tierMenue.hidden = false;
  const rand = 8;
  tierMenue.style.left = Math.max(rand, Math.min(x, window.innerWidth - tierMenue.offsetWidth - rand)) + 'px';
  tierMenue.style.top = Math.max(rand, Math.min(y, window.innerHeight - tierMenue.offsetHeight - rand)) + 'px';
  streichelnKnopf.focus();
}

function schliesseTierMenue(fokusZurueck = false) {
  const tier = menueTier;
  tierMenue.hidden = true;
  menueTier = null;
  if (fokusZurueck && tier && tier.lebt && tier.figur) tier.figur.focus();
}

function interagiereMitTier(aktion) {
  aktualisiereTiere();
  if (!menueTier || !menueTier.lebt || !['streicheln', 'spielen'].includes(aktion)) { schliesseTierMenue(); return; }
  const tier = menueTier;
  tier.interaktion = aktion;
  tier.interaktionBis = Date.now() + 5000;
  meldeTier(tierName(tier) + (aktion === 'streicheln' ? ' freut sich über deine Streicheleinheiten! 💕' : ' spielt fröhlich mit dir! 🎾'));
  zeigeTiereAufKonsole();
  schliesseTierMenue(true);
}

document.addEventListener('pointerdown', function(event) {
  if (!tierMenue.hidden && !tierMenue.contains(event.target)) schliesseTierMenue();
});
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape' && !tierMenue.hidden) { event.preventDefault(); schliesseTierMenue(true); }
});
window.addEventListener('resize', function() { schliesseTierMenue(); });
window.addEventListener('scroll', function() { schliesseTierMenue(); }, true);

// Wir merken uns die letzten Buchstaben und vergleichen sie mit den Tiernamen.
const tierRufe = {
  hund: 'Wuff!', katze: 'Miau!', elefant: 'Trööt!', schlange: 'Zisch!',
  huhn: 'Gacker!', wellensittich: 'Peiep!', minion: 'Was?', kaninchen: 'Schnupper!'
};
let getippterTiername = '';
let letzteRufTaste = 0;
function pruefeTierRuf(event) {
  // Beim Rechnen und Umbenennen gehören die Tasten nur dem Eingabefeld.
  const ziel = event.target;
  if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing ||
      (ziel && (ziel.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(ziel.tagName)))) {
    getippterTiername = '';
    return;
  }
  if (event.repeat) return;
  if (Date.now() - letzteRufTaste > 5000) getippterTiername = '';
  letzteRufTaste = Date.now();
  if (event.key === 'Backspace') {
    getippterTiername = Array.from(getippterTiername).slice(0, -1).join('');
    return;
  }
  if (Array.from(event.key).length !== 1) {
    if (event.key !== 'Shift') getippterTiername = '';
    return;
  }
  getippterTiername = Array.from(getippterTiername + event.key.toLocaleLowerCase('de-CH')).slice(-24).join('');
  aktualisiereTiere();
  const gerufeneTiere = lebendeTiere().filter(function(tier) {
    return tier.name && getippterTiername.endsWith(tier.name.toLocaleLowerCase('de-CH'));
  });
  for (const tier of gerufeneTiere) {
    tier.rufText = tierRufe[tier.art.id];
    tier.rufBis = Date.now() + 4000;
  }
  if (gerufeneTiere.length) {
    meldeTier(gerufeneTiere.map(function(tier) { return tierName(tier) + ': ' + tier.rufText; }).join(' '));
    zeigeTiereAufKonsole();
    getippterTiername = '';
  }
}
document.addEventListener('keydown', pruefeTierRuf);

function meldeTier(text) {
  document.getElementById('tierMeldung').textContent = text;
  document.getElementById('tierZimmerMeldung').textContent = text;
}

function tierName(tier) {
  return tier.name || tier.art.name;
}

function benenneTier(tier, name) {
  if (!haustiere.includes(tier)) return;
  // Als normalen Text speichern, niemals als HTML ausführen.
  tier.name = Array.from(name.trim()).slice(0, 24).join('');
  meldeTier('Dein Haustier heisst jetzt ' + tierName(tier) + '.');
  zeigeTiere();
  zeigeTiereAufKonsole();
  if (menueTier === tier) tierMenueTitel.textContent = tierName(tier);
  if (tier.namensFeld) tier.namensFeld.focus();
}

function lebendeTiere() { return haustiere.filter(function(tier) { return tier.lebt; }); }
// Ohne Nebenwirkungen prüfen, damit die Kostenanzeige keine anderen Aktionen startet.
function minionHilftBeimUmbau() {
  const jetzt = Date.now();
  return haustiere.some(function(tier) {
    return tier.art.id === 'minion' && tier.lebt && jetzt - tier.geburt < LEBENSDAUER &&
      tier.saettigung - (jetzt - tier.zuletzt) / 60000 * 2 > 0;
  });
}

function hatHaustier(art) {
  aktualisiereTiere();
  return lebendeTiere().some(function(tier) { return tier.art.id === art; });
}

function adoptiereTier(art) {
  aktualisiereTiere();
  if (!tierArten.includes(art) || lebendeTiere().length >= (zweiTierPlaetze ? 2 : 1)) return;
  const jetzt = Date.now();
  haustiere.push({ art: art, name: '', geburt: jetzt, zuletzt: jetzt, saettigung: 100, lebt: true,
    erwachsen: false, hilfeAb: jetzt, fundAb: jetzt + FUND_PAUSE });
  meldeTier(art.name + ' zieht bei dir ein!');
  zeigeTiere();
  zeigeTiereAufKonsole();
  zeigeTierTipp();
  zeigeLaborUmbau();
}

function aktualisiereTiere() {
  const jetzt = Date.now();
  for (const tier of haustiere) {
    if (!tier.lebt) continue;
    tier.saettigung = Math.max(0, tier.saettigung - (jetzt - tier.zuletzt) / 60000 * 2);
    tier.zuletzt = jetzt;
    const alter = jetzt - tier.geburt;
    if (alter >= LEBENSDAUER || tier.saettigung <= 0) {
      tier.lebt = false;
      if (menueTier === tier) schliesseTierMenue();
      meldeTier(tierName(tier) + (alter >= LEBENSDAUER ? ' ist mit 6 Stunden gestorben.' : ' ist gestorben, weil es kein Futter mehr hatte.'));
      continue;
    }
    if (!tier.erwachsen && alter >= ERWACHSEN_NACH) {
      tier.erwachsen = true;
      zweiTierPlaetze = true;
      meldeTier(tierName(tier) + ' ist erwachsen! Du hast jetzt zwei Haustierplätze.');
    }
    if (jetzt >= tier.fundAb) {
      tier.fundAb = jetzt + FUND_PAUSE;
      if (tier.art.id === 'schlange') meldeTier('🐍 Deine Schlange bringt ' + gewinneEssen() + '!');
      if (tier.art.id === 'wellensittich') {
        if (Math.random() < 0.5) {
          const index = zufallszahl(0, items.length - 1);
          vorrat[index] = vorrat[index] + 1;
          meldeTier('🦜 Gefunden: ' + items[index] + '!');
          zeigeWerkstatt();
        } else {
          const index = zufallszahl(0, spezialItems.length - 1);
          spezialVorrat[index] = spezialVorrat[index] + 1;
          meldeTier('🦜 Besonderer Fund: ' + spezialItems[index] + ' – zählt doppelt!');
        }
        zeigeSpezialTeile();
      }
    }
  }
}

function fuettereTier(tier, index) {
  aktualisiereTiere();
  if (!haustiere.includes(tier) || !tier.lebt || !lebensmittel[index] || essensVorrat[index] < 1 || tier.saettigung >= 100) return;
  essensVorrat[index] = essensVorrat[index] - 1;
  const lieblingsessen = index === tier.art.liebling;
  tier.saettigung = Math.min(100, tier.saettigung + futterSaettigung(tier, index));
  meldeTier(tierName(tier) + ' frisst ' + lebensmittel[index].name + (lieblingsessen ? ' – sein Lieblingsessen! Die Hungerleiste ist voll.' : '.'));
  zeigeEssensVorrat();
  zeigeTiere();
}

function nutzeTierHilfe(tier) {
  aktualisiereTiere();
  if (!haustiere.includes(tier) || !tier.lebt || Date.now() < tier.hilfeAb) return;
  if (tier.art.id === 'kaninchen') {
    if (zusatz.open && !bonusSpiel.hidden && !bonusAntwort.disabled) {
      tier.hilfeAb = Date.now() + HILFE_PAUSE;
      bonusAntwort.value = bonusZaehler + '/' + bonusNenner;
      bonusFormular.requestSubmit();
    } else if (rundeAktiv && nummer > 0 && !antwort.disabled && !formular.hidden) {
      tier.hilfeAb = Date.now() + HILFE_PAUSE;
      antwort.value = loesung;
      formular.requestSubmit();
    } else {
      meldeTier('🐇 Öffne zuerst eine ungelöste Aufgabe.');
      return;
    }
    meldeTier('🐇 Dein Kaninchen hat die Aufgabe gelöst. In 15 Minuten hilft es wieder.');
  } else if (tier.art.id === 'minion') {
    if (!baustellen.length) { meldeTier('🟡 Dein Labor braucht gerade keine Reparatur.'); return; }
    tier.hilfeAb = Date.now() + HILFE_PAUSE;
    const baustelle = baustellen.shift();
    laborGesundheit = Math.min(100, laborGesundheit + baustelle.reparatur);
    zeigeWerkstatt();
    meldeTier('🟡 Dein Minion hat eine Baustelle repariert, ohne Items zu verbrauchen!');
    if (tierZimmer.open) tierZimmer.close();
    const laborFeld = document.getElementById('laborFeld');
    laborFeld.open = true;
    const anderesFenster = document.querySelector('dialog[open]');
    zeigeMinionBauarbeit(anderesFenster ? anderesFenster.lastElementChild || laborFeld : laborFeld, 'Dein Minion flickt das Labor!', tier);
  }
  zeigeTiere();
}

function zeigeTierTipp() {
  tierTipp.hidden = !lebendeTiere().some(function(tier) { return ['katze', 'hund'].includes(tier.art.id); });
}
function gibTierTipp() {
  if (!hatHaustier('katze') && !hatHaustier('hund')) return;
  if (antwort.disabled || nummer === 0) { meldeTier('🐾 Starte zuerst eine neue Aufgabe.'); return; }
  const text = aufgabe.textContent;
  let tipp = 'Zerlege die Zahlen in Zehner und Einer und rechne in kleinen Schritten.';
  if (text.includes('(')) tipp = 'Rechne zuerst die Klammer aus. Danach kommen Mal und Geteilt, zuletzt Plus und Minus.';
  else if (text.includes('×')) tipp = 'Rechne zuerst Mal. Zerlege einen Faktor: 7 × 12 = 7 × 10 + 7 × 2.';
  else if (text.includes('÷')) tipp = 'Rechne zuerst Geteilt. Überlege: Welche Zahl mal dem Teiler ergibt die grosse Zahl?';
  else if (text.includes('−')) tipp = 'Ziehe zuerst die Zehner und dann die Einer ab. Bei mehreren Plus/Minus-Zeichen rechnest du von links nach rechts.';
  meldeTier('🐾 Tipp: ' + tipp);
  meldung.textContent = '🐾 ' + tipp;
}
tierTipp.addEventListener('click', gibTierTipp);

function warneMitHuhn() {
  if (!hatHaustier('huhn')) return;
  const sprueche = ['Bok bok!', 'Iiii!', 'Scharr scharr!'];
  meldeTier('🐔 ' + sprueche[zufallszahl(0, 2)] + ' In 30 Sekunden kommen die Monster!');
}

// Selbst gezeichnete Pixel-Keulen: zehn Symbole stehen für 100 Sättigung.
// Die farbige Ebene wird bei angebrochenen Keulen teilweise abgeschnitten.
function erstelleTierHunger(tier) {
  const keule = `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" aria-hidden="true">
    <path d="M8 1H13V2H15V8H14V10H11V11H9V12H7V14H5V16H1V14H0V11H2V10H4V8H5V5H6V3H8Z" fill="#211a16"/>
    <path d="M5 10H7V12H5V14H3V15H2V13H1V12H3V11H5Z" fill="var(--knochen)"/>
    <path d="M9 2H13V3H14V8H13V9H10V10H7V8H6V5H7V4H9Z" fill="var(--fleisch)"/>
    <path d="M9 3H12V4H10V5H8V7H7V5H8V4H9Z" fill="var(--licht)"/>
  </svg>`;
  const balken = document.createElement('div');
  balken.className = 'tierHungerLeiste';
  balken.setAttribute('role', 'meter');
  balken.setAttribute('aria-label', 'Sättigung von ' + tierName(tier));
  balken.setAttribute('aria-valuemin', '0');
  balken.setAttribute('aria-valuemax', '100');
  tier.hungerFuellungen = [];
  for (let i = 0; i < 10; i++) {
    const symbol = document.createElement('span');
    symbol.className = 'tierKeule';
    symbol.setAttribute('aria-hidden', 'true');
    const leer = document.createElement('span');
    leer.className = 'tierKeuleLeer';
    leer.innerHTML = keule;
    const voll = document.createElement('span');
    voll.className = 'tierKeuleFuellung';
    voll.innerHTML = keule;
    symbol.appendChild(leer);
    symbol.appendChild(voll);
    balken.appendChild(symbol);
    tier.hungerFuellungen.push(voll);
  }
  tier.hungerBalken = balken;
  tier.hungerText = document.createElement('small');
  tier.hungerText.className = 'tierHungerText';
  aktualisiereTierHunger(tier);
  return balken;
}

function aktualisiereTierHunger(tier) {
  if (!tier.hungerBalken) return;
  const satt = tier.lebt ? Math.max(0, Math.min(100, tier.saettigung)) : 0;
  tier.hungerBalken.setAttribute('aria-valuenow', Math.round(satt));
  tier.hungerText.textContent = 'Sättigung: ' + Math.ceil(satt) + ' / 100';
  tier.hungerFuellungen.forEach(function(fuellung, index) {
    fuellung.style.width = Math.max(0, Math.min(100, (satt - index * 10) * 10)) + '%';
  });
}

function aktualisiereFutterAuswahl(tier) {
  if (!tier.futterAuswahl) return;
  const bestand = essensVorrat.join(',');
  if (tier.futterBestand !== bestand) {
    const vorher = tier.futterAuswahl.value;
    tier.futterAuswahl.replaceChildren();
    // Das Lieblingsessen steht immer zuerst, auch wenn noch keine Portion da ist.
    const reihenfolge = [tier.art.liebling];
    for (let i = 0; i < lebensmittel.length; i++) {
      if (i !== tier.art.liebling && essensVorrat[i] > 0) reihenfolge.push(i);
    }
    for (const i of reihenfolge) {
      const option = document.createElement('option');
      option.value = i;
      option.textContent = (i === tier.art.liebling ? '❤️ Lieblingsessen: ' : '') + lebensmittel[i].name + ' × ' + essensVorrat[i] + ' · +' + futterSaettigung(tier, i);
      tier.futterAuswahl.appendChild(option);
    }
    tier.futterAuswahl.value = vorher !== '' && reihenfolge.includes(Number(vorher)) && essensVorrat[Number(vorher)] > 0 ? vorher : String(reihenfolge.find(function(i) { return essensVorrat[i] > 0; }) ?? tier.art.liebling);
    tier.futterBestand = bestand;
  }
  const index = Number(tier.futterAuswahl.value);
  tier.fuetterKnopf.disabled = !tier.lebt || tier.saettigung >= 100 || !(essensVorrat[index] > 0);
  tier.futterHinweis.textContent = essensVorrat[index] > 0 ? 'Eine Portion füttern · +' + futterSaettigung(tier, index) + (index === tier.art.liebling ? ' · Lieblingsessen macht ganz satt!' : '.') : 'Noch kein ' + lebensmittel[index].name + ' im Vorrat. Sammle es als Essensbelohnung.';
}

function zeigeTiere() {
  aktualisiereTiere();
  document.getElementById('tierPlaetze').textContent = 'Haustierplätze: ' + lebendeTiere().length + ' / ' + (zweiTierPlaetze ? 2 : 1);
  meineTiere.replaceChildren();
  tierAuswahl.replaceChildren();
  for (const tier of haustiere) {
    const karte = document.createElement('div');
    karte.className = 'tierKarte';
    const titel = document.createElement('h3');
    titel.textContent = tier.name ? tier.name + ' · ' + tier.art.name : tier.art.name;
    if (tier.art.id === 'minion') karte.appendChild(erstelleTierBild(tier.art));
    karte.appendChild(titel);
    const namensFormular = document.createElement('form');
    const namensLabel = document.createElement('label');
    const namensId = 'tierName-' + haustiere.indexOf(tier);
    namensLabel.htmlFor = namensId;
    namensLabel.textContent = 'Name (bis 24 Zeichen)';
    const namensFeld = document.createElement('input');
    namensFeld.id = namensId;
    namensFeld.type = 'text';
    namensFeld.maxLength = 24;
    namensFeld.placeholder = tier.art.name;
    namensFeld.value = tier.name || '';
    tier.namensFeld = namensFeld;
    const speichern = document.createElement('button');
    speichern.type = 'submit';
    speichern.textContent = 'Name speichern';
    namensFormular.addEventListener('submit', function(event) {
      event.preventDefault();
      benenneTier(tier, namensFeld.value);
    });
    namensFormular.appendChild(namensLabel);
    namensFormular.appendChild(namensFeld);
    namensFormular.appendChild(speichern);
    karte.appendChild(namensFormular);
    const status = document.createElement('p');
    const minuten = Math.min(360, Math.floor((Date.now() - tier.geburt) / 60000));
    status.textContent = tier.lebt ? (tier.erwachsen ? 'Erwachsen' : 'Jungtier') + ' · Alter: ' + minuten + ' Min. · Lebt noch höchstens ' + (360 - minuten) + ' Min. · Sättigung: ' + Math.ceil(tier.saettigung) + '/100' : 'Gestorben';
    karte.appendChild(status);
    tier.statusFeld = status;
    karte.appendChild(erstelleTierHunger(tier));
    karte.appendChild(tier.hungerText);
    const info = document.createElement('p');
    info.textContent = tier.art.kraft + ' Lieblingsessen: ' + lebensmittel[tier.art.liebling].name + ' (füllt die Hungerleiste ganz). Jedes andere Essen ist ebenfalls möglich.';
    karte.appendChild(info);
    if (tier.lebt) {
      const futter = document.createElement('select');
      futter.setAttribute('aria-label', 'Futter für ' + tierName(tier));
      const fuettern = document.createElement('button');
      fuettern.type = 'button';
      fuettern.textContent = 'Füttern';
      tier.fuetterKnopf = fuettern;
      tier.futterAuswahl = futter;
      tier.futterBestand = null;
      tier.futterHinweis = document.createElement('p');
      futter.addEventListener('change', function() { aktualisiereFutterAuswahl(tier); });
      aktualisiereFutterAuswahl(tier);
      fuettern.addEventListener('click', function() { if (futter.value !== '') fuettereTier(tier, Number(futter.value)); });
      karte.appendChild(futter);
      karte.appendChild(fuettern);
      karte.appendChild(tier.futterHinweis);
      if (['kaninchen', 'minion'].includes(tier.art.id)) {
        const hilfe = document.createElement('button');
        hilfe.type = 'button';
        const warten = Math.max(0, Math.ceil((tier.hilfeAb - Date.now()) / 60000));
        hilfe.textContent = warten ? 'Hilfe in ' + warten + ' Min.' : tier.art.id === 'kaninchen' ? 'Aufgabe lösen' : 'Baustelle reparieren';
        hilfe.disabled = warten > 0;
        tier.hilfeKnopf = hilfe;
        hilfe.addEventListener('click', function() { nutzeTierHilfe(tier); });
        karte.appendChild(hilfe);
      }
    }
    meineTiere.appendChild(karte);
  }
  for (const art of tierArten) {
    const karte = document.createElement('div');
    karte.className = 'tierKarte';
    const info = document.createElement('p');
    info.textContent = art.name + ' · ' + art.kraft + ' Lieblingsessen: ' + lebensmittel[art.liebling].name;
    if (art.id === 'minion') karte.appendChild(erstelleTierBild(art));
    const knopf = document.createElement('button');
    knopf.type = 'button';
    knopf.textContent = 'Aufnehmen';
    knopf.dataset.tierAufnahme = 'ja';
    knopf.disabled = lebendeTiere().length >= (zweiTierPlaetze ? 2 : 1);
    knopf.addEventListener('click', function() { adoptiereTier(art); });
    karte.appendChild(info);
    karte.appendChild(knopf);
    tierAuswahl.appendChild(karte);
  }
  zeigeTierTipp();
}

document.getElementById('haustiereOeffnen').addEventListener('click', function() { zeigeTiere(); tierZimmer.showModal(); });
document.getElementById('bonusHaustiere').addEventListener('click', function() { zeigeTiere(); tierZimmer.showModal(); });
document.getElementById('haustiereSchliessen').addEventListener('click', function() { tierZimmer.close(); });

// Spezialfunde zählen doppelt: in zwei normale Bauteile umwandeln, dann verbauen.
const spezialFeld = document.createElement('section');
const spezialTitel = document.createElement('h3');
spezialTitel.textContent = '🦜 Spezialfunde – zählen doppelt';
spezialFeld.appendChild(spezialTitel);
const spezialListe = document.createElement('div');
spezialFeld.appendChild(spezialListe);
document.getElementById('werkbank').appendChild(spezialFeld);
function zeigeSpezialTeile() {
  spezialListe.replaceChildren();
  for (let i = 0; i < spezialItems.length; i++) {
    if (spezialVorrat[i] < 1) continue;
    const zeile = document.createElement('p');
    zeile.textContent = spezialItems[i] + ' × ' + spezialVorrat[i] + ' → 2 Bauteile: ';
    const auswahl = document.createElement('select');
    auswahl.setAttribute('aria-label', 'Bauteil für ' + spezialItems[i]);
    for (let j = 0; j < items.length; j++) {
      const option = document.createElement('option');
      option.value = j;
      option.textContent = items[j];
      auswahl.appendChild(option);
    }
    const knopf = document.createElement('button');
    knopf.type = 'button';
    knopf.textContent = 'In 2 Bauteile verwandeln';
    knopf.addEventListener('click', function() { verwandleSpezialItem(i, Number(auswahl.value)); });
    zeile.appendChild(auswahl);
    zeile.appendChild(knopf);
    spezialListe.appendChild(zeile);
  }
  if (spezialVorrat.every(function(n) { return n === 0; })) spezialListe.textContent = 'Dein Wellensittich kann hier besondere Funde ablegen.';
}
function verwandleSpezialItem(spezialIndex, itemIndex) {
  if (!(spezialVorrat[spezialIndex] > 0) || !Number.isInteger(itemIndex) || !items[itemIndex]) return;
  spezialVorrat[spezialIndex]--;
  vorrat[itemIndex] += 2;
  meldeTier('🦜 ' + spezialItems[spezialIndex] + ' wird zu 2 × ' + items[itemIndex] + '!');
  zeigeWerkstatt();
  zeigeSpezialTeile();
}

function aktualisiereAngriff() {
  if (!angriffBeginn) return;
  const sekunden = Math.max(0, Math.ceil((angriffBeginn - Date.now()) / 1000));
  if (sekunden > 0) {
    aufgabe.textContent = 'Angriff in ' + sekunden + ' Sekunden';
  } else {
    angriffBeginn = 0;
    angriffAktiv = true;
    aufgabe.textContent = 'Monsterangriff!';
    laborstatus.textContent = 'Monsterangriff! Noch ' + monsterInWelle + ' Monster. Setze die passende Maschine ein.';
    zeigeWerkstatt();
  }
}
setInterval(function() {
  aktualisiereAngriff();
  aktualisiereTiere();
  zeigeLaborUmbau();
  zeigeTiereAufKonsole();
  zeigeTierTipp();
  if (tierZimmer.open) {
    for (const tier of haustiere) {
      if (!tier.statusFeld) continue;
      aktualisiereTierHunger(tier);
      const minuten = Math.min(360, Math.floor((Date.now() - tier.geburt) / 60000));
      tier.statusFeld.textContent = tier.lebt ? (tier.erwachsen ? 'Erwachsen' : 'Jungtier') + ' · Alter: ' + minuten + ' Min. · Lebt noch höchstens ' + (360 - minuten) + ' Min. · Sättigung: ' + Math.ceil(tier.saettigung) + '/100' : 'Gestorben';
      aktualisiereFutterAuswahl(tier);
      if (tier.hilfeKnopf) {
        const warten = Math.max(0, Math.ceil((tier.hilfeAb - Date.now()) / 60000));
        tier.hilfeKnopf.disabled = !tier.lebt || warten > 0;
        tier.hilfeKnopf.textContent = !tier.lebt ? 'Keine Hilfe mehr' : warten ? 'Hilfe in ' + warten + ' Min.' : tier.art.id === 'kaninchen' ? 'Aufgabe lösen' : 'Baustelle reparieren';
      }
    }
    document.getElementById('tierPlaetze').textContent = 'Haustierplätze: ' + lebendeTiere().length + ' / ' + (zweiTierPlaetze ? 2 : 1);
    for (const knopf of tierAuswahl.querySelectorAll('[data-tier-aufnahme]')) knopf.disabled = lebendeTiere().length >= (zweiTierPlaetze ? 2 : 1);
  }
}, 1000);
zeigeSpezialTeile();
zeigeTierTipp();
zeigeTiereAufKonsole();
