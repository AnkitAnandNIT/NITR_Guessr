/* app.js - NITR GeoGuess frontend (Vanilla JS + Leaflet) */

/* ----------------- Utility functions ----------------- */
function shuffle(arr){
  for(let i=arr.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]] = [arr[j],arr[i]];
  }
  return arr;
}

function haversineDistance(lat1, lon1, lat2, lon2){
  const R = 6371e3; // meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2)*Math.sin(Δφ/2) +
            Math.cos(φ1)*Math.cos(φ2) *
            Math.sin(Δλ/2)*Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function calculateScore(d){
  if(d <= 10) return 500;
  if(d >= 250) return 0;
  return Math.round(500 * (1 - (d - 10)/240));
}

/* ----------------- DOM elements ----------------- */
const currentImage = document.getElementById('currentImage');
const submitGuessBtn = document.getElementById('submitGuess');
const skipBtn = document.getElementById('skipBtn');
const roundNumSpan = document.getElementById('roundNum');
const totalScoreSpan = document.getElementById('totalScore');
const lastResult = document.getElementById('lastResult');
const gameEndFooter = document.getElementById('gameEnd');
const finalSummary = document.getElementById('finalSummary');
const playAgainBtn = document.getElementById('playAgain');
const playerNameInput = document.getElementById('playerName');
const saveScoreBtn = document.getElementById('saveScoreBtn');
const topScoresList = document.getElementById('topScores');

/* ----------------- Game state ----------------- */
let imageList = [];
let gameImages = [];
const totalRounds = 5;
let currentRound = 0;
let totalScore = 0;
let userMarker = null;
let actualMarker = null;
let connectingLine = null;

/* ----------------- Leaflet map ----------------- */
/* Center map roughly on NIT Rourkela campus. Adjust if you want a different center/zoom. */
const campusCenter = [22.2504, 84.9014];
let map = L.map('map', {zoomControl:true}).setView(campusCenter, 17);

/* Tile layer - OpenStreetMap */
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 20,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Force fix broken tiles
setTimeout(() => {
  map.invalidateSize(true);
}, 500);

/* Click to place guess marker */
map.on('click', function(e){
  placeUserMarker(e.latlng);
  submitGuessBtn.disabled = false;
});

/* place marker */
function placeUserMarker(latlng){
  if(userMarker) map.removeLayer(userMarker);
  userMarker = L.marker(latlng, {title:'Your guess'}).addTo(map);
}

/* Load images.json */
async function loadImages(){
  try{
    const res = await fetch('images.json');
    imageList = await res.json();
    if(!Array.isArray(imageList) || imageList.length === 0){
      alert('images.json is empty or malformed. Add image entries with filename, lat, lng.');
      return;
    }
    startGame();
  }catch(e){
    console.error(e);
    alert('Failed to load images.json. Check console.');
  }
}

/* Start a new game */
function startGame(){
  // pick random unique images
  gameImages = shuffle([...imageList]).slice(0, totalRounds);
  currentRound = 0;
  totalScore = 0;
  totalScoreSpan.textContent = totalScore;
  roundNumSpan.textContent = currentRound;
  gameEndFooter.classList.add('hidden');
  nextRound();
}

/* Move to next round */
function nextRound(){
  // cleanup markers/lines
  if(userMarker){ map.removeLayer(userMarker); userMarker = null; }
  if(actualMarker){ map.removeLayer(actualMarker); actualMarker = null; }
  if(connectingLine){ map.removeLayer(connectingLine); connectingLine = null; }

  if(currentRound >= totalRounds){
    endGame();
    return;
  }
  // increment round
  currentRound++;
  roundNumSpan.textContent = currentRound;
  lastResult.textContent = '';
  submitGuessBtn.disabled = true;

  // set image
  const entry = gameImages[currentRound - 1];
  currentImage.src = `images/${entry.filename}`;
  currentImage.alt = entry.label || '';
  // optionally center map on campus (helps the player)
  map.setView(campusCenter, 17);
}

/* Submit guess handler */
submitGuessBtn.addEventListener('click', function(){
  if(!userMarker){
    alert('Place your guess on the map by clicking on it first.');
    return;
  }

  const entry = gameImages[currentRound - 1];
  const actual = [entry.lat, entry.lng];
  const guessed = [userMarker.getLatLng().lat, userMarker.getLatLng().lng];

  const d = haversineDistance(actual[0], actual[1], guessed[0], guessed[1]); // meters
  const score = calculateScore(d);

  // show actual marker and line
  actualMarker = L.marker(actual, {title: 'Actual location', opacity:0.9}).addTo(map);
  connectingLine = L.polyline([guessed, actual], {dashArray:'5,8'}).addTo(map);

  // fit bounds a little padding
  const bounds = L.latLngBounds([guessed, actual]).pad(0.3);
  map.fitBounds(bounds);

  // update scoreboard
  totalScore += score;
  totalScoreSpan.textContent = totalScore;

  // show textual feedback
  lastResult.innerHTML = `Distance: ${Math.round(d)} m — Points: ${score} <br/><small>${entry.label || ''}</small>`;

  // disable submit until next round
  submitGuessBtn.disabled = true;

  // small delay then move to next round
  setTimeout(()=>{
    nextRound();
  }, 1800);
});

/* Skip handler - treat as 0 points but reveal actual location */
skipBtn.addEventListener('click', function(){
  if(confirm('Skip this round? You will get 0 points for it.')){
    // reveal actual but do not award points
    const entry = gameImages[currentRound - 1];
    if(actualMarker) map.removeLayer(actualMarker);
    actualMarker = L.marker([entry.lat, entry.lng]).addTo(map);
    map.setView([entry.lat, entry.lng], 18);
    setTimeout(()=> nextRound(), 1500);
  }
});

/* End game */
function endGame(){
  finalSummary.innerHTML = `Game over — your total score: <strong>${totalScore}</strong> (5 rounds)`;
  gameEndFooter.classList.remove('hidden');
  
}

/* Play again */
playAgainBtn.addEventListener('click', function(){
  startGame();
});



/* initial load */
loadImages();

