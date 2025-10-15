import React from 'react';

/**
 * LeadsFilters
 * Reusable filters UI for the leads table. Controlled component.
 * Props:
 * - filters: { status, assignedTo, source, dateFrom, dateTo }
 * - onChange: (newFilters) => void
 * - options: { statuses: [], assignees: [], sources: [] }
 */
const LeadsFilters = ({ filters, onChange, options = {} }) => {
  const { statuses = [], assignees = [], sources = [] } = options;

  const update = (partial) => onChange({ ...filters, ...partial });

  return (
    <div className="w-full p-4">
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 flex-1">
          {/* Status */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-600 mb-1">Status</label>
            <select
              className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={filters.status || ''}
              onChange={(e) => update({ status: e.target.value })}
            >
              <option value="">All</option>
              {statuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Assigned To */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-600 mb-1">Assigned To</label>
            <select
              className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={filters.assignedTo || ''}
              onChange={(e) => update({ assignedTo: e.target.value })}
            >
              <option value="">All</option>
              {assignees.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* Source */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-600 mb-1">Source</label>
            <select
              className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={filters.source || ''}
              onChange={(e) => update({ source: e.target.value })}
            >
              <option value="">All</option>
              {sources.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* From date */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-600 mb-1">From</label>
            <input
              type="date"
              className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={filters.dateFrom || ''}
              onChange={(e) => update({ dateFrom: e.target.value })}
            />
          </div>

          {/* To date */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-600 mb-1">To</label>
            <input
              type="date"
              className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={filters.dateTo || ''}
              onChange={(e) => update({ dateTo: e.target.value })}
            />
          </div>
        </div>

        <div className="flex gap-2 mt-2 md:mt-0">
          <button
            type="button"
            className="px-4 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
            onClick={() => onChange({ status: '', assignedTo: '', source: '', dateFrom: '', dateTo: '' })}
          >
            Clear
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-[var(--blue700)] text-white rounded-md text-sm hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-blue-300"
            onClick={() => { /* no-op: controlled filters apply instantly */ }}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadsFilters;
