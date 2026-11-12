/*
 * ANDRIS MONSTERLABOR – Spielcode
 *
 * HTML beschreibt die sichtbaren Felder, CSS ihr Aussehen.
 * Dieses JavaScript reagiert auf Klicks, erzeugt Aufgaben und merkt sich Werte.
 * Alles läuft lokal im Browser, ohne Bibliotheken oder Internetzugriff.
 *
 * Orientierung (mit der Suche im Editor auffindbar):
 *   items / maschinen       Gegenstände und Baupläne
 *   zeichenPosition         Magische Zeichnungen an der Werkbank
 *   starteBonus             Zusatzlevels und Schlüssel
 *   zeigeWerkstatt          Sammlung, Bauen und Wartung
 *   monsterDurchbruch       Laborschaden und Baustellen
 *   neueAufgabe             Normale Rechenaufgaben
 *   zurueckZumStart         Runde verlassen und Timer aufräumen
 *   musikStuecke            Soundtracks und Klangerzeugung
 *
 * Wichtig: Werte bleiben nur bis zum Neuladen der Seite erhalten.
 * Änderungen speichern, dann im Browser neu laden (auf dem Mac: Cmd + R).
 */

// Diese Zahl kannst du selbst verändern.
const anzahlAufgaben = 5;
// ITEM-LISTE: Der erste Eintrag hat die Nummer 0, der zweite die Nummer 1 usw.
// Baupläne und Reparaturen verwenden diese Nummern. Reihenfolge nicht einfach ändern.
const items = [
  '🧻 Klopapierrolle',
  '🔴 Laserpointer',
  '🔋 Batterie',
  '🔩 Schraube',
  '⚙️ Zahnrad',
  '🔌 Kabel',
  '🪨 Metallplatte',
  '🌀 Sprungfeder',
  '💡 Glühbirne',
  '🍯 Honig',
  '💻 Prozessor',
  '📷 Kamera',
  '🧴 Plastik',
  '🪢 Seil',
  '🧪 Undefinierbare Flüssigkeit'
];

const deutschItems = {
  de_bier: '🍺 Bier-Sammelitem', de_wurst: '🌭 Wurst-Sammelitem',
  de_friedrich: '🧑 Friedrich-Schmerz-Figur', de_kartoffel: '🥔 Kartoffel-Sammelitem',
  de_kreuz: '🇨🇭 Schweizer Kreuz'
};
const deutschVorrat = Object.fromEntries(Object.keys(deutschItems).map(function(key) { return [key, 0]; }));

// SPIELSTAND: Veränderbare Werte für die aktuelle Runde und die gesamte Sitzung.
let punkte = 0;
let nummer = 0;
let loesung = 0;
let ladung = 50;
let leererBalkenBereitsGezaehlt = false;
let zahlenMaximum = 10;
let schluessel = 0;
let magischeStifte = 0;
let magischesPapier = 0;
// Startpaket: Klopapierrolle, Batterie, Seil und Zahnrad.
const vorrat = items.map(function(item, index) {
  return [0, 2, 4, 13].includes(index) ? 1 : 0;
});
// Die Zahlen zeigen auf die Bauteile in der Item-Liste.
const maschinen = [
  { name: '🏭 Siemens-Wortroboter (Spielmaschine)', teile: ['de_bier', 'de_wurst', 'de_friedrich', 'de_kartoffel'], wirkung: 'angriff', staerke: 'Robotik' },
  { name: '🇨🇭 Siemens-Kreuzschild (Spielmaschine)', teile: ['de_kreuz', 'de_kartoffel'], wirkung: 'schutz', staerke: 'Abwehr' },
  { name: '🔴 Laserkanone', teile: [1, 2], wirkung: 'angriff', staerke: 'Licht' },
  { name: '🛡️ Rollen-Schutz', teile: [0, 2], wirkung: 'schutz', staerke: 'Abwehr' },
  { name: '🤖 Kampfroboter', teile: [10, 6, 2], wirkung: 'angriff', staerke: 'Robotik' },
  { name: '🦾 Wachroboter', teile: [10, 11, 5], wirkung: 'schutz', staerke: 'Robotik' },
  { name: '⚙️ Zahnrad-Katapult', teile: [4, 13], wirkung: 'angriff', staerke: 'Mechanik' },
  { name: '🔩 Schraubenwerfer', teile: [3, 7], wirkung: 'angriff', staerke: 'Mechanik' },
  { name: '🍯 Honigfalle', teile: [9, 13], wirkung: 'schutz', staerke: 'Honig' },
  { name: '📷 Kamerawächter', teile: [11, 2], wirkung: 'schutz', staerke: 'Licht' },
  { name: '💡 Lichtkanone', teile: [8, 5, 2], wirkung: 'angriff', staerke: 'Strom' },
  { name: '🧴 Plastikpanzer', teile: [12, 3, 6], wirkung: 'schutz', staerke: 'Panzerung' },
  { name: '🧪 Schleimkanone', teile: [14, 0], wirkung: 'angriff', staerke: 'Schleim' },
  { name: '🌀 Federbarriere', teile: [7, 6], wirkung: 'schutz', staerke: 'Abwehr' }
];
const gebauteMaschinen = [];
const abgenutzteMaschinen = new Set();
const monsterArten = {
  10: [{ name: 'Krümelmonster', schwaeche: 'Mechanik' }, { name: 'Mini-Rammler', schwaeche: 'Abwehr' }],
  15: [{ name: 'Krümelmonster', schwaeche: 'Mechanik' }],
  20: [{ name: 'Nachtkriecher', schwaeche: 'Licht' }, { name: 'Flitzmonster', schwaeche: 'Honig' }, { name: 'Staubbeisser', schwaeche: 'Schleim' }],
  50: [{ name: 'Schattenbestie', schwaeche: 'Licht' }, { name: 'Felsfresser', schwaeche: 'Schleim' }, { name: 'Stahlklaue', schwaeche: 'Robotik' }],
  100: [{ name: 'Titanmonster', schwaeche: 'Robotik' }, { name: 'Sturmkoloss', schwaeche: 'Panzerung' }, { name: 'Eisriese', schwaeche: 'Strom' }],
  1000000: [{ name: 'Urtitan', schwaeche: 'Robotik' }, { name: 'Megasturmkoloss', schwaeche: 'Panzerung' }, { name: 'Gletschergigant', schwaeche: 'Strom' }]
};
let aktuellesMonster = monsterArten[10][0];
let angriffAktiv = false;
let angriffBeginn = 0;
let monsterLebt = true;
let laborGesundheit = 100;
let laborAusgebaut = false;
let monsterInWelle = 0;
// Jede Stufe schaltet eine weitere Zutat für Essensbelohnungen frei.
const lebensmittel = [
  { name: '🍎 Apfel', saettigung: 25, ab: 10 },
  { name: '🍞 Brot', saettigung: 30, ab: 15 },
  { name: '🧀 Käse', saettigung: 35, ab: 20 },
  { name: '🥔 Kartoffel', saettigung: 40, ab: 50 },
  { name: '🐟 Fisch', saettigung: 45, ab: 100 },
  { name: '🍚 Reis', saettigung: 50, ab: 1000000 },
  { name: '🥪 Apfelbrot', saettigung: 70, zutaten: [0, 1] },
  { name: '🥪 Käsetoast', saettigung: 85, zutaten: [1, 2] },
  { name: '🫕 Käsekartoffeln', saettigung: 95, zutaten: [2, 3] },
  { name: '🍲 Fisch mit Kartoffeln', saettigung: 100, zutaten: [3, 4] },
  { name: '🍱 Fisch-Reis-Bowl', saettigung: 100, zutaten: [4, 5] },
  { name: '🍌 Banane', saettigung: 30, ab: 10 },
  { name: '🥕 Karotte', saettigung: 25, ab: 10 },
  { name: '🦴 Hundefutter', saettigung: 35, ab: 10, tierfutter: true }
];
const essensVorrat = lebensmittel.map(function(essen, index) { return index === 0 ? 1 : 0; });
let monsterKills = 0;
let kartPokale = 0;
const baustellen = [];
const reparaturPlaene = [
  { name: 'Mauer flicken', teile: [3, 6] },
  { name: 'Kabel isolieren', teile: [5, 12] },
  { name: 'Rohr abdichten', teile: [0, 13] }
];
let rundeAktiv = false;

// HTML-ELEMENTE: Die IDs verbinden diesen Code mit den Feldern in index.html.
const startmenue = document.getElementById('startmenue');
const schwierigkeit = document.getElementById('schwierigkeit');
const stufenReihenfolge = [10, 15, 20, 50, 100, 1000000];
const stufenNamen = ['Zukunftstag', 'Lehrling', 'Assistent', 'Doktor', 'Professor', 'Da Vinci'];
const abgeschlosseneRunden = Object.fromEntries(stufenReihenfolge.map(function(stufe) { return [stufe, 0]; }));

function istStufeOffen(stufe) {
  const platz = stufenReihenfolge.indexOf(stufe);
  return platz === 0 || (platz > 0 && abgeschlosseneRunden[stufenReihenfolge[platz - 1]] >= 2);
}

function zeigeStufenFortschritt() {
  for (const option of schwierigkeit.querySelectorAll('option')) {
    if (!option.dataset.beschreibung) option.dataset.beschreibung = option.textContent;
    option.disabled = !istStufeOffen(Number(option.value));
    option.textContent = option.dataset.beschreibung + (option.disabled ? ' 🔒' : '');
  }
  const naechste = stufenReihenfolge.findIndex(function(stufe) { return !istStufeOffen(stufe); });
  document.getElementById('stufenFortschritt').textContent = naechste < 0
    ? 'Alle Schwierigkeitsstufen sind freigeschaltet!'
    : stufenNamen[naechste - 1] + ': ' + abgeschlosseneRunden[stufenReihenfolge[naechste - 1]] +
      '/2 Runden abgeschlossen. Danach öffnet sich ' + stufenNamen[naechste] + '.';
}

const spiel = document.getElementById('spiel');
const stufeninfo = document.getElementById('stufeninfo');

const stand = document.getElementById('stand');
const aufgabe = document.getElementById('aufgabe');
const formular = document.getElementById('formular');
const antwort = document.getElementById('antwort');
const pruefen = document.getElementById('pruefen');
const meldung = document.getElementById('meldung');
const weiter = document.getElementById('weiter');
const zumStart = document.getElementById('zumStart');
let aufgabenTimer;
const hintergrund = document.getElementById('hintergrund');
let hintergrundTimer;
const ladebalken = document.getElementById('ladebalken');
const fuellung = document.getElementById('fuellung');
const ladestand = document.getElementById('ladestand');
const konfetti = document.getElementById('konfetti');
const komplimente = document.getElementById('komplimente');
let feierTimer;
const gegenstaende = document.getElementById('gegenstaende');
const belohnung = document.getElementById('belohnung');
const itemGewinn = document.getElementById('itemGewinn');
const monster = document.getElementById('monster');
const monsterinfo = document.getElementById('monsterinfo');
const laborstatus = document.getElementById('laborstatus');
const laborzustand = document.getElementById('laborzustand');
const monsterZaehler = document.getElementById('monsterZaehler');
const laborLeiste = document.getElementById('laborLeiste');
const kueche = document.getElementById('kueche');
const speisekammer = document.getElementById('speisekammer');
const rezepte = document.getElementById('rezepte');
const kuechenMeldung = document.getElementById('kuechenMeldung');

const janoschTausch = document.getElementById('janoschTausch');
const tauschVon = document.getElementById('tauschVon');
const tauschNach = document.getElementById('tauschNach');
const tauschKnopf = document.getElementById('tauschKnopf');
const tauschMeldung = document.getElementById('tauschMeldung');

function zeigeTausch() {
  const vorher = tauschVon.value;
  tauschVon.replaceChildren();
  lebensmittel.forEach(function(essen, index) {
    if (essensVorrat[index] < 1) return;
    const option = document.createElement('option');
    option.value = index;
    option.textContent = essen.name + ' · Vorrat: ' + essensVorrat[index];
    tauschVon.appendChild(option);
  });
  if (vorher !== '' && essensVorrat[Number(vorher)] > 0) tauschVon.value = vorher;
  if (!essensVorrat.some(function(anzahl) { return anzahl > 0; })) {
    const leer = document.createElement('option');
    leer.value = '';
    leer.textContent = 'Kein Essen – löse zuerst Rechnungen!';
    tauschVon.appendChild(leer);
  }
  zeigeTauschZiele();
}

function zeigeTauschZiele() {
  const vorher = tauschNach.value;
  tauschNach.replaceChildren();
  lebensmittel.forEach(function(essen, index) {
    if (tauschVon.value !== '' && index === Number(tauschVon.value)) return;
    const option = document.createElement('option');
    option.value = index;
    option.textContent = essen.name + ' · Tierfutter +' + Math.min(70, essen.saettigung);
    tauschNach.appendChild(option);
  });
  if (vorher !== '' && vorher !== tauschVon.value && lebensmittel[Number(vorher)]) tauschNach.value = vorher;
  zeigeTauschVorschau();
}

function zeigeTauschVorschau() {
  const von = Number(tauschVon.value);
  const nach = Number(tauschNach.value);
  const moeglich = tauschVon.value !== '' && tauschNach.value !== '' && von !== nach && essensVorrat[von] > 0;
  tauschKnopf.disabled = !moeglich;
  document.getElementById('tauschVorschau').textContent = moeglich
    ? '1 ' + lebensmittel[von].name + ' → 1 ' + lebensmittel[nach].name
    : 'Du brauchst ein Essen zum Tauschen.';
  zeigeElementNachschub();
}

function tauscheEssen(von, nach) {
  // Eine Portion abziehen und genau eine Portion der anderen Sorte hinzufügen.
  if (!Number.isInteger(von) || !Number.isInteger(nach) || !lebensmittel[von] ||
      !lebensmittel[nach] || von === nach || essensVorrat[von] < 1) return;
  essensVorrat[von]--;
  essensVorrat[nach]++;
  tauschMeldung.textContent = 'Getauscht: 1 ' + lebensmittel[von].name + ' gegen 1 ' + lebensmittel[nach].name + '!';
  zeigeEssensVorrat();
}
document.getElementById('janoschOeffnen').addEventListener('click', function() {
  tauschMeldung.textContent = '';
  zeigeTausch();
  janoschTausch.showModal();
});
document.getElementById('janoschSchliessen').addEventListener('click', function() { janoschTausch.close(); });
tauschVon.addEventListener('change', zeigeTauschZiele);
tauschNach.addEventListener('change', zeigeTauschVorschau);
document.getElementById('tauschFormular').addEventListener('submit', function(event) {
  event.preventDefault();
  if (tauschVon.value === '' || tauschNach.value === '') return;
  tauscheEssen(Number(tauschVon.value), Number(tauschNach.value));
});

function zeigeEssensVorrat() {
  zeigeKueche();
  if (janoschTausch.open) zeigeTausch();
}

// Jedes Essen ist im Spiel Tierfutter. Lieblingsessen füllt die ganze Leiste.
function futterSaettigung(tier, index) {
  return index === tier.art.liebling ? 100 : Math.min(70, lebensmittel[index].saettigung);
}

function gewinneEssen() {
  const stufe = Number(schwierigkeit.value);
  const freigeschaltet = [];
  for (let i = 0; i < lebensmittel.length; i++) {
    if (lebensmittel[i].ab <= stufe) freigeschaltet.push(i);
  }
  const index = freigeschaltet[zufallszahl(0, freigeschaltet.length - 1)];
  essensVorrat[index] = essensVorrat[index] + 1;
  zeigeEssensVorrat();
  return lebensmittel[index].name;
}

document.getElementById('kuecheOeffnen').addEventListener('click', function() {
  zeigeKueche();
  kueche.showModal();
});
document.getElementById('kuecheSchliessen').addEventListener('click', function() { kueche.close(); });

function zeigeKueche() {
  speisekammer.replaceChildren();
  rezepte.replaceChildren();
  for (let i = 0; i < lebensmittel.length; i = i + 1) {
    const essen = lebensmittel[i];
    if (essensVorrat[i] > 0) {
      const karte = document.createElement('li');
      karte.textContent = essen.name + ' × ' + essensVorrat[i] + ' · Tierfutter: +' + Math.min(70, essen.saettigung) + ', als Lieblingsessen +100';
      speisekammer.appendChild(karte);
    }
    if (essen.zutaten) {
      const karte = document.createElement('div');
      const text = document.createElement('p');
      text.textContent = essen.zutaten.map(function(index) { return '1 ' + lebensmittel[index].name; }).join(' + ') + ' → ' + essen.name + ' (Tierfutter +' + Math.min(70, essen.saettigung) + ')';
      const knopf = document.createElement('button');
      knopf.type = 'button';
      knopf.textContent = 'Kochen';
      knopf.disabled = !essen.zutaten.every(function(index) { return essensVorrat[index] > 0; });
      knopf.addEventListener('click', function() { kocheEssen(i); });
      karte.appendChild(text);
      karte.appendChild(knopf);
      const fehlt = essen.zutaten.filter(function(index) { return essensVorrat[index] < 1; });
      if (fehlt.length > 0) {
        const hinweis = document.createElement('small');
        hinweis.textContent = 'Fehlt: ' + fehlt.map(function(index) { return lebensmittel[index].name; }).join(', ');
        karte.appendChild(hinweis);
      }
      rezepte.appendChild(karte);
    }
  }
  if (essensVorrat.every(function(anzahl) { return anzahl === 0; })) {
    const leer = document.createElement('li');
    leer.textContent = 'Dein Vorrat ist leer. Mit Rechnungen verdienst du Essen.';
    speisekammer.appendChild(leer);
  }
}

