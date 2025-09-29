# Drillbit Operations

A Next.js 15 application using the App Router that manages conversation data for a customer service system. The application displays and processes conversation records including messages, actions, and metadata from both call and text conversations.

## Features

- **Conversation Management**: Track phone numbers, job types, urgency levels, and status
- **Message Handling**: Display messages with sender types, content, timestamps, and associated actions
- **Data Import System**: Bulk import conversation data from JSONL files
- **Database Integration**: SQLite database with Prisma ORM for data persistence
- **Real-time Display**: View conversation metadata, message history, and automated actions

## Installation

1. Install dependencies:

```bash
npm install
```

2. Set up the database:

```bash
npx prisma migrate dev
```

3. Generate Prisma client (if needed):

```bash
npx prisma generate
```

4. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

5. Reset database:

- Click reset database in UI to initialize with test data.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
