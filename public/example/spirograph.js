/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

let s
// Start drawing the spirograph
const launchSpirograph = (uri, parent, tracePath, canvasWidth, canvasHeight) => {
  let data // list of points, dataset
  let size // number of points in the dataset
  let n // = (size - 1)/2
  const settingsDiv = document.getElementById('settingsDiv')
  const buttonsDiv = document.getElementById('buttonsDiv')

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
  let sortedNumbers = [] // I did it.

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

  let aftermeshed = false

  let manualPath = [[]]
  let lastManualPath = []

  let follow = false
  let nCircles

  const controls = {
    view: { x: 0, y: 0, zoom: 1 },
    viewPos: { prevX: null, prevY: null, isDragging: false }
  }

  const removeFromArray = (array, item) => {
    return array.filter(elt => {
      return elt !== item
    })
  }

  const distance = (a, b) => {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))
  }

  const sortDataFromManualPathArray = (data) => {
    const orderedPoints = []
    const newData = []
    let error = false
    for (let i = 0; i < data.getRowCount(); i++) {
      newData.push({
        x: data.getNum(i, 'x'),
        y: data.getNum(i, 'y')
      })
    }
    console.log({ newData })

    let orderedPointsFromPaths = []
    manualPath.forEach(path => {
      orderedPointsFromPaths.push(sortDataFromManualPath(newData, path, false))
      if (orderedPointsFromPaths[orderedPointsFromPaths.length - 1].length === 0) error = true
    })
    // Erase path if overridden
    const toErase = []
    for (let i = 0; i < orderedPointsFromPaths.length; i++) {
      for (let j = i + 1; j < orderedPointsFromPaths.length; j++) {
        for (let k = 0; k < orderedPointsFromPaths[j].length; k++) {
          if (orderedPointsFromPaths[i].includes(orderedPointsFromPaths[j][k]) || orderedPointsFromPaths[i].length === 0) {
            if (!toErase.includes(i)) toErase.push(i)
            break
          }
        }
      }
    }
    console.log(toErase)
    toErase.forEach((index) => {
      orderedPointsFromPaths = removeFromArray(orderedPointsFromPaths, orderedPointsFromPaths[index])
      manualPath = removeFromArray(manualPath, manualPath[index])
    })
    if (error) return data
    console.log('erased')

    // Order all sections of points
    let remainingPoints = newData
    const sections = []
    let last = orderedPointsFromPaths[0][0]
    for (let i = 0; i < orderedPointsFromPaths.length; i++) {
      console.log('begin')
      const pseudoOrderedPoints = sortPointsInOrder(remainingPoints, last)
      let currentIndex = -1
      let newSection = []

      for (let j = 0; j < pseudoOrderedPoints.length; j++) {
        for (let k = 0; k < orderedPointsFromPaths.length; k++) {
          if (pseudoOrderedPoints[j] === orderedPointsFromPaths[k][0]) {
            currentIndex = k
            break
          }
        }
        if (currentIndex !== -1) break
        newSection.push(pseudoOrderedPoints[j])
      }
      if (currentIndex === -1) return data
      orderedPointsFromPaths.forEach(path => {
        path.forEach(point => {
          if (!newSection.includes(point)) return
          newSection = removeFromArray(newSection, point)
        })
      })
      console.log(manualPath.length, currentIndex)
      if (newSection.length > 0) sections.push(newSection)
      sections.push(orderedPointsFromPaths[currentIndex])
      orderedPointsFromPaths[currentIndex].forEach((elt) => {
        remainingPoints = removeFromArray(remainingPoints, elt)
      })
      newSection.forEach((elt) => {
        remainingPoints = removeFromArray(remainingPoints, elt)
      })
      last = nearestPoint(orderedPointsFromPaths[currentIndex][orderedPointsFromPaths[currentIndex].length - 1], remainingPoints)

      console.log('end')
    }

    // Join the sections
    console.log(sections)
    for (let i = 0; i < sections.length; i++) {
      orderedPoints.push(...sections[i])
    }
    const endOrderedPoints = sortPointsInOrder(remainingPoints, last)
    orderedPoints.push(...remainingPoints)

    console.log({ orderedPoints })

    data.clearRows()
    for (let i = 0; i < orderedPoints.length; i++) {
      const newRow = data.addRow()
      newRow.setNum('x', orderedPoints[i].x)
      newRow.setNum('y', orderedPoints[i].y)
    }
    return data
  }

  // find the path from manual input on the canvas
  const sortDataFromManualPath = (data, path, end) => {
    const orderedPoints = []
    const newData = []
    if (data.getRowCount !== undefined) {
      for (let i = 0; i < data.getRowCount(); i++) {
        newData.push({
          x: data.getNum(i, 'x'),
          y: data.getNum(i, 'y')
        })
      }
    } else newData.push(...data)
    const unused = []
    const pairs = []
    // Pair each point of data with the closest point of manual path
    for (let i = 0; i < newData.length; i++) {
      let minDist = Infinity
      let point = {
        x: 0,
        y: 0
      }
      let currentDist = 0
      for (let j = 0; j < path.length; j++) {
        currentDist = distance(newData[i], path[j])
        if (currentDist < minDist && currentDist < 7) {
          minDist = currentDist
          point = path[j]
        }
      }
      if (minDist !== Infinity) {
        pairs.push({
          data: newData[i],
          path: point
        })
      } else {
        unused.push(newData[i])
      }
    }
    // Order locals points in localOrder
    for (let i = 0; i < path.length; i++) {
      const localOrder = []
      for (let j = 0; j < pairs.length; j++) {
        if (pairs[j].path === path[i]) {
          localOrder.push(pairs[j])
        }
      }
      // ordered points in localorder
      localOrder.sort((a, b) => {
        if (distance(a.data, a.path) < distance(b.data, b.path)) {
          return -1
        } else return 1
      })
      // And Add her in orderedPoints
      for (let j = 0; j < localOrder.length; j++) {
        orderedPoints.push(localOrder[j].data)
      }
    }

    if (end === true) {
      const endOrderedPoints = sortPointsInOrder(unused, nearestPoint(orderedPoints[orderedPoints.length - 1], unused))

      orderedPoints.push(...endOrderedPoints)
    }

    if (data.getRowCount !== undefined) {
      data.clearRows()
      for (let i = 0; i < orderedPoints.length; i++) {
        const newRow = data.addRow()
        newRow.setNum('x', orderedPoints[i].x)
        newRow.setNum('y', orderedPoints[i].y)
      }
      return data
    } else return orderedPoints
  }
  // finds the nearest point in a table
  const nearestPoint = (point, pointsTable) => {
    if (pointsTable === undefined || pointsTable.length === 0) return
    let currentDist = 0
    let minDist = Infinity
    let nearest = {
      x: 0,
      y: 0
    }
    for (let i = 0; i < pointsTable.length; i++) {
      currentDist = distance(point, pointsTable[i])
      if (currentDist < minDist) {
        minDist = currentDist
        nearest = pointsTable[i]
      }
    }
    return nearest
  }

  // Sort Points in a dataset so that each point is the nearest from its neighbour
  const sortPointsInOrder = (data, first) => {
    const newData = []
    if (data.getRowCount !== undefined) {
      for (let i = 0; i < data.getRowCount(); i++) {
        newData.push({
          x: data.getNum(i, 'x'),
          y: data.getNum(i, 'y')
        })
      }
    } else newData.push(...data)
    if (first === undefined) first = newData[newData.length - 1]
    const outlineCanvas = document.getElementById('outlineCanvas')
    let orderedPoints = []

    let remainingPoints = newData

    let lastNearest = first
    for (let i = 0; i < newData.length; i++) {
      orderedPoints.push(lastNearest)
      remainingPoints = removeFromArray(remainingPoints, lastNearest)
      lastNearest = nearestPoint(lastNearest, remainingPoints)
      if (lastNearest === undefined) {
        break
      }
    }

    const meshedOrderedPoints = []
    if (!aftermeshed) {
      const aftermeshSel = document.getElementById('aftermesh')
      for (let i = 0; i < orderedPoints.length; i++) {
      // AFTERMESH : drop points after sorting the dataset
        if (i % aftermeshSel.value) {
          orderedPoints[i] = undefined
        }
      }
      aftermeshed = true

      for (let i = 0; i < orderedPoints.length; i++) {
        if (orderedPoints[i] !== undefined) {
          orderedPoints[i].x = orderedPoints[i].x - outlineCanvas.width / 2
          orderedPoints[i].y = orderedPoints[i].y - outlineCanvas.height / 2
          meshedOrderedPoints.push(orderedPoints[i])
        }
      }
      orderedPoints = meshedOrderedPoints
      if (orderedPoints.length % 2 === 0 && orderedPoints.length) {
        orderedPoints.length = orderedPoints.length - 1
      }
    }

    if (data.getRowCount !== undefined) {
      data.clearRows()
      for (let i = 0; i < orderedPoints.length; i++) {
        if (orderedPoints[i] === undefined) continue
        const newRow = data.addRow()
        newRow.setNum('x', orderedPoints[i].x)
        newRow.setNum('y', orderedPoints[i].y)
      }
      return data
    } else return orderedPoints
  }

  // eslint-disable-next-line new-cap

  if (s !== undefined) {
    s.remove()
  }
  // Using p5 librairie
  // eslint-disable-next-line new-cap
  s = new p5((p) => {
    // From https://github.com/nenadV91/p5_zoom

    // preload table data
    p.preload = () => {
      if (uri === undefined) {
        uri = '../public/example/datapts.csv'
      }
      data = p.loadTable(uri, 'csv', 'header')
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
      })

      importButton = p.createButton('Import').parent(buttonsDiv)
      const importFileInput = p.createFileInput((file) => {
        const newData = p.loadTable(file.data, 'csv', 'header', () => {
          if (file.name.endsWith('.csv')) {
            p.resetSketch(true, undefined, newData)
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

      followCheckbox = p.createCheckbox('Follow path', false).parent(settingsDiv)
      followCheckbox.id('followCheckbox')
      followCheckbox.changed(() => {
        follow = !follow
      })

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
      } else if (p.keyIsDown(70)) {
        for (let i = 0; i < size; i++) {
          if (data.getRowCount() < size) return
          const xpos = data.getNum(i, 'x')
          const ypos = data.getNum(i, 'y')
          if ((p.mouseX >= (xpos - 1) * cam.view.zoom + cam.world.x && p.mouseX <= (xpos + 1) * cam.view.zoom + cam.world.x &&
            p.mouseY >= (ypos - 1) * cam.view.zoom + cam.world.y && p.mouseY <= (ypos + 1) * cam.view.zoom + cam.world.y)) {
            // set first point
            p.resetSketch(true, {
              x: xpos,
              y: ypos
            })
          }
        }
      } else if (p.keyIsDown(80)) {
        // trace manual path
        const pos = {
          x: (p.mouseX - cam.world.x) / cam.view.zoom,
          y: (p.mouseY - cam.world.y) / cam.view.zoom
        }
        tmpManualPath = manualPath[manualPath.length - 1]
        if (manualPath.length === 0) {
          console.log('Tracing path...')
        }
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
        data = sortDataFromManualPathArray(data)
        p.setSetup(false)
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
      // Uncomment if you want to see it.
      p.noFill()
      p.stroke(10, 130, 100)
      p.strokeJoin(p.ROUND)
      // p.beginShape()
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