// KÜCHE: Erst alle Zutaten prüfen, dann je eine abziehen und ein Gericht hinzufügen.
function kocheEssen(index) {
  const gericht = lebensmittel[index];
  if (!gericht || !gericht.zutaten || !gericht.zutaten.every(function(zutat) { return essensVorrat[zutat] > 0; })) return;
  for (const zutat of gericht.zutaten) essensVorrat[zutat] = essensVorrat[zutat] - 1;
  essensVorrat[index] = essensVorrat[index] + 1;
  kuechenMeldung.textContent = 'Fertig: ' + gericht.name + '! Tierfutter: +' + Math.min(70, gericht.saettigung) + ', als Lieblingsessen +100.';
  zeigeEssensVorrat();
}
const baustellenFelder = [document.getElementById('baustellenLabor'), document.getElementById('baustellenWerkstatt')];
const bauplaene = document.getElementById('bauplaene');
const werkstatt = document.getElementById('werkstatt');
const bauinfo = document.getElementById('bauinfo');
const werkstattOeffnen = document.getElementById('werkstattOeffnen');
const werkstattSchliessen = document.getElementById('werkstattSchliessen');
const werkbankSchluessel = document.getElementById('werkbankSchluessel');
const tresorOeffnen = document.getElementById('tresorOeffnen');
const tresorMeldung = document.getElementById('tresorMeldung');
const zeichenItem = document.getElementById('zeichenItem');
const zeichenblatt = document.getElementById('zeichenblatt');
const stift = zeichenblatt.getContext('2d');
const zeichnungVerwandeln = document.getElementById('zeichnungVerwandeln');
const zeichenMeldung = document.getElementById('zeichenMeldung');
const zauberVorrat = document.getElementById('zauberVorrat');
let zeichnet = false;
let hatZeichnung = false;

for (let i = 0; i < items.length; i = i + 1) {
  const option = document.createElement('option');
  option.value = i;
  option.textContent = items[i];
  zeichenItem.appendChild(option);
}

// ZEICHNEN: Maus- und Fingerposition auf die Grösse des Zeichenblatts umrechnen.
function zeichenPosition(event) {
  const rahmen = zeichenblatt.getBoundingClientRect();
  return {
    x: (event.clientX - rahmen.left) * zeichenblatt.width / rahmen.width,
    y: (event.clientY - rahmen.top) * zeichenblatt.height / rahmen.height
  };
}

// Verwandeln geht nur mit einer Zeichnung, einem Stift und einem Blatt Papier.
function zeigeZeichenStatus() {
  zauberVorrat.textContent = '🖊️ Stifte: ' + magischeStifte + ' · 📜 Papier: ' + magischesPapier;
  zeichnungVerwandeln.disabled = !hatZeichnung || magischeStifte < 1 || magischesPapier < 1;
}

zeichenblatt.addEventListener('pointerdown', function(event) {
  if (event.button !== 0) return;
  zeichnet = true;
  hatZeichnung = true;
  zeichenblatt.setPointerCapture(event.pointerId);
  const punkt = zeichenPosition(event);
  stift.lineWidth = 4;
  stift.lineCap = 'round';
  stift.strokeStyle = '#ffe0a0';
  stift.beginPath();
  stift.moveTo(punkt.x, punkt.y);
  stift.lineTo(punkt.x + 0.1, punkt.y);
  stift.stroke();
  zeigeZeichenStatus();
});
zeichenblatt.addEventListener('pointermove', function(event) {
  if (!zeichnet) return;
  const punkt = zeichenPosition(event);
  stift.lineTo(punkt.x, punkt.y);
  stift.stroke();
});
zeichenblatt.addEventListener('pointerup', function() { zeichnet = false; });
zeichenblatt.addEventListener('pointercancel', function() { zeichnet = false; });
zeichenblatt.addEventListener('lostpointercapture', function() { zeichnet = false; });

function loescheZeichnung() {
  stift.clearRect(0, 0, zeichenblatt.width, zeichenblatt.height);
  hatZeichnung = false;
  zeichnet = false;
  zeigeZeichenStatus();
}
document.getElementById('zeichnungLoeschen').addEventListener('click', loescheZeichnung);
zeichnungVerwandeln.addEventListener('click', function() {
  if (!hatZeichnung || magischeStifte < 1 || magischesPapier < 1) return;
  const index = Number(zeichenItem.value);
  if (!Number.isInteger(index) || index < 0 || index >= items.length) return;
  magischeStifte = magischeStifte - 1;
  magischesPapier = magischesPapier - 1;
  vorrat[index] = vorrat[index] + 1;
  zeichenMeldung.textContent = '✨ Deine Zeichnung wird zu ' + items[index] + '! Jetzt kannst du das Item verbauen.';
  loescheZeichnung();
  zeigeWerkstatt();
});

tresorOeffnen.addEventListener('click', function() {
  if (schluessel < 1) return;
  schluessel = schluessel - 1;
  if (Math.random() < 0.5) {
    magischeStifte = magischeStifte + 1;
    tresorMeldung.textContent = '🔓 Gefunden: ein magischer Stift! 🖊️✨';
  } else {
    magischesPapier = magischesPapier + 1;
    tresorMeldung.textContent = '🔓 Gefunden: ein Blatt magisches Papier! 📜✨';
  }
  zeigeWerkstatt();
});
const zusatzOeffnen = document.getElementById('zusatzOeffnen');
const zusatz = document.getElementById('zusatz');
const bonusSpiel = document.getElementById('bonusSpiel');
const bonusHilfe = document.getElementById('bonusHilfe');
const bonusStand = document.getElementById('bonusStand');
const bonusBalken = document.getElementById('bonusBalken');
const schluesselStand = document.getElementById('schluesselStand');
const bonusAufgabe = document.getElementById('bonusAufgabe');
const bonusFormular = document.getElementById('bonusFormular');
const bonusAntwort = document.getElementById('bonusAntwort');
const bonusPruefen = document.getElementById('bonusPruefen');
const bonusMeldung = document.getElementById('bonusMeldung');
const bonusWeiter = document.getElementById('bonusWeiter');
const bonusStufe = document.getElementById('bonusStufe');
let stufe = 1;
const taschenrechner = document.getElementById('taschenrechner');
const rechnerA = document.getElementById('rechnerA');
const rechnerB = document.getElementById('rechnerB');
const rechnerArt = document.getElementById('rechnerArt');
const rechnerErgebnis = document.getElementById('rechnerErgebnis');
const rechnerWeiter = document.getElementById('rechnerWeiter');
let rechenErgebnis = 0;
const rechnerZahlen = ['rechnerA', 'rechnerB', 'rechnerC', 'rechnerD', 'rechnerE'].map(function(id) {
  return document.getElementById(id);
});
const rechnerArten = ['rechnerArt', 'rechnerArtC', 'rechnerArtD', 'rechnerArtE'].map(function(id) {
  return document.getElementById(id);
});

document.getElementById('rechnerFormular').addEventListener('submit', function(event) {
  event.preventDefault();
  rechnerWeiter.disabled = true;
  const zahlen = [];
  let luecke = false;
  for (const feld of rechnerZahlen) {
    const text = feld.value.trim().replace(',', '.');
    if (text === '') {
      luecke = true;
      continue;
    }
    if (luecke || !/^-?\d+(\.\d+)?$/.test(text) || !Number.isFinite(Number(text))) {
      rechnerErgebnis.textContent = 'Bitte Zahlen von vorne ohne Lücke eingeben, zum Beispiel 2,5.';
      return;
    }
    zahlen.push(Number(text));
  }
  if (zahlen.length < 2) {
    rechnerErgebnis.textContent = 'Bitte mindestens zwei Zahlen eingeben.';
    return;
  }
  // Erst Mal und Geteilt ausrechnen, danach Plus und Minus.
  let summe = 0;
  let teil = zahlen[0];
  for (let i = 1; i < zahlen.length; i = i + 1) {
    const art = rechnerArten[i - 1].value;
    if (art === '/' && zahlen[i] === 0) {
      rechnerErgebnis.textContent = 'Durch 0 kann man nicht teilen.';
      return;
    }
    if (art === '*') teil = teil * zahlen[i];
    if (art === '/') teil = teil / zahlen[i];
    if (art === '+' || art === '-') {
      summe = summe + teil;
      teil = art === '+' ? zahlen[i] : -zahlen[i];
    }
  }
  rechenErgebnis = summe + teil;
  if (!Number.isFinite(rechenErgebnis)) {
    rechnerErgebnis.textContent = 'Diese Zahl ist zu gross.';
    return;
  }
  rechnerErgebnis.textContent = '= ' + rechenErgebnis.toLocaleString('de-CH', {maximumSignificantDigits: 12});
  rechnerWeiter.disabled = false;
});

rechnerWeiter.addEventListener('click', function() {
  if (rechnerWeiter.disabled) return;
  rechnerA.value = String(rechenErgebnis);
  for (let i = 1; i < rechnerZahlen.length; i = i + 1) rechnerZahlen[i].value = '';
  rechnerB.focus();
});
let bonusArt = 'quadrate';
let bonusPunkte = 0;
let bonusZaehler = 0;
let bonusNenner = 1;

function zeigeZusatzZugang() {
  const gesperrt = Number(schwierigkeit.value) < 20;
  zusatzOeffnen.disabled = gesperrt;
  zusatzOeffnen.textContent = gesperrt ? '⭐ Zusatzlevels – ab Assistent' : '⭐ Zusatzlevels';
}

schwierigkeit.addEventListener('change', zeigeZusatzZugang);
zusatzOeffnen.addEventListener('click', function() {
  if (Number(schwierigkeit.value) < 20) return;
  bonusSpiel.hidden = true;
  zusatz.showModal();
});
document.getElementById('zusatzSchliessen').addEventListener('click', function() {
  zusatz.close();
});

// ZUSATZLEVELS: Ein neues Level startet bei null Punkten. Drei richtige Antworten geben einen Schlüssel.
function starteBonus(art) {
  bonusArt = art;
  stufe = Number(bonusStufe.value);
  bonusPunkte = 0;
  bonusSpiel.hidden = false;
  neueBonusAufgabe();
}

document.getElementById('bruecheStart').addEventListener('click', function() {
  starteBonus('brueche');
});
document.getElementById('quadrateStart').addEventListener('click', function() {
  starteBonus('quadrate');
});
for (const art of ['prozente', 'gleichungen', 'umfang', 'einheiten', 'quader']) {
  document.getElementById(art + 'Start').addEventListener('click', function() {
    starteBonus(art);
  });
}
bonusStufe.addEventListener('change', function() {
  // Eine neue Stufe beginnt mit einem neuen Punktestand.
  if (!bonusSpiel.hidden) starteBonus(bonusArt);
});

// Sieben Themen mit je drei Stufen. Brüche speichern wir als Zähler und Nenner.
function neueBonusAufgabe() {
  bonusNenner = 1;
  bonusAntwort.placeholder = 'Deine Zahl';
  if (bonusArt === 'brueche') {
    const nennerA = zufallszahl(2, stufe === 3 ? 12 : 6);
    let nennerB = nennerA;
    if (stufe === 2) nennerB = nennerA * 2;
    if (stufe === 3) nennerB = nennerA + 1;
    const a = zufallszahl(1, nennerA - 1);
    const b = zufallszahl(1, nennerB - 1);
    bonusNenner = nennerA * nennerB;
    bonusZaehler = a * nennerB + b * nennerA;
    bonusAufgabe.textContent = a + '/' + nennerA + ' + ' + b + '/' + nennerB + ' = ?';
    bonusHilfe.textContent = stufe === 1 ? 'Addiere die oberen Zahlen, behalte den Nenner. Beispiel: 1/4 + 2/4 = 3/4.' : 'Bringe die Brüche auf denselben Nenner. Beispiel: 1/2 + 1/4 = 2/4 + 1/4 = 3/4.';
    bonusAntwort.placeholder = 'Zum Beispiel 3/4';
  } else if (bonusArt === 'quadrate') {
    const a = zufallszahl(stufe === 1 ? 2 : stufe === 2 ? 11 : 21, stufe === 1 ? 10 : stufe === 2 ? 20 : 40);
    bonusZaehler = a * a;
    bonusAufgabe.textContent = a + '² = ?';
    bonusHilfe.textContent = 'Quadrat heisst: die Zahl mit sich selbst malnehmen. Zum Beispiel: 3² = 3 × 3 = 9.';
  } else if (bonusArt === 'prozente') {
    const auswahl = stufe === 1 ? [10, 50] : stufe === 2 ? [5, 20, 25, 75] : [12, 15, 35, 65];
    const prozent = auswahl[zufallszahl(0, auswahl.length - 1)];
    const grundwert = zufallszahl(1, stufe === 3 ? 20 : 10) * (stufe === 1 ? 10 : 100);
    bonusZaehler = grundwert * prozent / 100;
    bonusAufgabe.textContent = prozent + ' % von ' + grundwert + ' = ?';
    bonusHilfe.textContent = 'Prozent heisst «von hundert». Beispiel: 25 % von 200 = 200 ÷ 100 × 25 = 50.';
  } else if (bonusArt === 'gleichungen') {
    const x = zufallszahl(1, stufe * 10);
    const a = zufallszahl(2, stufe * 4);
    const b = zufallszahl(1, stufe * 10);
    bonusZaehler = x;
    bonusAufgabe.textContent = stufe === 1 ? 'x + ' + b + ' = ' + (x + b) : stufe === 2 ? a + ' × x = ' + (a * x) : a + ' × x + ' + b + ' = ' + (a * x + b);
    bonusHilfe.textContent = stufe === 1 ? 'Finde x. Bei x + 3 = 8 rechnest du 8 − 3.' : stufe === 2 ? 'Finde x. Bei 4 × x = 20 rechnest du 20 ÷ 4.' : 'Finde x: zuerst die Zahl nach dem Plus abziehen, dann durch die Zahl vor x teilen.';
  } else if (bonusArt === 'umfang') {
    const a = zufallszahl(2, stufe * 10);
    const b = zufallszahl(2, stufe * 8);
    if (stufe === 1) {
      bonusZaehler = 4 * a;
      bonusAufgabe.textContent = 'Quadrat: Seite ' + a + ' cm. Umfang in cm?';
    } else {
      const laenge = stufe === 3 ? a * 100 : a;
      bonusZaehler = 2 * (laenge + b);
      bonusAufgabe.textContent = 'Rechteck: ' + a + (stufe === 3 ? ' m' : ' cm') + ' lang, ' + b + ' cm breit. Umfang in cm?';
    }
    bonusHilfe.textContent = stufe === 1 ? 'Umfang: alle vier Seiten zusammenzählen.' : 'Umfang = 2 × Länge + 2 × Breite. Zuerst alles in cm umrechnen: 1 m = 100 cm.';
  } else if (bonusArt === 'einheiten') {
    const a = zufallszahl(1, stufe * 12);
    const b = zufallszahl(1, 59);
    if (stufe === 1) {
      bonusZaehler = a * 100;
      bonusAufgabe.textContent = a + ' m = ? cm';
      bonusHilfe.textContent = '1 Meter sind 100 Zentimeter.';
    } else if (stufe === 2) {
      bonusZaehler = a * 1000 + b * 10;
      bonusAufgabe.textContent = a + ' kg und ' + (b * 10) + ' g = ? g';
      bonusHilfe.textContent = '1 Kilogramm sind 1000 Gramm. Rechne um und zähle zusammen.';
    } else {
      bonusZaehler = a * 3600 + b * 60;
      bonusAufgabe.textContent = a + ' Stunden und ' + b + ' Minuten = ? Sekunden';
      bonusHilfe.textContent = '1 Stunde = 3600 Sekunden. 1 Minute = 60 Sekunden.';
    }
  } else if (bonusArt === 'quader') {
    const laenge = zufallszahl(stufe === 2 ? 11 : 2, stufe === 2 ? 25 : 5);
    const breite = zufallszahl(2, stufe === 1 ? 5 : 20);
    const hoehe = zufallszahl(2, stufe === 1 ? 5 : 15);
    bonusZaehler = laenge * (stufe === 3 ? 100 : 1) * breite * hoehe;
    bonusAufgabe.textContent = 'Quader: ' + laenge + (stufe === 3 ? ' m' : ' cm') + ' lang, ' + breite + ' cm breit, ' + hoehe + ' cm hoch. Volumen in cm³?';
    bonusHilfe.textContent = 'Volumen ist der Platz im Quader: Länge × Breite × Höhe. ' + (stufe === 3 ? 'Rechne zuerst Meter in Zentimeter um: 1 m = 100 cm.' : 'Gib nur die Zahl ein.');
  }
  taschenrechner.hidden = stufe === 1 && bonusArt !== 'quader';
  taschenrechner.open = false;
  for (const feld of rechnerZahlen) feld.value = '';
  rechnerErgebnis.textContent = '';
  rechnerWeiter.disabled = true;
  bonusStand.textContent = 'Stufe ' + stufe + ' · ' + bonusPunkte + ' von 3 richtig';
  bonusBalken.value = bonusPunkte;
  bonusAntwort.value = '';
  bonusAntwort.disabled = false;
  bonusPruefen.disabled = false;
  bonusMeldung.textContent = '';
  bonusWeiter.hidden = true;
  bonusAntwort.focus();
}

bonusWeiter.addEventListener('click', neueBonusAufgabe);
bonusFormular.addEventListener('submit', function(event) {
  event.preventDefault();
  if (bonusAntwort.disabled) return;
  // Akzeptiere ganze Zahlen oder Brüche wie 3/4.
  const eingabe = bonusAntwort.value.replace(/\s/g, '');
  if (!/^\d+(\/\d+)?$/.test(eingabe)) {
    bonusMeldung.textContent = 'Schreibe eine ganze Zahl oder einen Bruch wie 3/4.';
    return;
  }
  const teile = eingabe.split('/');
  const oben = Number(teile[0]);
  const unten = teile.length === 2 ? Number(teile[1]) : 1;
  if (!Number.isSafeInteger(oben) || !Number.isSafeInteger(unten) || unten === 0) {
    bonusMeldung.textContent = 'Bitte prüfe deine Eingabe. Der Nenner darf nicht 0 sein.';
    return;
  }
  const richtig = oben * bonusNenner === bonusZaehler * unten;
  bonusAntwort.disabled = true;
  bonusPruefen.disabled = true;
  if (richtig) {
    feiereRichtigeAntwort();
    bonusPunkte = bonusPunkte + 1;
    bonusMeldung.textContent = 'Richtig!';
  } else {
    bonusMeldung.textContent = 'Die richtige Antwort ist ' + bonusZaehler + (bonusNenner === 1 ? '' : '/' + bonusNenner) + '.';
  }
  bonusStand.textContent = 'Stufe ' + stufe + ' · ' + bonusPunkte + ' von 3 richtig';
  bonusBalken.value = bonusPunkte;
  if (bonusPunkte === 3) {
    schluessel = schluessel + 1;
    const essen = gewinneEssen();
    schluesselStand.textContent = '🔑 Schlüssel: ' + schluessel;
    zeigeWerkstatt();
    bonusMeldung.textContent = 'Balken voll! Du gewinnst einen Schlüssel 🔑 und ' + essen + '!';
  } else {
    bonusWeiter.hidden = false;
    bonusWeiter.focus();
  }
});

