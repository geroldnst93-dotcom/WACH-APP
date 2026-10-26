# WACH

Lokale CBT-I-App gegen die Angst vor Schlaflosigkeit. Expo (React Native) +
TypeScript, local-first mit `expo-sqlite`, kein Backend.

## Architektur

- **`src/domain/`** – reine, getestete Logik (keine React/Native-Abhängigkeiten):
  Datenmodell (`SleepDay`), Kennzahlen (TST/SE/Vorhersage-Lücke), Titration
  (Schlaffenster, nie < 5 h) und die idempotente Programm-Engine `computeProgram`.
- **`src/db/`** – `SleepDayRepository` / `AppStateRepository` auf einer schmalen
  `SqlDatabase`-Schnittstelle (deckungsgleich mit expo-sqlite). Tests laufen gegen
  echtes SQLite via `sql.js`.
- **`src/services/`** – `ProgramService` verbindet DB und Engine; das Schlaffenster
  wird aus den Daten abgeleitet, nicht gespeichert.
- **`src/ui/`** – Theme, Bausteine, DB-Context und die Tagebuch-Modi.
- **`app/`** – `expo-router`-Routen (Gate, Onboarding, Diary).

## Entwicklung

```bash
npm install
npm test          # Unit-Tests (Domäne + DB gegen sql.js)
npm run typecheck # tsc --noEmit
npm start         # Expo-Dev-Server
```
