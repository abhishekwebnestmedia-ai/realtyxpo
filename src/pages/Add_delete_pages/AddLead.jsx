import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import api from "../../api/api";
import showToast from "../../notifications/AddSuccess"; // adjust path

const AddLead = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    customerName: "",
    contactNumber: "",
    email: "",
    status: "Hot",
    leadType: "",
    followUp: "",
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

  // 🔹 Fetch users and sources on mount
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const userRes = await api.get("/auth/alluser", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(userRes.data?.users || []);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload = {
        ...form,
        assignTo: form.assignTo || undefined, // send ObjectId
        transferTo: form.transferTo || undefined, // send string
      };

      await api.post("/realtleads/create", payload);

      // Invalidate leads cache to show new lead immediately
      queryClient.invalidateQueries({ queryKey: ["leads"] });

      // ✅ success toast
      showToast({ message: "Lead created successfully!", type: "success" });
      navigate("/all-leads");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to create lead");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
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
              type="text"
              id="contactNumber"
              className="w-full border border-gray-300 bg-[#FAFBFC] rounded px-3 py-2"
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
              className="w-full border border-gray-300 bg-[#FAFBFC] rounded px-3 py-2"
            />
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block mb-1 font-medium">
              Status
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              id="status"
              className="w-full border border-gray-300 bg-[#FAFBFC] rounded px-3 py-2"
            >
              <option value="Hot">Hot</option>
              <option value="Not connected">Not connected</option>
              <option value="Serious">Serious</option>
              <option value="Potential">Potential</option>
              <option value="Futuristic">Futuristic</option>
              <option value="Dead Lead">Dead Lead</option>
            </select>
          </div>

          {/* Follow-up Date */}
          <div>
            <label htmlFor="followUp" className="block mb-1 font-medium">
              Follow-up Date
            </label>
            <input
              name="followUp"
              value={form.followUp}
              onChange={handleChange}
              type="date"
              id="followUp"
              className="w-full border border-gray-300 bg-[#FAFBFC] rounded px-3 py-2"
            />
          </div>

          {/* Captured By */}
          <div>
            <label htmlFor="capturedBy" className="block mb-1 font-medium">
              Captured by
            </label>
            <select
              name="capturedBy"
              value={form.capturedBy}
              onChange={handleChange}
              id="capturedBy"
              className="w-full border border-gray-300 bg-[#FAFBFC] rounded px-3 py-2"
            >
              <option value="">-- Select User --</option>
              {users.map((u) => (
                <option key={u._id} value={u.name}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* Assign To */}
          <div>
            <label htmlFor="assignTo" className="block mb-1 font-medium">
              Assign to
            </label>
            <select
              name="assignTo"
              value={form.assignTo}
              onChange={handleChange}
              id="assignTo"
              className="w-full border border-gray-300 bg-[#FAFBFC] rounded px-3 py-2"
            >
              <option value="">-- Select User --</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* Source (with datalist) */}
          {/* Source Dropdown */}
          <div>
  <label htmlFor="source" className="block mb-1 font-medium">
    Source
  </label>
  <input
    list="sourceOptions"
    name="source"
    value={form.source}
    onChange={handleChange}
    id="source"
    className="w-full border border-gray-300 bg-[#FAFBFC] rounded px-3 py-2"
    placeholder="Select or type source"
  />
  <datalist id="sourceOptions">
    {dropdowns.source.map((src, i) => (
      <option key={i} value={src} />
    ))}
  </datalist>
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
          {/* Lead Type */}
          <div>
            <label htmlFor="leadType" className="block mb-1 font-medium">
              Lead Type
            </label>
            <select
              name="leadType"
              value={form.leadType}
              onChange={handleChange}
              id="leadType"
              className="w-full border border-gray-300 bg-[#FAFBFC] rounded px-3 py-2"
            >
              <option value="">-- Select Lead Type --</option>
              <option value="Buyer">Buyer</option>
              <option value="Rental">Rental</option>
            </select>
          </div>
        </div>

        {/* Submit */}
        <div className="mt-6">
          {error && <p className="text-red-500 mb-2">{error}</p>}
          <button type="submit" disabled={loading} className="btn px-4 py-2">
            {loading ? "Saving..." : "Save Lead"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddLead;
