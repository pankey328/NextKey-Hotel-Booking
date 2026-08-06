const cron = require("node-cron");
const Booking = require("../models/BookingModel");
const sendMail = require("../config/nodemailer");

// Runs every night at 12:00 AM (0 0 * * *)
cron.schedule("0 0 * * *", async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiredBookings = await Booking.find({
      status: { $in: ["pending", "confirmed"] },
      checkInDate: { $lte: today },
    })
      .populate("userId", "email name")
      .populate("roomId", "roomType");

    for (const booking of expiredBookings) {
      booking.status = "rejected";
      await booking.save();

      if (booking.userId && booking.userId.email) {
        const emailBody = `
          <h2>Booking Auto-Cancelled</h2>
          <p>Dear ${booking.userId.name},</p>
          <p>Your booking request for room <b>${booking.roomId?.roomType}</b> was automatically cancelled because check-in time elapsed without confirmation/check-in.</p>
        `;
        await sendMail.sendMail(
          booking.userId.email,
          "Booking Auto-Cancelled (No Show)",
          emailBody,
        );
      }
    }
    console.log(
      `CRON: Processed ${expiredBookings.length} expired no-show bookings.`,
    );
  } catch (error) {
    console.error("CRON Error processing midnight auto-cancellations:", error);
  }
});
