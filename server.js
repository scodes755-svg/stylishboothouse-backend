require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");

const app = express();
const __dirname = path.resolve(); // Live server par path sahi rakhne ke liye

// ======================
// 1. MIDDLEWARE (Production Level)
// ======================
app.use(cors({
    origin: ["https://stylishboothouse.store", "http://localhost:3000"], // Apni live domain add karein
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Files (Sabse aham live ke liye)
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
// 4. NODEMAILER SETUP (Fixed for Live)
// ======================
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // SSL use karein
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        // Ye line live server par connection ko block hone se rokti hai
        rejectUnauthorized: false 
    }
});

// ======================
// 5. ROUTES
// ======================

// Add Product Route
app.post('/api/add-product', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get Products
app.get('/api/get-all-products', async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

// Place Order
app.post("/order", async (req, res) => {
    try {
        const orderData = req.body;
        const newOrder = new Order(orderData);
        await newOrder.save();

        // Admin Email Content
        const itemsDetail = orderData.items.map(i => `- ${i.name} (Rs ${i.price})`).join('\n');
        const mailOptions = {
            from: `"Stylish Order" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: `👟 New Order: ${orderData.customer.name}`,
            text: `Customer: ${orderData.customer.name}\nPhone: ${orderData.customer.phone}\n\nItems:\n${itemsDetail}\n\nTotal: Rs ${orderData.total}`
        };

        // Live par wait karna zaroori hai
        await transporter.sendMail(mailOptions);

        res.status(200).json({ success: true, message: "Order Placed!" });
    } catch (error) {
        console.error("Order Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ======================
// 6. START SERVER (Live Port Fix)
// ======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Stylish Boot House is Live on Port ${PORT}`);
});
