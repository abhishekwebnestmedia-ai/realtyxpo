import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import api from "../../../api/api"; // axios instance

const Step2ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    projectName: "",
    sector: "",
    unitNo: "",
    tower: "",
    typology: "",
    size: "",
  });

  const [fullPayload, setFullPayload] = useState(null);
  const [typologies, setTypologies] = useState([]); // ⬅️ store dropdown values

  // ✅ Fetch inventory details on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/inventry/inventrylist/${id}`);
        if (res.data) {
          const data = res.data;
          setFullPayload(data);

          // Prefill form fields from API
          setFormData({
            projectName: data.Project?.[0] || "",
            sector: data.sector || "",
            unitNo: data.unitNo || "",
            tower: data.towerNo || "",
            typology: data.typology?.[0] || "",
            size: data.size || "",
          });
        }
      } catch (err) {
        console.error("Error fetching inventory:", err);
      }
    };

    fetchData();
  }, [id]);

  // ✅ Fetch typology dropdown data
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const res = await api.get(`/inventry/dropdown`);
        if (res.data?.typology) {
          setTypologies(res.data.typology); // assuming response has `typology` array
        }
      } catch (err) {
        console.error("Error fetching dropdowns:", err);
      }
    };

    fetchDropdowns();
  }, []);

  // ✅ Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Save updated step2 data
  const handleSave = async () => {
    if (!fullPayload) return;

    const payload = {
      ...fullPayload,
      Project: formData.projectName ? [formData.projectName] : [],
      sector: formData.sector,
      unitNo: formData.unitNo,
      towerNo: formData.tower,
      typology: formData.typology ? [formData.typology] : [],
      size: formData.size,
    };

    try {
      await api.put(`/inventry/update/${id}`, payload);
      
      // ✅ Production-level cache invalidation
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      
      alert("Step2 details updated successfully!");
      
      // ✅ Navigate back to inventory page
      navigate("/inventory");
    } catch (err) {
      console.error("Error updating inventory:", err);
      alert("Failed to update Step2!");
    }
  };

  return (
    <div className="grid grid-cols-2 gap-8 mt-4">
      {/* Project Name */}
      <div>
        <label className="block mb-2 font-medium">Project Name</label>
        <input
          type="text"
          name="projectName"
          value={formData.projectName}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded-lg"
        />
      </div>

      {/* Sector */}
      <div>
        <label className="block mb-2 font-medium">Sector No.</label>
        <input
          type="text"
          name="sector"
          value={formData.sector}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded-lg"
        />
      </div>

      {/* Unit No */}
      <div>
        <label className="block mb-2 font-medium">Unit No.</label>
        <input
          type="text"
          name="unitNo"
          value={formData.unitNo}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded-lg"
        />
      </div>

      {/* Tower */}
      <div>
        <label className="block mb-2 font-medium">Tower</label>
        <input
          type="text"
          name="tower"
          value={formData.tower}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded-lg"
        />
      </div>

      {/* Typology Dropdown */}
      <div>
        <label className="block mb-2 font-medium">Typology</label>
        <input
          list="typologyList"
          name="typology"
          value={formData.typology}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded-lg"
          placeholder="Select or type typology"
        />
        <datalist id="typologyList">
          {typologies.map((t, i) => (
            <option key={i} value={t} />
          ))}
        </datalist>
      </div>

      {/* Size */}
      <div>
        <label className="block mb-2 font-medium">Size</label>
        <input
          type="text"
          name="size"
          value={formData.size}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded-lg"
        />
      </div>

      {/* Save Button */}
      <div className="col-span-2 flex justify-end mt-6">
        <button
          type="button"
          onClick={handleSave}
          className="px-6 py-2 bg-green-600 text-white rounded-lg"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default Step2ProjectDetails;
