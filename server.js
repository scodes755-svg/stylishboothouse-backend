require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");

const app = express();

// ======================
// MIDDLEWARE
// ======================
app.use(cors({
    origin: "*", // Ye har jagah se request allow karega, live site ke liye best hai
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.use(express.static('public'));
app.use('/images', express.static('images'));

// ======================
// DATABASE CONNECTION (START SERVER)
// ======================
const startServer = async () => {
    try {
        // Render/Vercel par MONGO_URI dashboard se aayega
        await mongoose.connect(process.env.MONGO_URI);
        console.log("🚀 MongoDB connected successfully");

        // PORT: Ye line live server ke liye sabse zaroori hai
        const PORT = process.env.PORT || 3000;

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`✅ Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.log("❌ MongoDB connection error:", error);
        process.exit(1);
    }
};

// Yahan server ko call karna zaroori hai
startServer();

// ======================
// DATABASE MODELS
// ======================
const orderSchema = new mongoose.Schema({
    customer: { name: String, email: String, phone: String, address: String, apartment: String },
    items: Array,
    total: Number,
    payment: { method: String, transactionId: String },
    createdAt: { type: Date, default: Date.now }
});
const Order = mongoose.model("Order", orderSchema);

const productSchema = new mongoose.Schema({
    title: String,
    price: Number,
    image: String,
    category: String,
});
const Product = mongoose.model("Product", productSchema);

// ======================
// NODEMAILER
// ======================
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// ======================
// ROUTES
// ======================

// API Check
app.get('/api/health', (req, res) => res.send("Server is alive!"));

// 1. Add Product
app.post('/api/add-product', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 2. Get All Products
app.get('/api/get-all-products', async (req, res) => {
    try {
        const allProducts = await Product.find();
        res.json(allProducts);
    } catch (err) {
        res.status(500).send(err);
    }
});

// 3. Get Single Product
app.get('/api/get-product/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        res.json(product);
    } catch (err) {
        res.status(500).send("Error");
    }
});

// 4. Delete Product
app.delete('/api/delete-product/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.send({ success: true });
    } catch (err) {
        res.status(500).send(err);
    }
});

// 5. Get Orders
app.get('/api/get-orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: "Failed" });
    }
});

// 6. Checkout / Order
app.post("/order", async (req, res) => {
    try {
        const orderData = req.body;
        const newOrder = new Order(orderData);
        await newOrder.save();

        const itemsDetail = orderData.items.map(item => `- ${item.name} | Rs ${item.price}`).join('\n');

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: `🔥 NEW ORDER: ${orderData.customer.name}`,
            text: `Order Details:\n\n${itemsDetail}\n\nTotal: Rs ${orderData.total}`
        };

        await transporter.sendMail(mailOptions);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
