# Next.js SaaS Courses Application - Developer Instructions

**Always reference these instructions first and only fallback to search or additional commands when encountering unexpected information that does not match the information provided here.**

## Project Overview
This is a Next.js SaaS application for online courses built with:
- **Framework**: Next.js 15 with App Router and Turbopack
- **Database**: PostgreSQL with Drizzle ORM
- **Payments**: Stripe integration for subscriptions and one-time purchases
- **Authentication**: NextAuth.js with email/password and Google OAuth
- **UI**: Tailwind CSS with shadcn/ui components
- **Package Manager**: pnpm (required)

## Critical Setup Requirements

### Prerequisites Installation
Install the following prerequisites in order:
```bash
# Install pnpm (required package manager)
npm install -g pnpm

# Install Stripe CLI (required for payments and webhooks)
wget -q https://github.com/stripe/stripe-cli/releases/download/v1.19.4/stripe_1.19.4_linux_x86_64.tar.gz
tar -xzf stripe_1.19.4_linux_x86_64.tar.gz
chmod +x stripe
sudo mv stripe /usr/local/bin/
stripe --version  # Should show version 1.19.4 or newer
```

### Dependencies Installation
```bash
pnpm install
```
**Time**: ~15 seconds. NEVER CANCEL.

## Database Setup and Development Workflow

### Database Setup Process
**CRITICAL**: The application requires environment variables for both building and running. Follow this exact sequence:

1. **Environment Configuration**:
   Run the interactive setup script (requires Stripe CLI to be installed and authenticated):
   ```bash
   # First authenticate with Stripe (required for setup)
   stripe login
   
   # Then run the setup script
   pnpm db:setup
   ```
   **Time**: 2-5 minutes depending on user input. NEVER CANCEL.
   
   This script will:
   - Check Stripe CLI authentication
   - Prompt for PostgreSQL database URL
   - Generate authentication secrets
   - Configure environment variables in `.env` file

2. **Database Migration**:
   ```bash
   # Generate migrations (run this first if no migrations exist)
   pnpm db:generate
   
   # Apply migrations to database
   pnpm db:migrate
   ```
   **Time**: 30 seconds. NEVER CANCEL.
   
   **IMPORTANT**: For `db:migrate` to work, you must temporarily uncomment lines 8-9 in `lib/db/drizzle.ts`:
   ```typescript
   import dotenv from 'dotenv';
   dotenv.config();
   ```
   Remember to comment them back for dev mode.

3. **Database Seeding**:
   ```bash
   pnpm db:seed
   ```
   **Time**: 10 seconds. NEVER CANCEL.
   
   Creates test user: `test@test.com` / `admin123`
   
   **NOTE**: This may fail with Stripe connection errors in network-restricted environments, but it will still create the initial user and team successfully.

### Development Server
```bash
pnpm dev
```
**Time**: Starts in ~3 seconds. Runs at http://localhost:3000

**IMPORTANT**: Comment out the dotenv imports in `lib/db/drizzle.ts` before running dev mode:
```typescript
// import dotenv from 'dotenv';
// dotenv.config();
```

## Build Process

### Build Limitations
**CRITICAL**: The build process has network dependency requirements that may cause failures in restricted environments:

1. **Google Fonts Issue**: Build fails if it cannot access `fonts.googleapis.com`
2. **Stripe API Calls**: Static generation fails if it cannot access `api.stripe.com`

### Build Commands
```bash
pnpm build
```
**Time**: 20-45 seconds when successful. NEVER CANCEL.

**Known Build Issues in Restricted Environments**:
- Font loading from Google Fonts fails
- Static page generation fails due to Stripe API calls
- These are environmental limitations, not code issues

## Testing and Validation

### Manual Validation Scenarios
Always run these validation scenarios after making changes:

1. **Basic Application Flow**:
   - Start development server with `pnpm dev`
   - Navigate to http://localhost:3000
   - Verify homepage loads with app name from environment variables
   - Test navigation to sign-in page at http://localhost:3000/sign-in

2. **Authentication Testing**:
   - Use the alternative login flow at http://localhost:3000/login
   - Enter email: `test@test.com`
   - Enter password: `admin123`
   - **NOTE**: The main sign-in form has client-side validation issues with the seeded password

3. **Database Connectivity**:
   - Verify database connection works
   - Check that migrations apply successfully
   - Confirm seeded data exists

### Database Studio
```bash
pnpm db:studio
```
Opens Drizzle Studio for database management.

## Stripe Integration

### Webhook Testing
For local webhook testing:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```
This requires Stripe CLI authentication and should be run in a separate terminal.

### Test Payment Data
For testing Stripe payments, use:
- Card Number: `4242 4242 4242 4242`
- Expiration: Any future date
- CVC: Any 3-digit number

## Project Structure

### Key Directories
- `app/` - Next.js app router pages and layouts
- `lib/db/` - Database schema, queries, and migrations
- `lib/payments/` - Stripe integration code
- `lib/auth/` - Authentication helpers
- `components/` - Reusable UI components

### Important Files
- `lib/db/setup.ts` - Interactive environment setup script
- `lib/db/migrate.ts` - Database migration runner  
- `lib/db/seed.ts` - Database seeding script
- `lib/db/drizzle.ts` - Database connection (toggle dotenv for different modes)
- `drizzle.config.ts` - Drizzle ORM configuration

## Common Issues and Solutions

### dotenv Configuration
The `lib/db/drizzle.ts` file requires different configurations for different operations:
- **For migration (`pnpm db:migrate`)**: Uncomment dotenv imports
- **For development (`pnpm dev`)**: Comment out dotenv imports (Edge Runtime incompatibility)

### Password Validation Bug
The seeded password `admin123` doesn't pass client-side validation requirements. Use the alternative login flow at `/login` instead of `/sign-in` for testing.

### Network Restrictions
In environments with network restrictions:
- Build process may fail due to Google Fonts and Stripe API access
- Database seeding may partially fail (Stripe products won't be created)
- Application will still function for core features

## Environment Variables
Required variables (set via `pnpm db:setup`):
- `POSTGRES_URL` - Database connection string
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook endpoint secret
- `AUTH_SECRET` - NextAuth.js secret
- `AUTH_GOOGLE_ID/SECRET` - Google OAuth credentials
- `RESEND_API_KEY/ENDPOINT` - Email service configuration
- `APP_NAME/COMPANY_NAME` - Application branding

## Additional Commands
- `pnpm db:studio` - Open database management UI
- Database operations require proper environment setup first

Always ensure environment variables are properly configured before running any database operations or starting the development server.