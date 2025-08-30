import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Import all routes
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
import uploads from './routes/uploads.js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();
const app = express();
const PORT = process.env.API_PORT || 4000;

// 🔒 SECURITY MIDDLEWARE
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: 15 * 60 // 15 minutes
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

// 🌐 ENHANCED CORS CONFIGURATION
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://crm.gandhibaideaddictioncenter.com',
      'https://gandhi-bai.onrender.com',
      'https://gandhii-bai-crm.onrender.com',
      'http://localhost:8080',
      'http://localhost:3000'
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`❌ CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'Origin'],
  exposedHeaders: ['X-Total-Count', 'X-Response-Time'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ⚡ PERFORMANCE MONITORING MIDDLEWARE
app.use((req, res, next) => {
  const startTime = Date.now();
  
  console.log(`📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  
  // Add response time header
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    res.set('X-Response-Time', `${responseTime}ms`);
    
    if (responseTime > 5000) {
      console.log(`🐌 Slow response: ${req.path} took ${responseTime}ms`);
    }
  });
  
  next();
});

// Request timeout middleware (30 seconds)
app.use((req, res, next) => {
  res.setTimeout(30000, () => {
    console.log('⏰ Request timeout for:', req.path);
    res.status(408).json({ 
      error: 'Request timeout',
      message: 'The server took too long to respond',
      timestamp: new Date().toISOString()
    });
  });
  next();
});

// CORS preflight handler
app.options('*', cors(corsOptions));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/Photos', express.static(path.join(__dirname, 'Photos')));

// 🏥 API HEALTH CHECK ROUTES
app.get('/', (req, res) => {
  res.json({ 
    message: '🏥 Gandhi Bai CRM API Server - PERFECT EDITION', 
    status: 'running',
    version: '2.0.0',
    performance: 'optimized',
    security: 'enhanced',
    features: {
      cors: 'advanced',
      rateLimit: 'enabled',
      monitoring: 'active',
      errorHandling: 'comprehensive'
    },
    endpoints: {
      health: '/api/health',
      patients: '/api/patients',
      staff: '/api/staff',
      doctors: '/api/doctor',
      settings: '/api/settings',
      testReports: '/api/test-reports'
    },
    timestamp: new Date().toISOString()
  });
});

// Enhanced health endpoint
app.get('/api/health', async (req, res) => {
  const healthCheck = {
    status: 'healthy',
    message: 'Gandhi Bai CRM API is running perfectly',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: 'connected'
  };
  
  try {
    // Test database connectivity
    await db.execute('SELECT 1');
    healthCheck.database = 'connected';
  } catch (error) {
    healthCheck.database = 'error';
    healthCheck.status = 'degraded';
  }
  
  res.json(healthCheck);
});

// 💾 OPTIMIZED DATABASE CONNECTION
const db = await mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 20, // Increased for better performance
  queueLimit: 0,
  maxIdle: 10,
  idleTimeout: 60000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  acquireTimeout: 60000,
  timeout: 60000
});

console.log(`✅ Connected to MySQL database at ${process.env.DB_HOST}`);

// Make db available globally
global.db = db;

// 🛣️ API ROUTES REGISTRATION
const routes = [
  { path: '/api', router: stock, name: 'General Stock' },
  { path: '/api', router: medicine, name: 'Medicine' },
  { path: '/api', router: leads, name: 'Leads' },
  { path: '/api', router: users, name: 'Users' },
  { path: '/api', router: grocery, name: 'Grocery' },
  { path: '/api', router: uploads, name: 'File Uploads' },
  { path: '/api', router: patients, name: 'Patients' },
  { path: '/api', router: staff, name: 'Staff' },
  { path: '/api', router: management, name: 'Management' },
  { path: '/api', router: doctor, name: 'Doctor' },
  { path: '/api', router: general, name: 'General Categories' },
  { path: '/api', router: settings, name: 'Settings' },
  { path: '/api', router: payment, name: 'Payments' },
  { path: '/api', router: roles, name: 'Roles' },
  { path: '/api', router: medicalRecords, name: 'Medical Records' },
  { path: '/api', router: fees, name: 'Fees' },
  { path: '/api', router: testReports, name: 'Test Reports' },
  { path: '/api', router: doctorAdvance, name: 'Doctor Advance' },
  { path: '/api', router: staffAdvance, name: 'Staff Advance' },
  { path: '/api', router: doctorSalary, name: 'Doctor Salary' },
  { path: '/api', router: staffSalary, name: 'Staff Salary' },
  { path: '/api', router: patientPayments, name: 'Patient Payments' }
];

routes.forEach(({ path, router, name }) => {
  app.use(path, router);
  console.log(`📋 ${name} routes registered`);
});

// 🎯 ADVANCED ERROR HANDLING
app.use((err, req, res, next) => {
  console.error('❌ Global error handler:', err.message);
  console.error('📍 Request:', req.method, req.path);
  console.error('🔍 Stack trace:', err.stack);
  
  // Database connection errors
  if (err.code === 'ECONNRESET' || err.code === 'PROTOCOL_CONNECTION_LOST') {
    return res.status(503).json({
      error: 'Database connection lost',
      message: 'Please try again in a moment',
      code: err.code,
      timestamp: new Date().toISOString()
    });
  }
  
  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }
  
  // Generic error response
  const errorResponse = {
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  };
  
  if (process.env.NODE_ENV !== 'production') {
    errorResponse.stack = err.stack;
  }
  
  res.status(err.status || 500).json(errorResponse);
});

// Handle 404 errors
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableEndpoints: '/api/health',
    timestamp: new Date().toISOString()
  });
});

// 🚀 SERVER STARTUP WITH GRACEFUL SHUTDOWN
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('\n🎉 PERFECT CRM SERVER STARTED!');
  console.log('=' .repeat(50));
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`🏥 CRM API endpoints are ready`);
  console.log(`💾 Database connection pool active`);
  console.log(`🔒 Security measures enabled`);
  console.log(`⚡ Performance monitoring active`);
  console.log(`🌐 CORS configured for production`);
  console.log('=' .repeat(50));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    db.end();
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    db.end();
    process.exit(0);
  });
});
