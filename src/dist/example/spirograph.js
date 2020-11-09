/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

let s

const launchSpirograph = (uri, parent, tracePath, canvasWidth, canvasHeight) => {
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
  s = new p5((p) => {
  // preload table data
    p.preload = () => {
      if (uri === undefined) {
        uri = '../dist/example/datapts.csv'
      }
      data = p.loadTable(uri, 'csv', 'header')
    }

    p.showXYTraces = (x, y) => {
      const reversePath = [...path].reverse()
      p.strokeWeight(1)
      p.translate(offset, 0)
      p.colorMode(p.RGB)
      p.stroke(0, 255, 0)
      p.beginShape()
      for (let i = 0; i < reversePath.length; i++) {
        p.vertex(i, -reversePath[i].y)
      }
      p.endShape()
      p.stroke(255, 50)
      p.line(x - offset, -y, reversePath[0].x - x, -reversePath[0].y)

      p.translate(-offset, 0)

      p.translate(0, offset)

      p.stroke(0, 255, 0)
      p.beginShape()
      for (let i = 0; i < reversePath.length; i++) {
        p.vertex(reversePath[i].x, i)
      }
      p.endShape()

      p.stroke(255, 50)
      p.line(x, -(y + offset), reversePath[0].x, reversePath[0].y - y)

      p.translate(0, -offset)
      p.colorMode(p.HSB)
    }

    p.setup = () => {
      const canvas = p.createCanvas(canvasWidth, canvasHeight).parent(parent)
      canvas.id('sketchCanvas')
      p.colorMode(p.HSB, 1, 1, 1)
      p.background(1)

      sel = p.createSelect().parent(parent)
      sel.id('sketchModeSelector')
      sel.option('Epicycles')
      sel.option('Approx. Curve')
      sel.changed(p.selectSketchMode)

      nCircles = p.createSlider(1, n, 1).parent(parent)
      nCircles.id('nCirclesSlider')
      nCircles.changed(() => {
        p.clear()
      })

      angle = p.PI / 3
      size = data.getRowCount()
      n = (size - 1) / 2

      for (let i = 0; i < size; i++) {
        T[i] = 2 * p.PI * i / size
      }
      // ((p.cos(k Element(listT, l)) x(Element(listP, l)) + p.sin(k Element(listT, l)) y(Element(listP, l))) / size,
      // (p.cos(k Element(listT, l)) y(Element(listP, l)) - p.sin(k Element(listT, l)) x(Element(listP, l))) / size), l, 1, size

      arrayCx = p.make2Darray(size, size) // Check later the num of row and columns
      arrayCy = p.make2Darray(size, size)
      for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
          const scale = 1
          const COSX = p.cos((j - n) * T[i]) * scale * data.getNum(i, 'x')
          const SINX = p.sin((j - n) * T[i]) * scale * data.getNum(i, 'y')
          const valX = 1 / size * (COSX + SINX)
          arrayCx[i][j] = valX
          const COSY = p.cos((j - n) * T[i]) * scale * data.getNum(i, 'y')
          const SINY = p.sin((j - n) * T[i]) * scale * data.getNum(i, 'x')
          const valY = 1 / size * (COSY - SINY)
          arrayCy[i][j] = valY
        }
      }

      // Maybe I don't need this 2d array. I'll check it later
      tempCx = p.make2Darray(size, 2 * n + 1)
      tempCy = p.make2Darray(size, 2 * n + 1)
      for (var ik = 0; ik < size; ik++) {
        for (var jk = 0; jk < 2 * n + 1; jk++) {
          tempCx[ik][jk] = arrayCx[ik][jk]
          tempCy[ik][jk] = arrayCy[ik][jk]
        }
      }

      // print(tempCx)

      Cx = p.arrayColumnsSum(tempCx)
      Cy = p.arrayColumnsSum(tempCy)

      // print(Cx);

      for (i = 0; i < size - ((size + 1) / 2); i++) {
        CPosX[i] = Cx[i + (size + 1) / 2]
        CPosY[i] = Cy[i + (size + 1) / 2]
      }

      for (i = 0; i < (size + 1) / 2 - 1; i++) {
        CNegX[i] = Cx[i]
        CNegY[i] = Cy[i]
      }

      p.reverse(CNegX)
      p.reverse(CNegY)
      // print(CPosX.length);
      // print(CPosX);
      // print(CNegX);
      // print(CNegY);

      for (i = 0; i < 2 * n; i++) {
        const cond = p.floor(i / 2)
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
        Rho[i] = p.dist(0, 0, CCordX[i], CCordY[i])
        if (p.atan2(CCordY[i], CCordX[i]) < 0) {
          Ang[i] = (p.atan2(CCordY[i], CCordX[i]) + 2 * p.PI) * 180 / (p.PI) // (PI - p.atan2(CCordY[i], CCordX[i]) )/(2*PI);
        } else {
          Ang[i] = p.atan2(CCordY[i], CCordX[i]) * 180 / (p.PI)
        }
      }

      // I need to create a list of numbers so I can choose
      // the order of the epicycles by the size of the radii
      // from greater to smaller.
      indexRho = p.make2Darray(size - 1, 2)
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
        sortedNumbers[k] = indexRho.sort(p.sortFunction)[k][1]
      }

      p.reverse(sortedNumbers)
      // print(indRho.sort(p.sortFunction));
      // print(sortedNumbers);

      // RhoSorted = Rho;
      // print(Rho.length);
      // print(Rho);
      // print(Rho);
      // print(Ang.length);
      // print(Ang);

      for (i = 0; i < 2 * n; i++) {
        const seq = p.ceil((i + 1) / 2) * p.pow((-1), (i + 2))
        K[i] = seq
      }

      // print(K);
    }

    p.selectSketchMode = () => {
      var item = sel.value()
      if (item === 'Epicycles') {
        show = true
        angle = -p.PI
        path = []
      } else {
        show = false
        p.max = 0
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

    p.draw = () => {
      p.background(0.1)
      p.translate(p.width / 2, p.height / 2)
      // scale(0.7);

      // p.scale(sf)

      if (nCircles.value() !== kMax) {
        path = []
        p.background(0.1)
      }

      kMax = nCircles.value()

      // Polygonal curve:
      // Uncomment if you want to see it.
      p.noFill()
      p.stroke(10, 130, 100)
      p.strokeJoin(p.ROUND)
      // p.beginShape()
      p.colorMode(p.HSB)
      for (let i = 0; i < size; i++) {
        const xpos = data.getNum(i, 'x')
        const ypos = data.getNum(i, 'y')
        p.stroke(i / size, 1, 1)
        p.point(xpos, ypos)
      }
      // p.endShape(p.CLOSE)
      if (tracePath) {
        if (show === true) { // If 'show' is true, then draw epicycles.
        // The initial circle
          centerX[0] = Cx[(size + 1) / 2 - 1]
          centerY[0] = Cy[(size + 1) / 2 - 1]
          // p.stroke(1 / centerX.length, 1, 1)
          // p.strokeWeight(2)
          p.stroke(255, 50)
          p.strokeWeight(1)
          p.ellipse(centerX[0], centerY[0], 2 * Rho[sortedNumbers[0] - 1])

          // I need the centers for the rest of the epicycles.
          // eslint-disable-next-line no-unmodified-loop-condition
          for (k = 1; k <= size - 1; k++) {
            sumaX = centerX[0]
            sumaY = centerY[0]
            let i = 0
            while (i <= k - 1) {
              sumaX += Rho[sortedNumbers[i] - 1] * p.cos(Ang[sortedNumbers[i] - 1] * p.PI / 180 + angle * K[sortedNumbers[i] - 1])
              sumaY += Rho[sortedNumbers[i] - 1] * p.sin(Ang[sortedNumbers[i] - 1] * p.PI / 180 + angle * K[sortedNumbers[i] - 1])

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
            // p.stroke(4 * i / (centerX.length), 1, 1)
            // p.strokeWeight(2)
            p.stroke(255, 50)
            p.strokeWeight(1)
            p.ellipse(centerX[i], centerY[i], 2 * Rho[sortedNumbers[i] - 1])
          }

          // The radii connecting the epicycles.
          p.strokeWeight(0.5)
          p.stroke(0.8)
          for (let k = 0; k < kMax; k++) {
          // stroke((4*k ) / (2 * kMax), 1, 1);
            p.line(centerX[k], centerY[k], centerX[k + 1], centerY[k + 1])
          }

          // The path traced by the epicycles.
          path.push(p.createVector(centerX[kMax], -centerY[kMax]))

          p.showXYTraces(centerX[kMax], -centerY[kMax])

          p.strokeJoin(p.ROUND)
          p.stroke(1)
          p.strokeWeight(2)
          p.noFill()
          p.beginShape()
          for (var pos of path) {
            p.vertex(pos.x, -pos.y)
          }
          p.endShape()
        } else {
        // If 'show' is false, then show the curve
        // approximated by adding terms in the
        // Fourier series.

          // // The approximation curve

          p.strokeWeight(3)
          p.stroke(1)
          p.strokeJoin(p.ROUND)
          p.noFill()
          p.beginShape()
          for (let k = -180; k < 180; k += 0.2) {
            const vs = p.seriesF(CPosX, CPosY, CNegX, CNegY, p.radians(k), p.max)
            // centerX[0], centerX[0],
            p.vertex(centerX[0] + vs.x, (centerY[0] + vs.y))
          }
          p.endShape(p.CLOSE)
          p.textSize(17)
          p.strokeWeight(0.8)
          p.stroke(0)
          p.fill(1)
          p.text('n=' + p.round(p.max), -270, -270)
        }
      }

      angle -= 0.007
      p.max += 0.2

      if (path.length > 10000) {
        path = []
      }

      if (p.max > n) {
        p.max = 1
      }
    }

    // Other functions

    p.make2Darray = (cols, rows) => {
      var arr = new Array(cols)
      for (var i = 0; i < arr.length; i++) {
        arr[i] = new Array(rows)
      }
      return arr
    }

    p.arrayColumnsSum = (array) => {
      if (array === undefined || array.length === 0) {
        s.remove()
        return
      }
      return array.reduce((a, b) => // replaces two elements in array by sum of them
        a.map((x, i) => // for every `a` element returns...
          x + // its value and...
      (b[i] || 0) // corresponding element of `b`,
      // if exists; otherwise 0
        )
      )
    }

    p.sortFunction = (a, b) => {
      if (a[0] === b[0]) {
        return 0
      } else {
        return (a[0] < b[0]) ? -1 : 1
      }
    }

    p.seriesF = (list1, list2, list3, list4, angle, index) => {
      let sumX = 0
      let sumY = 0
      let i = 1
      while (i < index + 1) {
        sumX += p.cos(i * angle) * list1[i - 1] - p.sin(i * angle) * list2[i - 1] + p.cos(-i * angle) * list3[i - 1] - p.sin(-i * angle) * list4[i - 1]
        sumY += p.cos(i * angle) * list2[i - 1] + p.sin(i * angle) * list1[i - 1] + p.cos(-i * angle) * list4[i - 1] + p.sin(-i * angle) * list3[i - 1]
        i++
      }
      return p.createVector(sumX, sumY)
    }
  })
}
