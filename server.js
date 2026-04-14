require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");

const app = express();

// ======================
// 1. MIDDLEWARE
// ======================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
    description: String // Added this
});
const Product = mongoose.model("Product", productSchema);

// ======================
// 4. NODEMAILER SETUP
// ======================
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // Make sure this is the 16-digit App Password!
    }
});

// Verify Transporter (Check if email is ready)
transporter.verify((error, success) => {
    if (error) {
        console.log("❌ Email Setup Error:", error);
    } else {
        console.log("📧 Email Server is ready to send messages");
    }
});

// ======================
// 5. ROUTES
// ======================

app.get('/api/health', (req, res) => res.send("Server is running fine!"));

app.get('/api/get-all-products', async (req, res) => {
    try {
        const allProducts = await Product.find();
        res.json(allProducts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/add-product', async (req, res) => {
    try {
        const { title, price, image, category, description } = req.body;
        const newProduct = new Product({
            title,
            price: Number(price),
            image,
            category,
            description
        });
        await newProduct.save();
        res.status(200).json({ success: true });
    } catch (err) {
        console.log("❌ Add Product Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.delete('/api/delete-product/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Product deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/get-orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/order", async (req, res) => {
    try {
        const orderData = req.body;
        if (!orderData.items || orderData.items.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty" });
        }

        const newOrder = new Order(orderData);
        await newOrder.save();
        console.log("✅ Order saved in Database");

        const itemsDetail = orderData.items.map(item => `- ${item.name} (Rs ${item.price})`).join('\n');

        const mailOptions = {
            from: `"Stylish Boot House" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: `👟 New Order from ${orderData.customer.name}`,
            text: `Details:\n\nCustomer: ${orderData.customer.name}\nPhone: ${orderData.customer.phone}\nAddress: ${orderData.customer.address}\n\nItems:\n${itemsDetail}\n\nTotal: Rs ${orderData.total}`
        };

        // Ab hum email ka wait karenge
        try {
            await transporter.sendMail(mailOptions);
            console.log("📧 Admin Email Sent Successfully!");
        } catch (emailErr) {
            console.log("❌ Nodemailer Error Detail:", emailErr.message);
        }

        res.status(200).json({ success: true, message: "Mubarak ho! Order place ho gaya." });

    } catch (error) {
        console.error("❌ Final Error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server is alive on port ${PORT}`);
});
