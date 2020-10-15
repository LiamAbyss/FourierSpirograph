/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

let s

const launchSpirograph = (uri, parent) => {
  if (s !== undefined) {
    s.remove()
  }
  let data

  let path = []

  let angle // This number traces the curve

  let size // = Length(listP)
  let n // = (size - 1)/2

  const T = []

  let kMax // Number of orbits = 2*kMax

  let arrayCx = []
  const arrayC0x = []
  let arrayCy = []
  let tempCx = []
  let tempCy = []
  let Cx
  let Cy

  const CPosX = []
  const CPosY = []
  const CNegX = []
  const CNegY = []

  const CCordX = []
  const CCordY = []

  const Rho = []
  let indexRho = []
  const sortedNumbers = [] // I did it.

  const Ang = []

  const K = []

  let sel
  let show = true
  const offset = 350

  // eslint-disable-next-line new-cap
  s = new p5((sketch) => {
  // preload table data
    sketch.preload = () => {
      if (uri === undefined) {
        uri = '../dist/example/datapts.csv'
      }
      data = sketch.loadTable(uri, 'csv', 'header')
    }

    sketch.showXYTraces = (x, y) => {
      const reversePath = [...path].reverse()
      sketch.strokeWeight(1)
      sketch.translate(offset, 0)
      sketch.colorMode(sketch.RGB)
      sketch.stroke(0, 255, 0)
      sketch.beginShape()
      for (let i = 0; i < reversePath.length; i++) {
        sketch.vertex(i, -reversePath[i].y)
      }
      sketch.endShape()
      sketch.stroke(255, 50)
      sketch.line(x - offset, -y, reversePath[0].x - x, -reversePath[0].y)

      sketch.translate(-offset, 0)

      sketch.translate(0, offset)

      sketch.stroke(0, 255, 0)
      sketch.beginShape()
      for (let i = 0; i < reversePath.length; i++) {
        sketch.vertex(reversePath[i].x, i)
      }
      sketch.endShape()

      sketch.stroke(255, 50)
      sketch.line(x, -(y + offset), reversePath[0].x, reversePath[0].y - y)

      sketch.translate(0, -offset)
      sketch.colorMode(sketch.HSB)
    }

    sketch.setup = () => {
      sketch.createCanvas(900, 900).parent(parent)
      sketch.colorMode(sketch.HSB, 1, 1, 1)
      sketch.background(0.1)

      sel = sketch.createSelect().parent(parent)
      sel.position(10, 10)
      sel.option('Epicycles')
      sel.option('Approx. Curve')
      sel.changed(sketch.mySelectEvent)

      // count the columns CodingTrain
      // print(data.getRowCount() + ' total rows in table');
      // print(data.getColumnCount() + ' total columns in table');

      // print(dataOrder.getColumn('x'));

      // print(data.getColumn('y'));
      // print(data.getNum(0, 'x'));

      angle = sketch.PI / 3
      size = data.getRowCount()
      n = (size - 1) / 2
      nCircles = sketch.createSlider(1, n, 1).parent(parent)
      nCircles.position(10, 30)
      nCircles.changed(() => {
        sketch.clear()
      })

      for (let i = 0; i < size; i++) {
        T[i] = 2 * sketch.PI * i / size
      }
      // ((sketch.cos(k Element(listT, l)) x(Element(listP, l)) + sketch.sin(k Element(listT, l)) y(Element(listP, l))) / size,
      // (sketch.cos(k Element(listT, l)) y(Element(listP, l)) - sketch.sin(k Element(listT, l)) x(Element(listP, l))) / size), l, 1, size

      arrayCx = sketch.make2Darray(size, size) // Check later the num of row and columns
      arrayCy = sketch.make2Darray(size, size)
      for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
          const scale = 1.7
          const COSX = sketch.cos((j - n) * T[i]) * scale * data.getNum(i, 'x')
          const SINX = sketch.sin((j - n) * T[i]) * scale * data.getNum(i, 'y')
          const valX = 1 / size * (COSX + SINX)
          arrayCx[i][j] = valX
          const COSY = sketch.cos((j - n) * T[i]) * scale * data.getNum(i, 'y')
          const SINY = sketch.sin((j - n) * T[i]) * scale * data.getNum(i, 'x')
          const valY = 1 / size * (COSY - SINY)
          arrayCy[i][j] = valY
        }
      }

      // Maybe I don't need this 2d array. I'll check it later
      tempCx = sketch.make2Darray(size, 2 * n + 1)
      tempCy = sketch.make2Darray(size, 2 * n + 1)
      for (var ik = 0; ik < size; ik++) {
        for (var jk = 0; jk < 2 * n + 1; jk++) {
          tempCx[ik][jk] = arrayCx[ik][jk]
          tempCy[ik][jk] = arrayCy[ik][jk]
        }
      }

      // print(tempCx)

      Cx = sketch.arrayColumnsSum(tempCx)
      Cy = sketch.arrayColumnsSum(tempCy)

      // print(Cx);

      for (i = 0; i < size - ((size + 1) / 2); i++) {
        CPosX[i] = Cx[i + (size + 1) / 2]
        CPosY[i] = Cy[i + (size + 1) / 2]
      }

      for (i = 0; i < (size + 1) / 2 - 1; i++) {
        CNegX[i] = Cx[i]
        CNegY[i] = Cy[i]
      }

      sketch.reverse(CNegX)
      sketch.reverse(CNegY)
      // print(CPosX.length);
      // print(CPosX);
      // print(CNegX);
      // print(CNegY);

      for (i = 0; i < 2 * n; i++) {
        const cond = sketch.floor(i / 2)
        if (i % 2 === 0) {
          CCordX[i] = CPosX[cond] // even
          CCordY[i] = CPosY[cond]
        } else {
          CCordX[i] = CNegX[cond] // odd
          CCordY[i] = CNegY[cond]
        }
      }

      // print(CCordY.length);
      // print(CCordX);
      // print(CCordY);

      for (i = 0; i < size - 1; i++) {
        Rho[i] = sketch.dist(0, 0, CCordX[i], CCordY[i])
        if (sketch.atan2(CCordY[i], CCordX[i]) < 0) {
          Ang[i] = (sketch.atan2(CCordY[i], CCordX[i]) + 2 * sketch.PI) * 180 / (sketch.PI) // (PI - sketch.atan2(CCordY[i], CCordX[i]) )/(2*PI);
        } else {
          Ang[i] = sketch.atan2(CCordY[i], CCordX[i]) * 180 / (sketch.PI)
        }
      }

      // I need to create a list of numbers so I can choose
      // the order of the epicycles by the size of the radii
      // from greater to smaller.
      indexRho = sketch.make2Darray(size - 1, 2)
      for (var ir = 0; ir < size - 1; ir++) {
        for (var jr = 0; jr < 2; jr++) {
          if (jr === 1) {
            indexRho[ir][jr] = ir + 1
          } else {
            indexRho[ir][jr] = Rho[ir]
          }
        }
      }

      for (let k = 0; k < size - 1; k++) {
        sortedNumbers[k] = indexRho.sort(sketch.sortFunction)[k][1]
      }

      sketch.reverse(sortedNumbers)
      // print(indRho.sort(sketch.sortFunction));
      // print(sortedNumbers);

      // RhoSorted = Rho;
      // print(Rho.length);
      // print(Rho);
      // print(Rho);
      // print(Ang.length);
      // print(Ang);

      for (i = 0; i < 2 * n; i++) {
        const seq = sketch.ceil((i + 1) / 2) * sketch.pow((-1), (i + 2))
        K[i] = seq
      }

      // print(K);
    }

    sketch.mySelectEvent = () => {
      var item = sel.value()
      if (item === 'Epicycles') {
        show = true
        angle = -sketch.PI
        path = []
      } else {
        show = false
        sketch.max = 0
      }
    }

    // Draw function

    // I need more arrays.
    const centerX = []
    const centerY = []
    let sumaX
    let sumaY
    const arrayX = []
    const arrayY = []

    sketch.draw = () => {
      sketch.background(0.1)
      sketch.translate(sketch.width / 2, sketch.height / 2)
      // scale(0.7);

      if (nCircles.value() !== kMax) {
        path = []
        sketch.background(0.1)
      }

      kMax = nCircles.value()

      // Polygonal curve:
      // Uncomment if you want to see it.
      /*
  //fill(10, 130, 100);
  noFill();
  stroke(10, 130, 100);
  strokeJoin(sketch.ROUND);
  beginShape();
  for (let i = 0; i < size; i++) {
    let xpos = data.getNum(i, 'x');
    let ypos = data.getNum(i, 'y');
    vertex(xpos, -ypos);
  }
  endShape(CLOSE);
  */

      if (show === true) { // If 'show' is true, then draw epicycles.
        // The initial circle
        centerX[0] = Cx[(size + 1) / 2 - 1]
        centerY[0] = Cy[(size + 1) / 2 - 1]
        // sketch.stroke(1 / centerX.length, 1, 1)
        // sketch.strokeWeight(2)
        sketch.stroke(255, 50)
        sketch.strokeWeight(1)
        sketch.ellipse(centerX[0], centerY[0], 2 * Rho[sortedNumbers[0] - 1])

        // I need the centers for the rest of the epicycles.
        // eslint-disable-next-line no-unmodified-loop-condition
        for (k = 1; k <= size - 1; k++) {
          sumaX = centerX[0]
          sumaY = centerY[0]
          let i = 0
          while (i <= k - 1) {
            sumaX += Rho[sortedNumbers[i] - 1] * sketch.cos(Ang[sortedNumbers[i] - 1] * sketch.PI / 180 + angle * K[sortedNumbers[i] - 1])
            sumaY += Rho[sortedNumbers[i] - 1] * sketch.sin(Ang[sortedNumbers[i] - 1] * sketch.PI / 180 + angle * K[sortedNumbers[i] - 1])

            i++
          }
          arrayX[k - 1] = sumaX
          arrayY[k - 1] = sumaY
        }

        // array.push(suma);
        // console.log(suma);
        // console.log(arrayX.length);
        // console.log(array);

        for (let i = 1; i < 2 * kMax; i++) {
          centerX[i] = arrayX[i - 1]
          centerY[i] = arrayY[i - 1]
        }

        // The rest of the epicycles.
        for (let i = 1; i < kMax; i++) {
        // HSV Colors
        // sketch.stroke(4 * i / (centerX.length), 1, 1)
        // sketch.strokeWeight(2)
          sketch.stroke(255, 50)
          sketch.strokeWeight(1)
          sketch.ellipse(centerX[i], centerY[i], 2 * Rho[sortedNumbers[i] - 1])
        }

        // The radii connecting the epicycles.
        sketch.strokeWeight(0.5)
        sketch.stroke(0.8)
        for (let k = 0; k < kMax; k++) {
          // stroke((4*k ) / (2 * kMax), 1, 1);
          sketch.line(centerX[k], centerY[k], centerX[k + 1], centerY[k + 1])
        }

        // The path traced by the epicycles.
        path.push(sketch.createVector(centerX[kMax], -centerY[kMax]))

        sketch.showXYTraces(centerX[kMax], -centerY[kMax])

        sketch.strokeJoin(sketch.ROUND)
        sketch.stroke(1)
        sketch.strokeWeight(2)
        sketch.noFill()
        sketch.beginShape()
        for (var pos of path) {
          sketch.vertex(pos.x, -pos.y)
        }
        sketch.endShape()
      } else {
        // If 'show' is false, then show the curve
        // approximated by adding terms in the
        // Fourier series.

        // // The approximation curve

        sketch.strokeWeight(3)
        sketch.stroke(1)
        sketch.strokeJoin(sketch.ROUND)
        sketch.noFill()
        sketch.beginShape()
        for (let k = -180; k < 180; k += 0.2) {
          const vs = sketch.seriesF(CPosX, CPosY, CNegX, CNegY, sketch.radians(k), sketch.max)
          // centerX[0], centerX[0],
          sketch.vertex(centerX[0] + vs.x, (centerY[0] + vs.y))
        }
        sketch.endShape(sketch.CLOSE)
        sketch.textSize(17)
        sketch.strokeWeight(0.8)
        sketch.stroke(0)
        sketch.fill(1)
        sketch.text('n=' + sketch.round(sketch.max), -270, -270)
      }

      angle -= 0.007
      sketch.max += 0.2

      if (sketch.max > n) {
        sketch.max = 1
      }
    }

    // Other functions

    sketch.make2Darray = (cols, rows) => {
      var arr = new Array(cols)
      for (var i = 0; i < arr.length; i++) {
        arr[i] = new Array(rows)
      }
      return arr
    }

    sketch.arrayColumnsSum = (array) => {
      return array.reduce((a, b) => // replaces two elements in array by sum of them
        a.map((x, i) => // for every `a` element returns...
          x + // its value and...
      (b[i] || 0) // corresponding element of `b`,
      // if exists; otherwise 0
        )
      )
    }

    sketch.sortFunction = (a, b) => {
      if (a[0] === b[0]) {
        return 0
      } else {
        return (a[0] < b[0]) ? -1 : 1
      }
    }

    sketch.seriesF = (list1, list2, list3, list4, angle, index) => {
      let sumX = 0
      let sumY = 0
      let i = 1
      while (i < index + 1) {
        sumX += sketch.cos(i * angle) * list1[i - 1] - sketch.sin(i * angle) * list2[i - 1] + sketch.cos(-i * angle) * list3[i - 1] - sketch.sin(-i * angle) * list4[i - 1]
        sumY += sketch.cos(i * angle) * list2[i - 1] + sketch.sin(i * angle) * list1[i - 1] + sketch.cos(-i * angle) * list4[i - 1] + sketch.sin(-i * angle) * list3[i - 1]
        i++
      }
      return sketch.createVector(sumX, sumY)
    }
  })
}
