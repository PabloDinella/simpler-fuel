# ⛽ Simpler Fuel

A cross-platform fuel consumption tracking app built with Tauri, React, RxDB, and Supabase.

## Features

- 📊 Track fuel consumption with odometer readings and fuel amounts
- 🔄 Offline-first with automatic cloud sync
- 📈 View consumption statistics and trends
- 🌍 Multiple unit systems (km/L, mpg, L/100km, etc.)
- 🌐 Multi-language support (English, Spanish)
- 🔐 Secure authentication with Supabase
- 📱 Cross-platform: Web, Desktop (Windows, macOS, Linux)

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Routing**: TanStack Router
- **Database**: RxDB (offline-first) + Dexie (IndexedDB)
- **Backend**: Supabase (PostgreSQL + Realtime + Auth)
- **Desktop**: Tauri 2
- **i18n**: react-i18next

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Rust and Cargo (for Tauri development)
- A Supabase account (free tier available)

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/simpler-fuel.git
cd simpler-fuel
npm install
```

### 2. Setup Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `supabase-schema.sql` in your Supabase SQL Editor
3. Get your project URL and anon key from Settings → API
4. Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions.

### 3. Run Development Server

**Web mode:**
```bash
npm run dev
```

**Tauri desktop mode:**
```bash
npm run tauri dev
```

### 4. Build for Production

**Web:**
```bash
npm run build
```

**Desktop:**
```bash
npm run tauri build
```

## Project Structure

```
src/
├── db/               # RxDB database and replication setup
├── routes/           # TanStack Router pages
├── components/       # Reusable React components
├── lib/              # Utilities (auth, units conversion)
├── i18n/             # Internationalization config
└── App.tsx           # Main app component

src-tauri/            # Tauri Rust backend
```

## How It Works

1. **Offline-First**: All data is stored locally in RxDB (IndexedDB)
2. **Auto Sync**: RxDB replicates with Supabase PostgreSQL when online
3. **Real-time**: Changes from other devices appear instantly via Supabase Realtime
4. **Unit Conversion**: User inputs in preferred units → stored in base units (km, L) → displayed in preferred units
5. **Consumption Calculation**: Automatically calculated from consecutive entries

## Development Plan

See [PLAN.md](./PLAN.md) for the complete implementation plan and roadmap.

## Future Enhancements

- 📱 iOS and Android support (Tauri mobile)
- 📊 Advanced charts and visualizations
- 🚗 Multiple vehicle support
- 📍 Gas station price tracking
- 🔔 Maintenance reminders

## License

MIT

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/)
- [Tauri Extension](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)
- [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
