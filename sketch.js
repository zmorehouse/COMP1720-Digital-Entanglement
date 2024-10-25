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
const blinkCooldown = 500; // Cooldown time between blinks
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
let typingSpeed = 50; 
let lastTypedTime = 0;
let textY;  

// Final text content and typing effect
let finalText1 = "You blinked and the world rewrote itself.";
let finalText2 = "Entangled in digital streams. Are you still in control or just another line of code?";
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

let gradientSteps = 26;  

let blinkSetCount = 0; 
let setNumber = 1;

let UIFillColor = 255;


let textLines = [
  " ",
  "I work all day and get half-drunk at night.",
  "Waking at four to soundless dark I stare.",
  "In time the curtain-edges will grow light.",
  "Till then I see whats really always there.",

  "Unresting death a whole day nearer now.",
  "Making all thought impossible but how.",
  "And where and when I shall myself die.",
  "Arid interrogation yet the dread.",
  "Of dying and being dead.",

  "Clear of its wrong beginnings and may never.",
  "But at the total emptiness for ever.",
  "The sure extinction that we travel to.",
  "And shall be lost in always Not to be here.",
  "Not to be anywhere.",

  "And specious stuff that says. No rational being.",
  "Can fear a thing it will not feel not seeing.",
  "That this is what we fear no sight no sound.",
  "No touch or taste or smell nothing to think with.",
  "Nothing to love or link with.",

  "The anaesthetic from which none come round.",
  "And so it stays just on the edge of vision.",
  "A small unfocused blur a standing chill.",
  "That slows each impulse down to indecision.",
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
    text("Loading...", width / 2, height / 2 - 25);
    return;
  }
  

  // Once the model is loaded, wait for a blink to continue
  if (!blinkDetected) {
    cursor(ARROW);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(40);
    text("Blink to begin the artwork", width / 2, height / 2  - 50);
    textSize(24);
    text("Or press Spacebar.", width / 2, height / 2);
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
    if (blinkSetCount === 5) {
      UIFillColor = '#ff0000';
    } else {
      UIFillColor = '#ffffff'; 
    }
    drawWebcamBackground();
    processBlinkDetection();

    // Black fade after blink
    let faderLevel = map(blinkIntensity, 1, 0, 0, 255) * 1.5;
    tint(faderLevel);




    switch (currentScene) {
      case 0:

        break;
      case 1:
        applyPixelation(50); 
        break;
      case 2:
        applyPixelation(40); 
        break;
      case 3:
        applyPixelation(30); 
        break;
      case 4:
        applyPixelation(25);
        break;
      case 5:
        applyPixelation(10); 
        break;
      case 6:
      applyAsciiEffect(15);
      break;
        case 7:
        applyAsciiEffect(20);
        break;
        case 8:
        applyAsciiEffect(25);
        break;
        case 9:
        applyAsciiEffect(30);
        break;
        case 10:
        applyAsciiEffect(40);
        break;


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
    fill(UIFillColor);
    text(currentText.substring(0, charIndex), width / 2, textY);
    fill(255);
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

  // Hover detection
  if (isHoveringText(x, y, newWidth, newHeight)) {
    displayHoverMessage(x, y, newWidth, newHeight); // Show hover message
    return; // Exit function to avoid normal rendering
  }

  // Draw blink count
  fill(UIFillColor);
  textSize(32); 
  textAlign(LEFT, BOTTOM);
  text(` ${blinkCount}`, x + 20, y + newHeight - 26); 
  
  // Draw blink set circles for pagination in the bottom right
  drawBlinkSetCircles(x + newWidth, y + newHeight);
  
  // Draw sine wave effect
  stroke(255, 15); 
  for (let i = 0; i < newHeight; i += 5) {
    let offset = sin((i + frameCount) * 0.1); 
    line(x + offset, y + i, x + newWidth + offset, y + i); 
  }
}

// Check if the mouse is hovering over any UI elements
function isHoveringText(x, y, newWidth, newHeight) {
  // Check hover over main text
  let currentText = textLines[textIndex];
  textSize(32);
  let textW = textWidth(currentText.substring(0, charIndex)); // Call textWidth as a function
  let textHeight = textAscent() + textDescent();
  let textX = width / 2 - textW / 2;
  let textYPos = textY - textHeight / 2;

  if (mouseX > textX && mouseX < textX + textW && mouseY > textYPos && mouseY < textYPos + textHeight) {
    return true;
  }

  // Check hover over blink count
  if (mouseX > x + 20 && mouseX < x + 60 && mouseY > y + newHeight - 60 && mouseY < y + newHeight - 26) {
    return true;
  }

  // Check hover over pagination circles
  const circleSpacing = 10;
  const circleSize = 15;
  for (let i = 0; i < 5; i++) {
    let circleX = x + newWidth - (i * (circleSize + circleSpacing)) - circleSpacing - 25;
    let circleY = y + newHeight - circleSpacing - 20;
    if (dist(mouseX, mouseY, circleX, circleY) < circleSize / 2) {
      cursor(HAND);

      return true;
    }
    else {
      cursor(ARROW);

    }
  }

  return false; // No hover detected
}

// Function to display hover message
function displayHoverMessage(x, y, newWidth, newHeight) {
  cursor(HAND);
  background(0);
  fill(255, 0, 0);
  textAlign(CENTER, CENTER);
  textSize(100);
  text("Time is linear.", width / 2, height / 2 - 50);
  textSize(40);

  text("You cannot return.", width / 2, height / 2 + 50);

    // Draw blink count
    fill(UIFillColor);
    textSize(32); 
    textAlign(LEFT, BOTTOM);
    text(` ${blinkCount}`, x + 20, y + newHeight - 26); 
    
    // Draw blink set circles for pagination in the bottom right
    drawBlinkSetCircles(x + newWidth, y + newHeight);
  
}

// Function to draw blink set circles in the bottom right of the webcam
function drawBlinkSetCircles(webcamX, webcamY) {
  const circleSpacing = 10; // Space between circles
  const circleSize = 15; // Diameter of each circle

  // Draw 5 circles in a row from right to left
  for (let i = 0; i < 5; i++) {
    // Position circles from right to left
    let x = webcamX - (i * (circleSize + circleSpacing)) - circleSpacing;
    let y = webcamY - circleSpacing;

    if (i < blinkSetCount || blinkSetCount === 5) {
      fill(UIFillColor); // Filled circle
    } else {
      noFill(); // Outline circle
    }
    stroke(UIFillColor);
    strokeWeight(1);
    ellipse(x - 25, y - 20, circleSize, circleSize);
    noStroke();
  }
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
    if (currentTime - lastBlinkTime > blinkCooldown) {
      moveNextScene();
      lastBlinkTime = currentTime;

      print(`Blink #${blinkCount} detected at ${int(millis())} ms`);


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
    moveNextScene();
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
    cursor(HAND);
  } else {
    fill(255);
    cursor(ARROW); 
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
  gradientSteps = 26;
  blinkSetCount = 0; 
  setNumber = 1;
}

function moveNextScene() {
  
  blinkIntensity = 1.0;
  blinkCount++;
  blinkSetCount++; // Increment the count for the current set
  gradientSteps = gradientSteps - 1;
  blinkDetected = true;

  // Reset the set count and move to the next set after every 5 blinks
  if (blinkSetCount > 5) {
    blinkSetCount = 1; // Reset for the next group
    setNumber++; // Increment to the next set
    if (setNumber > 5) {
      setNumber = 1; // Reset back to the first set after completing 5 sets
    }
  }

  if (textIndex < textLines.length - 1) {
    charIndex = 0; 
    textIndex++;    
    currentScene++;
  }
}

function applyPixelation(gridSize) {
  // Calculate the webcam position and size
  let padding = 75;
  let webcamAspect = webcamStream.width / webcamStream.height;
  let newWidth, newHeight;

  if (width / height > webcamAspect) {
    newHeight = height - 2 * padding;
    newWidth = newHeight * webcamAspect;
  } else {
    newWidth = width - 2 * padding;
    newHeight = newWidth / webcamAspect;
  }

  let x = (width - newWidth) / 2;
  let y = (height - newHeight) / 2;

  fill(0);
  noStroke();
  rect(x, y, newWidth, newHeight);

  // Load webcam pixels for the dot matrix effect
  webcamStream.loadPixels();

  // Loop through each pixel in a grid pattern
  for (let j = 0; j < newHeight; j += gridSize) {
    for (let i = 0; i < newWidth; i += gridSize) {
      // Calculate the position in the webcam pixels array
      let pixelX = Math.floor((i / newWidth) * webcamStream.width);
      let pixelY = Math.floor((j / newHeight) * webcamStream.height);
      let index = (pixelY * webcamStream.width + pixelX) * 4;

      // Get the brightness using the red channel (an approximation)
      let r = webcamStream.pixels[index];
      let dia = map(r, 0, 255, gridSize, 2);

      // Calculate the original circle position
      let circleX = x + i + gridSize / 2;
      let circleY = y + j + gridSize / 2;

      // Draw the displaced circle
      fill(75);
      noStroke();
      if (circleX - dia / 2 >= x && circleX + dia / 2 <= x + newWidth &&
          circleY - dia / 2 >= y && circleY + dia / 2 <= y + newHeight) {
        circle(circleX, circleY, dia);
      }
    }
  }
}

function applyAsciiEffect(gridSize) {
  // Calculate the webcam position and size based on the aspect ratio
  let padding = 75;
  let webcamAspect = webcamStream.width / webcamStream.height;
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

  // Background rectangle behind ASCII art
  fill(0);
  noStroke();
  rect(x, y, newWidth, newHeight);
  textFont('Courier New');
  // ASCII characters from darkest to brightest
  let asciiChars = [' ', '.', ':', '-', '=', '+', '*', '#', '%', '@'];

  // Load the webcam pixels
  webcamStream.loadPixels();

  // Loop through each pixel in a grid pattern
  for (let j = 0; j < newHeight; j += gridSize) {
    for (let i = 0; i < newWidth; i += gridSize) {
      // Calculate the position in the webcam pixels array
      let pixelX = Math.floor((i / newWidth) * webcamStream.width);
      let pixelY = Math.floor((j / newHeight) * webcamStream.height);
      let index = (pixelY * webcamStream.width + pixelX) * 4;

      // Get the brightness of the current pixel
      let r = webcamStream.pixels[index];
      let g = webcamStream.pixels[index + 1];
      let b = webcamStream.pixels[index + 2];
      let brightness = (r + g + b) / 3;

      // Map the brightness to an ASCII character
      let charIndex = floor(map(brightness, 0, 255, asciiChars.length - 1, 0));
      let asciiChar = asciiChars[charIndex];

      // Draw the ASCII character at the corresponding position
      textSize(gridSize);
      textAlign(CENTER, CENTER);
      fill(255);
      text(asciiChar, x + i + gridSize / 2, y + j + gridSize / 2);
    }
  }
  textFont(BusMatrixFont);

}


/*

Old stuff might use 

let frameBuffer = []; // Buffer to store previous frames
const bufferSize = 5; // Number of previous frames to store


function applyDatamoshEffect(gridSize, tearIntensity = 10, blendAmount = 0.3) {
  // Calculate the webcam position and size
  let padding = 75;
  let webcamAspect = webcamStream.width / webcamStream.height;
  let newWidth, newHeight;

  if (width / height > webcamAspect) {
    newHeight = height - 2 * padding;
    newWidth = newHeight * webcamAspect;
  } else {
    newWidth = width - 2 * padding;
    newHeight = newWidth / webcamAspect;
  }

  let x = (width - newWidth) / 2;
  let y = (height - newHeight) / 2;

  // Capture current frame to frameBuffer
  webcamStream.loadPixels();
  const currentFrame = webcamStream.get(); // Capture the current frame as an image
  frameBuffer.push(currentFrame);

  // Maintain only the last `bufferSize` frames in the buffer
  if (frameBuffer.length > bufferSize) {
    frameBuffer.shift();
  }

  // Select a previous frame for blending (e.g., second-to-last frame)
  let ghostFrame = frameBuffer[Math.floor(random(0, frameBuffer.length))];
  ghostFrame.loadPixels();

  // Apply datamosh effect by combining current frame and ghost frame
  for (let j = 0; j < newHeight; j += gridSize) {
    for (let i = 0; i < newWidth; i += gridSize) {
      // Determine position in the pixel array
      let pixelX = Math.floor((i / newWidth) * webcamStream.width);
      let pixelY = Math.floor((j / newHeight) * webcamStream.height);
      let index = (pixelY * webcamStream.width + pixelX) * 4;

      // Get color values from the current frame and ghost frame
      let r = webcamStream.pixels[index];
      let g = webcamStream.pixels[index + 1];
      let b = webcamStream.pixels[index + 2];

      // Blending with ghost frame to simulate ghosting effect
      let ghostR = ghostFrame.pixels[index] * blendAmount + r * (1 - blendAmount);
      let ghostG = ghostFrame.pixels[index + 1] * blendAmount + g * (1 - blendAmount);
      let ghostB = ghostFrame.pixels[index + 2] * blendAmount + b * (1 - blendAmount);


      // Draw the block with combined effects
      fill(ghostR, ghostG, ghostB);
      noStroke();
      rect(x + i, y + j, gridSize, gridSize);
    }
  }
}




function applyLowBitrateEffect(gridSize, tearProbability = 0.05, tearIntensity = 15) {
  // Calculate the webcam position and size
  let padding = 75;
  let webcamAspect = webcamStream.width / webcamStream.height;
  let newWidth, newHeight;

  if (width / height > webcamAspect) {
    newHeight = height - 2 * padding;
    newWidth = newHeight * webcamAspect;
  } else {
    newWidth = width - 2 * padding;
    newHeight = newWidth / webcamAspect;
  }

  let x = (width - newWidth) / 2;
  let y = (height - newHeight) / 2;

  // Load webcam pixels
  webcamStream.loadPixels();

  // Draw pixelated, low-bitrate blocks to simulate compression
  for (let j = 0; j < newHeight; j += gridSize) {
    for (let i = 0; i < newWidth; i += gridSize) {
      let pixelX = Math.floor((i / newWidth) * webcamStream.width);
      let pixelY = Math.floor((j / newHeight) * webcamStream.height);
      let index = (pixelY * webcamStream.width + pixelX) * 4;

      // Get average color in the pixel block for low bitrate effect
      let r = webcamStream.pixels[index];
      let g = webcamStream.pixels[index + 1];
      let b = webcamStream.pixels[index + 2];

      // Draw compressed pixel block
      fill(r, g, b);
      noStroke();
      rect(x + i, y + j, gridSize, gridSize);
    }
  }

  // Apply torn frames effect
  for (let j = 0; j < newHeight; j += gridSize) {
    if (random(1) < tearProbability) {
      // Shift pixels horizontally to create tearing
      let shiftAmount = random(-tearIntensity, tearIntensity);
      copy(x, y + j, newWidth, gridSize, x + shiftAmount, y + j, newWidth, gridSize);
    }
  }
}

/*
let pixelPositions = []; // Stores the target positions of each pixel
let lastScene = -1; // Track the last scene to detect scene changes
function applyJumbledArrangement(gridSize, arrangementLevel, clumpSize = 3, maxOffset = 100) {
  // Calculate the webcam position and size
  let padding = 75;
  let webcamAspect = webcamStream.width / webcamStream.height;
  let newWidth, newHeight;

  if (width / height > webcamAspect) {
    newHeight = height - 2 * padding;
    newWidth = newHeight * webcamAspect;
  } else {
    newWidth = width - 2 * padding;
    newHeight = newWidth / webcamAspect;
  }

  let x = (width - newWidth) / 2;
  let y = (height - newHeight) / 2;

  // Initialize pixelPositions on scene change
  if (currentScene !== lastScene) {
    pixelPositions = [];
    for (let j = 0; j < newHeight; j += gridSize * clumpSize) {
      for (let i = 0; i < newWidth; i += gridSize * clumpSize) {
        // Calculate the base offset range based on arrangement level
        let offsetRange = map(arrangementLevel, 0, 1, maxOffset, 0);

        // Generate a random offset within the neighborhood range
        let targetX = i + random(-offsetRange, offsetRange);
        let targetY = j + random(-offsetRange, offsetRange);

        // Push each block in the clump into pixelPositions
        for (let cj = 0; cj < clumpSize; cj++) {
          for (let ci = 0; ci < clumpSize; ci++) {
            pixelPositions.push({
              x: i + ci * gridSize,
              y: j + cj * gridSize,
              targetX: constrain(targetX + ci * gridSize, 0, newWidth - gridSize),
              targetY: constrain(targetY + cj * gridSize, 0, newHeight - gridSize)
            });
          }
        }
      }
    }
    lastScene = currentScene; // Update lastScene to current
  }

  // Load webcam pixels
  webcamStream.loadPixels();

  // Draw each pixel block according to the stored jumbled positions
  pixelPositions.forEach(pos => {
    let pixelX = Math.floor((pos.x / newWidth) * webcamStream.width);
    let pixelY = Math.floor((pos.y / newHeight) * webcamStream.height);
    let index = (pixelY * webcamStream.width + pixelX) * 4;

    // Get the color of the original pixel
    let r = webcamStream.pixels[index];
    let g = webcamStream.pixels[index + 1];
    let b = webcamStream.pixels[index + 2];

    // Draw the block at its target position
    fill(r, g, b);
    noStroke();
    rect(x + pos.targetX, y + pos.targetY, gridSize, gridSize);
  });
}


function applyColorTransitionEffect(stage) {
  // Calculate the webcam position and size
  let padding = 75;
  let webcamAspect = webcamStream.width / webcamStream.height;
  let newWidth, newHeight;

  if (width / height > webcamAspect) {
    newHeight = height - 2 * padding;
    newWidth = newHeight * webcamAspect;
  } else {
    newWidth = width - 2 * padding;
    newHeight = newWidth / webcamAspect;
  }

  let x = (width - newWidth) / 2;
  let y = (height - newHeight) / 2;

  // Load webcam pixels
  webcamStream.loadPixels();

  // Create a new graphics layer to manipulate pixels without altering the source
  let modifiedFrame = createGraphics(newWidth, newHeight);
  modifiedFrame.image(webcamStream, 0, 0, newWidth, newHeight);
  modifiedFrame.loadPixels();

  for (let i = 0; i < modifiedFrame.pixels.length; i += 4) {
    let r = modifiedFrame.pixels[i];
    let g = modifiedFrame.pixels[i + 1];
    let b = modifiedFrame.pixels[i + 2];
    let avg = (r + g + b) / 3;

    // Apply color transformations based on the stage
    switch (stage) {
      case 1:
        // Pure greyscale
        r = g = b = avg;
        break;
      case 2:
        // Greyscale with a tint (light blue tint as an example)
        r = avg * 0.9;
        g = avg;
        b = avg * 1.1;
        break;
      case 3:
        // Slight hue shift and increase in saturation
        r = avg * 0.8 + r * 0.2;
        g = avg * 0.8 + g * 0.5;
        b = avg * 0.8 + b * 1.2;
        break;
      case 4:
        // Partial inversion on red and blue channels
        r = 255 - r;
        b = 255 - b;
        g = avg; // Keep green slightly desaturated
        break;
      case 5:
        // Full RGB inversion with enhanced saturation
        r = 255 - r;
        g = 255 - g;
        b = 255 - b;
        break;
    }

    // Set the modified pixels
    modifiedFrame.pixels[i] = r;
    modifiedFrame.pixels[i + 1] = g;
    modifiedFrame.pixels[i + 2] = b;
  }

  modifiedFrame.updatePixels();
  image(modifiedFrame, x, y, newWidth, newHeight);
}
*/