werkstattOeffnen.addEventListener('click', function() {
  zeigeWerkstatt();
  werkstatt.showModal();
});

werkstattSchliessen.addEventListener('click', function() {
  werkstatt.close();
});

// WERKSTATT: Anzeige aus dem aktuellen Spielstand neu aufbauen. Hier wird nichts verbraucht.
function zeigeWerkstatt() {
  zeigeLaborUmbau();
  if (document.getElementById('janoschTausch').open) zeigeElementNachschub();
  if (document.getElementById('chemieLabor').open) {
    for (const probe of chemieProben) zeigeChemieProbe(probe);
  }
  document.body.classList.toggle('monsterangriff', angriffAktiv);
  zeigeZeichenStatus();
  zeigeBaustellen();
  werkbankSchluessel.textContent = '🔑 Schlüssel: ' + schluessel;
  schluesselStand.textContent = '🔑 Schlüssel: ' + schluessel;
  tresorOeffnen.disabled = schluessel < 1;
  gegenstaende.replaceChildren();
  if (magischeStifte > 0) {
    const karte = document.createElement('li');
    karte.textContent = '🖊️✨ Magische Stifte: ' + magischeStifte;
    gegenstaende.appendChild(karte);
  }
  if (magischesPapier > 0) {
    const karte = document.createElement('li');
    karte.textContent = '📜✨ Magisches Papier: ' + magischesPapier;
    gegenstaende.appendChild(karte);
  }
  if (schluessel > 0) {
    const karte = document.createElement('li');
    karte.textContent = '🔑 Schlüssel: ' + schluessel;
    gegenstaende.appendChild(karte);
  }
  for (const key of Object.keys(deutschItems)) {
    if (deutschVorrat[key] < 1) continue;
    const karte = document.createElement('li'); karte.textContent = deutschItems[key] + ': ' + deutschVorrat[key]; gegenstaende.appendChild(karte);
  }
  if (kartPokale > 0) {
    const karte = document.createElement('li');
    karte.textContent = '🏆 Gwörk-Kart-Pokal: ' + kartPokale;
    gegenstaende.appendChild(karte);
  }
  for (let i = 0; i < items.length; i = i + 1) {
    if (vorrat[i] > 0) {
      const karte = document.createElement('li');
      karte.textContent = items[i] + ': ' + vorrat[i];
      gegenstaende.appendChild(karte);
    }
  }
  bauplaene.replaceChildren();
  for (const maschine of maschinen) {
    const karte = document.createElement('div');
    const knopf = document.createElement('button');
    knopf.type = 'button';
    knopf.textContent = maschine.name + ' bauen';
    knopf.disabled = !kannBauen(maschine);
    knopf.addEventListener('click', function() { baueMaschine(maschine); });
    const rezept = document.createElement('small');
    rezept.textContent = maschine.teile.map(teilName).join(' + ');
    const wirkung = document.createElement('small');
    wirkung.textContent = 'Stärke: ' + maschine.staerke + (maschine.wirkung === 'schutz' ? ' · Schutzmaschine.' : ' · Angriffsmaschine.');
    const fehlt = maschine.teile.filter(function(teil) { return anzahlTeil(teil) < 1; });
    const hinweis = document.createElement('small');
    hinweis.textContent = gebauteMaschinen.includes(maschine) ? (abgenutzteMaschinen.has(maschine) ? '🔧 Wartung nötig!' : '✅ Einsatzbereit') : fehlt.length > 0 ? 'Fehlt: ' + fehlt.map(teilName).join(', ') : 'Alle Teile vorhanden!';
    karte.appendChild(knopf);
    karte.appendChild(rezept);
    karte.appendChild(wirkung);
    karte.appendChild(hinweis);
    if (gebauteMaschinen.includes(maschine)) {
      const einsetzen = document.createElement('button');
      einsetzen.type = 'button';
      einsetzen.textContent = 'Einsetzen';
      einsetzen.disabled = !angriffAktiv || !monsterLebt || abgenutzteMaschinen.has(maschine);
      einsetzen.addEventListener('click', function() { setzeMaschineEin(maschine); });
      karte.appendChild(einsetzen);
      if (abgenutzteMaschinen.has(maschine)) {
        // Für die Wartung brauchst du das letzte Teil des Bauplans.
        const ersatzteil = maschine.teile[maschine.teile.length - 1];
        const warten = document.createElement('button');
        warten.type = 'button';
        warten.textContent = 'Flicken: 1 ' + teilName(ersatzteil);
        warten.disabled = anzahlTeil(ersatzteil) < 1;
        warten.addEventListener('click', function() { warteMaschine(maschine); });
        karte.appendChild(warten);
        if (anzahlTeil(ersatzteil) < 1) {
          const fehltWartung = document.createElement('small');
          fehltWartung.textContent = 'Für die Wartung fehlt: ' + teilName(ersatzteil);
          karte.appendChild(fehltWartung);
        }
      }
    }
    bauplaene.appendChild(karte);
  }
  if (!rundeAktiv) {
    bauinfo.textContent = 'Baue Maschinen für den nächsten Angriff.';
  } else if (zahlenMaximum < 20) {
    bauinfo.textContent = 'Keine Monsterangriffe. Hier kannst du in Ruhe Maschinen bauen.';
  } else if (!monsterLebt || (!angriffAktiv && nummer === 0)) {
    bauinfo.textContent = laborstatus.textContent;
  } else {
    bauinfo.textContent = aktuellesMonster.name + ' · Schwäche: ' + aktuellesMonster.schwaeche + (angriffAktiv ? ' · Noch ' + monsterInWelle + ' Monster · Jetzt Maschine einsetzen!' : ' · Angriff nach Aufgabe 5.');
  }
}

function teilName(teil) {
  return typeof teil === 'string' ? deutschItems[teil] : items[teil];
}

function anzahlTeil(teil) {
  return typeof teil === 'string' ? (deutschVorrat[teil] || 0) : vorrat[teil];
}

function verbraucheBauteil(teil) {
  if (typeof teil === 'string') deutschVorrat[teil]--;
  else vorrat[teil]--;
}

// Prüfen, ob die Maschine noch fehlt und alle benötigten Teile vorhanden sind.
function kannBauen(maschine) {
  return !gebauteMaschinen.includes(maschine) &&
    maschine.teile.every(function(teil) { return anzahlTeil(teil) > 0; });
}

// Erst prüfen, dann Teile abziehen und die fertig gebaute Maschine behalten.
function baueMaschine(maschine) {
  if (!kannBauen(maschine)) return;
  for (const teil of maschine.teile) {
    verbraucheBauteil(teil);
  }
  gebauteMaschinen.push(maschine);
  zeigeWerkstatt();
}

// Einen Abzug zuerst planen: Erst wenn alles vorhanden ist, wird bezahlt.
function planeVorratsAbzug(vorratsListe, anzahl, bevorzugt = -1) {
  const reihenfolge = vorratsListe.map(function(menge, index) { return index; });
  if (reihenfolge.includes(bevorzugt)) {
    reihenfolge.splice(reihenfolge.indexOf(bevorzugt), 1);
    reihenfolge.unshift(bevorzugt);
  }
  const plan = [];
  for (const index of reihenfolge) {
    for (let n = 0; n < vorratsListe[index] && plan.length < anzahl; n++) plan.push(index);
  }
  return plan.length === anzahl ? plan : null;
}

function laborUmbauPreis() {
  return typeof minionHilftBeimUmbau === 'function' && minionHilftBeimUmbau() ? 5 : 10;
}

function zeigeLaborUmbau() {
  const umbauen = document.getElementById('laborUmbauen');
  const preis = laborUmbauPreis();
  const bauKosten = planeVorratsAbzug(vorrat, preis);
  umbauen.disabled = laborAusgebaut || laborGesundheit !== 100 || angriffAktiv || angriffBeginn > 0 || !bauKosten;
  umbauen.textContent = laborAusgebaut ? '🏗️ Labor ausgebaut' : '🏗️ Labor umbauen · ' + preis + ' Items' + (preis === 5 ? ' · Minion hilft!' : '');
  document.getElementById('chemieOeffnen').hidden = !laborAusgebaut;
  document.getElementById('umbauHinweis').textContent = laborAusgebaut
    ? 'Chemielabor freigeschaltet! Ab Assistent kommen zwei Monster nacheinander. Zukunftstag und Lehrling bleiben ohne Angriffe.'
    : laborGesundheit < 100 ? 'Repariere dein Labor auf 100 %, um es umzubauen.'
    : angriffAktiv || angriffBeginn ? 'Beende zuerst den Monsterangriff. Danach kannst du umbauen.'
    : 'Umbau: Chemielabor und ab Assistent zwei Monster pro Angriff. ' + (bauKosten ? 'Diese ' + preis + ' Items werden verbaut: ' + bauKosten.map(teilName).join(', ') + '.' : 'Du brauchst ' + preis + ' normale Items; vorhanden: ' + vorrat.reduce(function(summe, menge) { return summe + menge; }, 0) + '.');
}

function baueLaborUm() {
  if (laborAusgebaut || laborGesundheit !== 100 || angriffAktiv || angriffBeginn) return;
  const preis = laborUmbauPreis();
  const bauKosten = planeVorratsAbzug(vorrat, preis);
  if (!bauKosten) return;
  for (const index of bauKosten) vorrat[index]--;
  laborAusgebaut = true;
  zeigeWerkstatt();
  if (preis === 5 && typeof zeigeMinionBauarbeit === 'function') {
    zeigeMinionBauarbeit(document.getElementById('umbauHinweis'), 'Dein Minion hilft beim Laborumbau!');
  }
}
document.getElementById('laborUmbauen').addEventListener('click', baueLaborUm);

function naechstesLaborMonster() {
  if (monsterInWelle < 1) return;
  const arten = monsterArten[zahlenMaximum];
  aktuellesMonster = arten[zufallszahl(0, arten.length - 1)];
  monsterLebt = true;
  angriffAktiv = true;
  monster.textContent = '👾';
  monster.setAttribute('aria-label', aktuellesMonster.name);
  monsterinfo.textContent = aktuellesMonster.name + ' · Schwäche: ' + aktuellesMonster.schwaeche;
  laborstatus.textContent = 'Noch ' + monsterInWelle + ' Monster! ' + aktuellesMonster.name + ' · Schwäche: ' + aktuellesMonster.schwaeche;
  weiter.textContent = 'Rückzug und nächste Runde';
}

// KAMPF: Nur eine gebaute und gewartete Maschine darf eingesetzt werden.
// Passende Stärke besiegt das Monster; eine falsche Wahl beschädigt das Labor.
function setzeMaschineEin(maschine) {
  if (!angriffAktiv || !monsterLebt || !gebauteMaschinen.includes(maschine) || abgenutzteMaschinen.has(maschine)) return;
  abgenutzteMaschinen.add(maschine);
  if (maschine.staerke === aktuellesMonster.schwaeche) {
    monsterLebt = false;
    monsterKills = monsterKills + 1;
    monsterZaehler.textContent = '👾 Besiegte Monster: ' + monsterKills;
    angriffAktiv = false;
    monster.textContent = '✨';
    monster.setAttribute('aria-label', 'Monster zerstört');
    monsterinfo.textContent = aktuellesMonster.name + ' besiegt! Schwäche: ' + aktuellesMonster.schwaeche;
    laborstatus.textContent = maschine.name + ' hat dein Labor gerettet!';
    weiter.textContent = 'Nächste Runde';
    monsterInWelle = Math.max(0, monsterInWelle - 1);
    naechstesLaborMonster();
  } else {
    monsterDurchbruch();
  }
  zeigeWerkstatt();
  bauinfo.textContent = laborstatus.textContent;
}

// WARTUNG: Ein Einsatz nutzt die Maschine ab. Ihr letztes Bauplanteil dient als Ersatzteil.
function warteMaschine(maschine) {
  const ersatzteil = maschine.teile[maschine.teile.length - 1];
  if (!gebauteMaschinen.includes(maschine) || !abgenutzteMaschinen.has(maschine) || anzahlTeil(ersatzteil) < 1) return;
  verbraucheBauteil(ersatzteil);
  abgenutzteMaschinen.delete(maschine);
  zeigeWerkstatt();
  bauinfo.textContent = maschine.name + ' ist geflickt und wieder einsatzbereit!';
}

function monsterDurchbruch(weiterAngreifen = true) {
  if (!angriffAktiv || !monsterLebt) return;
  if (laborGesundheit > 0) {
    const elefantHilft = typeof hatHaustier === 'function' && hatHaustier('elefant');
    const schaden = Math.min(laborGesundheit, elefantHilft ? 15 : 25);
    laborGesundheit = laborGesundheit - schaden;
    const plan = reparaturPlaene[zufallszahl(0, reparaturPlaene.length - 1)];
    baustellen.push({ name: plan.name, teile: plan.teile, reparatur: schaden });
    if (elefantHilft) meldeTier('🐘 Dein Elefant fängt einen Teil des Angriffs ab: nur 15 statt 25 Schaden!');
  }
  angriffAktiv = false;
  zeigeBaustellen();
  monster.textContent = '💥';
  monster.setAttribute('aria-label', 'Monster ist ins Labor eingebrochen');
  monsterinfo.textContent = aktuellesMonster.name + ' ist durchgebrochen! Schwäche: ' + aktuellesMonster.schwaeche;
  laborstatus.textContent = 'Labor beschädigt! Nächstes Mal muss die Maschinenstärke zur Schwäche passen.';
  weiter.textContent = 'Nächste Runde';
  monsterInWelle = Math.max(0, monsterInWelle - 1);
  if (weiterAngreifen) naechstesLaborMonster();
}

// Dieselben Reparaturen im Labor und in der Werkstatt anzeigen.
function zeigeBaustellen() {
  zeigeLaborUmbau();
  laborzustand.textContent = '🏠 Laborzustand: ' + laborGesundheit + ' / 100';
  laborzustand.classList.toggle('beschaedigt', laborGesundheit < 100);
  laborLeiste.value = laborGesundheit;
  laborLeiste.classList.toggle('beschaedigt', laborGesundheit < 100);
  for (const feld of baustellenFelder) {
    feld.hidden = baustellen.length === 0;
    feld.replaceChildren();
    if (feld.hidden) continue;
    const titel = document.createElement('h3');
    titel.textContent = '🚧 Baustellen – Labor reparieren';
    feld.appendChild(titel);
    for (const baustelle of baustellen) {
      const zeile = document.createElement('p');
      zeile.textContent = baustelle.name + ': ' + baustelle.teile.map(function(teil) { return '1 ' + items[teil]; }).join(' + ');
      const knopf = document.createElement('button');
      knopf.type = 'button';
      knopf.textContent = 'Items abgeben · +' + baustelle.reparatur + ' Laborzustand';
      knopf.disabled = !baustelle.teile.every(function(teil) { return vorrat[teil] >= 1; });
      knopf.addEventListener('click', function() { repariereLabor(baustelle); });
      feld.appendChild(zeile);
      feld.appendChild(knopf);
      const fehlendeTeile = baustelle.teile.filter(function(teil) { return vorrat[teil] < 1; });
      if (fehlendeTeile.length > 0) {
        const hinweis = document.createElement('p');
        hinweis.textContent = 'Fehlt: ' + fehlendeTeile.map(teilName).join(', ');
        feld.appendChild(hinweis);
      }
    }
  }
}

// Items werden genau einmal bezahlt. Danach verschwindet diese Baustelle.
function repariereLabor(baustelle) {
  const index = baustellen.indexOf(baustelle);
  if (index === -1 || !baustelle.teile.every(function(teil) { return vorrat[teil] >= 1; })) return;
  for (const teil of baustelle.teile) vorrat[teil] = vorrat[teil] - 1;
  laborGesundheit = Math.min(100, laborGesundheit + baustelle.reparatur);
  baustellen.splice(index, 1);
  zeigeWerkstatt();
}

// BELOHNUNG: Der normale volle Spielbalken gibt genau ein zufälliges Item.
function gewinneItem() {
  // Zukunftstag: Seil, Klopapierrolle, Zahnrad, Batterie oder Metallplatte.
  const lehrlingItems = [13, 0, 4, 2, 6];
  const index = zahlenMaximum === 10
    ? lehrlingItems[zufallszahl(0, lehrlingItems.length - 1)]
    : zufallszahl(0, items.length - 1);
  vorrat[index] = vorrat[index] + 1;
  belohnung.textContent = 'Gewonnen: ' + items[index] + '!';
  itemGewinn.textContent = '🎁 Balken voll! +1 ' + items[index] + ' – in deiner Sammlung!';
  itemGewinn.hidden = false;
  zeigeWerkstatt();
}

// Kleine SVG-Zeichnungen mit absichtlich unregelmässigen Stiftlinien.
const antwortFreude = document.createElement('div');
antwortFreude.className = 'antwortFreude';
antwortFreude.setAttribute('aria-hidden', 'true');
let freudeTimer;
function feiereRichtigeAntwort() {
  clearTimeout(freudeTimer);
  antwortFreude.replaceChildren();
  // Im offenen Dialog liegt die Freude ebenfalls über dem Spiel.
  const dialog = document.querySelector('dialog[open]');
  (dialog || document.body).appendChild(antwortFreude);
  const farben = ['#ffe16b', '#a7ecc1', '#ffbcbd', '#b9dcff', '#e4c1ff'];
  for (let i = 0; i < 30; i++) {
    const smiley = document.createElement('span');
    smiley.className = 'freudeSmiley';
    smiley.style.setProperty('--groesse', zufallszahl(32, 64) + 'px');
    smiley.style.setProperty('--drehung', zufallszahl(-22, 22) + 'deg');
    // Die Mitte bleibt frei für Aufgabe und Eingabe.
    smiley.style.left = (i % 2 ? zufallszahl(80, 93) : zufallszahl(1, 15)) + '%';
    smiley.style.top = zufallszahl(6, 90) + '%';
    smiley.style.animationDelay = zufallszahl(0, 200) + 'ms';
    const augen = i % 3 === 0
      ? '<path d="M19 24q4-5 8 0 M38 24q4-5 8 0"/>'
      : '<path d="M23 22l-1 5 M41 21l1 5"/>';
    smiley.innerHTML = '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><g stroke="#49352b" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round"><path fill="' + farben[i % farben.length] + '" d="M32 5C15 3 5 17 6 33S17 59 33 58 60 46 58 30 48 4 32 5Z"/><path fill="none" opacity=".3" d="M30 8C13 6 7 23 9 36S22 59 38 55"/><g fill="none">' + augen + '<path d="M18 36Q31 55 47 35"/></g></g></svg>';
    antwortFreude.appendChild(smiley);
  }
  const komplimente = [
    ['de', 'Toll gemacht!', '#8d3b76'], ['en', 'Well done!', '#266c97'],
    ['fr', 'Bravo !', '#387846'], ['it', 'Fantastico!', '#9c5320'],
    ['es', '¡Muy bien!', '#7746a2'], ['th', 'เยี่ยมมาก!', '#216e73']
  ];
  komplimente.forEach(function(eintrag, index) {
    const wort = document.createElement('span'); wort.className = 'freudeWort';
    wort.lang = eintrag[0]; wort.textContent = eintrag[1]; wort.style.color = eintrag[2];
    wort.style.left = (index % 2 ? 57 : 5) + '%';
    wort.style.top = [8, 8, 18, 18, 83, 83][index] + '%';
    wort.style.setProperty('--drehung', (index % 2 ? 5 : -5) + 'deg');
    antwortFreude.appendChild(wort);
  });
  freudeTimer = setTimeout(function() { antwortFreude.replaceChildren(); antwortFreude.remove(); }, 2800);
}

