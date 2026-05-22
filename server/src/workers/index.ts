import dotenv from 'dotenv';
dotenv.config();
import { Worker } from 'bullmq';
import redis from '../lib/redis.js';
import fileProcessor from './fileProcessing.js';
import avScanProcessor from './avScan.js';
import emailNotifyProcessor from './emailNotify.js';
import '../jobs/cron.js';

const connection = redis;

new Worker('file-processing', fileProcessor, { connection });
new Worker('av-scan', avScanProcessor, { connection });
new Worker('email-notify', emailNotifyProcessor, { connection });

console.log('Workers started');
