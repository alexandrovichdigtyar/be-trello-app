# trello-app

NestJS microservices monorepo on Turborepo + pnpm workspaces.

## Stack

- [pnpm](https://pnpm.io) — package manager (workspaces)
- [Turborepo](https://turborepo.com) — build orchestrator with caching
- [TypeScript](https://www.typescriptlang.org)

## Structure

```
trello-app/
├── apps/                       # NestJS microservices (gateway, users, boards, ...)
├── packages/
│   ├── typescript-config/      # shared tsconfig (base.json, nestjs.json)
│   └── shared/                 # shared DTOs / contracts / types
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

## Getting started

```bash
pnpm install
pnpm build
pnpm dev
```

## Adding a NestJS microservice

```bash
cd apps
nest new gateway --strict --package-manager pnpm
# then in apps/gateway/package.json rename to @trello-app/gateway,
# extend tsconfig from @trello-app/typescript-config/nestjs.json
# and add "@trello-app/shared": "workspace:*" if needed
```
