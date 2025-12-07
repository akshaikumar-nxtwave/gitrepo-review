"use client";

import { useState } from "react";
const Spinner = ({ className = "text-white" }) => (
    <svg className={`animate-spin h-5 w-5 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);
export function AddRepo({ onRepoAdded }: { onRepoAdded: () => void }) {
  const [gitUrl, setGitUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    if (!gitUrl.trim()) return;

    setLoading(true);

    try {
        const res = await fetch("/api/add-repo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ git_url: gitUrl.trim() }),
        });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setGitUrl("");
        if (onRepoAdded) onRepoAdded();
      } else {
        console.error("Failed to add repository.", data);
        // Provide a small user-facing alert so the user knows what happened
        alert(data?.error || "Failed to add repository.");
      }

    } catch (error) {
        console.error("API call error:", error);
    } finally {
        setLoading(false);
    }
  }

  const isButtonDisabled = loading || !gitUrl.trim();

  return (
    <div className="mb-4 p-4 bg-gray-700 rounded-xl shadow-inner">
      <input
        className="w-full p-3 mb-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-600 focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 transition duration-150"
        placeholder="Enter GitHub repo URL"
        value={gitUrl}
        onChange={(e) => setGitUrl(e.target.value)}
        disabled={loading}
      />
      <button
        className={`w-full flex items-center justify-center p-3 rounded-lg font-semibold transition duration-150 ease-in-out transform hover:scale-[1.01] ${
            isButtonDisabled 
                ? "bg-gray-500 text-gray-300 cursor-not-allowed" 
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/50"
        }`}
        onClick={handleAdd}
        disabled={isButtonDisabled}
      >
        {loading ? (
          <>
            <Spinner />
            <span className="ml-2">Adding...</span>
          </>
        ) : "Add Repository"}
      </button>
    </div>
  );
}