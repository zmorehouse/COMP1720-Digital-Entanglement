// Digital Entanglement by Zac Morehouse - u7637337
// Test - Script not uploading?
// Useful variables as mentioned in my instructions.md - Feel free to modify! 
let spacebarOnlyMode = false;
let debuggerMode = false;

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
const blinkCooldown = 500;
const spacebarCooldown = 300;

// Additional Scene and Model Logic + Debugger
let currentScene = 0;
let modelLoaded = false;
let blinkDetected = false;
let lastSpacebarPress = 0;

// Text content and typing effect for both the main text and final poem line
let textIndex = 0;
let charIndex = 0;
let typingSpeed = 50;
let lastTypedTime = 0;
let textY;
let typingIndex = 0;

// Final text content and typing effect
let finalText1 = "You blinked and the world rewrote itself.";
let finalText2 = "Entangled in digital realities. Are you still in control or just another line of code?";
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

// Tunnel steps
let gradientSteps = 26;

// Set logic (1-5 per stanza)
let blinkSetCount = 0;
let setNumber = 1;

// Red fill color for las line of stanza 
let UIFillColor = 255;

// Stuff for Scene 5 Face Mesh
let meshPoints = [];
let meshDensity;
let meshSize = 3;
let connectionDistance = 80;
let floatSpeed = 1;
let maxConnections = 3;
let meshtrigger = false;

// Sound 
let ambienceSound;

// Glitch Effect on Mouse Movement
let glitchFrame;
let glitchIteration = 0;
let lastMouseX = 0;
let lastMouseY = 0;
let movementIntensity = 1;

// Lines from Phillip Larkins Aubade
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
  "And shall be lost in always. Not to be here.",
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
  "",
  ""
];

// SpaceBar Only Button
let spaceBarbuttonWidth = 200;
let spaceBarbuttonHeight = 40;
let spaceBarbuttonX;
let spaceBarbuttonY;

// Preload Func
function preload() {
  // Load font and sound 
  BusMatrixFont = loadFont('/assets/BusMatrixCondensed-Condensed.ttf');
  ambienceSound = loadSound('/assets/computer-ambience.wav');
}

// Setup Function
function setup() {

  if (debuggerMode) { // Run debugger smaller window so mesh fits
    createCanvas(640, 480);
  } else {
    createCanvas(windowWidth, windowHeight);
  }
  // Init ambience and font
  ambienceSound.loop();
  ambienceSound.setVolume(0.75);
  textFont(BusMatrixFont);

  // Init Webcam
  webcamStream = createCapture(VIDEO);
  webcamStream.size();
  webcamStream.hide();

  if (!spacebarOnlyMode) {

    blinkHistory = Array(historyLength).fill(0.1); // Fill with 0.1 to avoid division by zero

    // Initialize handsfree.js to track face
    handsfreeTracker = new Handsfree({
      hands: false,
      pose: false,
      facemesh: true
    });

    handsfreeTracker.start(() => {
      modelLoaded = true;
    });

    handsfreeTracker.hideDebugger();
  } else {
    modelLoaded = true;
  }

}

