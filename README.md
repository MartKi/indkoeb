# Indkøbsliste

Delt indkøbsliste med live-sync og automatisk sortering efter butiksafdeling.
Ren statisk webapp (HTML + JS). Ingen egen server nødvendig.

## Kør lokalt (demo-tilstand, uden Firebase)

```bash
cd indkoebsliste
python3 -m http.server 8000
```

Åbn http://localhost:8000. Appen er sat op mod Firebase-projektet `indkoeb-fff3d`.
Sæt `apiKey` til `"DIN_API_KEY"` i `index.html` for at køre i demo-tilstand
(data gemmes kun i din egen browser, ingen deling).

Service workeren (offline-start) virker kun på `https://` og `localhost`. Test på
telefon via lokalnettets IP virker derfor uden offline-start. Brug GitHub Pages til den test.

## Opsætning af live-deling (ca. 10 minutter, gratis)

1. Gå til https://console.firebase.google.com og opret et projekt (Analytics kan slås fra).
2. Byg > **Firestore Database** > Opret database. Vælg region `eur3` (Europa) eller `europe-west1`. Start i produktionstilstand.
3. Fanen **Regler**: indsæt reglerne herunder og udgiv.
4. Projektindstillinger (tandhjulet) > **Dine apps** > Web (`</>`) > registrer app. Kopiér `firebaseConfig`.
5. Indsæt værdierne i `firebaseConfig` øverst i scriptet i `index.html`.

### Firestore-regler

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /lists/{listId}/{document=**} {
      allow read, write: if listId.size() >= 8;
    }
  }
}
```

Reglen dækker både varer (`lists/{kode}/items`) og delt opsætning (`lists/{kode}/meta/config`
med butiksprofiler og lærte rettelser). Den betyder: den, der kender listekoden (min. 8 tegn), har adgang. Der er ingen
login. Koden er genereret tilfældigt (9 tegn) første gang appen åbnes.
Det er fint til en indkøbsliste, men brug ikke mønsteret til følsomme data.
Firebase `apiKey` i web-konfigurationen er ikke en hemmelighed, adgangen styres af reglerne.

## Udgiv på GitHub Pages (gratis hosting)

1. Opret et repository på GitHub (fx `indkoeb`) og upload alle filer i denne mappe.
2. Repository > **Settings** > **Pages** > Source: `Deploy from branch`, branch `main`, mappe `/ (root)`.
3. Efter ca. 1 minut ligger appen på `https://DITBRUGERNAVN.github.io/indkoeb/`.
4. Firebase Console > Authentication > Settings > **Authorized domains**: tilføj `DITBRUGERNAVN.github.io` (kun nødvendigt hvis du senere slår Auth til).

Bemærk: et gratis GitHub-repo med Pages er offentligt. Det er ok her, fordi
Firebase-nøglen ikke er hemmelig, og listerne er beskyttet af listekoden.

## Brug sammen med din kone

1. Åbn appen, tryk **Indstillinger** og kopiér listekoden (eller kopiér hele URL'en inkl. `#kode`).
2. Send linket til din kone. Når hun åbner det, er I på samme liste.
3. iPhone: Safari > Del > **Føj til hjemmeskærm**. Android: Chrome > menu > **Installer app**.

## Funktioner

- Live-sync mellem telefoner, med offline-cache (virker i butikker med dårlig dækning)
- Service worker: appen kan åbnes fra hjemmeskærmen uden net
- Butiksprofiler: vælg butik øverst. Hver butik har sin egen rækkefølge af afdelinger.
  Butikkerne deles med alle på listen, valget af butik gælder kun den enkelte telefon.
- Ret en kategori via 🏷️ ved varen, så husker appen valget til næste gang, også på de andre telefoner
- Hvem skrev varen på: et bogstav ved hver vare. Grøn = dig, orange = den anden. Navnet sættes første gang og kan ændres under Indstillinger.
- Efter indkøb: tryk **Ryd købte** nederst på listen. Ikke-købte varer bliver stående til næste tur. **Tøm listen** ligger ved siden af. Begge kan fortrydes i 4 sekunder.
  Brug samme liste hver gang, så delingslinket og hjemmeskærmsikonet bliver ved med at virke.
- Fejl fra Firestore (fx forkerte regler) vises som en rød besked øverst
- Forslag mens du skriver: "moz" giver mozzarella, "mozarela" og "mlk" virker også. Ét tryk tilføjer varen.
  Forslagene lærer af jeres egne varer (brugsfrekvens deles mellem telefonerne). Tomt felt viser "Ofte købt".
  Appen retter aldrig selv det, du skriver. Enter tilføjer præcis den tekst, der står i feltet.
- Noter til en vare: skriv `yoghurt: jordbær, ellers blåbær`. Alt efter kolon bliver en note, der vises under varen.
  Tryk på et varenavn for at rette navn eller note bagefter. Noten påvirker ikke sortering eller forslag.
- Tilføj flere varer ad gangen med komma: `mælk, æg, agurk`
- Afkrydsede varer flyttes til "Købt" nederst

## Næste skridt

- AI-fallback for ukendte varer (kræver lille serverfunktion, så API-nøglen ikke ligger i browseren)
- Validering i Firestore-reglerne (fx maks. længde på varenavne) og evt. App Check

## Teststatus

- Live-sync mellem to browsere mod Firestore: testet, under 1 sek. forsinkelse
- Delte butiksprofiler og rettelser: testet
- Offline-start via service worker og synkronisering efter genopkobling: testet i Chromium
- Rigtig telefon og hjemmeskærmsinstallation: ikke testet endnu
