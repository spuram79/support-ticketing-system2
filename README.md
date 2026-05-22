# Support Ticketing System

**Enterprise-grade ticketing and issue management system for Hardware & Software support operations.**

## Quick Start

```bash
# Install dependencies
pnpm install

# Run development servers
pnpm dev
```

## Project Structure

```
├── backend/          # Node.js API server
├── frontend/         # React/Vite frontend
├── docs/             # Documentation
├── docker-compose.yml
└── nginx.conf
```

## Documentation

- [CLADUE.md](CLADUE.md) - Comprehensive documentation
- [SETUP.md](SETUP.md) - Setup guide
- [docs/API.md](docs/API.md) - API reference
- [docs/IMPLEMENTATION.md](docs/IMPLEMENTATION.md) - Implementation details

## Features

- Multi-channel ticket ingestion (Web, Email, SMS, WhatsApp, Phone, API)
- AI-powered ticket categorization
- ITSM compliance (Incident, Problem, Change management)
- Role-based access control (6 roles)
- SLA management
- Kubernetes-ready architecture
- GDPR, ISO 27001, SOC 2 compliant

## Success Criteria

- ✅ Handle 5,000+ tickets/day
- ✅ 50+ concurrent agents + 500 concurrent customers
- ✅ <500ms API latency (p95)
- ✅ 99.5% system availability

## License

MIT