// KONFETTI: Kleine farbige HTML-Elemente fallen durch eine CSS-Animation nach unten.
function feiern() {
  clearTimeout(feierTimer);
  konfetti.replaceChildren();
  komplimente.hidden = false;
  const farben = ['royalblue', 'seagreen', 'orange', 'hotpink', 'rebeccapurple'];
  for (let i = 0; i < 60; i = i + 1) {
    const stueck = document.createElement('span');
    stueck.className = 'konfettistueck';
    stueck.style.left = zufallszahl(0, 99) + '%';
    stueck.style.background = farben[i % farben.length];
    stueck.style.animationDelay = Math.random() + 's';
    konfetti.appendChild(stueck);
  }
  feierTimer = setTimeout(function() {
    konfetti.replaceChildren();
  }, 4500);
}

function verliereItemsBeiLeeremBalken() {
  const verloren = [];
  for (let anzahl = 0; anzahl < 2; anzahl++) {
    const vorhanden = [];
    vorrat.forEach(function(menge, index) { if (menge > 0) vorhanden.push(index); });
    if (vorhanden.length === 0) break;
    const index = vorhanden[zufallszahl(0, vorhanden.length - 1)];
    vorrat[index]--;
    verloren.push(items[index]);
  }
  const hinweis = document.getElementById('itemVerlust');
  hinweis.hidden = false;
  hinweis.textContent = verloren.length
    ? 'Balken leer! Verloren: ' + verloren.join(' und ') + '.'
    : 'Balken leer! Du hast keine Items, die abgezogen werden können.';
  zeigeWerkstatt();
}

function zeigeLadung() {
  // Der Balken bleibt zwischen leer (0) und voll (100).
  if (ladung < 0) ladung = 0;
  if (ladung > 100) ladung = 100;
  // Ein leerer Balken kostet nur einmal Items, bis er wieder Ladung erhält.
  if (ladung > 0) leererBalkenBereitsGezaehlt = false;
  else if (!leererBalkenBereitsGezaehlt) {
    leererBalkenBereitsGezaehlt = true;
    verliereItemsBeiLeeremBalken();
  }
  // Der Farbverlauf bleibt fest. Wir zeigen nur den gefüllten Teil davon.
  fuellung.style.clipPath = 'inset(0 ' + (100 - ladung) + '% 0 0)';
  ladestand.textContent = 'Ladung: ' + ladung + ' %';
  ladebalken.setAttribute('aria-valuenow', ladung);
}

function zeigeFehlersaetze() {
  clearTimeout(hintergrundTimer);
  // Bei ungefähr jedem zweiten Fehler erscheint Thai.
  const ersterSatz = hintergrund.querySelector('span');
  if (Math.random() < 0.5) {
    ersterSatz.textContent = Math.random() < 0.5 ? 'ทำไม?' : 'ลองอีกครั้ง!';
    ersterSatz.lang = 'th';
  } else {
    ersterSatz.textContent = 'Why?';
    ersterSatz.lang = 'en';
  }
  hintergrund.hidden = false;
  hintergrundTimer = setTimeout(function() {
    hintergrund.hidden = true;
  }, 3000);
}

// Wähle eine ganze Zufallszahl zwischen min und max.
function zufallszahl(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// RECHENSPIEL: Zukunftstag bis 10, Lehrling bis 15, Assistent bis 20, Doktor bis 50,
// Professor bis 100 und Da Vinci bis 1 Million. Ergebnisse sind positiv und ganzzahlig.
function neueAufgabe() {
  hintergrund.hidden = true;
  komplimente.hidden = true;
  nummer = nummer + 1;
  let a;
  let b;
  let zeichen;

  // Zukunftstag wechselt zwischen zwei Rechenarten, die anderen zwischen vier.
  let anzahlRechenarten = 4;
  if (zahlenMaximum === 10) {
    anzahlRechenarten = 2;
  }
  const rechenart = (nummer - 1) % anzahlRechenarten;
  // Ab Assistent vermeiden wir die ganz kleinen Zahlen.
  const kleinsteZahl = zahlenMaximum === 10 ? 1 : zahlenMaximum === 15 ? 2 : 3;
  const kleinsterFaktor = zahlenMaximum === 15 ? 2 : zahlenMaximum === 20 ? 3 : 4;

  if (rechenart === 0) {
    const start = zahlenMaximum === 10 ? 1 : Math.floor(zahlenMaximum / 3);
    a = zufallszahl(start, zahlenMaximum - kleinsteZahl);
    b = zufallszahl(kleinsteZahl, zahlenMaximum - a);
    if (zahlenMaximum === 20 || zahlenMaximum === 50) {
      // Zwei Einerzahlen ergeben mehr als zehn; beim Doktor kommt ein Zehner dazu.
      a = zufallszahl(6, 9) + (zahlenMaximum === 50 ? zufallszahl(1, 3) * 10 : 0);
      b = zufallszahl(11 - a % 10, 9);
    }
    zeichen = '+';
    loesung = a + b;
  } else if (rechenart === 1) {
    const start = zahlenMaximum === 10 ? 2 : Math.ceil(zahlenMaximum / 2);
    a = zufallszahl(start, zahlenMaximum);
    b = zufallszahl(kleinsteZahl, a - kleinsteZahl);
    if (zahlenMaximum === 20 || zahlenMaximum === 50) {
      a = zufallszahl(11, 14) + (zahlenMaximum === 50 ? zufallszahl(1, 3) * 10 : 0);
      b = zufallszahl(a % 10 + 1, 9);
    }
    zeichen = '−';
    loesung = a - b;
  } else if (rechenart === 2) {
    a = zufallszahl(kleinsterFaktor, Math.floor(zahlenMaximum / kleinsterFaktor));
    b = zufallszahl(kleinsterFaktor, Math.floor(zahlenMaximum / a));
    zeichen = '×';
    loesung = a * b;
  } else {
    b = zufallszahl(kleinsterFaktor, Math.floor(zahlenMaximum / kleinsterFaktor));
    loesung = zufallszahl(kleinsterFaktor, Math.floor(zahlenMaximum / b));
    a = b * loesung;
    zeichen = '÷';
  }

  let aufgabenText = a + ' ' + zeichen + ' ' + b;
  if (zahlenMaximum === 50) {
    // Doktor: zwei Rechenschritte, das Ergebnis bleibt höchstens 50.
    if (rechenart === 0 || rechenart === 1) {
      a = zufallszahl(21, 35);
      b = zufallszahl(6, 14);
      const c = zufallszahl(3, 9);
      loesung = rechenart === 0 ? a + b - c : a - b + c;
      aufgabenText = rechenart === 0 ? a + ' + ' + b + ' − ' + c : a + ' − ' + b + ' + ' + c;
    } else {
      b = zufallszahl(4, 7);
      const faktor = zufallszahl(4, 6);
      const c = zufallszahl(3, 8);
      if (rechenart === 2) {
        loesung = faktor * b + c;
        aufgabenText = c + ' + ' + faktor + ' × ' + b;
      } else {
        loesung = faktor + c;
        aufgabenText = (faktor * b) + ' ÷ ' + b + ' + ' + c;
      }
    }
  } else if (zahlenMaximum === 100) {
    // Professor: Klammern und Punkt vor Strich im Zahlenraum bis 100.
    if (rechenart === 0) {
      a = zufallszahl(4, 9); b = zufallszahl(4, 9);
      const c = zufallszahl(3, 5);
      loesung = (a + b) * c;
      aufgabenText = '(' + a + ' + ' + b + ') × ' + c;
    } else if (rechenart === 1) {
      a = zufallszahl(65, 100); b = zufallszahl(16, 29);
      const c = zufallszahl(16, 29);
      loesung = a - (b + c);
      aufgabenText = a + ' − (' + b + ' + ' + c + ')';
    } else if (rechenart === 2) {
      a = zufallszahl(6, 9); b = zufallszahl(6, 9);
      const c = zufallszahl(13, 29);
      loesung = a * b - c;
      aufgabenText = a + ' × ' + b + ' − ' + c;
    } else {
      b = zufallszahl(4, 9);
      const quotient = zufallszahl(5, 9);
      const c = zufallszahl(24, 70);
      loesung = c + quotient;
      aufgabenText = c + ' + ' + (b * quotient) + ' ÷ ' + b;
    }
  } else if (zahlenMaximum === 1000000) {
    // Da Vinci: drei Rechenschritte mit Klammern und grossen Zahlen.
    if (rechenart === 0) {
      a = zufallszahl(1200, 9000); b = zufallszahl(1200, 9000);
      const c = zufallszahl(12, 45), d = zufallszahl(1000, 9000);
      loesung = (a + b) * c - d;
      aufgabenText = '(' + a + ' + ' + b + ') × ' + c + ' − ' + d;
    } else if (rechenart === 1) {
      a = zufallszahl(600000, 1000000); b = zufallszahl(110000, 250000);
      const c = zufallszahl(110000, 250000), d = zufallszahl(1000, 9000);
      loesung = a - (b + c) + d;
      aufgabenText = a + ' − (' + b + ' + ' + c + ') + ' + d;
    } else if (rechenart === 2) {
      a = zufallszahl(120, 850); b = zufallszahl(120, 850);
      const teiler = zufallszahl(12, 45), quotient = zufallszahl(120, 950);
      loesung = a * b + quotient;
      aufgabenText = a + ' × ' + b + ' + ' + (teiler * quotient) + ' ÷ ' + teiler;
    } else {
      b = zufallszahl(12, 45);
      const quotient = zufallszahl(1200, 9000);
      const c = zufallszahl(1000, 9000), d = zufallszahl(12, 45);
      loesung = quotient + d;
      aufgabenText = '(' + (b * quotient + c) + ' − ' + c + ') ÷ ' + b + ' + ' + d;
    }
  }
  stand.textContent = 'Aufgabe ' + nummer + ' von ' + anzahlAufgaben + ' | Punkte: ' + punkte;
  aufgabe.textContent = aufgabenText + ' = ?';
  antwort.value = '';
  antwort.disabled = false;
  pruefen.disabled = false;
  meldung.textContent = '';
  weiter.hidden = true;
  antwort.focus();
  letzteRechenAktivitaet = Date.now();
  if (typeof zeigeTierTipp === 'function') zeigeTierTipp();
}

formular.addEventListener('submit', function(event) {
  event.preventDefault();
  if (antwort.disabled) return;
  merkeRechenAktivitaet();

  if (Number(antwort.value) === loesung) {
    feiereRichtigeAntwort();
    const vorherigeLadung = ladung;
    ladung = ladung + 10;
    zeigeLadung();
    if (vorherigeLadung < 100 && ladung === 100) {
      feiern();
      gewinneItem();
    }
    hintergrund.hidden = true;
    punkte = punkte + 1;
    const essen = gewinneEssen();
    meldung.textContent = 'Richtig! Ein Punkt und ' + essen + ' für dich.';
    antwort.disabled = true;
    pruefen.disabled = true;
    stand.textContent = 'Aufgabe ' + nummer + ' von ' + anzahlAufgaben + ' | Punkte: ' + punkte;
    weiter.hidden = false;
    weiter.textContent = 'Nächste Aufgabe';
    weiter.focus();
    if (nummer === anzahlAufgaben) {
      weiter.hidden = true;
      aufgabenTimer = setTimeout(naechsterSchritt, 2000);
    }
  } else {
    ladung = ladung - 10;
    zeigeLadung();
    zeigeFehlersaetze();
    meldung.textContent = 'Die richtige Antwort ist ' + loesung + '. Gleich geht es weiter!';
    antwort.disabled = true;
    pruefen.disabled = true;
    aufgabenTimer = setTimeout(naechsterSchritt, 2000);
  }
});

// Nach fünf Aufgaben folgt das Rundenende; sonst wird die nächste Aufgabe erzeugt.
function naechsterSchritt() {
  if (nummer === anzahlAufgaben) {
    // Nur eine vollständig beendete normale Runde zählt für die nächste Stufe.
    abgeschlosseneRunden[zahlenMaximum]++;
    zeigeStufenFortschritt();
    // Ein beendetes normales Level schaltet das Minispiel für diese Sitzung frei.
    schalteMiniLevelFrei();
    const essen = gewinneEssen();
    const angriffKommt = zahlenMaximum >= 20;
    monsterInWelle = angriffKommt ? (laborAusgebaut ? 2 : 1) : 0;
    angriffAktiv = false;
    angriffBeginn = angriffKommt ? Date.now() + 30000 : 0;
    zumStart.textContent = angriffKommt ? 'Rückzug zum Start' : 'Zurück zum Start';
    laborstatus.textContent = angriffKommt
      ? monsterInWelle + ' Monster in 30 Sekunden! Bereite deine Maschinen vor.'
      : 'Runde geschafft – auf dieser Stufe gibt es keine Monsterangriffe.';
    if (angriffKommt && typeof warneMitHuhn === 'function') warneMitHuhn();
    zeigeWerkstatt();
    hintergrund.hidden = true;
    aufgabe.textContent = angriffKommt ? 'Angriff in 30 Sekunden' : 'Runde geschafft!';
    meldung.textContent = 'Du hast ' + punkte + ' von ' + anzahlAufgaben + ' Punkten gesammelt. Rundenbonus: ' + essen + '!';
    formular.hidden = true;
    weiter.textContent = angriffKommt ? 'Rückzug und nächste Runde' : 'Nächste Runde';
    weiter.hidden = false;
    weiter.focus();
    nummer = 0;
    punkte = 0;
  } else {
    if (nummer === 0) {
      zurueckZumStart();
      return;
    }
    formular.hidden = false;
    neueAufgabe();
  }
}

weiter.addEventListener('click', naechsterSchritt);
zumStart.addEventListener('click', zurueckZumStart);

// Alle wartenden Runden-Timer stoppen. Sammlung und Laborschäden behalten.
// Während eines Angriffs bedeutet Verlassen einen Rückzug mit Schaden.
function zurueckZumStart() {
  clearTimeout(aufgabenTimer);
  clearTimeout(hintergrundTimer);
  clearTimeout(feierTimer);
  if (angriffBeginn) angriffAktiv = true;
  angriffBeginn = 0;
  if (angriffAktiv && monsterLebt) {
    do {
      angriffAktiv = true;
      monsterDurchbruch(false);
    } while (monsterInWelle > 0);
  }
  monsterInWelle = 0;
  angriffAktiv = false;
  rundeAktiv = false;
  nummer = 0;
  punkte = 0;
  hintergrund.hidden = true;
  konfetti.replaceChildren();
  spiel.hidden = true;
  startmenue.hidden = false;
  zeigeWerkstatt();
  schwierigkeit.focus();
}

startmenue.addEventListener('submit', function(event) {
  event.preventDefault();
  const ausgewaehlteStufe = Number(schwierigkeit.value);
  if (!istStufeOffen(ausgewaehlteStufe)) {
    zeigeStufenFortschritt();
    schwierigkeit.focus();
    return;
  }
  zahlenMaximum = ausgewaehlteStufe;
  zumStart.textContent = 'Zurück zum Start';
  zeigeZusatzZugang();
  monsterLebt = true;
  angriffBeginn = 0;
  angriffAktiv = false;
  rundeAktiv = true;
  monster.textContent = '👾';
  let monsterGroesse = 32;
  const auswahl = monsterArten[zahlenMaximum];
  aktuellesMonster = auswahl[zufallszahl(0, auswahl.length - 1)];
  if (zahlenMaximum === 20) {
    monsterGroesse = 48;
  } else if (zahlenMaximum === 50) {
    monsterGroesse = 56;
  } else if (zahlenMaximum === 100) {
    monsterGroesse = 64;
  } else if (zahlenMaximum === 1000000) {
    monsterGroesse = 80;
  }
  monster.style.fontSize = monsterGroesse + 'px';
  monster.setAttribute('aria-label', aktuellesMonster.name);
  monsterinfo.textContent = aktuellesMonster.name + ' · Schwäche: ' + aktuellesMonster.schwaeche + ' · Angriff nach Aufgabe 5';
  if (zahlenMaximum < 20) {
    monster.textContent = '🏠';
    monster.setAttribute('aria-label', 'Labor ohne Monsterangriff');
    monsterinfo.textContent = 'Keine Monsterangriffe auf dieser Stufe.';
  }
  laborstatus.textContent = '';
  zeigeWerkstatt();
  stufeninfo.textContent = schwierigkeit.options[schwierigkeit.selectedIndex].textContent;
  antwort.max = zahlenMaximum;
  nummer = 0;
  punkte = 0;
  ladung = 50;
  document.getElementById('itemVerlust').hidden = true;
  itemGewinn.hidden = true;
  zeigeLadung();
  startmenue.hidden = true;
  spiel.hidden = false;
  formular.hidden = false;
  neueAufgabe();
});
zeigeWerkstatt();
zeigeEssensVorrat();
zeigeStufenFortschritt();

// Drei eigene Melodien. 0 bedeutet eine Pause.
const musikStuecke = {
  rechnen: {
    melodie: [72, 0, 76, 79, 0, 76, 74, 0, 71, 0, 74, 79, 0, 74, 72, 0,
      69, 0, 72, 76, 0, 79, 76, 0, 67, 0, 71, 74, 0, 71, 72, 0],
    bass: [48, 43, 45, 43], tempo: 0.3, klang: 'triangle', laut: 0.16
  },
  werkstatt: {
    melodie: [64, 0, 0, 67, 0, 71, 0, 0, 62, 0, 0, 66, 0, 69, 0, 0,
      60, 0, 0, 64, 0, 67, 0, 0, 62, 0, 0, 67, 0, 66, 64, 0],
    bass: [40, 38, 36, 38], tempo: 0.42, klang: 'sine', laut: 0.19
  },
  angriff: {
    melodie: [57, 64, 69, 64, 57, 64, 72, 71, 57, 64, 69, 64, 57, 64, 71, 72,
      53, 60, 65, 60, 53, 60, 69, 68, 52, 59, 64, 59, 52, 59, 68, 0],
    bass: [33, 33, 29, 28], tempo: 0.19, klang: 'triangle', laut: 0.15
  }
};
const zweiteOption = {
  rechnen: musikStuecke.rechnen,
  werkstatt: {
    melodie: [76, 0, 0, 0, 83, 0, 0, 79, 0, 0, 74, 0, 0, 0, 78, 0,
      72, 0, 0, 0, 79, 0, 0, 76, 0, 0, 74, 0, 0, 71, 0, 0],
    bass: [40, 38, 36, 43], tempo: 0.55, klang: 'sine', laut: 0.16,
    akkorde: [[52, 59, 66], [50, 57, 64], [48, 55, 62], [55, 62, 69]],
    ambient: true
  },
  angriff: {
    melodie: [57, 0, 64, 69, 72, 0, 71, 69, 65, 0, 72, 77, 76, 0, 72, 69,
      60, 0, 67, 72, 76, 0, 74, 72, 64, 0, 68, 71, 76, 74, 71, 68],
    bass: [33, 29, 36, 28], tempo: 0.22, klang: 'triangle', laut: 0.18,
    akkorde: [[45, 52, 57], [41, 48, 53], [48, 55, 60], [40, 47, 56]],
    episch: true
  }
};
// Poppige Melodien mit vier Akkorden und einem regelmässigen Beat.
const dritteOption = {
  rechnen: {
    melodie: [76, 76, 0, 79, 81, 79, 76, 0, 74, 74, 0, 79, 83, 81, 79, 0,
      76, 76, 0, 81, 84, 83, 81, 0, 77, 76, 74, 72, 74, 76, 72, 0],
    bass: [48, 43, 45, 41], tempo: 0.25, klang: 'triangle', laut: 0.15,
    akkorde: [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]], pop: true
  },
  werkstatt: {
    melodie: [72, 0, 76, 0, 79, 76, 0, 74, 71, 0, 74, 0, 79, 74, 0, 71,
      69, 0, 72, 0, 76, 72, 0, 69, 65, 0, 69, 72, 0, 69, 67, 0],
    bass: [48, 43, 45, 41], tempo: 0.32, klang: 'sine', laut: 0.17,
    akkorde: [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]], pop: true
  },
  angriff: {
    melodie: [69, 69, 72, 76, 0, 76, 74, 72, 65, 65, 69, 72, 0, 72, 74, 76,
      72, 72, 76, 79, 0, 79, 76, 74, 67, 71, 74, 79, 81, 79, 74, 71],
    bass: [45, 41, 48, 43], tempo: 0.2, klang: 'triangle', laut: 0.16,
    akkorde: [[57, 60, 64], [53, 57, 60], [60, 64, 67], [55, 59, 62]], pop: true
  }
};
// Eigene Ambient-Stücke: viel Platz zwischen den Tönen, sanfte Flächen und Echos.
const vierteOption = {
  rechnen: {
    melodie: [74, 0, 0, 81, 0, 78, 0, 0, 0, 76, 0, 0, 73, 0, 0, 69,
      71, 0, 0, 78, 0, 74, 0, 0, 0, 73, 0, 76, 0, 69, 0, 0],
    bass: [38, 45, 43, 40], tempo: 0.56, klang: 'sine', laut: 0.13,
    akkorde: [[50, 57, 64], [57, 61, 68], [55, 62, 69], [52, 59, 66]],
    ambient: true, echo: true
  },
  werkstatt: {
    melodie: [78, 0, 0, 0, 0, 73, 0, 0, 81, 0, 0, 76, 0, 0, 0, 0,
      74, 0, 0, 0, 0, 69, 0, 0, 76, 0, 0, 73, 0, 0, 71, 0],
    bass: [42, 38, 45, 40], tempo: 0.68, klang: 'sine', laut: 0.12,
    akkorde: [[54, 61, 68], [50, 57, 64], [57, 64, 71], [52, 59, 66]],
    ambient: true, echo: true
  },
  angriff: {
    melodie: [62, 0, 69, 0, 65, 0, 0, 64, 61, 0, 68, 0, 64, 0, 0, 0,
      60, 0, 67, 0, 63, 0, 0, 62, 57, 0, 64, 0, 61, 0, 0, 0],
    bass: [38, 37, 36, 33], tempo: 0.34, klang: 'triangle', laut: 0.13,
    akkorde: [[50, 57, 65], [49, 56, 64], [48, 55, 63], [45, 52, 61]],
    ambient: true, echo: true, puls: true
  }
};
const soundtrack = document.getElementById('soundtrack');
let aktuellesMusikStueck = '';
const aktiveToene = new Set();
const musikKnopf = document.getElementById('musikKnopf');
let audioKontext;
let musikLautstaerke;
let musikTimer;
let musikAn = false;
let musikSchritt = 0;
let naechsterTon = 0;

