const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only JPEG/PNG images are allowed'));
  },
});

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// In-memory storage for listings (replace with a database in production)
let listings = [];

// Endpoint to fetch listings
app.get('/listings', (_req, res) => {
  res.json(listings);
});

// Endpoint to add a new listing with images
app.post('/listings', upload.array('images', 5), (req, res) => {
  try {
    const { title, type, breed, age, weight, price, location, description, forEid } = req.body;
    const imageUrls = req.files ? req.files.map((file) => `/uploads/${file.filename}`) : [];

    const newListing = {
      id: listings.length + 1,
      title,
      type,
      breed,
      age: parseInt(age) || undefined,
      weight: parseInt(weight) || undefined,
      price: parseInt(price) || undefined,
      location,
      description,
      images: imageUrls,
      status: 'active',
      listed: new Date().toISOString(),
      rating: 4.5,
      forEid: forEid === 'true',
    };

    listings.push(newListing);
    res.status(201).json(newListing);
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

const start = () => {
  try {
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();