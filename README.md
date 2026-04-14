# DevHire

**Post your problem. Get a developer.**

A simple platform where anyone can post a request for developer help -- bug fixes, new features, full projects, or hiring -- and developers respond with proposals.

## How It Works

1. **Create Account** -- Sign up via Clerk authentication
2. **Post a Request** -- Describe what you need, set a budget and timeline
3. **Get Proposals** -- Developers browse requests and send proposals
4. **Pick a Developer** -- Review proposals, accept the best one

## Tech Stack

- **Frontend:** Next.js 16, React 19, TailwindCSS 4, shadcn/ui
- **Backend:** Convex (realtime database + serverless functions)
- **Auth:** Clerk (sign-in/sign-up, user sync via webhooks)
- **Rich Text:** TipTap editor
- **Notifications:** Real-time via Convex subscriptions

## Project Structure

```
app/
  page.tsx                    # Landing page
  (app)/
    layout.tsx                # App shell with nav
    requests/page.tsx         # Browse open requests
    requests/[id]/page.tsx    # Request detail + submit proposal
    post/page.tsx             # Post a new request
    my-posts/page.tsx         # Your posted requests
    my-posts/[id]/page.tsx    # Manage proposals on your request
    proposals/page.tsx        # Your sent proposals
    favorites/page.tsx        # Saved requests
    notifications/page.tsx    # Notification feed
    profile/page.tsx          # Edit profile

convex/
  schema.ts                   # Database schema
  requests.ts                 # Request CRUD + search
  proposals.ts                # Proposal CRUD
  favorites.ts                # Save/unsave requests
  notifications.ts            # Notification system
  profiles.ts                 # User profiles
  payments.ts                 # Payment placeholder (future)
  sync.ts                     # Clerk webhook handlers
  http.ts                     # HTTP routes (webhooks)
```

## Payment Gateway (Coming Soon)

The platform is designed to integrate a custom payment gateway supporting local payment options:
- bKash
- Nagad
- Rocket
- And more

The `payments` table and integration hooks are already in place.

## Development

```bash
pnpm install
pnpm dev
```

Requires:
- Convex project setup
- Clerk project with webhook configured to `/webhooks/clerk`
