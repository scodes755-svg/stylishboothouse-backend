require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");

const app = express();

// ======================
// 1. MIDDLEWARE (Sabse Aham)
// ======================
app.use(cors()); // Isay simple rakhte hain taake block na ho
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Folders
app.use(express.static(path.join(__dirname)));
app.use(express.static('public'));
app.use('/images', express.static('images'));

// ======================
// 2. DATABASE CONNECTION
// ======================
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("🚀 MongoDB connected successfully"))
    .catch(err => console.log("❌ MongoDB Error:", err));

// ======================
// 3. DATABASE MODELS
// ======================
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
// 4. NODEMAILER (Email Setup)
// ======================
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// ======================
// 5. ROUTES
// ======================

// Server Check
app.get('/api/health', (req, res) => res.send("Server is running fine!"));

// Products API
app.get('/api/get-all-products', async (req, res) => {
    try {
        const allProducts = await Product.find();
        res.json(allProducts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ======================
// 5.1 PRODUCT MANAGEMENT ROUTES (Ye Missing Tha!)
// ======================

// 1. Add New Product
app.post('/api/add-product', async (req, res) => {
    try {
        console.log("📥 Adding Product:", req.body);
        const { title, price, image, category } = req.body;

        if (!title || !price || !image) {
            return res.status(400).json({ success: false, message: "Missing fields" });
        }

        const newProduct = new Product({
            title,
            price: Number(price),
            image,
            category
        });

        await newProduct.save();
        console.log("✅ Product Saved!");
        res.status(200).json({ success: true, message: "Product added successfully!" });
    } catch (err) {
        console.error("❌ Add Product Error:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

// 2. Delete Product
app.delete('/api/delete-product/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Product deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 3. Get All Orders (Admin Dashboard ke liye)
app.get('/api/get-orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- CHECKOUT / ORDER (The Main Part) ---
app.post("/order", async (req, res) => {
    try {
        console.log("📦 Order data received:", req.body);
        const orderData = req.body;

        // Validation: Check karein ke items hain ya nahi
        if (!orderData.items || orderData.items.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty" });
        }

        // 1. Save to MongoDB
        const newOrder = new Order(orderData);
        await newOrder.save();
        console.log("✅ Order saved in Database");

        // 2. Send Email (Independently)
        const itemsDetail = orderData.items.map(item => `- ${item.name} (Rs ${item.price})`).join('\n');

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Aapko email milegi
            subject: `👟 New Order: ${orderData.customer.name}`,
            text: `Details:\n\nCustomer: ${orderData.customer.name}\nPhone: ${orderData.customer.phone}\nAddress: ${orderData.customer.address}\n\nItems:\n${itemsDetail}\n\nTotal: Rs ${orderData.total}`
        };

        // Email bhejte waqt wait nahi karenge taake response foran chala jaye
        transporter.sendMail(mailOptions).catch(err => console.log("📧 Email failed but order saved:", err.message));

        // 3. Send Success Response to Browser
        res.status(200).json({
            success: true,
            message: "Mubarak ho! Order place ho gaya."
        });

    } catch (error) {
        console.error("❌ Final Error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server internal error: " + error.message
        });
    }
});

// ======================
// 6. START SERVER
// ======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server is alive on port ${PORT}`);
});
