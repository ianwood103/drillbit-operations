# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

- `npm run dev` - Start the development server with Turbopack
- `npm run build` - Build the production application with Turbopack
- `npm run start` - Start the production server
- `npm run db` - Open SQLite database shell for `./prisma/dev.db`

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
- Bulk inserts data for performance

**Frontend Display**
- Main page (`app/page.tsx`) displays all conversations with nested messages and actions
- Shows conversation metadata (phone, job type, urgency, status, reason)
- Messages include sender type, content, timestamp, and associated actions
- InitButton component triggers data import via the API

### Data Structure

Conversations contain:
- Phone number (identifier)
- Job type and urgency level
- Current status and reason
- Conversation type (call/text)
- Activity state

Messages contain:
- Sender type (agent/customer/operator)
- Content and timestamp
- Status and reason fields
- Optional operator ID

Message actions track automated or operator responses with results and error states.

### Environment Setup

Requires `DATABASE_URL` environment variable for Prisma SQLite connection.