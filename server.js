require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");

const app = express();

console.log("DEBUG -> Email:", process.env.EMAIL_USER);
console.log("DEBUG -> Pass:", process.env.EMAIL_PASS ? "Loaded" : "Not Loaded");

// ======================
// DATABASE CONNECTION
// ======================
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((error) => {
        console.log("MongoDB connection error:", error);
    });

// 🛑 YE HISSA ZAROORI HAI (Schema Define Karna)
const orderSchema = new mongoose.Schema({
    customer: {
        name: String,
        email: String,
        phone: String,
        address: String,
        apartment: String
    },
    items: Array,
    total: Number,
    payment: {
        method: String,
        transactionId: String
    },
    createdAt: { type: Date, default: Date.now }
});

// Model create karna
const Order = mongoose.model("Order", orderSchema);

// ======================
// MIDDLEWARE (YE DO LINES ZAROORI HAIN!)
// ======================
app.use(cors()); // Doosre domains/ports se request allow karne ke liye
app.use(express.json()); // Frontend se aane wale JSON data ko parhne ke liye
app.use(express.static(path.join(__dirname))); // Static files (HTML, CSS, JS) serve karne ke liye

// 1. Purana setupTransporter() wala hissa yahan se hata dein

// 2. Naya "FINAL SMTP SETUP" yahan paste karein:
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

// ✅ Ye check karna zaroori hai (Pata chalega ke password sahi hai ya nahi)
transporter.verify(function (error, success) {
    if (error) {
        console.log("❌ SMTP Connection Error (App Password check karein):", error.message);
    } else {
        console.log("🚀 SMTP Server Connect Ho Gaya! Email ab jayegi.");
    }
});

// ======================
// START SERVER
// ======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Test email route
app.get("/test-email", (req, res) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: "Test Email",
        text: "This is a test email from server."
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log("Test EMAIL FAILED:", error.message);
            res.send("Email failed: " + error.message);
        } else {
            console.log("Test EMAIL SENT:", info.response);
            res.send("Email sent successfully!");
        }
    });
});

// ==========================================
// 🚀 UPDATED ORDER ROUTE (Sahi Backticks ke sath)
// ==========================================
app.post("/order", async (req, res) => {
    console.log("1. 📥 Order Request Aayi Hai!"); // Check 1

    try {
        const orderData = req.body;
        console.log("2. 📦 Data Received:", orderData.customer.name); // Check 2

        // Database mein save (Mongoose)
        const newOrder = new Order(orderData);
        await newOrder.save();
        console.log("3. ✅ Database: Order Saved"); // Check 3

        // 🛍️ Items ki list banane ke liye
        const itemsDetail = orderData.items.map(item =>
            `- ${item.name} | Qty: ${item.qty} | Color: ${item.color} | Rs ${item.price}`
        ).join('\n');

        // 📧 Email Details (Updated Version)
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            replyTo: orderData.customer.email,
            subject: `🔥 NEW ORDER: ${orderData.customer.name}`,
            text: `New Order on Stylish Boot House!

Naam: ${orderData.customer.name}
Email: ${orderData.customer.email || 'N/A'}
Address: ${orderData.customer.address}
Apartment: ${orderData.customer.apartment || 'N/A'}
Phone: ${orderData.customer.phone || 'N/A'}

${itemsDetail}

💰 TOTAL: Rs ${orderData.total}
💳 PAYMENT: ${orderData.payment ? orderData.payment.method : 'N/A'}

Check the dashboard or contact the customer!`
        };

        console.log("4. 📧 Nodemailer: Email preparing..."); // Check 4

        // 🚀 YE LINE SABSE ZAROORI HAI (Await ke sath)
        const info = await transporter.sendMail(mailOptions);

        console.log("5. ✅ SUCCESS: Email Sent! ID:", info.messageId); // Check 5

        res.json({ success: true, message: "Order Received & Email Sent!" });

    } catch (error) {
        console.log("❌ ERROR:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});