function spieleTon(note, zeit, dauer, lautstaerke, klang, anschlag = 0.025) {
  const ton = audioKontext.createOscillator();
  const huelle = audioKontext.createGain();
  ton.type = klang;
  ton.frequency.value = 440 * Math.pow(2, (note - 69) / 12);
  huelle.gain.setValueAtTime(0, zeit);
  huelle.gain.linearRampToValueAtTime(lautstaerke, zeit + anschlag);
  huelle.gain.exponentialRampToValueAtTime(0.001, zeit + dauer);
  ton.connect(huelle);
  huelle.connect(musikLautstaerke);
  const stimme = { ton: ton, huelle: huelle };
  aktiveToene.add(stimme);
  ton.onended = function() { aktiveToene.delete(stimme); ton.disconnect(); huelle.disconnect(); };
  ton.start(zeit);
  ton.stop(zeit + dauer + 0.03);
}

function blendeToeneAus() {
  for (const stimme of aktiveToene) {
    stimme.huelle.gain.cancelScheduledValues(audioKontext.currentTime);
    stimme.huelle.gain.setTargetAtTime(0, audioKontext.currentTime, 0.02);
    stimme.ton.stop(audioKontext.currentTime + 0.1);
  }
}

function planeMusik() {
  if (!musikAn || document.hidden) return;
  // In der geöffneten Werkstatt hat die Werkstattmusik Vorrang.
  const bereich = werkstatt.open || kueche.open || document.getElementById('haustierZimmer').open ? 'werkstatt' : zusatz.open ? 'rechnen' : angriffAktiv ? 'angriff' : 'rechnen';
  // Nur die zweite Option behält die ursprüngliche Start- und Rechenmusik.
  const auswahl = bereich === 'rechnen' && soundtrack.value === 'zweite' ? 'original' : soundtrack.value;
  const musikName = auswahl + '-' + bereich;
  if (aktuellesMusikStueck !== musikName) {
    blendeToeneAus();
    aktuellesMusikStueck = musikName;
    musikSchritt = 0;
    naechsterTon = audioKontext.currentTime + 0.05;
  }
  const soundtracks = { original: musikStuecke, zweite: zweiteOption, dritte: dritteOption, vierte: vierteOption };
  const stueck = soundtracks[auswahl][bereich];
  if (naechsterTon < audioKontext.currentTime) naechsterTon = audioKontext.currentTime + 0.05;
  while (naechsterTon < audioKontext.currentTime + 0.15) {
    const note = stueck.melodie[musikSchritt];
    if (note !== 0) spieleTon(note, naechsterTon, stueck.ambient ? 1.8 : stueck.tempo * 0.9, stueck.laut, stueck.klang);
    if (note !== 0 && stueck.echo) {
      // Ein leiser Oberton und zwei ausklingende Wiederholungen schaffen Raum.
      spieleTon(note + 12, naechsterTon, 0.8, 0.018, 'sine');
      spieleTon(note, naechsterTon + 0.35, 1.4, 0.035, 'sine');
      spieleTon(note, naechsterTon + 0.7, 1.6, 0.015, 'sine');
    }
    if (stueck.puls && musikSchritt % 2 === 0) {
      spieleTon(26, naechsterTon, 0.22, 0.12, 'sine', 0.04);
    }
    if (musikSchritt % 4 === 0) {
      spieleTon(stueck.bass[Math.floor(musikSchritt / 8)], naechsterTon, stueck.tempo * 2, stueck.ambient ? 0.12 : 0.22, 'sine');
    }
    if (stueck.akkorde && musikSchritt % 8 === 0) {
      for (const akkordTon of stueck.akkorde[Math.floor(musikSchritt / 8)]) {
        spieleTon(akkordTon, naechsterTon, stueck.ambient ? 4 : 1.5, 0.055, stueck.ambient ? 'sine' : 'triangle', stueck.ambient ? 0.6 : 0.08);
      }
    }
    if (stueck.episch && musikSchritt % 2 === 0) {
      // Kurze tiefe Töne geben dem Angriff einen Trommelrhythmus.
      spieleTon(musikSchritt % 4 === 0 ? 26 : 38, naechsterTon, 0.16, 0.24, 'sine', 0.008);
    }
    if (stueck.pop) {
      // Helle kurze Ticks und abwechselnd tiefe/hohe Trommeltöne.
      spieleTon(102, naechsterTon, 0.045, 0.025, 'triangle', 0.005);
      if (musikSchritt % 2 === 0) {
        spieleTon(musikSchritt % 4 === 0 ? 28 : 50, naechsterTon, 0.13, 0.16, 'sine', 0.005);
      }
      if (musikSchritt % 8 === 3 || musikSchritt % 8 === 6) {
        for (const akkordTon of stueck.akkorde[Math.floor(musikSchritt / 8)]) {
          spieleTon(akkordTon, naechsterTon, 0.16, 0.04, 'triangle');
        }
      }
    }
    musikSchritt = (musikSchritt + 1) % stueck.melodie.length;
    naechsterTon = naechsterTon + stueck.tempo;
  }
}

musikKnopf.addEventListener('click', async function() {
  if (musikAn) {
    musikAn = false;
    clearInterval(musikTimer);
    blendeToeneAus();
    musikLautstaerke.gain.setTargetAtTime(0, audioKontext.currentTime, 0.03);
    musikKnopf.textContent = '♫ Musik an';
    musikKnopf.setAttribute('aria-pressed', 'false');
    return;
  }
  musikKnopf.disabled = true;
  try {
    if (!audioKontext) {
      audioKontext = new AudioContext();
      musikLautstaerke = audioKontext.createGain();
      musikLautstaerke.gain.value = 0;
      musikLautstaerke.connect(audioKontext.destination);
    }
    await audioKontext.resume();
    musikAn = true;
    aktuellesMusikStueck = '';
    musikSchritt = 0;
    naechsterTon = audioKontext.currentTime + 0.05;
    musikLautstaerke.gain.setTargetAtTime(0.25, audioKontext.currentTime, 0.08);
    musikKnopf.textContent = '♫ Musik aus';
    musikKnopf.setAttribute('aria-pressed', 'true');
    planeMusik();
    musikTimer = setInterval(planeMusik, 100);
  } catch (fehler) {
    musikKnopf.textContent = 'Musik erneut starten';
  }
  musikKnopf.disabled = false;
});

document.addEventListener('visibilitychange', function() {
  if (!audioKontext || !musikAn) return;
  musikLautstaerke.gain.setTargetAtTime(document.hidden ? 0 : 0.25, audioKontext.currentTime, 0.03);
  if (!document.hidden) naechsterTon = audioKontext.currentTime + 0.05;
});
soundtrack.addEventListener('change', function() {
  if (musikAn) planeMusik();
});

// Solange eine Antwort aussteht, sinkt die Ladung alle fünf Sekunden um fünf Punkte.
// Solange eine Antwort aussteht, sinkt die Ladung alle fünf Sekunden um fünf Punkte.
// Solange eine Antwort aussteht, sinkt die Ladung alle fünf Sekunden um fünf Punkte.
// Solange eine Antwort aussteht, sinkt die Ladung alle fünf Sekunden um fünf Punkte.
// Solange eine Antwort aussteht, sinkt die Ladung alle fünf Sekunden um fünf Punkte.
// Solange eine Antwort aussteht, sinkt die Ladung alle fünf Sekunden um fünf Punkte.
// Solange eine Antwort aussteht, sinkt die Ladung alle fünf Sekunden um fünf Punkte.
// Solange eine Antwort aussteht, sinkt die Ladung alle fünf Sekunden um fünf Punkte.
// Solange eine Antwort aussteht, sinkt die Ladung alle fünf Sekunden um fünf Punkte.
// Solange eine Antwort aussteht, sinkt die Ladung alle fünf Sekunden um fünf Punkte.
// Solange eine Antwort aussteht, sinkt die Ladung alle fünf Sekunden um fünf Punkte.
// Solange eine Antwort aussteht, sinkt die Ladung alle fünf Sekunden um fünf Punkte.
// Solange eine Antwort aussteht, sinkt die Ladung alle fünf Sekunden um fünf Punkte.
// Solange eine Antwort aussteht, sinkt die Ladung alle fünf Sekunden um fünf Punkte.
// Solange eine Antwort aussteht, sinkt die Ladung alle fünf Sekunden um fünf Punkte.
// Solange eine Antwort aussteht, sinkt die Ladung alle fünf Sekunden um fünf Punkte.
// Solange eine Antwort aussteht, sinkt die Ladung alle fünf Sekunden um fünf Punkte.
// Solange eine Antwort aussteht, sinkt die Ladung alle fünf Sekunden um fünf Punkte.
// Solange eine Antwort aussteht, sinkt die Ladung alle fünf Sekunden um fünf Punkte.
// Solange eine Antwort aussteht, sinkt die Ladung alle fünf Sekunden um fünf Punkte.
// Solange eine Antwort aussteht, sinkt die Ladung alle fünf Sekunden um fünf Punkte.
// Solange eine Antwort aussteht, sinkt die Ladung alle fünf Sekunden um fünf Punkte.
// Nach jeweils fünf untätigen Sekunden sinkt die Ladung um fünf Punkte.
let letzteRechenAktivitaet = Date.now();
function merkeRechenAktivitaet() {
  letzteRechenAktivitaet = Date.now();
}
function pruefeRechenUntatigkeit() {
  const jetzt = Date.now();
  const pausiert = !rundeAktiv || spiel.hidden || formular.hidden || antwort.disabled;
  if (pausiert) {
    letzteRechenAktivitaet = jetzt;
    return;
  }
  const schritte = Math.floor((jetzt - letzteRechenAktivitaet) / 5000);
  if (schritte > 0) {
    ladung = Math.max(0, ladung - schritte * 5);
    letzteRechenAktivitaet += schritte * 5000;
    zeigeLadung();
  }
}
setInterval(pruefeRechenUntatigkeit, 250);

// MONSTERSCHLEUDER: eigenständige kleine Spielrunde ohne Materialkosten.
const minispielOeffnen = document.getElementById('minispielOeffnen');
const monsterMinispiel = document.getElementById('monsterMinispiel');
const schleuderFeld = document.getElementById('schleuderFeld');
const schleuderStatus = document.getElementById('schleuderStatus');
const schleuderSchuss = document.getElementById('schleuderSchuss');
let minispielFreigeschaltet = false;
// Jedes Level beschreibt seine Schüsse, Monster und Bauwerke.
// x und y geben die Position im Spielfeld an, breite und hoehe die Grösse.
const miniLevelNamen = ['Monster-Aussenposten', 'Monsterturm', 'Monsterstadt', 'Monsterburg', 'Monsterwald'];
const miniLevels = [
  { thema: 'posten', schuesse: 5, monster: [[440, 350], [610, 175]],
    bauten: [{ x: 540, breite: 140, hoehe: 175 }] },
  { thema: 'turm', schuesse: 6, monster: [[440, 350], [610, 95], [770, 350]],
    bauten: [{ x: 560, breite: 100, hoehe: 255 }, { x: 675, breite: 70, hoehe: 135 }] },
  { thema: 'stadt', schuesse: 7, monster: [[440, 205], [525, 350], [610, 155], [770, 235]],
    bauten: [{ x: 395, breite: 90, hoehe: 145 }, { x: 565, breite: 90, hoehe: 195 }, { x: 725, breite: 90, hoehe: 115 }] },
  { thema: 'burg', schuesse: 7, monster: [[440, 115], [525, 350], [610, 215], [695, 350], [770, 115]],
    bauten: [{ x: 395, breite: 90, hoehe: 235 }, { x: 550, breite: 120, hoehe: 135 }, { x: 725, breite: 90, hoehe: 235 }] },
  { thema: 'wald', schuesse: 8, monster: [[350, 350], [440, 245], [525, 350], [610, 185], [690, 350], [770, 275]],
    bauten: [{ x: 405, breite: 70, hoehe: 105 }, { x: 575, breite: 70, hoehe: 165 }, { x: 735, breite: 70, hoehe: 75 }] }
];
const schleuderLevel = document.getElementById('schleuderLevel');
let miniLevelNummer = 0;
let hoechstesMiniLevel = -1;
const geschaffteMiniLevels = new Set();
const miniWeiterRechnen = document.getElementById('miniWeiterRechnen');

function schalteMiniLevelFrei() {
  let auswahl = schleuderLevel.value;
  // Erst ein Schleuderlevel schaffen, dann durch Rechnen das nächste öffnen.
  if (hoechstesMiniLevel < 0 || geschaffteMiniLevels.has(hoechstesMiniLevel)) {
    hoechstesMiniLevel++;
    if (hoechstesMiniLevel >= miniLevels.length) {
      miniLevels.push(erstelleWeiteresMiniLevel(hoechstesMiniLevel));
    }
    auswahl = String(hoechstesMiniLevel);
  }
  minispielFreigeschaltet = true;
  document.getElementById('monsterburgenModus').disabled = false;
  document.getElementById('monsterburgenModus').textContent = 'Monsterburgen';
  minispielOeffnen.disabled = false;
  minispielOeffnen.textContent = '🎯 Monsterschleuder – Level ' + (hoechstesMiniLevel + 1);
  zeigeMiniLevelAuswahl(auswahl);
}

