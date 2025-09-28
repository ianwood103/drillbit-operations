import { PrismaClient, MessageAction } from "@prisma/client";

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
    take: 20,
  });

  return conversations;
}

export default async function Home() {
  const conversations = await getData();

  return (
    <div className="min-h-screen p-8">
      {conversations.length === 0 ? (
        <div className="text-center text-gray-500">
          <p>No data found. Use the init API to add test data.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className="border rounded-lg p-6 bg-white shadow-sm"
            >
              <div className="mb-4">
                <h2 className="text-xl font-semibold">
                  Conversation {conversation.phone}
                </h2>
                <div className="text-sm text-gray-600 mt-2">
                  <p>Job Type: {conversation.jobType}</p>
                  <p>Urgency: {conversation.urgency}</p>
                  <p>Status: {conversation.currentStatus}</p>
                  <p>Reason: {conversation.currentReason}</p>
                  <p>Active: {conversation.isActive ? "Yes" : "No"}</p>
                  <p>Created: {conversation.createdAt.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-medium">Messages</h3>
                {conversation.messages.map((message) => (
                  <div
                    key={message.id}
                    className="border-l-4 border-blue-500 pl-4 py-2"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium capitalize">
                        {message.senderType}
                      </span>
                      <span className="text-xs text-gray-500">
                        {message.timestamp.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">{message.content}</p>
                    <div className="text-xs text-gray-500">
                      Status: {message.status} | Active:{" "}
                      {message.isActive ? "Yes" : "No"}
                      {message.operatorId && (
                        <span> | Operator: {message.operatorId}</span>
                      )}
                    </div>

                    {message.actions.length > 0 && (
                      <div className="mt-2 ml-4">
                        <h4 className="text-sm font-medium text-gray-600">
                          Actions
                        </h4>
                        {message.actions.map((action: MessageAction) => (
                          <div
                            key={action.id}
                            className="text-xs text-gray-500 mt-1"
                          >
                            <span className="font-medium">
                              {action.actionType}
                            </span>
                            : {action.result}
                            {action.error && (
                              <span className="text-red-500">
                                {" "}
                                | Error: {action.error}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
