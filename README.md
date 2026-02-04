# 🏛️ System Rezerwacji Sal - Gościniec Rodzinny

## 📋 Opis

Profesjonalny, modułowy system rezerwacji sal dla restauracji **Gościniec Rodzinny** (Świętochłowice). Enterprise-grade aplikacja z pięknym UX, pełną walidacją i ewidencją zmian.

## 🚀 Funkcjonalności

### Moduły:
- ✅ **Rezerwacje** - pełne zarządzanie rezerwacjami sal
- 👥 **Klienci** - baza danych klientów
- 🔐 **Autentykacja** - bezpieczne logowanie
- 📊 **Statystyki** - raporty i analizy
- 🛡️ **Administracja** - zarządzanie systemem
- 💾 **Backup** - automatyczne kopie zapasowe

### Główne cechy:
- 📄 Generowanie PDF z rezerwacjami
- 📧 Automatyczna wysyłka emaili
- 💰 Kalkulacja cen (za osobę lub całość)
- ⏱️ Domyślnie 6h rezerwacji z auto-dolicza niem
- 💳 System zaliczek z terminem płatności
- 📎 Załączniki do rezerwacji
- 📜 Pełna historia zmian
- 🔍 Walidacja wszystkich pól
- 📱 Responsywny design
- ✨ Piękne animacje (Framer Motion)

## 🏗️ Architektura

```
system-rezerwacji/
├── backend/         # Node.js + Express + TypeScript + Prisma
├── frontend/        # React + TypeScript + Tailwind + Framer Motion
├── docker-compose.yml
└── README.md
```

## 🛠️ Stack Technologiczny

- **Backend**: Node.js 20, Express, TypeScript, Prisma ORM
- **Frontend**: React 18, TypeScript, Tailwind CSS, Framer Motion
- **Baza danych**: PostgreSQL 16
- **Konteneryzacja**: Docker + Docker Compose
- **PDF**: Puppeteer
- **Email**: Nodemailer
- **Autentykacja**: JWT + bcrypt

## 📦 Instalacja i Uruchomienie

### Wymagania:
- Docker Desktop
- Docker Compose

### Szybki start:

```bash
# 1. Sklonuj repozytorium
git clone https://github.com/kamil-gol/system-rezerwacji.git
cd system-rezerwacji

# 2. Uruchom wszystko jedną komendą
docker-compose up --build

# 3. Aplikacja dostępna:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:5000
# - PostgreSQL: localhost:5432
```

### Pierwsze logowanie:

**Konto administratora:**
- Login: `admin@goscinie crodzinny.pl`
- Hasło: `Admin123!@#$`

**Konto managera:**
- Login: `manager@goscniecrodzinny.pl`
- Hasło: `Manager123!@#`

## 🔧 Konfiguracja

Edytuj `docker-compose.yml` aby dostosować:
- Dane SMTP (email)
- JWT Secret
- Hasła bazy danych

## 📖 Dokumentacja API

Po uruchomieniu dostępna pod: `http://localhost:5000/api-docs`

### Główne endpointy:

#### Autentykacja
- `POST /api/auth/login` - logowanie
- `POST /api/auth/refresh` - odświeżenie tokena
- `POST /api/auth/logout` - wylogowanie

#### Rezerwacje
- `GET /api/reservations` - lista rezerwacji (paginacja)
- `POST /api/reservations` - nowa rezerwacja
- `GET /api/reservations/:id` - szczegóły rezerwacji
- `PUT /api/reservations/:id` - edycja (wymaga powodu)
- `DELETE /api/reservations/:id` - anulowanie (wymaga powodu)
- `GET /api/reservations/:id/pdf` - generowanie PDF
- `POST /api/reservations/:id/send-email` - wysyłka email
- `GET /api/reservations/upcoming` - nadchodzące rezerwacje
- `GET /api/reservations/:id/history` - historia zmian

#### Klienci
- `GET /api/customers` - lista klientów
- `POST /api/customers` - nowy klient
- `GET /api/customers/:id` - szczegóły klienta
- `PUT /api/customers/:id` - edycja klienta

#### Sale
- `GET /api/rooms` - lista sal
- `GET /api/rooms/:id/availability` - dostępność sali

#### Statystyki
- `GET /api/statistics/overview` - przegląd statystyk
- `GET /api/statistics/revenue` - przychody
- `GET /api/statistics/popular-events` - popularne wydarzenia

#### Backup
- `POST /api/backup/create` - tworzenie backupu
- `GET /api/backup/list` - lista backupów
- `POST /api/backup/restore/:id` - przywracanie

## 🎨 Sale

1. **Sala Kryształowa** - max 40 osób
2. **Sala Bankietowa** - max 80 osób
3. **Sala Rodzinna** - max 25 osób
4. **Sala VIP** - max 15 osób

## 📅 Typy Wydarzeń

- 💍 Wesele
- 🎂 Urodziny
- 💼 Spotkanie biznesowe
- 🎓 Rocznica
- 🎉 Przyjęcie okolicznościowe
- 🎄 Wigilia firmowa
- 👶 Chrzciny
- 💐 Komunie

## 🔒 Bezpieczeństwo

- Hasła: min. 12 znaków, duże/małe litery, cyfry, znaki specjalne
- Szyfrowanie haseł: bcrypt (10 rounds)
- Tokeny JWT z expiracją
- Walidacja wszystkich inputów
- Rate limiting na API
- SQL Injection protection (Prisma)
- XSS protection
- CORS configuration

## 📊 Funkcje Specjalne

### Kalkulacja Ceny
- **Opcja 1**: Cena za osobę × liczba osób
- **Opcja 2**: Cena całościowa (stała)
- Auto-przeliczanie w czasie rzeczywistym

### Zarządzanie Czasem
- Domyślnie: 6 godzin
- Powyżej 6h: automatyczny wpis w uwagach
- Format dat: `dd.mm.yyyy`

### Zaliczki
- Wymagane pole: kwota i termin
- Walidacja: max 1 dzień przed wydarzeniem
- Przypomnienia email

### Historia Zmian
- Każda edycja wymaga powodu
- Każde anulowanie wymaga powodu
- Pełny audit log z timestampami
- Informacja o użytkowniku wykonującym zmianę

## 🧪 Dane Testowe

System zawiera:
- 3 użytkowników (Admin, Manager, Pracownik)
- 15 klientów testowych
- 20 rezerwacji (przeszłe, obecne, przyszłe)
- 4 sale konferencyjne
- 8 typów wydarzeń

## 🚀 Deployment

### Produkcja:

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d

# Migrations
docker exec rezerwacje-backend npx prisma migrate deploy
```

## 🐛 Troubleshooting

### Problem z połączeniem do bazy:
```bash
docker-compose down -v
docker-compose up --build
```

### Resetowanie bazy danych:
```bash
docker exec rezerwacje-backend npx prisma migrate reset
```

### Logi:
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 📞 Kontakt

**Gościniec Rodzinny**
- Adres: ul. Bukowa 155, 41-600 Świętochłowice
- Web: [goscniecrodzinny.pl](https://goscniecrodzinny.pl)

## 📝 Licencja

MIT License - © 2026 Gościniec Rodzinny

---

**Made with ❤️ for Gościniec Rodzinny**
