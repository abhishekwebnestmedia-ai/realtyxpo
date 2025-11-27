import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import apiInstance from "../../../../api/api"; // your axios instance

const Step1SellerDetails = ({ paymentStatuses }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    contactNumbers: [],
    email: "",
    budget: "",
    status: "",
    requirement: "",
    loanStatus: "",
    // Other Step1 fields you need
  });

  const [fullPayload, setFullPayload] = useState(null); // full payload from API
  const [contactInput, setContactInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Fetch full inventory data on mount
  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError("No inventory ID provided");
        setLoading(false);
        return;
      }

      try {
        const response = await apiInstance.get(`/inventry/inventrylist/${id}`);
        const data = response.data || {};

        // Save full payload
        setFullPayload(data);

        // Pre-fill Step1 fields
        setFormData({
          name: data.sellerName || "",
          contactNumbers: Array.isArray(data.contactNumbers)
            ? data.contactNumbers
            : [],
          email: data.email || "",
          budget: data.demand || "",
          status: data.paymentStatus?.[0] || "",
          requirement: data.requirement || "",
          loanStatus: data.loanStatus || "",
        });
      } catch (err) {
        console.error("Failed to fetch seller details:", err);
        setError(err.message || "Failed to load data");
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

  const addContact = () => {
    if (contactInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        contactNumbers: [...prev.contactNumbers, contactInput.trim()],
      }));
      setContactInput("");
    }
  };

  const removeContact = (idx) => {
    setFormData((prev) => ({
      ...prev,
      contactNumbers: prev.contactNumbers.filter((_, i) => i !== idx),
    }));
  };

  const handleSave = async () => {
    if (!fullPayload) return;

    // Merge Step1 fields into full payload
    const payload = {
      ...fullPayload,
      sellerName: formData.name,
      demand: formData.budget,
      contactNumbers: formData.contactNumbers,
      email: formData.email,
      paymentStatus: formData.status ? [formData.status] : [],
      requirement: formData.requirement,
      loanStatus: formData.loanStatus,
    };

    try {
      await apiInstance.put(`/inventry/update/${id}`, payload);
      
      // ✅ Production-level cache invalidation
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      
      toast.success("Seller details updated successfully!");
      
      // ✅ Navigate back to inventory page
      navigate("/inventry");
    } catch (err) {
      console.error("Error updating inventory:", err);
      toast.error(err?.response?.data?.message || "Failed to update seller details. Please try again.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="">
      <div className="grid grid-cols-2 gap-8 mt-4">
        {/* Seller Name */}
        <div>
          <label className="block mb-2 font-medium">Seller Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg bg-[#FAFBFC] focus:border-blue-600"
            required
          />
        </div>

        {/* Contact Numbers */}
        <div>
          <label className="block mb-2 font-medium">Contact No.</label>
          <div className="flex items-center gap-2">
            <input
              type="tel"
              name="contactInput"
              value={contactInput}
              onChange={(e) => setContactInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), addContact())
              }
              placeholder="Enter phone number"
              className="w-full border px-3 py-2 rounded-lg bg-[#FAFBFC]"
            />
            <button
              type="button"
              onClick={addContact}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg"
            >
              +
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.contactNumbers.map((num, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full"
              >
                <span className="text-sm">{num}</span>
                <button
                  type="button"
                  onClick={() => removeContact(idx)}
                  className="text-red-500 text-sm"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block mb-2 font-medium">Enter Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg bg-[#FAFBFC]"
            required
          />
        </div>

        {/* Budget */}
        <div>
          <label className="block mb-2 font-medium">Enter Budget</label>
          <input
            type="text"
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg bg-[#FAFBFC]"
            required
          />
        </div>

        {/* Payment Status */}
        <div className="flex flex-col justify-between">
          <div className="">
            <label htmlFor="status" className="block mb-1 font-medium">
              Payment Status
            </label>
            <input
              list="paymentStatusList"
              name="status"
              id="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border border-gray-300 bg-[#FAFBFC] rounded px-3 py-2"
              placeholder="Select or type a payment status"
            />
            <datalist id="paymentStatusList">
              {(paymentStatuses || []).map((ps, i) => (
                <option key={i} value={ps} />
              ))}
            </datalist>
          </div>
          <div className="">
            <h2 className="mb-1 font-medium">Loan status</h2>
            <input
              type="text"
              name="loanStatus"
              value={formData.loanStatus}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg bg-[#FAFBFC] focus:border-blue-600"
            />
          </div>
        </div>

        {/* Requirement */}
        <div>
          <h2 className="mb-2 font-medium">Enter Requirement</h2>
          <textarea
            name="requirement"
            value={formData.requirement}
            onChange={handleChange}
            rows={7}
            className="border w-full"
          ></textarea>
        </div>

        {/* Loan Status */}

        {/* Save button */}
      </div>
      <div className="flex justify-end gap-3 mt-6">
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
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default Step1SellerDetails;
