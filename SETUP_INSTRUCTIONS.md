# SEO Insight Pro - Monetisering Setup

Denna fil innehåller step-by-step instruktioner för att sätta upp autentisering, databas, och betalningsintegration.

## Steg 1: Supabase Setup (5 minuter)

### 1.1 Skapa Supabase-konto
1. Gå till https://supabase.com
2. Registrera med GitHub, Google, eller email
3. Klicka "Create a new project"
4. Ge det ett namn (t.ex. "seo-insight-pro")
5. Välj en region nära dig
6. Vänta på att projektet initieras (1-2 minuter)

### 1.2 Skapa tabeller
1. Öppna projektet
2. Gå till SQL Editor (vänster meny)
3. Klicka "New Query"
4. Kopiera ALLT från `SETUP_SUPABASE.sql` (från denna repos root)
5. Klistra in i SQL Editor
6. Klicka "Run" (överst höger)
7. Vänta på att tabellerna skapas ✓

### 1.3 Kopiera API-nycklar
1. Gå till Settings (vänster meny) → API
2. Under "Project API keys", kopiera:
   - **NEXT_PUBLIC_SUPABASE_URL** → `.env.local`
   - **NEXT_PUBLIC_SUPABASE_ANON_KEY** → `.env.local`
   - **SUPABASE_SERVICE_ROLE_KEY** → `.env.local`

Din `.env.local` ska nu ha:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Steg 2: PayPal Setup (10 minuter)

### 2.1 Registrera PayPal Developer
1. Gå till https://developer.paypal.com
2. Registrera eller logga in
3. Gå till Dashboard → Sandbox → Apps & Credentials
4. Under "Sandbox", kopiera:
   - **Client ID** → `NEXT_PUBLIC_PAYPAL_CLIENT_ID`
   - **Secret** → `PAYPAL_SECRET`

Din `.env.local` ska nu ha:
```
NEXT_PUBLIC_PAYPAL_CLIENT_ID=ABCDxxxx...
PAYPAL_SECRET=ABCDxxxx...
```

### 2.2 Testa PayPal (valfritt)
- Använd **Business Account** för att ta emot betalningar
- Använd **Personal Account** för att göra testköp
- Båda är tillgängliga i Sandbox

---

## Steg 3: Swish Setup (5 minuter) - OPTIONAL

Swish är bara för Sverige. Om du inte behöver det, hoppa över detta.

### 3.1 Registrera Swish Merchant
1. Gå till https://www.swish.nu för att ansöka
2. Fyll i formuläret
3. Vänta på godkännande (1-3 dagar)
4. Du får API-nyckel via email
5. Lägg till i `.env.local`:
```
SWISH_API_KEY=your_swish_key
SWISH_MERCHANT_ID=your_merchant_id
```

---

## Steg 4: Admin Access Setup (2 minuter)

### 4.1 Sätt admin-hemlig URL
1. Öppna `.env.local`
2. Sätt en hemlig sträng:
```
NEXT_PUBLIC_ADMIN_SECRET=hemligsträng123abc456def789
```

Du kan komma åt admin-panelen på: `/admin?token=hemligsträng123abc456def789`

---

## Steg 5: Starta AppensINSTALLER DEPENDENCIES:
```bash
npm install
```

START DEV SERVER:
```bash
npm run dev
```

Appen är nu live på http://localhost:3000

---

## Testa Flödet

### Test 1: Gratis analys
1. Öppna http://localhost:3000
2. Analysera en sida utan att logga in
3. Du får **1 gratis analys**
4. Försök analysera igen → "Köp paket"-modal visas ✓

### Test 2: Registrera & Inloggning
1. Klicka "Register"
2. Fyll i email + lösenord
3. Du blir auto-inloggad
4. Du får **0 krediter** (måste köpa)

### Test 3: PayPal-köp (SANDBOX)
1. Logga in
2. Gå till `/buy`
3. Klicka "PayPal"
4. Du omdirigeras till PayPal Sandbox
5. Använd **test-kontot** (Personal Account)
6. Du får **5 krediter** ✓

### Test 4: Admin-panel
1. Gå till `/admin?token=hemligsträng123abc456def789`
2. Du ser statistik: användare, intäkt, analyser
3. Topdomäner visas

---

## Troubleshooting

### "SUPABASE_URL is undefined"
- Kontrollera att `.env.local` är korrekt
- Starta om dev server: `npm run dev`

### "PayPal error"
- Kontrollera att `PAYPAL_CLIENT_ID` är från **Sandbox**, inte Live
- Använd test-konton från PayPal Dashboard

### "Analys använder kredit även för gratis användare"
- Detta är korrekt! Gratis användare får 1 kostnadsfri analys
- Efter det måste de registrera och köpa

---

## Nästa Steg

1. ✓ Supabase är inställt
2. ✓ PayPal integrerat
3. ✓ Admin-panelen fungerar
4. ⏭️ Anpassa priser/paket i plan-filen
5. ⏭️ Sätt upp live-certifikater (SSL)
6. ⏭️ Distribuera till produktion

---

## Kontakt & Support

Om något inte fungerar:
- Kontrollera `.env.local` för fel
- Kolla Supabase logs i admin-panelen
- Verifiera att tabellerna är skapade i Supabase

Lycka till! 🚀
