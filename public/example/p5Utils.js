/**
 * Finds and remove a given item from a given list.
 * Does nothing if the item is not in the list.
 * @param {any[]} array - The array to remove from
 * @param {*} item - The item to b removed
 */
const removeFromArray = (array, item) => {
  return array.filter(elt => {
    return elt !== item
  })
}

/**
 * Computes the euclidian distance between the two given points.
 * @param {Point} a - A point with x,y coordinates
 * @param {Point} b - A point with x,y coordinates
 * @returns The euclidian distance between the two given points
 */
const distance = (a, b) => {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))
}

/**
 *
 * @param {Table} data - A p5 table containing points
 */
// eslint-disable-next-line no-unused-vars
const sortDataFromManualPathArray = (data) => {
  const orderedPoints = []
  const newData = []
  let error = false
  // make copy of data
  for (let i = 0; i < data.getRowCount(); i++) {
    newData.push({
      x: data.getNum(i, 'x'),
      y: data.getNum(i, 'y')
    })
  }
  console.log({ newData })

  let orderedPointsFromPaths = []
  // eslint-disable-next-line no-undef
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
    // eslint-disable-next-line no-undef
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
    // eslint-disable-next-line no-undef
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
  // eslint-disable-next-line no-unused-vars
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
  // eslint-disable-next-line no-undef
  if (!aftermeshed) {
    const aftermeshSel = document.getElementById('aftermesh')
    for (let i = 0; i < orderedPoints.length; i++) {
      // AFTERMESH : drop points after sorting the dataset
      if (i % aftermeshSel.value) {
        orderedPoints[i] = undefined
      }
    }
    // eslint-disable-next-line no-undef
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
