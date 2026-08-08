const mongoose = require('mongoose');
const yatraController = require('./controllers/yatraController');
const YatraBooking = require('./models/YatraBooking');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nightbus').then(async () => {
  console.log('Connected to DB');

  // Let's find a user who has a YatraBooking
  const booking = await YatraBooking.findOne().populate('packageId');
  if (!booking) {
    console.log('No YatraBookings found');
    process.exit(0);
  }
  console.log('Found booking:', booking._id, 'for user:', booking.customerId);

  const req = {
    user: { _id: booking.customerId },
    userId: booking.customerId
  };
  const res = {
    status: (code) => ({ json: (data) => console.log('Status', code, data) }),
    json: (data) => console.log('Success:', data.data.length, 'bookings found')
  };

  await yatraController.getMyBookings(req, res);
  process.exit(0);
});
