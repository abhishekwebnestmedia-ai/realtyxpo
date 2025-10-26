import React, { useState, useEffect, useContext } from "react";
import api from "../../api/api"; // added import for api
import { AuthContext } from "../../context/AuthContext";
import Step1SellerDetails from "./components/Stepperform/Step1SellerDetails";
import Step2ProjectDetails from "./components/Stepperform/Step2ProjectDetails";
import Step3EmployeeDetails from "./components/Stepperform/Step3EmployeeDetails";
const StepperForm = () => {
  const { user } = useContext(AuthContext);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    budget: "",
    status: "",
    transferStatus: "Transferred",
    requirement: "",
    loanStatus: "",
    projectName: "",
    sector: "",
    unitNo: "",
    tower: "",
    typology: "",
    size: "",
    capturedBy: "",
    assignTo: "",
    source: "",
    transferTo: "",
    followUp: "",
    remark: "",
    contactNumbers: [],
  });
  const [contactInput, setContactInput] = useState("");

  // new state for dropdowns and users
  const [typologies, setTypologies] = useState([]);
  const [sources, setSources] = useState([]);
  const [paymentStatuses, setPaymentStatuses] = useState([]);
  const [users, setUsers] = useState([]);

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addContact = () => {
    const val = contactInput.trim();
    if (!val) return;
    setFormData((prev) => ({
      ...prev,
      contactNumbers: [...(prev.contactNumbers || []), val],
    }));
    setContactInput("");
  };

  const removeContact = (idx) => {
    setFormData((prev) => ({
      ...prev,
      contactNumbers: prev.contactNumbers.filter((_, i) => i !== idx),
    }));
  };

  // Fetch dropdowns and all users on mount
  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const [ddRes, usersRes] = await Promise.all([
          api.get("/inventry/dropdown"),
          api.get("/auth/alluser"),
        ]);
        if (!mounted) return;
        const dd = ddRes.data || {};
        setTypologies(Array.isArray(dd.typology) ? dd.typology : []);
        setSources(Array.isArray(dd.source) ? dd.source : []);
        setPaymentStatuses(
          Array.isArray(dd.paymentStatus) ? dd.paymentStatus : []
        );
        // expect usersRes.data to be an array of users
        setUsers(Array.isArray(usersRes.data.users) ? usersRes.data.users : []);
        console.log("Users API response:", usersRes.data.users);

      } catch (err) {
        console.error(
          "Failed to load dropdowns or users:",
          err.response?.data || err.message
        );
      }
    };
    fetchData();
    return () => {
      mounted = false;
    };
  }, []);

  // Prefill capturedBy with current user's name
  useEffect(() => {
    if (user?.name) {
      setFormData((prev) => ({ ...prev, capturedBy: user.name }));
    }
  }, [user]);



  const handleSubmit = async (e) => {
  e.preventDefault();

  // Map formData → API body
  const payload = {
    sellerName: formData.name,
    inventoryType: "Sales", // static? or add field if dynamic
    sector: formData.sector,
    unitNo: formData.unitNo,
    towerNo: formData.tower,
    typology: formData.typology ? [formData.typology] : [],
    size: formData.size,
    demand: formData.budget, // mapping budget → demand
    Project: formData.projectName ? [formData.projectName] : [],
    contactNumbers: formData.contactNumbers,
    email: formData.email,
    paymentStatus: formData.status ? [formData.status] : [],
    registryType: "Registry", // static? or add field
    requirement: formData.requirement,
    date: new Date().toISOString().split("T")[0], // today’s date
    capturedBy: formData.capturedBy,
    assignTo: formData.assignTo,
    transferTo: formData.transferTo,
    followUpDate: formData.followUp,
    source: formData.source ? [formData.source] : [],
    loanStatus: formData.loanStatus,
    remarks: formData.remark,
  };

  try {
    const res = await api.post("/inventry/createinventry", payload, {
      headers: {
        "Content-Type": "application/json",
        // 👇 your api instance should already attach token,
        // but if not, explicitly add:
        // Authorization: `Bearer ${localStorage.getItem("token")}`
      },
    });

    console.log("API Success:", res.data);
    alert("Inventory created successfully!");
  } catch (err) {
    console.error("API Error:", err.response?.data || err.message);
    alert("Failed to create inventory");
  }
};


  return (
    <div className="bg-white mx-auto p-6 rounded-3xl ">
      {/* Stepper Header */}
      <div className="flex items-center mb-6 ">
        {[1, 2, 3].map((s, i) => (
          <React.Fragment key={s}>
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-full font-bold ${
                step >= s
                  ? "bg-blue-600 text-white"
                  : "bg-gray-300 text-gray-600"
              }`}
            >
              {s}
            </div>
            {i < 2 && (
              <div
                className={`flex-1 h-[2px] ${
                  step > s ? "bg-blue-600" : "bg-gray-300"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
      <h2 className="text-2xl font-medium">Seller Details</h2>
      {/* Form Steps */}
      <form onSubmit={handleSubmit}>
        {step === 1 && (
  <Step1SellerDetails
    formData={formData}
    handleChange={handleChange}
    contactInput={contactInput}
    setContactInput={setContactInput}
    addContact={addContact}
    removeContact={removeContact}
    paymentStatuses={paymentStatuses}
  />
)}

{step === 2 && (
  <Step2ProjectDetails
    formData={formData}
    handleChange={handleChange}
    typologies={typologies}
  />
)}

{step === 3 && (
  <Step3EmployeeDetails
    formData={formData}
    handleChange={handleChange}
    users={users}
    filteredUsersForAssignTo={getFilteredUsersForAssignTo()}
    sources={sources}
  />
)}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
  {/* Back button */}
  {step > 1 && (
    <button
      type="button"
      onClick={() => setStep(step - 1)}
      className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
    >
      Back
    </button>
  )}

  {/* Next / Submit button */}
  {step < 3 ? (
    <button
      type="button"
      onClick={() => setStep(step + 1)}
      className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
    >
      Next
    </button>
  ) : (
    <button
      type="submit"
      className="ml-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
    >
      Submit
    </button>
  )}
</div>

      </form>
    </div>
  );
};

export default StepperForm;
