import { PrismaClient, Status } from "@prisma/client";
import ConversationViewer from "./ConversationViewer";
import RefreshButton from "../components/RefreshButton";

const prisma = new PrismaClient();

async function getData() {
  const conversations = await prisma.conversation.findMany({
    include: {
      messages: {
        include: {
          actions: true,
        },
      },
    },
    where: {
      currentStatus: {
        equals: Status.blocked_needs_human,
      },
    },
    orderBy: {
      urgency: "desc",
    },
  });

  return conversations;
}

export default async function ActionCenter() {
  const conversations = await getData();

  return (
    <div className="min-h-screen p-8 flex flex-col justify-center w-full bg-background">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h1 className="text-3xl font-bold text-left text-secondary">
            Action Center
          </h1>
          <p className="text-xs text-tertiary">
            TAKE ACTION ON CONVERSATIONS WHERE MASON NEEDS HUMAN INVOLVEMENT
          </p>
        </div>
        <RefreshButton />
      </div>

      <ConversationViewer initialConversations={conversations} />
    </div>
  );
}
