// Script chạy import với prompt password
const readline = require('readline');
const { importData } = require('./import_laptop_data');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('=== IMPORT LAPTOP DATA ===\n');

rl.question('Nhập MySQL password (Enter nếu không có): ', (password) => {
    // Cập nhật password trong import script
    const importScript = require('./import_laptop_data');
    
    // Override dbConfig nếu cần
    if (password.trim()) {
        const fs = require('fs');
        let scriptContent = fs.readFileSync('./database/import_laptop_data.js', 'utf8');
        scriptContent = scriptContent.replace(
            /password: ''/,
            `password: '${password.trim()}'`
        );
        fs.writeFileSync('./database/import_laptop_data_temp.js', scriptContent);
        
        // Chạy import với password mới
        delete require.cache[require.resolve('./import_laptop_data')];
        const { importData: importDataNew } = require('./import_laptop_data_temp');
        importDataNew().then(() => {
            rl.close();
            process.exit(0);
        }).catch(err => {
            console.error('Lỗi:', err);
            rl.close();
            process.exit(1);
        });
    } else {
        // Chạy import không password
        importData().then(() => {
            rl.close();
            process.exit(0);
        }).catch(err => {
            console.error('Lỗi:', err);
            rl.close();
            process.exit(1);
        });
    }
});