// Draw Func
function draw() {

  // Debugger Stuff
  if (debuggerMode) {
    drawWebcamBackground();
    drawFaceLandmarks();
    processBlinkDetection();
    detectBlink();
  }
  else {
    background(0);

    // If the model is still loading, display loading text
    if (!modelLoaded) {
      if (fadeIn) { // Loading fading
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
      textSize(20);

      // Extra bits for spacebar button
      fill(255);
      text("Not loading? Please see the instructions.md file", width / 2, height - 120);

      spaceBarbuttonX = width / 2 - spaceBarbuttonWidth / 2;
      spaceBarbuttonY = height - 95;

      // If button hovered
      if (mouseX > spaceBarbuttonX && mouseX < spaceBarbuttonX + spaceBarbuttonWidth && mouseY > spaceBarbuttonY && mouseY < spaceBarbuttonY + spaceBarbuttonHeight) {
        fill(200);
        cursor(HAND);
      } else {
        fill(100);
        cursor(ARROW);
      }
      rect(spaceBarbuttonX, spaceBarbuttonY, spaceBarbuttonWidth, spaceBarbuttonHeight);

      fill(255);
      textAlign(CENTER, CENTER);
      text("Enable Spacebar Only Mode", width / 2, height - 80);

    }

    // Once the model is loaded, wait for a blink to continue
    if (!blinkDetected && modelLoaded) {
      cursor(ARROW);
      fill(255);
      textAlign(CENTER, CENTER);
      textSize(40);
      text("Blink to begin the artwork", width / 2, height / 2 - 50);
      textSize(24);
      text("Or press Spacebar.", width / 2, height / 2);
      processBlinkDetection();
      return;
    }

    // Once we get to the last line of text display final msg
    if (blinkCount >= 26) {
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


      // Big switch case, this runs our effects based on where in the poem we're up to
      switch (currentScene) {
        case 0:

          break;
        case 1:
          applyHalftone(50);
          break;
        case 2:
          applyHalftone(40);
          break;
        case 3:
          applyHalftone(30);
          break;
        case 4:
          applyHalftone(25);
          break;
        case 5:
          applyHalftone(10);
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
        case 11:
          applyLineEffect(50);
          break;
        case 12:
          applyLineEffect(40);
          break;
        case 13:
          applyLineEffect(30);
          break;
        case 14:
          applyLineEffect(20);
          break;
        case 15:
          applyLineEffect(10);
          break;
        case 16:
          scratchEffect(1);
          break;
        case 17:
          scratchEffect(0.85);
          break;
        case 18:
          scratchEffect(0.7);
          break;
        case 19:
          scratchEffect(0.5);
          break;
        case 20:
          scratchEffect(0.2,);
          break;
        case 21:
          // With these mesh effects we need to change the density, but only once per case (otherwise it bugs out)
          if (!meshtrigger) {
            meshDensity = 50;
            initialiseMeshPoints();
            meshtrigger = true;
          }
          floatingHeadEffect(0, "");

          break;
        case 22:
          if (!meshtrigger) {
            meshDensity = 100;
            initialiseMeshPoints();
            meshtrigger = true;
          }
          floatingHeadEffect(0.1, "");
          break;
        case 23:
          if (!meshtrigger) {
            meshDensity = 150;
            initialiseMeshPoints();
            meshtrigger = true;
          }
          floatingHeadEffect(0.92, "");
          break;
        case 24:
          if (!meshtrigger) {
            meshDensity = 200;
            initialiseMeshPoints();
            meshtrigger = true;
          }
          floatingHeadEffect(0.97, "Most things may never happen.");
          break;
        case 25:
          if (!meshtrigger) {
            meshDensity = 300;
            initialiseMeshPoints();
            meshtrigger = true;
          }
          floatingHeadEffect(1, "This one will.");
          break;

      }

      drawGradientTunnel(); // Draw outside tunnel
      applyGlitchEffect(); // Apply glitch effect

      // Iterate over text lines and display 
      let currentText = textLines[textIndex];
      if (millis() - lastTypedTime > typingSpeed) {
        if (charIndex < currentText.length) charIndex++;
        lastTypedTime = millis();
      }
      let displayText = currentText.substring(0, charIndex);

      // Draw Dynamic Text Background Box
      textSize(38);
      let textWidthValue = textWidth(displayText) + 35; 
      let textBoxX = (width - textWidthValue) / 2;
      let textBoxY = textY - 22; 
      fill(0);
      noStroke();
      rect(textBoxX, textBoxY, textWidthValue, 55); 
      fill(UIFillColor);
      textAlign(CENTER, CENTER);
      text(displayText, width / 2, textY);

      drawBlinkCountOnWebcamFrame(); // Draw blink count and circles

    }
  }

}

function drawBlinkCountOnWebcamFrame() {
  let padding = 75;

  // Calculate aspect ratio of webcam stream
  let webcamAspect = webcamStream.width / webcamStream.height;

  // Get new width and height of the webcam frame (same as in drawWebcamBackground)
  // We use the below block alot in the next few. I wanted to function it but it kept bugging out - call it a future development opportunity... 
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
    displayHoverMessage(x, y, newWidth, newHeight); 
    return; 
  }

  fill(0);
  noStroke();
  rect(x + 15, y + newHeight - 75, 50, 60);

  // Write blink count
  fill(UIFillColor);
  textSize(38);
  textAlign(LEFT, BOTTOM);

  // Format as 01 instead of 1
  let formattedBlinkCount = nf(blinkCount, 2);
  text(` ${formattedBlinkCount}`, x + 20, y + newHeight - 26);

  // Draw blink set circles for pagination
  drawBlinkSetCircles(x + newWidth, y + newHeight - 5);

  // Scan lines
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
  let textW = textWidth(currentText.substring(0, charIndex));
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

  return false; 
}

