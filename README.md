# GiftList - Universal Gift Registry Platform

A universal gift registry web platform where users create registries, add items from any store, sync external registries, and share with gift givers.

## Demo Credentials

| Role            | Email               | Password |
|-----------------|---------------------|----------|
| Registry Owner  | sarah@example.com   | any      |
| Admin           | admin@giftlist.com  | any      |

> Password can be anything - this is a mock API demo.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Key Pages

- `/` - Landing page
- `/login` - Sign in
- `/register` - Create account
- `/dashboard` - Registry owner dashboard
- `/admin` - Admin portal (use admin credentials)
- `/registry/sarah-davids-wedding` - Public registry (gift giver view)

## Tech Stack

- Vite + React + TypeScript
- TailwindCSS v4
- React Router v6
- Zustand (state management)
- Framer Motion (animations)
- Embla Carousel
- Sonner (toast notifications)
- Lucide React (icons)

## Build

```bash
npm run build
```

## Deploy to Vercel

Push to a Git repo and import in Vercel. The `vercel.json` handles SPA rewrites automatically.
