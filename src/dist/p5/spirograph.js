let data;

let path = [];

let angle; // This number traces the curve 

let size; // = Length(listP)
let n; // = (size - 1)/2

let T = [];

let kMax; // Number of orbits = 2*kMax

let arrayCx = [];
let arrayC0x = [];
let arrayCy = [];
let tempCx = [];
let tempCy = [];
let Cx;
let Cy;

let CPosX = [];
let CPosY = [];
let CNegX = [];
let CNegY = [];

let CCordX = [];
let CCordY = [];

let Rho = [];
let indexRho = [];
let sortedNumbers = []; // I did it. 

let Ang = [];

let K = [];

let sel;
let show = true;

// preload table data
function preload() {  data = loadTable('../dist/p5/datapts.csv','csv','header'); }

function setup() {
  createCanvas(600, 600);
  colorMode(HSB, 1, 1, 1);
  background(0.1);
  //data = loadTable('datapts.csv','csv','header');

  sel = createSelect();
  sel.position(10, 10);
  sel.option('Epicycles');
  sel.option('Approx. Curve');
  sel.changed(mySelectEvent);

  //count the columns CodingTrain
  //print(data.getRowCount() + ' total rows in table');
  //print(data.getColumnCount() + ' total columns in table');

  //print(dataOrder.getColumn('x'));

  //print(data.getColumn('y'));
  //print(data.getNum(0, 'x'));

  angle = -PI;
  size = data.getRowCount();
  n = (size - 1)  / 2;
  nCircles = createSlider(2, n, floor(n/2));
  nCircles.position(10, 30);

  for (let i = 0; i <= 2 * n; i++) {
    T[i] = 2 * PI * i / (2 * n + 1);
  }
  //((cos(k Element(listT, l)) x(Element(listP, l)) + sin(k Element(listT, l)) y(Element(listP, l))) / size, 
  //(cos(k Element(listT, l)) y(Element(listP, l)) - sin(k Element(listT, l)) x(Element(listP, l))) / size), l, 1, size

  arrayCx = make2Darray(size, 2 * n + 1); //Check later the num of row and columns
  arrayCy = make2Darray(size, 2 * n + 1);
  for (var i = 0; i < size; i++) {
    for (var j = 0; j < 2 * n + 1; j++) {
      let scale = 1.7;
      let COSX = cos((j - n) * T[i]) * scale * data.getNum(i, 'x');
      let SINX = sin((j - n) * T[i]) * scale * data.getNum(i, 'y');
      let valX = 1 / size * (COSX + SINX);
      arrayCx[i][j] = valX;
      let COSY = cos((j - n) * T[i]) * scale * data.getNum(i, 'y');
      let SINY = sin((j - n) * T[i]) * scale * data.getNum(i, 'x');
      let valY = 1 / size * (COSY - SINY);
      arrayCy[i][j] = valY;
    }
  }

  //Maybe I don't need this 2d array. I'll check it later
  tempCx = make2Darray(size, 2 * n + 1);
  tempCy = make2Darray(size, 2 * n + 1);
  for (var ik = 0; ik < size; ik++) {
    for (var jk = 0; jk < 2 * n + 1; jk++) {
      tempCx[ik][jk] = arrayCx[ik][jk];
      tempCy[ik][jk] = arrayCy[ik][jk];
    }
  }

  //print(tempCx)

  Cx = arrayColumnsSum(tempCx);
  Cy = arrayColumnsSum(tempCy);

  //print(Cx);

  for (i = 0; i < size - ((size + 1) / 2); i++) {
    CPosX[i] = Cx[i + (size + 1) / 2];
    CPosY[i] = Cy[i + (size + 1) / 2];
  }


  for (i = 0; i < (size + 1) / 2 - 1; i++) {
    CNegX[i] = Cx[i];
    CNegY[i] = Cy[i];
  }

  reverse(CNegX);
  reverse(CNegY);
  //print(CPosX.length);
  //print(CPosX);
  //print(CNegX);
  //print(CNegY);


  for (i = 0; i < 2 * (n); i++) {
    let cond = floor(i / 2);
    if (i === 0) {
      CCordX[i] = CPosX[cond]; //even
      CCordY[i] = CPosY[cond];
    } else if (i % 2 === 0) {
      CCordX[i] = CPosX[cond]; //even
      CCordY[i] = CPosY[cond];
    } else {
      CCordX[i] = CNegX[cond]; //odd
      CCordY[i] = CNegY[cond];
    }

  }

  //print(CCordY.length);
  //print(CCordX);
  //print(CCordY);

  for (i = 0; i < size - 1; i++) {
    Rho[i] = dist(0, 0, CCordX[i], CCordY[i]);
    if (atan2(CCordY[i], CCordX[i]) < 0) {
      Ang[i] = (atan2(CCordY[i], CCordX[i]) + 2 * PI) * 180 / (PI); //(PI - atan2(CCordY[i], CCordX[i]) )/(2*PI);
    } else {
      Ang[i] = atan2(CCordY[i], CCordX[i]) * 180 / (PI);
    }
  }

  // I need to create a list of numbers so I can choose 
  // the order of the epicycles by the size of the radii
  // from greater to smaller.
  indexRho = make2Darray(size - 1, 2);
  for (var ir = 0; ir < size - 1; ir++) {
    for (var jr = 0; jr < 2; jr++) {
      if (jr == 1) {
        indexRho[ir][jr] = ir + 1;
      } else {
        indexRho[ir][jr] = Rho[ir];
      }

    }
  }

  for (let k = 0; k < size - 1; k++) {
    sortedNumbers[k] = indexRho.sort(sortFunction)[k][1];
  }

  reverse(sortedNumbers);
  //print(indRho.sort(sortFunction));
  //print(sortedNumbers);

  //RhoSorted = Rho;
  //print(Rho.length);
  //print(Rho);
  //print(Rho);
  //print(Ang.length);
  //print(Ang);

  for (i = 0; i < 2 * n; i++) {
    let seq = ceil((i + 1) / 2) * pow((-1), (i + 2));
    K[i] = seq;
  }

  //print(K);

}

