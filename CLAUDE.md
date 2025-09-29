# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

- `npm run dev` - Start the development server with Turbopack
- `npm run build` - Build the production application with Turbopack
- `npm run start` - Start the production server
- `npm run db` - Open SQLite database shell for `./prisma/dev.db`

### Database Commands
- `npx prisma migrate dev` - Run database migrations and sync schema
- `npx prisma generate` - Generate Prisma client after schema changes
- `npx prisma db push` - Push schema changes to database without migration
- `npx prisma studio` - Open Prisma Studio to browse and edit data

## Architecture Overview

This is a Next.js 15 application using the App Router that manages conversation data for a customer service system (drillbit operations). The application displays and processes conversation records including messages, actions, and metadata.

### Core Components

**Database Layer (SQLite + Prisma)**
- Schema defined in `prisma/schema.prisma`
- Three main models: `Conversation`, `Message`, `MessageAction`
- Conversations track phone numbers, job types, urgency levels, and status
- Messages belong to conversations and can have multiple associated actions
- Supports both call and text conversation types

**Data Import System**
- `/api/init` endpoint clears and reimports all conversation data
- Reads JSONL files from `data/conversations/{calls,texts}/{date}/` structure
- Processes conversation metadata and message history with actions
- Bulk inserts data for performance using `createManyAndReturn` for efficiency
- Supports both call and text conversation types with automatic type detection

**API Endpoints**
- `/api/init` (POST) - Bulk import conversation data from JSONL files
- `/api/conversations` (POST) - Advanced conversation querying with filters, pagination, and sorting
- `/api/messages` - Message-related operations
- `/api/actions` - Message action operations

**Frontend Architecture**
- Main page (`app/page.tsx`) redirects to action center
- Action Center (`app/action-center/page.tsx`) - Primary interface showing conversations needing human intervention
- Filters conversations by `Status.blocked_needs_human` status
- Conversation grid with urgency-based sorting (highest urgency first)
- Individual conversation pages (`app/conversations/[id]/page.tsx`)
- Analytics dashboard (`app/analytics/page.tsx`)
- RefreshButton and InitButton components for data management

### Data Structure

**Conversation Model** (`prisma/schema.prisma`):
- Phone number (string identifier)
- Job type and urgency level (1-10 scale)
- Current status (enum: declined, spam, active, abandoned, do_not_contact, blocked_needs_human, booked, wrong_number)
- Current reason (optional string)
- Conversation type (call/text enum)
- Timestamps (createdAt, updatedAt)

**Message Model**:
- Belongs to conversation (foreign key relationship)
- Sender type (agent/customer/operator enum)
- Content and timestamp
- Status and reason fields (same enum as conversations)
- Optional operator ID
- One-to-many relationship with MessageAction

**MessageAction Model**:
- Belongs to message (foreign key relationship)
- Action type (string)
- Result and optional error fields
- Tracks automated responses and operator actions

### Key Enums
- `Status`: declined, spam, active, abandoned, do_not_contact, blocked_needs_human, booked, wrong_number
- `SenderType`: agent, customer, operator
- `ConversationType`: call, text

### Data Flow
1. JSONL files contain conversation messages with embedded metadata
2. `/api/init` processes files, creates conversations, messages, and actions
3. Action Center displays conversations filtered by `blocked_needs_human` status
4. Conversations API supports advanced filtering, pagination, and sorting

### Environment Setup

Requires `DATABASE_URL` environment variable for Prisma SQLite connection (defaults to `file:./dev.db`).