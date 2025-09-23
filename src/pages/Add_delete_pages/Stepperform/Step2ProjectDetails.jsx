import React from "react";

const Step2ProjectDetails = ({ formData, handleChange, typologies }) => {
  return (
    <div className="grid grid-cols-2 gap-8 mt-4">
      <div>
        <label className="block mb-2 font-medium">Project Name</label>
        <input
          type="text"
          name="projectName"
          value={formData.projectName}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded-lg"
          required
        />
      </div>

      <div>
        <label className="block mb-2 font-medium">Sector No.</label>
        <input
          type="text"
          name="sector"
          value={formData.sector}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded-lg"
          required
        />
      </div>

      <div>
        <label className="block mb-2 font-medium">Unit no.</label>
        <input
          type="text"
          name="unitNo"
          value={formData.unitNo}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded-lg"
          required
        />
      </div>

      <div>
        <label className="block mb-2 font-medium">Tower</label>
        <input
          type="text"
          name="tower"
          value={formData.tower}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded-lg"
          required
        />
      </div>

      <div>
        <label className="block mb-2 font-medium">Typology</label>
        <input
          list="typologyList"
          name="typology"
          value={formData.typology}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded-lg"
          placeholder="Select or type typology"
          required
        />
        <datalist id="typologyList">
          {typologies.map((t, i) => (
            <option key={i} value={t} />
          ))}
        </datalist>
      </div>

      <div>
        <label className="block mb-2 font-medium">Size</label>
        <input
          type="text"
          name="size"
          value={formData.size}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded-lg"
          required
        />
      </div>
    </div>
  );
};

export default Step2ProjectDetails;
