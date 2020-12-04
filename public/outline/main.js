/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable no-unused-vars */
'use strict'
const MAX_PRECISION = false
const precision = 2
const gaussMatrix = [
  [0.0121, 0.0261, 0.0337, 0.0261, 0.0121],
  [0.0261, 0.0561, 0.0724, 0.0561, 0.0261],
  [0.0337, 0.0724, 0.0935, 0.0724, 0.0337],
  [0.0261, 0.0561, 0.0724, 0.0561, 0.0261],
  [0.0121, 0.0261, 0.0337, 0.0261, 0.0121]
]
// kernel matrix for x and y derivation
const xMatrix = [[1, 0, -1], [2, 0, -2], [1, 0, -1]]
const yMatrix = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]]
const MAX_IMAGE_HEIGHT = 300

/**
 * Function for currying other functions.
 * @param   {function}  f  - The function to be curried
 * @param   {number}    n  - Parameter for defining arguments
 * @return  {function}  Curried function
 */
function curry (f, n) {
  var args = Array.prototype.slice.call(arguments, 0)
  if (typeof n === 'undefined') { args[1] = f.length }
  if (n === args.length - 2) { return f.apply(undefined, args.slice(2)) }
  return function () {
    return curry.apply(undefined, args.concat(Array.prototype.slice.call(arguments, 0)))
  }
}

/**
 * Loads an image from its url.
 * @param   {String}  imageUrl  - The url of the image
 * @return  {Promise<Element>}  Resulting image Element
 */
function loadImage (imageUrl) {
  return new Promise((resolve, reject) => {
    console.time('loadImage')
    const img = new Image()
    img.src = imageUrl
    img.crossOrigin = 'Anonymous'
    img.onload = function () {
      console.timeEnd('loadImage')
      resolve(img)
    }
  })
}

/**
 * Reads a file from its url.
 * @param   {Blob}  file   - Url of the file to be red
 * @return  {Promise<String|ArrayBuffer>} File content
 */
function readFileAsDataURL (file) {
  return new Promise((resolve, reject) => {
    var reader = new FileReader()
    reader.onloadend = function () {
      resolve(reader.result)
    }
    if (file) {
      reader.readAsDataURL(file)
    } else {
      reject('')
    }
  })
}

/**
 * Draws the given image on the canvas.
 * @param   {Element}   canvas
 * @param   {Element}   image
 * @return  {Element}   The image given as parameters
 */
function _drawImageOnCanvas (canvas, image) {
  canvas.getContext('2d').drawImage(image, 0, 0, image.width, image.height)
  return image
}
var drawImageOnCanvas = curry(_drawImageOnCanvas)

/**
 * Sets the canvas size from the image's one.
 * @param   {Element}  canvas
 * @param   {Element}  image   [image description]
 * @return  {Element} The image given as parameter
 */
function _setCanvasSizeFromImage (canvas, image) {
  const ratio = image.naturalWidth / image.naturalHeight
  var MAX_WIDTH = 400
  var MAX_HEIGHT = 400
  var width = image.width
  var height = image.height

  if (width > height) {
    if (width > MAX_WIDTH) {
      height *= MAX_WIDTH / width
      width = MAX_WIDTH
    }
  } else {
    if (height > MAX_HEIGHT) {
      width *= MAX_HEIGHT / height
      height = MAX_HEIGHT
    }
  }
  canvas.style.width = ''
  canvas.getContext('2d').clearRect(0, 0, width, height)
  canvas.width = width
  canvas.height = height
  image.width = width
  image.height = height
  return image
}
var setCanvasSizeFromImage = curry(_setCanvasSizeFromImage)

/**
 * Draws a given image on the canvas.
 * @param   {number}  width   - The image width
 * @param   {number}  height  - The image height
 * @param   {Element}  canvas
 * @param   {number[]}  bytes   - The image as bytes array
 */
function _drawBytesOnCanvas (width, height, canvas, bytes) {
  canvas
    .getContext('2d')
    .putImageData(new ImageData(new Uint8ClampedArray(bytes), width, height), 0, 0)
}
var drawBytesOnCanvas = curry(_drawBytesOnCanvas)

/**
 * Puts to grayscale a given image.
 * @param   {number[]}  bytes   - Image to be filtered
 * @param   {number}    width   - The image width
 * @param   {number}    height  - The image height
 * @return  {number[]}  Grayscaled image
 */
function toGrayscale (bytes, width, height) {
  console.time('toGrayscale')
  const grayscale = []
  for (let i = 0; i < bytes.length; i += 4) {
    var gray = 0.299 * bytes[i + 2] + 0.587 * bytes[i + 1] + 0.114 * bytes[i]
    grayscale.push(gray)
  }
  console.timeEnd('toGrayscale')
  return grayscale
}

/**
 * Applies convolution to an image with a filter kernel.
 * @param   {number}      width   - Image width
 * @param   {number}      height  - Image height
 * @param   {number[][]}  kernel  - 2D matrix filter to be convoluted with the image
 * @param   {number}      radius  - Limit of inner coordinates (dx and dy)
 * @param   {number[]}    bytes   - The image as byte array to be convoluted
 * @return  {number[]}    The filtered image
 */
