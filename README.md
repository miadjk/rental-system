# Cho Rental — Dress Rental Tracking System

Single-owner dress rental tracker built with **Next.js (App Router) + React + TypeScript + Tailwind CSS**.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Owner access (no login accounts)

- Password screen only. Set via `.env.local` (prototype default is hardcoded server-side):
  ```
  APP_PASSWORD=Cho2026!
  ```
- Must be at least 8 chars with letters + numbers + symbol.
- Verified server-side via `POST /api/auth`; session kept in `sessionStorage`.
- `Lock System` button returns to the password screen.

## Workflow

```
Password → Dashboard → Inventory → Add Dress → Add Rent
→ Rented → Rental Tracking → Due Today / Overdue
→ Return Tracking → Return → Available → Rental History
```

- Add Rent is manual text entry (no dropdown): Dress Name, Customer Name, Rental/Return dates, Rental Fee.
- On save: normalized name match (trimmed, case-insensitive) links + flips Available → Rented; unknown name asks Add to Inventory / Continue Rental; active-name clash is blocked with "currently rented" message.
- Return saves actual date, condition (Good / Minor Damage / Damaged), remarks; Damaged or flagged → `Unavailable`, else → `Available` (standalone rentals touch no inventory).
- Due Today: `expected_return_date === today` (active). Overdue: `expected < today` + auto day count.
- Archive preserves history (dresses become `Archived`, hidden from active lists).

## Data

- Persistent `localStorage` layer (`src/lib/storage.ts`) with relational shape:
  - `dresses`: id, dress_name, quantity, rental_price, date_added, status
  - `rentals`: id, dress_name (typed), dress_id (link or null), customer_name, rental_date, expected_return_date, actual_return_date, rental_fee, status, condition, remarks
  - `returns`: id, rental_id, actual_return_date, condition, remarks
- Seeded with Fitted Pink / Black Glitz (rented to Maria) / Valentina + 4 Black Glitz history records.
- Swap `StoreContext` persistence to a real DB later without touching UI.

## Design

- Palette: `#FFDBBB` accent, `#CCBEB1` borders, `#997E67` secondary, `#664930` brand text, off-white `#FAF8F5` dominant. Green/red reserved for Available/Rented functional status.
- Fonts: Space Mono (headings/numbers) + Plus Jakarta Sans (body).
- Reusable: Sidebar, Header, StatCard, StatusBadge, DataTable, SearchBar, FilterDropdown, Modal, FormInput, SelectInput, ConfirmDialog, EmptyState, Toast.
- Responsive: sidebar → hamburger, tables → cards on mobile.
