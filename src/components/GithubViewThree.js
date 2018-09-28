import * as THREE from 'three.js'
import * as D3 from 'd3'

class GithubViewThree {
  constructor(containerId) {
    this.containerId = containerId
  }

  initScene() {
    var contaienrElement = document.getElementById(this.containerId)
    this.scene = new THREE.Scene()

    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    this.renderer.setClearColor(0xeeeeee, 0.3)

    const width = contaienrElement.getBoundingClientRect().width
    const height = contaienrElement.getBoundingClientRect().height
    this.containerSize = Math.min(width, height)
    this.renderer.setSize(width, height)
    contaienrElement.appendChild(this.renderer.domElement)

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    this.camera.position.z = 200

    // add light
    var spotLight = new THREE.SpotLight(0xffffff)
    spotLight.position.set(-40, 60, 100)
    this.scene.add(spotLight)

    this.animate()
  }

  testAddCube() {
    var geometry = new THREE.BoxGeometry(1, 1, 1)
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    var cube = new THREE.Mesh(geometry, material)
    this.scene.add(cube)
  }

  addBall(xIndex, yIndex, radius) {
    var geometry = new THREE.SphereGeometry(radius, 32, 32)
    var material = new THREE.MeshLambertMaterial({ color: 0x008080 })
    var sphere = new THREE.Mesh(geometry, material)
    this.scene.add(sphere)
    sphere.position.set(xIndex, yIndex, 0)
  }

  animate() {
    requestAnimationFrame(() => this.animate())
    this.renderer.render(this.scene, this.camera)
  }

  drawProjects(reporitoryList) {
    const self = this
    this.initScene()
    this.reporitoryList = reporitoryList

    // initial scale
    this.volumeScale = D3.scalePow()
      .exponent(1 / 3)
      .domain(D3.extent(this.reporitoryList, d => d.count))
      .range([2, 16])
    this.indexScale = D3.scaleLinear()
      .domain(D3.extent([0, 500]))
      .range([0, 100])

    // use d3 to calculate the position of each circle
    this.simulation = D3.forceSimulation(this.reporitoryList)
      .force('charge', D3.forceManyBody())
      .force(
        'collide',
        D3.forceCollide().radius(d => this.volumeScale(d.count) + 12)
      )
      .force('forceX', D3.forceX(0).strength(0.05))
      .force('forceY', D3.forceY(0).strength(0.05))
      .on('end', function() {
        self.updateIndex()
      })
  }

  updateIndex() {
    const self = this
    let virtualElement = document.createElement('svg')
    const circles = D3.select(virtualElement)
      .selectAll('circle')
      .data(this.reporitoryList)
    circles
      .enter()
      .merge(circles)
      .each(function() {
        const datum = D3.select(this).datum()
        self.addBall(
          self.indexScale(datum.x),
          self.indexScale(datum.y),
          self.volumeScale(datum.count)
        )
      })
  }
}

export default GithubViewThree
