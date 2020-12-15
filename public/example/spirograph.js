/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

let s

let uri, parent, tracePath, canvasWidth, canvasHeight
let settingsDiv, buttonsDiv

let data // list of points, dataset
let size // number of points in the dataset
let n // = (size - 1)/2
let path = [] // path of the spirograph

let angle // This number traces the curve

let T = []

let kMax // Number max of orbits

const arrayC0x = []
let arrayCx = []
let arrayCy = []
let tempCx = []
let tempCy = []
// Fourier's coeff
let Cx
let Cy

let CPosX = []
let CPosY = []
let CNegX = []
let CNegY = []

let CCordX = []
let CCordY = []

let Rho = []
let indexRho = []
let sortedNumbers = []

let Ang = []

let K = []

let sel
let exportButton
let importButton
let show = true
const offset = 350

let centerX = []
let centerY = []
let sumaX
let sumaY
let arrayX = []
let arrayY = []

/*  eslint-disable-next-line prefer-const */
let aftermeshed = false
/*  eslint-disable-next-line prefer-const */
let manualPath = [[]]

let lastManualPath = []

let follow = false
let multiPaths = false
let nCircles
let showPreview = false

const controls = {
  view: { x: 0, y: 0, zoom: 1 },
  viewPos: { prevX: null, prevY: null, isDragging: false }
}