function zeigeMiniLevelAuswahl(auswahl) {
  const deutsch = istDeutschModus();
  schleuderLevel.replaceChildren();
  const levels = deutsch ? miniLevels.slice(0, 5) : miniLevels;
  levels.forEach(function(level, index) {
    const option = document.createElement('option');
    option.value = index;
    option.disabled = !deutsch && index > hoechstesMiniLevel;
    option.textContent = (index + 1) + ' · ' + (miniLevelNamen[index] || 'Neue Monsterburg') + (option.disabled ? ' 🔒' : '');
    schleuderLevel.appendChild(option);
  });
  const maximum = deutsch ? 4 : Math.max(0, hoechstesMiniLevel);
  schleuderLevel.value = String(Math.max(0, Math.min(Number(auswahl) || 0, maximum)));
  schleuderLevel.disabled = false;
}

function erstelleWeiteresMiniLevel(nummer) {
  const bauten = [];
  const monster = [];
  // Jede neue Burg erhält andere Turmhöhen und Abstände.
  for (let turm = 0; turm < 4; turm++) {
    const x = 390 + turm * 105 + (nummer % 3) * 5;
    const hoehe = 110 + ((nummer * 37 + turm * 53) % 150);
    const breite = 75 + ((nummer + turm) % 3) * 8;
    bauten.push({ x: x, breite: breite, hoehe: hoehe });
    monster.push([x + breite / 2, 375 - hoehe - 25]);
  }
  return { schuesse: 6, monster: monster, bauten: bauten };
}

const schleuderModus = document.getElementById('schleuderModus');
const deutschSaetze = [
  { satz: 'Der hund schläft.', korrekt: 'Der Hund schläft.', antworten: ['hund → Hund', 'Der → der', 'schläft → schläftt', 'hund → Hunde', 'schläft → schlafen', 'Der → Die'] },
  { satz: 'Ich habe ein Buch gelest.', korrekt: 'Ich habe ein Buch gelesen.', antworten: ['gelest → gelesen', 'Buch → buch', 'habe → haben', 'Ich → ich', 'ein → eine', 'gelest → gelesst'] },
  { satz: 'Die Kinder spielt draussen.', korrekt: 'Die Kinder spielen draussen.', antworten: ['spielt → spielen', 'Kinder → kinder', 'Die → Das', 'spielt → spielst', 'draussen → Draussen', 'Kinder → Kindes'] },
  { satz: 'Wir gehen morgen ins kino.', korrekt: 'Wir gehen morgen ins Kino.', antworten: ['kino → Kino', 'gehen → geht', 'morgen → morgenn', 'Wir → wir', 'ins → in den', 'kino → Kinos'] },
  { satz: 'Du hat einen roten Ball.', korrekt: 'Du hast einen roten Ball.', antworten: ['hat → hast', 'Ball → ball', 'roten → rotem', 'Du → du', 'einen → einem', 'hat → haben'] },
  { satz: 'Meine Schwester liest ein buch.', korrekt: 'Meine Schwester liest ein Buch.', antworten: ['buch → Buch', 'liest → lesen', 'Meine → Mein', 'Schwester → schwester', 'ein → einen', 'liest → liehst'] },
  { satz: 'Das Auto haben vier Räder.', korrekt: 'Das Auto hat vier Räder.', antworten: ['haben → hat', 'vier → fier', 'Räder → räder', 'Auto → auto', 'Das → Der', 'haben → hast'] },
  { satz: 'Ich freue mich auf die ferien.', korrekt: 'Ich freue mich auf die Ferien.', antworten: ['ferien → Ferien', 'mich → mir', 'freue → freut', 'Ich → ich', 'auf → auff', 'die → das'] },
  { satz: 'Der Vogel singt ein Liedd.', korrekt: 'Der Vogel singt ein Lied.', antworten: ['Liedd → Lied', 'singt → singen', 'Vogel → vogel', 'Der → der', 'ein → eine', 'singt → sinkt'] },
  { satz: 'Wir sind gestern geschwimmt.', korrekt: 'Wir sind gestern geschwommen.', antworten: ['geschwimmt → geschwommen', 'Wir → wir', 'sind → ist', 'gestern → Gestern', 'sind → seid', 'geschwimmt → geschwimpt'] },
  { satz: 'Auf dem Tisch liegt ein apfel.', korrekt: 'Auf dem Tisch liegt ein Apfel.', antworten: ['apfel → Apfel', 'liegt → liegen', 'Tisch → tisch', 'Auf → auf', 'dem → den', 'ein → einem'] },
  { satz: 'Ihr kommt heute zu spet.', korrekt: 'Ihr kommt heute zu spät.', antworten: ['spet → spät', 'kommt → kommen', 'heute → Heute', 'Ihr → ihr', 'zu → zuh', 'kommt → komst'] }
];
let deutschAufgabe = null;
let letzteDeutschAufgabe = -1;
let deutschGewonnen = false;
let deutschRueckmeldung = '';

function istDeutschModus() { return schleuderModus.value === 'deutsch'; }
function miniRundeGewonnen() {
  return istDeutschModus() ? deutschGewonnen : miniMonster.length > 0 && miniMonster.every(function(m) { return !m.lebt; });
}
function starteDeutschAufgabe() {
  let index = zufallszahl(0, deutschSaetze.length - 2);
  if (index >= letzteDeutschAufgabe && letzteDeutschAufgabe >= 0) index++;
  letzteDeutschAufgabe = index;
  deutschAufgabe = deutschSaetze[index];
  deutschGewonnen = false;
  deutschRueckmeldung = '';
  const anzahl = miniLevels[miniLevelNummer].monster.length;
  const falscheAntworten = deutschAufgabe.antworten.slice(1);
  for (let i = falscheAntworten.length - 1; i > 0; i--) {
    const j = zufallszahl(0, i); [falscheAntworten[i], falscheAntworten[j]] = [falscheAntworten[j], falscheAntworten[i]];
  }
  // Die richtige Korrektur ist immer dabei, egal wie viele Monster auftreten.
  const antworten = [deutschAufgabe.antworten[0], ...falscheAntworten.slice(0, anzahl - 1)].map(function(text, i) { return { text: text, richtig: i === 0 }; });
  for (let i = antworten.length - 1; i > 0; i--) {
    const j = zufallszahl(0, i); [antworten[i], antworten[j]] = [antworten[j], antworten[i]];
  }
  miniMonster = antworten.map(function(antwort, i) {
    return { x: miniLevels[miniLevelNummer].monster[i][0], y: miniLevels[miniLevelNummer].monster[i][1], lebt: true, korrektur: antwort.text, richtig: antwort.richtig };
  });
  miniSchuesse = miniLevels[miniLevelNummer].schuesse;
  document.getElementById('deutschSatz').textContent = 'Finde den Fehler: «' + deutschAufgabe.satz + '»';
  document.getElementById('deutschAntworten').textContent = miniMonster.map(function(m, i) { return 'Monster ' + (i + 1) + ': ' + m.korrektur; }).join(' · ');
}
function treffeMiniMonster(monster) {
  if (!monster.lebt || miniRundeGewonnen()) return;
  monster.lebt = false;
  if (!istDeutschModus()) return;
  if (monster.richtig) {
    deutschGewonnen = true;
    feiereRichtigeAntwort();
    const normal = ['de_bier', 'de_wurst', 'de_friedrich', 'de_kartoffel'];
    const item = Math.random() < 0.01 ? 'de_kreuz' : normal[zufallszahl(0, normal.length - 1)];
    deutschVorrat[item]++;
    deutschRueckmeldung = 'Richtig! «' + deutschAufgabe.korrekt + '» Belohnung: ' + deutschItems[item] + '!';
    zeigeWerkstatt();
  } else deutschRueckmeldung = 'Diese Korrektur passt nicht. Schau dir den Satz nochmals an!';
  if (miniBall) miniBall.gestoppt = true;
}

let miniMonster = [];
let miniBauteile = [];
let miniBall = null;
let miniZug = null;
let miniSchuesse = 5;
let miniBild = 0;
let miniZeit = 0;
const schleuderStart = { x: 130, y: 300 };

function miniStatusAnzeigen() {
  const uebrig = miniMonster.filter(function(monster) { return monster.lebt; }).length;
  const gewonnen = miniRundeGewonnen();
  if (gewonnen && !istDeutschModus()) geschaffteMiniLevels.add(miniLevelNummer);
  miniWeiterRechnen.hidden = !gewonnen || istDeutschModus();
  schleuderStatus.textContent = gewonnen ? 'Level ' + (miniLevelNummer + 1) + ' geschafft! 🎉 Schliesse eine Rechenrunde ab, um das nächste Level zu öffnen.'
    : miniSchuesse === 0 && !miniBall ? 'Keine Schüsse mehr. Versuche es noch einmal!'
    : 'Level ' + (miniLevelNummer + 1) + ' · Schüsse übrig: ' + miniSchuesse + ' · Monster übrig: ' + uebrig;
  if (istDeutschModus()) {
    schleuderStatus.textContent = deutschRueckmeldung + (gewonnen ? ' Klicke auf «Nächster Satz».' : ' Schüsse übrig: ' + miniSchuesse + (miniSchuesse === 0 && !miniBall ? ' – starte einen neuen Satz.' : ''));
  }
  schleuderSchuss.disabled = !!miniBall || !miniSchuesse || !uebrig || gewonnen;
}

function starteMinirunde() {
  if (!minispielFreigeschaltet) schleuderModus.value = 'deutsch';
  cancelAnimationFrame(miniBild);
  miniBall = null;
  miniZug = null;
  zeigeMiniLevelAuswahl(schleuderLevel.value);
  miniLevelNummer = Number(schleuderLevel.value);
  const deutsch = istDeutschModus();
  document.getElementById('minispielAnleitung').textContent = deutsch
    ? 'Lies den Satz und triff das Monster mit der richtigen Korrektur. Ziehe den gelben Ball zurück oder benutze Winkel und Kraft. Ein Treffer beendet den Schuss.'
    : 'Ziehe den gelben Ball nach links unten und lass los. Die Punkte zeigen die Flugbahn. Holz und Glas zerbrechen bei einem Treffer. Triff alle Monster!';
  for (const id of ['deutschSatz', 'deutschAntworten', 'deutschPreisHinweis']) document.getElementById(id).hidden = !deutsch;
  document.getElementById('schleuderNeustart').textContent = deutsch ? 'Nächster Satz' : 'Noch einmal';
  const level = miniLevels[miniLevelNummer];
  miniSchuesse = level.schuesse;
  miniMonster = level.monster.map(function(ort) {
    return { x: ort[0], y: ort[1], lebt: true };
  });
  if (deutsch) starteDeutschAufgabe();
  // Das Gerüst bleibt stehen; einzelne Holz- und Glasfelder können zerbrechen.
  miniBauteile = [];
  for (const bau of level.bauten) {
    let reihe = 0;
    for (let y = 375 - bau.hoehe + 10; y < 365; y += 40) {
      for (let spalte = 0; spalte < 3; spalte++) {
        miniBauteile.push({ x: bau.x + spalte * bau.breite / 3 + 4, y: y,
          breite: bau.breite / 3 - 8, hoehe: Math.min(34, 371 - y),
          glas: level.thema !== 'wald' && (reihe + spalte) % 3 === 1, kaputt: false });
      }
      reihe++;
    }
  }
  miniStatusAnzeigen();
  zeichneMinispiel();
}

// Vorschau und Flug verwenden dieselbe Schwerkraft und dieselbe Bewegung.
function miniFlugSchritt(ball, sekunden) {
  ball.x += ball.vx * sekunden;
  ball.y += ball.vy * sekunden + 210 * sekunden * sekunden;
  ball.vy += 420 * sekunden;
}

function miniZielGeschwindigkeit() {
  if (miniZug) return { vx: (130 - miniZug.x) * 6, vy: (300 - miniZug.y) * 6 };
  const winkel = Number(document.getElementById('schleuderWinkel').value) * Math.PI / 180;
  const kraft = Number(document.getElementById('schleuderKraft').value) * 7;
  return { vx: Math.cos(winkel) * kraft, vy: -Math.sin(winkel) * kraft };
}

function zerbrichMiniTeile(ball) {
  for (const teil of miniBauteile) {
    if (teil.kaputt) continue;
    const nahX = Math.max(teil.x, Math.min(ball.x, teil.x + teil.breite));
    const nahY = Math.max(teil.y, Math.min(ball.y, teil.y + teil.hoehe));
    if (Math.hypot(ball.x - nahX, ball.y - nahY) <= 13) teil.kaputt = true;
  }
}

function zeichneMinispiel() {
  const bild = schleuderFeld.getContext('2d');
  bild.clearRect(0, 0, 840, 420);
  // Der durchsichtige Canvas lässt das schlichte Hintergrundbild sichtbar.
  bild.fillStyle = '#397d5b'; bild.fillRect(0, 375, 840, 45);
  const thema = miniLevels[miniLevelNummer].thema;
  if (thema === 'wald') {
    // Bäume im Hintergrund, davor stehen zerbrechliche Holzverstecke.
    for (const x of [260, 350, 510, 680, 805]) {
      bild.fillStyle = '#725039'; bild.fillRect(x - 10, 170, 20, 205);
      bild.fillStyle = '#245e43';
      bild.beginPath(); bild.moveTo(x, 60); bild.lineTo(x - 58, 240); bild.lineTo(x + 58, 240); bild.closePath(); bild.fill();
      bild.fillStyle = '#34865a';
      bild.beginPath(); bild.moveTo(x, 35); bild.lineTo(x - 45, 165); bild.lineTo(x + 45, 165); bild.closePath(); bild.fill();
    }
  } else if (thema === 'stadt') {
    bild.fillStyle = '#7395a0';
    for (let i = 0; i < 8; i++) {
      const hoehe = 80 + (i * 37) % 110;
      bild.fillRect(285 + i * 70, 375 - hoehe, 54, hoehe);
    }
  }

  // Offene Gerüste: zerstörte Felder geben den Blick auf den Himmel frei.
  for (const bau of miniLevels[miniLevelNummer].bauten) {
    const oben = 375 - bau.hoehe;
    bild.strokeStyle = '#63546e'; bild.lineWidth = 4;
    bild.strokeRect(bau.x, oben, bau.breite, bau.hoehe);
    bild.fillStyle = '#bd9b65'; bild.fillRect(bau.x - 6, oben, bau.breite + 12, 8);
    if (thema === 'burg') {
      bild.fillStyle = '#83778e';
      for (let x = bau.x; x < bau.x + bau.breite; x += 24) bild.fillRect(x, oben - 14, 14, 14);
    }
    if (thema === 'turm' || thema === 'posten') {
      bild.strokeStyle = '#584736'; bild.lineWidth = 3;
      bild.beginPath(); bild.moveTo(bau.x + 10, oben); bild.lineTo(bau.x + 10, oben - 35); bild.stroke();
      bild.fillStyle = '#ab5ebc'; bild.beginPath(); bild.moveTo(bau.x + 10, oben - 35); bild.lineTo(bau.x + 38, oben - 25); bild.lineTo(bau.x + 10, oben - 15); bild.fill();
    }

  }
  for (const teil of miniBauteile) {
    if (teil.kaputt) {
      bild.fillStyle = teil.glas ? '#a1f3fa' : '#b47c44';
      bild.fillRect(teil.x + 5, 378, 9, 5);
      bild.fillRect(teil.x + teil.breite - 10, 385, 6, 4);
      continue;
    }
    bild.fillStyle = teil.glas ? '#98e5f0' : '#c48b50';
    bild.fillRect(teil.x, teil.y, teil.breite, teil.hoehe);
    bild.strokeStyle = teil.glas ? '#e4ffff' : '#80502d'; bild.lineWidth = 2;
    bild.strokeRect(teil.x, teil.y, teil.breite, teil.hoehe);
    bild.beginPath(); bild.moveTo(teil.x + 5, teil.y + teil.hoehe - 5);
    bild.lineTo(teil.x + teil.breite - 5, teil.y + 5); bild.stroke();
  }
  if (!miniBall && !schleuderSchuss.disabled) {
    const tempo = miniZielGeschwindigkeit();
    const vorschau = { x: 130, y: 300, vx: tempo.vx, vy: tempo.vy };
    bild.fillStyle = '#fff9dd'; bild.strokeStyle = '#3d616b'; bild.lineWidth = 1;
    for (let punkt = 0; punkt < 65; punkt++) {
      miniFlugSchritt(vorschau, 0.06);
      if (vorschau.y > 375 || vorschau.x > 840) break;
      bild.beginPath(); bild.arc(vorschau.x, vorschau.y, 3, 0, Math.PI * 2); bild.fill(); bild.stroke();
    }
  }
  bild.strokeStyle = '#68452c'; bild.lineWidth = 12;
  bild.beginPath(); bild.moveTo(130, 375); bild.lineTo(130, 325);
  bild.lineTo(110, 290); bild.moveTo(130, 325); bild.lineTo(150, 290); bild.stroke();
  const ballOrt = miniBall || miniZug || schleuderStart;
  if (!miniBall) {
    bild.strokeStyle = '#b64d57'; bild.lineWidth = 5;
    bild.beginPath(); bild.moveTo(110, 290); bild.lineTo(ballOrt.x, ballOrt.y); bild.lineTo(150, 290); bild.stroke();
  }
  for (const monster of miniMonster) {
    if (!monster.lebt) continue;
    bild.fillStyle = '#8b45bb'; bild.beginPath(); bild.arc(monster.x, monster.y, 25, 0, Math.PI * 2); bild.fill();
    bild.fillStyle = 'white';
    for (const versatz of [-9, 9]) {
      bild.beginPath(); bild.arc(monster.x + versatz, monster.y - 6, 7, 0, Math.PI * 2); bild.fill();
    }
    bild.fillStyle = '#29213d';
    for (const versatz of [-9, 9]) {
      bild.beginPath(); bild.arc(monster.x + versatz - 2, monster.y - 6, 3, 0, Math.PI * 2); bild.fill();
    }
    bild.fillRect(monster.x - 8, monster.y + 10, 16, 4);
    if (istDeutschModus()) {
      bild.fillStyle = '#fff5d6'; bild.fillRect(monster.x - 72, monster.y - 63, 144, 30);
      bild.fillStyle = '#17324d'; bild.font = 'bold 14px Arial'; bild.textAlign = 'center';
      bild.fillText(monster.korrektur, monster.x, monster.y - 43, 136);
      bild.textAlign = 'start';
    }
  }
  bild.fillStyle = '#ffd15e'; bild.beginPath(); bild.arc(ballOrt.x, ballOrt.y, 13, 0, Math.PI * 2); bild.fill();
}

