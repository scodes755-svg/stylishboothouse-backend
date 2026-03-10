require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");

const app = express();

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((error) => {
        console.log("MongoDB connection error:", error);
    });

// ======================
// MIDDLEWARE
// ======================
app.use(cors({
    origin: "*" // allow all domains
}));
app.use(express.json());

// Serve frontend files (index.html, payment.html, etc.)
app.use(express.static(path.join(__dirname)));

// // ======================
// // EMAIL TRANSPORTER
// // ======================
// const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS
//     },
// });

// // Verify transporter
// transporter.verify((error) => {
//     if (error) {
//         console.log("Email Config Error:", error);
//     } else {
//         console.log("Email server ready ✅");
//     }
// });

// // ======================
// // PLACE ORDER
// // ======================
// app.post("/order", async (req, res) => {
//     try {
//         const order = req.body;

//         if (!order?.customer || !order?.items?.length) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid order data"
//             });
//         }

//         const mailOptions = {
//             from: process.env.EMAIL_USER,
//             to: process.env.EMAIL_USER,
//             subject: "🛒 New Order Received",
//             html: `
//                 <h2>New Order</h2>
//                 <p><strong>Name:</strong> ${order.customer.name}</p>
//                 <p><strong>Email:</strong> ${order.customer.email}</p>
//                 <p><strong>Address:</strong> ${order.customer.address}</p>
//                 <p><strong>Apartment:</strong> ${order.customer.apartment || "—"}</p>
//                 <p><strong>Payment Method:</strong> ${order.payment?.method}</p>
//                 <p><strong>Transaction ID:</strong> ${order.payment?.transactionId || "N/A"}</p>
//                 <h3>Total: Rs ${order.total}</h3>
//                 <h3>Items:</h3>
//                 <ul>
//                     ${order.items.map(i =>
//                 `<li>${i.name} (${i.color || "—"}, ${i.size || "—"}) × ${i.qty} = Rs ${i.price * i.qty}</li>`).join("")}
//                 </ul>
//             `
//         };

//         await transporter.sendMail(mailOptions);

//         res.json({
//             success: true,
//             message: "Order placed successfully"
//         });

//     } catch (error) {
//         console.error("ORDER ERROR:", error);
//         res.status(500).json({
//             success: false,
//             message: "Server error"
//         });
//     }
// });

// ======================
// CONTACT FORM
// ======================
app.post("/contact", async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: `Contact Form: ${subject || "No Subject"}`,
            html: `
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong> ${message}</p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.json({ success: true });

    } catch (error) {
        console.error("CONTACT ERROR:", error);
        res.status(500).json({ success: false });
    }
});

// ======================
// START SERVER
// ======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});