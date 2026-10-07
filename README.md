# Wizytówka

Strona wizytówka do CV zbudowana w React + TypeScript (Vite). Animacje wejścia: AOS. Tasowanie sekcji przy przewijaniu: GSAP ScrollTrigger.

## Uruchomienie

```bash
npm install
npm run dev
```

## Treść

Cała treść znajduje się w pliku `src/content.ts`:

- `profile` – dane osobowe, opis, kontakt, technologie,
- `projects` – projekty (status, zdjęcia, podgląd całej strony, linki),
- `theses` – prace dyplomowe,
- `settings` – usługa zrzutów całych stron.

## Zdjęcia

Wszystkie zdjęcia trzymaj w `src/photos`, każdy projekt lub praca we własnym folderze:

```
src/photos/
  cdn24/                 -> projekt CDN 24
  praca-magisterska/     -> praca magisterska
  praca-inzynierska/     -> praca inżynierska
  strony/                -> zrzuty całych stron (pageImage)
```

W polu `images` (projekty i prace dyplomowe) podaj nazwę folderu, np. `images: ['praca-magisterska']`.
Wtedy wystarczy wrzucić nowy plik (png, jpg, webp, avif, gif, svg) do folderu, bez zmian w kodzie.
Zdjęcia są sortowane po nazwie (`01-start.png`, `02-panel.png`, ...).

Konkretny plik można wskazać jako pierwszy, a resztę dobrać z folderu: `images: ['cdn24/cdn-start.png', 'cdn24']`.
Pole `pageImage` działa tak samo, np. `pageImage: 'strony/rezerwacje.svg'`.
Ścieżka zaczynająca się od `/` lub `http` jest używana bez zmian (folder `public` albo zewnętrzny adres).

## Zrzuty całych stron

Projekt z polem `pageUrl` dostaje automatycznie zrzut całej strony z usługi Microlink (darmowy limit dzienny).
Aby nie zależeć od limitu, wygeneruj zrzuty lokalnie przed publikacją:

```bash
npm run screenshots:setup
npm run screenshots
```

Pliki trafią do `public/screenshots`, a mapa adresów do `src/screenshots.json`. Strona użyje ich automatycznie.

## Wersja produkcyjna

```bash
npm run build
```
