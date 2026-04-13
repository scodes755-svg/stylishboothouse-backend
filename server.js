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
app.use(cors());
app.use(express.json());
// Files serve karne ke liye (Static folders)
app.use(express.static(path.join(__dirname)));
app.use(express.static('public'));
// Ye line Express ko batati hai ke 'images' folder ke andar ki files public hain
app.use('/images', express.static('images'));

// ======================
// DATABASE CONNECTION
// ======================
const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000
        });
        console.log("🚀 MongoDB connected successfully");

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`✅ Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.log("❌ MongoDB connection error:", error);
        process.exit(1);
    }
};

startServer();

// ======================
// DATABASE MODELS (Schemas)
// ======================

// 1. Order Model
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
const Order = mongoose.model("Order", orderSchema);

// 2. Product Model
const productSchema = new mongoose.Schema({
    title: String,
    price: Number,
    image: String,
    category: String,
});
const Product = mongoose.model("Product", productSchema);

// ======================
// NODEMAILER SETUP
// ======================
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: { rejectUnauthorized: false }
});

transporter.verify((error) => {
    if (error) console.log("❌ SMTP Connection Error:", error.message);
    else console.log("🚀 SMTP Server Ready! Email system active.");
});

// ======================
// ROUTES (Backend Logic)
// ======================

// --- A. ADMIN PANEL ROUTES ---

// 1. Naya Product ADD karna
app.post('/api/add-product', async (req, res) => {
    try {
        console.log("📥 Incoming Data:", req.body); // Check karne ke liye ke data aa raha hai
        const newProduct = new Product(req.body);
        await newProduct.save();
        console.log("🚀 Product saved successfully:", req.body.title);
        res.status(200).json({ success: true, message: "Product Add Hogya!" });
    } catch (err) {
        console.log("❌ DB Save Error:", err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// 2. Saare Products GET karna (Inventory list ke liye)
app.get('/api/get-all-products', async (req, res) => {
    try {
        const allProducts = await Product.find();
        res.json(allProducts);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Ek specific product ki details GET karna
app.get('/api/get-product/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).send("Product nahi mila");
        res.json(product);
    } catch (err) {
        res.status(500).send("Error fetching product");
    }
});

// 3. Product DELETE karna
app.delete('/api/delete-product/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.send({ success: true, message: "Deleted" });
    } catch (err) {
        res.status(500).send(err);
    }
});

// 4. Saare Orders GET karna (Admin Dashboard ke liye)
app.get('/api/get-orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: "Orders fetch nahi ho sakay" });
    }
});

// --- B. FRONTEND ORDER ROUTE ---

app.post("/order", async (req, res) => {
    console.log("📥 New Order Request Received");
    try {
        const orderData = req.body;

        // Database mein save karein
        const newOrder = new Order(orderData);
        await newOrder.save();

        // Email ki tayari
        const itemsDetail = orderData.items.map(item =>
            `- ${item.name} | Qty: ${item.qty} | Rs ${item.price}`
        ).join('\n');

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: `🔥 NEW ORDER: ${orderData.customer.name}`,
            text: `New Order Alert!\n\nName: ${orderData.customer.name}\nPhone: ${orderData.customer.phone}\nAddress: ${orderData.customer.address}\n\nItems:\n${itemsDetail}\n\nTotal: Rs ${orderData.total}`
        };

        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: "Order Received & Email Sent!" });

    } catch (error) {
        console.log("❌ Order Error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

