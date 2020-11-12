/* eslint-disable no-undef */
let predefinedThresholdsFile = ''
let predefinedThresholds
let predefinedComputedOutlines = []
let computeSize = -1
let outlineResults
let premeshSel
let aftermeshSel

//gets predifined thresholds from a file and return them as a list
const getThresholdsFromCsv = (thresholdFile) => {
  const res = []
  const lines = thresholdFile.split('\r\n')
  lines.forEach((line) => {
    if (line.search('ut') !== -1) return
    const buff = line.split(',')
    //push upper and lower threshold is res
    res.push({
      lt: parseFloat(buff[0]),
      ut: parseFloat(buff[1])
    })
  })
  return res
}

//ATTENTION : noter qu'il faut peut etre changer le nom de la fonction ?
//gets the text from a csv file to set the predefined thresholds
const getText = (url) => {
  // read text from URL location
  var request = new XMLHttpRequest()
  request.open('GET', url, true)
  request.send(null)
  request.onreadystatechange = function () {
    if (request.readyState === 4 && request.status === 200) {
      predefinedThresholdsFile = request.responseText
      predefinedThresholds = getThresholdsFromCsv(predefinedThresholdsFile)
    }
  }
}

getText('../dist/app/autoThresholds.csv')

//finds the nearest neighbour of a point from a table of points 
const nearestPoint = (point, pointsTable) => {
  if (pointsTable === undefined || pointsTable.length === 0) return
  let currentDist = 0
  let minDist = Infinity
  let nearest = {
    x: 0,
    y: 0
  }
  //for each?
  /**
   * pointsTable.forEach((i) => {
   *  currentDist = Math.sqrt(Math.pow(point.x - i.x, 2) + Math.pow(point.y - i.y, 2))
   *  if (currentDist < minDist) {
        minDist = currentDist
        nearest = pointsTable[i]
      }
   * })
   */
  for (let i = 0; i < pointsTable.length; i++) {
    currentDist = Math.sqrt(Math.pow(point.x - pointsTable[i].x, 2) + Math.pow(point.y - pointsTable[i].y, 2))
    if (currentDist < minDist) {
      minDist = currentDist
      nearest = pointsTable[i]
    }newData
    // FIRST METHOD
  
  }
  return nearest
}

//returns a list of points so that every point is the nearest for the previous and the next point
//smooths the lines by removing some points
const sortPointsInOrder = (data, margin) => {
  const newData = []
  let orderedPoints = []

  //remove some points to reduce the total number of points
  //save one out of 4
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] && data[i + 1] && data[i + 2]) {
      if (((i / 4) % window.appData.width > margin && (i / 4) % window.appData.width < outlineCanvas.width - margin) &&
      (Math.floor(i / window.appData.width / 4) > margin && Math.floor(i / window.appData.width / 4) < outlineCanvas.height - margin)) {
        newData.push({
          x: (i / 4) % window.appData.width,
          y: Math.floor(i / window.appData.width / 4)
        })
      }
    }
  }

  let remainingPoints = newData
  // FIRST METHOD

  let lastNearest = newData[newData.length - 1]
  for (let i = 0; i < newData.length; i++) {
    orderedPoints.push(lastNearest)
    const buffer = remainingPoints
    remainingPoints = []
    //remove the last Nearest from the point list
    for (let j = 0; j < buffer.length; j++) {
      if (buffer[j].x !== lastNearest.x || buffer[j].y !== lastNearest.y) {
        remainingPoints.push(buffer[j])
      }
    }
    //find the nearest point from current
    lastNearest = nearestPoint(lastNearest, remainingPoints)
  }

  // SECOND METHOD THAT HAS TO BE REWORK BY LIAMABYSS
  /*
  const beginPoint = newData[0]
  const endPoint = nearestPoint(beginPoint, remainingPoints)
  let lastNearest = beginPoint
  let lastEndNearest = endPoint
  const endOrderedPoints = []
  // let lastNearest = newData[Math.floor(newData.length / 2)]
  for (let i = 0; i < newData.length / 2; i++) {
    if (lastNearest !== undefined) {
      orderedPoints.push(lastNearest)
      const buffer = remainingPoints
      remainingPoints = []
      for (let j = 0; j < buffer.length; j++) {
        if (buffer[j].x !== lastEndNearest.x || buffer[j].y !== lastEndNearest.y) {
          remainingPoints.push(buffer[j])
        }
      }
      lastNearest = nearestPoint(lastNearest, remainingPoints)
    }

    if (lastEndNearest !== undefined) {
      endOrderedPoints.push(lastEndNearest)
      const buffer = remainingPoints
      remainingPoints = []
      for (let j = 0; j < buffer.length; j++) {
        if (buffer[j].x !== lastNearest.x || buffer[j].y !== lastNearest.y) {
          remainingPoints.push(buffer[j])
        }
      }
      lastEndNearest = nearestPoint(lastEndNearest, remainingPoints)
    }
  }

  for (let i = endOrderedPoints.length - 1; i >= 0; i--) {
    orderedPoints.push(endOrderedPoints[i])
  }
  */

  //remove some points
  for (let i = 0; i < orderedPoints.length; i++) {
    // AFTERMESH
    if (i % aftermeshSel.value) {
      orderedPoints[i] = undefined
    }
  }
  const meshedOrderedPoints = []
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

  //don't know if I have to remove that
  console.log(window.appData)
  let toLog = 'x,y\n'
  for (let i = 0; i < orderedPoints.length; i++) {
    toLog += (orderedPoints[i].x - outlineCanvas.width / 2) + ',' + (orderedPoints[i].y - outlineCanvas.height / 2) + '\n'
  }
  console.log(toLog)

  //ask Pauk et Mimi
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 0
    data[i + 1] = 0
    data[i + 2] = 0
    data[i + 3] = 255
  }
  outlineCanvas
    .getContext('2d')
    .putImageData(
      new ImageData(new Uint8ClampedArray(
        data),
      window.appData.width, window.appData.height),
      0,
      0)
  for (let i = 0; i < orderedPoints.length; i++) {
    const tmp = 4 * (window.appData.width * orderedPoints[i].y + orderedPoints[i].x)
    data[tmp] = i % 255
    data[tmp + 1] = 255
    data[tmp + 2] = 0
    data[tmp + 3] = 255
  }
  outlineCanvas
    .getContext('2d')
    .putImageData(
      new ImageData(new Uint8ClampedArray(
        data),
      window.appData.width, window.appData.height),
      0,
      0)
    
  return orderedPoints
}

