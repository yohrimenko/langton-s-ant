function turnLeft(currentPosition) {
  switch (currentPosition.direction) {
    case 'up':
      return { ...currentPosition, direction: 'left' }
    case 'right':
      return { ...currentPosition, direction: 'up' }
    case 'down':
      return { ...currentPosition, direction: 'right' }
    case 'left':
      return { ...currentPosition, direction: 'down' }
    default:
      return currentPosition
  }
}

function turnRight(currentPosition) {
  switch (currentPosition.direction) {
    case 'up':
      return { ...currentPosition, direction: 'right' }
    case 'right':
      return { ...currentPosition, direction: 'down' }
    case 'down':
      return { ...currentPosition, direction: 'left' }
    case 'left':
      return { ...currentPosition, direction: 'up' }
    default:
      return currentPosition
  }
}

function moveForward(currentPosition) {
  let nextPositionX, nextPositionY
  switch (currentPosition.direction) {
    case 'up':
      nextPositionY = currentPosition.y + 1
      if (nextPositionY > height - 1) {
        nextPositionY = 0
      }
      return { ...currentPosition, y: nextPositionY }
    case 'right':
      nextPositionX = currentPosition.x - 1
      if (nextPositionX < 0) {
        nextPositionX = width - 1
      }
      return { ...currentPosition, x: nextPositionX }
    case 'down':
      nextPositionY = currentPosition.y - 1
      if (nextPositionY < 0) {
        nextPositionY = height - 1
      }
      return { ...currentPosition, y: nextPositionY }
    case 'left':
      nextPositionX = currentPosition.x + 1
      if (nextPositionX > width - 1) {
        nextPositionX = 0
      }
      return { ...currentPosition, x: nextPositionX }
    default:
      return currentPosition
  }
}

function step(grid, currentPosition) {
  let { x, y } = currentPosition

  if (grid[y][x]) {
    currentPosition = turnLeft(currentPosition)
    grid[y][x] = 0
  } else {
    currentPosition = turnRight(currentPosition)
    grid[y][x] = 1
  }
  currentPosition = moveForward(currentPosition)
  return { grid, currentPosition }
}

//This one is pretty slow without any reconciliation
function DOMRender({ grid, rootElement, currentPosition, size }) {
  const gridWrapper = document.createElement('div')

  for (let i = 0; i < size.width; i++) {
    for (let j = 0; j < size.height; j++) {
      let block = document.createElement('div')
      block.className = `x${j}y${i}`
      block.style.height = '5px'
      block.style.width = '5px'
      block.style.backgroundColor = `${grid[i][j] ? 'black' : 'white'}`
      gridWrapper.appendChild(block)
    }
  }
  gridWrapper.style.display = 'grid'
  gridWrapper.style.gridTemplateColumns = `repeat(${size.width}, 5px)`
  gridWrapper.style.gridTemplateRows = `repeat(${size.height}, 5px)`

  const antPosition = gridWrapper.querySelector(
    `.x${currentPosition.x}y${currentPosition.y}`
  )
  antPosition.style.backgroundColor = 'red'

  rootElement.replaceChildren(gridWrapper)
}

function canvasRender({ grid, rootElement, currentPosition, size }) {
  let canvasElement = document.body.querySelector('canvas')
  if (!canvasElement) {
    canvasElement = document.createElement('canvas')
    rootElement.replaceChildren(canvasElement)
  }
  boxSize = 5
  canvasElement.width = size.width * boxSize
  canvasElement.height = size.height * boxSize

  let cx = canvasElement.getContext('2d')

  for (let x = 0.5; x < canvasElement.width; x += boxSize) {
    cx.moveTo(x, 0)
    cx.lineTo(x, canvasElement.height)
  }

  for (let y = 0.5; y < canvasElement.height; y += boxSize) {
    cx.moveTo(0, y)
    cx.lineTo(canvasElement.width, y)
  }

  for (let i = 0; i < size.width; i++) {
    for (let j = 0; j < size.height; j++) {
      cx.fillStyle = 'black'
      if (grid[i][j]) {
        cx.fillRect(j * boxSize, i * boxSize, boxSize, boxSize)
      }
    }
  }

  cx.fillStyle = 'red'
  cx.fillRect(
    currentPosition.x * boxSize,
    currentPosition.y * boxSize,
    boxSize,
    boxSize
  )

  cx.moveTo(0, 0)

  cx.strokeStyle = '#ddd'
  cx.stroke()
}

let width = 100
let height = 100

let grid = new Array(width)
for (let i = 0; i < width; i++) {
  grid[i] = new Array(height)
}

//empty grid

for (let i = 0; i < width; i++) {
  for (let j = 0; j < width; j++) {
    grid[i][j] = 0
  }
}

//starting point

let currentPosition = {
  x: Math.floor(width / 2),
  y: Math.floor(height / 2),
  direction: 'right',
}

let root

document.addEventListener('DOMContentLoaded', function (event) {
  root = document.body.appendChild(document.createElement('div'))
  canvasRender({
    grid,
    rootElement: root,
    currentPosition,
    size: { width, height },
  })
})

window.start = () => {
  let i = 0
  let result = step(grid, currentPosition)
  grid = result.grid
  currentPosition = result.currentPosition
  canvasRender({
    grid,
    rootElement: root,
    currentPosition,
    size: { width, height },
  })
  i++
  if (i < 15000) {
    requestAnimationFrame(window.start)
  }
}
