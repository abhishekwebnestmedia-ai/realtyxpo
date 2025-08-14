const SidebarMenu = () => {
  return (
    <aside className="bg-slate-900 text-white w-64 min-h-screen p-5 flex flex-col gap-5 items-center">
      <nav className="flex flex-col gap-4 text-sm font-medium">
        <button className="flex items-center gap-2 hover:text-cyan-400 text-xl">
           Dashboard
        </button>
        <button className="flex items-center gap-2 hover:text-cyan-400 text-xl"> Daily Plan</button>
        <button className="flex items-center gap-2 hover:text-cyan-400 text-xl"> All Buyers</button>
        <button className="flex items-center gap-2 hover:text-cyan-400 text-xl"> Inventory</button>
        <button className="flex items-center gap-2 hover:text-cyan-400 text-xl"> Projects Working</button>
        <button className="flex items-center gap-2 hover:text-cyan-400 text-xl"> Brokers Requirements</button>
        <button className="flex items-center gap-2 hover:text-cyan-400 text-xl"> Rental Business</button>
        <button className="flex items-center gap-2 hover:text-cyan-400 text-xl"> My Team</button>
        <button className="flex items-center gap-2 hover:text-cyan-400 text-xl"> Find Opportunity</button>
        <button className="flex items-center gap-2 hover:text-cyan-400 text-xl"> Learn Grow</button>
      </nav>
      <footer className="mt-auto text-xs text-gray-400">Powered @WebNest Media</footer>
    </aside>
  );
};
export default SidebarMenu;