function mySelectEvent() {
  var item = sel.value();
  if (item == 'Epicycles') {
    show = true;
    angle = -PI;
    path =[];
  } else {
    show = false;
    max = 0;
  }
}

//Draw function

//I need more arrays.
let centerX = [];
let centerY = [];
let sumaX;
let sumaY;
let arrayX = [];
let arrayY = [];

function draw() {

  background(0.1);
  translate(width / 2, height / 2);
  //scale(0.7);
  
  
  if(nCircles.value() != kMax){
    path = [];
    background(0.1)
  }
  
  kMax = nCircles.value();
  

  // Polygonal curve: 
  // Uncomment if you want to see it.
  /*
  //fill(10, 130, 100);
  noFill();
  stroke(10, 130, 100);
  strokeJoin(ROUND);
  beginShape();
  for (let i = 0; i < size; i++) {
    let xpos = data.getNum(i, 'x');
    let ypos = data.getNum(i, 'y');
    vertex(xpos, -ypos);
  }
  endShape(CLOSE);
  */

  if (show == true) {//If 'show' is true, then draw epicycles.
    //The initial circle
    centerX[0] = Cx[(size + 1) / 2 - 1];
    centerY[0] = Cy[(size + 1) / 2 - 1];
    stroke(1 / centerX.length, 1, 1);
    strokeWeight(2);
    ellipse(centerX[0], -centerY[0], 2 * Rho[sortedNumbers[0] - 1]);

    // I need the centers for the rest of the epicycles.
    for (k = 1; k <= size - 1; k++) {
      sumaX = centerX[0];
      sumaY = centerY[0];
      let i = 0;
      while (i <= k - 1) {
        sumaX += Rho[sortedNumbers[i] - 1] * cos(Ang[sortedNumbers[i] - 1] * PI / 180 + angle * K[sortedNumbers[i] - 1]);
        sumaY += Rho[sortedNumbers[i] - 1] * sin(Ang[sortedNumbers[i] - 1] * PI / 180 + angle * K[sortedNumbers[i] - 1]);

        i++;
      }
      arrayX[k - 1] = sumaX;
      arrayY[k - 1] = sumaY;
    }

    //array.push(suma);
    //console.log(suma);
    //console.log(arrayX.length);
    //console.log(array);

    for (let i = 1; i < 2 * kMax; i++) {
      centerX[i] = arrayX[i - 1];
      centerY[i] = arrayY[i - 1];
    }

    // The rest of the epicycles.
    for (let i = 1; i < centerX.length; i++) {
      stroke(4 * i / (centerX.length), 1, 1);
      strokeWeight(2);
      ellipse(centerX[i], -centerY[i], 2 * Rho[sortedNumbers[i] - 1]);
    }

    // The radii connecting the epicycles.
    strokeWeight(2);
    stroke(0.8);
    for (let k = 0; k < 2 * kMax; k++) {
      //stroke((4*k ) / (2 * kMax), 1, 1);
      line(centerX[k], -centerY[k], centerX[k + 1], -centerY[k + 1]);
    }

    //The path traced by the epicycles.
    path.push(createVector(centerX[2 * kMax - 1], centerY[2 * kMax - 1]));

    strokeJoin(ROUND);
    stroke(1);
    strokeWeight(3);
    noFill();
    beginShape();
    for (var pos of path) {
      vertex(pos.x, -pos.y);
    }
    endShape();
  } else {	// If 'show' is false, then show the curve 
    				// approximated by adding terms in the 
    				// Fourier series.
    
    //The approximation curve
    let func = seriesF;
    strokeWeight(3);
    stroke(1);
    strokeJoin(ROUND);
    noFill();
    beginShape();
    for (let k = -180; k < 180; k++) {
      let vs = func(CPosX, CPosY, CNegX, CNegY, radians(k), max);
      //centerX[0], centerX[0], 
      vertex(centerX[0] + vs.x, -(centerY[0] + vs.y));
    }
    endShape(CLOSE);
    textSize(17);
    strokeWeight(0.8);
    stroke(0);
    fill(1);
    text('n=' + round(max), 0, -270);
  }

  angle += 0.007;
  max+=0.2;

  if (angle > 2.5 * PI) {
    path = [];
    angle = -PI;
  }
  
  if (max > n) {
    max = 1;
  }
  

}

//Other functions

function make2Darray(cols, rows) {
  var arr = new Array(cols);
  for (var i = 0; i < arr.length; i++) {
    arr[i] = new Array(rows);
  }
  return arr;
}

function arrayColumnsSum(array) {
  return array.reduce((a, b) => // replaces two elements in array by sum of them
    a.map((x, i) => // for every `a` element returns...
      x + // its value and...
      (b[i] || 0) // corresponding element of `b`,
      // if exists; otherwise 0
    )
  )
}

function sortFunction(a, b) {
  if (a[0] === b[0]) {
    return 0;
  } else {
    return (a[0] < b[0]) ? -1 : 1;
  }
}

function seriesF(list1, list2, list3, list4, angle, index) {
  let sumX = 0;
  let sumY = 0;
  let i = 1;
  while (i < index + 1) {

    sumX += cos(i * angle) * list1[i - 1] - sin(i * angle) * list2[i - 1] + cos(-i * angle) * list3[i - 1] - sin(-i * angle) * list4[i - 1];
    sumY += cos(i * angle) * list2[i - 1] + sin(i * angle) * list1[i - 1] + cos(-i * angle) * list4[i - 1] + sin(-i * angle) * list3[i - 1];
    i++
  }
  return createVector(sumX, sumY);
}