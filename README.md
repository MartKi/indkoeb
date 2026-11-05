# Indkøbsliste

Delt indkøbsliste med live-sync og automatisk sortering efter butiksafdeling.
Ren statisk webapp (HTML + JS). Ingen egen server nødvendig.

## Kør lokalt (demo-tilstand, uden Firebase)

```bash
cd indkoebsliste
python3 -m http.server 8000
```

Åbn http://localhost:8000. Uden Firebase-opsætning kører appen i demo-tilstand
(data gemmes kun i din egen browser, ingen deling).

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
    match /lists/{listId}/items/{itemId} {
      allow read, write: if listId.size() >= 8;
    }
  }
}
```

Reglen betyder: den, der kender listekoden (min. 8 tegn), har adgang. Der er ingen
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
- Auto-sortering via nøgleordsliste, rækkefølgen kan tilpasses din butik under Indstillinger
- Ret en kategori manuelt, så husker appen valget til næste gang
- Tilføj flere varer ad gangen med komma: `mælk, æg, agurk`
- Afkrydsede varer flyttes til "Købt" nederst

## Næste skridt

- AI-fallback for ukendte varer (kræver lille serverfunktion, så API-nøglen ikke ligger i browseren)
- Flere butiksprofiler med hver sin kategorirækkefølge
- Delt læring: gem rettelser i Firestore, så begge får gavn af dem
