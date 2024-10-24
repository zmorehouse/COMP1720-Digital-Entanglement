// Blink Logic Refs :
// Using the handsfreejs library https://handsfreejs.netlify.app/ 
// https://storage.googleapis.com/tfjs-models/demos/facemesh/demo.fd0b9f10.js
// https://age2death.glitch.me/
// https://editor.p5js.org/golan/sketches/d-JfFcGws
// https://editor.p5js.org/bestesaylar/sketches/ogFdasRIc
// https://github.com/auduno/clmtrackr

// Init Webcam Stuff
let handsfreeTracker; 
let webcamStream;

// Various vars for blink tracking
let blinkHistory = [];
const historyLength = 320; 
let eyeOpennessAvg = 0; 
let blinkIntensity = 0; 
let blinkCount = 0;
let lastBlinkTime = 0; 
const blinkCooldown = 300; // Cooldown time in milliseconds between blinks
const spacebarCooldown = 300; // Cooldown time for spacebar presses 

// Additional Scene and Model Logic + Debugger
let currentScene = 0;
let debuggerMode = false; // Toggle for showing debug visuals
let modelLoaded = false;
let blinkDetected = false; 
let lastSpacebarPress = 0; 

// Text content and typing effect
let textIndex = 0;
let charIndex = 0; 
let typingSpeed = 0; 
let lastTypedTime = 0;
let textY;  

// Final text content and typing effect
let finalText1 = "You blinked and the world rewrote itself.";
let finalText2 = "Entangled in data streams. Are you still in control or just another line of code?";
let finalCharIndex1 = 0;
let finalCharIndex2 = 0;
let finalTypingSpeed = 50; 
let finalLastTypedTime = 0;

// Restart Button Var
let buttonX, buttonY, buttonWidth, buttonHeight;
let isHovering = false;

// Fading logic for Loading
let fadeIn = true; 
let fadeAlpha = 0; 

/*
let textLines = [
  "I wake to a world of endless screens,",
  "Another blink and pixels shift,",
  "Reality bends, digital distorts,",
  "Each moment consumed by code and light,",
  "Where is the boundary between me and machine?",
  "A final blink... is this what I am?",
  "More than a user, less than flesh,",
  "Each click a step toward the void,",
  "A labyrinth of data, and I am lost.",
  "The glow is comforting, but is it real?",
  "Consumed by connection, yet utterly alone.",
  "A ceaseless stream, always watching, always pulling.",
  "I am more than pixels, yet pixels I become.",
  "The screen is not my prison, or is it?",
  "A final blink... what do I see?"
];
*/

// Aubade by Phillip Larkin
let textLines = [
  " ",
  "I work all day and get half-drunk at night",
  "Waking at four to soundless dark I stare",
  "In time the curtain-edges will grow light",
  "Till then I see whats really always there",

  "Unresting death a whole day nearer now",
  "Making all thought impossible but how",
  "And where and when I shall myself die",
  "Arid interrogation yet the dread",
  "Of dying and being dead",

  "Clear of its wrong beginnings and may never",
  "But at the total emptiness for ever",
  "The sure extinction that we travel to",
  "And shall be lost in always Not to be here",
  "Not to be anywhere",

  "And specious stuff that says No rational being",
  "Can fear a thing it will not feel not seeing",
  "That this is what we fear no sight no sound",
  "No touch or taste or smell nothing to think with",
  "Nothing to love or link with",

  "The anaesthetic from which none come round",
  "And so it stays just on the edge of vision",
  "A small unfocused blur a standing chill",
  "That slows each impulse down to indecision",
  "Most things may never happen.",
  "This one will."
];

// Preload
function preload() {
  BusMatrixFont = loadFont('/assets/BusMatrixCondensed-Condensed.ttf');
}

