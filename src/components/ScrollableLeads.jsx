import React, { useState } from "react";
import Pagination from "./Pagination"; // ✅ Make sure this path is correct
import { motion } from "framer-motion";
import { Pencil, Trash2, ChevronDown, ListFilter, FilePlus2 } from "lucide-react";
const buyersData = [
  {
    id: 1,
    name: "Justin Lara",
    phone: "(389)059-5273",
    email: "tranjeffery@yahoo.com",
    status: "In Progress",
    followUp: "06-02-2025",
    requirement: "Plot",
    remark: "Not interested",
    date: "09-08-2025",
    capturedBy: "Karen",
    assignTo: "Charlotte",
    transferTo: "Jonathan",
    source: "Walk-in",
  },
  {
    id: 2,
    name: "Allison Aguilar",
    phone: "+1-042-962-7064",
    email: "ijoyce@yahoo.com",
    status: "Closed",
    followUp: "28-04-2025",
    requirement: "Plot",
    remark: "Interested",
    date: "04-05-2025",
    capturedBy: "Cindy",
    assignTo: "Heather",
    transferTo: "Robert",
    source: "Website",
  },
  {
    id: 3,
    name: "Ryan Jones",
    phone: "(449)792-7798x0992",
    email: "toddcherry@yahoo.com",
    status: "Follow-up",
    followUp: "06-03-2025",
    requirement: "Villa",
    remark: "Not interested",
    date: "09-03-2025",
    capturedBy: "Rachel",
    assignTo: "Jeffrey",
    transferTo: "David",
    source: "Walk-in",
  },
  {
    id: 4,
    name: "Molly Alexander",
    phone: "695.547.6293",
    email: "jeffreywright@king.biz",
    status: "Follow-up",
    followUp: "11-03-2025",
    requirement: "Commercial Space",
    remark: "Budget issue",
    date: "11-04-2025",
    capturedBy: "Kurt",
    assignTo: "Tamara",
    transferTo: "Judith",
    source: "Referral",
  },
  {
    id: 5,
    name: "Teresa Martinez PhD",
    phone: "001-963-662-4536x14141",
    email: "yhaley@hotmail.com",
    status: "New",
    followUp: "04-01-2025",
    requirement: "Commercial Space",
    remark: "Budget issue",
    date: "23-04-2025",
    capturedBy: "Curtis",
    assignTo: "Maxwell",
    transferTo: "Jose",
    source: "Google Ads",
  },
  {
    id: 6,
    name: "Justin Bullock",
    phone: "(428)085-0021",
    email: "pattersonlinda@yahoo.com",
    status: "New",
    followUp: "11-08-2025",
    requirement: "Plot",
    remark: "Interested",
    date: "06-07-2025",
    capturedBy: "Luis",
    assignTo: "Michael",
    transferTo: "Jacqueline",
    source: "Facebook Ads",
  },
  {
    id: 7,
    name: "Bonnie Robbins",
    phone: "001-891-933-0147x949",
    email: "bford@yahoo.com",
    status: "Closed",
    followUp: "31-01-2025",
    requirement: "Commercial Space",
    remark: "Budget issue",
    date: "24-03-2025",
    capturedBy: "Dylan",
    assignTo: "David",
    transferTo: "Kathleen",
    source: "Google Ads",
  },
  {
    id: 8,
    name: "Rita Santos",
    phone: "804.571.4708x46764",
    email: "emorales@green.biz",
    status: "Follow-up",
    followUp: "22-04-2025",
    requirement: "2BHK Flat",
    remark: "Interested",
    date: "03-04-2025",
    capturedBy: "Randall",
    assignTo: "Caroline",
    transferTo: "Matthew",
    source: "Referral",
  },
  {
    id: 9,
    name: "Taylor Lewis",
    phone: "317-759-0073",
    email: "jamesstewart@hotmail.com",
    status: "New",
    followUp: "14-03-2025",
    requirement: "Plot",
    remark: "Interested",
    date: "16-07-2025",
    capturedBy: "Theresa",
    assignTo: "Penny",
    transferTo: "David",
    source: "Referral",
  },
  {
    id: 10,
    name: "Peter Garcia",
    phone: "783-979-1171x469",
    email: "diana51@gmail.com",
    status: "In Progress",
    followUp: "08-02-2025",
    requirement: "Commercial Space",
    remark: "Not interested",
    date: "03-08-2025",
    capturedBy: "Annette",
    assignTo: "Joseph",
    transferTo: "Julia",
    source: "Google Ads",
  },
  {
    id: 11,
    name: "David Munoz",
    phone: "+1-596-328-0834x9106",
    email: "hannah30@romero.biz",
    status: "Follow-up",
    followUp: "20-02-2025",
    requirement: "2BHK Flat",
    remark: "Interested",
    date: "09-05-2025",
    capturedBy: "Natalie",
    assignTo: "Christine",
    transferTo: "Anthony",
    source: "Walk-in",
  },
  {
    id: 12,
    name: "Patrick Campbell",
    phone: "4226445928",
    email: "wallacejames@gmail.com",
    status: "New",
    followUp: "07-08-2025",
    requirement: "2BHK Flat",
    remark: "Interested",
    date: "30-06-2025",
    capturedBy: "Rebecca",
    assignTo: "Karen",
    transferTo: "Scott",
    source: "Walk-in",
  },
  {
    id: 13,
    name: "Antonio Porter",
    phone: "+1-072-971-9346x236",
    email: "erobinson@robinson.com",
    status: "New",
    followUp: "25-04-2025",
    requirement: "2BHK Flat",
    remark: "Call back later",
    date: "09-07-2025",
    capturedBy: "Amanda",
    assignTo: "Rebecca",
    transferTo: "Suzanne",
    source: "Facebook Ads",
  },
  {
    id: 14,
    name: "Rebecca Stone",
    phone: "+1-805-481-4187",
    email: "brian20@smith.info",
    status: "In Progress",
    followUp: "31-03-2025",
    requirement: "2BHK Flat",
    remark: "Not interested",
    date: "10-07-2025",
    capturedBy: "Joy",
    assignTo: "Lauren",
    transferTo: "Brandon",
    source: "Referral",
  },
  {
    id: 15,
    name: "Daniel Ali",
    phone: "774.728.1540x2767",
    email: "castilloclifford@mckee.com",
    status: "Follow-up",
    followUp: "13-01-2025",
    requirement: "Villa",
    remark: "Budget issue",
    date: "01-01-2025",
    capturedBy: "Katie",
    assignTo: "Michael",
    transferTo: "Kelly",
    source: "Google Ads",
  },
  {
    id: 16,
    name: "Briana Wallace",
    phone: "900.417.9194x5211",
    email: "alexander84@nguyen-boyd.com",
    status: "Closed",
    followUp: "26-05-2025",
    requirement: "Villa",
    remark: "Budget issue",
    date: "11-08-2025",
    capturedBy: "Daniel",
    assignTo: "Stephanie",
    transferTo: "Lisa",
    source: "Referral",
  },
  {
    id: 17,
    name: "Emily Jones",
    phone: "(698)665-3686",
    email: "egriffin@gmail.com",
    status: "New",
    followUp: "07-05-2025",
    requirement: "3BHK Apartment",
    remark: "Interested",
    date: "25-03-2025",
    capturedBy: "Christopher",
    assignTo: "Dylan",
    transferTo: "Michael",
    source: "Website",
  },
  {
    id: 18,
    name: "Audrey Jones",
    phone: "(167)032-2108x12487",
    email: "bbrown@santos.biz",
    status: "Closed",
    followUp: "13-01-2025",
    requirement: "Commercial Space",
    remark: "Interested",
    date: "05-02-2025",
    capturedBy: "Rachel",
    assignTo: "Stacey",
    transferTo: "Vanessa",
    source: "Facebook Ads",
  },
  {
    id: 19,
    name: "Barbara Garrett",
    phone: "656-185-3471",
    email: "ericjones@butler.com",
    status: "Follow-up",
    followUp: "08-06-2025",
    requirement: "2BHK Flat",
    remark: "Interested",
    date: "30-03-2025",
    capturedBy: "Michael",
    assignTo: "Deanna",
    transferTo: "Andre",
    source: "Referral",
  },
  {
    id: 20,
    name: "Theresa Rice",
    phone: "001-268-017-8451x7955",
    email: "joseph10@gmail.com",
    status: "Closed",
    followUp: "23-03-2025",
    requirement: "Villa",
    remark: "Budget issue",
    date: "12-07-2025",
    capturedBy: "Heather",
    assignTo: "Laura",
    transferTo: "Terri",
    source: "Google Ads",
  },
  {
    id: 21,
    name: "David Wolf",
    phone: "(649)005-3780x7222",
    email: "valdezcharles@yahoo.com",
    status: "In Progress",
    followUp: "20-01-2025",
    requirement: "Plot",
    remark: "Call back later",
    date: "18-06-2025",
    capturedBy: "Colleen",
    assignTo: "Miguel",
    transferTo: "Daniel",
    source: "Walk-in",
  },
  {
    id: 22,
    name: "Christopher House",
    phone: "+1-353-594-7001x9354",
    email: "hturner@pennington-miller.com",
    status: "New",
    followUp: "24-05-2025",
    requirement: "2BHK Flat",
    remark: "Interested",
    date: "05-08-2025",
    capturedBy: "Todd",
    assignTo: "James",
    transferTo: "Scott",
    source: "Facebook Ads",
  },
  {
    id: 23,
    name: "Janet Acosta",
    phone: "+1-622-321-9282",
    email: "ramosleslie@knight-simmons.com",
    status: "New",
    followUp: "04-07-2025",
    requirement: "Plot",
    remark: "Budget issue",
    date: "27-07-2025",
    capturedBy: "Zachary",
    assignTo: "Tracy",
    transferTo: "Carrie",
    source: "Facebook Ads",
  },
  {
    id: 24,
    name: "Zachary Jones",
    phone: "(167)725-1793x33910",
    email: "wheelertodd@gmail.com",
    status: "In Progress",
    followUp: "23-02-2025",
    requirement: "3BHK Apartment",
    remark: "Interested",
    date: "07-05-2025",
    capturedBy: "Erin",
    assignTo: "Karen",
    transferTo: "Kim",
    source: "Walk-in",
  },
  {
    id: 25,
    name: "Aimee Nelson",
    phone: "098.849.0140",
    email: "rosalesjames@kane.com",
    status: "In Progress",
    followUp: "18-02-2025",
    requirement: "2BHK Flat",
    remark: "Interested",
    date: "16-07-2025",
    capturedBy: "Leslie",
    assignTo: "Linda",
    transferTo: "Karen",
    source: "Referral",
  },
  {
    id: 26,
    name: "James Barker",
    phone: "523.769.8101x37856",
    email: "thomas66@thompson.info",
    status: "Follow-up",
    followUp: "09-06-2025",
    requirement: "Villa",
    remark: "Call back later",
    date: "02-07-2025",
    capturedBy: "Jessica",
    assignTo: "Jennifer",
    transferTo: "Dustin",
    source: "Walk-in",
  },
  {
    id: 27,
    name: "Mitchell Scott",
    phone: "309.762.3250x31230",
    email: "dholder@gmail.com",
    status: "Closed",
    followUp: "22-03-2025",
    requirement: "2BHK Flat",
    remark: "Call back later",
    date: "29-05-2025",
    capturedBy: "Shannon",
    assignTo: "Christine",
    transferTo: "Pamela",
    source: "Website",
  },
  {
    id: 28,
    name: "Mrs. Dawn Riggs",
    phone: "(421)867-9356x564",
    email: "zgarza@gmail.com",
    status: "Closed",
    followUp: "31-03-2025",
    requirement: "Plot",
    remark: "Budget issue",
    date: "14-07-2025",
    capturedBy: "Stephanie",
    assignTo: "Michael",
    transferTo: "Willie",
    source: "Google Ads",
  },
  {
    id: 29,
    name: "Donna Park",
    phone: "1343937119",
    email: "campbellandrew@yahoo.com",
    status: "In Progress",
    followUp: "09-03-2025",
    requirement: "Plot",
    remark: "Interested",
    date: "07-06-2025",
    capturedBy: "Michael",
    assignTo: "Brian",
    transferTo: "Shannon",
    source: "Website",
  },
  {
    id: 30,
    name: "Kelly Carlson",
    phone: "001-664-192-2639x080",
    email: "leecharles@yahoo.com",
    status: "Follow-up",
    followUp: "09-06-2025",
    requirement: "Plot",
    remark: "Not interested",
    date: "01-08-2025",
    capturedBy: "Benjamin",
    assignTo: "William",
    transferTo: "Willie",
    source: "Google Ads",
  },
  {
    id: 31,
    name: "John Williamson",
    phone: "001-664-190-4164x8509",
    email: "cmolina@macdonald-ruiz.com",
    status: "Follow-up",
    followUp: "01-02-2025",
    requirement: "Commercial Space",
    remark: "Interested",
    date: "18-05-2025",
    capturedBy: "Anthony",
    assignTo: "Chad",
    transferTo: "Brandon",
    source: "Website",
  },
  {
    id: 32,
    name: "Jermaine Morales",
    phone: "(171)832-7580x92283",
    email: "xtyler@bryan.com",
    status: "Closed",
    followUp: "01-04-2025",
    requirement: "3BHK Apartment",
    remark: "Interested",
    date: "14-08-2025",
    capturedBy: "Garrett",
    assignTo: "Melissa",
    transferTo: "Amy",
    source: "Facebook Ads",
  },
  {
    id: 33,
    name: "Betty Garner",
    phone: "001-092-663-1628x530",
    email: "bpruitt@hill.com",
    status: "In Progress",
    followUp: "05-02-2025",
    requirement: "Plot",
    remark: "Interested",
    date: "13-07-2025",
    capturedBy: "Karen",
    assignTo: "Michelle",
    transferTo: "David",
    source: "Referral",
  },
  {
    id: 34,
    name: "William Olson",
    phone: "976-353-3559x568",
    email: "thompsontamara@nolan-bruce.com",
    status: "In Progress",
    followUp: "23-01-2025",
    requirement: "Plot",
    remark: "Budget issue",
    date: "23-05-2025",
    capturedBy: "Pamela",
    assignTo: "Melissa",
    transferTo: "Jerry",
    source: "Website",
  },
  {
    id: 35,
    name: "Teresa Reeves",
    phone: "+1-835-839-1076",
    email: "johnsonnathaniel@banks.com",
    status: "Closed",
    followUp: "17-07-2025",
    requirement: "3BHK Apartment",
    remark: "Call back later",
    date: "22-07-2025",
    capturedBy: "Dalton",
    assignTo: "Ashley",
    transferTo: "Brian",
    source: "Facebook Ads",
  },
  {
    id: 36,
    name: "Kevin Diaz Jr.",
    phone: "2495600300",
    email: "patriciaford@hotmail.com",
    status: "Closed",
    followUp: "01-04-2025",
    requirement: "3BHK Apartment",
    remark: "Budget issue",
    date: "07-08-2025",
    capturedBy: "Todd",
    assignTo: "Jessica",
    transferTo: "Stephanie",
    source: "Facebook Ads",
  },
  {
    id: 37,
    name: "Angel Hansen",
    phone: "+1-822-935-7668x39205",
    email: "jacqueline21@rogers.biz",
    status: "Follow-up",
    followUp: "13-01-2025",
    requirement: "Villa",
    remark: "Interested",
    date: "18-05-2025",
    capturedBy: "Benjamin",
    assignTo: "Frank",
    transferTo: "Timothy",
    source: "Referral",
  },
  {
    id: 38,
    name: "Danny Wood",
    phone: "702-001-8361",
    email: "wbowman@hotmail.com",
    status: "In Progress",
    followUp: "05-03-2025",
    requirement: "2BHK Flat",
    remark: "Interested",
    date: "28-07-2025",
    capturedBy: "Rodney",
    assignTo: "Lori",
    transferTo: "Scott",
    source: "Facebook Ads",
  },
  {
    id: 39,
    name: "Angela Cervantes",
    phone: "374.342.2057x8422",
    email: "david20@gmail.com",
    status: "New",
    followUp: "16-01-2025",
    requirement: "Villa",
    remark: "Budget issue",
    date: "25-06-2025",
    capturedBy: "Kenneth",
    assignTo: "Arthur",
    transferTo: "Jerry",
    source: "Walk-in",
  },
  {
    id: 40,
    name: "Renee Butler",
    phone: "001-018-130-5050x5765",
    email: "shannonarias@nguyen.com",
    status: "New",
    followUp: "13-02-2025",
    requirement: "Plot",
    remark: "Call back later",
    date: "20-05-2025",
    capturedBy: "Amy",
    assignTo: "Shawn",
    transferTo: "Anthony",
    source: "Walk-in",
  },
  {
    id: 41,
    name: "Christopher Wells",
    phone: "(261)245-0468x964",
    email: "abrown@franco-berry.com",
    status: "Follow-up",
    followUp: "29-07-2025",
    requirement: "3BHK Apartment",
    remark: "Budget issue",
    date: "21-02-2025",
    capturedBy: "Matthew",
    assignTo: "Jamie",
    transferTo: "Amber",
    source: "Website",
  },
  {
    id: 42,
    name: "Ralph Miranda",
    phone: "(042)165-1216x667",
    email: "melissa33@yahoo.com",
    status: "In Progress",
    followUp: "06-08-2025",
    requirement: "3BHK Apartment",
    remark: "Budget issue",
    date: "22-08-2025",
    capturedBy: "David",
    assignTo: "Christopher",
    transferTo: "Craig",
    source: "Google Ads",
  },
  {
    id: 43,
    name: "Maria Reyes",
    phone: "001-370-610-9922x088",
    email: "sandrawillis@young-hawkins.com",
    status: "In Progress",
    followUp: "19-04-2025",
    requirement: "Plot",
    remark: "Call back later",
    date: "25-08-2025",
    capturedBy: "Justin",
    assignTo: "Alexis",
    transferTo: "Taylor",
    source: "Referral",
  },
  {
    id: 44,
    name: "Amy Richardson",
    phone: "505.354.6375x31992",
    email: "hollandbetty@harvey.com",
    status: "New",
    followUp: "05-02-2025",
    requirement: "Commercial Space",
    remark: "Call back later",
    date: "28-03-2025",
    capturedBy: "Jonathan",
    assignTo: "Tina",
    transferTo: "Jessica",
    source: "Google Ads",
  },
  {
    id: 45,
    name: "Cindy Navarro",
    phone: "(155)115-3489x810",
    email: "xtaylor@gmail.com",
    status: "Closed",
    followUp: "16-03-2025",
    requirement: "3BHK Apartment",
    remark: "Budget issue",
    date: "26-05-2025",
    capturedBy: "Juan",
    assignTo: "Jeffrey",
    transferTo: "Andrew",
    source: "Referral",
  },
  {
    id: 46,
    name: "Mrs. Megan Lynch DVM",
    phone: "+1-887-022-8882",
    email: "jilljohnson@gmail.com",
    status: "In Progress",
    followUp: "03-05-2025",
    requirement: "3BHK Apartment",
    remark: "Call back later",
    date: "11-05-2025",
    capturedBy: "Deborah",
    assignTo: "John",
    transferTo: "Stephanie",
    source: "Website",
  },
  {
    id: 47,
    name: "Carl Fisher",
    phone: "(147)516-1946",
    email: "elizabethburton@gmail.com",
    status: "New",
    followUp: "04-01-2025",
    requirement: "Commercial Space",
    remark: "Call back later",
    date: "30-01-2025",
    capturedBy: "Meghan",
    assignTo: "Joshua",
    transferTo: "Robin",
    source: "Facebook Ads",
  },
  {
    id: 48,
    name: "Benjamin Rodriguez",
    phone: "(865)591-8670",
    email: "robertmckee@tran-brown.com",
    status: "Closed",
    followUp: "16-04-2025",
    requirement: "Plot",
    remark: "Call back later",
    date: "30-04-2025",
    capturedBy: "Rebekah",
    assignTo: "Daniel",
    transferTo: "Brooke",
    source: "Website",
  },
  {
    id: 49,
    name: "Mary Lee",
    phone: "043-977-0616",
    email: "jeffrey77@cordova.org",
    status: "Follow-up",
    followUp: "17-01-2025",
    requirement: "Villa",
    remark: "Budget issue",
    date: "20-05-2025",
    capturedBy: "Henry",
    assignTo: "Victor",
    transferTo: "Melanie",
    source: "Facebook Ads",
  },
  {
    id: 50,
    name: "Charlene Alvarez",
    phone: "866-491-3510",
    email: "lbrown@gmail.com",
    status: "Closed",
    followUp: "08-02-2025",
    requirement: "3BHK Apartment",
    remark: "Call back later",
    date: "27-06-2025",
    capturedBy: "Michael",
    assignTo: "Brent",
    transferTo: "Karen",
    source: "Facebook Ads",
  },
];

