import React, { useContext } from 'react';
import { Edit2, User, IdCardIcon, Fingerprint, Mail, Smartphone, Activity, AlertTriangle, CheckCircle, Star, XCircle } from 'lucide-react';
import AsyncApexChart from '../../components/ui/AsyncApexChart';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const ViewProfile = ({ profileUser = null, customHeading = null, showEditButton = true, showDeleteButton = false, onDelete = null, deleting = false }) => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const displayUser = React.useMemo(() => (profileUser || user || {}), [profileUser, user]);

  const displayValue = (value, fallback = 'NA') => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'string' && value.trim() === '') return fallback;
    return value;
  };

  const getImageUrl = (imagePath) => {
    let path = imagePath;
    if (!path) path = displayUser?.profileImage || displayUser?.profilePicture || displayUser?.avatar || displayUser?.profilePhoto;
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `https://backend.realtyxpo.in${path}`;
  };

  const profileSrc = getImageUrl();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(w => w.charAt(0)).join('').toUpperCase().slice(0,2);
  };

  // Safe stats extraction from profile
  const rawStats = React.useMemo(() => displayUser?.stats || {}, [displayUser]);
  // keep all cards open by default; allow multiple expanded
  const [expandedCards, setExpandedCards] = React.useState({ active: true, unresponsive: true, closed: true });
  const stats = {
    totalCaptured: rawStats.totalCaptured ?? rawStats.totalLeadCount ?? 0,
    totalAssigned: rawStats.totalAssigned ?? 0,
    totalBuyerLeads: rawStats.totalBuyerLeads ?? 0,
    totalRentalLeads: rawStats.totalRentalLeads ?? 0,
    totalLeadCount: rawStats.totalLeadCount ?? rawStats.totalCaptured ?? 0,
    totalBuyerInventory: rawStats.totalBuyerInventory ?? 0,
    totalRentInventory: rawStats.totalRentInventory ?? 0,
    totalInventory: rawStats.totalInventory ?? ((rawStats.totalBuyerInventory ?? 0) + (rawStats.totalRentInventory ?? 0))
  };

  const pct = (v, t) => (t > 0 ? Math.round((v / t) * 100) : 0);

  return (
    <div className="min-h-screen">
      <div className="py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-medium text-gray-900">{customHeading || 'Profile'}</h1>
          </div>
          <div className="flex items-center gap-3">
            {showEditButton && (
              <button
                onClick={() => navigate('/profile/edit')}
                className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit2 size={16} />
                <span className="text-sm font-medium">Edit</span>
              </button>
            )}
            {showDeleteButton && (
              <button
                onClick={onDelete}
                disabled={deleting}
                className="flex items-center space-x-2 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                <span className="text-sm font-medium">{deleting ? 'Deleting...' : 'Delete'}</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="rounded-xl p-6 bg-white sticky top-0">
              <div className="text-center mb-4">
                {profileSrc ? (
                  <img src={profileSrc} alt="Profile" className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-gray-200" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center mx-auto mb-4 border-4 border-gray-200">
                    <span className="text-2xl font-bold text-white">{getInitials(displayUser?.name)}</span>
                  </div>
                )}
                <h2 className="text-lg font-semibold text-gray-900">{displayValue(displayUser?.name)}</h2>
                <p className="text-sm text-gray-600 mt-1">{displayValue(displayUser?.designation || displayUser?.role)}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#334DE5] rounded-lg flex items-center justify-center">
                    <User size={18} color='white' />
                  </div>
                  <div>
                    <p className="text-base text-gray-500">{displayValue(displayUser?.name)}</p>
                    <p className="text-sm text-gray-900">Name</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#334DE5] rounded-lg flex items-center justify-center">
                    <IdCardIcon size={18} color='white' />
                  </div>
                  <div>
                    <p className="text-base text-gray-500">{displayValue(displayUser?.designation || displayUser?.role)}</p>
                    <p className="text-sm font-medium text-gray-900">Designation</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#334DE5] rounded-lg flex items-center justify-center">
                    <Fingerprint size={18} color='white' />
                  </div>
                  <div>
                    <p className="text-base text-gray-500">{displayValue(displayUser?.empid || displayUser?.employeeId)}</p>
                    <p className="text-sm font-medium text-gray-900">Employee ID</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#334DE5] rounded-lg flex items-center justify-center">
                    <Mail size={18} color='white' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p className="text-base text-gray-500 truncate">{displayValue(displayUser?.email)}</p>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#334DE5] rounded-lg flex items-center justify-center">
                    <Smartphone size={18} color='white' />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{displayValue(displayUser?.phoneNumber || displayUser?.phone)}</p>
                    <p className="text-sm font-medium text-gray-900">Phone No.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl">
                <p className="text-sm text-gray-500">Total Leads</p>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-2xl font-semibold text-gray-900">{stats.totalLeadCount}</h3>
                  <p className="text-sm text-gray-500">Captured: {stats.totalCaptured}</p>
                </div>
                <div className="mt-3">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${pct(stats.totalCaptured, Math.max(1, stats.totalLeadCount))}%` }} />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl">
                <p className="text-sm text-gray-500">Leads Breakdown</p>
                <h3 className="text-2xl font-semibold text-gray-900">{stats.totalBuyerLeads + stats.totalRentalLeads}</h3>
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600"><span>Buyer</span><span>{stats.totalBuyerLeads}</span></div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${pct(stats.totalBuyerLeads, Math.max(1, stats.totalBuyerLeads + stats.totalRentalLeads))}%` }} />
                  </div>

                  <div className="flex justify-between text-sm text-gray-600 mt-2"><span>Rental</span><span>{stats.totalRentalLeads}</span></div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-2 bg-emerald-500 rounded-full" style={{ width: `${pct(stats.totalRentalLeads, Math.max(1, stats.totalBuyerLeads + stats.totalRentalLeads))}%` }} />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl">
                <p className="text-sm text-gray-500">Inventory</p>
                <h3 className="text-2xl font-semibold text-gray-900">{stats.totalInventory}</h3>
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600"><span>Buyer</span><span>{stats.totalBuyerInventory}</span></div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${pct(stats.totalBuyerInventory, Math.max(1, stats.totalBuyerInventory + stats.totalRentInventory))}%` }} />
                  </div>

                  <div className="flex justify-between text-sm text-gray-600 mt-2"><span>Rent</span><span>{stats.totalRentInventory}</span></div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-2 bg-emerald-500 rounded-full" style={{ width: `${pct(stats.totalRentInventory, Math.max(1, stats.totalBuyerInventory + stats.totalRentInventory))}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">Lead Status Overview</p>
                  <h3 className="text-lg font-semibold text-gray-900">Breakdown by status</h3>
                </div>
                <div className="text-sm text-gray-500">Total: <span className="font-medium text-gray-900">{stats.totalLeadCount}</span></div>
              </div>

              <div className="mt-4">
                {/* Full-width status-wise chart above the overview cards */}
                <div className="mb-4">
                  {React.useMemo(() => {
                    const s = rawStats || {};
                    const categories = ['Hot','NotConnected','Serious','Potential','Futuristic','DeadLead','Completed'];
                    const data = categories.map((c) => Number(s[c] ?? 0));
                    const series = [{ name: 'Leads', data }];
                    const options = {
                      chart: { toolbar: { show: false }, zoom: { enabled: false } },
                      xaxis: { categories, labels: { rotate: -20 } },
                      stroke: { curve: 'smooth', width: 3 },
                      markers: { size: 4 },
                      grid: { padding: { left: 0, right: 0 } },
                      tooltip: { theme: 'light' },
                      colors: ['#334DE5']
                    };
                    return <AsyncApexChart series={series} options={options} type="line" height={220} />;
                  }, [rawStats])}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Status-based group: Active (Hot, Serious, Potential, Futuristic) */}
                  {(() => {
                    const s = rawStats || {};
                    const hot = Number(s.Hot ?? 0);
                    const serious = Number(s.Serious ?? 0);
                    const potential = Number(s.Potential ?? 0);
                    const futuristic = Number(s.Futuristic ?? 0);
                    const activeTotal = hot + serious + potential + futuristic;
                    const total = Math.max(1, stats.totalLeadCount);
                    return (
                      <div
                        role="button"
                        tabIndex={0}
                        aria-expanded={expandedCards.active}
                        onClick={() => setExpandedCards((p) => ({ ...p, active: !p.active }))}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setExpandedCards((p) => ({ ...p, active: !p.active })); }}
                        className={`bg-white p-4 rounded-lg border ${expandedCards.active ? 'shadow-lg' : 'border-gray-100'} cursor-pointer transition`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-10 rounded-full bg-gradient-to-b from-blue-600 to-indigo-500" aria-hidden />
                            <div>
                              <p className="text-sm text-gray-500">Active Leads</p>
                              <h4 className="text-lg font-semibold text-gray-900">{activeTotal}</h4>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">{pct(activeTotal, total)}%</div>
                        </div>

                        <div className={`mt-3 overflow-hidden transition-all ${expandedCards.active ? 'max-h-96' : 'max-h-0'}`}>
                          <div className="space-y-2 text-sm text-gray-700">
                            <div className="flex items-center justify-between"><span>Hot</span><span>{hot} • {pct(hot, total)}%</span></div>
                            <div className="h-2 bg-red-100 rounded-full overflow-hidden"><div className="h-2 bg-red-500 rounded-full" style={{ width: `${pct(hot, total)}%` }} aria-hidden /></div>
                            <div className="flex items-center justify-between"><span>Serious</span><span>{serious} • {pct(serious, total)}%</span></div>
                            <div className="h-2 bg-amber-100 rounded-full overflow-hidden"><div className="h-2 bg-amber-500 rounded-full" style={{ width: `${pct(serious, total)}%` }} aria-hidden /></div>
                            <div className="flex items-center justify-between"><span>Potential</span><span>{potential} • {pct(potential, total)}%</span></div>
                            <div className="h-2 bg-blue-100 rounded-full overflow-hidden"><div className="h-2 bg-blue-500 rounded-full" style={{ width: `${pct(potential, total)}%` }} aria-hidden /></div>
                            <div className="flex items-center justify-between"><span>Futuristic</span><span>{futuristic} • {pct(futuristic, total)}%</span></div>
                            <div className="h-2 bg-indigo-100 rounded-full overflow-hidden"><div className="h-2 bg-indigo-500 rounded-full" style={{ width: `${pct(futuristic, total)}%` }} aria-hidden /></div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Status-based group: Unresponsive (NotConnected) */}
                  {(() => {
                    const s = rawStats || {};
                    const notConnected = Number(s.NotConnected ?? 0);
                    const total = Math.max(1, stats.totalLeadCount);
                    return (
                      <div
                        role="button"
                        tabIndex={0}
                        aria-expanded={expandedCards.unresponsive}
                        onClick={() => setExpandedCards((p) => ({ ...p, unresponsive: !p.unresponsive }))}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setExpandedCards((p) => ({ ...p, unresponsive: !p.unresponsive })); }}
                        className={`bg-white p-4 rounded-lg border ${expandedCards.unresponsive ? 'shadow-lg' : 'border-gray-100'} cursor-pointer transition`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-10 rounded-full bg-gradient-to-b from-gray-400 to-gray-300" aria-hidden />
                            <div>
                              <p className="text-sm text-gray-500">Unresponsive</p>
                              <h4 className="text-lg font-semibold text-gray-900">{notConnected}</h4>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">{pct(notConnected, total)}%</div>
                        </div>

                        <div className={`mt-3 overflow-hidden transition-all ${expandedCards.unresponsive ? 'max-h-40' : 'max-h-0'}`}>
                          <div className="text-sm text-gray-700">
                            <div className="flex justify-between"><span>Not Connected</span><span>{notConnected} • {pct(notConnected, total)}%</span></div>
                            <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-2 bg-gray-500 rounded-full" style={{ width: `${pct(notConnected, total)}%` }} aria-hidden /></div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Status-based group: Closed (DeadLead, Completed) */}
                  {(() => {
                    const s = rawStats || {};
                    const dead = Number(s.DeadLead ?? 0);
                    const completed = Number(s.Completed ?? 0);
                    const closedTotal = dead + completed;
                    const total = Math.max(1, stats.totalLeadCount);
                    return (
                      <div
                        role="button"
                        tabIndex={0}
                        aria-expanded={expandedCards.closed}
                        onClick={() => setExpandedCards((p) => ({ ...p, closed: !p.closed }))}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setExpandedCards((p) => ({ ...p, closed: !p.closed })); }}
                        className={`bg-white p-4 rounded-lg border ${expandedCards.closed ? 'shadow-lg' : 'border-gray-100'} cursor-pointer transition`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-10 rounded-full bg-gradient-to-b from-rose-500 to-emerald-500" aria-hidden />
                            <div>
                              <p className="text-sm text-gray-500">Closed Leads</p>
                              <h4 className="text-lg font-semibold text-gray-900">{closedTotal}</h4>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">{pct(closedTotal, total)}%</div>
                        </div>

                        <div className={`mt-3 overflow-hidden transition-all ${expandedCards.closed ? 'max-h-48' : 'max-h-0'}`}>
                          <div className="space-y-2 text-sm text-gray-700">
                            <div className="flex justify-between"><span>Dead</span><span>{dead} • {pct(dead, total)}%</span></div>
                            <div className="mt-1 h-2 bg-rose-100 rounded-full overflow-hidden"><div className="h-2 bg-rose-500 rounded-full" style={{ width: `${pct(dead, total)}%` }} aria-hidden /></div>
                            <div className="flex justify-between"><span>Completed</span><span>{completed} • {pct(completed, total)}%</span></div>
                            <div className="mt-1 h-2 bg-emerald-100 rounded-full overflow-hidden"><div className="h-2 bg-emerald-500 rounded-full" style={{ width: `${pct(completed, total)}%` }} aria-hidden /></div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProfile;