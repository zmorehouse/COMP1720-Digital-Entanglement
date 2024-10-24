// Blink logic inspired by 
// Using the handsfreejs library https://handsfreejs.netlify.app/ 
// https://storage.googleapis.com/tfjs-models/demos/facemesh/demo.fd0b9f10.js
// https://age2death.glitch.me/
// https://editor.p5js.org/golan/sketches/d-JfFcGws
// alongside
// https://editor.p5js.org/bestesaylar/sketches/ogFdasRIc
// https://github.com/auduno/clmtrackr

let handsfreeTracker; 
let webcamStream;
let currentScene = 0;

let blinkHistory = [];
const historyLength = 320; 
let eyeOpennessAvg = 0; 
let blinkIntensity = 0; 
let blinkCount = 0; // Track the number of blinks
let lastBlinkTime = 0; // Track time of last blink
const blinkCooldown = 300; // Cooldown time in milliseconds between blinks
const spacebarCooldown = 300; // Cooldown time for spacebar presses (1 second)

let debuggerMode = false; // Toggle for showing debug visuals
let modelLoaded = false; // Track if the model is loaded
let blinkDetected = false; // Track if a blink has occurred
let lastSpacebarPress = 0; // Track time of last spacebar press

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
let textLines = [
  "I work all day and get half-drunk at night",
  "Waking at four to soundless dark I stare",
  "In time the curtain-edges will grow light",
  "Till then I see what’s really always there",
  "Unresting death a whole day nearer now",
  "Making all thought impossible but how",
  "And where and when I shall myself die",
  "Arid interrogation yet the dread",
  "Of dying and being dead",
  "Flashes afresh to hold and horrify",
  "The mind blanks at the glare Not in remorse",
  "The good not done the love not given time",
  "Torn off unused nor wretchedly because",
  "An only life can take so long to climb",
  "Clear of its wrong beginnings and may never",
  "But at the total emptiness for ever",
  "The sure extinction that we travel to",
  "And shall be lost in always Not to be here",
  "Not to be anywhere",
  "And soon nothing more terrible nothing more true",
  "This is a special way of being afraid",
  "No trick dispels Religion used to try",
  "That vast moth-eaten musical brocade",
  "Created to pretend we never die",
  "And specious stuff that says No rational being",
  "Can fear a thing it will not feel not seeing",
  "That this is what we fear no sight no sound",
  "No touch or taste or smell nothing to think with",
  "Nothing to love or link with",
  "The anaesthetic from which none come round",
  "And so it stays just on the edge of vision",
  "A small unfocused blur a standing chill",
  "That slows each impulse down to indecision",
  "Most things may never happen this one will",
  "And realisation of it rages out",
  "In furnace-fear when we are caught without",
  "People or drink Courage is no good",
  "It means not scaring others Being brave",
  "Lets no one off the grave",
  "Death is no different whined at than withstood",
  "Slowly light strengthens and the room takes shape",
  "It stands plain as a wardrobe what we know",
  "Have always known know that we can’t escape",
  "Yet can’t accept One side will have to go",
  "Meanwhile telephones crouch getting ready to ring",
  "In locked-up offices and all the uncaring",
  "Intricate rented world begins to rouse",
  "The sky is white as clay with no sun",
  "Work has to be done",
  "Postmen like doctors go from house to house"
];


let textY;  

let textIndex = 0;
let charIndex = 0; // Tracks the character being typed
let typingSpeed = 50; // Speed of typing effect (in milliseconds)
let lastTypedTime = 0; // Tracks the time of the last character typed

let fadeIn = true; // Track whether we are in the fade-in or fade-out phase
let fadeAlpha = 0; // Alpha value for fading


function preload() {
  BusMatrixFont = loadFont('/assets/BusMatrixCondensed-Condensed.ttf');
}
function setup() {
  if (debuggerMode) {
    createCanvas(640, 480);
  } else {   
    createCanvas(windowWidth, windowHeight);
  }
  
  textFont(BusMatrixFont);
  // Initialize blink history
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
    modelLoaded = true; // Set to true when the model is fully loaded
  });

  handsfreeTracker.hideDebugger();
}