const rentalData = [
  {
    id: 1,
    name: "Sanjay Kumar",
    phone: "7896541230",
    email: "sanjay@example.com",
    rent: "₹15,000",
    requirement: "2BHK",
    location: "Gurgaon",
    source: "Website",
    agent: "Rahul",
    status: "Hot",
    date: "2025-08-26",
  },
  {
    id: 2,
    name: "Neha Kapoor",
    phone: "8765432109",
    email: "neha@example.com",
    rent: "₹20,000",
    requirement: "3BHK",
    location: "Noida",
    source: "Referral",
    agent: "Ankit",
    status: "Warm",
    date: "2025-08-25",
  },
];

const LeadTable = () => {
  const statusClasses = {
    Hot: "text-red-600 bg-red-50 border-red-200",
    "Not Connected": "text-gray-600 bg-gray-50 border-gray-200",
    Serious: "text-green-600 bg-green-50 border-green-200",
    Potential: "text-blue-600 bg-blue-50 border-blue-200",
    Futuristic: "text-pink-600 bg-pink-50 border-pink-200",
    "Dead Lead": "text-amber-700 bg-amber-50 border-amber-200",
    New: "text-indigo-600 bg-indigo-50 border-indigo-200",
    "In Progress": "text-yellow-700 bg-yellow-50 border-yellow-200",
    "Follow-up": "text-purple-600 bg-purple-50 border-purple-200",
    Closed: "text-green-700 bg-green-50 border-green-200",
  };

  const [activeTab, setActiveTab] = useState("buyers");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8; // ✅ You can change this to 10 or make it dynamic later

  const data = activeTab === "buyers" ? buyersData : rentalData;

  // ✅ Calculate pagination values
  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = data.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="">
      {/* Toggle Buttons */}

      <div className="flex justify-between items-center ">
        <h2 className="font-semibold text-2xl">All Leads</h2>
        <div className="flex gap-3">
          
          <button className="rounded bg-[#5169F3] text-white px-3 py-1 text-sm hover:bg-cyan-700 flex items-center gap-1">
            Add Bulk Lead{" "}
            <span>
              <FilePlus2 size={14} />
            </span>
          </button>
          <button className="rounded border border-cyan-600 bg-[#5169F3] text-white px-3 py-1 text-sm hover:bg-cyan-600 hover:text-white flex items-center gap-1">
            Add Lead{" "}
            <span>
              <FilePlus2 size={14} />
            </span>
          </button>
        </div>
      </div>
      <div className="flex flex-row justify-between items-center">
        <div className="relative flex bg-white rounded-full p-1  w-72  mt-6 ">
          {/* Background Slider */}
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute top-1 bottom-1 w-[calc(50%-0.25rem)] rounded-full bg-[#000D55]"
            style={{
              left: activeTab === "buyers" ? "0.25rem" : "calc(50% + 0.1rem)",
            }}
          />

          {/* Buyers Tab */}
          <button
            onClick={() => setActiveTab("buyers")}
            className={`relative z-10 flex-1 text-center py-2 font-medium rounded-full ${
              activeTab === "buyers" ? "text-white" : "text-gray-700"
            }`}
          >
            All Buyers
          </button>

          {/* Rental Tab */}
          <button
            onClick={() => setActiveTab("rental")}
            className={`relative z-10 flex-1 text-center py-2 font-medium rounded-full ${
              activeTab === "rental" ? "text-white" : "text-gray-700"
            }`}
          >
            Rental Business
          </button>
        </div>
        <div className="flex flex-row gap-3 text-sm text-gray-600 items-center justify-center">
          <button className="flex items-center gap-1 hover:text-cyan-600 transition">
            View All <ChevronDown size={16} />
          </button>
          <button className="flex items-center gap-1 hover:text-cyan-600 transition">
            Filter <ListFilter size={16}/>
          </button>
        </div>
      </div>
      {/* Table Container */}
      <div className="overflow-x-auto border rounded-lg scrollbar-hidden mt-4">
        <table className="border-collapse min-w-full text-sm">
          <thead className="bg-[#FAFBFC]">
            <tr>
              <th className="text-[#656972] px-[1rem] py-[1.25rem] text-sm text-left">
                <input type="checkbox" />
              </th>
              <th className="text-[#656972] px-[1rem] py-[1.25rem] text-sm text-left min-w-[12rem]">
                Customer Name
              </th>
              <th className="text-[#656972] px-[1rem] py-[1.25rem] text-sm text-left min-w-[12rem]">
                Contact Number
              </th>
              <th className="text-[#656972] px-[1rem] py-[1.25rem] text-sm text-left min-w-[16rem]">
                Email
              </th>
              <th className="text-[#656972] px-[1rem] py-[1.25rem] text-sm text-center min-w-[10rem]">
                Status
              </th>
              <th className="text-[#656972] px-[1rem] py-[1.25rem] text-sm text-left min-w-[8rem]">
                Follow-up
              </th>
              <th className="text-[#656972] px-[1rem] py-[1.25rem] text-sm text-left min-w-[12rem]">
                Requirement
              </th>
              <th className="text-[#656972] px-[1rem] py-[1.25rem] text-sm text-left min-w-[10rem]">
                Remark
              </th>
              <th className="text-[#656972] px-[1rem] py-[1.25rem] text-sm text-left min-w-[9rem]">
                Date
              </th>
              <th className="text-[#656972] px-[1rem] py-[1.25rem] text-sm text-left min-w-[9rem]">
                Captured By
              </th>
              <th className="text-[#656972] px-[1rem] py-[1.25rem] text-sm text-left min-w-[9rem]">
                Assign To
              </th>
              <th className="text-[#656972] px-[1rem] py-[1.25rem] text-sm text-left min-w-[9rem]">
                Transfer To
              </th>
              <th className="text-[#656972] px-[1rem] py-[1.25rem] text-sm text-left min-w-[8rem]">
                Source
              </th>
              <th className="text-[#656972] px-[1rem] py-[1.25rem] text-sm text-left min-w-[7rem]">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item) => (
              <tr key={item.id} className="border-t hover:bg-gray-50 bg-white">
                <td className="px-[1rem] py-[0.75rem]">
                  <input type="checkbox" />
                </td>
                <td className="px-[1rem] py-[0.75rem] text-sm font-medium">
                  {item.name}
                </td>
                <td className="text-sm px-[1rem] py-[0.75rem]">{item.phone}</td>
                <td className="text-sm px-[1rem] py-[0.75rem]">{item.email}</td>
                <td className="px-[1rem] py-[0.75rem]">
                  <div
                    className={`border rounded-full px-3 py-1 text-sm font-medium text-center ${
                      statusClasses[item.status] ||
                      "text-gray-600 bg-gray-50 border-gray-200"
                    }`}
                  >
                    {item.status}
                  </div>
                </td>
                <td className="text-sm px-[1rem] py-[0.75rem]">
                  {item.followUp}
                </td>
                <td className="text-sm px-[1rem] py-[0.75rem]">
                  {item.requirement}
                </td>
                <td className="text-sm px-[1rem] py-[0.75rem]">
                  {item.remark}
                </td>
                <td className="text-sm px-[1rem] py-[0.75rem]">{item.date}</td>
                <td className="text-sm px-[1rem] py-[0.75rem]">
                  {item.capturedBy}
                </td>
                <td className="text-sm px-[1rem] py-[0.75rem]">
                  {item.assignTo}
                </td>
                <td className="text-sm px-[1rem] py-[0.75rem]">
                  {item.transferTo}
                </td>
                <td className="text-sm px-[1rem] py-[0.75rem]">
                  {item.source}
                </td>
                <td className="text-sm px-[1rem] py-[0.75rem] flex gap-2">
                  <button className="text-[#00E029] hover:underline">
                    <Pencil size={16} />
                  </button>
                  <button className="text-red-500">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ Pagination Component */}
      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default LeadTable;
