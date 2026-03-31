const { spawn } = require('child_process');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 3000;

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads'),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'backend', timestamp: new Date().toISOString() });
});

app.get('/api/ping', (_req, res) => {
  res.json({ message: 'pong' });
});

app.get('/api/recipes', async (req, res) => {
  try {
    const apiKey = process.env.SNOWLEOPARD_API_KEY;
    const dataFileId = process.env.SNOWLEOPARD_DATAFILE_ID;

    if (!apiKey || !dataFileId) {
      return res.status(500).json({ error: 'Missing Snowleopard API credentials' });
    }

    console.log('Fetching recipes from Snowleopard with dataFileId:', dataFileId);

    const response = await fetch(`https://api.snowleopard.ai/data/${dataFileId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Snowleopard API error: ${response.status} ${response.statusText}`);
      return res.status(response.status).json({ error: `Snowleopard API error: ${response.statusText}` });
    }

    const data = await response.json();
    console.log('Snowleopard data received:', JSON.stringify(data).substring(0, 500));
    res.json(data);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ error: 'Failed to fetch recipes', details: error.message });
  }
});

app.post('/analyze-ingredients', upload.single('image'), (req, res) => {
  const imagePath = req.file ? req.file.path : '';
  const requirements = req.body.requirements || '';

  const allergies = req.body.allergies || '';
  const meal = req.body.meal || '';
  const goal = req.body.goal || '';

  console.log(`[analyze-ingredients] image=${imagePath || '(none)'} requirements="${requirements}" allergies="${allergies}" meal="${meal}" goal="${goal}"`);

  const scriptPath = path.join(__dirname, 'scripts', 'ingredient_analyzer.py');
  const pythonBin = path.join(__dirname, '../../venv/bin/python');
  const args = [scriptPath];
  if (imagePath) {
    args.push(imagePath);
  }
  args.push('--requirements', requirements, '--allergies', allergies, '--meal', meal, '--goal', goal);
  const pythonProcess = spawn(pythonBin, args);

  let stdout = '';
  let stderr = '';

  pythonProcess.stdout.on('data', (data) => {
    process.stdout.write(data);
    stdout += data.toString();
  });
  pythonProcess.stderr.on('data', (data) => {
    process.stderr.write(data);
    stderr += data.toString();
  });

  pythonProcess.on('close', (code) => {
    console.log(`[analyze-ingredients] python exited with code ${code}`);
    if (code !== 0) {
      return res.status(500).json({ error: stderr || 'Script failed' });
    }
    res.json({ result: stdout });
  });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