// Setup Function
function setup() {
  if (debuggerMode) {
    createCanvas(640, 480);
  } else {   
    createCanvas(windowWidth, windowHeight);
  }
  
  textFont(BusMatrixFont); // Init New Font
  
  // Init Blink History
  blinkHistory = Array(historyLength).fill(0.1);

  // Set up webcam feed
  webcamStream = createCapture(VIDEO);
  webcamStream.size();
  webcamStream.hide();

  // Init handsfree.js to track face
  handsfreeTracker = new Handsfree({
    hands: false,  
    pose: false,   
    facemesh: true
  });

  handsfreeTracker.start(() => {
    modelLoaded = true; 
  });

  handsfreeTracker.hideDebugger();
}

function draw() {
  background(0);

  // If the model is still loading, display loading text
  if (!modelLoaded) {
    if (fadeIn) { // Fade in the loading
      fadeAlpha += 5; 
      if (fadeAlpha >= 255) {
        fadeIn = false; 
      }
    } else {
      fadeAlpha -= 5; 
      if (fadeAlpha <= 0) {
        fadeIn = true;
      }
    }
    fadeAlpha = constrain(fadeAlpha, 0, 255);
    fill(255, fadeAlpha); 
    textAlign(CENTER, CENTER);
    textSize(40);
    text("Loading...", width / 2, height / 2);
    return;
  }

  // Once the model is loaded, wait for a blink to continue
  if (!blinkDetected) {
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(40);
    text("Blink to begin the artwork", width / 2, height / 2);
    textSize(20);
    text("Or Press Spacebar.", width / 2, height / 2 + 50);
    processBlinkDetection();
    return;
  }

  // Once we get to the last line of text reset posterize filter and display final msg
  if (blinkCount >= 26) {
    posterizecount = 0;
    displayFinalMessage();
    return;
  }

  // Once a blink is detected, show the webcam in full screen
  if (blinkDetected) {
    drawWebcamBackground();
    processBlinkDetection();

    let faderLevel = map(blinkIntensity, 1, 0, 0, 255);
    tint(faderLevel); // Apply Tint

    stroke(255, 15); // Apply Scan Lines
    for (let y = 0; y < height; y += 5) { 
      let offset = sin((y + frameCount) * 0.1);
      line(0 + offset, y, width + offset, y); 
    }

    // Posterize the feed as the sketch goes on
    posterizecount = map(blinkCount, 0, 25, 15, 2);
    posterizecount = constrain(posterizecount, 2, 15); 
    filter(POSTERIZE, posterizecount);

    switch (currentScene) {
      case 0:
        // Scene One
      break;
      case 1:
        // Scene Two
      break;
      // Cont until 25
          
    }

    // Handle Typing Animation
    let currentText = textLines[textIndex];

    // Calculate the current time and compare with the last typed time
    if (millis() - lastTypedTime > typingSpeed) {
      if (charIndex < currentText.length) {
        charIndex++;
      }
      lastTypedTime = millis();
    }

    // Display the text progressively
    fill(255);
    textSize(32);
    textAlign(CENTER, CENTER);
    text(currentText.substring(0, charIndex), width / 2, textY);

    // Write on Blink Count
    drawBlinkCountOnWebcamFrame();
  }

  // Debugger Stuff
  if (debuggerMode) {
    drawFaceLandmarks();
    detectBlink();
  }
}

function drawBlinkCountOnWebcamFrame() {
  let padding = 75;

  // Calculate aspect ratio of webcam stream
  let webcamAspect = webcamStream.width / webcamStream.height;

  // Get new width and height of the webcam frame (same as in drawWebcamBackground)
  let newWidth, newHeight;
  if (width / height > webcamAspect) {
    newHeight = height - 2 * padding;
    newWidth = newHeight * webcamAspect;
  } else {
    newWidth = width - 2 * padding;
    newHeight = newWidth / webcamAspect;
  }

  // Center the webcam image
  let x = (width - newWidth) / 2;
  let y = (height - newHeight) / 2;
  fill(255);
  textSize(32); 
  textAlign(LEFT, BOTTOM);
  text(` ${blinkCount}`, x + 20, y + newHeight - 26); 
}


