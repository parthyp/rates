// server.js
const express = require("express");
const fetch = require("node-fetch"); // v2
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Allow all origins (for testing)
app.use(cors({ origin: "*" }));

const locationKey = "g31407";
const checkIn = "2026-01-19";
const checkOut = "2026-01-20";

// Endpoint to get sorted Booking.com rates
app.get("/booking-rates", async (req, res) => {
  try {
    // 1️⃣ Get hotel list
    const listResp = await fetch(`https://data.xotelo.com/api/list?location_key=${locationKey}`, {
      headers: { "accept": "application/json" }
    });
    const listData = await listResp.json();
    const hotelList = listData.result.list;

    const hotelRates = [];

    // 2️⃣ Loop through hotels and get Booking.com rates
    for (const hotel of hotelList) {
      const ratesResp = await fetch(
        `https://data.xotelo.com/api/rates?hotel_key=${hotel.key}&chk_in=${checkIn}&chk_out=${checkOut}`,
        { headers: { "accept": "application/json" } }
      );
      const ratesData = (await ratesResp.json()).result.rates;

      const bookingRateObj = ratesData.find(r => r.code === "BookingCom");
      if (bookingRateObj) {
        hotelRates.push({ name: hotel.name, rate: bookingRateObj.rate });
      }
    }

    // 3️⃣ Sort by rate ascending
    hotelRates.sort((a, b) => a.rate - b.rate);

    // 4️⃣ Send JSON to frontend
    res.json(hotelRates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch rates" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
