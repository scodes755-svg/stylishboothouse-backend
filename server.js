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

// 1. Email Transporter Setup (Test account for debugging)
let transporter;
async function setupTransporter() {
    // For testing, use Ethereal
    let testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass
        }
    });
    console.log("Test email account:", testAccount.user);
    console.log("Test email URL:", nodemailer.getTestMessageUrl(testAccount));
}
setupTransporter();

// ==========================================
// 🚀 UPDATED ORDER ROUTE (Sahi Backticks ke sath)
// ==========================================
app.post("/order", async (req, res) => {
    try {
        const orderData = req.body;

        // 1. Database mein save karein
        const newOrder = new Order(orderData);
        const savedOrder = await newOrder.save();
        const orderId = savedOrder._id.toString().slice(-6).toUpperCase();

        console.log(`📦 Order saved in DB! ID: ${orderId}`);

        // 2. Email Body
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Apne aap ko email bhejna (Admin ke liye)
            replyTo: orderData.customer.email,
            subject: `🔥 NAYA ORDER: ${orderId} - ${orderData.customer.name}`,
            text: `Order ID: ${orderId}\n\nCustomer Details:\nName: ${orderData.customer.name}\nEmail: ${orderData.customer.email}\nPhone: ${orderData.customer.phone}\nAddress: ${orderData.customer.address}\nApartment: ${orderData.customer.apartment}\n\nTotal: Rs ${orderData.total}\nPayment Method: ${orderData.payment.method}\nTransaction ID: ${orderData.payment.transactionId}\n\nOrder Placed At: ${savedOrder.createdAt}`
        };

        // 3. Email bhejne ka code (Fire and forget, taake block na ho)
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("📧 ❌ EMAIL FAILED:", error.message);
            } else {
                console.log("📧 ✅ EMAIL SENT:", info.response);
                console.log("Test email URL:", nodemailer.getTestMessageUrl(info));
            }
        });

        res.json({ success: true, message: "Order Received!" });

    } catch (error) {
        console.error("❌ SERVER ERROR:", error);
        res.status(500).json({ success: false, message: error.message });
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
