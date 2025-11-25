import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ToggleSwitch } from '../../components/ui';
import { useUnassignedLeads } from '../../hooks/useUnassignedLeads';
import { useInventory } from '../../hooks/useInventory';
import { ScrollableLeads } from '../../components/dashboard';
import { InventoryTable } from '../../components/tables';

const FindOpportunity = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // State for toggle switches
  const [primaryFilter, setPrimaryFilter] = useState('Leads');
  const [secondaryFilter, setSecondaryFilter] = useState('AllBuyers');
  const [statusFilter, setStatusFilter] = useState('');

  // Handle navigation state for pre-selecting tab and filter
  useEffect(() => {
    if (location.state?.selectedTab) {
      const tab = location.state.selectedTab;
      if (tab === 'All Buyers') {
        setPrimaryFilter('Leads');
        setSecondaryFilter('AllBuyers');
      } else if (tab === 'Rental Business') {
        setPrimaryFilter('Leads');
        setSecondaryFilter('RentalBusiness');
      }
      // Clear the state after using it
      navigate(location.pathname, { replace: true, state: {} });
    }
    if (location.state?.filterKey) {
      setStatusFilter(location.state.filterKey);
      // Clear the state after using it
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state?.selectedTab, location.state?.filterKey, navigate]);

  // API hooks
  // useUnassignedLeads returns the API that already filters unassigned leads
  const { data: leadsDataRaw = [], isLoading: leadsLoading, error: leadsError } = useUnassignedLeads();
  const { data: inventoryData = [], isLoading: inventoryLoading, error: inventoryError } = useInventory();

  // Normalize leads data returned by /realtleads/unassigned
  const leads = useMemo(() => {
    if (Array.isArray(leadsDataRaw)) return leadsDataRaw;
    if (leadsDataRaw && Array.isArray(leadsDataRaw.data)) return leadsDataRaw.data;
    // some API responses wrap the list in .data or .docs
    if (leadsDataRaw && Array.isArray(leadsDataRaw.docs)) return leadsDataRaw.docs;
    return [];
  }, [leadsDataRaw]);

  // Normalize inventory data (defensive)
  const inventory = useMemo(() => {
    if (Array.isArray(inventoryData)) return inventoryData;
    if (inventoryData && Array.isArray(inventoryData.data)) return inventoryData.data;
    if (inventoryData && Array.isArray(inventoryData.docs)) return inventoryData.docs;
    return [];
  }, [inventoryData]);

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
    // API already returns unassigned leads for leads side.
    // For inventory filtering we still need an isUnassigned helper.
    const isUnassigned = (record) => {
      if (!record) return true;
      if (!record.assignTo) return true;
      if (typeof record.assignTo === 'object') {
        return !record.assignTo.name || record.assignTo.name.trim() === '';
      }
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
          !isDead(lead)
        );
      } else if (secondaryFilter === 'RentalBusiness') {
        return leads.filter((lead) => 
          lead?.leadType === "Rental" && 
          !isDead(lead)
        );
      }
    } else if (primaryFilter === 'Inventory') {
      if (secondaryFilter === 'Sale') {
        return inventory.filter((item) => 
          item.inventoryType === 'Sales' && 
          isUnassigned(item)
        );
      } else if (secondaryFilter === 'Rent') {
        return inventory.filter((item) => 
          item.inventoryType === 'Rent' && 
          isUnassigned(item)
        );
      }
    }
    return [];
  }, [primaryFilter, secondaryFilter, leads, inventory]);

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
            <ScrollableLeads 
              data={filteredData} 
              hideSearch={true}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
            />
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