const functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
const db = admin.firestore();
const stripe = require('stripe')('sk_test_yqY1HGxVIfTXjyznM1mvt6Cc00rN6niIhc');
const express = require('express');
var cors = require('cors');
const app = express();
const auth = admin.auth();
app.use(cors({ origin: true }));
app.use(
  express.json({ verify: (req, res, buffer) => (req['rawBody'] = buffer) })
);

app.post('/Create-stripe-account', async (req, res) => {
  const email = req.body.email;
  try {
    const account = await stripe.accounts.create({
      type: 'express',
      email,
      settings: {
        payouts: {
          schedule: {
            delay_days: 7,
          },
        },
      },
    });
    console.log('accountId', account);
    res.status(200).json({
      accountId: account.id,
    });
  } catch (err) {
    console.log(err);
    res.json({
      error: err.message,
    });
  }
});

// onboard account
app.post('/Onboard-account', async (req, res) => {
  //   const account = await stripe.accounts.retrieve("acct_1KWhoY4RUp3CtuVg");
  const accountId = req.body.accountId;
  console.log('body', req.body.accountId);
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: 'http://localhost:3000/profile',
    return_url: 'http://localhost:3000/profile',
    type: 'account_onboarding',
  });
  res.status(200).json({ url: accountLink.url });
});

// retrieve the account

app.post('/balance', async (req, res) => {
  const accountid = req.body.accountId;

  // console.log('accountid', accountid);

  try {
    const account = await stripe.accounts.retrieve(accountid);

    res.status(200).json({
      Verified: account['charges_enabled'],
    });
    // console.log('retrieving the account ', account);
  } catch (error) {
    console.log(error);
  }
});

// Login to account

// Login in to connected account

app.post('/login', async (req, res) => {
  const accountid = req.body.accountId;
  console.log(accountid);

  const link = await stripe.accounts.createLoginLink(accountid);
  res.status(200).json({ loginUrl: link.url });
});
// pay
app.post('/pay', async (req, res) => {
  const price = req.body.price;
  const accountId = req.body.accountId;
  console.log(price);
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: price * 100,
      currency: 'eur',
      payment_method_types: ['card'],
      application_fee_amount: 2,
      transfer_data: { destination: accountId },
      // in metadata you can strore infos like name of the products being purchased ( send it from frontend)
      // metadata: {
      //   order_id: '6735',
      // },
    });

    // Send client and PaymentIntent details to client
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
    console.log(paymentIntent);
  } catch (e) {
    console.log(e);
    return res.status(400).send({
      error: {
        message: e.message,
      },
    });
  }
});
exports.api = functions.https.onRequest(app);
