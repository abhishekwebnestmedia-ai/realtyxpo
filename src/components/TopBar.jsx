const TopBar = () => {
  return (
    <header className="flex justify-between sticky  items-center p-4 border-b border-gray-300 ">
      <h1 className="font-semibold text-lg">Welcome Sahil</h1>
      <div className="flex items-center gap-4">
        <button title="Notifications" className="p-1 hover:bg-gray-200 rounded-full">
          🔔
        </button>
        <button title="Live Status" className="p-1 hover:bg-gray-200 rounded-full">
          📡
        </button>
        <div className="flex items-center gap-2 cursor-pointer select-none">
          <img
            src="https://i.pravatar.cc/40?u=sahil"
            alt="profile"
            className="rounded-full w-9 h-9"
          />
          <span className="text-gray-700 font-medium">Sahil panc...</span>
          <svg
            className="w-4 h-4 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </header>
  );
};
export default TopBar;
