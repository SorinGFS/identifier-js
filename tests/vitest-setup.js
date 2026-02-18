const fs = require('fs');
const { execSync } = require('child_process');

const packageJsonPath = './package.json';
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Install vitest if not already installed
if (!packageJson.devDependencies?.vitest) {
    console.log('Installing vitest...');
    execSync('npm install --save-dev vitest', { stdio: 'inherit' });
}

// Ensure the test script is set to vitest
if (packageJson.scripts?.test !== 'vitest') {
    console.log('Updating test script to vitest...');
    packageJson.scripts.test = 'vitest --watch=false';
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}
