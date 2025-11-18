import React from "react";

const Step1SellerDetails = ({ formData, handleChange, contactInput, setContactInput, addContact, removeContact, paymentStatuses }) => {
  return (
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
          placeholder="Enter name"
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
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addContact();
              }
            }}
            placeholder="Enter phone number"
            className="w-full border px-3 py-2 rounded-lg bg-[#FAFBFC]"
            pattern="^[0-9]{10,13}$"
            title="Enter 10-13 digit numeric phone number"
          />
          <button
            type="button"
            onClick={addContact}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg"
          >
            +
          </button>
        </div>
        {/* chips */}
        <div className="flex flex-wrap gap-2 mt-2">
          {(formData.contactNumbers || []).map((num, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
              <span className="text-sm">{num}</span>
              <button type="button" onClick={() => removeContact(idx)} className="text-red-500 text-sm">x</button>
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
          pattern="^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$"
          title="Enter a valid email address"
          placeholder="Enter email"
        />
      </div>

      {/* Demand (previously labeled Budget) */}
      <div>
        <label className="block mb-2 font-medium">Demand</label>
        <input
          type="text"
          name="budget"
          value={formData.budget}
          onChange={handleChange}
          placeholder="Enter demand"
          className="w-full border px-3 py-2 rounded-lg bg-[#FAFBFC]"
          required
        />
      </div>

      {/* Payment Status */}
      <div>
        <label htmlFor="status" className="block mb-1 font-medium">Payment Status</label>
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
          {paymentStatuses.map((ps, i) => (
            <option key={i} value={ps} />
          ))}
        </datalist>
      </div>

      {/* Transfer Status (no default selected) */}
      <div className="space-y-2">
        <label className="block font-medium mb-1">Select Status</label>
        <div className="flex justify-between space-x-4 bg-[#FAFBFC]">
          {["Registry Case", "Transfer Case"].map((status) => (
            <div key={status} className="border w-full p-1 px-4 rounded-lg">
              <label className="flex justify-between space-x-2">
                <span>{status}</span>
                <input
                  type="radio"
                  name="transferStatus"
                  value={status}
                  checked={formData.transferStatus === status}
                  onChange={handleChange}
                  className="accent-blue-600"
                />
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Requirement */}
      <div>
        <h2 className="mb-1 font-medium">Enter Requirement</h2>
        <textarea
          name="requirement"
          value={formData.requirement}
          onChange={handleChange}
          rows={6}
          className="border w-full"
        ></textarea>
      </div>

      {/* Loan Status */}
      <div>
        <h2 className="mb-1 font-medium">Loan status</h2>
        <input
          type="text"
          name="loanStatus"
          value={formData.loanStatus}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded-lg bg-[#FAFBFC] focus:border-blue-600"
          placeholder="Enter loanStatus"
        />
      </div>
    </div>
  );
};

export default Step1SellerDetails;
