# Tests

Detta projekt innehåller omfattande tester för Node.js backend, organiserade i enhetstester och integrationstester.

## Struktur

```
tests/
├── unit/              # Enhetstester
│   ├── controllers/   # Controller tests
│   ├── services/      # Service tests
│   ├── repositories/  # Repository tests
│   ├── utils/         # Utility tests
│   ├── eventbus/      # Event bus tests
│   └── scheduler/     # Scheduler tests
├── integration/       # Integrationstester
│   ├── api/           # API endpoint tests
│   ├── services/      # Service integration tests
│   └── scheduler/     # Scheduler integration tests
├── helpers/           # Test helpers och mocks
└── setup/             # Jest setup och teardown
```

## Kör Tester

### Alla tester
```bash
npm test
```

### Endast enhetstester
```bash
npm run test:unit
```

### Endast integrationstester
```bash
npm run test:integration
```

### Watch mode
```bash
npm run test:watch
```

### Coverage
```bash
npm run test:coverage
```

## Test Coverage

- **Unit Tests**: 80%+ coverage för services, repositories, utils
- **Integration Tests**: Alla kritiska API endpoints och workflows
- **Critical Paths**: 100% coverage för:
  - Job posting scanning flow
  - PDF scanning flow
  - Action execution flow
  - Scheduler jobs
  - Event bus

## Mocking Strategy

- **Database**: Mock Prisma client för unit tests
- **External APIs**: Mock OpenAI/AI SDK, Puppeteer, fetch
- **File System**: Mock PDF buffers
- **Time**: Mock dates för scheduler tests

## Test Helpers

- `mocks.ts` - Shared mocks för Prisma, AI, Puppeteer, etc.
- `fixtures.ts` - Test data fixtures
- `test-db.ts` - Database helpers
- `test-server.ts` - Express app för testing
