// Variable to hold the image and audio
let img;
let song;
let amplitude;

let numSegments = 53;// Number of segments to divide the image
let segments = [];// Array to store image segments
let drawSegments = true;// Toggle to switch between original image and segments

// Object to hold image draw properties
let imgDrwPrps = { aspect: 0, width: 0, height: 0, xOffset: 0, yOffset: 0 };
let canvasAspectRatio = 0;// Canvas aspect ratio

function preload() {
  song = loadSound("assets/zzz - 808.flac");
  img = loadImage('/assets/Piet_Mondrian Broadway_Boogie_Woogie.jpeg');
}

function setup() {
  // Create canvas and initialize audio amplitude analysis
  createCanvas(windowWidth, windowHeight);
  amplitude = new p5.Amplitude();
  song.loop();// Loop the audio

  // Calculate image properties
  imgDrwPrps.aspect = img.width / img.height;
  calculateImageDrawProps();

  // Calculate size of each segment
  let segmentWidth = img.width / numSegments;
  let segmentHeight = img.height / numSegments;

  // Divide image into segments and store in array
  let positionInColumn = 0;
  // Use nested loops to divide the image into smaller color segments.
  // Outer loop controls the segment position in each column.
  for (let segYPos = 0; segYPos < img.height; segYPos += segmentHeight) {
    let positionInRow = 0;// Current segment position in the row
    for (let segXPos = 0; segXPos < img.width; segXPos += segmentWidth) {
      // Get the color of the center pixel for the current segment
      let segmentColour = img.get(segXPos + segmentWidth / 2, segYPos + segmentHeight / 2);
      // Categorize the segment color based on its RGB values to create uniform color blocks
      let redValue = red(segmentColour);
      let blueValue = blue(segmentColour);

      // Unify color for specific blocks based on color ranges
      if (redValue < 100) {
        segmentColour = color(70, 105, 190);
      } else if (redValue < 185) {
        segmentColour = color(170, 60, 45);
      } else if (blueValue < 125) {
        segmentColour = color(235, 210, 40);
      } else if (redValue < 230) {
        segmentColour = color(215, 215, 210);
      } else {
        segmentColour = color(240, 240, 235);
      }

      // Create a new ImageSegment object and add it to the segments array
      let segment = new ImageSegment(positionInColumn, positionInRow, segmentColour);
      segments.push(segment);
      positionInRow++;// Update position in the row
    }
    positionInColumn++;// Update position in the column
  }

  // Loop through segments array and calculate the draw properties for each segment
  for (const segment of segments) {
    segment.calculateSegDrawProps();
  }
}

function draw() {
  background(240, 240, 235);
  textSize(20); // Set the font size
  fill(0,0,255); // Set text color to black
  textAlign(LEFT, CENTER); // Align text to the left and center vertically

  // Display the message on the left side of the canvas
  text("Double press 'p' to play and pause", 20, height / 2); // Position text at the left of the canvas 

  if (drawSegments) {
    // Draw white segments first, so they're at the back layer
    for (const segment of segments) {
      if (red(segment.srcImgSegColour) === 240 && green(segment.srcImgSegColour) === 240 && blue(segment.srcImgSegColour) === 235) {
        segment.draw();
      }
    }
    // Draw other segments on top
    for (const segment of segments) {
      if (!(red(segment.srcImgSegColour) === 240 && green(segment.srcImgSegColour) === 240 && blue(segment.srcImgSegColour) === 235)) {
        segment.draw();
      }
    }
  } else {
    // Display original image if toggle is off
    image(img, imgDrwPrps.xOffset, imgDrwPrps.yOffset, imgDrwPrps.width, imgDrwPrps.height);
  }
}

// Interactive functions
function keyPressed() {
  if (key == " ") {
    drawSegments = !drawSegments;//turn back to original image
  } else if (key == "p") {
    if (song.isPlaying()) {
      song.pause();
    } else {
      song.play();//play and pause
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  calculateImageDrawProps();
  for (const segment of segments) {
    segment.calculateSegDrawProps();//make the work fit to the window size
  }
}

// Calculate properties for drawing the image based on aspect ratio
function calculateImageDrawProps() {
  canvasAspectRatio = width / height;
  if (imgDrwPrps.aspect > canvasAspectRatio) {
    imgDrwPrps.width = width;
    imgDrwPrps.height = width / imgDrwPrps.aspect;
    imgDrwPrps.yOffset = (height - imgDrwPrps.height) / 2;
    imgDrwPrps.xOffset = 0;
  } else if (imgDrwPrps.aspect < canvasAspectRatio) {
    imgDrwPrps.height = height;
    imgDrwPrps.width = height * imgDrwPrps.aspect;
    imgDrwPrps.xOffset = (width - imgDrwPrps.width) / 2;
    imgDrwPrps.yOffset = 0;
  } else {
    imgDrwPrps.width = width;
    imgDrwPrps.height = height;
    imgDrwPrps.xOffset = 0;
    imgDrwPrps.yOffset = 0;
  }
}

class ImageSegment {
  constructor(columnPositionInPrm, rowPostionInPrm, srcImgSegColourInPrm) {
    this.columnPosition = columnPositionInPrm;
    this.rowPostion = rowPostionInPrm;
    this.srcImgSegColour = srcImgSegColourInPrm;// Store the source color of this image segment
    // Initialize variables for segment drawing properties
    this.drawXPos = 0;
    this.drawYPos = 0;
    this.drawWidth = 0;
    this.drawHeight = 0;
    // Set initial offsets for the x and y positions
    this.xOffset = 0;
    this.yOffset = 0;
  }

  calculateSegDrawProps() {
    // Base segment size (width and height)
    this.drawWidth = Math.ceil(imgDrwPrps.width / numSegments);
    this.drawHeight = Math.ceil(imgDrwPrps.height / numSegments);

    // Calculate the initial drawing positions
    this.drawXPos = this.rowPostion * (imgDrwPrps.width / numSegments) + imgDrwPrps.xOffset;
    this.drawYPos = this.columnPosition * (imgDrwPrps.height / numSegments) + imgDrwPrps.yOffset;
  }

  draw() {
    let time = millis() / 1000;
    let level = amplitude.getLevel();

    // Only scale up based on amplitude, but don't shrink below original size
    let scaledWidth = this.drawWidth * map(level, 0, 1, 1, 2); // Scale width between original size (1) to 200% (2)
    let scaledHeight = this.drawHeight * map(level, 0, 1, 1, 2); // Scale height between original size (1) to 200% (2)

    // Dynamic offsets based on the amplitude and time
    let dynamicXOffset = this.xOffset + 30 * level * sin(time + this.rowPostion);
    let dynamicYOffset = this.yOffset + 30 * level * cos(time + this.columnPosition);

    let finalXPos = this.drawXPos + dynamicXOffset;
    let finalYPos = this.drawYPos + dynamicYOffset;

    let alphaValue = map(level, 0, 1, 50, 255); // Transparency based on amplitude

    noStroke();
    fill(red(this.srcImgSegColour), green(this.srcImgSegColour), blue(this.srcImgSegColour), alphaValue);

    // Draw the segment with dynamic size
    rect(finalXPos, finalYPos, scaledWidth, scaledHeight);
  }
}
