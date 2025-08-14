const TeamLeadsAssigned = () => {
  return (
    <section className="rounded-lg border border-gray-300 p-5 max-w-4xl mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold">Team Leads Assigned</h2>
        <div className="flex gap-3 text-xs text-gray-600">
          <button className="flex items-center gap-1 hover:text-cyan-600">
            View All <span>⌄</span>
          </button>
          <button className="flex items-center gap-1 hover:text-cyan-600">
            Filter <span>⚙</span>
          </button>
          <button className="flex items-center gap-1 hover:text-cyan-600">
            Download PDF <span>⬇</span>
          </button>
        </div>
      </div>
      {/* Content placeholder */}
      <p className="text-gray-400 italic">Content goes here...</p>
    </section>
  );
};
export default TeamLeadsAssigned;
