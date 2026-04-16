require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");

const app = express();

// ======================
// 1. MIDDLEWARE & CORS FIX
// ======================
app.use(cors({
    origin: "*", 
    methods: ["GET", "POST", "DELETE"], // DELETE yahan add kar diya hai
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(process.cwd(), 'public'))); 
app.use(express.static(process.cwd())); 
app.use('/images', express.static(path.join(process.cwd(), 'images')));

// ======================
// 2. DATABASE CONNECTION
// ======================
mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000
})
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
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// ======================
// 5. ROUTES
// ======================

// --- GET ALL PRODUCTS ---
app.get('/api/get-all-products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- ADD PRODUCT (For Admin Panel) ---
app.post('/api/add-product', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(200).json({ success: true, message: "Product added!" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// --- DELETE PRODUCT (For Admin Panel) ---
app.delete('/api/delete-product/:id', async (req, res) => {
    try {
        const result = await Product.findByIdAndDelete(req.params.id);
        if (result) {
            res.status(200).json({ success: true, message: "Product deleted!" });
        } else {
            res.status(404).json({ success: false, message: "Product not found" });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// --- PLACE ORDER ---
app.post("/order", async (req, res) => {
    try {
        const orderData = req.body;
        const newOrder = new Order(orderData);
        await newOrder.save();

        const itemsDetail = orderData.items.map(i => `- ${i.name} (Rs ${i.price})`).join('\n');
        const mailOptions = {
            from: `"Stylish Order" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: `👟 New Order: ${orderData.customer.name}`,
            text: `Customer: ${orderData.customer.name}\nPhone: ${orderData.customer.phone}\n\nItems:\n${itemsDetail}\n\nTotal: Rs ${orderData.total}`
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: "Order Placed!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Front-end serve karne ke liye static middleware se handle ho jayega

// ======================
// 6. START SERVER
// ======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Stylish Boot House is Live on Port ${PORT}`);
});
