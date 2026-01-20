# Changelog

## [2.0.0] - MVP Refactoring

### Added
- **Storage Adapters**: Standardized interface with MemoryAdapter (server) and ClientStorageAdapter (client)
- **IndexedDB Support**: Client now uses IndexedDB via localForage with localStorage fallback
- **Cart API**: Full cart management endpoints
- **Delivery API**: Delivery state management endpoints
- **Analytics API**: Comprehensive analytics endpoints (supply/demand trends, price distribution, top sellers, delivery times)
- **Khmer Language**: All UI text converted to Khmer (ភាសាខ្មែរ)
- **Bromoul Branding**: Applied brand colors (White, Green #4CAF50, Orange #FF9800) and Noto Sans Khmer font
- **Unit Tests**: Jest test suite for storage adapter
- **CI/CD**: GitHub Actions workflow for automated testing
- **Documentation**: Comprehensive README and migration guide

### Changed
- **Server Entry Point**: Moved from `server.js` to TypeScript `src/server.ts`
- **Storage Architecture**: Replaced database with in-memory storage (server) and browser storage (client)
- **API Responses**: All error messages now in Khmer
- **Analytics Events**: Automatic event emission on listing create/update/delete, cart adds, payments, delivery state changes
- **Cart Service**: Refactored to use API endpoints instead of localStorage directly
- **Socket.IO**: Properly integrated with HTTP server

### Removed
- `server/server.js` - Legacy server file
- `server/telegramBot.js` - Telegram bot integration
- Docker dependencies
- Database dependencies

### Fixed
- TypeScript compilation errors
- ESLint issues
- Socket.IO integration
- Payment webhook processing
- Analytics event tracking

### Security
- JWT authentication maintained
- Password hashing with bcrypt
- CORS and Helmet middleware configured

## [1.0.0] - Initial Release
- Basic marketplace functionality
- Docker-based deployment
- PostgreSQL database
