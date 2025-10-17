// Utility helpers for normalizing and evaluating permissions
// Keep functions small and pure so they can be unit-tested easily

const bool = (v) => !!v;

export function normalizePermissions(p = {}) {
  if (!p || typeof p !== 'object') return {};

  // helper to check multiple variants
  const any = (...keys) => keys.some(k => bool(p[k]));

  return {
    superAdmin: any('superAdmin','super_admin'),
    // top-level navigation
    dashboard: any('dashboard'),
    dailyPlans: any('dailyPlans','daily_plans'),
    myTeam: any('myTeam','my_team'),
    findOpportunity: any('findOpportunity','find_opportunity'),
    learnGrow: any('learnGrow','learn_grow'),
    dataBase: any('dataBase','data_base'),
    projectsWorking: any('projectsWorking','projects_working'),
    brokersRequirements: any('brokersRequirements','brokers_requirements','brokers'),

    // leads
    allLeads: any('allLeads','all_leads','allleads'),
    rentalLeads: any('rentalLeads','rental_leads','leads_rental','leads_rent'),
    buyerLeads: any('buyerLeads','buyer_leads','leads_buyers'),
    deadLeads: any('deadLeads','dead_leads','leads_dead'),
    completedLeads: any('completedLeads','completed_leads','leads_completed'),

    // inventory
    inventory: any('inventory','allInventory','all_inventory'),
    rentalInventory: any('rentalInventory','rental_inventory','inv_rental'),
    saleInventory: any('saleInventory','sale_inventory','inv_sale'),
    completedInventory: any('completedInventory','completed_inventory','inv_completed'),
  };
}

// Safe getter for viewer perms; accepts either an authUser object or a raw permissions object
export function getViewerPerms(userLike) {
  if (!userLike) return {};
  const p = userLike.permissions && typeof userLike.permissions === 'object' ? userLike.permissions : userLike;
  return normalizePermissions(p);
}

// Helpers to check if a lead/inventory item is visible to the viewer
export function canViewLead(viewerPerms = {}, lead = {}) {
  const vp = typeof viewerPerms === 'object' && viewerPerms ? viewerPerms : normalizePermissions(viewerPerms || {});
  // allow everything for allLeads
  if (vp.allLeads) return true;
  // admin can see dead leads always
  if (vp.superAdmin) return true;

  const type = String(lead.leadType || lead.type || '').toLowerCase();
  const status = String(lead.status || '').toLowerCase();

  // Dead leads visible only to admins
  if (/dead/.test(status)) return false;

  if (type.includes('rent') || type.includes('rental')) return !!vp.rentalLeads;
  if (type.includes('buy') || type.includes('buyer')) return !!vp.buyerLeads;

  // completed leads require completedLeads
  if (status === 'completed' || status === 'closed') return !!vp.completedLeads;

  // default: if viewer has any lead permission, allow; otherwise deny
  return Boolean(vp.rentalLeads || vp.buyerLeads || vp.completedLeads);
}

export function canViewInventory(viewerPerms = {}, item = {}) {
  const vp = typeof viewerPerms === 'object' && viewerPerms ? viewerPerms : normalizePermissions(viewerPerms || {});
  if (vp.inventory) return true;
  const t = String(item.inventoryType || item.type || item.category || '').toLowerCase();
  if (t.includes('rent')) return !!vp.rentalInventory;
  if (t.includes('sale') || t.includes('sell')) return !!vp.saleInventory;
  if (t.includes('completed') || t.includes('sold') || t.includes('rented')) return !!vp.completedInventory;
  // unknown types: deny by default
  return false;
}

export function hasAnyLeadAccess(viewerPerms = {}) {
  const vp = typeof viewerPerms === 'object' && viewerPerms ? viewerPerms : normalizePermissions(viewerPerms || {});
  return Boolean(vp.allLeads || vp.rentalLeads || vp.buyerLeads || vp.deadLeads || vp.completedLeads);
}

export function hasAnyInventoryAccess(viewerPerms = {}) {
  const vp = typeof viewerPerms === 'object' && viewerPerms ? viewerPerms : normalizePermissions(viewerPerms || {});
  return Boolean(vp.inventory || vp.rentalInventory || vp.saleInventory || vp.completedInventory);
}

export default {
  normalizePermissions,
  getViewerPerms,
  canViewLead,
  canViewInventory,
  hasAnyLeadAccess,
  hasAnyInventoryAccess,
};