// If hovering we can display this msg 
function displayHoverMessage(x, y, newWidth, newHeight) {
  cursor(HAND);
  background(0);
  fill(255, 0, 0);
  textAlign(CENTER, CENTER);
  textSize(100);
  text("Time is linear.", width / 2, height / 2 - 50);
  textSize(40);
  text("You cannot return.", width / 2, height / 2 + 50);

  // Draw blink count and circles on this screen too 
  fill(UIFillColor);
  textSize(38);
  textAlign(LEFT, BOTTOM);

  let formattedBlinkCount = nf(blinkCount, 2);
  text(` ${formattedBlinkCount}`, x + 20, y + newHeight - 26);
  drawBlinkSetCircles(x + newWidth, y + newHeight - 5);

}

// Function to draw blink set circles in the bottom right of the webcam
function drawBlinkSetCircles(webcamX, webcamY) {
  const circleSpacing = 10; 
  const circleSize = 15; 

  // Draw 5 circles in a row from right to left
  for (let i = 0; i < 5; i++) {
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

  if (canvasAspect > webcamAspect) {
    newHeight = height - 2 * padding;
    newWidth = newHeight * webcamAspect;
  } else {
    newWidth = width - 2 * padding;
    newHeight = newWidth / webcamAspect;
  }

  let x = (width - newWidth) / 2;
  let y = (height - newHeight) / 2;

  textY = y + newHeight - 50;

  // Draw the webcam feed. By drawing this first, it will be behind all other elements and can still be accessed by our face tracking lib. 
  image(webcamStream, x, y, newWidth, newHeight);

  pop();
}

// Function to create a frame and tunnel around the webcam feed
function drawGradientTunnel() {
  let padding = 75;
  let overlap = 3; 

  // Calculate aspect ratio of webcam stream again
  let webcamAspect = webcamStream.width / webcamStream.height;
  let canvasAspect = width / height;

  let newWidth, newHeight;

  if (canvasAspect > webcamAspect) {
    newHeight = height - 2 * padding;
    newWidth = newHeight * webcamAspect;
  } else {
    newWidth = width - 2 * padding;
    newHeight = newWidth / webcamAspect;
  }

  let x = (width - newWidth) / 2;
  let y = (height - newHeight) / 2;

  // Draw outer frame extending to canvas edges and overlapping into feed area by 3px. 
  // This crops the effects to a bounding box
  noStroke();
  fill(0);
  rect(0, 0, width, y + overlap);
  rect(0, y + newHeight - overlap, width, height - (y + newHeight) + overlap);
  rect(0, y + overlap, x + overlap, newHeight - 2 * overlap);
  rect(x + newWidth - overlap, y + overlap, width - (x + newWidth) + overlap, newHeight - 2 * overlap);

  // Define colors for gradient tunnel
  let innerColor = color(255, 255, 255, 150);
  let outerColor = color(0, 0, 0, 200);

  // Draw gradient tunnel around the webcam area
  for (let i = 0; i < gradientSteps; i++) {
    let t = i / gradientSteps;
    let currentColor = lerpColor(innerColor, outerColor, t);
    stroke(currentColor);
    strokeWeight(1);
    noFill();
    rect(x - i * 5, y - i * 5, newWidth + i * 10, newHeight + i * 10); 
  }
}


// Draw the face vertices on the screen - useful for debugging
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
  if (spacebarOnlyMode) {
    return;
  }
  else if (handsfreeTracker.data.facemesh && handsfreeTracker.data.facemesh.multiFaceLandmarks) {
    let faceData = handsfreeTracker.data.facemesh.multiFaceLandmarks;
    if (faceData.length > 0) {
      let faceLandmarks = faceData[0];

      let eyesIndices = [
        [33, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7],
        [362, 384, 385, 386, 387, 388, 466, 263, 249, 390, 373, 374, 380, 381, 382]
      ];

      let eyeOpenness = measureEyeOpenness(faceLandmarks, eyesIndices);

      blinkHistory.shift(); // Remove the oldest value and add the newest value
      blinkHistory.push(eyeOpenness); 

      updateBlinkStats(); // Update blink stats
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
// This stuff has all been taken from https://editor.p5js.org/golan/sketches/d-JfFcGws - thankyou!!
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
      console.log(`Blink #${blinkCount} detected at ${int(millis())} ms`); // Debug
    }
  }
}

