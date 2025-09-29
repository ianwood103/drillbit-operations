"use client";

import { useState, useEffect } from "react";
import { Prisma, ConversationType, Status } from "@prisma/client";
import Link from "next/link";
import RefreshButton from "../components/RefreshButton";

type Conversation = Prisma.ConversationGetPayload<{
  include: {
    messages: {
      include: {
        actions: true;
      };
    };
  };
}>;

interface ApiResponse {
  success: boolean;
  data: Conversation[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  filters: any;
  orderBy: { field: string; direction: 'asc' | 'desc' };
}

export default function Conversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [filters, setFilters] = useState({
    phone: "",
    jobType: "",
    type: "",
    currentStatus: "",
  });
  const [orderBy, setOrderBy] = useState({
    field: "createdAt",
    direction: "desc" as 'asc' | 'desc'
  });

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const fetchConversations = async (page = 1) => {
    try {
      setLoading(true);

      const requestBody = {
        page,
        pageSize: pagination.pageSize,
        orderBy,
        filters: Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== "")
        )
      };

      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch conversations");
      }

      const result: ApiResponse = await response.json();

      if (result.success) {
        setConversations(result.data);
        setPagination(result.pagination);
      } else {
        throw new Error("API returned error");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations(1);
  }, [filters, orderBy]);

  const handlePageChange = (newPage: number) => {
    fetchConversations(newPage);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSortChange = (field: string) => {
    setOrderBy(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  return (
    <div className="min-h-screen p-8 w-full bg-background">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-left text-secondary">
            Conversations
          </h1>
          <p className="text-xs text-tertiary">
            VIEW AND MANAGE ALL CONVERSATION HISTORY AND ACTIVITY
          </p>
        </div>
        <RefreshButton />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
        <h2 className="text-lg font-medium text-secondary mb-4">Filters & Sorting</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
          <input
            type="text"
            placeholder="Phone number..."
            value={filters.phone}
            onChange={(e) => handleFilterChange("phone", e.target.value)}
            className="p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="text"
            placeholder="Job type..."
            value={filters.jobType}
            onChange={(e) => handleFilterChange("jobType", e.target.value)}
            className="p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange("type", e.target.value)}
            className="p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All types</option>
            {Object.values(ConversationType).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <select
            value={filters.currentStatus}
            onChange={(e) => handleFilterChange("currentStatus", e.target.value)}
            className="p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All statuses</option>
            {Object.values(Status).map(status => (
              <option key={status} value={status}>
                {status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          {['id', 'phone', 'jobType', 'urgency', 'type', 'currentStatus', 'createdAt'].map(field => (
            <button
              key={field}
              onClick={() => handleSortChange(field)}
              className={`px-3 py-1 rounded text-sm ${
                orderBy.field === field
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Sort by {field.replace(/([A-Z])/g, ' $1').toLowerCase()}
              {orderBy.field === field && (orderBy.direction === 'asc' ? ' ↑' : ' ↓')}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-600">Error: {error}</div>
        </div>
      )}

      {/* Results count */}
      {!loading && (
        <div className="mb-4 text-sm text-tertiary">
          {pagination.totalCount > 0 ? (
            <>
              Showing {((pagination.page - 1) * pagination.pageSize) + 1}-{Math.min(pagination.page * pagination.pageSize, pagination.totalCount)} of {pagination.totalCount} conversations
            </>
          ) : (
            'No conversations found'
          )}
        </div>
      )}

      {/* Conversations Table */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm p-12">
          <div className="text-center text-tertiary">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p>Loading conversations...</p>
          </div>
        </div>
      ) : conversations.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12">
          <div className="text-center text-tertiary">
            <p>No conversations found matching your filters.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSortChange('id')}
                    >
                      ID
                      {orderBy.field === 'id' && (orderBy.direction === 'asc' ? ' ↑' : ' ↓')}
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-40"
                      onClick={() => handleSortChange('phone')}
                    >
                      Phone Number
                      {orderBy.field === 'phone' && (orderBy.direction === 'asc' ? ' ↑' : ' ↓')}
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSortChange('type')}
                    >
                      Type
                      {orderBy.field === 'type' && (orderBy.direction === 'asc' ? ' ↑' : ' ↓')}
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSortChange('jobType')}
                    >
                      Job Type
                      {orderBy.field === 'jobType' && (orderBy.direction === 'asc' ? ' ↑' : ' ↓')}
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSortChange('urgency')}
                    >
                      Urgency
                      {orderBy.field === 'urgency' && (orderBy.direction === 'asc' ? ' ↑' : ' ↓')}
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-36"
                      onClick={() => handleSortChange('currentStatus')}
                    >
                      Status
                      {orderBy.field === 'currentStatus' && (orderBy.direction === 'asc' ? ' ↑' : ' ↓')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Messages
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Latest Message
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSortChange('createdAt')}
                    >
                      Created
                      {orderBy.field === 'createdAt' && (orderBy.direction === 'asc' ? ' ↑' : ' ↓')}
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSortChange('updatedAt')}
                    >
                      Updated
                      {orderBy.field === 'updatedAt' && (orderBy.direction === 'asc' ? ' ↑' : ' ↓')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {conversations.map((conversation, index) => (
                    <tr key={conversation.id} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                      <td className="px-4 py-3 text-sm">
                        <Link
                          href={`/conversations/${conversation.id}`}
                          className="text-primary hover:text-secondary underline font-medium"
                        >
                          {conversation.id.slice(-8)}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-primary">
                        {formatPhoneNumber(conversation.phone)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 capitalize">
                        {conversation.type}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {conversation.jobType}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          conversation.urgency >= 4
                            ? 'bg-red-100 text-red-800'
                            : conversation.urgency >= 3
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {conversation.urgency}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          conversation.currentStatus === Status.blocked_needs_human
                            ? 'bg-red-100 text-red-800'
                            : conversation.currentStatus === Status.active
                            ? 'bg-green-100 text-green-800'
                            : conversation.currentStatus === Status.booked
                            ? 'bg-blue-100 text-blue-800'
                            : conversation.currentStatus === Status.spam
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {conversation.currentStatus.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                        {conversation.currentReason || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {conversation.messages.length}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                        {conversation.messages.length > 0
                          ? conversation.messages[conversation.messages.length - 1].content
                          : '-'
                        }
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(conversation.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(conversation.updatedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPreviousPage}
                className={`px-3 py-1 rounded text-sm ${
                  pagination.hasPreviousPage
                    ? 'bg-primary text-white hover:bg-secondary cursor-pointer'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Previous
              </button>

              <span className="text-sm text-tertiary">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNextPage}
                className={`px-3 py-1 rounded text-sm ${
                  pagination.hasNextPage
                    ? 'bg-primary text-white hover:bg-secondary cursor-pointer'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
