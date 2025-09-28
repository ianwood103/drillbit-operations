import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

interface MessageData {
  timestamp: string;
  phone: number;
  sender_type: "agent" | "customer" | "operator";
  content: string;
  actions: Array<{
    type: string;
    result: string;
    error?: string;
  }>;
  status: string;
  reason?: string;
  job_type?: string;
  urgency: number;
  operator_id?: string;
}

export async function POST() {
  try {
    // Clear all data from all tables (order matters due to foreign keys)
    await prisma.messageAction.deleteMany({});
    await prisma.message.deleteMany({});
    await prisma.conversation.deleteMany({});

    const dataPath = path.join(process.cwd(), "data", "conversations");
    const conversationData = new Map();
    const allMessages: Array<any> = [];
    const allActions: Array<any> = [];

    // Process both calls and texts folders
    for (const folderType of ["calls", "texts"]) {
      const folderPath = path.join(dataPath, folderType);

      if (!fs.existsSync(folderPath)) continue;

      const dates = fs.readdirSync(folderPath);

      for (const date of dates) {
        if (date.startsWith('.')) continue; // Skip hidden files

        const datePath = path.join(folderPath, date);
        if (!fs.statSync(datePath).isDirectory()) continue;

        const files = fs.readdirSync(datePath);

        for (const file of files) {
          if (!file.endsWith('.jsonl')) continue;

          const filePath = path.join(datePath, file);
          const fileContent = fs.readFileSync(filePath, 'utf-8');
          const lines = fileContent.trim().split('\n');

          for (const line of lines) {
            if (!line.trim()) continue;

            const messageData: MessageData = JSON.parse(line);
            const phone = messageData.phone.toString();

            // Create or update conversation data
            if (!conversationData.has(phone)) {
              conversationData.set(phone, {
                phone,
                type: folderType === "calls" ? "call" : "text",
                jobType: messageData.job_type || "unknown",
                urgency: messageData.urgency,
                currentStatus: messageData.status,
                currentReason: messageData.reason,
                isActive: true,
              });
            } else {
              // Update with latest status/reason
              const existing = conversationData.get(phone);
              existing.currentStatus = messageData.status;
              existing.currentReason = messageData.reason;
              existing.jobType = messageData.job_type || existing.jobType;
              existing.urgency = Math.max(existing.urgency, messageData.urgency);
            }

            // Prepare message data
            allMessages.push({
              phone,
              timestamp: new Date(messageData.timestamp),
              senderType: messageData.sender_type,
              content: messageData.content,
              status: messageData.status,
              reason: messageData.reason,
              operatorId: messageData.operator_id,
              isActive: true,
              actions: messageData.actions,
            });
          }
        }
      }
    }

    // Bulk insert conversations
    const conversationsToInsert = Array.from(conversationData.values());
    const insertedConversations = await prisma.conversation.createManyAndReturn({
      data: conversationsToInsert,
    });

    // Create phone to conversation ID mapping
    const phoneToConversationId = new Map();
    insertedConversations.forEach(conv => {
      phoneToConversationId.set(conv.phone, conv.id);
    });

    // Prepare messages with conversation IDs
    const messagesToInsert = allMessages.map(msg => ({
      conversationId: phoneToConversationId.get(msg.phone),
      timestamp: msg.timestamp,
      senderType: msg.senderType,
      content: msg.content,
      status: msg.status,
      reason: msg.reason,
      operatorId: msg.operatorId,
      isActive: msg.isActive,
    }));

    // Bulk insert messages
    const insertedMessages = await prisma.message.createManyAndReturn({
      data: messagesToInsert,
    });

    // Prepare actions with message IDs
    let messageIndex = 0;
    for (const originalMessage of allMessages) {
      const insertedMessage = insertedMessages[messageIndex];

      for (const action of originalMessage.actions) {
        allActions.push({
          messageId: insertedMessage.id,
          actionType: action.type,
          result: action.result,
          error: action.error,
        });
      }
      messageIndex++;
    }

    // Bulk insert actions if any exist
    if (allActions.length > 0) {
      await prisma.messageAction.createMany({
        data: allActions,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Database cleared and conversation data imported successfully",
      data: {
        conversationCount: conversationsToInsert.length,
        messageCount: messagesToInsert.length,
        actionCount: allActions.length,
      },
    });
  } catch (error) {
    console.error("Error importing conversation data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to import conversation data" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
