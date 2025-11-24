import React, { useMemo } from "react";

const DEFAULT_TYPOLOGY_CATEGORIES = ["1BHK", "2BHK", "3BHK", "4BHK", "5BHK"];

const Step2ProjectDetails = ({ formData, handleChange, typologies = [] }) => {
  const typologyOptions = useMemo(() => {
    return Array.from(new Set([...DEFAULT_TYPOLOGY_CATEGORIES, ...typologies]));
  }, [typologies]);

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
           placeholder="Enter projectName"
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
           placeholder="Enter sector"
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
           placeholder="Enter unitNo"
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
           placeholder="Enter tower"
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
          {typologyOptions.map((t) => (
            <option key={t} value={t} />
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
           placeholder="Enter size"
          required
        />
      </div>
    </div>
  );
};

export default Step2ProjectDetails;