function schiesseMiniBall(vx, vy) {
  if (miniBall || !miniSchuesse || miniRundeGewonnen() || !miniMonster.some(function(monster) { return monster.lebt; })) return;
  miniZug = null;
  miniSchuesse--;
  miniBall = { x: schleuderStart.x, y: schleuderStart.y, vx: vx, vy: vy };
  miniZeit = 0;
  miniStatusAnzeigen();
  miniBild = requestAnimationFrame(bewegeMiniBall);
}

function bewegeMiniBall(zeit) {
  if (!monsterMinispiel.open || !miniBall) return;
  const dauer = miniZeit ? Math.min((zeit - miniZeit) / 1000, 0.04) : 0;
  miniZeit = zeit;
  // Kleine Schritte verhindern, dass ein schneller Ball durch ein Monster springt.
  for (let schritt = 0; schritt < 4; schritt++) {
    miniFlugSchritt(miniBall, dauer / 4);
    zerbrichMiniTeile(miniBall);
    for (const monster of miniMonster) {
      if (monster.lebt && Math.hypot(miniBall.x - monster.x, miniBall.y - monster.y) < 38) {
        treffeMiniMonster(monster);
        if (miniBall.gestoppt) break;
      }
    }
    if (miniBall.gestoppt) break;
  }
  zeichneMinispiel();
  if (miniBall.gestoppt || miniRundeGewonnen() || miniBall.y > 375 || miniBall.x > 860 || !miniMonster.some(function(monster) { return monster.lebt; })) {
    miniBall = null;
    miniStatusAnzeigen();
    zeichneMinispiel();
  } else miniBild = requestAnimationFrame(bewegeMiniBall);
}

function miniZeiger(event) {
  const rahmen = schleuderFeld.getBoundingClientRect();
  return { x: (event.clientX - rahmen.left) * 840 / rahmen.width,
    y: (event.clientY - rahmen.top) * 420 / rahmen.height };
}
schleuderFeld.addEventListener('pointerdown', function(event) {
  if (event.button !== 0 || miniBall || schleuderSchuss.disabled) return;
  const punkt = miniZeiger(event);
  if (Math.hypot(punkt.x - 130, punkt.y - 300) > 45) return;
  miniZug = { x: 130, y: 300 };
  schleuderFeld.setPointerCapture(event.pointerId);
});
schleuderFeld.addEventListener('pointermove', function(event) {
  if (!miniZug) return;
  const punkt = miniZeiger(event);
  miniZug = { x: Math.max(20, Math.min(125, punkt.x)), y: Math.max(300, Math.min(400, punkt.y)) };
  zeichneMinispiel();
});
schleuderFeld.addEventListener('pointerup', function() {
  if (!miniZug) return;
  const vx = (130 - miniZug.x) * 6;
  const vy = (300 - miniZug.y) * 6;
  miniZug = null;
  if (vx >= 30) schiesseMiniBall(vx, vy);
  else zeichneMinispiel();
});
schleuderFeld.addEventListener('pointercancel', function() { miniZug = null; zeichneMinispiel(); });
schleuderSchuss.addEventListener('click', function() {
  const tempo = miniZielGeschwindigkeit();
  schiesseMiniBall(tempo.vx, tempo.vy);
});
for (const id of ['schleuderWinkel', 'schleuderKraft']) {
  document.getElementById(id).addEventListener('input', zeichneMinispiel);
}
let schleuderStartKnopf = minispielOeffnen;
document.getElementById('deutschSchleuderOeffnen').addEventListener('click', function() {
  schleuderStartKnopf = document.getElementById('deutschSchleuderOeffnen');
  schleuderModus.value = 'deutsch';
  monsterMinispiel.showModal();
  starteMinirunde();
});
minispielOeffnen.addEventListener('click', function() {
  if (!minispielFreigeschaltet) return;
  schleuderStartKnopf = minispielOeffnen;
  schleuderModus.value = 'normal';
  monsterMinispiel.showModal();
  starteMinirunde();
});
miniWeiterRechnen.addEventListener('click', function() {
  monsterMinispiel.close();
  zurueckZumStart();
});
schleuderModus.addEventListener('change', starteMinirunde);
schleuderLevel.addEventListener('change', starteMinirunde);
document.getElementById('schleuderNeustart').addEventListener('click', starteMinirunde);
document.getElementById('minispielSchliessen').addEventListener('click', function() { monsterMinispiel.close(); });
monsterMinispiel.addEventListener('close', function() {
  cancelAnimationFrame(miniBild);
  miniBall = null;
  miniZug = null;
  schleuderStartKnopf.focus();
});

// GWÖRK KART: Drei Autos teilen sich eine Rennstrecke.
const kartSpiel = document.getElementById('kartSpiel');
const kartBahn = document.getElementById('kartBahn');
const kartFormular = document.getElementById('kartFormular');
const kartAntworten = document.getElementById('kartAntworten');
const kartLenkrad = document.getElementById('kartLenkrad');
let kartAntwortWerte = [];
let kartLenkung = 0;
let kartSpielerY = 150;
let kartLenkZeiger = null;
const kartMeldung = document.getElementById('kartMeldung');
const kartStart = document.getElementById('kartStart');
let kartAktiv = false;
let kartAutos = [];
let kartMaximum = 10;
let kartLoesung = 0;
let kartFrist = 0;
let kartZuSpaet = false;
let kartLetzteZeit = 0;
let kartAufgabenNummer = 0;
let kartTimer = null;
const kartZiel = 9000;

function bereiteKartVor() {
  kartAutos = [
    { name: 'Du', farbe: '#ffd15e', weg: 0, tempo: 145 },
    { name: 'Lila Monster', farbe: '#b775e3', weg: 0, tempo: 135 },
    { name: 'Grünes Monster', farbe: '#7bd76e', weg: 0, tempo: 140 }
  ];
  setzeKartLenkung(0);
  kartSpielerY = kartStrassenMitte(35);
  kartMaximum = Number(schwierigkeit.value);
  if (!istStufeOffen(kartMaximum)) kartMaximum = 10;
  document.getElementById('kartStufe').textContent = 'Rechenstufe: ' + stufenNamen[stufenReihenfolge.indexOf(kartMaximum)];
  kartAufgabenNummer = 0;
  kartFormular.hidden = true;
  kartStart.hidden = false;
  kartStart.textContent = 'Rennen starten';
  document.getElementById('kartZeit').textContent = 'Bereit fürs Rennen?';
  kartMeldung.textContent = '';
  zeichneKart();
}

function neueKartAufgabe() {
  const art = kartAufgabenNummer++ % (kartMaximum === 10 ? 2 : 4);
  let a, b, text;
  if (art === 0) {
    a = zufallszahl(1, Math.floor(kartMaximum / 2));
    b = zufallszahl(1, kartMaximum - a);
    kartLoesung = a + b; text = a + ' + ' + b;
  } else if (art === 1) {
    a = zufallszahl(Math.ceil(kartMaximum / 2), kartMaximum);
    b = zufallszahl(1, a - 1);
    kartLoesung = a - b; text = a + ' − ' + b;
  } else {
    a = zufallszahl(2, Math.max(2, Math.floor(Math.sqrt(kartMaximum))));
    b = zufallszahl(2, Math.min(12, Math.floor(kartMaximum / a)));
    kartLoesung = art === 2 ? a * b : a;
    text = art === 2 ? a + ' × ' + b : (a * b) + ' ÷ ' + b;
  }
  document.getElementById('kartAufgabe').textContent = text + ' = ?';
  // Drei unterschiedliche Zahlen, darunter genau die richtige Lösung.
  const auswahl = new Set([kartLoesung]);
  for (let abstand = 1; auswahl.size < 3; abstand++) {
    if (kartLoesung - abstand >= 1) auswahl.add(kartLoesung - abstand);
    if (auswahl.size < 3 && kartLoesung + abstand <= kartMaximum) auswahl.add(kartLoesung + abstand);
  }
  kartAntwortWerte = Array.from(auswahl);
  for (let i = 2; i > 0; i--) {
    const j = zufallszahl(0, i); [kartAntwortWerte[i], kartAntwortWerte[j]] = [kartAntwortWerte[j], kartAntwortWerte[i]];
  }
  kartAntworten.replaceChildren();
  const frage = kartAufgabenNummer;
  kartAntwortWerte.forEach(function(wert, index) {
    const knopf = document.createElement('button'); knopf.type = 'button';
    knopf.textContent = wert; knopf.setAttribute('aria-label', 'Antwort ' + (index + 1) + ': ' + wert);
    knopf.addEventListener('click', function() { if (frage === kartAufgabenNummer) pruefeKartAntwort(wert); });
    kartAntworten.appendChild(knopf);
  });
  kartFrist = Date.now() + 4000;
  kartZuSpaet = false;

}

function beschleunigeMonster() {
  for (let i = 1; i < kartAutos.length; i++) kartAutos[i].tempo = Math.min(600, kartAutos[i].tempo + 30);
}

function pruefeKartFrist(jetzt) {
  if (!kartZuSpaet && jetzt > kartFrist) {
    kartZuSpaet = true;
    beschleunigeMonster();
    kartMeldung.textContent = 'Die 4 Sekunden sind vorbei – die Monster werden schneller! Löse die Aufgabe trotzdem.';
  }
}

function kartStrassenMitte(x) {
  return 150 + 65 * Math.sin((x - 35) / 720 * Math.PI * 3);
}
function kartAufWiese() {
  const x = 35 + Math.min(1, kartAutos[0].weg / kartZiel) * 720;
  return Math.abs(kartSpielerY - kartStrassenMitte(x)) > 40;
}
function setzeKartLenkung(wert) {
  kartLenkung = Math.max(-1, Math.min(1, wert));
  kartLenkrad.style.transform = 'rotate(' + kartLenkung * 65 + 'deg)';
  kartLenkrad.setAttribute('aria-valuenow', Math.round(kartLenkung * 100));
  kartLenkrad.setAttribute('aria-valuetext', kartLenkung < 0 ? 'Links lenken' : kartLenkung > 0 ? 'Rechts lenken' : 'Geradeaus');
}
function lenkeMitZeiger(event) {
  const ort = kartLenkrad.getBoundingClientRect();
  setzeKartLenkung((event.clientX - ort.left - ort.width / 2) / (ort.width / 2));
}
kartLenkrad.addEventListener('pointerdown', function(event) {
  if (!kartAktiv || event.button !== 0) return;
  event.preventDefault(); kartLenkZeiger = event.pointerId;
  kartLenkrad.setPointerCapture(event.pointerId); lenkeMitZeiger(event);
});
kartLenkrad.addEventListener('pointermove', function(event) { if (kartLenkZeiger === event.pointerId) lenkeMitZeiger(event); });
for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) {
  kartLenkrad.addEventListener(name, function() { kartLenkZeiger = null; setzeKartLenkung(0); });
}
kartSpiel.addEventListener('keydown', function(event) {
  if (!kartAktiv) return;
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault(); setzeKartLenkung(event.key === 'ArrowLeft' ? -0.6 : 0.6);
  } else if (!event.repeat && ['1', '2', '3'].includes(event.key)) {
    event.preventDefault(); pruefeKartAntwort(kartAntwortWerte[Number(event.key) - 1]);
  }
});
kartSpiel.addEventListener('keyup', function(event) {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); setzeKartLenkung(0); }
});
window.addEventListener('blur', function() { kartLenkZeiger = null; setzeKartLenkung(0); });

function zeichneKart() {
  const bild = kartBahn.getContext('2d');
  bild.clearRect(0, 0, 840, 300);
  // Eine breite, geschwungene Strasse statt drei gerader Fahrspuren.
  function strassenLinie(farbe, breite, gestrichelt) {
    bild.strokeStyle = farbe; bild.lineWidth = breite;
    bild.setLineDash(gestrichelt ? [12, 12] : []);
    bild.beginPath();
    for (let x = 0; x <= 840; x += 4) {
      if (x === 0) bild.moveTo(x, kartStrassenMitte(x));
      else bild.lineTo(x, kartStrassenMitte(x));
    }
    bild.stroke(); bild.setLineDash([]);
  }
  strassenLinie('#f0ead3', 112, false);
  strassenLinie('#34414b', 102, false);
  strassenLinie('#c7cbbc', 2, true);
  for (let reihe = 0; reihe < 8; reihe++) {
    for (let spalte = 0; spalte < 2; spalte++) {
      bild.fillStyle = (reihe + spalte) % 2 ? '#121b24' : '#fff8de';
      bild.fillRect(780 + spalte * 8, kartStrassenMitte(788) - 48 + reihe * 12, 8, 12);
    }
  }
  kartAutos.forEach(function(auto, index) {
    const x = 35 + Math.min(1, auto.weg / kartZiel) * 720;
    const y = index === 0 ? kartSpielerY : kartStrassenMitte(x) + (index === 1 ? -24 : 24);
    bild.save();
    bild.translate(x, y);
    const richtung = index === 0 ? kartLenkung * 0.5 : Math.atan2(kartStrassenMitte(x + 2) - kartStrassenMitte(x - 2), 4);
    bild.rotate(richtung); bild.scale(0.6, 0.6); bild.translate(-x, -y);
    bild.fillStyle = '#152027';
    bild.fillRect(x + 5, y - 23, 12, 8); bild.fillRect(x + 34, y - 23, 12, 8);
    bild.fillRect(x + 5, y + 15, 12, 8); bild.fillRect(x + 34, y + 15, 12, 8);
    bild.fillStyle = auto.farbe; bild.fillRect(x, y - 16, 52, 32);
    bild.fillStyle = '#c3edf0'; bild.fillRect(x + 31, y - 11, 11, 22);
    bild.fillStyle = '#18202a';
    if (index > 0) {
      bild.fillRect(x + 12, y - 9, 5, 5); bild.fillRect(x + 12, y + 4, 5, 5);
    } else { bild.font = 'bold 13px Arial'; bild.fillText('DU', x + 5, y + 5); }
    bild.restore();
  });
  document.getElementById('kartLenkHinweis').textContent = kartAufWiese() ? '🌿 Auf der Wiese – lenke zurück auf die Strasse! Tempo reduziert.' : '🏁 Auf der Strasse';
  document.getElementById('kartRennstand').textContent = kartAutos.map(function(auto) {
    return auto.name + ': ' + Math.min(100, Math.floor(auto.weg / kartZiel * 100)) + '% · Tempo ' + auto.tempo;
  }).join(' | ');
}

function beendeKart(gewonnen) {
  if (!kartAktiv) return;
  kartAktiv = false;
  setzeKartLenkung(0);
  clearInterval(kartTimer);
  kartTimer = null;
  kartFormular.hidden = true;
  kartStart.hidden = false;
  kartStart.textContent = 'Noch ein Rennen';
  document.getElementById('kartZeit').textContent = 'Ziel erreicht!';
  if (gewonnen) {
    kartPokale++;
    kartMeldung.textContent = 'Gewonnen! 🏆 Ein neuer Gwörk-Kart-Pokal liegt in deiner Sammlung. Pokale: ' + kartPokale;
    zeigeWerkstatt();
  } else kartMeldung.textContent = 'Ein Monster war zuerst im Ziel. Versuch es noch einmal!';
}

function kartSchritt() {
  if (!kartAktiv) return;
  const jetzt = Date.now();
  // Teilen wir einen langen Zeitschritt an der Antwortfrist, gilt der
  // Monster-Turbo auch dann korrekt, wenn der Browser kurz nicht zeichnet.
  while (kartAktiv && kartLetzteZeit < jetzt) {
    pruefeKartFrist(kartLetzteZeit);
    const ende = Math.min(jetzt, kartLetzteZeit + 50, kartZuSpaet ? jetzt : kartFrist + 1);
    const sekunden = (ende - kartLetzteZeit) / 1000;
    const tempo = kartAutos.map(function(auto, index) { return auto.tempo * (index === 0 && kartAufWiese() ? 0.45 : 1); });
    const ankunft = kartAutos.map(function(auto, index) { return (kartZiel - auto.weg) / tempo[index]; });
    const ersteAnkunft = Math.min(...ankunft);
    const dauer = Math.min(sekunden, ersteAnkunft);
    kartAutos.forEach(function(auto, index) { auto.weg += tempo[index] * dauer; });
    kartSpielerY = Math.max(18, Math.min(282, kartSpielerY + kartLenkung * 90 * dauer));
    kartLetzteZeit = ende;
    if (ersteAnkunft <= sekunden) {
      zeichneKart();
      beendeKart(ankunft[0] < Math.min(ankunft[1], ankunft[2]));
      return;
    }
  }
  pruefeKartFrist(jetzt);
  zeichneKart();
  document.getElementById('kartZeit').textContent = kartZuSpaet ? 'Zu spät – löse die Aufgabe für die nächste Chance!'
    : 'Zeit für den Turbo: ' + Math.max(0, (kartFrist - jetzt) / 1000).toFixed(1) + ' Sekunden';
}

kartStart.addEventListener('click', function() {
  if (kartAktiv) return;
  bereiteKartVor();
  kartAktiv = true;
  kartStart.hidden = true;
  kartFormular.hidden = false;
  kartLetzteZeit = Date.now();
  neueKartAufgabe();
  kartLenkrad.focus();
  kartSchritt();
  kartTimer = setInterval(kartSchritt, 50);
});
function pruefeKartAntwort(wert) {
  if (!kartAktiv || !kartAntwortWerte.includes(wert)) return;
  kartSchritt();
  if (!kartAktiv) return;
  if (wert === kartLoesung) {
    feiereRichtigeAntwort();
    if (!kartZuSpaet) {
      kartAutos[0].tempo = Math.min(650, kartAutos[0].tempo + 40);
      kartMeldung.textContent = 'Richtig und schnell! Dein Auto bekommt Turbo! ⚡';
    } else kartMeldung.textContent = 'Richtig! Bei der nächsten Aufgabe gibt es wieder eine Turbo-Chance.';
  } else {
    if (!kartZuSpaet) beschleunigeMonster();
    kartMeldung.textContent = 'Richtig wäre ' + kartLoesung + '. Die Monster geben Gas!';
  }
  neueKartAufgabe();
  kartLenkrad.focus();
  zeichneKart();
}
document.getElementById('kartOeffnen').addEventListener('click', function() {
  kartSpiel.showModal();
  bereiteKartVor();
});
document.getElementById('kartSchliessen').addEventListener('click', function() { kartSpiel.close(); });
kartSpiel.addEventListener('close', function() {
  kartAktiv = false;
  setzeKartLenkung(0);
  clearInterval(kartTimer);
  kartTimer = null;
  document.getElementById('kartOeffnen').focus();
});