// Function to detect blink
function detectBlink() {
  let historyScale = 500;

  // Stuff to draw history scale for debugger. Again from https://editor.p5js.org/golan/sketches/d-JfFcGws
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

// Keypressed function
function keyPressed() {
  let currentTime = millis();

  // If space pressed reset and move forward.
  if (key === ' ' && currentTime - lastSpacebarPress > spacebarCooldown) {
    moveNextScene();
    print(`Blink #${blinkCount} incremented using spacebar at ${int(currentTime)} ms`);
  }
  // If S pressed save as img
  if (key === 's') {
    saveCanvas("thumbnail.png");
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

  // Check if mouse is over the restart button
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
  if (mouseX > buttonX && mouseX < buttonX + buttonWidth && mouseY > buttonY && mouseY < buttonY + buttonHeight) { // Restart Button
    restartArtwork();
  } else if (mouseX > spaceBarbuttonX && mouseX < spaceBarbuttonX + spaceBarbuttonWidth && mouseY > spaceBarbuttonY && mouseY < spaceBarbuttonY + spaceBarbuttonHeight) { // Spacebar Only Button
    spacebarOnlyMode = true;
    modelLoaded = true;
  }
}

// Function to restart the artwork
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
  typingIndex = 0;
  meshtrigger = false;
}

// Func to move to the next scene
function moveNextScene() {
  // Increment all these important things
  blinkIntensity = 1.0;
  blinkCount++;
  blinkSetCount++; 
  gradientSteps = gradientSteps - 1;
  blinkDetected = true;
  typingIndex = 0;
  meshtrigger = false;

  // Reset the set count and move to the next set after every 5 blinks
  if (blinkSetCount > 5) {
    blinkSetCount = 1; 
    setNumber++; 
    if (setNumber > 5) {
      setNumber = 1; 
    }
  }

  if (textIndex < textLines.length - 1) {
    charIndex = 0;
    textIndex++;
    currentScene++;
  }
}

// First Effect - Halftone
function applyHalftone(gridSize) {
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
      // Calculate the pos in the webcam pixels array
      let pixelX = Math.floor((i / newWidth) * webcamStream.width);
      let pixelY = Math.floor((j / newHeight) * webcamStream.height);
      let index = (pixelY * webcamStream.width + pixelX) * 4;

      // Get the brightness using the R channel 
      let r = webcamStream.pixels[index];
      let dia = map(r, 0, 255, gridSize, 2);

      // Calculate the original circle position, allowing slight overflow
      let circleX = x + i + gridSize / 2;
      let circleY = y + j + gridSize / 2;

      fill(75);
      noStroke();
      circle(circleX, circleY, dia); 
    }
  }
}

// Second Effect - ASCII Art
function applyAsciiEffect(gridSize) {
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
  textFont('Courier New');

  // ASCII characters from smallest to largest
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
      fill('#b8b8b8');
      text(asciiChar, x + i + gridSize / 2, y + j + gridSize / 2);
    }
  }
  textFont(BusMatrixFont);
}

