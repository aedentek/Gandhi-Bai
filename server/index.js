
import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import medicine from './routes/medicine.js'; 
import stock from './routes/general-stock.js'; 
import leads from './routes/leads.js';
import users from './routes/users.js';
import grocery from './routes/grocery-categories.js';
import patients from './routes/patients.js';
import staff from './routes/staff.js';
import management from './routes/management.js';
import doctor from './routes/doctor.js';
import general from './routes/general-categories.js';
import settings from './routes/settings.js'; 
import payment from './routes/settlement.js'; 
import roles from './routes/roles.js';
import fees from './routes/Fees.js';
import medicalRecords from './routes/medical-records.js';
import testReports from './routes/test-reports.js';
import doctorAdvance from './api/doctor-advance.js';
import staffAdvance from './api/staff-advance.js';
import doctorSalary from './api/doctor-salary.js';
import staffSalary from './api/staff-salary.js';
import patientPayments from './api/patient-payments.js';
// import uploads from './routes/uploads.js';
import uploads from './routes/uploads.js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();
const app = express();
const PORT = process.env.API_PORT || 4000;

// CORS configuration for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://crm.gandhibaideaddictioncenter.com',
        'https://gandhi-bai.onrender.com',
        'https://gandhii-bai-crm.onrender.com'
      ]
    : ['http://localhost:8080', 'http://localhost:3000', 'http://localhost:4000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request timeout middleware (30 seconds)
app.use((req, res, next) => {
  res.setTimeout(30000, () => {
    console.log('⏰ Request timeout for:', req.path);
    res.status(408).json({ error: 'Request timeout' });
  });
  next();
});

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// CORS preflight handler
app.options('*', cors(corsOptions));


// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files from Photos directory (new staff photos location)
app.use('/Photos', express.static(path.join(__dirname, 'Photos')));

// API Health Check Route
app.get('/', (req, res) => {
  res.json({ 
    message: '🏥 Gandhi Bai CRM API Server', 
    status: 'running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      patients: '/api/patients',
      staff: '/api/staff',
      doctors: '/api/doctor',
      settings: '/api/settings'
    },
    timestamp: new Date().toISOString()
  });
});

// API Health endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    message: 'Gandhi Bai CRM API is running',
    database: 'connected',
    timestamp: new Date().toISOString()
  });
});

// MySQL connection config (optimized for performance)
const db = await mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 15, // Increased connection limit
  queueLimit: 0,
  maxIdle: 10, // Maximum idle connections
  idleTimeout: 60000, // Close connections after 1 minute of inactivity
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

console.log(`Connected to MySQL database at ${process.env.DB_HOST}`);



app.use('/api', stock); 
app.use('/api', medicine); 
app.use('/api', leads); 
app.use('/api', users);
app.use('/api', grocery);
app.use('/api', uploads); // MOVED BEFORE PATIENTS TO TAKE PRIORITY
console.log('📁 Uploads middleware registered at /api');
app.use('/api', patients);
app.use('/api', staff);
app.use('/api', management);
app.use('/api', doctor);
app.use('/api', general);
app.use('/api', settings); 
app.use('/api', payment); 
app.use('/api', roles);
app.use('/api', medicalRecords);
app.use('/api', fees);
app.use('/api', testReports);
app.use('/api', doctorAdvance);
app.use('/api', staffAdvance);
app.use('/api', doctorSalary);
app.use('/api', staffSalary);
app.use('/api', patientPayments);
console.log('🧪 Test Reports middleware registered at /api');
console.log('👨‍⚕️ Staff Advance middleware registered at /api');
console.log('💰 Doctor Salary middleware registered at /api');
console.log('💼 Staff Salary middleware registered at /api');
console.log('🏥 Patient Payments middleware registered at /api');





// Optional table creation (only if user has CREATE privileges)
async function createTablesIfNeeded() {
  const tables = [
    {
      name: 'staff_attendance',
      sql: `CREATE TABLE IF NOT EXISTS staff_attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        staff_id VARCHAR(20) NOT NULL,
        staff_name VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        check_in TIME DEFAULT NULL,
        check_out TIME DEFAULT NULL,
        status ENUM('Present', 'Absent', 'Late', 'Half Day') NOT NULL DEFAULT 'Present',
        working_hours VARCHAR(20) DEFAULT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_staff_id (staff_id),
        INDEX idx_date (date),
        INDEX idx_staff_date (staff_id, date),
        INDEX idx_status (status),
        
        UNIQUE KEY unique_staff_date (staff_id, date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
    },
    {
      name: 'patient_monthly_records',
      sql: `CREATE TABLE IF NOT EXISTS patient_monthly_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id VARCHAR(20) NOT NULL,
        month INT NOT NULL,
        year INT NOT NULL,
        monthly_fees DECIMAL(10,2) DEFAULT 0.00,
        other_fees DECIMAL(10,2) DEFAULT 0.00,
        total_amount DECIMAL(10,2) DEFAULT 0.00,
        amount_paid DECIMAL(10,2) DEFAULT 0.00,
        amount_pending DECIMAL(10,2) DEFAULT 0.00,
        carry_forward_from_previous DECIMAL(10,2) DEFAULT 0.00,
        carry_forward_to_next DECIMAL(10,2) DEFAULT 0.00,
        net_balance DECIMAL(10,2) DEFAULT 0.00,
        payment_status ENUM('pending', 'completed', 'partial') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_patient_id (patient_id),
        INDEX idx_month_year (month, year),
        INDEX idx_patient_month_year (patient_id, month, year),
        INDEX idx_payment_status (payment_status),
        
        UNIQUE KEY unique_patient_month_year (patient_id, month, year)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
    },
    {
      name: 'patient_payment_history',
      sql: `CREATE TABLE IF NOT EXISTS patient_payment_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id VARCHAR(20) NOT NULL,
        amount_paid DECIMAL(10,2) NOT NULL,
        payment_date DATE NOT NULL,
        payment_mode ENUM('Cash', 'Card', 'Bank Transfer', 'UPI', 'Cheque') DEFAULT 'Bank Transfer',
        type ENUM('fee_payment', 'advance_payment', 'partial_payment') DEFAULT 'fee_payment',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_patient_id (patient_id),
        INDEX idx_payment_date (payment_date),
        INDEX idx_patient_payment_date (patient_id, payment_date),
        INDEX idx_type (type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
    }
  ];
  
  console.log('🏗️ Checking database table setup...');
  
  for (const table of tables) {
    try {
      await db.execute(table.sql);
      console.log(`✅ Table '${table.name}' is ready`);
    } catch (error) {
      console.log(`ℹ️ Table '${table.name}' setup skipped: ${error.message.split('\n')[0]}`);
      // Continue without failing - tables might already exist or user lacks privileges
    }
  }
}

// Run table setup without blocking server startup
createTablesIfNeeded().catch(err => {
  console.log('ℹ️ Table setup completed with some limitations');
});





// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Global error handler:', err.message);
  console.error('Stack trace:', err.stack);
  
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    timestamp: new Date().toISOString(),
    path: req.path
  });
});

// Handle 404 errors
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Bind server to all interfaces so external checks can detect the service
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📝 CRM API endpoints are ready`);
  console.log(`💾 Database connection established`);
  console.log(`🔧 Effective PORT env value: ${process.env.API_PORT ?? 'not set'}\n`);
});


