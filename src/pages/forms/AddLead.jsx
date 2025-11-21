import React, { useState, useEffect, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/api";
import { toast } from 'react-hot-toast';
import CustomSelect from "../../components/ui/CustomSelect";
import TimePicker from "../../components/ui/TimePicker";

const AddLead = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useContext(AuthContext);
  const [form, setForm] = useState({
    customerName: "",
    contactNumber: "",
    email: "",
    status: "Not connected",
    leadType: "",
    // separate date/time inputs for 12-hour picker (default empty)
    followUpDate: "",
    followUpTime: "",
    requirement: "",
    remark: "",
    date: new Date().toISOString().split("T")[0],
    capturedBy: "",
    assignTo: "",
    transferTo: "",
    source: "",
    Budget: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [dropdowns, setDropdowns] = useState({
    typology: [],
    source: [],
    paymentStatus: [],
  });

  const token = localStorage.getItem("token");

  // Filter users based on role for assignTo dropdown
  const getFilteredUsersForAssignTo = () => {
    if (user?.role === 'admin') {
      return users; // Admin sees all users
    } else {
      // Regular users see only themselves
      const currentUser = users?.find(u => u._id === user?._id);
      return currentUser ? [currentUser] : [];
    }
  };

  // 🔹 Fetch users and sources on mount
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const userRes = await api.get("/auth/alluser", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const all = userRes.data?.users || userRes.data || [];
        const filtered = Array.isArray(all)
          ? all.filter(u => {
              const name = (u?.name || u?.fullName || u?.displayName || '').trim();
              return name !== 'Backup' && name !== 'Backup from everywhere';
            })
          : [];
        setUsers(filtered);

        const sourceRes = await api.get("/inventry/dropdown", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDropdowns(
          sourceRes.data || { typology: [], source: [], paymentStatus: [] }
        );
      } catch (err) {
        console.error("Failed to fetch dropdown data", err);
      }
    };

    fetchDropdowns();
  }, [token]);

  // Prefill capturedBy with current user's name so the disabled select shows the logged-in user
  useEffect(() => {
    if (user?.name) {
      setForm((prev) => ({ ...prev, capturedBy: user.name }));
    }
  }, [user]);

  // Memoize select option lists to avoid recreating arrays on every render
  const capturedByOptions = useMemo(() => (users || []).map(u => ({ value: u.name, label: u.name })), [users]);
  const assignToOptions = useMemo(() => getFilteredUsersForAssignTo().map(u => ({ value: u._id, label: u.name })), [users, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Auto-sync assignTo and transferTo: if one is set, mirror to the other
    if (name === 'assignTo') {
      setForm((prev) => ({ ...prev, assignTo: value, transferTo: value }));
      return;
    }
    if (name === 'transferTo') {
      setForm((prev) => ({ ...prev, transferTo: value, assignTo: value }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // helper: if assignTo/transferTo are ids, map to name using users list
      const resolveToName = (val) => {
        if (!val) return undefined;
        // if value already looks like a name (contains space or non-id), return as-is
        const found = users.find((u) => u._id === val || u.id === val || u.name === val || u.email === val);
        if (found) return found.name || found.email;
        return val;
      };

      // Combine follow-up date and 12h time into ISO-ish string expected by backend
      let followUpCombined = '';
      if (form.followUpDate) {
        const timeStr = form.followUpTime || '';
        let hour24 = 0, minute = '00';
        if (timeStr) {
          const parts = timeStr.split(' ');
          const hm = parts[0] || '';
          const ampm = (parts[1] || '').toLowerCase();
          const [hh, mm] = hm.split(':');
          let h = parseInt(hh || '0', 10);
          minute = (mm || '00').padStart(2, '0');
          if (ampm === 'pm' && h !== 12) h += 12;
          if (ampm === 'am' && h === 12) h = 0;
          hour24 = String(h).padStart(2, '0');
        }
        // Send follow-up in IST timezone (+05:30) regardless of client timezone
        followUpCombined = `${form.followUpDate}T${hour24}:${minute}:00+05:30`;
      }

      // Required-field validation (contact, email, follow-up)
      if (!form.contactNumber) {
        setError('Contact number is required');
        setLoading(false);
        return;
      }
      if (!form.email) {
        setError('Email is required');
        setLoading(false);
        return;
      }
      if (!followUpCombined) {
        setError('Follow-up date & time are required');
        setLoading(false);
        return;
      }

      const normalizedStatus = (form.status || '').toLowerCase() === 'not connected' ? 'Not Connected' : form.status;

      const payload = {
        customerName: form.customerName,
        contactNumber: form.contactNumber,
        email: form.email,
        status: normalizedStatus,
        leadType: form.leadType,
        followUp: followUpCombined,
        requirement: form.requirement,
        remark: form.remark,
        date: form.date,
        capturedBy: form.capturedBy,
        assignTo: resolveToName(form.assignTo),
        transferTo: resolveToName(form.transferTo),
        source: form.source,
        Budget: form.Budget,
      };

  // Debug log: show final payload that will be sent to the API
  console.log('AddLead: Submit payload (final):', payload);

  await api.post("/realtleads/create", payload);

        // Invalidate leads cache to show new lead immediately
        queryClient.invalidateQueries({ queryKey: ["leads"] });
        toast.success('Lead created successfully!');
      navigate("/all-leads");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to create lead");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-2xl" >
      <h2 className="text-2xl font-medium">Add Lead</h2>
      <form onSubmit={handleSubmit} className="mt-5">
        <div className="grid grid-cols-2 gap-4">
          {/* Customer Name */}
          <div>
            <label htmlFor="customerName" className="block mb-1 font-medium">
              Customer Name
            </label>
            <input
              name="customerName"
              value={form.customerName}
              onChange={handleChange}
              type="text"
              id="customerName"
              className="w-full border border-gray-300 bg-[#FAFBFC] rounded px-3 py-2"
              placeholder="Enter customerName"
            />
          </div>

          {/* Contact Number */}
          <div>
            <label htmlFor="contactNumber" className="block mb-1 font-medium">
              Contact No.
            </label>
            <input
              name="contactNumber"
              value={form.contactNumber}
              onChange={handleChange}
              type="tel"
              id="contactNumber"
              pattern="^[0-9]{10,13}$"
              title="Enter 10-13 digit numeric phone number"
              required
              className="w-full border border-gray-300 bg-[#FAFBFC] rounded px-3 py-2"
              placeholder="Enter contactNumber"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block mb-1 font-medium">
              Enter Email
            </label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              type="email"
              id="email"
              required
              pattern="^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
              className="w-full border border-gray-300 bg-[#FAFBFC] rounded px-3 py-2"
              placeholder="Enter email"
            />
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block mb-1 font-medium">
              Status
            </label>
            <CustomSelect
              id="status"
              name="status"
              value={form.status}
              onChange={handleChange}
              options={[
                { value: '', label: '-- Select Status --' },
                { value: 'Hot', label: 'Hot' },
                { value: 'Not connected', label: 'Not connected' },
                { value: 'Serious', label: 'Serious' },
                { value: 'Potential', label: 'Potential' },
                { value: 'Futuristic', label: 'Futuristic' },
                { value: 'Dead Lead', label: 'Dead Lead' },
              ]}
            />
          </div>

          {/* Follow-up Date & Time (12-hour) */}
          <div>
            <label className="block mb-1 font-medium">Follow-up</label>
            <input
              name="followUpDate"
              value={form.followUpDate}
              onChange={handleChange}
              type="date"
              required
              className="w-full border border-gray-300 bg-[#FAFBFC] rounded px-3 py-2 mb-2"
              placeholder="Enter followUpDate"
            />
            <TimePicker
              name="followUpTime"
              value={form.followUpTime}
              onChange={handleChange}
              className="w-full"
            />
          </div>

          {/* Captured By */}
          <div>
            <label htmlFor="capturedBy" className="block mb-1 font-medium">
              Captured by
            </label>
            <CustomSelect
              id="capturedBy"
              name="capturedBy"
              value={form.capturedBy}
              onChange={handleChange}
              options={capturedByOptions}
              placeholder="-- Select User --"
            />
          </div>

          {/* Assign To */}
          <div>
            <label htmlFor="assignTo" className="block mb-1 font-medium">
              Assign to
            </label>
            <CustomSelect
              id="assignTo"
              name="assignTo"
              value={form.assignTo}
              onChange={handleChange}
              options={assignToOptions}
              placeholder="-- Select User --"
            />
          </div>

          {/* Transfer To */}
          <div>
            <label htmlFor="transferTo" className="block mb-1 font-medium">
              Transfer To
            </label>
            <CustomSelect
              id="transferTo"
              name="transferTo"
              value={form.transferTo}
              onChange={handleChange}
              options={assignToOptions}
              placeholder="-- Select User --"
            />
          </div>

                    {/* Source (with datalist) */}
                    <div>
                      <label htmlFor="source" className="block mb-1 font-medium">
                        Source
                      </label>
                      <div className="custom-select-wrapper">
                        <input
                          list="sourceOptions"
                          name="source"
                          value={form.source}
                          onChange={handleChange}
                          id="source"
                          className="custom-select"
                          placeholder="Select or type source"
                        />
                        <svg className="custom-select-caret" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M5.23 7.21a.75.75 0 011.06-.02L10 10.67l3.71-3.48a.75.75 0 111.02 1.1l-4.2 3.94a.75.75 0 01-1.02 0L5.25 8.29a.75.75 0 01-.02-1.08z"/></svg>
                        <datalist id="sourceOptions">
                          {dropdowns.source.map((src, i) => (
                            <option key={i} value={src} />
                          ))}
                        </datalist>
                      </div>
                    </div>

                    {/* Lead Type - moved next to Source to render in the same row */}
                    <div>
                      <label htmlFor="leadType" className="block mb-1 font-medium">
                        Lead Type
                      </label>
                      <CustomSelect
                        id="leadType"
                        name="leadType"
                        value={form.leadType}
                        onChange={handleChange}
                        options={[{ value: '', label: '-- Select Lead Type --' }, { value: 'Buyer', label: 'Buyer' }, { value: 'Rental', label: 'Rental' }]}
                      />
                    </div>


          {/* Requirement */}
          <div className="">
            <label htmlFor="requirement" className="block mb-1 font-medium">
              Requirement
            </label>
            <textarea
              name="requirement"
              value={form.requirement}
              onChange={handleChange}
              id="requirement"
              className="w-full border border-gray-300 bg-[#FAFBFC] rounded px-3 py-2"
              placeholder="Enter requirement"
              rows={4}
            />
          </div>

          {/* Remark */}
          <div className="">
            <label htmlFor="remark" className="block mb-1 font-medium">
              Enter Remark
            </label>
            <textarea
              name="remark"
              value={form.remark}
              onChange={handleChange}
              id="remark"
              placeholder="Enter Remark"
              className="w-full border bg-[#FAFBFC] border-gray-300 rounded px-3 py-2"
              rows={4}
            />
          </div>

          {/* Hidden Date */}
          <div className="hidden">
            <label htmlFor="date" className="block mb-1 font-medium">
              Date
            </label>
            <input
              name="date"
              type="date"
              id="date"
              className="w-full border border-gray-300 bg-[#FAFBFC] rounded px-3 py-2"
              value={form.date}
              readOnly
            />
          </div>
        </div>

        {/* Submit: error on left, Cancel + Save on right */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex-1">
            {error && <p className="text-red-500">{error}</p>}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => navigate(-1)} className="rounded border border-red-500 px-4 py-2 text-red-600 hover:bg-red-50">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn px-4 py-2">
              {loading ? "Saving..." : "Save Lead"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddLead;
