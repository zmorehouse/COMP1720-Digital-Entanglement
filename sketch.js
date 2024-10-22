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

let blinkHistory = [];
const historyLength = 320; 
let eyeOpennessAvg = 0; 
let blinkIntensity = 0; 
let blinkCount = 0; // Track the number of blinks
let lastBlinkTime = 0; // Track time of last blink
const blinkCooldown = 300; // Cooldown time in milliseconds between blinks
const spacebarCooldown = 1000; // Cooldown time for spacebar presses (1 second)

let debuggerMode = false; // Toggle for showing debug visuals
let modelLoaded = false; // Track if the model is loaded
let blinkDetected = false; // Track if a blink has occurred
let lastSpacebarPress = 0; // Track time of last spacebar press

function setup() {
  if (debuggerMode) {
    createCanvas(640, 480);
  } else {   
  createCanvas(windowWidth, windowHeight);
  }
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
  background(255);

  // If the model is still loading, display "Loading..."
  if (!modelLoaded) {
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(24);
    text("Loading...", width / 2, height / 2);
    return; // Skip the rest of the draw loop until model is loaded
  }

  // Once the model is loaded, wait for a blink to continue
  if (!blinkDetected) {
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(24);
    text("Blink to continue", width / 2, height / 2);
    processBlinkDetection();
    return; // Skip the rest of the draw loop until blink is detected
  }

  // Once a blink is detected, show the webcam in full screen
  if (blinkDetected) {
    drawWebcamBackground();
    processBlinkDetection();

  }

  if (debuggerMode) {
    drawFaceLandmarks();
    detectBlink();
  }
}

// Draw the webcam feed on the screen
function drawWebcamBackground() {
  push();
  
  // Calculate aspect ratio of webcam stream
  let webcamAspect = webcamStream.width / webcamStream.height;
  let canvasAspect = width / height;

  let newWidth, newHeight;

  // Check if the canvas is wider or taller than the webcam aspect ratio
  if (canvasAspect > webcamAspect) {
    // Canvas is wider, fit by height
    newHeight = height;
    newWidth = height * webcamAspect;
  } else {
    // Canvas is taller, fit by width
    newWidth = width;
    newHeight = width / webcamAspect;
  }

  // Center the webcam image
  let x = (width - newWidth) / 2;
  let y = (height - newHeight) / 2;

  // Transform and draw the webcam image
  translate(x, y);
  tint(255, 255, 255, 160); 
  image(webcamStream, 0, 0, newWidth, newHeight);
  
  pop();
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
      blinkCount++; // Increment blink count
      lastBlinkTime = currentTime; // Update last blink time
      print(`Blink #${blinkCount} detected at ${int(millis())} ms`);
      blinkDetected = true; // Set blinkDetected to true to trigger full-screen mode
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
    blinkCount++; 
    lastSpacebarPress = currentTime; 
    print(`Blink #${blinkCount} incremented using spacebar at ${int(currentTime)} ms`);
  }
}