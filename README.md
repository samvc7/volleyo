# 🏐 Volleyo

**Volleyo** is a full-stack volleyball team, event and statistics tracking web application. 

## 🚀 Features

- ✅ Manage teams and members
- 📅 Create and organize events (games, training sessions, social - like a team building event)
- 🧑‍🤝‍🧑 Add attendees to events with roles, positions, and player numbers
- 🗳️ Voting system for event attendance
- 📥 Invitation-based login flow with token authentication
- 🔒 Role-based access control (Admin / Member)
- 📊 Track detailed player statistics for each game
- 📈 Leaderboards with aggregated player stats and general team statistics
- 💡 Dynamic UI using TailwindCSS and ShadCN

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS, ShadCN UI
- **Backend**: Next.js (App Router), NextAuth.js, Prisma
- **Database**: PostgreSQL via Supabase
- **Auth**: Credentials & token-based flow with NextAuth
- **Deployment**: Vercel

## 📚 Getting Started

1. Clone the repo:

```bash
git clone https://github.com/samvc7/volleyo.git
cd volleyo
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:
    
    Create a .env file in the root with the following:
    

```bash
DATABASE_URL=your_postgres_connection_string
NEXTAUTH_SECRET=your_auth_secret
NEXTAUTH_URL=http://localhost:3000
```

4. Generate Prisma client:

```bash
npx prisma generate
```

5. Run locally:

```bash
pnpm dev
```

🤝 Contributing
This is a personal project and not open to external contributions at the moment. However, feel free to fork and adapt!

📄 License
MIT