import React, { useState, useMemo } from 'react';
import { ToggleSwitch } from '../../components/ui';
import { useLeads } from '../../hooks/useLeads';
import { useInventory } from '../../hooks/useInventory';
import { ScrollableLeads } from '../../components/dashboard';
import { InventoryTable } from '../../components/tables';

const FindOpportunity = () => {
  // State for toggle switches
  const [primaryFilter, setPrimaryFilter] = useState('Leads');
  const [secondaryFilter, setSecondaryFilter] = useState('AllBuyers');

  // API hooks
  const { data: leadsData = [], isLoading: leadsLoading, error: leadsError } = useLeads();
  const { data: inventoryData = [], isLoading: inventoryLoading, error: inventoryError } = useInventory();

  // Normalize leads data
  const leads = useMemo(() => {
    if (Array.isArray(leadsData)) return leadsData;
    if (leadsData && Array.isArray(leadsData.data)) return leadsData.data;
    return [];
  }, [leadsData]);

  // Primary toggle options
  const primaryOptions = [
    { value: 'Leads', label: 'Leads' },
    { value: 'Inventory', label: 'Inventory' }
  ];

  // Secondary toggle options based on primary selection
  const getSecondaryOptions = () => {
    if (primaryFilter === 'Leads') {
      return [
        { value: 'AllBuyers', label: 'All Buyers' },
        { value: 'RentalBusiness', label: 'Rental Business' }
      ];
    } else {
      return [
        { value: 'Sale', label: 'Sale' },
        { value: 'Rent', label: 'Rent' }
      ];
    }
  };

  // Handle primary filter change
  const handlePrimaryFilterChange = (value) => {
    setPrimaryFilter(value);
    // Reset secondary filter based on new primary selection
    if (value === 'Leads') {
      setSecondaryFilter('AllBuyers');
    } else {
      setSecondaryFilter('Sale');
    }
  };

  // Filter data based on selections and only show unassigned items
  const filteredData = useMemo(() => {
    // Helper function to check if a record is unassigned
    const isUnassigned = (record) => {
      if (!record.assignTo) return true;
      // If assignTo is an object, check if it has a name property
      if (typeof record.assignTo === 'object') {
        return !record.assignTo.name || record.assignTo.name.trim() === '';
      }
      // If assignTo is a string, check if it's empty
      if (typeof record.assignTo === 'string') {
        return record.assignTo.trim() === '';
      }
      return false;
    };

    if (primaryFilter === 'Leads') {
      const isDead = (lead) => 
        typeof lead?.status === "string" && /dead/i.test(lead.status);
      
      if (secondaryFilter === 'AllBuyers') {
        return leads.filter((lead) => 
          lead?.leadType === "Buyer" && 
          !isDead(lead) && 
          isUnassigned(lead)
        );
      } else if (secondaryFilter === 'RentalBusiness') {
        return leads.filter((lead) => 
          lead?.leadType === "Rental" && 
          !isDead(lead) && 
          isUnassigned(lead)
        );
      }
    } else if (primaryFilter === 'Inventory') {
      if (secondaryFilter === 'Sale') {
        return inventoryData.filter((item) => 
          item.inventoryType === 'Sales' && 
          isUnassigned(item)
        );
      } else if (secondaryFilter === 'Rent') {
        return inventoryData.filter((item) => 
          item.inventoryType === 'Rent' && 
          isUnassigned(item)
        );
      }
    }
    return [];
  }, [primaryFilter, secondaryFilter, leads, inventoryData]);

  // Loading and error states
  const isLoading = leadsLoading || inventoryLoading;
  const hasError = leadsError || inventoryError;

  if (isLoading) {
    return (
      <div className="">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500 animate-pulse">Loading opportunities...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="">
        <div className="text-center text-red-600 font-medium">
          Failed to load data. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="">
      {/* Header */}
      <div className="mb-6">
        <h1 className="pageheading mb-4">Find Opportunity</h1>
      </div>

      {/* Toggle Switches */}
      <div className="flex flex-col sm:flex-row gap-6 mb-6">
        {/* Primary Toggle */}
        <div className="flex flex-col space-y-2">
          <ToggleSwitch
            value={primaryFilter}
            options={primaryOptions}
            onChange={handlePrimaryFilterChange}
            size="md"
          />
        </div>

        {/* Secondary Toggle */}
        <div className="flex flex-col space-y-2">
          <ToggleSwitch
            value={secondaryFilter}
            options={getSecondaryOptions()}
            onChange={setSecondaryFilter}
            size="md"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="">
        {primaryFilter === 'Leads' ? (
          filteredData.length > 0 ? (
            <ScrollableLeads data={filteredData} hideSearch={true} />
          ) : (
            <div className="text-center py-10 text-gray-500">
              No {secondaryFilter === 'AllBuyers' ? 'buyer' : 'rental'} leads found.
            </div>
          )
        ) : (
          filteredData.length > 0 ? (
            <InventoryTable data={filteredData} hideSearch={true} />
          ) : (
            <div className="text-center py-10 text-gray-500">
              No {secondaryFilter.toLowerCase()} inventory found.
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default FindOpportunity;