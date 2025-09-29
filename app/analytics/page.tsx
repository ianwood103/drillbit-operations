"use client";

import { useState, useMemo } from "react";
import RefreshButton from "../components/RefreshButton";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement
);

interface Message {
  id: string;
  conversationId: string;
  timestamp: string;
  senderType: string;
  content: string;
  status: string;
  reason?: string;
  operatorId?: string;
  createdAt: string;
  conversation: {
    phone: string;
    jobType: string;
    urgency: number;
    type: string;
  };
  actions: Array<{
    id: string;
    actionType: string;
    result: string;
    error?: string;
  }>;
}

interface MessageAction {
  id: string;
  messageId: string;
  actionType: string;
  result: string;
  error?: string;
  createdAt: string;
  message: {
    id: string;
    timestamp: string;
    conversation: {
      phone: string;
      jobType: string;
      urgency: number;
      type: string;
    };
  };
}

interface ApiResponse {
  success: boolean;
  dateRange: {
    startDate: string | null;
    endDate: string | null;
  };
  totalMessages: number;
  messages: Message[];
}

interface ActionsApiResponse {
  success: boolean;
  dateRange: {
    startDate: string | null;
    endDate: string | null;
  };
  totalActions: number;
  actions: MessageAction[];
}

export default function Analytics() {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [actionsData, setActionsData] = useState<ActionsApiResponse | null>(
    null
  );
  const [error, setError] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showMessageCharts, setShowMessageCharts] = useState(false);
  const [showActionCharts, setShowActionCharts] = useState(false);

  // Chart data processing
  const chartData = useMemo(() => {
    if (!data?.messages) return null;

    const messages = data.messages;

    // Messages over time (by day)
    const messagesByDay = messages.reduce(
      (acc: Record<string, number>, message) => {
        const date = new Date(message.timestamp).toISOString().split("T")[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      },
      {}
    );

    const sortedDates = Object.keys(messagesByDay).sort();
    const messagesOverTime = {
      labels: sortedDates,
      datasets: [
        {
          label: "Messages per Day",
          data: sortedDates.map((date) => messagesByDay[date]),
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.4,
        },
      ],
    };

    // Messages by sender type
    const messagesBySender = messages.reduce(
      (acc: Record<string, number>, message) => {
        acc[message.senderType] = (acc[message.senderType] || 0) + 1;
        return acc;
      },
      {}
    );

    const senderTypeChart = {
      labels: Object.keys(messagesBySender),
      datasets: [
        {
          label: "Messages by Sender Type",
          data: Object.values(messagesBySender),
          backgroundColor: [
            "rgba(59, 130, 246, 0.8)",
            "rgba(16, 185, 129, 0.8)",
            "rgba(139, 92, 246, 0.8)",
          ],
          borderColor: [
            "rgb(59, 130, 246)",
            "rgb(16, 185, 129)",
            "rgb(139, 92, 246)",
          ],
          borderWidth: 1,
        },
      ],
    };

    // Messages by status
    const messagesByStatus = messages.reduce(
      (acc: Record<string, number>, message) => {
        acc[message.status] = (acc[message.status] || 0) + 1;
        return acc;
      },
      {}
    );

    const statusChart = {
      labels: Object.keys(messagesByStatus),
      datasets: [
        {
          data: Object.values(messagesByStatus),
          backgroundColor: [
            "#10B981",
            "#EF4444",
            "#3B82F6",
            "#F59E0B",
            "#8B5CF6",
            "#EC4899",
            "#6B7280",
            "#14B8A6",
          ],
        },
      ],
    };

    // Messages by job type
    const messagesByJobType = messages.reduce(
      (acc: Record<string, number>, message) => {
        const jobType = message.conversation.jobType;
        acc[jobType] = (acc[jobType] || 0) + 1;
        return acc;
      },
      {}
    );

    const jobTypeChart = {
      labels: Object.keys(messagesByJobType),
      datasets: [
        {
          label: "Messages by Job Type",
          data: Object.values(messagesByJobType),
          backgroundColor: "rgba(139, 92, 246, 0.8)",
          borderColor: "rgb(139, 92, 246)",
          borderWidth: 1,
        },
      ],
    };

    return {
      messagesOverTime,
      senderTypeChart,
      statusChart,
      jobTypeChart,
    };
  }, [data]);

  // Actions chart data processing
  const actionsChartData = useMemo(() => {
    if (!actionsData?.actions) return null;

    const actions = actionsData.actions;

    // Actions over time (by day)
    const actionsByDay = actions.reduce(
      (acc: Record<string, number>, action) => {
        const date = new Date(action.message.timestamp)
          .toISOString()
          .split("T")[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      },
      {}
    );

    const sortedDates = Object.keys(actionsByDay).sort();
    const actionsOverTime = {
      labels: sortedDates,
      datasets: [
        {
          label: "Actions per Day",
          data: sortedDates.map((date) => actionsByDay[date]),
          borderColor: "rgb(34, 197, 94)",
          backgroundColor: "rgba(34, 197, 94, 0.1)",
          tension: 0.4,
        },
      ],
    };

    // Actions by type over time
    const actionTypesByDate = actions.reduce(
      (acc: Record<string, Record<string, number>>, action) => {
        const date = new Date(action.message.timestamp)
          .toISOString()
          .split("T")[0];
        const type = action.actionType;

        if (!acc[date]) acc[date] = {};
        acc[date][type] = (acc[date][type] || 0) + 1;
        return acc;
      },
      {}
    );

    const allActionTypes = [...new Set(actions.map((a) => a.actionType))];
    const typeColors = [
      "rgb(59, 130, 246)",
      "rgb(16, 185, 129)",
      "rgb(139, 92, 246)",
      "rgb(245, 158, 11)",
      "rgb(239, 68, 68)",
      "rgb(236, 72, 153)",
      "rgb(107, 114, 128)",
      "rgb(20, 184, 166)",
    ];

    const actionsByTypeOverTime = {
      labels: sortedDates,
      datasets: allActionTypes.map((type, index) => ({
        label: type,
        data: sortedDates.map((date) => actionTypesByDate[date]?.[type] || 0),
        borderColor: typeColors[index % typeColors.length],
        backgroundColor: typeColors[index % typeColors.length]
          .replace("rgb", "rgba")
          .replace(")", ", 0.1)"),
        tension: 0.4,
      })),
    };

    // Action types distribution
    const actionTypeDistribution = actions.reduce(
      (acc: Record<string, number>, action) => {
        acc[action.actionType] = (acc[action.actionType] || 0) + 1;
        return acc;
      },
      {}
    );

    const actionTypesChart = {
      labels: Object.keys(actionTypeDistribution),
      datasets: [
        {
          data: Object.values(actionTypeDistribution),
          backgroundColor: typeColors.slice(
            0,
            Object.keys(actionTypeDistribution).length
          ),
        },
      ],
    };

    // Action results distribution
    const actionResultDistribution = actions.reduce(
      (acc: Record<string, number>, action) => {
        acc[action.result] = (acc[action.result] || 0) + 1;
        return acc;
      },
      {}
    );

    const actionResultsChart = {
      labels: Object.keys(actionResultDistribution),
      datasets: [
        {
          data: Object.values(actionResultDistribution),
          backgroundColor: [
            "#10B981", // success - green
            "#EF4444", // error - red
            "#F59E0B", // warning - amber
            "#3B82F6", // info - blue
            "#8B5CF6", // other - purple
          ],
        },
      ],
    };

    // Action results over time
    const actionResultsByDate = actions.reduce(
      (acc: Record<string, Record<string, number>>, action) => {
        const date = new Date(action.message.timestamp)
          .toISOString()
          .split("T")[0];
        const result = action.result;

        if (!acc[date]) acc[date] = {};
        acc[date][result] = (acc[date][result] || 0) + 1;
        return acc;
      },
      {}
    );

    const allResults = [...new Set(actions.map((a) => a.result))];
    const resultColors = [
      "rgb(16, 185, 129)", // success - green
      "rgb(239, 68, 68)", // error - red
      "rgb(245, 158, 11)", // warning - amber
      "rgb(59, 130, 246)", // info - blue
      "rgb(139, 92, 246)", // other - purple
    ];

    const actionResultsOverTime = {
      labels: sortedDates,
      datasets: allResults.map((result, index) => ({
        label: result,
        data: sortedDates.map(
          (date) => actionResultsByDate[date]?.[result] || 0
        ),
        borderColor: resultColors[index % resultColors.length],
        backgroundColor: resultColors[index % resultColors.length]
          .replace("rgb", "rgba")
          .replace(")", ", 0.1)"),
        tension: 0.4,
      })),
    };

    return {
      actionsOverTime,
      actionsByTypeOverTime,
      actionTypesChart,
      actionResultsChart,
      actionResultsOverTime,
    };
  }, [actionsData]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "right" as const,
      },
    },
  };

  // Pagination logic
  const paginationData = useMemo(() => {
    if (!data?.messages) return null;

    const totalMessages = data.messages.length;
    const totalPages = Math.ceil(totalMessages / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedMessages = data.messages.slice(startIndex, endIndex);

    return {
      totalMessages,
      totalPages,
      paginatedMessages,
      startIndex,
      endIndex: Math.min(endIndex, totalMessages),
    };
  }, [data, currentPage, pageSize]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const fetchMessages = async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      // Fetch both messages and actions in parallel
      const [messagesResponse, actionsResponse] = await Promise.all([
        fetch(`/api/messages?${params.toString()}`),
        fetch(`/api/actions?${params.toString()}`),
      ]);

      const [messagesResult, actionsResult] = await Promise.all([
        messagesResponse.json(),
        actionsResponse.json(),
      ]);

      if (messagesResult.success && actionsResult.success) {
        setData(messagesResult);
        setActionsData(actionsResult);
      } else {
        setError(
          messagesResult.error || actionsResult.error || "Failed to fetch data"
        );
      }
    } catch (err) {
      setError("Failed to fetch data");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setData(null);
    setActionsData(null);
    setError("");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen p-8 w-full bg-background">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-left text-secondary">
            Analytics
          </h1>
          <p className="text-xs text-tertiary">
            ANALYZE MESSAGE DATA WITH DATE RANGE FILTERING
          </p>
        </div>
        <RefreshButton />
      </div>

      {/* Date Range Controls */}
      <div className="bg-white border border-border rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-secondary mb-4">
          Date Range Filter
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={fetchMessages}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Loading..." : "Calculate"}
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-2 border border-border rounded-md hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* Message Analytics Section Header */}
      {data && (
        <div className="bg-white border border-border rounded-lg mb-6">
          <button
            onClick={() => setShowMessageCharts(!showMessageCharts)}
            className="w-full px-6 py-4 flex justify-between items-center rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-secondary">
                Message Analytics
              </h2>
              <span className="text-sm text-gray-500">
                ({chartData ? "4 charts" : "Loading..."})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {showMessageCharts ? "Hide Charts" : "Show Charts"}
              </span>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform ${
                  showMessageCharts ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </button>
        </div>
      )}

      {/* Message Charts */}
      {data && chartData && showMessageCharts && (
        <div className="space-y-6 mb-6">
          {/* Messages Over Time */}
          <div className="bg-white border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-secondary mb-4">
              Messages Over Time
            </h3>
            <div className="h-180 flex flex-row justify-center">
              <Line data={chartData.messagesOverTime} options={chartOptions} />
            </div>
          </div>

          {/* Grid of smaller charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sender Type Distribution */}
            <div className="bg-white border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-secondary mb-4">
                Messages by Sender Type
              </h3>
              <div className="h-64">
                <Bar data={chartData.senderTypeChart} options={chartOptions} />
              </div>
            </div>

            {/* Status Distribution */}
            <div className="bg-white border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-secondary mb-4">
                Messages by Status
              </h3>
              <div className="h-64">
                <Doughnut
                  data={chartData.statusChart}
                  options={doughnutOptions}
                />
              </div>
            </div>

            {/* Job Type Distribution */}
            <div className="bg-white border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-secondary mb-4">
                Messages by Job Type
              </h3>
              <div className="h-64">
                <Bar data={chartData.jobTypeChart} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Analytics Section Header */}
      {actionsData && (
        <div className="bg-white border border-border rounded-lg mb-6">
          <button
            onClick={() => setShowActionCharts(!showActionCharts)}
            className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-secondary">
                Action Analytics
              </h2>
              <span className="text-sm text-gray-500">
                ({actionsChartData ? "5 charts" : "Loading..."})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {showActionCharts ? "Hide Charts" : "Show Charts"}
              </span>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform ${
                  showActionCharts ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </button>
        </div>
      )}

      {/* Action Charts */}
      {actionsData && actionsChartData && showActionCharts && (
        <div className="space-y-6 mb-6">
          {/* Actions Overview */}
          <div className="bg-white border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-secondary mb-4">
              Actions Over Time
            </h3>
            <div className="h-180 flex flex-row justify-center">
              <Line
                data={actionsChartData.actionsOverTime}
                options={chartOptions}
              />
            </div>
          </div>

          {/* Actions by Type Over Time */}
          <div className="bg-white border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-secondary mb-4">
              Actions by Type Over Time
            </h3>
            <div className="h-180 flex flex-row justify-center">
              <Line
                data={actionsChartData.actionsByTypeOverTime}
                options={chartOptions}
              />
            </div>
          </div>

          {/* Action Results Over Time */}
          <div className="bg-white border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-secondary mb-4">
              Action Results Over Time
            </h3>
            <div className="h-180 flex flex-row justify-center">
              <Line
                data={actionsChartData.actionResultsOverTime}
                options={chartOptions}
              />
            </div>
          </div>

          {/* Actions Distribution Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Action Types Distribution */}
            <div className="bg-white border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-secondary mb-4">
                Action Types Distribution
              </h3>
              <div className="w-full">
                <Doughnut
                  data={actionsChartData.actionTypesChart}
                  options={doughnutOptions}
                />
              </div>
            </div>

            {/* Action Results Distribution */}
            <div className="bg-white border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-secondary mb-4">
                Action Results Distribution
              </h3>
              <div className="h-180 flex flex-row justify-center">
                <Doughnut
                  data={actionsChartData.actionResultsChart}
                  options={doughnutOptions}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
