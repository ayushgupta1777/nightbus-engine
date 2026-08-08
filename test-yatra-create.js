const mongoose = require('mongoose');
const YatraPackage = require('./models/YatraPackage');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nightbus').then(async () => {
  console.log('Connected');

  try {
    const pkg = new YatraPackage({
      ownerId: new mongoose.Types.ObjectId(),
      busId: new mongoose.Types.ObjectId(),
      title: 'Test Package',
      description: '', // <--- Empty description
      category: 'religious',
      highlights: [],
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000),
      departurePoint: {
        city: 'Delhi',
        address: 'Test',
        time: '10:00 AM'
      },
      pickupPoints: [],
      itinerary: [],
      inclusions: [],
      exclusions: [],
      pricePerPerson: 2500,
      totalSeats: 35,
      destinationCity: 'Haridwar',
      contactPhone: '9876543210',
      images: [],
      status: 'draft'
    });

    await pkg.save();
    console.log('Saved successfully');
  } catch (err) {
    console.error('Validation error:', err.message);
  }

  mongoose.disconnect();
});
