import React from "react";
import { TodaysTask } from "../../components/dashboard";
import {Filter, Download, ExternalLink, } from "lucide-react";

const DailyPlan = () => {
  return (
    <div>
         
        
      <TodaysTask isDashboard={false} />
    </div>
  );
};

export default DailyPlan;
