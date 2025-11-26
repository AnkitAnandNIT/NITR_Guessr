📍 NIT Rourkela GeoGuess – Campus Location Game

A simple GeoGuessr-style web game for NIT Rourkela, where players guess the location of campus photos on an interactive map.
Built using HTML, CSS, JavaScript, and Leaflet.js.

🚀 Live Game

Play here:
(Add your GitHub Pages URL once deployed)

[https://your-username.github.io/nitr-geoguess/](https://ankitanandnit.github.io/NITR_Guessr/)

🗂️ Project Structure
/images               → All campus photos used in the game
index.html            → Main webpage
style.css             → Styling
script.js             → Game logic (map, scoring, rounds)
README.md             → This file

🎮 How the Game Works

The player is shown a random campus photo

They click on the map to guess the location

The game calculates:

Distance (Haversine formula)

Score based on distance

Five rounds → Total score displayed

Works on desktop & mobile

➕ Adding New Images (Admin Only)

Only the repository owner should modify images.

Step 1 — Add the image file

Go to the images/ folder

Click Add file → Upload files

Upload your new photo (JPG/PNG)

👉 Recommended size: 1200px width
👉 Keep filenames lowercase & without spaces (e.g., main_gate_2.jpg)

📍 Adding Coordinates for a New Image

Coordinates are defined inside script.js in the photos array.

Step 1 — Find coordinates

Use Google Maps:

Right-click on the exact location

Select “What’s here?”

Copy the latitude and longitude from the bottom popup
Example:

22.250934, 84.902152

Step 2 — Add entry in script.js

Open script.js and locate:

const photos = [
    { file: 'img1.jpg', lat: 22.2509, lng: 84.9021 },
    ...
];


Add a new object:

{
    file: 'new_photo.jpg',
    lat: 22.249832,
    lng: 84.903215
}


Make sure:
✔ file matches the filename inside /images
✔ Coordinates are accurate
✔ Use decimal format (no degrees/minutes/seconds)

🧪 Example Addition

If you upload hostel_b.jpg showing Hall 3:

{
    file: 'hostel_b.jpg',
    lat: 22.252345,
    lng: 84.901987
}


Save → Commit → GitHub Pages updates automatically.

💻 Local Development

To test locally:

Clone/download the repo

Open the folder in VS Code

Use a local server such as:

VS Code Live Server extension

Or Python Simple Server:

python -m http.server


Open:

http://localhost:8000

🌐 Deployment (GitHub Pages)

Go to Settings → Pages

Choose:

Source: Deploy from branch

Branch: main

Folder: /(root)

Save

Wait 10–20 secs → Live URL appears

🛠️ Technologies Used

Leaflet.js (Maps)

OpenStreetMap tiles

Vanilla JavaScript

HTML5 + CSS3

✨ Future Improvements (optional)

Leaderboard (Firebase)

Admin Dashboard to upload photos + coordinates

Difficulty modes (“Easy / Medium / Hard”)

Timer system per round

Smooth UI animations
