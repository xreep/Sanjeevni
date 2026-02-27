require('dotenv').config();
const mongoose = require('mongoose');
const Hospital = require('../models/Hospital');

const hospitals = [
  {
    name: 'AIIMS Delhi',
    address: 'Ansari Nagar, New Delhi 110029',
    phone: '+91-11-2659-3676',
    email: 'info@aiims.edu',
    location: {
      type: 'Point',
      coordinates: [77.2160, 28.5676],
    },
    emergencyTypes: ['Cardiac', 'Stroke', 'General', 'Pediatric'],
    status: {
      generalBeds: 250,
      icuBeds: 120,
      ventilators: 85,
      bloodBankAvail: true,
      operationTheaterFree: true,
      ambulanceAvail: 15,
      currentLoad: 'High',
    },
    facilities: ['24/7 Emergency', 'Trauma Center', 'ICU', 'Neurology', 'Cardiology', 'Blood Bank'],
    rating: 4.8,
    isVerified: true,
    adminPassword: 'admin123',
  },
  {
    name: 'Fortis Escorts Heart Institute',
    address: 'Sector B, Pocket 1, DSIDC, Okhla Industrial Area, Phase II, New Delhi 110020',
    phone: '+91-11-4037-1000',
    email: 'contact@fortisescorts.com',
    location: {
      type: 'Point',
      coordinates: [77.2160, 28.5678],
    },
    emergencyTypes: ['Cardiac', 'Respiratory', 'Accident'],
    status: {
      generalBeds: 180,
      icuBeds: 95,
      ventilators: 60,
      bloodBankAvail: true,
      operationTheaterFree: true,
      ambulanceAvail: 12,
      currentLoad: 'Moderate',
    },
    facilities: ['Cardiology Center', 'Emergency Room', 'Advanced CCU', 'Cardiac Surgery', 'Diagnostics'],
    rating: 4.7,
    isVerified: true,
    adminPassword: 'admin123',
  },
  {
    name: 'Safdarjung Hospital',
    address: 'Ring Road, New Delhi 110029',
    phone: '+91-11-2644-7020',
    email: 'grievance@safdarjunghospital.com',
    location: {
      type: 'Point',
      coordinates: [77.1889, 28.5678],
    },
    emergencyTypes: ['Accident', 'Burns', 'General', 'Maternity'],
    status: {
      generalBeds: 220,
      icuBeds: 105,
      ventilators: 70,
      bloodBankAvail: true,
      operationTheaterFree: true,
      ambulanceAvail: 14,
      currentLoad: 'Moderate',
    },
    facilities: ['Trauma Center', 'Burn Unit', 'Maternity Ward', 'Emergency Department', 'Surgery Theater'],
    rating: 4.5,
    isVerified: true,
    adminPassword: 'admin123',
  },
  {
    name: 'Max Super Specialty Hospital Saket',
    address: 'B-16, Pocket B-1, Sector 16A, Noida, Uttar Pradesh 201301',
    phone: '+91-120-6717-100',
    email: 'saket@maxhealthcare.com',
    location: {
      type: 'Point',
      coordinates: [77.1956, 28.5244],
    },
    emergencyTypes: ['Stroke', 'Cardiac', 'General', 'Pediatric'],
    status: {
      generalBeds: 160,
      icuBeds: 85,
      ventilators: 55,
      bloodBankAvail: true,
      operationTheaterFree: true,
      ambulanceAvail: 10,
      currentLoad: 'Moderate',
    },
    facilities: ['Neurology', 'Cardiology', 'ICU', 'Emergency Services', 'Pediatrics'],
    rating: 4.6,
    isVerified: true,
    adminPassword: 'admin123',
  },
  {
    name: 'Apollo Hospitals New Delhi',
    address: 'Sector 25, Plot No 1, Noida, Uttar Pradesh 201301',
    phone: '+91-120-4771-777',
    email: 'delhi@apollohospitals.com',
    location: {
      type: 'Point',
      coordinates: [77.2473, 28.5565],
    },
    emergencyTypes: ['Respiratory', 'Accident', 'General'],
    status: {
      generalBeds: 200,
      icuBeds: 100,
      ventilators: 75,
      bloodBankAvail: true,
      operationTheaterFree: true,
      ambulanceAvail: 13,
      currentLoad: 'Low',
    },
    facilities: ['Pulmonology', 'Emergency Department', 'Trauma Care', 'ICU', 'Multi-specialty'],
    rating: 4.7,
    isVerified: true,
    adminPassword: 'admin123',
  },
  {
    name: 'Sir Ganga Ram Hospital',
    address: 'Old Rajendra Nagar, New Delhi 110060',
    phone: '+91-11-4141-5050',
    email: 'feedback@sgrh.com',
    location: {
      type: 'Point',
      coordinates: [77.2292, 28.5887],
    },
    emergencyTypes: ['Poisoning', 'General', 'Maternity', 'Pediatric'],
    status: {
      generalBeds: 190,
      icuBeds: 90,
      ventilators: 65,
      bloodBankAvail: true,
      operationTheaterFree: true,
      ambulanceAvail: 11,
      currentLoad: 'Moderate',
    },
    facilities: ['Toxicology Center', 'Obstetrics', 'Pediatrics', 'Emergency', 'Laboratory'],
    rating: 4.4,
    isVerified: true,
    adminPassword: 'admin123',
  },
  {
    name: 'Guru Tegh Bahadur Hospital',
    address: 'Bahadur Shah Zafar Marg, Delhi 110006',
    phone: '+91-11-2307-2525',
    email: 'gtbh@delhigovt.nic.in',
    location: {
      type: 'Point',
      coordinates: [77.2713, 28.6684],
    },
    emergencyTypes: ['General', 'Accident', 'Respiratory', 'Cardiac'],
    status: {
      generalBeds: 210,
      icuBeds: 110,
      ventilators: 80,
      bloodBankAvail: true,
      operationTheaterFree: true,
      ambulanceAvail: 15,
      currentLoad: 'High',
    },
    facilities: ['Emergency Department', 'Trauma Center', 'ICU', 'Chest Ward', 'Surgery'],
    rating: 4.3,
    isVerified: true,
    adminPassword: 'admin123',
  },
  {
    name: 'Ram Manohar Lohia Hospital',
    address: 'Baba Kharak Singh Marg, New Delhi 110001',
    phone: '+91-11-2336-5525',
    email: 'rml@delhigovt.nic.in',
    location: {
      type: 'Point',
      coordinates: [77.2333, 28.6136],
    },
    emergencyTypes: ['Burn', 'Maternity', 'Pediatric', 'General'],
    status: {
      generalBeds: 230,
      icuBeds: 115,
      ventilators: 85,
      bloodBankAvail: true,
      operationTheaterFree: true,
      ambulanceAvail: 16,
      currentLoad: 'Moderate',
    },
    facilities: ['Burn Unit', 'Obstetrics', 'Child Health', 'Emergency', 'Anesthesia'],
    rating: 4.2,
    isVerified: true,
    adminPassword: 'admin123',
  },
  {
    name: 'BLK Max Super Specialty Hospital',
    address: 'Pusa Road, New Delhi 110005',
    phone: '+91-11-3040-4000',
    email: 'blkmax@blkhospitals.com',
    location: {
      type: 'Point',
      coordinates: [77.0881, 28.6065],
    },
    emergencyTypes: ['Stroke', 'Respiratory', 'Cardiac', 'General'],
    status: {
      generalBeds: 180,
      icuBeds: 95,
      ventilators: 70,
      bloodBankAvail: true,
      operationTheaterFree: true,
      ambulanceAvail: 11,
      currentLoad: 'Low',
    },
    facilities: ['Neurology', 'Pulmonology', 'Cardiology', 'ICU', 'Emergency Room'],
    rating: 4.6,
    isVerified: true,
    adminPassword: 'admin123',
  },
  {
    name: 'Manipal Hospitals Dwarka',
    address: 'Sector 8, Dwarka, New Delhi 110077',
    phone: '+91-11-4960-5000',
    email: 'dwarka@manipalhospitals.com',
    location: {
      type: 'Point',
      coordinates: [77.0407, 28.5935],
    },
    emergencyTypes: ['Accident', 'Maternity', 'Pediatric', 'General'],
    status: {
      generalBeds: 170,
      icuBeds: 85,
      ventilators: 60,
      bloodBankAvail: true,
      operationTheaterFree: true,
      ambulanceAvail: 10,
      currentLoad: 'Low',
    },
    facilities: ['Trauma Center', 'Obstetrics', 'Pediatric Care', 'Emergency', 'Laboratory'],
    rating: 4.5,
    isVerified: true,
    adminPassword: 'admin123',
  },
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    if (process.env.MONGO_URI) {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('✓ Connected to MongoDB');
    } else {
      console.warn('⚠️  MONGO_URI not set. Skipping database seed.');
      return;
    }

    // Clear existing hospital data
    await Hospital.deleteMany({});
    console.log('🗑️  Cleared existing hospitals');

    // Insert all hospitals
    const result = await Hospital.insertMany(hospitals);
    console.log('\n✓ Successfully seeded 10 hospitals:');
    result.forEach((hospital) => {
      console.log(`  • ${hospital.name}`);
    });

    console.log(`\n✓ Total hospitals inserted: ${result.length}`);

    // Disconnect
    await mongoose.disconnect();
    console.log('\n✓ Database connection closed');
  } catch (error) {
    console.error('✗ Error seeding database:', error.message);
    process.exit(1);
  }
};

// Run seed if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