// Third Effect - Line Art
function applyLineEffect(gridSize) {
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

  // Load webcam pixels
  webcamStream.loadPixels();

  // This is basically the ASCII but instead of using characters we use lines
  // Loop through each pixel in a grid pattern
  for (let j = 0; j < newHeight; j += gridSize) {
    for (let i = 0; i < newWidth; i += gridSize) {
      // Calculate the position in the webcam pixels array
      let pixelX = Math.floor((i / newWidth) * webcamStream.width);
      let pixelY = Math.floor((j / newHeight) * webcamStream.height);
      let index = (pixelY * webcamStream.width + pixelX) * 4;

      // Get brightness of the pixel
      let r = webcamStream.pixels[index];
      let g = webcamStream.pixels[index + 1];
      let b = webcamStream.pixels[index + 2];
      let brightness = (r + g + b) / 3;

      // Map brightness to line length (darker = longer line)
      let lineLength = map(brightness, 0, 255, gridSize, 2);

      // Randomly choose horizontal or vertical line orientation
      if (brightness < 128) {
        // Draw vertical line
        stroke(255);
        strokeWeight(1);
        line(x + i, y + j - lineLength / 2, x + i, y + j + lineLength / 2);
      } else {
        // Draw horizontal line
        stroke(255);
        strokeWeight(1);
        line(x + i - lineLength / 2, y + j, x + i + lineLength / 2, y + j);
      }
    }
  }
}
// Fifth Effect - Floating Head / Verticies
function floatingHeadEffect(detailLevel, textline) {
  background(0);
  drawBackgroundMesh(textline);
  // Init facetracker (again)
  if (handsfreeTracker && handsfreeTracker.data.facemesh && handsfreeTracker.data.facemesh.multiFaceLandmarks) {
    let faceData = handsfreeTracker.data.facemesh.multiFaceLandmarks;

    // First we have to draw the basic lines. The normal ones are boring & I wanted them to be top to bottom and right to left
    if (faceData && faceData.length > 0) {
      let faceLandmarks = faceData[0];

      // Approx index for each bits of face. Taken from the facemesh model
      const foreheadIndex = 10;    
      const chinIndex = 152;      
      const leftFaceIndex = 234;   
      const rightFaceIndex = 454;  

      // Map points to canvas coordinates. Same as we did for the face mesh
      let foreheadX = map(faceLandmarks[foreheadIndex].x, 0, 1, 0, width);
      let foreheadY = map(faceLandmarks[foreheadIndex].y, 0, 1, 0, height);
      let chinX = map(faceLandmarks[chinIndex].x, 0, 1, 0, width);
      let chinY = map(faceLandmarks[chinIndex].y, 0, 1, 0, height);
      let leftFaceX = map(faceLandmarks[leftFaceIndex].x, 0, 1, 0, width);
      let leftFaceY = map(faceLandmarks[leftFaceIndex].y, 0, 1, 0, height);
      let rightFaceX = map(faceLandmarks[rightFaceIndex].x, 0, 1, 0, width);
      let rightFaceY = map(faceLandmarks[rightFaceIndex].y, 0, 1, 0, height);

      // Draw the lines between these points
      stroke(255, 100);
      strokeWeight(1);
      line(foreheadX, foreheadY, chinX, chinY); 
      line(leftFaceX, leftFaceY, rightFaceX, rightFaceY); 

      // Draw dots at the ends of each line
      fill(255);
      noStroke();
      ellipse(foreheadX, foreheadY, 2); 
      ellipse(chinX, chinY, 2);        
      ellipse(leftFaceX, leftFaceY, 2); 
      ellipse(rightFaceX, rightFaceY, 2); 
    }

    // Based on the detail level add additional points 
    if (detailLevel > 0) {
      const corePoints = [0, 4, 10, 17, 21, 33, 36, 39, 42, 46, 48, 54, 57, 61, 67, 109, 151, 337, 297, 389, 454]; // Important points
      let faceLandmarks = faceData[0];

      // Draw the main face wireframe
      for (let i = 0; i < corePoints.length; i++) {
        let x = map(faceLandmarks[corePoints[i]].x, 0, 1, 0, width);
        let y = map(faceLandmarks[corePoints[i]].y, 0, 1, 0, height);

        fill(255);
        noStroke();
        ellipse(x, y, 2);

        // Connect points
        if (i < corePoints.length - 1) {
          let nextX = map(faceLandmarks[corePoints[i + 1]].x, 0, 1, 0, width);
          let nextY = map(faceLandmarks[corePoints[i + 1]].y, 0, 1, 0, height);
          stroke(255, 100);
          line(x, y, nextX, nextY);
        }
      }

      // Draw additional points based on the detail level ((from before)
      let dynamicInterval = Math.floor(map(detailLevel, 0, 1, faceLandmarks.length / 5, 1));
      for (let i = 0; i < faceLandmarks.length; i += dynamicInterval) {
        if (!corePoints.includes(i)) { 
          let x = map(faceLandmarks[i].x, 0, 1, 0, width);
          let y = map(faceLandmarks[i].y, 0, 1, 0, height);

          fill(255);
          noStroke();
          ellipse(x, y, 2);

          // Connect points
          if (i + dynamicInterval < faceLandmarks.length) {
            let nextX = map(faceLandmarks[i + dynamicInterval].x, 0, 1, 0, width);
            let nextY = map(faceLandmarks[i + dynamicInterval].y, 0, 1, 0, height);
            stroke(255, 100);
            line(x, y, nextX, nextY);
          }
        }
      }
    }
  } else {
    console.warn("handsfreeTracker or facemesh data is unavailable."); // Debug
  }
}

