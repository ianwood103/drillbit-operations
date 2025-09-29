"use client";

export default function RefreshButton() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <button
      onClick={handleRefresh}
      className="px-4 py-2 text-sm bg-white text-black rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 cursor-pointer"
      title="Refresh page"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
      Refresh
    </button>
  );
}
