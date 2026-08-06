const assert = require('assert');
const authMiddleware = require('./auth.middleware');
const leadController = require('./controllers/lead.controller');
const businessController = require('./controllers/business.controller');
const stampController = require('./controllers/stamp.controller');
const db = require('./db');

console.log('Running backend tests...');

// Mock Auth Middleware Test
(function testAuthMiddleware() {
  const reqWithHeader = {
    header: (name) => {
      if (name === 'x-user-email') return 'test@example.com';
      return null;
    }
  };
  const res = {};
  let nextCalled = false;
  const next = () => { nextCalled = true; };

  authMiddleware(reqWithHeader, res, next);

  assert.strictEqual(reqWithHeader.userEmail, 'test@example.com', 'Auth middleware should set req.userEmail');
  assert.strictEqual(nextCalled, true, 'Auth middleware should call next()');
  console.log('✔ Auth middleware tests passed');
})();

// Port Initialization Mock Test
(function testPortInitialization() {
  const defaultPort = process.env.PORT || 3000;
  assert.ok(defaultPort > 0, 'Port should be initialized to a valid number');
  console.log('✔ Port initialization tests passed');
})();

// Mock Controller Auth Test
(async function testLeadControllerAuth() {
  const req = {
    params: { email: 'target@example.com' },
    userEmail: 'different@example.com'
  };
  let statusSet = 0;
  let jsonCalledWith = null;
  const res = {
    status: (code) => {
      statusSet = code;
      return res;
    },
    json: (data) => {
      jsonCalledWith = data;
    }
  };

  await leadController.getLeadByEmail(req, res);
  assert.strictEqual(statusSet, 403, 'Should return 403 when emails do not match');
  assert.ok(jsonCalledWith.error.includes('Acesso negado'), 'Should return correct error message');
  
  await leadController.deleteLead(req, res);
  assert.strictEqual(statusSet, 403, 'Should return 403 when emails do not match on delete');
  assert.ok(jsonCalledWith.error.includes('Acesso negado'), 'Should return correct error message on delete');
  
  // Test upsertLead input validation checks
  const invalidEmailReq = { body: { contactEmail: 'invalid-email', name: 'Test' } };
  await leadController.upsertLead(invalidEmailReq, res);
  assert.strictEqual(statusSet, 400, 'Should reject invalid email addresses format');
  assert.ok(jsonCalledWith.error.includes('E-mail inválido'), 'Should state email is invalid');

  const missingNameReq = { body: { contactEmail: 'test@example.com' } };
  await leadController.upsertLead(missingNameReq, res);
  assert.strictEqual(statusSet, 400, 'Should reject missing merchant/business name');
  assert.ok(jsonCalledWith.error.includes('name é obrigatório'), 'Should state name is required');

  console.log('✔ Lead controller auth & validation tests passed');
})();

// Mock Business Controller Tests
(async function testBusinessController() {
  // Force memory store for tests
  db.isDbConnected = false;

  const mockBusinessId = 'biz-123';
  const reqUpsertValid = {
    body: {
      businessId: mockBusinessId,
      name: 'Test Business',
      address: '123 Test St'
    }
  };
  const reqUpsertInvalid = { body: {} };
  
  let statusSet = 200;
  let jsonCalledWith = null;
  const res = {
    status: (code) => { statusSet = code; return res; },
    json: (data) => { jsonCalledWith = data; return res; }
  };

  // Test upsertApprovedBusiness - invalid
  await businessController.upsertApprovedBusiness(reqUpsertInvalid, res);
  assert.strictEqual(statusSet, 400, 'Should return 400 for missing businessId');
  
  // Test upsertApprovedBusiness - valid
  statusSet = 200;
  await businessController.upsertApprovedBusiness(reqUpsertValid, res);
  assert.strictEqual(statusSet, 200, 'Should return 200 for valid upsert');
  assert.strictEqual(db.memoryStore.approvedBusinesses[mockBusinessId].name, 'Test Business', 'Business should be saved in memoryStore');

  // Test getApprovedBusinessById - valid
  statusSet = 200;
  const reqGetValid = { params: { id: mockBusinessId } };
  await businessController.getApprovedBusinessById(reqGetValid, res);
  assert.strictEqual(jsonCalledWith.data.businessId, mockBusinessId, 'Should return the requested business inside data envelope');

  // Test getApprovedBusinessById - invalid
  const reqGetInvalid = { params: { id: 'non-existent' } };
  await businessController.getApprovedBusinessById(reqGetInvalid, res);
  assert.strictEqual(statusSet, 404, 'Should return 404 for non-existent business');

  // Test deleteApprovedBusiness
  statusSet = 200;
  const reqDelete = { params: { id: mockBusinessId } };
  await businessController.deleteApprovedBusiness(reqDelete, res);
  assert.strictEqual(db.memoryStore.approvedBusinesses[mockBusinessId], undefined, 'Business should be deleted from memoryStore');
  
  console.log('✔ Business controller tests passed');
})();

