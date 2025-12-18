#!/usr/bin/env node
/**
 * Verification script to check if all admin fixes are properly deployed
 */

const fs = require('fs');
const path = require('path');

console.log('\n');
console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║         ADMIN DASHBOARD FIXES - DEPLOYMENT VERIFICATION        ║');
console.log('╚════════════════════════════════════════════════════════════════╝');
console.log('\n');

const projectRoot = __dirname;

// List of files that should exist
const requiredFiles = [
    'public/admin-fix.js',
    'public/admin-enhancements.js',
    'public/test-admin-endpoints.js',
    'middleware/authorize.js',
    'routes/refunds.js',
    'database/06_refunds_schema.sql',
    'public/admin.html',
    'server.js',
    'docs/README.md',
    'docs/admin.md',
    'docs/docker.md',
    'docs/deployment.md'
];

console.log('📁 Checking files...\n');

let allFilesExist = true;
requiredFiles.forEach(file => {
    const fullPath = path.join(projectRoot, file);
    const exists = fs.existsSync(fullPath);
    const status = exists ? '✅' : '❌';
    console.log(`${status} ${file}`);
    if (!exists) allFilesExist = false;
});

console.log('\n');

// Check admin.html content
console.log('📝 Checking admin.html modifications...\n');

const adminHtmlPath = path.join(projectRoot, 'public/admin.html');
const adminHtmlContent = fs.readFileSync(adminHtmlPath, 'utf8');

const hasAdminFix = adminHtmlContent.includes('admin-fix.js');
const hasEnhancements = adminHtmlContent.includes('admin-enhancements.js');
const hasTestScript = adminHtmlContent.includes('test-admin-endpoints.js');

console.log(`${hasAdminFix ? '✅' : '❌'} admin.html includes admin-fix.js`);
console.log(`${hasEnhancements ? '✅' : '❌'} admin.html includes admin-enhancements.js`);
console.log(`${hasTestScript ? '✅' : '❌'} admin.html includes test-admin-endpoints.js`);

console.log('\n');

// Check server.js for refunds router
console.log('🔧 Checking server.js configuration...\n');

const serverJsPath = path.join(projectRoot, 'server.js');
const serverJsContent = fs.readFileSync(serverJsPath, 'utf8');

const hasRefundsImport = serverJsContent.includes("require('./routes/refunds')");
const hasRefundsRouter = serverJsContent.includes("app.use('/api/refunds'");

console.log(`${hasRefundsImport ? '✅' : '❌'} server.js imports refunds router`);
console.log(`${hasRefundsRouter ? '✅' : '❌'} server.js registers /api/refunds route`);

console.log('\n');

// Check authorize.js content
console.log('🔐 Checking middleware/authorize.js...\n');

const authorizeJsPath = path.join(projectRoot, 'middleware/authorize.js');
const authorizeJsContent = fs.readFileSync(authorizeJsPath, 'utf8');

const hasAuthorizeFunction = authorizeJsContent.includes('module.exports = function authorize');
const hasRoleCheck = authorizeJsContent.includes("req.user.role === 'admin'");

console.log(`${hasAuthorizeFunction ? '✅' : '❌'} authorize.js exports middleware function`);
console.log(`${hasRoleCheck ? '✅' : '❌'} authorize.js checks user role`);

console.log('\n');

// Check refunds.js content
console.log('📦 Checking routes/refunds.js...\n');

const refundsJsPath = path.join(projectRoot, 'routes/refunds.js');
const refundsJsContent = fs.readFileSync(refundsJsPath, 'utf8');

const hasPostEndpoint = refundsJsContent.includes('router.post');
const hasGetEndpoint = refundsJsContent.includes('router.get');
const hasPutEndpoint = refundsJsContent.includes('router.put');
const hasAuthorization = refundsJsContent.includes('authorize');

console.log(`${hasPostEndpoint ? '✅' : '❌'} refunds.js has POST endpoint`);
console.log(`${hasGetEndpoint ? '✅' : '❌'} refunds.js has GET endpoint`);
console.log(`${hasPutEndpoint ? '✅' : '❌'} refunds.js has PUT endpoint`);
console.log(`${hasAuthorization ? '✅' : '❌'} refunds.js uses authorization middleware`);

console.log('\n');

// Summary
console.log('═══════════════════════════════════════════════════════════════\n');

const allChecksPass = allFilesExist && hasAdminFix && hasEnhancements && 
                      hasTestScript && hasRefundsImport && hasRefundsRouter &&
                      hasAuthorizeFunction && hasRoleCheck && hasPostEndpoint &&
                      hasGetEndpoint && hasPutEndpoint && hasAuthorization;

if (allChecksPass) {
    console.log('✅ ALL CHECKS PASSED - Ready for deployment!\n');
    console.log('Next steps:');
    console.log('  1. npm start (restart server)');
    console.log('  2. Open admin.html in browser');
    console.log('  3. Run testEndpoints() in DevTools Console');
    console.log('  4. Verify all endpoints return 200 OK\n');
} else {
    console.log('❌ SOME CHECKS FAILED - Please review the issues above\n');
    console.log('Issues to fix:');
    if (!allFilesExist) console.log('  • Some files are missing');
    if (!hasAdminFix) console.log('  • admin.html is missing admin-fix.js script tag');
    if (!hasEnhancements) console.log('  • admin.html is missing admin-enhancements.js script tag');
    if (!hasTestScript) console.log('  • admin.html is missing test-admin-endpoints.js script tag');
    if (!hasRefundsImport) console.log('  • server.js is not importing refunds router');
    if (!hasRefundsRouter) console.log('  • server.js is not registering /api/refunds route');
    console.log('');
}

console.log('═══════════════════════════════════════════════════════════════\n');
console.log('For help, read: docs/README.md\n');
