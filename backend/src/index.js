const { spawn } = require('child_process');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

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

app.post('/analyze-ingredients', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file received. Expected field name: "image"' });
  }
  const imagePath = req.file.path;
  const requirements = req.body.requirements || '';

  const allergies = req.body.allergies || '';
  const meal = req.body.meal || '';
  const goal = req.body.goal || '';

  console.log(`[analyze-ingredients] image=${imagePath} requirements="${requirements}" allergies="${allergies}" meal="${meal}" goal="${goal}"`);

  const scriptPath = path.join(__dirname, 'scripts', 'ingredient_analyzer.py');
  
  const isWindows = process.platform === "win32";
  const pythonBin = isWindows 
    ? path.join(__dirname, '../../venv/Scripts/python.exe') 
    : path.join(__dirname, '../../venv/bin/python');

//  const pythonBin = path.join(__dirname, '../../venv/bin/python');
  const pythonProcess = spawn(pythonBin, [
    scriptPath,
    imagePath,
    '--requirements', requirements,
    '--allergies', allergies,
    '--meal', meal,
    '--goal', goal,
  ]);

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