function drawWebcamBackground() {
  push();
  let padding = 75;

  // Calculate aspect ratio of webcam stream again
  let webcamAspect = webcamStream.width / webcamStream.height;
  let canvasAspect = width / height;

  let newWidth, newHeight;

  // Check if the canvas is wider or taller than the webcam aspect ratio
  if (canvasAspect > webcamAspect) {
    newHeight = height - 2 * padding;
    newWidth = newHeight * webcamAspect;
  } else {
    // Canvas is taller, fit by width and apply padding on height
    newWidth = width - 2 * padding;
    newHeight = newWidth / webcamAspect;
  }

  // Center the webcam image
  let x = (width - newWidth) / 2;
  let y = (height - newHeight) / 2;

  textY = y + newHeight - 50;

  // Draw the gradient tunnel effect
  drawGradientTunnel(x, y, newWidth, newHeight);

  // Draw the webcam feed
  image(webcamStream, x, y, newWidth, newHeight);
  
  pop();
}

// Function to create a tunnel around the webcam feed
function drawGradientTunnel(x, y, w, h) {
  let gradientSteps = 20;  
  let innerColor = color(255, 255, 255, 150);
  let outerColor = color(0, 0, 0, 200); 

  for (let i = 0; i < gradientSteps; i++) {
    let t = i / gradientSteps;
    let currentColor = lerpColor(innerColor, outerColor, t);
    stroke(currentColor);
    strokeWeight(1);
    noFill();
    rect(x - i * 5, y - i * 5, w + i * 10, h + i * 10);
  }
}

// Draw the face vertices on the screen
function drawFaceLandmarks() {
  if (handsfreeTracker.data.facemesh && handsfreeTracker.data.facemesh.multiFaceLandmarks) {
    let faceData = handsfreeTracker.data.facemesh.multiFaceLandmarks;
    if (faceData.length > 0) {
      let faceLandmarks = faceData[0]; 

      stroke('black');
      strokeWeight(1);
      for (let i = 0; i < faceLandmarks.length; i++) {
        let x = map(faceLandmarks[i].x, 0, 1, width, 0);
        let y = map(faceLandmarks[i].y, 0, 1, 0, height);
        circle(x, y, 0.5);
      }
    }
  }
}

// Detect blinks based on eye openness
function processBlinkDetection() {
  if (handsfreeTracker.data.facemesh && handsfreeTracker.data.facemesh.multiFaceLandmarks) {
    let faceData = handsfreeTracker.data.facemesh.multiFaceLandmarks;
    if (faceData.length > 0) {
      let faceLandmarks = faceData[0];

      let eyesIndices = [
        [33, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7],
        [362, 384, 385, 386, 387, 388, 466, 263, 249, 390, 373, 374, 380, 381, 382]
      ];

      let eyeOpenness = measureEyeOpenness(faceLandmarks, eyesIndices);

      blinkHistory.shift();
      blinkHistory.push(eyeOpenness);

      updateBlinkStats();
    }
  }
}

// Measure the openness of the eyes
function measureEyeOpenness(landmarks, eyeVertices) {
  let eyePairs = [[159, 154], [158, 145], [385, 374], [386, 373]];
  let totalDistance = 0;

  for (let i = 0; i < eyePairs.length; i++) {
    let pointA = landmarks[eyePairs[i][0]];
    let pointB = landmarks[eyePairs[i][1]];
    totalDistance += dist(pointA.x, pointA.y, pointB.x, pointB.y);
  }
  return totalDistance;
}

// Update running average and compute the standard deviation for blink detection
function updateBlinkStats() {
  let stdDev = 0;
  eyeOpennessAvg = 0.95 * eyeOpennessAvg + 0.05 * blinkHistory[historyLength - 1];

  for (let i = 0; i < historyLength; i++) {
    stdDev += sq(blinkHistory[i] - eyeOpennessAvg);
  }
  stdDev = sqrt(stdDev / historyLength);

  let threshold = eyeOpennessAvg - stdDev;
  blinkIntensity = 0.9 * blinkIntensity;

  // Check if a blink is detected and increment blink count with cooldown
  if (blinkHistory[historyLength - 1] < threshold && blinkHistory[historyLength - 2] >= threshold) {
    let currentTime = millis();
    // Ensure cooldown between blinks
    if (currentTime - lastBlinkTime > blinkCooldown) {
      blinkIntensity = 1.0;
      blinkCount++;
      lastBlinkTime = currentTime;
      print(`Blink #${blinkCount} detected at ${int(millis())} ms`);
      blinkDetected = true;

      if (textIndex < textLines.length - 1) {
        charIndex = 0; 
        textIndex++;    
        currentScene++;
      }
    }
  }
}

