"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./repos/Sidebar";
import { ChatWindow } from "./repos/ChatWindow";

export default function ReposPage() {
  const [repos, setRepos] = useState<{ id: string; name: string }[]>([]);
  const [selectedRepoId, setSelectedRepoId] = useState<string>("");
  const [loadingRepos, setLoadingRepos] = useState(true);

  const repoName: string = selectedRepoId
    ? repos.find((r) => String(r.id) === selectedRepoId)?.name ?? ""
    : "";

  async function loadRepos() {
    setLoadingRepos(true);
    try {
      const res = await fetch("/api/list-repos");
      const data = await res.json();
      setRepos(data.repos || []);
    } catch (error) {
      console.error("Failed to load repositories:", error);
    } finally {
      setLoadingRepos(false);
    }
  }

  useEffect(() => {
    loadRepos();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans">
      <Sidebar
        repos={repos}
        selectedRepoId={selectedRepoId}
        onSelectRepo={(id: string) => setSelectedRepoId(String(id))}
        reloadRepos={loadRepos}
        loading={loadingRepos}
      />

      <div className="flex-1 flex flex-col">
        {selectedRepoId ? (
          <ChatWindow
            key={"repo_" + selectedRepoId}
            repoId={selectedRepoId}
            repoName={repoName}
          />
        ) : (
          <div className="p-8 flex items-center justify-center h-full">
            <div className="text-center text-gray-500 p-8 border border-dashed border-gray-300 rounded-2xl max-w-sm bg-white shadow-lg">
              <svg className="mx-auto h-12 w-12 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">No Repository Selected</h3>
              <p className="mt-1 text-sm text-gray-500">
                Select a repository from the sidebar to start reviewing the code.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