function _toConvolution (width, height, kernel, radius, bytes) {
  console.time('toConvolution')
  const convolution = []
  let newValue, idxX, idxY, kernx, kerny
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      newValue = 0
      for (let innerI = i - radius; innerI < i + radius + 1; innerI++) {
        for (let innerJ = j - radius; innerJ < j + radius + 1; innerJ++) {
          idxX = (innerI + width) % width
          idxY = (innerJ + height) % height
          kernx = innerI - (i - radius)
          kerny = innerJ - (j - radius)
          newValue += bytes[idxY * width + idxX] * kernel[kernx][kerny]
        }
      }
      convolution[j * width + i] = newValue
    }
  }
  console.time('toConvolution')
  return convolution
}
const toConvolution = curry(_toConvolution)

/**
 * From image bytes (0 - 255) to values between 0 and 1.
 * @param  {Array<number>} bytes
 * @return {Array}      normalized values
 */
function toNormalized (bytes) {
  console.time('toNormalized')
  const normalized = []
  for (let i = 0; i < bytes.length; i += 4) {
    normalized.push(bytes[i] / 255)
  }
  console.timeEnd('toNormalized')
  return normalized
}

/**
 * From normalized array that has values from 0 to 1 to image data with values between 0 and 255.
 * @param  {Array}  normalized
 * @return {Array}  Denormalized
 */
function toDenormalized (normalized) {
  console.time('toDenormalized')
  const denormalized = normalized.map(value => value * 255)
  console.timeEnd('toDenormalized')
  return denormalized
}

/**
* @typedef {Object} GradientMagnitude
* @property {number[]} data - The gradient magnitude
* @property {{ut:number, lt:number}} threshold - Upper and lower threshold
*/

/**
 * Calculates the gradient magnitudes of an image given its derivated values in x and y.
 * @param   {number[]}  xDerived  - X derivated image
 * @param   {number[]}  yDerived  - Y derivated image
 * @param   {number}  width       - Image width
 * @param   {number}  height      - Image height
 * @param   {number}  lt          - Upper threshold
 * @param   {number}  ut          - Lower threshold
 * @return  {GradientMagnitude}   The gradient magnitude data and associated threshold
 */