function draw() {
  background(0);

  // If the model is still loading, display "Loading..."
  if (!modelLoaded) {
    if (fadeIn) {
      fadeAlpha += 5; // Increase alpha value
      if (fadeAlpha >= 255) {
        fadeIn = false; // Switch to fade-out once fully opaque
      }
    } else {
      fadeAlpha -= 5; // Decrease alpha value
      if (fadeAlpha <= 0) {
        fadeIn = true; // Switch to fade-in once fully transparent
      }
    }

    // Ensure alpha value stays within bounds
    fadeAlpha = constrain(fadeAlpha, 0, 255);

    fill(255, fadeAlpha); // Apply the fade effect to the text
    textAlign(CENTER, CENTER);
    textSize(40);
    text("Loading...", width / 2, height / 2);
    return;  // Skip the rest of the draw loop until the model is loaded
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
    return; // Skip the rest of the draw loop until blink is detected
  }

  // Once a blink is detected, show the webcam in full screen
  if (blinkDetected) {
    drawWebcamBackground();
    processBlinkDetection();

    let faderLevel = map(blinkIntensity, 1, 0, 0, 255);
    tint(faderLevel); // Apply tint to the webcam feed

    stroke(255, 15); // Light gray color for scan lines
    for (let y = 0; y < height; y += 5) { // Line spacing
      // Create a wave displacement based on the mouseX position
      let bendAmount = map(mouseX, 0, width, -50, 50);  // Bend based on mouseX position (-50 to 50 range)
      let offset = sin((y + frameCount) * 0.1) * bendAmount; // Sine wave controlled by frameCount and y position
    
      line(0 + offset, y, width + offset, y); // Apply the bend to the line
    }

    switch (currentScene) {
      case 0:
        // No effect
        break;
      case 1:

        break;
    }

    // Handle the typing animation
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

    drawBlinkCountOnWebcamFrame();
  }

  if (debuggerMode) {
    drawFaceLandmarks();
    detectBlink();
  }
}


function drawBlinkCountOnWebcamFrame() {
  // Define the padding value (same as the webcam frame's padding)
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

  // Set the blink count position relative to the bottom-left of the webcam frame
  fill(255);
  textSize(32); // Match font size
  textAlign(LEFT, BOTTOM);
  text(` ${blinkCount}`, x + 20, y + newHeight - 27); // Offset 20px from left and bottom of the webcam frame
}


function drawWebcamBackground() {
  push();
  
  // Define the padding value
  let padding = 75;

  // Calculate aspect ratio of webcam stream
  let webcamAspect = webcamStream.width / webcamStream.height;
  let canvasAspect = width / height;

  let newWidth, newHeight;

  // Check if the canvas is wider or taller than the webcam aspect ratio
  if (canvasAspect > webcamAspect) {
    // Canvas is wider, fit by height and apply padding on width
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

// Function to create a gradient around the webcam feed
function drawGradientTunnel(x, y, w, h) {
  let gradientSteps = 20;  // Number of steps for the gradient

  let innerColor = color(255, 255, 255, 150); // Lighter inner color (semi-transparent white)
  let outerColor = color(0, 0, 0, 200); // Darker outer color (near-black)

  for (let i = 0; i < gradientSteps; i++) {
    let t = i / gradientSteps;

    // Lerp between inner and outer colors
    let currentColor = lerpColor(innerColor, outerColor, t);

    stroke(currentColor);
    strokeWeight(1);
    noFill();

    // Draw the rectangle slightly larger each time to create the gradient effect
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
        charIndex = 0; // Reset charIndex when moving to a new line
        textIndex++;    // Only increment if not at the last line
        currentScene++;
      }
    }
  }
}

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
}
