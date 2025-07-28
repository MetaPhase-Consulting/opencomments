# OpenComments

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Open Source](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://opensource.org/)
[![CivicTech](https://img.shields.io/badge/Civic-Tech-1f7a8c)](https://github.com/brianfunk/opencomments)
[![Built by MetaPhase](https://img.shields.io/badge/Built%20by-MetaPhase-fb641f)](https://metaphase.tech)
[![LinkedIn](https://img.shields.io/badge/Linked-In-0077b5)](https://www.linkedin.com/company/metaphase-consulting-llc/)
[![Netlify Status](https://api.netlify.com/api/v1/badges/4775fe17-b688-41cc-9426-917c8a5a94b2/deploy-status?branch=dev)](https://app.netlify.com/projects/opencomments/deploys)
[![Accessibility](https://img.shields.io/badge/Accessibility-WCAG%202.1%20AA-green)](https://www.w3.org/WAI/WCAG21/quickref/)
[![Security](https://img.shields.io/badge/Security-SOC%202-blue)](https://netlify.com/security)
[![Uptime](https://img.shields.io/badge/Uptime-99.99%25-brightgreen)](https://status.opencomments.us)

# OpenComments

OpenComments is a modern, accessible public commenting platform that enables transparent government by making it easy for agencies to collect, moderate, and publish public feedback on policies and proposals.

## 🏛️ Project Purpose

OpenComments bridges the gap between government agencies and citizens by providing a secure, user-friendly platform for public comment periods. Built with modern web technologies and designed for accessibility, it ensures every voice can be heard in the democratic process.

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Testing**: Vitest + Cypress + Playwright
- **Deployment**: Netlify (Frontend) + Supabase (Backend)
- **CI/CD**: GitHub Actions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Setup
```bash
# Clone repository
git clone https://github.com/brianfunk/opencomments.git
cd opencomments

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Configure your Supabase credentials in .env
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key

# Apply database migrations
npm run db:migrate

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the application.

## 📁 Folder Structure

```
opencomments/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Route components
│   │   ├── agency/         # Agency admin portal
│   │   └── public/         # Public-facing pages
│   ├── hooks/              # Custom React hooks
│   ├── contexts/           # React context providers
│   ├── lib/                # Utilities and configurations
│   └── types/              # TypeScript type definitions
├── supabase/
│   ├── migrations/         # Database schema changes
│   └── functions/          # Edge functions
├── tests/                  # Test files
├── docs/                   # Documentation
└── public/                 # Static assets
```

## 🧪 Development

### Testing
```bash
# Run unit tests
npm run test

# Run E2E tests
npm run cypress:run

# Run accessibility tests
npm run test:a11y
```

### Database
```bash
# Apply migrations
npm run db:migrate

# Reset database (development only)
supabase db reset
```

### Quality Assurance
Before deploying, ensure all tests pass:
1. Unit tests: `npm run test`
2. E2E tests: `npm run cypress:run`
3. Accessibility: `npm run test:a11y`
4. Manual QA: Follow `QA_CHECKLIST.md`

## 📚 Documentation

- **[DEVELOPER.md](docs/DEVELOPER.md)** - Development setup and workflows
- **[DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)** - Production deployment instructions
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System design and technical overview
- **[DATAMODEL.md](docs/DATAMODEL.md)** - Database schema and relationships
- **[AGENCY_ONBOARDING.md](docs/AGENCY_ONBOARDING.md)** - First-time agency setup guide
- **[AGENCY_ADMIN_GUIDE.md](docs/AGENCY_ADMIN_GUIDE.md)** - Guide for government staff
- **[PUBLIC_USER_GUIDE.md](docs/PUBLIC_USER_GUIDE.md)** - Guide for citizens
- **[OPERATIONS_RUNBOOK.md](docs/OPERATIONS_RUNBOOK.md)** - Production operations guide
- **[SECURITY_AUDIT_GUIDE.md](docs/SECURITY_AUDIT_GUIDE.md)** - Security audit procedures
- **[ACCESSIBILITY_TRACKER.md](docs/ACCESSIBILITY_TRACKER.md)** - Accessibility compliance tracking
- **[PERFORMANCE_NOTES.md](docs/PERFORMANCE_NOTES.md)** - Performance optimization guide

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `docs/` folder for detailed guides
- **Issues**: Report bugs via GitHub Issues
- **Email**: [support@opencomments.us](mailto:support@opencomments.us)

---

**Built with ❤️ for transparent government**
