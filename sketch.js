function setup() {
  // create the canvas using the full browser window
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  // your cool abstract sonic artwork code goes in this draw function
  
}

// when you hit the spacebar, what's currently on the canvas will be saved (as a
// "thumbnail.png" file) to your downloads folder.
// make sure you add and commit the image to the root folder of this repo.
function keyTyped() {
  if (key === " ") {
    saveCanvas("thumbnail.png");
  }
}
