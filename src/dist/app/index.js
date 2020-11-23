/* eslint-disable no-undef */
let predefinedThresholdsFile = ''
let predefinedThresholds
let predefinedComputedOutlines = []
let computeSize = -1
let outlineResults
let premeshSel

// eslint-disable-next-line no-unused-vars
function toggleNav () {
  const sidebar = document.getElementById('settingsSidebar')
  if (sidebar.style.width === '250px') {
    sidebar.style.width = '0px'
  } else sidebar.style.width = '250px'
}

// eslint-disable-next-line no-unused-vars
function closeNav () {
  document.getElementById('settingsSidebar').style.width = '0'
}

// gets predifined thresholds from a file and return them as a list
const getThresholdsFromCsv = (thresholdFile) => {
  const res = []
  const lines = thresholdFile.split('\r\n')
  lines.forEach((line) => {
    if (line.search('ut') !== -1) return
    const buff = line.split(',')
    // push upper and lower threshold is res
    res.push({
      lt: parseFloat(buff[0]),
      ut: parseFloat(buff[1])
    })
  })
  return res
}

// ATTENTION : noter qu'il faut peut etre changer le nom de la fonction ?
// gets the text from a csv file to set the predefined thresholds
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

const meshOutlinePixels = (data, margin) => {
  if (data === undefined || data.length === 0) return
  let cpt = 0
  for (let i = 0; i < data.length; i += 4) {
    
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

  const newData = []

  //margin
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

  if (newData.length === 0) return
  const rows = [['x', 'y']]
  newData.forEach(e => {
    rows.push([e.x, e.y])
  })
  const csvContent = 'data:text/csv;charset=utf-8,' +
    rows.map(e => e.join(',')).join('\n')
  const encodedUri = encodeURI(csvContent)
  launchSpirograph(encodedUri, 'outlineResults', true, outlineResults.offsetWidth - 100, outlineResults.offsetHeight - 100)

  return data
}

//
window.onload = () => {
  // When an image is loaded
  outlineResults = document.getElementById('outlineResults')
  premeshSel = document.getElementById('premesh')
  //to change : fileInput -> imgInput ?
  const fileInput = document.getElementById('uploadImage')
  const outlineCanvas = document.getElementById('outlineCanvas')
  const marginInput = document.getElementById('imageMargin')
  let imgd
  launchSpirograph(undefined, outlineResults, true, outlineResults.offsetWidth - 100, outlineResults.offsetHeight - 100)
  function previewImage () {
    var oFReader = new FileReader()
    oFReader.readAsDataURL(fileInput.files[0])

    oFReader.onload = function (oFREvent) {
      //fileInput.src = oFREvent.target.result ?
      document.getElementById('uploadedImage').src = oFREvent.target.result
    }
    //read and load image
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

  //Threshold part
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
  //change value of Lower threshold
  lt.addEventListener('change', () => {
    if (toggleThresholdButton.toggled) {
      if (lt.value > ut.value) { lt.value = ut.value }
      return
    }
    slider.noUiSlider.set([lt.value, null])
  })
  //change value of Lower threshold
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
  //update values of lower and upper threshold and find points to drax Spirograph
  autoSlider.noUiSlider.on('update', () => {
    if (predefinedThresholds === undefined || predefinedComputedOutlines.length === 0) return
    lt.value = predefinedThresholds[parseInt(autoSlider.noUiSlider.get()) - 1].lt
    ut.value = predefinedThresholds[parseInt(autoSlider.noUiSlider.get()) - 1].ut
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
  // worker finds edges
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

  //Submit to find edges
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

  //Submit when "enter" key is pressed
  document.addEventListener('keypress', (ev) => {
    if (ev.key === 'Enter') {
      const trigger = document.createEvent('HTMLEvents')
      trigger.initEvent('click', true, true)
      trigger.eventName = 'click'
      outlineButton.dispatchEvent(trigger)
    }
  })
}
