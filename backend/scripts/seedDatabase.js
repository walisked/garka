import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Agent from '../models/Agent.js';
import DealInitiator from '../models/DealInitiator.js';
import LandProperty from '../models/LandProperty.js';
import CommissionConfig from '../models/CommissionConfig.js';
import { logger } from '../utils/logger.js';
import env from '../config/env.js';

const seedDatabase = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    logger.info('Connected to database for seeding');
    
    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Agent.deleteMany({}),
      DealInitiator.deleteMany({}),
      LandProperty.deleteMany({}),
      CommissionConfig.deleteMany({})
    ]);
    
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await User.create({
      fullName: 'System Admin',
      email: 'admin@landmarket.com',
      phone: '08012345678',
      password: adminPassword,
      role: 'ADMIN',
      isActive: true,
      isVerified: true
    });
    
    // Create commission config
    const commissionConfig = await CommissionConfig.create({
      platformPercentage: 10,
      adminPercentage: 5,
      agentPercentage: 40,
      dealInitiatorPercentage: 45,
      minimumVerificationFee: 5000,
      createdBy: admin._id
    });
    
    // Create sample agents
    const agentPassword = await bcrypt.hash('agent123', 12);
    const agentUser = await User.create({
      fullName: 'John Agent',
      email: 'agent@landmarket.com',
      phone: '08023456789',
      password: agentPassword,
      role: 'AGENT',
      isActive: true
    });
    
    const agent = await Agent.create({
      user: agentUser._id,
      organizationName: 'Prime Properties Ltd',
      status: 'APPROVED',
      rating: 4.5,
      commissionPercentage: 40,
      verifiedBy: admin._id,
      verifiedAt: new Date()
    });
    
    // Create sample deal initiators
    const initiatorPassword = await bcrypt.hash('initiator123', 12);
    const initiatorUser = await User.create({
      fullName: 'David Verifier',
      email: 'verifier@landmarket.com',
      phone: '08034567890',
      password: initiatorPassword,
      role: 'DEAL_INITIATOR',
      isActive: true
    });
    
    const dealInitiator = await DealInitiator.create({
      user: initiatorUser._id,
      specialization: 'Residential Land',
      experienceYears: 5,
      rating: 4.8,
      completedClaims: 12,
      status: 'APPROVED',
      preferredLocations: ['Lagos', 'Abuja'],
      verifiedBy: admin._id,
      verifiedAt: new Date()
    });
    
    // Create sample properties
    const properties = await LandProperty.create([
      {
        title: 'Prime Residential Plot in Lekki',
        landSize: '500sqm',
        agentId: agent._id,
        price: 15000000,
        location: {
          state: 'Lagos',
          city: 'Lekki',
          address: 'Lekki Phase 1, Lagos'
        },
        landUseType: 'Residential',
        status: 'available'
      },
      {
        title: 'Commercial Land in Abuja CBD',
        landSize: '1 hectare',
        agentId: agent._id,
        price: 50000000,
        location: {
          state: 'Abuja',
          city: 'Central Business District',
          address: 'Plot 123, CBD, Abuja'
        },
        landUseType: 'Commercial',
        status: 'available'
      }
    ]);
    
    // Create regular user
    const userPassword = await bcrypt.hash('user123', 12);
    const regularUser = await User.create({
      fullName: 'Regular User',
      email: 'user@landmarket.com',
      phone: '08045678901',
      password: userPassword,
      role: 'USER',
      isActive: true
    });
    
    logger.info('✅ Database seeded successfully!');
    logger.info(`👑 Admin: admin@landmarket.com / admin123`);
    logger.info(`👔 Agent: agent@landmarket.com / agent123`);
    logger.info(`🔍 Deal Initiator: verifier@landmarket.com / initiator123`);
    logger.info(`👤 User: user@landmarket.com / user123`);
    
    process.exit(0);
  } catch (error) {
    logger.error(`Seed database error: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
