# trello-app

pnpm workspaces + Turborepo. Identity is the first app; add more under `apps/` as needed.

## Layout

```
trello-app/
├── apps/
│   └── identity-service/     # NestJS — implement auth here
├── packages/
│   ├── typescript-config/    # shared tsconfig (base + nestjs)
│   └── shared/               # shared types / contracts
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

## Commands

```bash
pnpm install
pnpm build                 # turbo: shared → identity-service
pnpm dev:identity          # nest start --watch for identity-service
pnpm lint                  # eslint via turbo (packages with lint script)
pnpm lint:fix              # eslint --fix
pnpm format                # prettier --write
pnpm format:check          # prettier --check
```

Identity listens on `http://0.0.0.0:4002` by default (`PORT`, `BIND_ADDRESS`).

## New workspace package

1. Add folder under `apps/` or `packages/` with its own `package.json`.
2. Use `"@trello-app/foo": "workspace:*"` for internal deps.
3. Run `pnpm install` from the root.
