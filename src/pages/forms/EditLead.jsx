import React, { useState, useEffect, useContext } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { AuthContext } from '../../context/AuthContext'
import { useUsers } from '../../hooks/useBroadcast'
import api from '../../api/api'

const EditLead = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useContext(AuthContext);
  const { users, fetchUsers } = useUsers();

  const [form, setForm] = useState({
    customerName: '',
    contactNumber: '',
    email: '',
    status: '',
    leadType: '',
    followUp: '',
    requirement: '',
    remark: '',
    date: '',
    capturedBy: '',
    assignTo: '',
    transferTo: '',
    source: '',
    Budget: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Fetch users when component mounts
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    // if lead was passed via navigate state, use it
    if (location.state?.lead) {
      const lead = location.state.lead
      setForm((prev) => ({
        ...prev,
        customerName: lead.customerName ?? lead.name ?? '',
        contactNumber: lead.contactNumber ?? lead.contactNo ?? lead.contactNumber ?? '',
        email: lead.email ?? '',
        status: lead.status ?? '',
        leadType: lead.leadType ?? '',
        followUp: lead.followUp ?? lead.followUpDate ?? '',
        requirement: lead.requirement ?? '',
        remark: lead.remark ?? lead.Remark ?? '',
        date: lead.date ?? '',
        capturedBy: typeof lead.capturedBy === 'string' ? lead.capturedBy : lead.capturedBy?.name ?? '',
        assignTo: typeof lead.assignTo === 'string' ? lead.assignTo : lead.assignTo?.name ?? '',
        transferTo: typeof lead.transferTo === 'string' ? lead.transferTo : lead.transferTo?.name ?? '',
        source: lead.source ?? '',
        Budget: lead.Budget ?? lead.budget ?? ''
      }))
      return
    }

    if (!id) return
    setLoading(true)
    setError(null)
    api.get(`/realtleads/getlead/${id}`)
      .then((res) => {
        // API may return { data: {...} } or object directly
        const payload = res?.data ?? res
        const lead = payload?.data ?? payload
        setForm((prev) => ({
          ...prev,
          customerName: lead.customerName ?? lead.name ?? '',
          contactNumber: lead.contactNumber ?? lead.contactNo ?? '',
          email: lead.email ?? '',
          status: lead.status ?? '',
          leadType: lead.leadType ?? '',
          followUp: lead.followUp ?? lead.followUpDate ?? '',
          requirement: lead.requirement ?? '',
          remark: lead.remark ?? lead.Remark ?? '',
          date: lead.date ?? '',
          capturedBy: typeof lead.capturedBy === 'string' ? lead.capturedBy : lead.capturedBy?.name ?? '',
          assignTo: typeof lead.assignTo === 'string' ? lead.assignTo : lead.assignTo?.name ?? '',
          transferTo: typeof lead.transferTo === 'string' ? lead.transferTo : lead.transferTo?.name ?? '',
          source: lead.source ?? '',
          Budget: lead.Budget ?? lead.budget ?? ''
        }))
      })
      .catch((err) => {
        console.error('Fetch lead error', err)
        setError('Failed to load lead')
      })
      .finally(() => setLoading(false))
  }, [id, location.state])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleUpdate = async () => {
    if (!id) {
      alert('No lead ID found')
      return
    }

    setLoading(true)
    try {
      // Helper to resolve a value (id/name/email) to a display name using the users pool
      const resolveToName = (val) => {
        if (!val) return ''
        if (typeof val === 'string') {
          const trimmed = val.trim()
          if (trimmed === '') return ''
          // Try to find a matching user by several common keys
          const found = (users || []).find(u =>
            u._id === trimmed || u.id === trimmed || u.name === trimmed || u.username === trimmed || u.email === trimmed
          )
          return found?.name || found?.username || trimmed
        }
        if (typeof val === 'object') return val.name || val.username || ''
        return String(val)
      }

      const assignToName = resolveToName(form.assignTo)
      const transferToName = resolveToName(form.transferTo)

      const payload = {
        status: form.status,
        leadType: form.leadType,
        remark: form.remark,
        assignTo: assignToName, // send name instead of id
        transferTo: transferToName || undefined, // include if present
        contactNumber: form.contactNumber, // Include other editable fields
        email: form.email,
        requirement: form.requirement,
        followUp: form.followUp,
        Budget: form.Budget
      }

      // Log final payload for quick debug (visible in browser console)
      console.log('EditLead: Update payload (final):', payload)
      console.log('EditLead: Current form state:', form)

      const response = await api.put(`/realtleads/update/${id}`, payload)
      console.log('EditLead: Update response:', response.data)

      // Invalidate and refetch leads cache to reflect changes immediately
      queryClient.invalidateQueries({ queryKey: ['leads'] })

      alert('Lead updated successfully!')
      navigate('/all-leads')
    } catch (error) {
      console.error('EditLead: Update failed:', error)
      console.error('EditLead: Error details:', error.response?.data)
      alert('Failed to update lead. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 bg-white rounded-2xl">
      <h2 className='text-2xl font-medium'>Edit Lead</h2>

      {loading ? (
        <p className='p-4'>Loading lead...</p>
      ) : error ? (
        <p className='p-4 text-red-500'>{error}</p>
      ) : (
        <form className='mt-5'>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="customerName" className="block mb-1 font-medium">Customer Name</label>
              <input name="customerName" value={form.customerName} onChange={handleChange} type="text" id="customerName" className="w-full border border-gray-300 bg-[#FAFBFC] rounded px-3 py-2"    readOnly disabled />
            </div>
            <div>
              <label htmlFor="contactNumber" className='block mb-1 font-medium'>Contact No.</label>
              <input name="contactNumber" value={form.contactNumber} onChange={handleChange} type="text" id='contactNumber' className='w-full border border-gray-300 bg-[#FAFBFC] rounded px-3 py-2' />
            </div>
            <div>
              <label htmlFor="email" className='block mb-1 font-medium'>Enter Email</label>
              <input name="email" value={form.email} onChange={handleChange} type="email" id='email' className='w-full border border-gray-300  bg-[#FAFBFC] rounded px-3 py-2' />
            </div>
            <div>
              <label htmlFor="status" className='block mb-1 font-medium'>Status</label>
              <select name="status" value={form.status} onChange={handleChange} id="status" className='w-full border border-gray-300  bg-[#FAFBFC] rounded px-3 py-2'>
                <option value="Hot">Hot</option>
                <option value="Not connected">Not connected</option>
                <option value="Serious">Serious</option>
                <option value="Potential">Potential</option>
                <option value="Futuristic">Futuristic</option>
                <option value="Dead Lead">Dead Lead</option>
              </select>
            </div>
            <div>
              <label htmlFor="leadType" className='block mb-1 font-medium'>Lead Type</label>
              <select name="leadType" value={form.leadType} onChange={handleChange} id="leadType" className='w-full border border-gray-300  bg-[#FAFBFC] rounded px-3 py-2'>
                <option value="">Select Lead Type</option>
                <option value="Rental">Rental</option>
                <option value="Sale">Sale</option>
                <option value="Buyer">Buyer</option>
              </select>
            </div>
            <div>
              <label htmlFor="followUp" className='block mb-1 font-medium'>Follow-up Date</label>
              <input name="followUp" value={form.followUp} onChange={handleChange} type="date" id='followUp' className='w-full border border-gray-300  bg-[#FAFBFC] rounded px-3 py-2' />
            </div>
            <div>
              <label htmlFor="capturedBy" className='block mb-1 font-medium'>Captured by</label>
              <input name="capturedBy" value={form.capturedBy} onChange={handleChange} type="text" id='capturedBy' className='w-full border border-gray-300 bg-[#FAFBFC] rounded px-3 py-2' />
            </div>
            <div>
              <label htmlFor="assignTo" className='block mb-1 font-medium'>Assign to</label>
              <select name="assignTo" value={form.assignTo} onChange={handleChange} id='assignTo' className='w-full border border-gray-300 bg-[#FAFBFC] rounded px-3 py-2'>
                <option value="">Select User</option>
                {user?.role === 'admin' ? (
                  // Admin sees all users
                  users?.map((userItem) => (
                    <option key={userItem._id || userItem.id} value={userItem.name || userItem.username}>
                      {userItem.name || userItem.username}
                    </option>
                  ))
                ) : (
                  // Regular user sees only their own name
                  <option value={user?.name || user?.username}>
                    {user?.name || user?.username}
                  </option>
                )}
              </select>
            </div>
            <div>
              <label htmlFor="transferTo" className='block mb-1 font-medium'>Transfer To</label>
              <select name="transferTo" value={form.transferTo} onChange={handleChange} id='transferTo' className='w-full border border-gray-300 bg-[#FAFBFC] rounded px-3 py-2'>
                <option value="">Select User</option>
                {user?.role === 'admin' ? (
                  users?.map((userItem) => (
                    <option key={userItem._id || userItem.id} value={userItem.name || userItem.username}>
                      {userItem.name || userItem.username}
                    </option>
                  ))
                ) : (
                  <option value={user?.name || user?.username}>
                    {user?.name || user?.username}
                  </option>
                )}
              </select>
            </div>
            <div>
              <label htmlFor="source" className='block mb-1 font-medium' >Enter source</label>
              <input name="source" value={form.source} onChange={handleChange} type="text" id='source' className='w-full border border-gray-300  bg-[#FAFBFC] rounded px-3 py-2' readOnly disabled/>
            </div>
            <div className="">
              <label htmlFor="requirement" className='block mb-1 font-medium'>Requirement</label>
              <textarea name="requirement" value={form.requirement} onChange={handleChange} id='requirement' className='w-full border border-gray-300  bg-[#FAFBFC] rounded px-3 py-2' rows={6} />
            </div>
            <div className="">
              <label htmlFor="remark" className='block mb-1 font-medium'>Enter Remark</label>
              <textarea name="remark" value={form.remark} onChange={handleChange} id="remark" placeholder='Enter Remark' className='w-full border bg-[#FAFBFC]  border-gray-300 rounded px-3 py-2' rows={6}></textarea>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button type="button" onClick={() => navigate(-1)} className="btn px-4 py-2">Cancel</button>
            <button type="button" onClick={handleUpdate} disabled={loading} className="btn px-4 py-2">
              {loading ? 'Updating...' : 'Done'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default EditLead;