// Function to initialize mesh points. This is for the background mesh effect
function initialiseMeshPoints() {

  // Only add new points if needed to reach the updated meshDensity (retains old points)
  let currentDensity = meshPoints.length;
  let pointsToAdd = meshDensity - currentDensity;

  if (pointsToAdd > 0) {
    for (let i = 0; i < pointsToAdd; i++) {
      meshPoints.push({
        x: random(width),
        y: random(height),
        offsetX: random(-floatSpeed, floatSpeed),
        offsetY: random(-floatSpeed, floatSpeed),
      });
    }
  }
}

// Function to animate and draw the mesh background
function drawBackgroundMesh(textLine) {
  fill(200, 200, 200, 120);
  noStroke();

  // Animate and draw  points
  for (let i = 0; i < meshPoints.length; i++) {
    let point = meshPoints[i];
    point.x += point.offsetX;
    point.y += point.offsetY;

    // Constrain points to the canvas
    if (point.x < 0 || point.x > width) point.offsetX *= -1;
    if (point.y < 0 || point.y > height) point.offsetY *= -1;

    // Draw each point
    ellipse(point.x, point.y, meshSize);

    // Connect only a few nearby points to simulate the mesh
    let connections = 0;
    for (let j = i + 1; j < meshPoints.length && connections < maxConnections; j++) {
      let otherPoint = meshPoints[j];
      let distance = dist(point.x, point.y, otherPoint.x, otherPoint.y);

      if (distance < connectionDistance) {
        stroke(200, 200, 200, 80);
        strokeWeight(0.5);
        line(point.x, point.y, otherPoint.x, otherPoint.y);
        connections++;
      }
    }
  }

  // Typing effect for the text line
  fill(75);
  if (blinkCount === 25) { // Only for the last one make it red
    fill('#ff0000')
    textSize(82);
  }
  textSize(64);
  textAlign(CENTER, CENTER);
  let typedText = textLine.substring(0, typingIndex);

  // Draw the typed text in the center behind the face mask
  text(typedText, width / 2, height / 2);

  // Handle typing speed
  if (millis() - lastTypedTime > typingSpeed) {
    if (typingIndex < textLine.length) {
      typingIndex++;
      lastTypedTime = millis();
    }
  }
}

