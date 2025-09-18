import React from 'react'

const EditLead = () => {
  return (
    <div>
      <h2 className='text-2xl font-medium'>Edit Lead</h2>
        <form action="" className='mt-5'>
            <div className="grid grid-cols-2 gap-4">
                <div className="">
                    <label htmlFor="customername" className="block mb-1 font-medium">Customer Name</label>
                    <input type="text" id="customername" className="w-full border border-gray-300 bg-[#FAFBFC] rounded px-3 py-2" />
                </div>
                <div className="">
                    <label htmlFor="contactno" className='block mb-1 font-medium'>Contact No.</label>
                    <input type="text" id='contactno' className='w-full border border-gray-300 bg-[#FAFBFC] rounded px-3 py-2' />
                </div>
                <div className="">
                    <label htmlFor="email" className='block mb-1 font-medium'>Enter Email</label>
                    <input type="text" id='contactno' className='w-full border border-gray-300  bg-[#FAFBFC] rounded px-3 py-2' />
                </div>
                <div className="">
                    <label htmlFor="status" className='block mb-1 font-medium'>Status</label>
                    <select name="status" id="status" className='w-full border border-gray-300  bg-[#FAFBFC] rounded px-3 py-2'>
                        <option value="Hot">Hot</option>
                        <option value="Not connected">Not connected</option>
                        <option value="Serious">Serious</option>
                        <option value="Potential">Potential</option>
                        <option value="Futuristic">Futuristic</option>
                        <option value="Dead Lead">Dead Lead</option>
                    </select>
                </div>
                <div className="">
                    <label htmlFor="followupdate" className='block mb-1 font-medium'>Follow-up Date</label>
                    <input type="date" id='followupdate' className='w-full border border-gray-300  bg-[#FAFBFC] rounded px-3 py-2' />
                </div>
                <div className="">
                    <label htmlFor="capturedby" className='block mb-1 font-medium'>Captured by</label>
                    <input type="text" id='capturedby' className='w-full border border-gray-300  bg-[#FAFBFC] rounded px-3 py-2' />
                </div>
                <div className="">
                    <label htmlFor="assignto" className='block mb-1 font-medium'>Assign to</label>
                    <input type="text" id='assignto' className='w-full border border-gray-300  bg-[#FAFBFC] rounded px-3 py-2' />
                </div>
                <div className="">
                    <label htmlFor="source" className='block mb-1 font-medium' >Enter source</label>
                    <input type="text" id='source' className='w-full border border-gray-300  bg-[#FAFBFC] rounded px-3 py-2'/>
                </div>
                <div className="">
                    <label htmlFor="requirement" className='block mb-1 font-medium'>Requirement</label>
                    <textarea type="text" id='requirement' className='w-full border border-gray-300  bg-[#FAFBFC] rounded px-3 py-2' rows={6} />
                </div>
                <div className="flex flex-col w-full ">
                    <label htmlFor="remark" className='block mb-1 font-medium'>Enter Remark</label>
                    <textarea name="remark" id="remark" placeholder='Enter Remark' className='w-full border bg-[#FAFBFC]  border-gray-300 rounded px-3 py-2' rows={6}></textarea>
                </div>
            </div>
        </form>
    </div>
  )
}

export default EditLead;
