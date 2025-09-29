import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import ConversationViewer from "../../action-center/ConversationViewer";
import Link from "next/link";

const prisma = new PrismaClient();

async function getConversation(id: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      messages: {
        include: {
          actions: true,
        },
        orderBy: {
          timestamp: 'asc'
        }
      },
    },
  });

  return conversation;
}

interface PageProps {
  params: {
    id: string;
  };
}

export default async function ConversationDetailPage({ params }: PageProps) {
  const conversation = await getConversation(params.id);

  if (!conversation) {
    notFound();
  }

  return (
    <div className="min-h-screen p-8 w-full bg-background">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <Link
            href="/conversations"
            className="text-primary hover:text-secondary underline text-sm"
          >
            ← Back to Conversations
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-left text-secondary">
          Conversation Details
        </h1>
        <p className="text-xs text-tertiary">
          VIEW DETAILED CONVERSATION INFORMATION AND HISTORY
        </p>
      </div>

      <ConversationViewer
        initialConversations={[conversation]}
        singleConversationMode={true}
      />
    </div>
  );
}