// Fourth Effect - Scratchy Edges
function scratchEffect(intensity, gridSize = 7) {
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

  background(0); 

  // Load webcam pixels for processing
  webcamStream.loadPixels();

  // Define Sobel kernels - https://editor.p5js.org/czartacus/sketches/cSnxbWsFZ 
  const sobelX = [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1]
  ];
  const sobelY = [
    [-1, -2, -1],
    [0, 0, 0],
    [1, 2, 1]
  ];

  // Dynamic threshold based on intensity
  let edgeThreshold = map(intensity, 0, 1, 150, 30);

  // Loop through pixels with grid sampling
  for (let j = 1; j < newHeight - 1; j += gridSize) {
    for (let i = 1; i < newWidth - 1; i += gridSize) {
      let pixelX = Math.floor((i / newWidth) * webcamStream.width);
      let pixelY = Math.floor((j / newHeight) * webcamStream.height);
      let index = (pixelY * webcamStream.width + pixelX) * 4;

      // Apply Sobel filter in X and Y directions
      let gx = 0;
      let gy = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          let pixelIndex = ((pixelY + ky) * webcamStream.width + (pixelX + kx)) * 4;
          let brightness = (webcamStream.pixels[pixelIndex] + webcamStream.pixels[pixelIndex + 1] + webcamStream.pixels[pixelIndex + 2]) / 3;
          gx += brightness * sobelX[ky + 1][kx + 1];
          gy += brightness * sobelY[ky + 1][kx + 1];
        }
      }

      // Compute the edge strength
      let edgeStrength = sqrt(gx * gx + gy * gy);

      // Draw edge if strength exceeds the threshold
      if (edgeStrength > edgeThreshold) {

        // Reduce offset for distortion
        let offsetX = random(-0.5, 0.5) * intensity * 3;
        let offsetY = random(-0.5, 0.5) * intensity * 3;

        // Subtle flicker effect with reduced opacity range
        stroke(255, random(180, 230));
        strokeWeight(map(intensity, 0, 1, 0.8, 2)); 

        // Scale streak length based on intensity
        let streakLength = map(intensity, 0, 1, 0.05, 0.2); 

        // Draw directional streaks with variable length
        line(
          x + i + offsetX, y + j + offsetY,
          x + i + offsetX + gx * streakLength, y + j + offsetY + gy * streakLength
        );
      }
    }
  }
}

// Mouse Glitch Effect
function applyGlitchEffect() {

  // Calc mouse movement speed
  let dx = abs(mouseX - lastMouseX);
  let dy = abs(mouseY - lastMouseY);
  movementIntensity = dx + dy; 

  // Only trigger the glitch effect if there is sufficient movement or very rarely otherwise
  let movementThreshold = 0.1;
  if (movementIntensity < movementThreshold && random() > 0.02) return; // Rare chance of glitch 

  // Adjust frame rate based on movement intensity
  let frameThreshold = 5;
  let numRects = floor(map(movementIntensity, 0, width, 2, 10)); 

  // Generate a new random frame number for glitch effect triggering
  glitchFrame = Math.floor(random(0, frameThreshold));

  // Check if the random glitch frame matches the iteration
  if (glitchFrame === glitchIteration) {
    fill('#505050');
    noStroke();

    for (let i = 0; i < numRects; i++) {
      let rectHeight = random(0, 25);
      let yPosition = (random() < 0.7) ? mouseY + random(-50, 50) : random(0, height); // Favor mouseY area
      let verticalDisplacement = random() < 0.3 ? random(-10, 10) : 0; // Occasional vertical tear effect

      // Draw horizontal and vertical tearing rectangles
      rect(0, yPosition + verticalDisplacement, width, rectHeight); 
      rect(random(0, width), yPosition + random(-25, 25), random(width - 50, width + 50), random(0, 5)); 
    }

    // Reset glitch variables for next cycle
    glitchFrame = Math.floor(random(0, frameThreshold));
    glitchIteration = 0;
  }

  // Update the last mouse pos
  lastMouseX = mouseX;
  lastMouseY = mouseY;
}
