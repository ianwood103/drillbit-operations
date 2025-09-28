"use client";

import { useState } from "react";

export default function InitButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const initializeData = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/init", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        setMessage("Test data inserted successfully!");
        // Refresh the page to show new data
        window.location.reload();
      } else {
        setMessage("Error: " + data.error);
      }
    } catch (error) {
      setMessage("Failed to initialize data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={initializeData}
        disabled={loading}
        className="px-4 py-2 bg-primary text-white rounded-lg hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-xs"
      >
        {loading ? "Resetting..." : "RESET DATABASE"}
      </button>
    </div>
  );
}
