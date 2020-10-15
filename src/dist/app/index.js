/* eslint-disable no-undef */
let predefinedThresholdsFile = ''
let predefinedThresholds
let predefinedComputedOutlines = []
let computeSize = -1

const getThresholdsFromCsv = (thresholdFile) => {
  const res = []
  const lines = thresholdFile.split('\r\n')
  lines.forEach((line) => {
    if (line.search('ut') !== -1) return
    const buff = line.split(',')
    res.push({
      lt: parseFloat(buff[0]),
      ut: parseFloat(buff[1])
    })
  })
  return res
}

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

const nearestPoint = (point, pointsTable) => {
  if (pointsTable === undefined || pointsTable.length === 0) return
  let currentDist = 0
  let minDist = Infinity
  let nearest = {
    x: 0,
    y: 0
  }
  for (let i = 0; i < pointsTable.length; i++) {
    currentDist = Math.sqrt(Math.pow(point.x - pointsTable[i].x, 2) + Math.pow(point.y - pointsTable[i].y, 2))
    if (currentDist < minDist) {
      minDist = currentDist
      nearest = pointsTable[i]
    }
  }
  return nearest
}

const sortPointsInOrder = (data) => {
  const newData = []
  let orderedPoints = []
  const margin = 10
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
  let lastNearest = newData[Math.floor(newData.length / 2)]
  for (let i = 0; i < newData.length; i++) {
    orderedPoints.push(lastNearest)
    const buffer = remainingPoints
    remainingPoints = []
    for (let j = 0; j < buffer.length; j++) {
      if (buffer[j].x !== lastNearest.x || buffer[j].y !== lastNearest.y) {
        remainingPoints.push(buffer[j])
      }
    }
    lastNearest = nearestPoint(lastNearest, remainingPoints)
  }

  for (let i = 0; i < orderedPoints.length; i++) {
    // AFTERMESH
    if (i % 4) {
      orderedPoints[i] = undefined
    }
  }

  const meshedOrderedPoints = []
  for (let i = 0; i < orderedPoints.length; i++) {
    if (orderedPoints[i] !== undefined) {
      meshedOrderedPoints.push(orderedPoints[i])
    }
  }
  orderedPoints = meshedOrderedPoints
  console.log(window.appData)
  let toLog = 'x,y\n'
  for (let i = 0; i < orderedPoints.length; i++) {
    toLog += (orderedPoints[i].x - outlineCanvas.width / 2) + ',' + (orderedPoints[i].y - outlineCanvas.height / 2) + '\n'
  }
  console.log(toLog)

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

const meshOutlinePixels = (data) => {
  let cpt = 0
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] && data[i + 1] && data[i + 2]) {
      // PREMESH
      if (cpt % 2 !== 0) {
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
  sortPointsInOrder(data)
  return data
}

window.onload = () => {
  // When an image is loaded
  const fileInput = document.getElementById('uploadImage')
  const outlineCanvas = document.getElementById('outlineCanvas')
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
    if (predefinedThresholds === undefined) return
    lt.value = predefinedThresholds[parseInt(autoSlider.noUiSlider.get()) - 1].lt
    ut.value = predefinedThresholds[parseInt(autoSlider.noUiSlider.get()) - 1].ut
    // console.log(predefinedComputedOutlines.length)
    outlineCanvas
      .getContext('2d')
      .putImageData(
        new ImageData(new Uint8ClampedArray(
          predefinedComputedOutlines[parseInt(autoSlider.noUiSlider.get()) - 1].data),
        window.appData.width, window.appData.height),
        0,
        0)
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
        meshOutlinePixels(e.data.data)
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
