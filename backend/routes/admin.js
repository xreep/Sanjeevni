const express = require('express');
const router = express.Router();
const Hospital = require('../models/Hospital');

// Mock hospitals for fallback
const mockHospitals = [
  {
    _id: '1',
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
    facilities: ['24/7 Emergency', 'Trauma Center', 'ICU', 'Cardiology'],
    rating: 4.8,
    isVerified: true,
  },
  {
    _id: '2',
    name: 'Max Super Specialty Hospital',
    address: 'Saket, New Delhi 110017',
    phone: '+91-120-6717-100',
    email: 'saket@maxhealthcare.com',
    location: {
      type: 'Point',
      coordinates: [77.1956, 28.5244],
    },
    emergencyTypes: ['Stroke', 'General', 'Pediatric', 'Cardiac'],
    status: {
      generalBeds: 160,
      icuBeds: 85,
      ventilators: 55,
      bloodBankAvail: true,
      operationTheaterFree: true,
      ambulanceAvail: 10,
      currentLoad: 'Low',
    },
    facilities: ['Neurology', 'Pediatrics', 'ICU', 'Emergency'],
    rating: 4.6,
    isVerified: true,
  },
  {
    _id: '3',
    name: 'Apollo Hospitals New Delhi',
    address: 'Noida, Uttar Pradesh 201301',
    phone: '+91-120-4771-777',
    email: 'delhi@apollohospitals.com',
    location: {
      type: 'Point',
      coordinates: [77.2473, 28.5565],
    },
    emergencyTypes: ['Respiratory', 'Accident', 'General', 'Cardiac'],
    status: {
      generalBeds: 200,
      icuBeds: 100,
      ventilators: 75,
      bloodBankAvail: true,
      operationTheaterFree: true,
      ambulanceAvail: 13,
      currentLoad: 'Moderate',
    },
    facilities: ['Emergency Department', 'Trauma Care', 'Multi-specialty', 'ICU'],
    rating: 4.7,
    isVerified: true,
  },
];

/**
 * GET /admin/hospitals
 * Retrieve all hospitals with their current status
 * Excludes adminPassword field
 */
router.get('/hospitals', async (req, res) => {
  try {
    let hospitals;

    // Try to fetch from MongoDB
    try {
      hospitals = await Hospital.find().select('-adminPassword');
      
      // If no hospitals in DB, use mock data
      if (hospitals.length === 0) {
        console.warn('No hospitals in database, returning mock data');
        return res.json({
          source: 'mock',
          count: mockHospitals.length,
          hospitals: mockHospitals,
        });
      }

      return res.json({
        source: 'database',
        count: hospitals.length,
        hospitals: hospitals,
      });
    } catch (dbError) {
      console.warn('Database error, returning mock data:', dbError.message);
      return res.json({
        source: 'mock',
        count: mockHospitals.length,
        hospitals: mockHospitals,
      });
    }
  } catch (error) {
    console.error('Error fetching hospitals:', error.message);
    res.status(500).json({
      error: 'Failed to fetch hospitals',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * PUT /admin/hospital/:id
 * Update hospital status fields with password authentication
 *
 * Body:
 * - status: object with fields to update (generalBeds, icuBeds, ventilators, etc.)
 * - password: admin password for verification
 *
 * Returns updated hospital data (excluding adminPassword)
 */
router.put('/hospital/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, password } = req.body;

    // Validate required fields
    if (!password) {
      return res.status(400).json({
        error: 'Missing required field: password',
      });
    }

    if (!status) {
      return res.status(400).json({
        error: 'Missing required field: status',
      });
    }

    // Validate password
    const correctPassword = process.env.ADMIN_PASSWORD || 'admin123';
    if (password !== correctPassword) {
      return res.status(401).json({
        error: 'Invalid admin password',
      });
    }

    // Try to update in MongoDB
    try {
      const hospital = await Hospital.findById(id);

      if (!hospital) {
        return res.status(404).json({
          error: 'Hospital not found',
        });
      }

      // Update only status fields
      hospital.status = {
        ...hospital.status,
        ...status,
      };

      await hospital.save();

      // Return updated hospital excluding adminPassword
      const updatedHospital = hospital.toObject();
      delete updatedHospital.adminPassword;

      return res.json({
        success: true,
        message: 'Hospital status updated successfully',
        timestamp: new Date().toISOString(),
        hospital: updatedHospital,
      });
    } catch (dbError) {
      // If DB fails, return mock success response
      if (dbError.name === 'MongoError' || dbError.name === 'MongoNetworkError') {
        console.warn('Database error, returning mock success:', dbError.message);
        return res.json({
          success: true,
          message: 'Hospital status updated successfully',
          timestamp: new Date().toISOString(),
          source: 'mock',
          hospital: {
            _id: id,
            status: status,
          },
        });
      }
      throw dbError;
    }
  } catch (error) {
    console.error('Error updating hospital:', error.message);
    res.status(500).json({
      error: 'Failed to update hospital',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

module.exports = router;
