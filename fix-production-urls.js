// Production URL Fix Script
const fs = require('fs');
const path = require('path');

const productionAPI = 'https://gandhi-bai.onrender.com/api';
const productionBackend = 'https://gandhi-bai.onrender.com';

const filesToFix = [
  'src/utils/patientFeesAPI.js',
  'src/services/databaseService.ts', 
  'src/services/doctorAdvanceAPI.ts',
  'src/services/doctorSalaryAPI.ts',
  'src/services/medicalRecordService.ts',
  'src/services/patientService.ts',
  'src/services/staffAdvanceAPI.ts',
  'src/services/simpleFileUpload.ts',
  'src/services/staffSalaryAPI.ts',
  'src/services/attendanceService.ts'
];

filesToFix.forEach(file => {
  try {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Replace localhost API URLs
      content = content.replace(/http:\/\/localhost:4000\/api/g, productionAPI);
      content = content.replace(/http:\/\/localhost:4000/g, productionBackend);
      
      // Replace environment variable fallbacks
      content = content.replace(
        /import\.meta\.env\.VITE_API_URL \|\| 'http:\/\/localhost:4000\/api'/g, 
        `'${productionAPI}'`
      );
      content = content.replace(
        /import\.meta\.env\.VITE_API_URL\?\.replace\('\/api', ''\) \|\| 'http:\/\/localhost:4000'/g,
        `'${productionBackend}'`
      );
      
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed: ${file}`);
    }
  } catch (error) {
    console.log(`❌ Error fixing ${file}:`, error.message);
  }
});

console.log('🎉 All files updated for production!');
