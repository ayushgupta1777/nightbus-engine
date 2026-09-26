const { app } = require('./server');
let found = false;
app._router.stack.forEach(mw => {
  if (mw.name === 'router') {
    mw.handle.stack.forEach(h => {
      if (h.route) {
        const path = (mw.regexp.source || '') + h.route.path;
        if (path.includes('lock-seats')) {
          console.log('FOUND ROUTE:', path, Object.keys(h.route.methods));
          found = true;
        }
      }
    });
  }
});
if (!found) console.log('ROUTE NOT FOUND');
process.exit(0);
