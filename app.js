// require("dotenv").config();
// const express = require("express");
// const app = express();
// const cors = require("cors");
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// app.use(
//   cors({
//     origin: "https://paymentgatewayintegration.vercel.app",
//     methods: ["GET", "POST" , "OPTIONS"],
//     credentials: true,
//   })
// );

// app.use(express.json());
// // checkout api
// app.post("/api/create-checkout-session", async (req, res) => {
//   const { products } = req.body;

//   const lineItems = products.map((product) => ({
//     price_data: {
//       currency: "inr",
//       product_data: {
//         name: product.dish,
//         images: [product.imgdata],
//       },
//       unit_amount: product.price * 100,
//     },
//     quantity: product.qnty,
//   }));

//   const session = await stripe.checkout.sessions.create({
//     payment_method_types: ["card"],
//     line_items: lineItems,
//     mode: "payment",
//     success_url: `${YOUR_DOMAIN}/success`,
//     cancel_url: `${YOUR_DOMAIN}/cancel`,
//   });

//   res.json({ id: session.id });
// });

// app.get("/", (req, res) => {
//   res.send("Welcome to the server!");
// });

// app.listen(7000, () => {
//   console.log("server start");
// });

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();

// Frontend URL (ensure this matches exactly, no trailing slash)
const YOUR_DOMAIN =
  "https://paymentgatewayintegration.vercel.app" || process.env.FRONTEND_URL;

// CORS configuration
const corsOptions = {
  origin: YOUR_DOMAIN,
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true,
};

// Apply CORS middleware
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Body parser
app.use(express.json());

// Checkout session endpoint
app.post("/api/create-checkout-session", async (req, res) => {
  try {
    const { products } = req.body;

    const lineItems = products.map((product) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: product.dish,
          images: [product.imgdata],
        },
        unit_amount: product.price * 100,
      },
      quantity: product.qnty,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${YOUR_DOMAIN}/success`,
      cancel_url: `${YOUR_DOMAIN}/cancel`,
    });

    res.status(200).json({ id: session.id });
  } catch (err) {
    console.error("Stripe session error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Health check / root endpoint
app.get("/", (req, res) => {
  res.send("Welcome to the server!");
});

// Export for Vercel; if running locally, start the server
if (require.main === module) {
  const PORT = process.env.PORT || 7000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
} else {
  module.exports = app;
}