const sketch = (p) => {
  // p5 native - r
  p.preload = () => {
    if (uri === undefined) {
      uri = '../public/example/datapts.csv'
    }
    data = p.loadTable(uri, 'csv', 'header')
  }

  // Sets the drawing canvas up
  p.setup = () => {
    exportButton = p.createButton('Export').parent(buttonsDiv)
    exportButton.mousePressed(e => {
      const newData = []
      for (let i = 0; i < data.getRowCount(); i++) {
        newData.push({
          x: data.getNum(i, 'x'),
          y: data.getNum(i, 'y')
        })
      }

      const rows = [['x', 'y']]
      newData.forEach(e => {
        rows.push([e.x, e.y])
      })
      const csvContent = 'data:text/csv;charset=utf-8,' +
          rows.map(e => e.join(',')).join('\n')
      const encodedUri = encodeURI(csvContent)
      window.location = encodedUri
      console.log(encodedUri)
    })

    exampleButton = p.createButton('Examples').parent(settingsDiv)
    exampleButton.id('exampleButton')
    exampleButton.mouseReleased(e => {
      const childWin = window.open('examples.html', '_blank', 'height=400, width=550')
    })

    importButton = p.createButton('Import').parent(buttonsDiv)
    const importFileInput = p.createFileInput((file) => {
      const newData = p.loadTable(file.data, 'csv', 'header', () => {
        if (file.name.endsWith('.csv')) {
          p.resetSketch(false, undefined, newData)
        } else {
          alert('The selected file doesn\'t have the correct extension\n' +
              'Given extension : .' + file.name.split('.')[1] + '\n' +
              'Expected extension : .csv or similar')
        }
      })
    }).parent(importButton)
    importFileInput.id('importButton')
    importFileInput.hide()
    importButton.mouseReleased(e => {
      document.getElementById('importButton').click()
    })

    sketchModeLabel = p.createP('Sketch Mode :').parent(settingsDiv)
    sketchModeLabel.id('sketchModeLabel')

    sel = p.createSelect().parent(settingsDiv)
    sel.id('sketchModeSelector')
    sel.option('Epicycles')
    sel.option('Approx. Curve')
    sel.changed(p.selectSketchMode)

    speedSliderLabel = p.createP('Speed :').parent(settingsDiv)
    speedSliderLabel.id('speedSliderLabel')

    speedSlider = p.createSlider(0.0001, 0.05, 0.007, 0.0005).parent(settingsDiv)
    speedSlider.id('speedSlider')

    previewCheckbox = p.createCheckbox('Show preview', false).parent(settingsDiv)
    previewCheckbox.id('previewCheckbox')
    previewCheckbox.changed(() => {
      showPreview = !showPreview
    })
    showPreview = false

    followCheckbox = p.createCheckbox('Follow path', false).parent(settingsDiv)
    followCheckbox.id('followCheckbox')
    followCheckbox.changed(() => {
      follow = !follow
    })

    multiPathsCheckbox = p.createCheckbox('Multi-paths', false).parent(settingsDiv)
    multiPathsCheckbox.id('multiPathsCheckbox')
    multiPathsCheckbox.changed(() => {
      multiPaths = !multiPaths
      manualPath = [[]]
      lastManualPath = []
    })
    multiPaths = false

    nCirclesLabel = p.createP('Number of circles : ').parent(settingsDiv)
    nCirclesLabel.id('nCirclesLabel')

    const canvas = p.createCanvas(canvasWidth, canvasHeight).parent(parent)
    canvas.id('sketchCanvas')
    p.colorMode(p.HSB, 1, 1, 1)
    p.background(1)

    cam = new Cam(p.width / 2, p.height / 2)

    // Lets us move the canvas, zoom and drag to move enabled
    canvas.mouseWheel(e => cam.zoom(e, p))
    document.getElementById('sketchCanvas').addEventListener('mousedown', (e) => cam.mousePressed(e))
    document.getElementById('sketchCanvas').addEventListener('mousemove', (e) => cam.mouseDragged(e, p))
    document.getElementById('sketchCanvas').addEventListener('mouseup', (e) => cam.mouseReleased(e))

    angle = p.PI / 3

    p.resetSketch()
    // print(K);
  }

  // Draw function
  p.draw = () => {
    p.background(0.1)
    p.translate(cam.world.x, cam.world.y)
    p.scale(cam.view.zoom)
    if (p.keyIsDown(65)) {
      const pos = {
        x: (p.mouseX - cam.world.x) / cam.view.zoom,
        y: (p.mouseY - cam.world.y) / cam.view.zoom
      }
      const foundX = data.findRows(pos.x, 'x')
      let found = false

      if (foundX.length) {
        for (let i = 0; i < foundX.length; i++) {
          const foundY = foundX[i].getNum('y')
          if (foundY === pos.y) {
            found = true
            break
          }
        }
      }
      if (!found) {
        const newRow = data.addRow()
        newRow.setNum('x', pos.x)
        newRow.setNum('y', pos.y)
        p.resetSketch()
      }
      // 'x' keycode = 88
    } else if (p.keyIsDown(88)) {
      const pos = {
        x: (p.mouseX - cam.world.x) / cam.view.zoom,
        y: (p.mouseY - cam.world.y) / cam.view.zoom
      }
      const selectedRows = []
      const weight = 20 / cam.view.zoom
      for (let i = 0; i < size; i++) {
        if (size > data.getRowCount()) return
        const xpos = data.getNum(i, 'x')
        const ypos = data.getNum(i, 'y')
        if (pos.x >= xpos - (weight + 2) / 2 && pos.x <= xpos + (weight + 2) / 2 &&
            pos.y >= ypos - (weight + 2) / 2 && pos.y <= ypos + (weight + 2) / 2) {
          selectedRows.push(i)
        }
      }

      if (selectedRows.length && data.getRowCount() > selectedRows.length) {
        const newData = new p5.Table()
        newData.addColumn('x')
        newData.addColumn('y')
        for (let i = 0; i < size; i++) {
          if (!selectedRows.includes(i)) {
            const newRow = newData.addRow()
            newRow.setNum('x', data.getNum(i, 'x'))
            newRow.setNum('y', data.getNum(i, 'y'))
          }
        }
        data = newData
        p.resetSketch()
      }

      p.colorMode(p.RGB)
      p.stroke(255, 255, 255, 100)
      p.fill(p.color(255, 255, 255, 100))
      p.ellipse(pos.x, pos.y, weight)
      p.noFill()
      p.strokeWeight(2)
      // 'p' keycode = 80
    } else if (p.keyIsDown(80)) {
      // trace manual path

      // Current mouse position, accounting for camera zoom/position
      const pos = {
        x: (p.mouseX - cam.world.x) / cam.view.zoom,
        y: (p.mouseY - cam.world.y) / cam.view.zoom
      }

      tmpManualPath = manualPath[manualPath.length - 1]

      // Unique log when the path is started
      if (manualPath.length === 0) {
        console.log('Tracing path...')
      }

      // Prevents from pushing the same point multiple times
      if (tmpManualPath.length === 0 || distance(pos, tmpManualPath[tmpManualPath.length - 1]) > 1) {
        tmpManualPath.push(pos)
      }

      lastManualPath = tmpManualPath
      manualPath[manualPath.length - 1] = tmpManualPath

      if (tmpManualPath.length > 0) {
        p.colorMode(p.RGB)
        p.stroke(255, 255, 255, 50)
        p.strokeWeight(15)
        p.noFill()
        p.beginShape()
        for (let i = 0; i < tmpManualPath.length; i++) {
          p.vertex(tmpManualPath[i].x, tmpManualPath[i].y)
        }
        p.endShape()

        p.stroke(255, 255, 255, 100)
        p.strokeWeight(5)
        p.noFill()
        p.beginShape()
        for (let i = 0; i < tmpManualPath.length; i++) {
          p.vertex(tmpManualPath[i].x, tmpManualPath[i].y)
        }
        p.endShape()
        p.strokeWeight(2)
      }
    } else if (manualPath.length > 0 && manualPath[manualPath.length - 1] === lastManualPath) {
      // resolve manual path
      if (multiPaths) data = sortDataFromManualPathArray(data)
      else {
        data = sortDataFromManualPath(data, lastManualPath, true)
        manualPath = [[...lastManualPath]]
      }
      p.resetSketch(false)
      manualPath.push([])
      console.log(manualPath)
      console.log('Finished tracing path')
    }

    if (nCircles.value() !== kMax) {
      path = []
      p.background(0.1)
    }

    kMax = nCircles.value()

    // Polygonal curve:
    if (showPreview) {
      p.noFill()
      p.stroke(0.5)
      p.strokeJoin(p.ROUND)
      p.beginShape()
      for (let i = 0; i < size; i++) {
        const xpos = data.getNum(i, 'x')
        const ypos = data.getNum(i, 'y')
        p.vertex(xpos, ypos)
      }
      p.endShape(p.CLOSE)
    }

    for (let i = 0; i < size; i++) {
      if (data.getRowCount() < size) return
      const xpos = data.getNum(i, 'x')
      const ypos = data.getNum(i, 'y')
      // if (i === 0) console.log(p.mouseX, p.mouseY, xpos * cam.view.zoom + cam.world.x, ypos * cam.view.zoom + cam.world.y)
      if (
        (p.mouseX >= (xpos - 1) * cam.view.zoom + cam.world.x && p.mouseX <= (xpos + 1) * cam.view.zoom + cam.world.x &&
          p.mouseY >= (ypos - 1) * cam.view.zoom + cam.world.y && p.mouseY <= (ypos + 1) * cam.view.zoom + cam.world.y)) {
        p.colorMode(p.RGB)
        p.stroke(255, 255, 255)
      } else {
        p.stroke(i / size, 1, 1)
      }
      p.point(xpos, ypos)
      p.colorMode(p.HSB)
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
        if (follow) {
          cam.world.x = -centerX[kMax] * cam.view.zoom + cam.view.x + p.width / 2
          cam.world.y = -centerY[kMax] * cam.view.zoom + cam.view.y + p.height / 2
        }

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

        // The approximation curve

        p.strokeWeight(3)
        p.stroke(1)
        p.strokeJoin(p.ROUND)
        p.noFill()
        p.beginShape()
        for (let k = -180; k < 180; k += 0.2) {
          const vs = p.seriesF(p.radians(k), p.max)
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

    angle -= speedSlider.value()
    p.max += 0.2

    if (path.length > 10000) {
      path = []
    }

    if (p.max > n) {
      p.max = 1
    }
  }

  // Other functions

  // Initialisation
  // Find the epicycles fitting the dataset
  p.resetSketch = (sort, first, newData) => {
    if (sort === undefined) sort = true
    if (newData === undefined) newData = data
    data = newData
    path = []
    arrayCx = []
    arrayCy = []
    tempCx = []
    tempCy = []
    CPosX = []
    CPosY = []
    CNegX = []
    CNegY = []
    CCordX = []
    CCordY = []
    Rho = []
    indexRho = []
    sortedNumbers = [] // I did it.
    Ang = []
    K = []
    centerX = []
    centerY = []
    arrayX = []
    arrayY = []
    T = []

    if (sort) {
      data = sortPointsInOrder(data, first)
    }

    size = data.getRowCount()
    n = (size - 1) / 2

    if (nCircles !== undefined) {
      nCircles.remove()
    }

    nCircles = p.createSlider(1, n, 1).parent(settingsDiv)
    nCircles.id('nCirclesSlider')
    nCircles.changed(() => {
      p.clear()
    })

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

    for (i = 0; i < 2 * n; i++) {
      const seq = p.ceil((i + 1) / 2) * p.pow((-1), (i + 2))
      K[i] = seq
    }
  }

  // set and draw the shape
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

  p.seriesF = (angle, index) => {
    let sumX = 0
    let sumY = 0
    let i = 1
    while (i < index + 1) {
      sumX += p.cos(i * angle) * CPosX[i - 1] - p.sin(i * angle) * CPosY[i - 1] + p.cos(-i * angle) * CNegX[i - 1] - p.sin(-i * angle) * CNegY[i - 1]
      sumY += p.cos(i * angle) * CPosY[i - 1] + p.sin(i * angle) * CPosX[i - 1] + p.cos(-i * angle) * CNegY[i - 1] + p.sin(-i * angle) * CNegX[i - 1]
      i++
    }
    return p.createVector(sumX, sumY)
  }
}

/**
 * Import an example
 * @param {String} uri The uri to load
 */
importExample = (_uri) => {
  if (_uri === undefined) return
  const newData = s.loadTable(_uri, 'csv', 'header', () => {
    console.log(newData)
    s.resetSketch(false, undefined, newData)
  })
  /* if (s !== undefined) {
    s.remove()
  }
  // eslint-disable-next-line new-cap
  s = new p5(sketch) */
}

// Start drawing the spirograph
const launchSpirograph = (_uri, _parent, _tracePath, _canvasWidth, _canvasHeight) => {
  settingsDiv = document.getElementById('settingsDiv')
  buttonsDiv = document.getElementById('buttonsDiv')
  aftermeshed = false

  uri = _uri
  parent = _parent
  tracePath = _tracePath
  canvasHeight = _canvasHeight
  canvasWidth = _canvasWidth

  if (s !== undefined) {
    s.remove()
  }
  // Using p5 librairie
  // eslint-disable-next-line new-cap
  s = new p5(sketch)
}
