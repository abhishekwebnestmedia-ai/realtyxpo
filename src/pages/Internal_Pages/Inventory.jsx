import React from 'react'
import InventoryTable from '../../components/InventoryTable'
import { FilePlus2 } from 'lucide-react'
const Inventory = () => {
  return (
    <div className='h-full'>
        <div className="flex items-center justify-between ">
        <h2 className="text-2xl font-semibold">Inventory</h2>
        <div className="flex gap-3">
          
          <button className="flex items-center gap-1 btn">
            Add Bulk Lead{" "}
            <span>
              <FilePlus2 size={14} />
            </span>
          </button>
          <button className="flex items-center gap-1 btn">
            Add Lead{" "}
            <span>
              <FilePlus2 size={14} />
            </span>
          </button>
        </div>
        </div>
        <div className="">
          <InventoryTable></InventoryTable>
        </div>
    </div>
  )
}

export default Inventory