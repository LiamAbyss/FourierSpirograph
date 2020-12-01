/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable no-undef */
let predefinedThresholds
let predefinedComputedOutlines = []

let outlineResults
let premeshSel
let imageInput
let outlineCanvas
let marginInput
let imgData

let toggleThresholdButton
let slider
let autoSlider
let lt
let ut
let worker

window.onload = () => {
  // When an image is loaded
  outlineResults = document.getElementById('outlineResults')
  premeshSel = document.getElementById('premesh')
  imageInput = document.getElementById('uploadImage')
  outlineCanvas = document.getElementById('outlineCanvas')
  marginInput = document.getElementById('imageMargin')

  // Spirograph is launched on window load with no data
  launchSpirograph(undefined, outlineResults, true, outlineResults.offsetWidth - 100, outlineResults.offsetHeight - 100)

  imageInput.addEventListener('input', previewImage)

  // Thresholds selection
  slider = document.getElementById('thresholdSlider')
  autoSlider = document.getElementById('autoThresholdSlider')
  lt = document.getElementById('lt')
  ut = document.getElementById('ut')

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

  // Link slider value and input value
  slider.noUiSlider.on('update', () => {
    lt.value = slider.noUiSlider.get()[0]
    ut.value = slider.noUiSlider.get()[1]
  })
  // change value of lower threshold
  lt.addEventListener('change', () => {
    if (toggleThresholdButton.toggled) {
      if (lt.value > ut.value) { lt.value = ut.value }
      return
    }
    slider.noUiSlider.set([lt.value, null])
  })
  // change value of upper threshold
  ut.addEventListener('change', () => {
    if (toggleThresholdButton.toggled) {
      if (ut.value < lt.value) { ut.value = lt.value }
      return
    }
    slider.noUiSlider.set([null, ut.value])
  })

  // Predefined computed thresholds slider
  noUiSlider.create(autoSlider, {
    start: [1],
    step: 1,
    connect: ['lower', 'upper'],
    range: {
      min: 1,
      max: 20
    }
  })
  // Disabled until computation is finished
  autoSlider.setAttribute('disabled', true)

  // Update values of lower and upper threshold and launch spirograph with said values
  autoSlider.noUiSlider.on('update', () => {
    if (predefinedThresholds === undefined || predefinedComputedOutlines.length === 0) return
    lt.value = predefinedThresholds[parseInt(autoSlider.noUiSlider.get()) - 1].lt
    ut.value = predefinedThresholds[parseInt(autoSlider.noUiSlider.get()) - 1].ut

    let data = applyPremesh([...predefinedComputedOutlines[parseInt(autoSlider.noUiSlider.get()) - 1].data])
    data = applyMargin(data, marginInput.value)
    const csvUri = makeCSV(data)
    launchSpirograph(csvUri, 'outlineResults', true, outlineResults.offsetWidth - 100, outlineResults.offsetHeight - 100)
  })

  // Toggle between auto thresholds and manual thresholds
  toggleThresholdButton = document.getElementById('toggleThreshold')
  toggleThresholdButton.toggled = false

  toggleThresholdButton.addEventListener('click', toggleThresholds)

  window.appData = {}
  // Outline submission
  // Submit to find edges
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
    const pixels = imgData.data
    worker.postMessage({ cmd: 'imgData', data: pixels })
  })

  // Submit when "enter" key is pressed
  document.addEventListener('keypress', (ev) => {
    if (ev.key === 'Enter') {
      const trigger = document.createEvent('HTMLEvents')
      trigger.initEvent('click', true, true)
      trigger.eventName = 'click'
      outlineButton.dispatchEvent(trigger)
    }
  })
}