// Function to detect blink
function detectBlink() {
  let historyScale = 500; 

  push();
  translate(0, 100); 

  let baseGray = color(200, 200, 200);
  let highlightRed = color(255, 0, 0);
  fill(lerpColor(baseGray, highlightRed, blinkIntensity));

  noStroke();
  rect(0, 0, width, 100);

  noFill();
  stroke(0);
  beginShape();
  for (let i = 0; i < historyLength - 1; i++) {
    let x = i;
    let y = blinkHistory[i] * historyScale;
    vertex(x, y);
  }
  endShape();

  stroke(0, 0, 0, 64);
  line(0, eyeOpennessAvg * historyScale, width, eyeOpennessAvg * historyScale);
  pop();
}


function keyPressed() {
  let currentTime = millis();

// If space pressed reset and move forward.
  if (key === ' ' && currentTime - lastSpacebarPress > spacebarCooldown) {
    blinkIntensity = 1.0;
    blinkCount++;
    lastBlinkTime = currentTime;
    blinkDetected = true;

    if (textIndex < textLines.length - 1) {
      charIndex = 0;
      textIndex++;
      currentScene++;
    }
    print(`Blink #${blinkCount} incremented using spacebar at ${int(currentTime)} ms`);
  }

// If r pressed restart the artwork
  if (key === 'r') {
    restartArtwork();
  }
}

// Function to display final message after finish
function displayFinalMessage() {
  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(40);

  // Typing effect for the first line
  if (millis() - finalLastTypedTime > finalTypingSpeed) {
    if (finalCharIndex1 < finalText1.length) {
      finalCharIndex1++;
    } else if (finalCharIndex2 < finalText2.length) {
      finalCharIndex2++;
    }
    finalLastTypedTime = millis();
  }

  text(finalText1.substring(0, finalCharIndex1), width / 2, height / 2 - 50);
  textSize(24);
  text(finalText2.substring(0, finalCharIndex2), width / 2, height / 2);

  buttonWidth = 150;
  buttonHeight = 50;
  buttonX = width / 2 - buttonWidth / 2;
  buttonY = height / 2 + 100;

  // Check if mouse is over the button
  if (mouseX > buttonX && mouseX < buttonX + buttonWidth && mouseY > buttonY && mouseY < buttonY + buttonHeight) {
    isHovering = true;
  } else {
    isHovering = false;
  }

  // Invert button
  if (isHovering) {
    fill(255); 
    stroke(255); 
  } else {
    noFill();
    stroke(255); 
  }
  
  strokeWeight(1);
  rect(buttonX, buttonY, buttonWidth, buttonHeight); 
  noStroke();

  if (isHovering) {
    fill(0); 
  } else {
    fill(255); 
  }
  
  textSize(24);
  text("Restart", buttonX + buttonWidth / 2, buttonY + buttonHeight / 2 - 5);
}

function mousePressed() {
  // Check if the mouse is over the button
  if (mouseX > buttonX && mouseX < buttonX + buttonWidth && mouseY > buttonY && mouseY < buttonY + buttonHeight) {
    restartArtwork(); // Call to restart the artwork
  }
}

function restartArtwork() {
  // Reset all necessary variables to restart the artwork
  blinkCount = 0;
  blinkDetected = false;
  textIndex = 0;
  charIndex = 0;
  fadeAlpha = 0;
  currentScene = 0;
  finalCharIndex1 = 0;
  finalCharIndex2 = 0;
  finalTypingSpeed = 50; 
  finalLastTypedTime = 0;
}