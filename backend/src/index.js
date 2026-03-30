const { spawn } = require('child_process');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'backend', timestamp: new Date().toISOString() });
});

app.get('/api/ping', (_req, res) => {
  res.json({ message: 'pong' });
});

app.post('/analyze-ingredients', upload.single('image'), (req, res) => {
  const imagePath = req.file.path;
  const requirements = req.body.requirements || '';

  const scriptPath = path.join(__dirname, 'scripts', 'ingredient_analyzer.py');
  const pythonBin = path.join(__dirname, '../../venv/bin/python');
  const pythonProcess = spawn(pythonBin, [
    scriptPath,
    imagePath,
    '--requirements', requirements,
  ]);

  let stdout = '';
  let stderr = '';

  pythonProcess.stdout.on('data', (data) => { stdout += data.toString(); });
  pythonProcess.stderr.on('data', (data) => { stderr += data.toString(); });

  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      return res.status(500).json({ error: stderr || 'Script failed' });
    }
    res.json({ result: stdout });
  });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
