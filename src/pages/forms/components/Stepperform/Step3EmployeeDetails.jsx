import React from "react";

const Step3EmployeeDetails = ({ formData, handleChange, users, filteredUsersForAssignTo, sources }) => {
  return (
    <div className="grid grid-cols-2 gap-8 mt-4">
      {/* Captured By */}
      <div>
        <label className="block mb-2 font-medium">Captured by</label>
        <select
          name="capturedBy"
          value={formData.capturedBy}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded-lg bg-[#FAFBFC]"
        >
          <option value="">-- Select User --</option>
          {users.map((u) => (
            <option key={u._id} value={u.name}>{u.name || u.email}</option>
          ))}
        </select>
      </div>

      {/* Assign To */}
      <div>
        <label className="block mb-2 font-medium">Assign To</label>
        <select
          name="assignTo"
          value={formData.assignTo}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded-lg bg-[#FAFBFC]"
        >
          <option value="">-- Select User --</option>
          {filteredUsersForAssignTo.map((u) => (
            <option key={u._id} value={u.name}>{u.name}</option>
          ))}
        </select>
      </div>

      {/* Source */}
      <div>
        <label className="block mb-2 font-medium">Source</label>
        <input
          list="sourceList"
          name="source"
          value={formData.source}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded-lg"
          placeholder="Select or type source"
        />
        <datalist id="sourceList">
          {sources.map((s, i) => (
            <option key={i} value={s} />
          ))}
        </datalist>
      </div>

      {/* Follow Up */}
      <div>
        <label className="block mb-2 font-medium">Follow up Date</label>
        <input
          type="date"
          name="followUp"
          value={formData.followUp}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded-lg"
        />
      </div>

      {/* Transfer To */}
      <div>
        <label className="block mb-2 font-medium">Transfer To</label>
        <select
          name="transferTo"
          value={formData.transferTo}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded-lg bg-[#FAFBFC]"
        >
          <option value="">-- Select User --</option>
          {users.map((u) => (
            <option key={u._id} value={u.name}>{u.name || u.email}</option>
          ))}
        </select>
      </div>

      {/* Remark */}
      <div>
        <label className="block mb-2 font-medium">Enter Remark</label>
        <input
          type="text"
          name="remark"
          value={formData.remark}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded-lg"
          placeholder="Optional remark"
        />
      </div>
    </div>
  );
};

export default Step3EmployeeDetails;
