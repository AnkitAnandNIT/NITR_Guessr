// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'scores.json');

app.use(express.static('public'));

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// simple CORS for local dev (if needed)
app.use((req,res,next)=>{
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if(req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

function readScores(){
  try{
    if(!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([],'',2));
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  }catch(e){
    console.error('Failed to read scores:', e);
    return [];
  }
}

function writeScores(arr){
  try{
    fs.writeFileSync(DATA_FILE, JSON.stringify(arr, null, 2), 'utf8');
  }catch(e){
    console.error('Failed to write scores:', e);
  }
}

app.get('/scores', (req,res)=>{
  const data = readScores();
  // sort by score desc
  data.sort((a,b)=>b.score - a.score);
  res.json(data);
});

app.post('/scores', (req,res)=>{
  const { name, score, date } = req.body || {};
  if(typeof score !== 'number' || !name) {
    return res.status(400).json({error:'invalid payload'});
  }
  const data = readScores();
  data.push({ name: String(name).slice(0,64), score: Number(score), date: date || new Date().toISOString() });
  // keep top 100 only
  data.sort((a,b)=>b.score - a.score);
  const trimmed = data.slice(0, 200);
  writeScores(trimmed);
  res.json(trimmed);
});

app.listen(PORT, ()=>{
  console.log(`Server running at http://localhost:${PORT}`);
});