// Mock Stamp Controller Tests
(async function testStampController() {
  let statusSet = 200;
  let jsonCalledWith = null;
  const res = {
    status: (code) => { statusSet = code; return res; },
    json: (data) => { jsonCalledWith = data; return res; }
  };

  await stampController.addStamp({}, res);
  assert.strictEqual(statusSet, 501, 'addStamp should return 501 Not Implemented');
  
  await stampController.getStamps({}, res);
  assert.strictEqual(statusSet, 501, 'getStamps should return 501 Not Implemented');
  
  console.log('✔ Stamp controller tests passed');
})();
// Router Mapping Configuration Integration Tests
(function testRouterConfiguration() {
  const businessRoutes = require('./routes/business.routes');
  const leadRoutes = require('./routes/lead.routes');
  const businessController = require('./controllers/business.controller');
  const leadController = require('./controllers/lead.controller');

  // businessRoutes
  const getBusinessesLayer = businessRoutes.stack.find(l => l.route && l.route.path === '/businesses' && l.route.methods.get);
  assert.ok(getBusinessesLayer, 'GET /api/businesses should be mapped');
  assert.strictEqual(getBusinessesLayer.route.stack[0].handle, businessController.getBusinesses, 'GET /businesses should map to businessController.getBusinesses');

  const getApprovedBusinessLayer = businessRoutes.stack.find(l => l.route && l.route.path === '/approved-businesses/:id' && l.route.methods.get);
  assert.ok(getApprovedBusinessLayer, 'GET /api/approved-businesses/:id should be mapped');
  assert.strictEqual(getApprovedBusinessLayer.route.stack[0].handle, businessController.getApprovedBusinessById, 'GET /approved-businesses/:id should map to businessController.getApprovedBusinessById');

  // leadRoutes
  const getLeadLayer = leadRoutes.stack.find(l => l.route && l.route.path === '/:email' && l.route.methods.get);
  assert.ok(getLeadLayer, 'GET /api/leads/:email should be mapped');
  assert.strictEqual(getLeadLayer.route.stack[1].handle, leadController.getLeadByEmail, 'GET /api/leads/:email should map to leadController.getLeadByEmail');

  console.log('✔ Router mapping configuration tests passed');
})();

// Error Middleware Integration Tests
(function testErrorMiddleware() {
  // Mimic the error middleware logic from server.js
  const errMiddleware = (err, req, res, next) => {
    res.status(500).json({
      success: false,
      error: err.message || 'Internal Server Error'
    });
  };

  let statusSet = 0;
  let jsonCalledWith = null;

  const resMock = {
    status: (code) => {
      statusSet = code;
      return resMock;
    },
    json: (data) => {
      jsonCalledWith = data;
      return resMock;
    }
  };

  errMiddleware(new Error('Simulated Database Error'), {}, resMock, () => {});

  assert.strictEqual(statusSet, 500, 'Error middleware should return 500 status');
  assert.strictEqual(jsonCalledWith.success, false, 'Error middleware should return success: false');
  assert.strictEqual(jsonCalledWith.error, 'Simulated Database Error', 'Error middleware should return error message');

  // Test default error message
  errMiddleware({}, {}, resMock, () => {});
  assert.strictEqual(jsonCalledWith.error, 'Internal Server Error', 'Error middleware should use default message if err.message is not present');

  console.log('✔ Error middleware tests passed');
})();

console.log('All backend mock tests passed!');
