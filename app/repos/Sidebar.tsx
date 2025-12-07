import { AddRepo } from "./AddRepo";

const Spinner = ({ className = "text-white" }) => (
    <svg className={`animate-spin h-5 w-5 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export function Sidebar({ repos, selectedRepoId, onSelectRepo, reloadRepos, loading }: { repos: { id: string; name: string }[]; selectedRepoId: string; onSelectRepo: (id: string) => void; reloadRepos: () => void; loading: boolean }) {
  return (
    <div className="w-72 h-screen bg-gray-800 text-white p-6 flex flex-col shadow-2xl">
      <h2 className="text-2xl font-extrabold mb-6 text-indigo-400 border-b border-gray-700 pb-3">Code Review AI</h2>

      <AddRepo onRepoAdded={reloadRepos} />

      <div className="flex-1 overflow-y-auto mt-4 space-y-2">
        <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Repositories</p>

        {loading ? (
          <div className="flex items-center text-sm text-gray-400 p-2">
            <Spinner className="text-indigo-400 mr-3" />
            Loading repositories...
          </div>
        ) : repos.length === 0 ? (
          <div className="text-sm text-gray-500 p-2">
            No repositories added yet.
          </div>
        ) : (
          repos.map((repo: { id: string; name: string }) => {
            const id = repo.id;
            const isSelected = selectedRepoId === id;

            return (
              <div
                key={id}
                onClick={() => onSelectRepo(id)}
                className={`
                  p-3 rounded-lg cursor-pointer transition duration-200 ease-in-out flex items-center
                  ${isSelected 
                    ? "bg-indigo-600 text-white shadow-md font-semibold"
                    : "bg-gray-700 text-gray-200 hover:bg-gray-600"
                  }
                `}
              >
                <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <span className="truncate">{repo.name}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
