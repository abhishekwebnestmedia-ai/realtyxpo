import React from "react";
import TodaysTask from "../../components/TodaysTask";
import {Filter, Download, ExternalLink, } from "lucide-react";

const DailyPlan = () => {
  return (
    <div>
           <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-2xl cursor-pointer">Today's Task</h2>
                <div className="flex gap-4 text-sm text-gray-600">
               
                  <button className="flex items-center gap-1 hover:text-cyan-600">
                    Filter <Filter size={16} />
                  </button>
                  <button className="flex items-center gap-1 hover:text-cyan-600">
                    Download PDF <Download size={16} />
                  </button>
                </div>
              </div>
        
      <TodaysTask rowsPerPage={6} showPagination={true} />
    </div>
  );
};

export default DailyPlan;