function toGradientMagnitude (xDerived, yDerived, width, height, lt = 0, ut = 0) {
  console.time('toGradientMagnitude')
  const gradientMagnitude = []
  const gradientDirection = []
  let index
  let pom
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      index = y * width + x
      gradientMagnitude[index] = Math.sqrt(xDerived[index] * xDerived[index] + yDerived[index] * yDerived[index])
      pom = Math.atan2(xDerived[index], yDerived[index])
      if ((pom >= -Math.PI / 8 && pom < Math.PI / 8) || (pom <= -7 * Math.PI / 8 && pom > 7 * Math.PI / 8)) {
        gradientDirection[index] = 0
      } else if ((pom >= Math.PI / 8 && pom < 3 * Math.PI / 8) || (pom <= -5 * Math.PI / 8 && pom > -7 * Math.PI / 8)) {
        gradientDirection[index] = Math.PI / 4
      } else if ((pom >= 3 * Math.PI / 8 && pom <= 5 * Math.PI / 8) || (-3 * Math.PI / 8 >= pom && pom > -5 * Math.PI / 8)) {
        gradientDirection[index] = Math.PI / 2
      } else if ((pom < -Math.PI / 8 && pom >= -3 * Math.PI / 8) || (pom > 5 * Math.PI / 8 && pom <= 7 * Math.PI / 8)) {
        gradientDirection[index] = -Math.PI / 4
      }
    }
  }
  const max = getMax(gradientMagnitude)
  const gradientMagnitudeCapped = gradientMagnitude.map(x => x / max)
  if (!ut && !lt) {
    const res = getThresholds(gradientMagnitudeCapped)
    ut = res.ut
    lt = res.lt
  }
  const gradientMagnitudeLt = gradientMagnitudeCapped.map(value => value < lt ? 0 : value)
  for (var y = 1; y < height - 1; y++) {
    for (var x = 1; x < width - 1; x++) {
      index = y * width + x
      if (gradientDirection[index] === 0 && (gradientMagnitudeLt[index] <= gradientMagnitudeLt[y * width + x - 1] || gradientMagnitudeLt[index] <= gradientMagnitudeLt[y * width + x + 1])) { gradientMagnitudeLt[index] = 0 } else if (gradientDirection[index] === Math.PI / 2 && (gradientMagnitudeLt[index] <= gradientMagnitudeLt[(y - 1) * width + x] || gradientMagnitudeLt[(y + 1) * width + x] >= gradientMagnitudeLt[index])) { gradientMagnitudeLt[index] = 0 } else if (gradientDirection[index] === Math.PI / 4 && (gradientMagnitudeLt[index] <= gradientMagnitudeLt[(y + 1) * width + x - 1] || gradientMagnitudeLt[index] <= gradientMagnitudeLt[(y - 1) * width + x + 1])) { gradientMagnitudeLt[index] = 0 } else if (gradientDirection[index] === -Math.PI / 4 && (gradientMagnitudeLt[index] <= gradientMagnitudeLt[(y - 1) * width + x - 1] || gradientMagnitudeLt[index] <= gradientMagnitudeLt[(y + 1) * width + x + 1])) { gradientMagnitudeLt[index] = 0 }
    }
  }
  for (let y = 2; y < height - 2; y++) {
    for (let x = 2; x < width - 2; x++) {
      if (gradientDirection[y * width + x] === 0) {
        if (gradientMagnitudeLt[y * width + x - 2] > gradientMagnitudeLt[y * width + x] || gradientMagnitudeLt[y * width + x + 2] > gradientMagnitudeLt[y * width + x]) { gradientMagnitudeLt[y * width + x] = 0 }
      }
      if (gradientDirection[y * width + x] === Math.PI / 2) {
        if (gradientMagnitudeLt[(y - 2) * width + x] > gradientMagnitudeLt[y * width + x] || gradientMagnitudeLt[(y + 2) * width + x] > gradientMagnitudeLt[y * width + x]) { gradientMagnitudeLt[y * width + x] = 0 }
      }
      if (gradientDirection[y * width + x] === Math.PI / 4) {
        if (gradientMagnitudeLt[(y + 2) * width + x - 2] > gradientMagnitudeLt[y * width + x] || gradientMagnitudeLt[(y - 2) * width + x + 2] > gradientMagnitudeLt[y * width + x]) { gradientMagnitudeLt[y * width + x] = 0 }
      }
      if (gradientDirection[y * width + x] === -Math.PI / 4) {
        if (gradientMagnitudeLt[(y + 2) * width + x + 2] > gradientMagnitudeLt[y * width + x] || gradientMagnitudeLt[(y - 2) * width + x - 2] > gradientMagnitudeLt[y * width + x]) { gradientMagnitudeLt[y * width + x] = 0 }
      }
    }
  }
  const gradientMagnitudeUt = gradientMagnitudeLt.map(value => value > ut ? 1 : value)
  // histeresis start
  let pomH = 0
  let pomOld = -1
  let pass = 0
  let nastavi = true
  let gradientMagnitudeCappedBottom = []
  while (nastavi) {
    pass = pass + 1
    pomOld = pomH
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        if (gradientMagnitudeUt[y * width + x] <= ut && gradientMagnitudeUt[y * width + x] >= lt) {
          const pom1 = gradientMagnitudeUt[(y - 1) * width + x - 1]
          const pom2 = gradientMagnitudeUt[(y - 1) * width + x]
          const pom3 = gradientMagnitudeUt[(y - 1) * width + x + 1]
          const pom4 = gradientMagnitudeUt[y * width + x - 1]
          const pom5 = gradientMagnitudeUt[y * width + x + 1]
          const pom6 = gradientMagnitudeUt[(y + 1) * width + x - 1]
          const pom7 = gradientMagnitudeUt[(y + 1) * width + x]
          const pom8 = gradientMagnitudeUt[(y + 1) * width + x + 1]
          if (pom1 === 1 || pom2 === 1 || pom3 === 1 || pom4 === 1 || pom5 === 1 || pom6 === 1 || pom7 === 1 || pom8 === 1) {
            gradientMagnitudeUt[y * width + x] = 1
            pomH = pomH + 1
          }
        }
      }
    }
    if (MAX_PRECISION) {
      nastavi = pomH !== pomOld
    } else {
      nastavi = pass <= precision
    }
    gradientMagnitudeCappedBottom = gradientMagnitudeUt.map(x => x <= ut ? 0 : x)
  }
  console.timeEnd('toGradientMagnitude')
  return {
    data: gradientMagnitudeCappedBottom,
    threshold: {
      ut: ut,
      lt: lt
    }
  }
}

/**
 * Gets the max value of an array.
 * @param   {number[]} values
 * @return  {number}   Max value
 */
function getMax (values) {
  return values.reduce((prev, now) => now > prev ? now : prev, -1)
}

/**
 * Gets the threshold of a given gradient magnitude array.
 * @param   {number[]}  gradientMagnitude - The gradient magnitude of the image
 * @return  {{ut:number, lt:number}} The upper and lower thresholds
 */
function getThresholds (gradientMagnitude) {
  let sum = 0
  let count = 0
  sum = gradientMagnitude.reduce((memo, x) => x + memo, 0)
  count = gradientMagnitude.filter(x => x !== 0).length
  const ut = sum / count
  const lt = 0.4 * ut
  return { ut, lt }
}

/**
 * Takes an array of values (0-255) and returns
 * an expaneded array [x, x, x, 255] for each value.
 * @param  {Array}  values
 * @return {Array}  Expanded values
 */
function toPixels (values) {
  console.time('toPixels')
  const expanded = []
  values.forEach(x => {
    expanded.push(x)
    expanded.push(x)
    expanded.push(x)
    expanded.push(255)
  })
  console.timeEnd('toPixels')
  return expanded
}
