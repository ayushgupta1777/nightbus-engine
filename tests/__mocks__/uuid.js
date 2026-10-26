let counter = 0;
module.exports = {
  v4: jest.fn(() => `mock-uuid-${Date.now()}-${++counter}-${Math.random().toString(36).substring(2, 9)}`)
};
