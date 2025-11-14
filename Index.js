// index.js
const express = require('express');
const crypto = require('crypto');
const morgan = require('morgan');

const app = express();
app.use(morgan('combined'));

// Optional: set your PAYMENTWALL_SECRET in Render environment variables
const PAYMENTWALL_SECRET = process.env.PAYMENTWALL_SECRET || '';

/*
  IMPORTANT:
  For initial testing we reply "OK" for any request so Paymentwall test passes.
  Later you should enable signature verification using PAYMENTWALL_SECRET and the expected algorithm.
*/

app.get('/pingback', (req, res) => {
  // Log the full query for inspection (you can later forward to DB)
  console.log('Paymentwall pingback received:', {
    query: req.query,
    headers: req.headers,
    timestamp: new Date().toISOString(),
  });

  // OPTIONAL: signature verification (disabled by default)
  if (PAYMENTWALL_SECRET && req.query.sign) {
    try {
      // Example: if your Paymentwall integration requires computing SHA256 over
      // a base string, implement the exact algorithm Paymentwall documents.
      // This is a placeholder showing how you'd compute an HMAC using the secret:
      // const computed = crypto.createHmac('sha256', PAYMENTWALL_SECRET).update(buildBaseString(req.query)).digest('hex');
      // if (computed !== req.query.sign) {
      //   console.warn('Invalid signature — rejecting');
      //   return res.status(400).send('INVALID_SIGNATURE');
      // }
      // NOTE: Please replace the above with Paymentwall's documented algorithm
      // for sign_version=3 or whichever version you use.
    } catch (err) {
      console.error('Signature check error', err);
      return res.status(500).send('ERROR');
    }
  }

  // Respond exactly with OK (plain text) — Paymentwall expects this.
  res.set('Content-Type', 'text/plain');
  res.status(200).send('OK');
});

// healthcheck
app.get('/.well-known/health', (req, res) => res.send('alive'));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Paymentwall pingback app listening on port ${port}`);
});
