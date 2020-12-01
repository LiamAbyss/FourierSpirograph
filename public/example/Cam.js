// eslint-disable-next-line no-unused-vars
class Cam {
  constructor (x, y) {
    // describes world center in relation to screen
    this.world = {
      x: x,
      y: y
    }

    this.viewPos = {
      prevX: null,
      prevY: null,
      isDragging: false
    }

    // describes part of the world that is visible
    this.view = {
      x: 0,
      y: 0,
      xMin: 0,
      xMax: 0,
      yMin: 0,
      yMax: 0,
      zoom: 1
    }
  }

  updateView (p) {
    this.view.xMin = -this.world.x / this.view.zoom
    this.view.xMax = p.width / this.view.zoom - (this.world.x / this.view.zoom)

    this.view.yMin = -this.world.y / this.view.zoom
    this.view.yMax = p.height / this.view.zoom - (this.world.y / this.view.zoom)

    this.view.x = this.view.xMin + (this.view.xMax - this.view.xMin) / 2
    this.view.y = this.view.yMin + (this.view.yMax - this.view.yMin) / 2
  }

  mousePressed (e) {
    this.viewPos.isDragging = true
    this.viewPos.prevX = e.clientX
    this.viewPos.prevY = e.clientY
  }

  mouseDragged (e, p) {
    const {
      prevX,
      prevY,
      isDragging
    } = this.viewPos
    if (!isDragging) return

    const pos = {
      x: e.clientX,
      y: e.clientY
    }
    const dx = pos.x - prevX
    const dy = pos.y - prevY

    if (prevX || prevY) {
      this.world.x += dx
      this.world.y += dy
      this.viewPos.prevX = pos.x
      this.viewPos.prevY = pos.y

      this.updateView(p)
    }
  }

  mouseReleased () {
    this.viewPos.isDragging = false
    this.viewPos.prevX = null
    this.viewPos.prevY = null
  }

  zoom (e, p) {
    let {
      x,
      y,
      deltaY
    } = e
    x -= p.width / 2
    y -= p.height / 2
    const direction = deltaY > 0 ? -1 : 1
    const factor = 0.05
    const zoom = direction * factor

    const wx = (x - this.world.x) / (p.width * this.view.zoom)
    const wy = (y - this.world.y) / (p.height * this.view.zoom)

    this.world.x -= wx * p.width * zoom
    this.world.y -= wy * p.height * zoom
    this.view.zoom += zoom
    if (this.view.zoom < 0.2) {
      this.view.zoom = 0.2
    }
    this.updateView(p)
  }
}
