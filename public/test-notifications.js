/**
 * Real-Time Notification Test Script
 * 
 * This script tests all notification scenarios to ensure real-time delivery
 * Run this in browser console after logging in
 */

console.log('🧪 Starting Notification Real-Time Tests...\n');

// Get API base URL from env
const API_URL = import.meta?.env?.VITE_API_BASE_URL || 'https://backend.realtyxpo.in';

// Test 1: Check if socket is connected
const testSocketConnection = () => {
  console.log('📡 Test 1: Socket Connection Status');
  
  console.log('👀 Check console for:');
  console.log('   - "✅ Socket connected successfully"');
  console.log('   - "🔐 Registering user: { userId: ..., role: ... }"');
  console.log('   - "✅ Registered for notifications: ..."');
  console.log('');
};

// Test 2: Test manual notification endpoint
const testManualNotification = async () => {
  console.log('📡 Test 2: Manual Notification Endpoint');
  
  try {
    const response = await fetch(`${API_URL}/api/test-socket`);
    const data = await response.json();
    console.log('✅ Response:', data);
    console.log('👀 Watch for "📩 followup_notification event:" in console within 2 seconds');
    console.log('');
    return true;
  } catch (err) {
    console.error('❌ Manual notification test failed:', err);
    return false;
  }
};

// Test 3: Test admin notification (admin only)
const testAdminNotification = async () => {
  console.log('📡 Test 3: Admin Notification Test');
  
  try {
    const response = await fetch(`${API_URL}/api/test-admin-notification`);
    const data = await response.json();
    console.log('✅ Response:', data);
    console.log('👀 Admins should see "📩 notification_received event:" within 2 seconds');
    console.log('');
    return true;
  } catch (err) {
    console.error('❌ Admin notification test failed:', err);
    return false;
  }
};

// Test 4: Check localStorage for auth
const testAuth = () => {
  console.log('📡 Test 4: Authentication Check');
  
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (token) {
    console.log('✅ Token found');
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('📝 User from token:', {
        userId: payload.userId || payload._id || payload.id,
        role: payload.role,
        name: payload.name
      });
    } catch (err) {
      console.log('⚠️ Could not decode token');
    }
  } else {
    console.log('❌ No token found - you must be logged in');
    return false;
  }
  
  if (user) {
    try {
      const userData = JSON.parse(user);
      console.log('📝 User from localStorage:', {
        userId: userData._id || userData.id,
        role: userData.role,
        name: userData.name
      });
    } catch (err) {
      console.log('⚠️ Could not parse user data');
    }
  }
  console.log('');
  return true;
};

// Test 5: Monitor notification events
const monitorNotifications = () => {
  console.log('📡 Test 5: Notification Event Monitor');
  console.log('🎧 Monitoring active - perform these actions to test:');
  console.log('');
  console.log('   1️⃣ Go to All Leads → Add/Edit Lead → Assign to someone');
  console.log('   2️⃣ Go to Inventory → Edit → Change assignTo');
  console.log('   3️⃣ Change lead status');
  console.log('');
  console.log('✅ If working, you will see "📩 notification_received event:" logs');
  console.log('✅ Notification bell should update WITHOUT page refresh');
  console.log('');
};

// Test 6: Check WebSocket connection
const testWebSocketConnection = () => {
  console.log('📡 Test 6: WebSocket Connection Check');
  
  // Check if there are any WebSocket connections
  if (window.performance && window.performance.getEntriesByType) {
    const resources = window.performance.getEntriesByType('resource');
    const wsConnections = resources.filter(r => 
      r.name.includes('socket.io') || r.name.includes('ws://') || r.name.includes('wss://')
    );
    
    if (wsConnections.length > 0) {
      console.log('✅ WebSocket connection detected:', wsConnections.length);
    } else {
      console.log('⚠️ No WebSocket connections found');
      console.log('   Check Network tab → WS filter for socket.io connections');
    }
  }
  console.log('');
};

// Run all tests
const runAllTests = async () => {
  console.clear();
  console.log('═══════════════════════════════════════════');
  console.log('  NOTIFICATION REAL-TIME TEST SUITE');
  console.log('  Backend: ' + API_URL);
  console.log('═══════════════════════════════════════════\n');
  
  const isAuthed = testAuth();
  if (!isAuthed) {
    console.log('❌ Cannot proceed - you must be logged in');
    console.log('Please login and run: window.notificationTests.runAll()');
    return;
  }
  
  testSocketConnection();
  testWebSocketConnection();
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('⏳ Testing backend endpoints...\n');
  
  const manualTestPassed = await testManualNotification();
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const userStr = localStorage.getItem('user');
  const isAdmin = userStr && JSON.parse(userStr).role === 'admin';
  
  if (isAdmin) {
    await testAdminNotification();
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  monitorNotifications();
  
  console.log('═══════════════════════════════════════════');
  console.log('    TEST RESULTS');
  console.log('═══════════════════════════════════════════\n');
  
  if (manualTestPassed) {
    console.log('✅ Backend is emitting notifications');
    console.log('✅ Test endpoints working');
    console.log('');
    console.log('📋 NEXT: Check for these logs above:');
    console.log('   1. "✅ Socket connected successfully"');
    console.log('   2. "🔐 Registering user: ..."');
    console.log('   3. "📩 notification_received event: ..." (from test)');
    console.log('');
    console.log('🧪 NOW TEST REAL ACTIONS:');
    console.log('   - Assign a lead to someone');
    console.log('   - Watch for "📩 notification_received event:"');
    console.log('   - Check if bell updates without refresh');
  } else {
    console.log('❌ Backend test failed - check backend server');
  }
  
  console.log('');
  console.log('═══════════════════════════════════════════\n');
};

// Auto-run tests
if (typeof window !== 'undefined') {
  window.notificationTests = {
    runAll: runAllTests,
    testSocket: testSocketConnection,
    testManual: testManualNotification,
    testAdmin: testAdminNotification,
    testAuth: testAuth,
    monitor: monitorNotifications,
    testWS: testWebSocketConnection
  };
  
  console.log('💡 Notification Test Suite Loaded!');
  console.log('📝 Run: window.notificationTests.runAll()');
  console.log('');
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAllTests };
}
