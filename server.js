const path = require('path');
const multer = require('multer');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const nano = require('nano')(process.env.COUCHDB_URL || 'http://admin:password@localhost:5984');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// ====== Multer and uploads setup ======
const uploadDir = path.join(__dirname, 'public', 'uploads');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });
// Ensure uploads directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
// ...existing code...

// ...existing code...

// ...existing code...
const app = express();
const PORT = process.env.PORT || 3000;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ensure databases exist
async function ensureDb(name) {
  try {
    await nano.db.get(name);
  } catch (err) {
    if (err.statusCode === 404) {
      await nano.db.create(name);
      console.log(`Database '${name}' created.`);
    } else {
      console.error(`Error checking database '${name}':`, err.message);
    }
  }
}

(async () => {
  await ensureDb('contacts');
  await ensureDb('portfolio');
})();

// CouchDB setup
const contactDb = nano.db.use('contacts');
const portfolioDb = nano.db.use('portfolio');

// ...existing code...
// Portfolio GET endpoint
app.get('/api/portfolio', async (req, res) => {
  try {
    const result = await portfolioDb.list({ include_docs: true });
    const items = result.rows.map(row => row.doc);
    res.json(items);
  } catch (err) {
    res.json([]);
  }
});

// Portfolio POST endpoint with image upload
app.post('/api/portfolio', upload.single('imageFile'), async (req, res) => {
  try {
    const { title, description, link } = req.body;
    let imageUrl = req.body.image || '';
    if (req.file) {
      imageUrl = '/uploads/' + req.file.filename;
    }
    const doc = { title, description, link, image: imageUrl };
    await portfolioDb.insert(doc);
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// AI Chatbot endpoint using Gemini API
app.post('/api/chat', async (req, res) => {
  try {
    const userMsg = req.body.message;

    const model = genAI.getGenerativeModel({
      model: 'gemini-3.1-flash-lite'
    });

    const result = await model.generateContent(userMsg);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });

  } catch (err) {
    console.log(err.message);
    res.json({
      reply: 'AI error: Could not connect to Gemini API.'
    });
  }
});
// Contact POST endpoint
app.post('/api/contact', async (req, res) => {
  const { name, email, message, preferredContact, subscribe } = req.body;
  const doc = { name, email, message, preferredContact, subscribe };

  // Save to CouchDB
  contactDb.insert(doc).catch(() => {}); // Ignore CouchDB errors for simplicity

  // Save to db.json
  const dbPath = path.join(__dirname, 'db.json');
  let jsonData = [];
  try {
    jsonData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  } catch (e) {
    jsonData = [];
  }
  jsonData.push(doc);
  fs.writeFileSync(dbPath, JSON.stringify(jsonData, null, 2));

  res.json({ success: true });
});

// Portfolio DELETE endpoint
app.delete('/api/portfolio/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Fetch the document to get its _rev
    const doc = await portfolioDb.get(id);
    await portfolioDb.destroy(id, doc._rev);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});