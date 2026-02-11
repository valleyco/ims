/**
 * Application Configuration
 * Loads environment variables BEFORE any other modules
 * This ensures process.env is populated before imports execute
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables FIRST, before anything else
dotenv.config();

// Export typed configuration object
export const config = {
  IMS_API_TOKEN: process.env.IMS_API_TOKEN || '',
  PORT: process.env.PORT || '3000',
  IMS_API_BASE: 'https://api.ims.gov.il/v1/envista',
  NODE_ENV: process.env.NODE_ENV || 'development'
} as const;

// Validate required environment variables
if (!config.IMS_API_TOKEN) {
  console.error('❌ FATAL: IMS_API_TOKEN is not set in environment variables!');
  console.error('   Please create a .env file with: IMS_API_TOKEN=your-token-here');
  process.exit(1);
}
