import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import api from "../../../../api/api";

const Step3EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    capturedBy: "",
    assignTo: "",
    transferTo: "",
    followUp: "",
    remark: "",
    source: "",
  });

  const [users, setUsers] = useState([]);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // new saving state
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch users and inventory and dropdowns in parallel
        const [usersRes, inventoryRes, dropdownRes] = await Promise.all([
          api.get("/auth/alluser"),
          api.get(`/inventry/inventrylist/${id}`),
          api.get("/inventry/dropdown"),
        ]);

        // Normalize users response: accept either array or { users: [] }
        const fetchedUsers = Array.isArray(usersRes.data)
          ? usersRes.data
          : Array.isArray(usersRes.data?.users)
          ? usersRes.data.users
          : [];
        setUsers(fetchedUsers);

        const inventoryData = inventoryRes.data || {};
        const fetchedSources = dropdownRes.data?.source || [];
        setSources(fetchedSources);

        // helper to resolve a user identifier to a user._id if possible
        const resolveToUserId = (val) => {
          if (!val) return "";
          // if it's already an id and exists in users list, keep it
          const byId = fetchedUsers.find((u) => u._id === val);
          if (byId) return byId._id;
          // if val is an object with _id
          if (typeof val === "object" && val !== null && val._id) return val._id;
          // try to match by name or email
          const byName = fetchedUsers.find(
            (u) => (u.name && u.name === val) || (u.email && u.email === val)
          );
          if (byName) return byName._id;
          // fallback to original value (string) so UI can still show something
          return val;
        };

        // Inventory may store source as array or string; prefer first string
        const inventorySource = Array.isArray(inventoryData.source)
          ? inventoryData.source[0] || ""
          : inventoryData.source || "";

        // Inventory followup key might vary (followUpDate, followUp)
        const inventoryFollowUp =
          inventoryData.followUpDate ?? inventoryData.followUp ?? "";

        // Inventory remarks key variations (remarks / remark)
        const inventoryRemark = inventoryData.remarks ?? inventoryData.remark ?? "";

        setFormData({
          capturedBy: resolveToUserId(inventoryData.capturedBy),
          assignTo: resolveToUserId(inventoryData.assignTo),
          transferTo: resolveToUserId(inventoryData.transferTo),
          followUp: inventoryFollowUp,
          remark: inventoryRemark,
          source: inventorySource,
        });
      } catch (err) {
        console.error("Error fetching Step3 data:", err.response?.data || err.message || err);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Map an id (or value) to the corresponding user name/email if possible
  const resolveUserToString = (val) => {
    if (!val) return "";
    // if already a name-like string, return it
    if (typeof val === "string" && !users.find((u) => u._id === val)) {
      return val;
    }
    // if it's an ID, map to user.name || user.email
    const u = users.find((user) => user._id === val);
    if (u) return u.name || u.email || "";
    return val; // fallback to original value
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        capturedBy: resolveUserToString(formData.capturedBy),
        assignTo: resolveUserToString(formData.assignTo),
        transferTo: resolveUserToString(formData.transferTo),
        followUpDate: formData.followUp,
        remarks: formData.remark,
        source: formData.source ? [formData.source] : [],
      };

      console.log("Step3 update payload:", payload);
      const res = await api.put(`/inventry/update/${id}`, payload);
      console.log("Step3 update response:", res.data);
      
      // ✅ Production-level cache invalidation
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      
      alert("Step3 details updated successfully!");
      
      // ✅ Navigate back to inventory page
      navigate("/inventory");
    } catch (err) {
      console.error("Error updating Step3:", err.response?.data || err.message || err);
      alert("Failed to update Step3! See console for details.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <p>Loading Step 3 data...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="grid grid-cols-2 gap-8 mt-4">
      {/* Captured By */}
      <div>
        <label className="block mb-2 font-medium">Captured by</label>
        <select
          name="capturedBy"
          value={formData.capturedBy || ""}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded-lg bg-[#FAFBFC]"
        >
          <option value="">-- Select User --</option>
          {users.map((u) => (
            <option key={u._id} value={u._id}>
              {u.name || u.email}
            </option>
          ))}
        </select>
      </div>

      {/* Assign To */}
      <div>
        <label className="block mb-2 font-medium">Assign To</label>
        <select
          name="assignTo"
          value={formData.assignTo || ""}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded-lg bg-[#FAFBFC]"
        >
          <option value="">-- Select User --</option>
          {users.map((u) => (
            <option key={u._id} value={u._id}>
              {u.name || u.email}
            </option>
          ))}
        </select>
      </div>

      {/* Transfer To */}
      <div>
        <label className="block mb-2 font-medium">Transfer To</label>
        <select
          name="transferTo"
          value={formData.transferTo || ""}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded-lg bg-[#FAFBFC]"
        >
          <option value="">-- Select User --</option>
          {users.map((u) => (
            <option key={u._id} value={u._id}>
              {u.name || u.email}
            </option>
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

      {/* Remark */}
      <div>
        <label className="block mb-2 font-medium">Remark</label>
        <input
          type="text"
          name="remark"
          value={formData.remark}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded-lg"
        />
      </div>

      {/* Save Button */}
      <div className="col-span-2 flex justify-end mt-6">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className={`px-6 py-2 text-white rounded-lg ${isSaving ? "bg-gray-400" : "bg-green-600"}`}
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};

export default Step3EmployeeDetails;
