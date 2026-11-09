# Lightning Chama Vault

Lightning Chama Vault is a decentralized digital platform designed to support group savings (Chama) management by making contributions, loans, and member activities transparent, secure, and easy to manage. It works on Web or USSD (offline-first).

The platform digitizes the traditional Chama model while preserving trust, accountability, and community collaboration.

## Run Locally

### Prerequisites

- Node.js 20 or newer
- [pnpm](https://pnpm.io/installation)
- Access to the ChamaVault backend and its wallet-provider value

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure private environment variables

Copy the example file to a local environment file:

```bash
cp .env.example .env.local
```

Set the following values in `.env.local`:

```env
CHAMAVAULT_API_BASE_URL=http://localhost:3000/
CHAMAVAULT_WALLET_PROVIDER=MPESA
```

To get the correct URLs reachout to Dev-In-Charge

These are server-only variables. Do not rename them with a `NEXT_PUBLIC_` prefix or use them directly in client components. `.env.local` is ignored by Git and must not be committed.

### 3. Start the application

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

The browser sends backend requests to the local `/api/chamavault/*` server proxy. The proxy forwards them to `CHAMAVAULT_API_BASE_URL` and privately adds `CHAMAVAULT_WALLET_PROVIDER` to wallet-list requests. This keeps the backend address and provider value out of browser code and request URLs.

After changing an environment variable, stop and restart the development server.

### Production checks

```bash
pnpm lint
pnpm build
```

For Vercel deployments, add the same two environment variables in the project settings and redeploy the application.

## What is a Chama?

A Chama is a group-based savings system where members contribute money regularly and collectively decide how the funds are used — for savings, loans, or investments.

Chama Vault enables groups to manage this process digitally with real-time visibility and structured workflows.

## How It Works

1. Users sign up and verify their phone numbers via OTP.
2. A user can create or join a Chama.
3. Members contribute funds based on agreed cycles (weekly/monthly) via USSD or Web. Funds go into a shared Chama Vault.
4. Members can request loans from the group.
5. Admins review and approve loan requests.
6. All transactions and activities are recorded and visible to members.
7. Withdrawals require two approvals (multi-signature).

## Features

- User authentication with OTP verification
- Create and join Chamas
- Group wallet with balance tracking
- Contribution tracking
- Loan request and repayment management
- Recent activity logs
- Mobile-first, responsive UI
- Multi-signature withdrawals for enhanced security

## Tech Stack

### Frontend
- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS

### Backend / APIs
- Java (REST APIs)
- OTP-based authentication
- Secure data handling

### Database
- MySQL

### Deployment & Tools
- Vercel (Frontend deployment)
- Git & GitHub
- Figma (UI/UX Design)

## Live URLs

- Frontend Application: To be added
- API Endpoint: To be added

> Live links will be updated after deployment.

## Contributing

We welcome contributions to Lightning Chama Vault.

Please read our contributing guidelines before submitting a pull request:  
[CONTRIBUTING.md](./CONTRIBUTING.md)

## License

This project is licensed under the terms specified in the LICENSE file.  
[View License](./LICENSE)

## Pitch Deck

View our latest pitch deck here:  
https://www.canva.com/design/DAG_VqltlOs/ISmEFo7-gPOYyKnBZ4j1Rw/edit?utm_content=DAG_VqltlOs&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton

## Contact

For questions, feedback, or collaboration:

- GitHub Organization: https://github.com/DadaDevelopers

Built by the Lightning Chama Vault team.
