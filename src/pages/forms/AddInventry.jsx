import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import { toast } from "react-hot-toast";
import api from "../../api/api"; // added import for api
import { AuthContext } from "../../context/AuthContext";
import Step1SellerDetails from "./components/Stepperform/Step1SellerDetails";
import Step2ProjectDetails from "./components/Stepperform/Step2ProjectDetails";
import Step3EmployeeDetails from "./components/Stepperform/Step3EmployeeDetails";
const StepperForm = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [step, setStep] = useState(1);
  const totalSteps = 3;
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    budget: "",
    status: "",
    transferStatus: "",
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
    followUpDate: "",
    followUpTime: "",
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
    const { name, value } = e.target;
    if (name === 'assignTo') {
      setFormData((prev) => ({ ...prev, assignTo: value, transferTo: value }));
      return;
    }
    if (name === 'transferTo') {
      setFormData((prev) => ({ ...prev, transferTo: value, assignTo: value }));
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const addContact = () => {
    const val = contactInput.trim();
    // accept only digits, 10-13 length (supports country codes)
    if (!/^[0-9]{10,13}$/.test(val)) return;
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
        // expect usersRes.data to be an array of users; filter out backup/internal accounts
        const allUsers = usersRes.data?.users || usersRes.data || [];
        const filteredUsers = Array.isArray(allUsers)
          ? allUsers.filter(u => {
              const name = (u?.name || u?.fullName || u?.displayName || '').trim();
              return name !== 'Backup' && name !== 'Backup from everywhere';
            })
          : [];
        setUsers(filteredUsers);
        console.log("Users API response (filtered):", filteredUsers);

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

  // Prevent Enter key from submitting the form while using stepper
  const handleFormKeyDown = (e) => {
    if (e.key === 'Enter') {
      // allow Enter in textarea fields
      const tag = e.target && e.target.tagName ? e.target.tagName.toUpperCase() : '';
      if (tag !== 'TEXTAREA') {
        e.preventDefault();
      }
    }
  };

  const goToNextStep = () => setStep((prev) => Math.min(prev + 1, totalSteps));
  const goToPreviousStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleFinalSubmit = async () => {
    // Map formData → API body
    // Combine follow-up date and 12h time into IST string like leads
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
      followUpDate: followUpCombined,
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
      toast.success("Inventory created successfully!");
      navigate("/inventry");
    } catch (err) {
      console.error("API Error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to create inventory");
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
      <form onSubmit={(e) => e.preventDefault()} onKeyDown={handleFormKeyDown}>
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
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 rounded border border-red-500 text-red-600 hover:bg-red-50"
            >
              Cancel
            </button>

            {step > 1 && (
              <button
                type="button"
                onClick={goToPreviousStep}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Back
              </button>
            )}
          </div>

            {/* Next / Submit button */}
            <button
              type="button"
              onClick={step === totalSteps ? handleFinalSubmit : goToNextStep}
            className={`ml-auto px-6 py-2 text-white rounded-lg ${
              step === totalSteps
                ? "bg-green-600 hover:bg-green-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {step === totalSteps ? "Submit" : "Next"}
          </button>
        </div>

      </form>
    </div>
  );
};

export default StepperForm;
