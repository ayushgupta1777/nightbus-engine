const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

jest.setTimeout(60000); // 60 seconds to allow for MongoDB binary download

beforeAll(async () => {
  const localTestUri = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/warrol_bus_test';
  try {
    await mongoose.connect(localTestUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 2000
    });
    console.log('⚡ Using local MongoDB for test suite:', localTestUri);
  } catch (err) {
    mongoServer = await MongoMemoryServer.create({
      instance: {
        launchTimeout: 60000
      }
    });
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

afterEach(async () => {
  if (mongoose.connection.readyState !== 1) return; // Only clear if connected
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});
