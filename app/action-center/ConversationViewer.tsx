"use client";

import { useState } from "react";
import {
  Prisma,
  MessageAction,
  ConversationType,
  SenderType,
  Status,
} from "@prisma/client";
import Link from "next/link";

type Conversation = Prisma.ConversationGetPayload<{
  include: {
    messages: {
      include: {
        actions: true;
      };
    };
  };
}>;

interface ConversationViewerProps {
  initialConversations: Conversation[];
  singleConversationMode?: boolean;
}

export default function ConversationViewer({
  initialConversations,
  singleConversationMode = false,
}: ConversationViewerProps) {
  const [position, setPosition] = useState(0);
  const [conversations, setConversations] = useState(initialConversations);
  const [textMessage, setTextMessage] = useState("");
  const [messageStatus, setMessageStatus] = useState("");
  const [messageReason, setMessageReason] = useState("");
  const [messageOperatorId, setMessageOperatorId] = useState("");
  const [isRemoving, setIsRemoving] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [callResults, setCallResults] = useState("");
  const [callStatus, setCallStatus] = useState("");
  const [callReason, setCallReason] = useState("");
  const [callOperatorId, setCallOperatorId] = useState("");

  // Format phone number from 7706561244 to (770) 656-1244
  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
        6
      )}`;
    }
    return phone;
  };

  if (conversations.length === 0) {
    return (
      <div className="text-center text-tertiary">
        <p>No conversations requiring human action found.</p>
      </div>
    );
  }

  const currentConversation = conversations[position];

  return (
    <div className="w-full mt-10">
      {/* Navigation Controls */}
      {!singleConversationMode && (
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => {
              if (position > 0) {
                setPosition(position - 1);
              }
            }}
            className={
              position > 0
                ? "flex items-center gap-2 text-primary hover:text-secondary transition-colors cursor-pointer"
                : "opacity-0 flex items-center gap-2 cursor-default"
            }
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Previous
          </button>

          <div className="flex items-center gap-3">
            <span className="text-sm text-tertiary">
              {position + 1} of {conversations.length}
            </span>
            {currentConversation.currentStatus !==
              Status.blocked_needs_human && (
              <button
                title="Clear From Queue"
                className="flex items-center gap-2 bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors text-sm cursor-pointer"
                onClick={() => {
                  if (!isRemoving) {
                    setIsRemoving(true);
                    setTimeout(() => {
                      setConversations((prevConversations) =>
                        prevConversations.filter(
                          (conv) => conv.id !== currentConversation.id
                        )
                      );
                      if (position >= conversations.length - 1) {
                        setPosition(Math.max(0, position - 1));
                      }
                      setIsRemoving(false);
                    }, 500);
                  }
                }}
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Clear From Queue
              </button>
            )}
          </div>

          <button
            onClick={() => setPosition(position + 1)}
            className={
              position < conversations.length - 1
                ? "flex items-center gap-2 text-primary hover:text-secondary transition-colors cursor-pointer"
                : "opacity-0 cursor-default"
            }
          >
            Next
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      )}

      <div
        className={`bg-white rounded-lg shadow-sm p-6 transition-all duration-500 ${
          isRemoving
            ? "scale-95 opacity-0 translate-y-4"
            : "scale-100 opacity-100 translate-y-0"
        }`}
      >
        <div className="mb-4">
          {singleConversationMode ? (
            <h2 className="text-xl font-semibold text-primary">
              Conversation {currentConversation.id.slice(-8)}
            </h2>
          ) : (
            <Link
              className="text-xl font-semibold text-primary cursor-pointer underline hover:text-secondary"
              href={`/conversations/${currentConversation.id}`}
            >
              Conversation {currentConversation.id.slice(-8)}{" "}
            </Link>
          )}
          <div className="text-sm text-tertiary mt-2">
            <p>
              <b>Phone Number: </b>
              {formatPhoneNumber(currentConversation.phone)}
            </p>
            <p>
              <b>Conversation Type: </b>
              {currentConversation.type}
            </p>
            <p>
              <b>Job Type:</b> {currentConversation.jobType}
            </p>
            <p>
              <b>Urgency:</b> {currentConversation.urgency}
            </p>
            <p>
              <b>Status:</b> {currentConversation.currentStatus}
            </p>
            <p>
              <b>Current Reason:</b> {currentConversation.currentReason}
            </p>
            <p>
              <b>Created:</b> {currentConversation.createdAt.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-medium text-secondary">Messages</h3>
          {currentConversation.messages.map((message) => (
            <div
              key={message.id}
              className="border-l-4 border-primary pl-4 py-2"
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-medium capitalize text-secondary">
                  {message.senderType}
                </span>
                <span className="text-xs text-tertiary">
                  {message.timestamp.toLocaleString()}
                </span>
              </div>
              <p className="text-secondary mb-2">{message.content}</p>
              <div className="text-xs text-tertiary">
                Status: {message.status}
                {message.reason && <span> | Reason: {message.reason}</span>}
                {message.operatorId && (
                  <span> | Operator: {message.operatorId}</span>
                )}
              </div>

              {message.actions.length > 0 && (
                <div className="mt-2 ml-4">
                  <h4 className="text-sm font-medium text-tertiary">Actions</h4>
                  {message.actions.map((action: MessageAction) => (
                    <div key={action.id} className="text-xs text-tertiary mt-1">
                      <span className="font-medium">{action.actionType}</span>:{" "}
                      {action.result}
                      {action.error && (
                        <span className="text-primary">
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

        {/* Action Section */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          {currentConversation.type === ConversationType.call ? (
            <button
              onClick={() => setShowCallModal(true)}
              className="w-full bg-primary text-white font-semibold py-4 px-6 rounded-lg cursor-pointer transition-colors text-lg flex items-center justify-center gap-3"
            >
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
              </svg>
              Call {formatPhoneNumber(currentConversation.phone)}
            </button>
          ) : (
            <div className="space-y-3">
              <textarea
                value={textMessage}
                onChange={(e) => setTextMessage(e.target.value)}
                placeholder="Type your message..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={3}
                required
              />

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-tertiary mb-1">
                    Status
                  </label>
                  <select
                    value={messageStatus}
                    onChange={(e) => setMessageStatus(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    required
                  >
                    <option value="">Select status...</option>
                    {Object.values(Status).map((status) => (
                      <option key={status} value={status}>
                        {status
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-tertiary mb-1">
                    Reason
                  </label>
                  <input
                    type="text"
                    value={messageReason}
                    onChange={(e) => setMessageReason(e.target.value)}
                    placeholder="Enter reason..."
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-tertiary mb-1">
                    Operator ID
                  </label>
                  <input
                    type="text"
                    value={messageOperatorId}
                    onChange={(e) => setMessageOperatorId(e.target.value)}
                    placeholder="Enter operator ID..."
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <button
                className={`w-full font-semibold py-3 px-6 rounded-lg transition-colors ${
                  textMessage.trim() && messageStatus && messageReason.trim()
                    ? "bg-primary text-white cursor-pointer hover:bg-secondary"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                disabled={
                  !textMessage.trim() || !messageStatus || !messageReason.trim()
                }
                onClick={async () => {
                  // Validate all fields are filled
                  if (
                    !textMessage.trim() ||
                    !messageStatus ||
                    !messageReason.trim()
                  ) {
                    alert(
                      "Please fill in all fields (message, status, and reason) before sending."
                    );
                    return;
                  }

                  try {
                    const response = await fetch("/api/messages", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        conversationId: currentConversation.id,
                        senderType: SenderType.operator,
                        content: textMessage,
                        status: messageStatus,
                        reason: messageReason || null,
                        timestamp: new Date().toISOString(),
                        operatorId: messageOperatorId || null,
                      }),
                    });

                    if (response.ok) {
                      const result = await response.json();
                      console.log("Message sent successfully:", result);

                      // Update the conversations state with the new message and updated conversation
                      setConversations((prevConversations) => {
                        return prevConversations.map((conv) => {
                          if (conv.id === currentConversation.id) {
                            return {
                              ...conv,
                              // Update conversation status and reason
                              currentStatus:
                                result.data.conversation.currentStatus,
                              currentReason:
                                result.data.conversation.currentReason,
                              // Add the new message to the messages array
                              messages: [
                                ...conv.messages,
                                {
                                  ...result.data.message,
                                  timestamp: new Date(
                                    result.data.message.timestamp
                                  ),
                                },
                              ],
                            };
                          }
                          return conv;
                        });
                      });

                      // Clear form fields
                      setTextMessage("");
                      setMessageStatus("");
                      setMessageReason("");
                      setMessageOperatorId("");
                    } else {
                      const error = await response.json();
                      console.error("Failed to send message:", error);
                      alert("Failed to send message: " + error.error);
                    }
                  } catch (error) {
                    console.error("Error sending message:", error);
                    alert("Error sending message");
                  }
                }}
              >
                Send Message
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Call Modal */}
      {showCallModal && (
        <div className="fixed inset-0 bg-[rgba(107,114,128,0.75)] flex items-center justify-center z-50 h-screen">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-primary mb-4">
              Make Call
            </h3>

            <div className="mb-4 p-4 bg-gray-100 rounded-lg">
              <p className="text-center text-gray-700">
                Pretend this is making a call...
              </p>
              <p className="text-center text-sm text-gray-500 mt-1">
                Calling {formatPhoneNumber(currentConversation.phone)}
              </p>
            </div>

            <h4 className="text-lg font-medium text-secondary mb-3">
              Record the results below:
            </h4>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-tertiary mb-1">
                  Call Results
                </label>
                <textarea
                  value={callResults}
                  onChange={(e) => setCallResults(e.target.value)}
                  placeholder="Enter call results..."
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-tertiary mb-1">
                    Status
                  </label>
                  <select
                    value={callStatus}
                    onChange={(e) => setCallStatus(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    required
                  >
                    <option value="">Select status...</option>
                    {Object.values(Status).map((status) => (
                      <option key={status} value={status}>
                        {status
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-tertiary mb-1">
                    Reason
                  </label>
                  <input
                    type="text"
                    value={callReason}
                    onChange={(e) => setCallReason(e.target.value)}
                    placeholder="Enter reason..."
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-tertiary mb-1">
                    Operator ID
                  </label>
                  <input
                    type="text"
                    value={callOperatorId}
                    onChange={(e) => setCallOperatorId(e.target.value)}
                    placeholder="Enter operator ID..."
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  onClick={() => {
                    setShowCallModal(false);
                    setCallResults("");
                    setCallStatus("");
                    setCallReason("");
                    setCallOperatorId("");
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  className={`flex-1 font-semibold py-2 px-4 rounded-lg transition-colors ${
                    callResults.trim() && callStatus && callReason.trim()
                      ? "bg-primary text-white hover:bg-secondary"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  disabled={
                    !callResults.trim() || !callStatus || !callReason.trim()
                  }
                  onClick={async () => {
                    // Validate all fields are filled
                    if (
                      !callResults.trim() ||
                      !callStatus ||
                      !callReason.trim()
                    ) {
                      alert(
                        "Please fill in all fields (results, status, and reason) before submitting."
                      );
                      return;
                    }

                    try {
                      const response = await fetch("/api/messages", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          conversationId: currentConversation.id,
                          senderType: SenderType.operator,
                          content: callResults,
                          status: callStatus,
                          reason: callReason || null,
                          timestamp: new Date().toISOString(),
                          operatorId: callOperatorId || null,
                        }),
                      });

                      if (response.ok) {
                        const result = await response.json();
                        console.log(
                          "Call results recorded successfully:",
                          result
                        );

                        // Update the conversations state with the new message and updated conversation
                        setConversations((prevConversations) => {
                          return prevConversations.map((conv) => {
                            if (conv.id === currentConversation.id) {
                              return {
                                ...conv,
                                // Update conversation status and reason
                                currentStatus:
                                  result.data.conversation.currentStatus,
                                currentReason:
                                  result.data.conversation.currentReason,
                                // Add the new message to the messages array
                                messages: [
                                  ...conv.messages,
                                  {
                                    ...result.data.message,
                                    timestamp: new Date(
                                      result.data.message.timestamp
                                    ),
                                  },
                                ],
                              };
                            }
                            return conv;
                          });
                        });

                        // Close modal and clear form fields
                        setShowCallModal(false);
                        setCallResults("");
                        setCallStatus("");
                        setCallReason("");
                        setCallOperatorId("");
                      } else {
                        const error = await response.json();
                        console.error("Failed to record call results:", error);
                        alert("Failed to record call results: " + error.error);
                      }
                    } catch (error) {
                      console.error("Error recording call results:", error);
                      alert("Error recording call results");
                    }
                  }}
                >
                  Record Results
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
