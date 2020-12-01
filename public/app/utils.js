/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
let predefinedThresholdsFile = ''
let computeSize = -1

/**
 * Event listener on 'openbtn', toggles settings sidebar visibility.
 */
// eslint-disable-next-line no-unused-vars
const toggleNav = () => {
  const sidebar = document.getElementById('settingsSidebar')
  if (sidebar.style.width === '250px') {
    document.getElementsByClassName('openbtn')[0].innerHTML = '☰ Open Settings'
    sidebar.style.width = '0px'
  } else {
    sidebar.style.width = '250px'
    document.getElementsByClassName('openbtn')[0].innerHTML = '╳ Close Settings'
  }
}

/**
   * @typedef {Object} ThresholdPair
   * @property {number} lt - The lower threshold
   * @property {number} ut - The upper threshold
   */

/**
   * Reads predefined threshold pairs from given .csv file and returns object list.
   * @param {string} thresholdFile
   * @returns {ThresholdPair[]}
   */
const getThresholdsFromCsv = (thresholdFile) => {
  const res = []
  const lines = thresholdFile.split('\r\n')
  lines.forEach((line) => {
    if (line.search('ut') !== -1) return
    const buff = line.split(',')
    // push upper and lower threshold in res
    res.push({
      lt: parseFloat(buff[0]),
      ut: parseFloat(buff[1])
    })
  })
  return res
}

/**
   * Requests the given file URL and sets the global variable predefinedThresholds
   * @param {string} url - URL of the file containing the predefined thresholds
   */
const setPredfinedThresholds = (url) => {
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

setPredfinedThresholds('../public/app/autoThresholds.csv')

/**
   * Applies blind mesh to given data : keeps one in (premeshSel.value) data points.
   * @param {int[]} data - RGBA pixel array
   * @returns {int[]} - Meshed RGBA pixel array
   */
const applyPremesh = (data) => {
  if (data === undefined || data.length === 0) return
  let cpt = 0
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] && data[i + 1] && data[i + 2]) {
      if (cpt % premeshSel.value !== 0) {
        data[i] = 0
        data[i + 1] = 0
        data[i + 2] = 0
      }
    }
    cpt++
  }
  return data
}

/**
   * @typedef {Object} Point
   * @property {number} x - The X coordinate
   * @property {number} y - The Y coordinate
   */

/**
   * Ignores pixels closer to the image border than the set margin.
   * Reshapes data as point list.
   * @param {int[]} data - RGBA pixel array
   * @param {int} margin - Distance to border (px)
   * @returns {Point[]} - Point list
   */
const applyMargin = (data, margin) => {
  const newData = []

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
  return newData
}

/**
   * Formats data as CSV to be sent to the spirogragp
   * @param {Point[]} newData - Point list
   * @returns {string} - Point CSV
   */
const makeCSV = (newData) => {
  if (newData.length === 0) return
  const rows = [['x', 'y']]
  newData.forEach(e => {
    rows.push([e.x, e.y])
  })
  const csvContent = 'data:text/csv;charset=utf-8,' +
      rows.map(e => e.join(',')).join('\n')
  const encodedUri = encodeURI(csvContent)
  return encodedUri
}

/**
   * Decides what is to be done when the worker has finished.
   * Launches spirograph if no other computations are running.
   * @param {event} e - The message event sent by the worker
   */
const onWorkerMessage = (e) => {
  const drawBytesOnCanvasForImg = drawBytesOnCanvas(window.appData.width, window.appData.height)
  if (e.data.type === 'gradientMagnitude') {
    if (computeSize < 0) {
      drawBytesOnCanvasForImg(outlineCanvas, e.data.data)
      let data = applyPremesh(e.data.data)
      data = applyMargin(data, marginInput.value)
      const csvUri = makeCSV(data)
      launchSpirograph(csvUri, 'outlineResults', true, outlineResults.offsetWidth - 100, outlineResults.offsetHeight - 100)
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

/**
   * Initialize worker.
   */
const initWorker = () => {
  worker = new Worker('../public/outline/worker.js')
  worker.addEventListener('message', onWorkerMessage, false)
}

/**
   * Displays a preview image and clears predefinedComputedOutlines.
   */
const previewImage = () => {
  var oFReader = new FileReader()
  oFReader.readAsDataURL(imageInput.files[0])

  oFReader.onload = (oFREvent) => {
    document.getElementById('uploadedImage').src = oFREvent.target.result
  }
  // Read and load image
  readFileAsDataURL(imageInput.files[0])
    .then(loadImage)
    .then(setCanvasSizeFromImage(outlineCanvas))
    .then(drawImageOnCanvas(outlineCanvas))
    .then((img) => {
      window.appData = {
        img,
        width: img.naturalWidth,
        height: img.naturalHeight
      }
      imgData = outlineCanvas
        .getContext('2d')
        .getImageData(0, 0, window.appData.width, window.appData.height)
    })
  marginInput.setAttribute('max', Math.min(outlineCanvas.width, outlineCanvas.height))
  predefinedComputedOutlines = []
}

/**
   * Computes all outlines with predefined thresholds. The results are stored in predefinedComputedOutlines.
   */
const computeOutlines = () => {
  // Disables slider while computing
  slider.setAttribute('disabled', true)
  computeSize = predefinedThresholds.length - 1
  for (let i = 0; i < predefinedThresholds.length; i++) {
    predefinedComputedOutlines.push({
      lt: predefinedThresholds[i].lt,
      ut: predefinedThresholds[i].ut
    })
  }
  // Run worker with every set of predefined thresholds
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
    const pixels = imgData.data
    worker.postMessage({ cmd: 'imgData', data: pixels })
  }
}

/**
   * Toggles between automatically computed outlines and manual threshold choices.
   * Executes computeOutlines if not already done.
   */
const toggleThresholds = () => {
  // Do nothing if there is no image
  if (imgData === undefined) return

  if (toggleThresholdButton.toggled) {
    autoSlider.style.display = 'none'
    slider.style.display = 'initial'
    toggleThresholdButton.innerText = 'Show automatic threshold choices'

    // Disables auto slider if there are no computed outlines
    if (predefinedComputedOutlines.length === 0) {
      autoSlider.setAttribute('disabled', true)
    }
    slider.removeAttribute('disabled')
  } else {
    autoSlider.style.display = 'initial'
    slider.style.display = 'none'
    toggleThresholdButton.innerText = 'Show manual threshold choices'

    // Computes outlines if not already done
    if (predefinedComputedOutlines.length === 0) {
      computeOutlines()
    }
  }
  toggleThresholdButton.toggled = !toggleThresholdButton.toggled
}