// CHEMIELABOR: Katalog und geprüfte Modelle bewusst getrennt halten.
const chemieElemente = 'H Wasserstoff,He Helium,Li Lithium,Be Beryllium,B Bor,C Kohlenstoff,N Stickstoff,O Sauerstoff,F Fluor,Ne Neon,Na Natrium,Mg Magnesium,Al Aluminium,Si Silicium,P Phosphor,S Schwefel,Cl Chlor,Ar Argon,K Kalium,Ca Calcium,Sc Scandium,Ti Titan,V Vanadium,Cr Chrom,Mn Mangan,Fe Eisen,Co Cobalt,Ni Nickel,Cu Kupfer,Zn Zink,Ga Gallium,Ge Germanium,As Arsen,Se Selen,Br Brom,Kr Krypton,Rb Rubidium,Sr Strontium,Y Yttrium,Zr Zirconium,Nb Niob,Mo Molybdän,Tc Technetium,Ru Ruthenium,Rh Rhodium,Pd Palladium,Ag Silber,Cd Cadmium,In Indium,Sn Zinn,Sb Antimon,Te Tellur,I Iod,Xe Xenon,Cs Caesium,Ba Barium,La Lanthan,Ce Cer,Pr Praseodym,Nd Neodym,Pm Promethium,Sm Samarium,Eu Europium,Gd Gadolinium,Tb Terbium,Dy Dysprosium,Ho Holmium,Er Erbium,Tm Thulium,Yb Ytterbium,Lu Lutetium,Hf Hafnium,Ta Tantal,W Wolfram,Re Rhenium,Os Osmium,Ir Iridium,Pt Platin,Au Gold,Hg Quecksilber,Tl Thallium,Pb Blei,Bi Bismut,Po Polonium,At Astat,Rn Radon,Fr Francium,Ra Radium,Ac Actinium,Th Thorium,Pa Protactinium,U Uran,Np Neptunium,Pu Plutonium,Am Americium,Cm Curium,Bk Berkelium,Cf Californium,Es Einsteinium,Fm Fermium,Md Mendelevium,No Nobelium,Lr Lawrencium,Rf Rutherfordium,Db Dubnium,Sg Seaborgium,Bh Bohrium,Hs Hassium,Mt Meitnerium,Ds Darmstadtium,Rg Roentgenium,Cn Copernicium,Nh Nihonium,Fl Flerovium,Mc Moscovium,Lv Livermorium,Ts Tenness,Og Oganesson'.split(',').map(function(eintrag, index) {
  const teile = eintrag.split(' ');
  return { nummer: index + 1, symbol: teile[0], name: teile[1] };
});
// Schmelzpunkte in °C, RSC-Stoffdaten, geprüft am 12.11.2026.
const schmelzDaten = {
  Al: { punkt: 660.323, farbe: '#cbd8dc', quelle: '13/aluminium' },
  Fe: { punkt: 1538, farbe: '#a6afb7', quelle: '26/iron' },
  Cu: { punkt: 1084.62, farbe: '#d58d61', quelle: '29/copper' },
  Ag: { punkt: 961.78, farbe: '#e2e6eb', quelle: '47/silver' },
  Au: { punkt: 1064.18, farbe: '#efc754', quelle: '79/gold' },
  Pt: { punkt: 1768.2, farbe: '#bbc6ce', quelle: '78/platinum' }
};
const elementVorrat = Object.fromEntries(chemieElemente.map(function(element) { return [element.symbol, 6]; }));
const chemieRezepte = [
  { symbol: 'Fe', item: 6, text: 'Eisen → Metallplatte', extra: [] },
  { symbol: 'Fe', item: 4, text: 'Eisen → Zahnrad', extra: [] },
  { symbol: 'Fe', item: 3, text: 'Eisen → Schraube', extra: [] },
  { symbol: 'Al', item: 6, text: 'Aluminium → Metallplatte', extra: [] },
  { symbol: 'Cu', item: 5, text: 'Kupfer + 1 Plastik → Kabel', extra: [12] }
];
const chemieProben = [];
const chemieLabor = document.getElementById('chemieLabor');

function elementNachschubPreis() {
  const fehlen = Object.values(elementVorrat).reduce(function(summe, menge) { return summe + Math.max(0, 6 - menge); }, 0);
  if (!fehlen) return { fehlen: 0, essen: 0, items: 0, pokale: 0 };
  if (fehlen <= 5) return { fehlen: fehlen, essen: 2, items: 0, pokale: 0 };
  if (fehlen <= 8) return { fehlen: fehlen, essen: 1, items: 1, pokale: 1 };
  return { fehlen: fehlen, essen: 2, items: 2, pokale: 2 };
}

function zeigeElementNachschub() {
  const preis = elementNachschubPreis();
  const essensPlan = planeVorratsAbzug(essensVorrat, preis.essen, Number(tauschVon.value));
  const itemPlan = planeVorratsAbzug(vorrat, preis.items);
  const bezahlen = essensPlan && itemPlan && kartPokale >= preis.pokale;
  document.getElementById('elementeAuffuellen').disabled = !laborAusgebaut || !preis.fehlen || !bezahlen;
  let text = !laborAusgebaut ? 'Baue zuerst das Chemielabor.'
    : !preis.fehlen ? 'Alle Elementvorräte sind voll: jeweils 6 Portionen.'
    : preis.fehlen + ' Portionen fehlen. Preis: ' + preis.essen + ' Essen, ' + preis.items + ' Items, ' + preis.pokale + ' Pokale.';
  if (laborAusgebaut && preis.fehlen) {
    text += bezahlen ? ' Abgezogen werden: ' + essensPlan.map(function(i) { return lebensmittel[i].name; }).concat(itemPlan.map(teilName)).join(', ') + ' und ' + preis.pokale + ' Pokale.'
      : ' Es fehlen noch Vorräte oder Pokale. Essen: ' + essensVorrat.reduce(function(a, b) { return a + b; }, 0) + ', Items: ' + vorrat.reduce(function(a, b) { return a + b; }, 0) + ', Pokale: ' + kartPokale + '.';
  }
  document.getElementById('elementNachschubInfo').textContent = text;
}

function fuelleElementeAuf(essen) {
  const preis = elementNachschubPreis();
  const essensPlan = planeVorratsAbzug(essensVorrat, preis.essen, essen);
  const itemPlan = planeVorratsAbzug(vorrat, preis.items);
  if (!laborAusgebaut || !preis.fehlen || !Number.isInteger(essen) || !lebensmittel[essen] || !essensPlan || !itemPlan || kartPokale < preis.pokale) return;
  for (const index of essensPlan) essensVorrat[index]--;
  for (const index of itemPlan) vorrat[index]--;
  kartPokale -= preis.pokale;
  for (const symbol of Object.keys(elementVorrat)) elementVorrat[symbol] = 6;
  document.getElementById('elementNachschubMeldung').textContent = 'Alle Vorräte wieder auf 6! Bezahlt: ' + preis.essen + ' Essen, ' + preis.items + ' Items und ' + preis.pokale + ' Pokale.';
  for (const probe of chemieProben) zeigeChemieProbe(probe);
  zeigeEssensVorrat();
  zeigeWerkstatt();
  zeigeElementNachschub();
}
document.getElementById('elementeAuffuellen').addEventListener('click', function() {
  if (tauschVon.value !== '') fuelleElementeAuf(Number(tauschVon.value));
});

function nimmChemieProbe(probe, nass = false) {
  if (!schmelzDaten[probe.symbol] || elementVorrat[probe.symbol] < 1 || (nass && probe.symbol !== 'Fe')) return;
  elementVorrat[probe.symbol]--;
  probe.hatProbe = true;
  probe.temperatur = 20;
  probe.nass = nass;
  probe.rost = false;
  for (const platz of chemieProben) zeigeChemieProbe(platz);
  if (janoschTausch.open) zeigeElementNachschub();
}

function stelleChemieItemHer(probe) {
  const rezept = chemieRezepte[Number(probe.rezeptAuswahl.value)];
  if (!laborAusgebaut || !probe.hatProbe || probe.nass || probe.rost || !rezept || rezept.symbol !== probe.symbol ||
      chemieZustand(probe.symbol, probe.temperatur) !== 'fluessig' || !rezept.extra.every(function(i) { return vorrat[i] > 0; })) return;
  for (const index of rezept.extra) vorrat[index]--;
  vorrat[rezept.item]++;
  // Die Portion wurde schon beim Entnehmen bezahlt. Jetzt wird sie zum Item.
  probe.hatProbe = false;
  probe.temperatur = 20;
  probe.herstellMeldung.textContent = 'Geformt und abgekühlt: 1 ' + items[rezept.item] + ' liegt in deinem Vorrat!';
  for (const platz of chemieProben) zeigeChemieProbe(platz);
  zeigeWerkstatt();
}

function chemieZustand(symbol, temperatur) {
  const daten = schmelzDaten[symbol];
  if (!daten) return 'unbekannt';
  if (temperatur === daten.punkt) return 'schmelzend';
  return temperatur > daten.punkt ? 'fluessig' : 'fest';
}

function zeigeChemieProbe(probe) {
  const element = chemieElemente.find(function(e) { return e.symbol === probe.symbol; });
  const daten = schmelzDaten[probe.symbol];
  const zustand = chemieZustand(probe.symbol, probe.temperatur);
  const vorher = probe.rezeptAuswahl.value;
  probe.rezeptAuswahl.replaceChildren();
  chemieRezepte.forEach(function(rezept, index) {
    if (rezept.symbol !== probe.symbol) return;
    const option = document.createElement('option'); option.value = index; option.textContent = rezept.text;
    probe.rezeptAuswahl.appendChild(option);
  });
  if (vorher !== '' && chemieRezepte[Number(vorher)] && chemieRezepte[Number(vorher)].symbol === probe.symbol) probe.rezeptAuswahl.value = vorher;
  const rezept = chemieRezepte[Number(probe.rezeptAuswahl.value)];
  const passend = rezept && rezept.symbol === probe.symbol;
  probe.rezeptAuswahl.hidden = !passend;
  probe.herstellen.disabled = !passend || !probe.hatProbe || probe.nass || probe.rost || zustand !== 'fluessig' || !rezept.extra.every(function(i) { return vorrat[i] > 0; });
  probe.herstellen.textContent = !passend ? 'Noch kein Item-Rezept' : 'Formen und abkühlen → 1 Item';

  probe.bild.className = 'chemieProbe ' + (!probe.hatProbe ? 'unbekannt' : probe.rost ? 'rostig' : zustand);
  probe.bild.style.backgroundColor = daten ? daten.farbe : '';
  probe.bild.textContent = element.symbol;
  probe.temperaturFeld.value = probe.temperatur;
  probe.regler.value = probe.temperatur;
  probe.temperaturFeld.disabled = !probe.hatProbe || !daten || probe.nass;
  probe.regler.disabled = !probe.hatProbe || !daten || probe.nass;
  probe.heizen.disabled = !probe.hatProbe || !daten || probe.nass || probe.temperatur >= 2000;
  probe.wasser.disabled = probe.symbol !== 'Fe' || elementVorrat.Fe < 1;
  probe.neu.disabled = !daten || elementVorrat[probe.symbol] < 1;
  probe.vorratText.textContent = 'Vorrat ' + element.name + ': ' + elementVorrat[probe.symbol] + '/6 Portionen' + (probe.hatProbe ? ' · 1 Probe in dieser Schale.' : ' · Schale leer.');
  for (const option of probe.auswahl.children) {
    const e = chemieElemente.find(function(element) { return element.symbol === option.value; });
    option.textContent = e.nummer + ' · ' + e.symbol + ' · ' + e.name + ' · ' + elementVorrat[e.symbol] + '/6' + (schmelzDaten[e.symbol] ? '' : ' · nur Katalog');
  }
  probe.zeit.disabled = !probe.nass || probe.rost;
  probe.quelle.hidden = !daten;
  if (daten) probe.quelle.href = 'https://periodic-table.rsc.org/element/' + daten.quelle;
  if (!daten) {
    probe.info.textContent = element.nummer + ' · ' + element.name + ': Für dieses Element ist noch kein Experimentmodell vorhanden. Die Karte zeigt keinen vorhergesagten Stoffzustand.';
  } else if (!probe.hatProbe) {
    probe.info.textContent = elementVorrat[probe.symbol] > 0 ? 'Wähle «Neue trockene Probe» für dein Experiment. Kosten: 1 Portion.' : 'Vorrat leer. Bei Janosch siehst du den Nachfüllpreis für alle Elemente.';
  } else if (probe.nass) {
    probe.info.textContent = probe.rost
      ? 'Eisen bildet mit Wasser und Sauerstoff aus der Luft Rost. Die braune Oberfläche zeigt das schematisch nach längerer Zeit. Keine echte Zeitberechnung.'
      : 'Eisen bei 20 °C in Kontakt mit Wasser und Luft. Rostbildung braucht Zeit. Klicke auf «Zeitraffer». Wasser ist H₂O, kein Element.';
  } else {
    const text = zustand === 'fest' ? 'fest' : zustand === 'fluessig' ? 'flüssig' : 'am Schmelzpunkt: fest und flüssig möglich';
    probe.info.textContent = element.name + ' bei ' + probe.temperatur.toLocaleString('de-CH') + ' °C: ' + text + '. Schmelzpunkt: ' + daten.punkt.toLocaleString('de-CH') + ' °C. Reine Probe, normaler Luftdruck, ohne Luftreaktionen.';
  }
}

function setzeChemieTemperatur(probe, temperatur) {
  if (!probe.hatProbe || !schmelzDaten[probe.symbol] || probe.nass || !Number.isFinite(temperatur)) return;
  probe.temperatur = Math.max(20, Math.min(2000, temperatur));
  zeigeChemieProbe(probe);
}

function erstelleChemiePlatz(symbol, nummer) {
  const probe = { symbol: symbol, temperatur: 20, nass: false, rost: false, hatProbe: false };
  const karte = document.createElement('section'); karte.className = 'chemiePlatz';
  const titel = document.createElement('h3'); titel.textContent = 'Schale ' + nummer; karte.appendChild(titel);
  const auswahl = document.createElement('select'); auswahl.setAttribute('aria-label', 'Element für Schale ' + nummer);
  for (const element of chemieElemente) {
    const option = document.createElement('option'); option.value = element.symbol;
    option.textContent = element.nummer + ' · ' + element.symbol + ' · ' + element.name + (schmelzDaten[element.symbol] ? ' · Erhitzen verfügbar' : ' · nur Katalog');
    auswahl.appendChild(option);
  }
  auswahl.value = symbol; karte.appendChild(auswahl);
  probe.auswahl = auswahl;
  probe.vorratText = document.createElement('p'); karte.appendChild(probe.vorratText);
  const schale = document.createElement('div'); schale.className = 'chemieSchale'; schale.setAttribute('aria-hidden', 'true');
  probe.bild = document.createElement('div'); schale.appendChild(probe.bild); karte.appendChild(schale);
  const label = document.createElement('label'); label.textContent = 'Probentemperatur in °C (20 bis 2000)';
  probe.temperaturFeld = document.createElement('input'); probe.temperaturFeld.type = 'number';
  probe.temperaturFeld.min = 20; probe.temperaturFeld.max = 2000; probe.temperaturFeld.step = '0.001';
  label.appendChild(probe.temperaturFeld); karte.appendChild(label);
  probe.regler = document.createElement('input'); probe.regler.type = 'range'; probe.regler.min = 20; probe.regler.max = 2000; probe.regler.step = 1;
  probe.regler.setAttribute('aria-label', 'Temperaturregler für Schale ' + nummer); karte.appendChild(probe.regler);
  function knopf(text, aktion) { const k = document.createElement('button'); k.type = 'button'; k.textContent = text; k.addEventListener('click', aktion); karte.appendChild(k); return k; }
  probe.heizen = knopf('Erhitzen +100 °C', function() { setzeChemieTemperatur(probe, probe.temperatur + 100); });
  probe.wasser = knopf('Neue Eisenprobe mit Wasser (20 °C)', function() {
    nimmChemieProbe(probe, true);
  });
  probe.zeit = knopf('Zeitraffer: Rost ansehen', function() {
    if (probe.symbol !== 'Fe' || !probe.nass) return;
    probe.rost = true; zeigeChemieProbe(probe);
  });
  probe.neu = knopf('Neue trockene Probe · 1 Portion', function() { nimmChemieProbe(probe); });
  probe.rezeptAuswahl = document.createElement('select'); probe.rezeptAuswahl.setAttribute('aria-label', 'Item-Rezept für Schale ' + nummer); karte.appendChild(probe.rezeptAuswahl);
  probe.rezeptAuswahl.addEventListener('change', function() { zeigeChemieProbe(probe); });
  probe.herstellen = knopf('Formen und abkühlen → 1 Item', function() { stelleChemieItemHer(probe); });
  probe.herstellMeldung = document.createElement('p'); probe.herstellMeldung.setAttribute('role', 'status'); karte.appendChild(probe.herstellMeldung);
  probe.info = document.createElement('p'); probe.info.setAttribute('role', 'status'); karte.appendChild(probe.info);
  probe.quelle = document.createElement('a'); probe.quelle.textContent = 'Stoffdaten bei der RSC'; probe.quelle.target = '_blank'; probe.quelle.rel = 'noopener'; karte.appendChild(probe.quelle);
  auswahl.addEventListener('change', function() {
    probe.hatProbe = false; probe.symbol = auswahl.value; probe.temperatur = 20; probe.nass = false; probe.rost = false; zeigeChemieProbe(probe);
  });
  probe.regler.addEventListener('input', function() { setzeChemieTemperatur(probe, Number(probe.regler.value)); });
  probe.temperaturFeld.addEventListener('change', function() { setzeChemieTemperatur(probe, Number(probe.temperaturFeld.value)); });
  document.getElementById('chemiePlaetze').appendChild(karte);
  chemieProben.push(probe); zeigeChemieProbe(probe);
}
document.getElementById('chemieOeffnen').addEventListener('click', function() {
  if (!laborAusgebaut) return;
  if (!chemieProben.length) { erstelleChemiePlatz('Fe', 1); erstelleChemiePlatz('Al', 2); }
  chemieLabor.showModal();
});
document.getElementById('chemieSchliessen').addEventListener('click', function() { chemieLabor.close(); });
