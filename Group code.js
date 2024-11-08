//a variable to hold the image
let img;

//divide the image into segments, 53*53 segments could be a better reproduction of the image
let numSegments = 53;

//store the segments in an array
let segments = [];

//add a variable to switch between drawing the image and the segments
let drawSegments = true;

//make an object to hold the draw properties of the image
let imgDrwPrps = {aspect: 0, width: 0, height: 0, xOffset: 0, yOffset: 0};

//a variable for the canvas aspect ratio
let canvasAspectRatio = 0;

//preload the image
function preload() {
  img = loadImage('/assets/Piet_Mondrian Broadway_Boogie_Woogie.jpeg');
}

function setup() {
  //make the canvas the same size as the image using its properties
  createCanvas(windowWidth, windowHeight);
  //calculate the aspect ratio of the image - this will never change so we only need to do it once
  imgDrwPrps.aspect = img.width / img.height;
  
  //calculate the draw properties of the image using the function made
  calculateImageDrawProps();
  //use the width and height of the image to calculate the size of each segment
  //We use these values to calculate the coordinates of the centre of each segment so we can get the colour of the pixel from the image
  let segmentWidth = img.width / numSegments;
  let segmentHeight = img.height / numSegments;
  /*
  use nested loops to divide the original image into segments
  use the row and column position of the segment
  */
 //set the column position of every segment outside the loop 
let positionInColumn = 0;
  for (let segYPos=0; segYPos<img.height; segYPos+=segmentHeight) {
    //this is looping over the height
    let positionInRow = 0
    for (let segXPos=0; segXPos<img.width; segXPos+=segmentWidth) {
      //use the x and y position to get the colour of the pixel from the image
      //take it from the centre of the segment
      let segmentColour = img.get(segXPos + segmentWidth / 2, segYPos + segmentHeight / 2);
      /*
      we used segments to compose the colour blocks in the original painting
      but there are slight differences in the colours of the segments
      we need to compose larger blocks by unifying the colours of similarly coloured blocks to the same value
      */
     //use the values of r and b to distinguish between colours
     //blue segments have an r-value less than 100, change the colour of these segments to a same colour (70, 105, 190)
     //use the same method for red, grey, yellow, and white segments to perform similar operations
       let redValue = red(segmentColour);
       let blueValue = blue(segmentColour);
       
       if (redValue < 100) {
        segmentColour = color(70, 105, 190);
       } else if (redValue < 185) {
        segmentColour = color(170, 60, 45);
       } else if (blueValue < 125){
        segmentColour = color(235, 210, 40);
       } else if (redValue < 230){
        segmentColour = color(215, 215, 210);   
       } else {
        segmentColour = color(240, 240, 235);
       }
       let segment = new ImageSegment(positionInColumn, positionInRow,segmentColour);
       segments.push(segment);
       positionInRow++;
    }
    positionInColumn++;
  }
  for (const segment of segments) {
    segment.calculateSegDrawProps();
  }
}

function draw() {
  background(240, 240, 235);
  if (drawSegments) {
    // draw white segment first to make sure the layer is behind the other segments
    for (const segment of segments) {
      if (red(segment.srcImgSegColour) === 240 && green(segment.srcImgSegColour) === 240 && blue(segment.srcImgSegColour) === 235) {
        segment.draw();
      }
    }
    
    // draw other segments
    for (const segment of segments) {
      if (!(red(segment.srcImgSegColour) === 240 && green(segment.srcImgSegColour) === 240 && blue(segment.srcImgSegColour) === 235)) {
        segment.draw();
      }
    }
  } else {
    // if show original image
    image(img, imgDrwPrps.xOffset, imgDrwPrps.yOffset, imgDrwPrps.width, imgDrwPrps.height);
  }
}

function keyPressed() {
  if (key == " ") {
    //a trick to invert a boolean variable,
    //it will always make it the opposite of what it was
    drawSegments = !drawSegments;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  calculateImageDrawProps();
  for (const segment of segments) {
    segment.calculateSegDrawProps();
  }
}

function calculateImageDrawProps() {
  //calculate the aspect ratio of the canvas
  canvasAspectRatio = width / height;
  //if the image is wider than the canvas
  if (imgDrwPrps.aspect > canvasAspectRatio) {
    //then we will draw the image to the width of the canvas
    imgDrwPrps.width = width;
    //and calculate the height based on the aspect ratio
    imgDrwPrps.height = width / imgDrwPrps.aspect;
    imgDrwPrps.yOffset = (height - imgDrwPrps.height) / 2;
    imgDrwPrps.xOffset = 0;
  } else if (imgDrwPrps.aspect < canvasAspectRatio) {
    //otherwise we will draw the image to the height of the canvas
    imgDrwPrps.height = height;
    //and calculate the width based on the aspect ratio
    imgDrwPrps.width = height * imgDrwPrps.aspect;
    imgDrwPrps.xOffset = (width - imgDrwPrps.width) / 2;
    imgDrwPrps.yOffset = 0;
  }
  else if (imgDrwPrps.aspect == canvasAspectRatio) {
    //if the aspect ratios are the same then we can draw the image to the canvas size
    imgDrwPrps.width = width;
    imgDrwPrps.height = height;
    imgDrwPrps.xOffset = 0;
    imgDrwPrps.yOffset = 0;
  }
}
//class for the image segments
class ImageSegment {
  constructor(columnPositionInPrm, rowPostionInPrm, srcImgSegColourInPrm) {
    this.columnPosition = columnPositionInPrm;
    this.rowPostion = rowPostionInPrm;
    this.srcImgSegColour = srcImgSegColourInPrm;
    this.drawXPos = 0;
    this.drawYPos = 0;
    this.drawWidth = 0;
    this.drawHeight = 0;
    
    // Add initial offset
    this.xOffset = 0; // Initial x-axis offset
    this.yOffset = 0; // Initial y-axis offset
  }

  calculateSegDrawProps() {
    this.drawWidth = Math.ceil(imgDrwPrps.width / numSegments) + 1;
    this.drawHeight = Math.ceil(imgDrwPrps.height / numSegments) + 1;
    
    this.drawXPos = this.rowPostion * (imgDrwPrps.width / numSegments) + imgDrwPrps.xOffset;
    this.drawYPos = this.columnPosition * (imgDrwPrps.height / numSegments) + imgDrwPrps.yOffset;
  }
  
  draw() {
    // Calculate dynamic offset to make color blocks shift over time
    let time = millis() / 1000; // Time parameter to control shifting speed
    let dynamicXOffset = 0;
    let dynamicYOffset = 0;

    // Check if color is white (255, 255, 255); white blocks do not move
    if (!(red(this.srcImgSegColour) === 240 && green(this.srcImgSegColour) === 240 && blue(this.srcImgSegColour) === 235)) {
      dynamicXOffset = this.xOffset + 10 * sin(time + this.rowPostion); // x-direction offset
      dynamicYOffset = this.yOffset + 10 * cos(time + this.columnPosition); // y-direction offset
    }

    // Apply the offset to the draw position
    let finalXPos = this.drawXPos + dynamicXOffset;
    let finalYPos = this.drawYPos + dynamicYOffset;
    
    // Draw the color block with the applied offset
    noStroke();
    fill(this.srcImgSegColour);
    rect(finalXPos, finalYPos, this.drawWidth, this.drawHeight);
  }
}