const meshOutlinePixels = (data, margin) => {
  if (data === undefined || data.length === 0) return
  let cpt = 0
  for (let i = 0; i < data.length; i += 4) {
    //why not data[i+3] ?
    if (data[i] && data[i + 1] && data[i + 2]) {
      // PREMESH
      if (cpt % premeshSel.value !== 0) {
        data[i] = 0
        data[i + 1] = 0
        data[i + 2] = 0
      }
    }
    cpt++
  }
  outlineCanvas
    .getContext('2d')
    .putImageData(
      new ImageData(new Uint8ClampedArray(
        data),
      window.appData.width, window.appData.height),
      0,
      0)

  const orderedPoints = sortPointsInOrder(data, margin)
  if (orderedPoints.length === 0) return
  const rows = [['x', 'y']]
  orderedPoints.forEach(e => {
    rows.push([e.x, e.y])
  })
  const csvContent = 'data:text/csv;charset=utf-8,' +
    rows.map(e => e.join(',')).join('\n')
  const encodedUri = encodeURI(csvContent)
  launchSpirograph(encodedUri, 'outlineResults', true, outlineResults.offsetWidth - 50, outlineResults.offsetHeight - 50)

  return data
}


// 
window.onload = () => {
  // When an image is loaded
  outlineResults = document.getElementById('outlineResults')
  premeshSel = document.getElementById('premesh')
  aftermeshSel = document.getElementById('aftermesh')
  const fileInput = document.getElementById('uploadImage')
  const outlineCanvas = document.getElementById('outlineCanvas')
  const marginInput = document.getElementById('imageMargin')
  let imgd

  function previewImage () {
    var oFReader = new FileReader()
    oFReader.readAsDataURL(fileInput.files[0])

    oFReader.onload = function (oFREvent) {
      document.getElementById('uploadedImage').src = oFREvent.target.result
    }
    readFileAsDataURL(fileInput.files[0])
      .then(loadImage)
      .then(setCanvasSizeFromImage(outlineCanvas))
      .then(drawImageOnCanvas(outlineCanvas))
      .then((img) => {
        window.appData = {
          img,
          width: img.naturalWidth,
          height: img.naturalHeight
        }
        imgd = outlineCanvas
          .getContext('2d')
          .getImageData(0, 0, window.appData.width, window.appData.height)
      })
    marginInput.setAttribute('max', Math.min(outlineCanvas.width, outlineCanvas.height))
  };
  fileInput.addEventListener('input', previewImage)

  const slider = document.getElementById('thresholdSlider')
  const autoSlider = document.getElementById('autoThresholdSlider')
  const lt = document.getElementById('lt')
  const ut = document.getElementById('ut')

  // Create and handle slider
  // eslint-disable-next-line no-undef
  noUiSlider.create(slider, {
    start: [0, 1],
    step: 0.01,
    connect: true,
    range: {
      min: 0.01,
      max: 0.99
    }
  })
  slider.noUiSlider.on('update', () => {
    lt.value = slider.noUiSlider.get()[0]
    ut.value = slider.noUiSlider.get()[1]
  })

  lt.addEventListener('change', () => {
    if (toggleThresholdButton.toggled) {
      if (lt.value > ut.value) { lt.value = ut.value }
      return
    }
    slider.noUiSlider.set([lt.value, null])
  })

  ut.addEventListener('change', () => {
    if (toggleThresholdButton.toggled) {
      if (ut.value < lt.value) { ut.value = lt.value }
      return
    }
    slider.noUiSlider.set([null, ut.value])
  })

  noUiSlider.create(autoSlider, {
    start: [1],
    step: 1,
    connect: ['lower', 'upper'],
    range: {
      min: 1,
      max: 20
    }
  })
  autoSlider.setAttribute('disabled', true)

  autoSlider.noUiSlider.on('update', () => {
    if (predefinedThresholds === undefined || predefinedComputedOutlines.length === 0) return
    lt.value = predefinedThresholds[parseInt(autoSlider.noUiSlider.get()) - 1].lt
    ut.value = predefinedThresholds[parseInt(autoSlider.noUiSlider.get()) - 1].ut
    // console.log(predefinedComputedOutlines.length)
    // outlineCanvas
    //   .getContext('2d')
    //   .putImageData(
    //     new ImageData(new Uint8ClampedArray(
    //       predefinedComputedOutlines[parseInt(autoSlider.noUiSlider.get()) - 1].data),
    //     window.appData.width, window.appData.height),
    //     0,
    //     0)

    meshOutlinePixels([...predefinedComputedOutlines[parseInt(autoSlider.noUiSlider.get()) - 1].data], marginInput.value)
  })

  // Toggle Sliders
  const toggleThresholdButton = document.getElementById('toggleThreshold')
  toggleThresholdButton.toggled = false
  toggleThresholdButton.addEventListener('click', () => {
    if (imgd === undefined) return
    if (toggleThresholdButton.toggled) {
      autoSlider.style.display = 'none'
      slider.style.display = 'initial'
      toggleThresholdButton.innerText = 'Show automatic threshold choices'
      autoSlider.setAttribute('disabled', true)
      slider.removeAttribute('disabled')
    } else {
      autoSlider.style.display = 'initial'
      slider.style.display = 'none'
      toggleThresholdButton.innerText = 'Show manual threshold choices'
      slider.setAttribute('disabled', true)
      // autoSlider.removeAttribute('disabled')

      // const loadingText = document.getElementById('autoThresholdSlider')
      // loadingText.innerHTML = loadingText.innerHTML + '<p id="outlineLoadWarning">Loading</p>'

      predefinedComputedOutlines = []
      computeSize = predefinedThresholds.length - 1
      for (let i = 0; i < predefinedThresholds.length; i++) {
        predefinedComputedOutlines.push({
          lt: predefinedThresholds[i].lt,
          ut: predefinedThresholds[i].ut
        })
      }
      for (let i = 0; i < predefinedThresholds.length; i++) {
        window.appData.lt = parseFloat(predefinedThresholds[i].lt)
        window.appData.ut = parseFloat(predefinedThresholds[i].ut)
        initWorker()
        worker.postMessage({
          cmd: 'appData',
          data: {
            width: window.appData.width,
            height: window.appData.height,
            ut: window.appData.ut,
            lt: window.appData.lt
          }
        })
        const pixels = imgd.data
        worker.postMessage({ cmd: 'imgData', data: pixels })
      }
    }
    toggleThresholdButton.toggled = !toggleThresholdButton.toggled
  })

  // Outline submission
  window.appData = {}
  let worker
  function initWorker () {
    worker = new Worker('../dist/outline/worker.js')
    worker.addEventListener('message', onWorkerMessage, false)
  }

  function onWorkerMessage (e) {
    const drawBytesOnCanvasForImg = drawBytesOnCanvas(window.appData.width, window.appData.height)
    if (e.data.type === 'gradientMagnitude') {
      if (computeSize < 0) {
        // console.log(e.data.threshold)
        drawBytesOnCanvasForImg(outlineCanvas, e.data.data)
        meshOutlinePixels(e.data.data, marginInput.value)
      } else if (computeSize >= 0) {
        for (let i = 0; i < predefinedComputedOutlines.length; i++) {
          if (predefinedComputedOutlines[i].ut === e.data.threshold.ut &&
            predefinedComputedOutlines[i].lt === e.data.threshold.lt) {
            predefinedComputedOutlines[i].data = e.data.data
          }
        }
        console.log(computeSize)
        if (computeSize === 0) {
          drawBytesOnCanvasForImg(outlineCanvas, predefinedComputedOutlines[0].data)
          computeSize = -1
          autoSlider.removeAttribute('disabled')
          return
        }
        computeSize--
      }
    }
  }

  const outlineButton = document.getElementById('outlineSubmit')
  outlineButton.addEventListener('click', () => {
    window.appData.lt = parseFloat(lt.value)
    window.appData.ut = parseFloat(ut.value)
    initWorker()
    worker.postMessage({
      cmd: 'appData',
      data: {
        width: window.appData.width,
        height: window.appData.height,
        ut: window.appData.ut,
        lt: window.appData.lt
      }
    })
    const pixels = imgd.data
    worker.postMessage({ cmd: 'imgData', data: pixels })
  })

  document.addEventListener('keypress', (ev) => {
    if (ev.key === 'Enter') {
      const trigger = document.createEvent('HTMLEvents')
      trigger.initEvent('click', true, true)
      trigger.eventName = 'click'
      outlineButton.dispatchEvent(trigger)
    }
  })
}
