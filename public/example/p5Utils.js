/**
 * Finds and remove a given item from a given list.
 * Does nothing if the item is not in the list.
 * @param {any[]} array - The array to remove from
 * @param {*} item The item to be removed
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
 * Orders the points according to the path drawn on the canvas.
 * @param {Table} data - A p5 table containing points
 * @returns The oredered data
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

  // Map every manual path with the corresponding points of the data
  let orderedPointsFromPaths = []
  // eslint-disable-next-line no-undef
  manualPath.forEach(path => {
    orderedPointsFromPaths.push(sortDataFromManualPath(newData, path, false, 7))
    if (orderedPointsFromPaths[orderedPointsFromPaths.length - 1].length === 0) error = true
  })

  // Prepare to erase path if overridden
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

  // Erase those paths
  toErase.forEach((index) => {
    orderedPointsFromPaths = removeFromArray(orderedPointsFromPaths, orderedPointsFromPaths[index])
    // eslint-disable-next-line no-undef
    manualPath = removeFromArray(manualPath, manualPath[index])
  })
  if (error) return data

  // Order all sections of points
  let remainingPoints = newData
  const sections = []
  let last = orderedPointsFromPaths[0][0]
  for (let i = 0; i < orderedPointsFromPaths.length; i++) {
    console.log('begin')
    const pseudoOrderedPoints = sortPointsInOrder(remainingPoints, last)
    let currentIndex = -1
    let newSection = []

    // Get the index of the closest path from the last point in the sections
    // And prepare the section between two manual paths
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

    // Append the new sections
    if (newSection.length > 0) sections.push(newSection)
    sections.push(orderedPointsFromPaths[currentIndex])

    // Remove points which are already in one of the sections
    orderedPointsFromPaths[currentIndex].forEach((elt) => {
      remainingPoints = removeFromArray(remainingPoints, elt)
    })
    newSection.forEach((elt) => {
      remainingPoints = removeFromArray(remainingPoints, elt)
    })

    last = nearestPoint(orderedPointsFromPaths[currentIndex][orderedPointsFromPaths[currentIndex].length - 1], remainingPoints)
  }

  // Join the sections
  for (let i = 0; i < sections.length; i++) {
    orderedPoints.push(...sections[i])
  }

  // Push the remaining points
  // eslint-disable-next-line no-unused-vars
  const endOrderedPoints = sortPointsInOrder(remainingPoints, last)
  orderedPoints.push(...remainingPoints)

  data.clearRows()
  for (let i = 0; i < orderedPoints.length; i++) {
    const newRow = data.addRow()
    newRow.setNum('x', orderedPoints[i].x)
    newRow.setNum('y', orderedPoints[i].y)
  }
  return data
}

/**
 * Finds the path from a manual input on the canvas.
 * @param   {Table}    data   - A p5 table containing points
 * @param   {Point[]}  path   - Path drawn by the user
 * @param   {Boolean}  end    -
 * @param   {Number}   radius - The allowed radius around the manual path
 * @return  {Table | Point[]} The ordered points
 */
const sortDataFromManualPath = (data, path, end, radius) => {
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
  if (radius === undefined) radius = Infinity
  const unused = []
  const pairs = []

  // Map each point of data with the closest point of manual path
  for (let i = 0; i < newData.length; i++) {
    let minDist = Infinity
    let point = {
      x: 0,
      y: 0
    }
    let currentDist = 0

    // Order local points
    for (let j = 0; j < path.length; j++) {
      currentDist = distance(newData[i], path[j])
      if (currentDist < minDist && currentDist < radius) {
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

    // Sort points in localorder by distance
    localOrder.sort((a, b) => {
      if (distance(a.data, a.path) < distance(b.data, b.path)) {
        return -1
      } else return 1
    })

    // And push the local order
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

/**
 * Finds the nearest point from a given point in a table.
 * @param   {Point}    point - The reference point
 * @param   {Point[]}  pointsTable - Array containing all points
 * @return  {Point}    The nearest point
 */
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

/**
 * Gets the total distance of a given closed path.
 * @param   {Point[]}  path - The closed path
 * @return  {[type]}   The total distance
 */
// eslint-disable-next-line no-unused-vars
const getPathDistance = (path) => {
  let dist = distance(path[0], path[path.length - 1])
  let lastPoint
  path.forEach((point) => {
    if (lastPoint === undefined) {
      lastPoint = point
      return
    }
    dist += distance(lastPoint, point)
    lastPoint = point
  })
  return dist
}

/**
 * Sort points in a dataset so that each point is the nearest from its neighbour.
 * @param   {Point[]}  data   - Points table
 * @param   {Point}    first  - Defined start for the sort
 * @return  {Point[]}  The ordered points
 */
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
