import React, { useEffect, useState, useContext, useMemo } from "react";
import TimePicker from '../../../../components/ui/TimePicker';
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useUsers } from "../../../../hooks/useBroadcast";
import { AuthContext } from "../../../../context/AuthContext";
import api from "../../../../api/api";

const Step3EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient(); 
  const { users: allUsers } = useUsers();
  const { user } = useContext(AuthContext);

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

  // Filter users for Assign To dropdown: admin sees all, regular users see only themselves
  const getFilteredUsersForAssignTo = () => {
    const pool = getUserPool;
    if (user?.role === "admin") return pool;
    // try to find the current user in the pool
    const current = pool.find((u) => u._id === user?._id || u.id === user?._id);
    if (current) return [current];
    // fallback to constructing a minimal option from the logged-in user
    if (user) return [{ _id: user._id || user.id, name: user.name || user.username }];
    return [];
  };

  // Merge realtime allUsers and locally fetched users into a de-duped pool
  const getUserPool = useMemo(() => {
    const a = Array.isArray(allUsers) ? allUsers : [];
    const b = Array.isArray(users) ? users : [];
    const map = new Map();
    // prefer entries from a (realtime) when keys collide
    a.concat(b).forEach((u) => {
      const key = u._id || u.id || u.name || u.email;
      if (!map.has(key)) map.set(key, u);
    });
    return Array.from(map.values());
  }, [allUsers, users]);

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
        // Filter out known internal backup accounts
        const filtered = Array.isArray(fetchedUsers)
          ? fetchedUsers.filter(u => {
              const name = (u?.name || u?.fullName || u?.displayName || '').trim();
              return name !== 'Backup' && name !== 'Backup from everywhere';
            })
          : [];
        setUsers(filtered);

        const inventoryData = inventoryRes.data || {};
        const fetchedSources = dropdownRes.data?.source || [];
        setSources(fetchedSources);

        

        // helper to resolve a user identifier to a user.name if possible
        const resolveToUserName = (val) => {
          if (!val) return "";
          // if it's already an object with a name
          if (typeof val === "object" && val !== null && val.name) return val.name;
          // try to match by id or name or email
          const byId = fetchedUsers.find((u) => u._id === val || u.id === val);
          if (byId) return byId.name || byId.email || "";
          const byName = fetchedUsers.find((u) => u.name === val || u.email === val);
          if (byName) return byName.name || byName.email || "";
          return val;
        };

        // Inventory may store source as array or string; prefer first string
        const inventorySource = Array.isArray(inventoryData.source)
          ? inventoryData.source[0] || ""
          : inventoryData.source || "";

        // Inventory followup - prefer raw ISO format if available, then fallback to formatted
        const inventoryFollowUp =
          inventoryData.followUpDateRaw ?? inventoryData.followUpDate ?? inventoryData.followUp ?? "";

        // Inventory remarks key variations (remarks / remark)
        const inventoryRemark = inventoryData.remarks ?? inventoryData.remark ?? "";

        // parse follow-up into separate date and 12-hour time for the edit form
        // If raw ISO (UTC) format, convert to IST first; otherwise parse directly
        let followUpDateVal = '';
        let followUpTimeVal = '';
        
        console.log('📅 Raw followup data:', { 
          followUpDateRaw: inventoryData.followUpDateRaw,
          followUpDate: inventoryData.followUpDate,
          followUp: inventoryData.followUp,
          using: inventoryFollowUp 
        });
        
        if (inventoryFollowUp) {
          const asStr = String(inventoryFollowUp).trim();
          
          // Check if it's ISO UTC format (ends with Z or has timezone)
          if (asStr.includes('Z') || asStr.match(/[+-]\d{2}:\d{2}$/)) {
            // Convert UTC to IST by creating Date and formatting in IST
            const utcDate = new Date(asStr);
            if (!isNaN(utcDate.getTime())) {
              // Format in IST timezone
              const istOptions = { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false };
              const istParts = new Intl.DateTimeFormat('en-CA', istOptions).formatToParts(utcDate);
              const getPart = (type) => istParts.find(p => p.type === type)?.value || '';
              followUpDateVal = `${getPart('year')}-${getPart('month')}-${getPart('day')}`;
              const hh = parseInt(getPart('hour'), 10);
              const mm = getPart('minute');
              const ampm = hh >= 12 ? 'PM' : 'AM';
              const hour12 = ((hh + 11) % 12) + 1;
              followUpTimeVal = `${String(hour12).padStart(2, '0')}:${mm} ${ampm}`;
            }
          } else {
            // Handle "YYYY-MM-DD HH:mm:ss" (space) format - already in IST
            const separator = asStr.includes('T') ? 'T' : ' ';
            const parts = asStr.split(separator);
            followUpDateVal = parts[0] || '';
            const timePart = parts[1] || '';
            
            if (timePart) {
              const m = timePart.match(/^(\d{1,2}):(\d{2})/);
              if (m) {
                let hh = parseInt(m[1], 10);
                const mm = m[2];
                const ampm = hh >= 12 ? 'PM' : 'AM';
                const hour12 = ((hh + 11) % 12) + 1;
                followUpTimeVal = `${String(hour12).padStart(2, '0')}:${mm} ${ampm}`;
              }
            }
          }
        }
        
        console.log('📅 Parsed followup:', { followUpDateVal, followUpTimeVal });

        setFormData({
          capturedBy: resolveToUserName(inventoryData.capturedBy),
          assignTo: resolveToUserName(inventoryData.assignTo),
          transferTo: resolveToUserName(inventoryData.transferTo),
          followUpDate: followUpDateVal,
          followUpTime: followUpTimeVal,
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
    const pool = getUserPool;

    // if already a name-like string and not an id in pool, return it
    if (typeof val === "string" && !pool.find((u) => u._id === val || u.id === val)) {
      return val;
    }

    // if it's an ID or id-like, map to user.name || user.email
    const u = pool.find((user) => user._id === val || user.id === val);
    if (u) return u.name || u.email || "";

    return val; // fallback to original value
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Combine followUpDate + followUpTime into an ISO-like timestamp in IST similar to AddInventry
      let followUpCombined = '';
      if (formData.followUpDate) {
        const timeStr = formData.followUpTime || '';
        let hour24 = '00';
        let minute = '00';
        if (timeStr) {
          const parts = String(timeStr).trim().split(' ');
          const hm = parts[0] || '';
          const ampm = (parts[1] || '').toLowerCase();
          const [hh, mm] = hm.split(':');
          let h = parseInt(hh || '0', 10);
          minute = (mm || '00').padStart(2, '0');
          if (ampm === 'pm' && h !== 12) h += 12;
          if (ampm === 'am' && h === 12) h = 0;
          hour24 = String(h).padStart(2, '0');
        }
        followUpCombined = `${formData.followUpDate}T${hour24}:${minute}:00+05:30`;
      }

      const payload = {
        capturedBy: resolveUserToString(formData.capturedBy),
        assignTo: resolveUserToString(formData.assignTo),
        transferTo: resolveUserToString(formData.transferTo),
        followUpDate: followUpCombined,
        remarks: formData.remark,
        source: formData.source ? [formData.source] : [],
      };

      console.log("Step3 update payload:", payload);
      const res = await api.put(`/inventry/update/${id}`, payload);
      console.log("Step3 update response:", res.data);
      
      // ✅ Production-level cache invalidation
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      
      toast.success("Employee details updated successfully!");
      
      // ✅ Navigate back to inventory page
      navigate("/inventry");
    } catch (err) {
      console.error("Error updating Step3:", err.response?.data || err.message || err);
      toast.error(err?.response?.data?.message || "Failed to update employee details. Please try again.");
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
          {getUserPool.map((u) => (
            <option key={u._id || u.id || u.email} value={u.name || u.email}>
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
          {getFilteredUsersForAssignTo().map((u) => (
            <option key={u._id || u.id || u.email} value={u.name || u.email}>
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
          {getUserPool.map((u) => (
            <option key={u._id || u.id || u.email} value={u.name || u.email}>
              {u.name || u.email}
            </option>
          ))}
        </select>
      </div>

      {/* Source */}
      <div>
        <label className="block mb-2 font-medium">Source</label>
        <input
          list="sourceOptions"
          name="source"
          value={formData.source}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded-lg"
          placeholder="Select or type source"
        />
        <datalist id="sourceOptions">
          {sources.map((s, i) => (
            <option key={i} value={s} />
          ))}
        </datalist>
      </div>

      {/* Follow Up Date + Time */}
      <div>
        <label className="block mb-2 font-medium">Follow up Date</label>
        <input
          type="date"
          name="followUpDate"
          value={formData.followUpDate || ""}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded-lg mb-2"
        />
        <TimePicker
          name="followUpTime"
          value={formData.followUpTime || ""}
          onChange={handleChange}
          className="w-full"
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

      {/* Cancel and Save Buttons */}
      <div className="col-span-2 flex justify-end gap-3 mt-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className={`px-6 py-2 text-white rounded-lg ${isSaving ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`}
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};

export default Step3EmployeeDetails;
