# Memory

Frontend-Projekt eines Memory-Spiels mit `TypeScript`, `Vite` und `SCSS`.

In der Anwendung kann man:

- ein Spielthema auswählen;
- den Startspieler auswählen;
- die Spielfeldgröße `16`, `24` oder `36` wählen;
- das Spiel auf einer separaten Seite starten;
- eine laufende Partie innerhalb derselben Browser-Sitzung fortsetzen.

## Technologien

- `TypeScript`
- `Vite`
- `SCSS`

## Lokaler Start

Voraussetzung ist ein installiertes `Node.js`.

```bash
npm install
npm run dev
```

Nach dem Start stellt Vite eine lokale Entwicklungsadresse bereit.

## Build

```bash
npm run build
```

Der Production-Build wird im Ordner `dist` erstellt.

Zur lokalen Prüfung der Production-Version:

```bash
npm run preview
```

## Seitenstruktur

- `index.html` — Startseite
- `src/subpages/settings.html` — Einstellungsseite
- `src/subpages/game.html` — Spielseite

Das Projekt ist in Vite als `multi-page app` konfiguriert, siehe `vite.config.ts`.

## Speicherung des Zustands

- `localStorage` speichert die ausgewählten Spieleinstellungen;
- `sessionStorage` speichert den aktuellen Spielstand, solange die Browser-Sitzung aktiv ist.

Für den Betrieb des Projekts werden weder Backend noch Datenbank benötigt.

```

```
