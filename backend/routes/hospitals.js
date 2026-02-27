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
  },
  {
    _id: '2',
    name: 'Fortis Escorts Heart Institute',
    address: 'Okhla Industrial Area, New Delhi 110020',
    phone: '+91-11-4037-1000',
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
    facilities: ['Cardiology Center', 'Emergency Room', 'CCU'],
    rating: 4.7,
  },
  {
    _id: '3',
    name: 'Max Super Specialty Hospital',
    address: 'Saket, New Delhi 110017',
    phone: '+91-120-6717-100',
    location: {
      type: 'Point',
      coordinates: [77.1956, 28.5244],
    },
    emergencyTypes: ['Stroke', 'General', 'Pediatric'],
    status: {
      generalBeds: 160,
      icuBeds: 85,
      ventilators: 55,
      bloodBankAvail: true,
      operationTheaterFree: true,
      ambulanceAvail: 10,
      currentLoad: 'Low',
    },
    facilities: ['Neurology', 'Pediatrics', 'ICU'],
    rating: 4.6,
  },
  {
    _id: '4',
    name: 'Apollo Hospitals New Delhi',
    address: 'Noida, Uttar Pradesh 201301',
    phone: '+91-120-4771-777',
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
    facilities: ['Emergency Department', 'Trauma Care', 'Multi-specialty'],
    rating: 4.7,
  },
  {
    _id: '5',
    name: 'Sir Ganga Ram Hospital',
    address: 'Old Rajendra Nagar, New Delhi 110060',
    phone: '+91-11-4141-5050',
    location: {
      type: 'Point',
      coordinates: [77.2292, 28.5887],
    },
    emergencyTypes: ['Poisoning', 'General', 'Maternity'],
    status: {
      generalBeds: 190,
      icuBeds: 90,
      ventilators: 65,
      bloodBankAvail: true,
      operationTheaterFree: true,
      ambulanceAvail: 11,
      currentLoad: 'Moderate',
    },
    facilities: ['Toxicology Center', 'Obstetrics', 'Laboratory'],
    rating: 4.4,
  },
];

/**
 * Haversine formula to calculate distance between two coordinates
 * @param {number} lat1 - User latitude
 * @param {number} lon1 - User longitude
 * @param {number} lat2 - Hospital latitude
 * @param {number} lon2 - Hospital longitude
 * @returns {number} Distance in kilometers
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Calculate readiness score (40 points max)
 * Based on: ICU beds, OT free, blood bank, ambulance availability
 */
const calculateReadinessScore = (status) => {
  let points = 0;
  if (status.icuBeds > 0) points += 10;
  if (status.operationTheaterFree) points += 10;
  if (status.bloodBankAvail) points += 10;
  if (status.ambulanceAvail > 0) points += 10;
  return points;
};

/**
 * Calculate bed availability score (25 points max)
 * Based on current load level
 */
const calculateBedAvailabilityScore = (currentLoad) => {
  const scores = {
    Low: 25,
    Moderate: 15,
    High: 5,
  };
  return scores[currentLoad] || 5;
};

/**
 * Calculate distance score (20 points max)
 * Closer distance gets higher score
 */
const calculateDistanceScore = (distance) => {
  if (distance <= 5) return 20;
  if (distance <= 10) return 15;
  if (distance <= 20) return 10;
  if (distance <= 50) return 5;
  return 0;
};

/**
 * Calculate rating score (15 points max)
 */
const calculateRatingScore = (rating) => {
  return (rating / 5) * 15;
};

/**
 * Calculate ETA in minutes (assuming 40 km/h average speed)
 */
const calculateETA = (distance) => {
  const speedKmPerHour = 40;
  return Math.ceil((distance / speedKmPerHour) * 60);
};

/**
 * GET /api/hospitals
 * Find nearest hospitals with scoring based on multiple factors
 *
 * Query params:
 * - lat: User latitude (required)
 * - lng: User longitude (required)
 * - type: Emergency type filter (optional) - e.g. Cardiac, Accident, etc.
 * - severity: Emergency severity (optional) - high, moderate, low
 */
router.get('/', async (req, res) => {
  try {
    const { type, severity, lat, lng } = req.query;

    // Validate required parameters
    if (!lat || !lng) {
      return res.status(400).json({
        error: 'Missing required query parameters: lat, lng',
      });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    if (isNaN(userLat) || isNaN(userLng)) {
      return res.status(400).json({
        error: 'Invalid latitude or longitude',
      });
    }

    // Try to fetch from MongoDB, fallback to mock data
    let hospitals;
    try {
      hospitals = await Hospital.find();
      if (hospitals.length === 0) {
        console.warn('No hospitals in database, using mock data');
        hospitals = mockHospitals;
      }
    } catch (error) {
      console.warn('Database query failed, using mock data:', error.message);
      hospitals = mockHospitals;
    }

    // Filter by emergency type if provided
    let filtered = hospitals;
    if (type) {
      filtered = hospitals.filter((h) =>
        h.emergencyTypes.includes(type)
      );
    }

    // Calculate scores and prepare response data
    let scored = filtered
      .map((hospital) => {
        // Exclusion rule: high severity + ICU beds < 3
        if (severity === 'high' && hospital.status.icuBeds < 3) {
          return null;
        }

        // Calculate distance
        const distance = calculateDistance(
          userLat,
          userLng,
          hospital.location.coordinates[1], // latitude
          hospital.location.coordinates[0]  // longitude
        );

        // Calculate ETA
        const eta = calculateETA(distance);

        // Golden hour: ETA under 10 minutes
        const goldenHour = eta < 10;

        // Calculate individual scores
        const readinessScore = calculateReadinessScore(hospital.status);
        const bedScore = calculateBedAvailabilityScore(
          hospital.status.currentLoad
        );
        const distanceScore = calculateDistanceScore(distance);
        const ratingScore = calculateRatingScore(hospital.rating);

        // Total score
        const totalScore = readinessScore + bedScore + distanceScore + ratingScore;

        return {
          name: hospital.name,
          address: hospital.address,
          phone: hospital.phone,
          distance: parseFloat(distance.toFixed(2)),
          eta,
          score: parseFloat(totalScore.toFixed(1)),
          goldenHour,
          status: hospital.status,
          facilities: hospital.facilities,
          rating: hospital.rating,
          coordinates: hospital.location.coordinates,
        };
      })
      .filter((h) => h !== null);

    // Sort: golden hour hospitals first, then by score (descending)
    scored.sort((a, b) => {
      if (a.goldenHour !== b.goldenHour) {
        return b.goldenHour - a.goldenHour; // Golden hour first
      }
      return b.score - a.score; // Higher score first
    });

    res.json({
      count: scored.length,
      userLocation: { lat: userLat, lng: userLng },
      filters: { type: type || null, severity: severity || null },
      hospitals: scored,
    });
  } catch (error) {
    console.error('Error fetching hospitals:', error.message);
    res.status(500).json({
      error: 'Failed to fetch hospitals',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

module.exports = router;
