# Tsunfimeistrid

Eesti Kunstiakadeemia 2026. aasta lõputööde näituse veebileht.

## Ülevaade

See projekt on veebileht, mis tutvustab Eesti Kunstiakadeemia lõputööde näitust. Leht on ehitatud Next.js raamistikuga ja kasutab Tailwind CSS stiilide jaoks.

## Paigaldamine

1. Kloni repositoorium:
   ```bash
   git clone <repository-url>
   cd web
   ```

2. Paigalda sõltuvused:
   ```bash
   npm install
   ```

3. Käivita arendusserver:
   ```bash
   npm run dev
   ```

4. Ava brauseris aadressil `http://localhost:3000`.

## Kasutamine

- **Arendusrežiim**: `npm run dev` - käivitab serveri, mis automaatselt uuendab lehte muudatuste korral.
- **Ehitamine**: `npm run build` - valmistab projekti tootmiseks ette.
- **Käivitamine**: `npm run start` - käivitab ehitatud projekti.

## Struktuur

- `app/` - Next.js rakenduse lehed ja routing.
- `components/` - Korduvkasutatavad React komponendid.
- `lib/` - Abifunktsioonid ja utiliidid.
- `public/` - Staatilised failid.
- `styles/` - Globaalsed stiilid.

## Panustamine

Palun järgi projekti arendusstandardeid ja stiilijuhendeid. Enne muudatuste tegemist veendu, et need on kooskõlas projekti arhitektuuri ja disainisuunistega.

## Litsents

See projekt on loodud Eesti Kunstiakadeemia lõputööde näituse jaoks. Täpsem litsents on määratletud projekti litsentsifailis.
