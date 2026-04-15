require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");

const app = express();

// ======================
// 1. MIDDLEWARE & STATIC FILES (Sabse Pehle)
// ======================
app.use(cors({
    origin: ["https://stylishboothouse.store", "http://localhost:3000"],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CSS aur Images ke liye ye order zaroori hai
app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// ======================
// 2. DATABASE CONNECTION
// ======================
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("🚀 MongoDB Atlas Connected"))
    .catch(err => console.error("❌ DB Error:", err));

// ======================
// 3. MODELS
// ======================
const orderSchema = new mongoose.Schema({
    customer: { name: String, email: String, phone: String, address: String },
    items: Array,
    total: Number,
    createdAt: { type: Date, default: Date.now }
});
const Order = mongoose.model("Order", orderSchema);

const productSchema = new mongoose.Schema({
    title: String, price: Number, image: String, category: String, description: String
});
const Product = mongoose.model("Product", productSchema);

// ======================
// 4. NODEMAILER SETUP
// ======================
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

// ======================
// 5. ROUTES
// ======================

app.get('/api/get-all-products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/order", async (req, res) => {
    try {
        const orderData = req.body;
        const newOrder = new Order(orderData);
        await newOrder.save();

        const itemsDetail = orderData.items.map(i => `- ${i.name} (Rs ${i.price})`).join('\n');
        const mailOptions = {
            from: `"Stylish Boot House" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: `👟 Naya Order: ${orderData.customer.name}`,
            text: `Customer: ${orderData.customer.name}\nPhone: ${orderData.customer.phone}\n\nItems:\n${itemsDetail}\n\nTotal: Rs ${orderData.total}`
        };

        try {
            await transporter.sendMail(mailOptions);
        } catch (mailErr) {
            console.log("Email Error:", mailErr.message);
        }

        res.status(200).json({ success: true, message: "Order placed successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Front-end serve karne ke liye (API routes ke baad rakhen)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ======================
// 6. START SERVER
// ======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Stylish Boot House is Live on Port ${PORT}`);
});
