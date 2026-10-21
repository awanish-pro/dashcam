import { useEffect, useRef, useState } from "react"
import * as THREE from "three"

export type Severity = "High" | "Medium" | "Low"
export type PotholeMarker = {
  id: string
  zone: number
  ward: string
  road: string
  lat: number
  lng: number
  severity: Severity
  confidence: number
  size: number
  depth: number
  status?: "New" | "Verified" | "Dismissed"
}

const SEV_COLORS: Record<Severity, string> = {
  High: "#c62839",
  Medium: "#e69f00",
  Low: "#11806a",
}

interface LoginMap3DProps {
  potholes: PotholeMarker[]
}

export default function LoginMap3D({ potholes }: LoginMap3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hoveredPothole, setHoveredPothole] = useState<PotholeMarker | null>(
    null,
  )
  const [selectedPothole, setSelectedPothole] = useState<PotholeMarker | null>(
    null,
  )
  const [tooltipPos, setTooltipPos] = useState<{ x: number y: number } | null>(
    null,
  )
  const [bearingDeg, setBearingDeg] = useState(25)
  const [autoOrbit, setAutoOrbit] = useState(true)
  const [selectedFilter, setSelectedFilter] = useState<Severity | "All">("All")
  const [activePreset, setActivePreset] = useState<string>("overview")

  const controlsRef = useRef({
    resetCamera: () => {},
    zoomIn: () => {},
    zoomOut: () => {},
    toggleAutoOrbit: () => {},
    flyToPreset: (_preset: string) => {},
    focusPothole: (_p: PotholeMarker) => {},
    setFilter: (_s: Severity | "All") => {},
  })

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene()
    scene.background = new THREE.Color("#0a1633")
    scene.fog = new THREE.FogExp2("#0a1633", 0.009)

    let width = container.clientWidth || 600
    let height = container.clientHeight || 800

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.5, 300)
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance",
      alpha: false,
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight("#dee8fc", 1.25)
    scene.add(ambientLight)

    const dirLight = new THREE.DirectionalLight("#ffffff", 1.8)
    dirLight.position.set(40, 70, 30)
    scene.add(dirLight)

    const blueRimLight = new THREE.DirectionalLight("#2563eb", 1.6)
    blueRimLight.position.set(-50, 20, -40)
    scene.add(blueRimLight)

    const centralPointLight = new THREE.PointLight("#bbcff9", 1.4, 85)
    centralPointLight.position.set(0, 15, 0)
    scene.add(centralPointLight)

    // 3. City Foundation & Concentric Radar Grid
    const centerLng = 80.3319
    const centerLat = 26.4499
    const lngScale = 520
    const latScale = 520

    const toWorld = (lat: number, lng: number) => ({
      x: (lng - centerLng) * lngScale,
      z: -(lat - centerLat) * latScale,
    })

    // Ground plane
    const groundGeo = new THREE.CircleGeometry(65, 64)
    const groundMat = new THREE.MeshStandardMaterial({
      color: "#0d2352",
      roughness: 0.85,
      metalness: 0.2,
    })
    const ground = new THREE.Mesh(groundGeo, groundMat)
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -0.05
    scene.add(ground)

    // Outer boundary ring
    const ringGeo = new THREE.RingGeometry(64.5, 65.5, 64)
    const ringMat = new THREE.MeshBasicMaterial({
      color: "#163b8d",
      side: THREE.DoubleSide,
    })
    const outerRing = new THREE.Mesh(ringGeo, ringMat)
    outerRing.rotation.x = -Math.PI / 2
    scene.add(outerRing)

    // Concentric civic radar distance rings
    ;[12, 24, 38, 52].forEach((radius) => {
      const rGeo = new THREE.RingGeometry(radius - 0.08, radius + 0.08, 64)
      const rMat = new THREE.MeshBasicMaterial({
        color: "#1e4fbc",
        transparent: true,
        opacity: 0.28,
        side: THREE.DoubleSide,
      })
      const rMesh = new THREE.Mesh(rGeo, rMat)
      rMesh.rotation.x = -Math.PI / 2
      rMesh.position.y = 0.01
      scene.add(rMesh)
    })

    // Grid lines
    const gridHelper = new THREE.GridHelper(100, 40, "#1e4fbc", "#163b8d")
    gridHelper.position.y = 0.02
    ;(gridHelper.material as THREE.Material).transparent = true
    ;(gridHelper.material as THREE.Material).opacity = 0.22
    scene.add(gridHelper)

    // 4. River Ganga curve (flows from NW to SE along north Kanpur)
    const riverPoints = [
      new THREE.Vector3(-55, 0.05, -34),
      new THREE.Vector3(-40, 0.05, -28),
      new THREE.Vector3(-22, 0.05, -22),
      new THREE.Vector3(-5, 0.05, -18),
      new THREE.Vector3(12, 0.05, -15),
      new THREE.Vector3(30, 0.05, -11),
      new THREE.Vector3(48, 0.05, -5),
      new THREE.Vector3(60, 0.05, 4),
    ]
    const riverCurve = new THREE.CatmullRomCurve3(riverPoints)
    const riverSamples = riverCurve.getPoints(50)
    const riverWidth = 4.2

    const riverGeo = new THREE.BufferGeometry()
    const riverVerts: number[] = []
    const riverIndices: number[] = []

    for (let i = 0; i < riverSamples.length; i++) {
      const p = riverSamples[i]
      const t = riverCurve.getTangent(i / (riverSamples.length - 1))
      const norm = new THREE.Vector3(-t.z, 0, t.x).normalize()
      const w = riverWidth * (1 + Math.sin(i * 0.2) * 0.25)
      riverVerts.push(p.x - norm.x * w, 0.06, p.z - norm.z * w)
      riverVerts.push(p.x + norm.x * w, 0.06, p.z + norm.z * w)
      if (i < riverSamples.length - 1) {
        const base = i * 2
        riverIndices.push(base, base + 1, base + 2)
        riverIndices.push(base + 1, base + 3, base + 2)
      }
    }
    riverGeo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(riverVerts, 3),
    )
    riverGeo.setIndex(riverIndices)
    riverGeo.computeVertexNormals()

    const riverMat = new THREE.MeshStandardMaterial({
      color: "#2563eb",
      emissive: "#163b8d",
      roughness: 0.2,
      metalness: 0.6,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
    })
    const riverMesh = new THREE.Mesh(riverGeo, riverMat)
    scene.add(riverMesh)

    // 5. Major Arterial Road Network
    const roadNetwork = [
      [
        new THREE.Vector3(-50, 0.08, -18),
        new THREE.Vector3(-25, 0.08, -8),
        new THREE.Vector3(0, 0.08, 0),
        new THREE.Vector3(26, 0.08, 10),
        new THREE.Vector3(50, 0.08, 22),
      ],
      [
        new THREE.Vector3(-28, 0.08, -14),
        new THREE.Vector3(-12, 0.08, -12),
        new THREE.Vector3(8, 0.08, -9),
        new THREE.Vector3(28, 0.08, -5),
      ],
      [
        new THREE.Vector3(-32, 0.08, -22),
        new THREE.Vector3(-15, 0.08, -18),
        new THREE.Vector3(6, 0.08, -15),
        new THREE.Vector3(25, 0.08, -10),
      ],
      [
        new THREE.Vector3(0, 0.08, 0),
        new THREE.Vector3(-16, 0.08, 12),
        new THREE.Vector3(-32, 0.08, 26),
        new THREE.Vector3(-45, 0.08, 38),
      ],
      [
        new THREE.Vector3(0, 0.08, 0),
        new THREE.Vector3(5, 0.08, 18),
        new THREE.Vector3(10, 0.08, 34),
        new THREE.Vector3(14, 0.08, 48),
      ],
      [
        new THREE.Vector3(-25, 0.08, -8),
        new THREE.Vector3(-20, 0.08, 6),
        new THREE.Vector3(-16, 0.08, 12),
      ],
      [
        new THREE.Vector3(-12, 0.08, -12),
        new THREE.Vector3(-6, 0.08, -4),
        new THREE.Vector3(0, 0.08, 0),
      ],
    ]

    const roadMat = new THREE.LineBasicMaterial({
      color: "#bbcff9",
      transparent: true,
      opacity: 0.55,
      linewidth: 2,
    })

    roadNetwork.forEach((pts) => {
      const curve = new THREE.CatmullRomCurve3(pts)
      const roadGeo = new THREE.BufferGeometry().setFromPoints(
        curve.getPoints(40),
      )
      const roadLine = new THREE.Line(roadGeo, roadMat)
      scene.add(roadLine)
    })

    // Moving Survey Vehicles (PGR Dashcams)
    const vehicles: {
      curve: THREE.CatmullRomCurve3
      progress: number
      speed: number
      mesh: THREE.Mesh
    }[] = []
    const vehGeo = new THREE.BoxGeometry(0.7, 0.35, 1.2)
    const vehMat = new THREE.MeshBasicMaterial({ color: "#dee8fc" })

    roadNetwork.slice(0, 5).forEach((pts, idx) => {
      const curve = new THREE.CatmullRomCurve3(pts)
      const mesh = new THREE.Mesh(vehGeo, vehMat)
      mesh.position.copy(pts[0])
      scene.add(mesh)
      vehicles.push({
        curve,
        progress: (idx * 0.22) % 1,
        speed: 0.0006 + Math.random() * 0.0005,
        mesh,
      })
    })

    // 6. Administrative Zone Boundaries
    const zoneCenters = [
      { id: 1, name: "Civil Lines", x: -5, z: -12, r: 13, color: "#2563eb" },
      { id: 2, name: "Kalyanpur", x: -32, z: -15, r: 14, color: "#1e4fbc" },
      { id: 3, name: "Kidwai Nagar", x: 22, z: 12, r: 14, color: "#163b8d" },
      { id: 4, name: "Govind Nagar", x: -20, z: 16, r: 13, color: "#2563eb" },
      { id: 5, name: "Kakadeo", x: -14, z: 3, r: 12, color: "#1e4fbc" },
      { id: 6, name: "Chakeri", x: 28, z: -4, r: 15, color: "#163b8d" },
    ]

    zoneCenters.forEach((z) => {
      const zPoints: THREE.Vector3[] = []
      const segs = 32
      for (let i = 0; i <= segs; i++) {
        const theta = (i / segs) * Math.PI * 2
        const wobble = Math.sin(theta * 3 + z.id) * 1.5
        const r = z.r + wobble
        zPoints.push(
          new THREE.Vector3(
            z.x + Math.cos(theta) * r,
            0.09,
            z.z + Math.sin(theta) * r,
          ),
        )
      }
      const zGeo = new THREE.BufferGeometry().setFromPoints(zPoints)
      const zMat = new THREE.LineDashedMaterial({
        color: "#bbcff9",
        dashSize: 1.2,
        gapSize: 0.8,
        transparent: true,
        opacity: 0.35,
      })
      const zLine = new THREE.Line(zGeo, zMat)
      zLine.computeLineDistances()
      scene.add(zLine)
    })

    // 7. Extruded 3D Buildings
    const buildingGroup = new THREE.Group()
    const buildingEdgeGroup = new THREE.Group()

    const bldColors = ["#0d2352", "#163b8d", "#1e4fbc", "#2563eb", "#bbcff9"]
    const bldMaterials = bldColors.map(
      (c) =>
        new THREE.MeshStandardMaterial({
          color: c,
          roughness: 0.6,
          metalness: 0.3,
        }),
    )
    const edgeMat = new THREE.LineBasicMaterial({
      color: "#bbcff9",
      transparent: true,
      opacity: 0.25,
    })

    let seed = 42
    const prand = () => {
      seed = (seed * 9301 + 49297) % 233280
      return seed / 233280
    }

    zoneCenters.forEach((zone) => {
      const count = zone.id === 1 ? 40 : 22
      for (let b = 0; b < count; b++) {
        const angle = prand() * Math.PI * 2
        const dist = Math.pow(prand(), 0.65) * (zone.r - 2)
        const bx = zone.x + Math.cos(angle) * dist
        const bz = zone.z + Math.sin(angle) * dist

        if (bz < -14 && bz > -32 && bx > -45 && bx < 50) continue

        const bw = 1.2 + prand() * 2.2
        const bd = 1.2 + prand() * 2.2
        const bh =
          zone.id === 1
            ? 3 + Math.pow(prand(), 1.8) * 14
            : 2 + Math.pow(prand(), 1.6) * 7

        const bGeo = new THREE.BoxGeometry(bw, bh, bd)
        const matIdx = Math.floor(prand() * bldMaterials.length)
        const bMesh = new THREE.Mesh(bGeo, bldMaterials[matIdx])
        bMesh.position.set(bx, bh / 2, bz)
        buildingGroup.add(bMesh)

        if (bh > 5) {
          const eGeo = new THREE.EdgesGeometry(bGeo)
          const eMesh = new THREE.LineSegments(eGeo, edgeMat)
          eMesh.position.copy(bMesh.position)
          buildingEdgeGroup.add(eMesh)
        }
      }
    })

    scene.add(buildingGroup)
    scene.add(buildingEdgeGroup)

    // 8. 3D Pothole Detection Beacons
    const potholeGroup = new THREE.Group()
    const markerInteractables: {
      mesh: THREE.Mesh
      pothole: PotholeMarker
      pillar: THREE.Mesh
      head: THREE.Mesh
      rings: THREE.Mesh[]
      group: THREE.Group
    }[] = []

    const beaconPillarGeo = new THREE.CylinderGeometry(0.12, 0.12, 3.2, 8)
    const beaconHeadGeo = new THREE.OctahedronGeometry(0.55, 0)
    const hitTargetGeo = new THREE.SphereGeometry(1.5, 8, 8)
    const hitTargetMat = new THREE.MeshBasicMaterial({ visible: false })

    potholes.forEach((p) => {
      const singleGroup = new THREE.Group()
      const pos = toWorld(p.lat, p.lng)
      const colorHex = SEV_COLORS[p.severity] || "#2563eb"
      const pColor = new THREE.Color(colorHex)

      const pMat = new THREE.MeshBasicMaterial({
        color: pColor,
        transparent: true,
        opacity: 0.8,
      })
      const pillar = new THREE.Mesh(beaconPillarGeo, pMat)
      pillar.position.set(pos.x, 1.6, pos.z)
      singleGroup.add(pillar)

      const headMat = new THREE.MeshStandardMaterial({
        color: pColor,
        emissive: pColor,
        emissiveIntensity: 0.95,
        roughness: 0.2,
      })
      const head = new THREE.Mesh(beaconHeadGeo, headMat)
      head.position.set(pos.x, 3.4, pos.z)
      singleGroup.add(head)

      const rings: THREE.Mesh[] = []
      for (let r = 0; r < 2; r++) {
        const ringGeo = new THREE.RingGeometry(0.2, 0.38, 24)
        const ringM = new THREE.MeshBasicMaterial({
          color: pColor,
          transparent: true,
          opacity: 0.7,
          side: THREE.DoubleSide,
        })
        const ring = new THREE.Mesh(ringGeo, ringM)
        ring.rotation.x = -Math.PI / 2
        ring.position.set(pos.x, 0.11 + r * 0.01, pos.z)
        singleGroup.add(ring)
        rings.push(ring)
      }

      const hitTarget = new THREE.Mesh(hitTargetGeo, hitTargetMat)
      hitTarget.position.set(pos.x, 2.5, pos.z)
      singleGroup.add(hitTarget)

      potholeGroup.add(singleGroup)

      markerInteractables.push({
        mesh: hitTarget,
        pothole: p,
        pillar,
        head,
        rings,
        group: singleGroup,
      })
    })

    scene.add(potholeGroup)

    // 9. Radar Scan Line Sweep
    const sweepGeo = new THREE.BufferGeometry()
    const sweepAngle = Math.PI / 5
    const sweepVerts = [0, 0.12, 0]
    for (let i = 0; i <= 16; i++) {
      const a = (i / 16) * sweepAngle
      sweepVerts.push(Math.cos(a) * 60, 0.12, Math.sin(a) * 60)
    }
    const sweepIndices: number[] = []
    for (let i = 1; i < 16; i++) {
      sweepIndices.push(0, i, i + 1)
    }
    sweepGeo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(sweepVerts, 3),
    )
    sweepGeo.setIndex(sweepIndices)
    const sweepMat = new THREE.MeshBasicMaterial({
      color: "#2563eb",
      transparent: true,
      opacity: 0.14,
      side: THREE.DoubleSide,
    })
    const sweepMesh = new THREE.Mesh(sweepGeo, sweepMat)
    scene.add(sweepMesh)

    // 10. Camera Dynamics & 360-Degree Cursor Following
    let currentAzimuth = -0.45
    let currentElevation = 0.88
    let currentDistance = 64

    let targetAzimuth = currentAzimuth
    let targetElevation = currentElevation
    let targetDistance = currentDistance

    let lookAtTarget = new THREE.Vector3(0, 1.2, 0)
    let desiredLookAt = new THREE.Vector3(0, 1.2, 0)

    let isDragging = false
    let velocityAzimuth = 0
    let lastPointerX = 0
    let lastPointerY = 0
    let pointerStartX = 0
    let pointerStartY = 0

    let cursorNormX = 0
    let cursorNormY = 0
    let hasPointerMoved = false
    let lastInteractionTime = Date.now()

    const raycaster = new THREE.Raycaster()
    const mouse2D = new THREE.Vector2(-999, -999)

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect()
      const cx = e.clientX - rect.left
      const cy = e.clientY - rect.top

      cursorNormX = (cx / rect.width) * 2 - 1
      cursorNormY = -(cy / rect.height) * 2 + 1
      hasPointerMoved = true
      lastInteractionTime = Date.now()

      mouse2D.x = (cx / rect.width) * 2 - 1
      mouse2D.y = -(cy / rect.height) * 2 + 1

      if (isDragging) {
        const deltaX = e.clientX - lastPointerX
        const deltaY = e.clientY - lastPointerY
        lastPointerX = e.clientX
        lastPointerY = e.clientY

        // Direct 360-degree rotation when dragging horizontally
        const rotSpeed = 0.0075
        targetAzimuth += deltaX * rotSpeed
        targetElevation = Math.max(
          0.3,
          Math.min(1.36, targetElevation - deltaY * 0.006),
        )

        velocityAzimuth = deltaX * rotSpeed
      }
    }

    const onPointerDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest(".hud-control")) return
      isDragging = true
      pointerStartX = e.clientX
      pointerStartY = e.clientY
      lastPointerX = e.clientX
      lastPointerY = e.clientY
      velocityAzimuth = 0
      lastInteractionTime = Date.now()
      try {
        container.setPointerCapture(e.pointerId)
      } catch {}
      container.style.cursor = "grabbing"
    }

    const onPointerUp = (e: PointerEvent) => {
      if (isDragging) {
        isDragging = false
        try {
          container.releasePointerCapture(e.pointerId)
        } catch {}
        container.style.cursor = "grab"

        // If it was a click without dragging, check for pin click
        const distMoved = Math.hypot(
          e.clientX - pointerStartX,
          e.clientY - pointerStartY,
        )
        if (distMoved < 6 && hoveredPothole) {
          const pos = toWorld(hoveredPothole.lat, hoveredPothole.lng)
          desiredLookAt.set(pos.x, 2, pos.z)
          targetDistance = 38
          targetElevation = 0.65
          setSelectedPothole(hoveredPothole)
        }
      }
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      lastInteractionTime = Date.now()
      targetDistance = Math.max(
        30,
        Math.min(105, targetDistance + e.deltaY * 0.045),
      )
    }

    container.style.cursor = "grab"
    container.addEventListener("pointermove", onPointerMove)
    container.addEventListener("pointerdown", onPointerDown)
    container.addEventListener("pointerup", onPointerUp)
    container.addEventListener("pointercancel", onPointerUp)
    container.addEventListener("wheel", onWheel, { passive: false })

    controlsRef.current = {
      resetCamera: () => {
        desiredLookAt.set(0, 1.2, 0)
        targetAzimuth = -0.45
        targetElevation = 0.88
        targetDistance = 64
        lastInteractionTime = Date.now()
        setActivePreset("overview")
        setSelectedPothole(null)
      },
      zoomIn: () => {
        targetDistance = Math.max(30, targetDistance - 10)
        lastInteractionTime = Date.now()
      },
      zoomOut: () => {
        targetDistance = Math.min(105, targetDistance + 10)
        lastInteractionTime = Date.now()
      },
      toggleAutoOrbit: () => {
        setAutoOrbit((prev) => !prev)
      },
      flyToPreset: (preset: string) => {
        setActivePreset(preset)
        lastInteractionTime = Date.now()
        if (preset === "overview") {
          desiredLookAt.set(0, 1.2, 0)
          targetAzimuth = -0.45
          targetElevation = 0.88
          targetDistance = 64
        } else if (preset === "civil_lines") {
          desiredLookAt.set(-5, 2, -12)
          targetAzimuth = -0.2
          targetElevation = 0.58
          targetDistance = 42
        } else if (preset === "density") {
          // Find cluster of high severity
          const highP = potholes.find((p) => p.severity === "High")
          if (highP) {
            const pos = toWorld(highP.lat, highP.lng)
            desiredLookAt.set(pos.x, 2, pos.z)
            targetDistance = 36
            targetElevation = 0.62
          }
        }
      },
      focusPothole: (p: PotholeMarker) => {
        const pos = toWorld(p.lat, p.lng)
        desiredLookAt.set(pos.x, 2, pos.z)
        targetDistance = 38
        targetElevation = 0.65
        setSelectedPothole(p)
      },
      setFilter: (s: Severity | "All") => {
        setSelectedFilter(s)
        markerInteractables.forEach((item) => {
          if (s === "All" || item.pothole.severity === s) {
            item.group.visible = true
          } else {
            item.group.visible = false
          }
        })
      },
    }

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cr = entry.contentRect
        if (cr.width > 0 && cr.height > 0) {
          width = cr.width
          height = cr.height
          camera.aspect = width / height
          camera.updateProjectionMatrix()
          renderer.setSize(width, height)
        }
      }
    })
    resizeObserver.observe(container)

    let animationFrameId = 0
    let lastTime = performance.now()
    let radarAngle = 0
    let ringPulsePhase = 0

    const animate = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1)
      lastTime = now

      // Survey vehicles
      vehicles.forEach((veh) => {
        veh.progress = (veh.progress + veh.speed) % 1
        const p = veh.curve.getPointAt(veh.progress)
        veh.mesh.position.copy(p)
        veh.mesh.position.y = 0.22
        const tangent = veh.curve.getTangentAt(veh.progress)
        veh.mesh.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 0, 1),
          tangent,
        )
      })

      // Radar sweep
      radarAngle = (radarAngle + 0.016) % (Math.PI * 2)
      sweepMesh.rotation.y = radarAngle

      // Pothole pulse animation
      ringPulsePhase = (ringPulsePhase + dt * 1.8) % 1
      markerInteractables.forEach((item, idx) => {
        if (!item.group.visible) return

        const isHovered = hoveredPothole?.id === item.pothole.id
        const isSelected = selectedPothole?.id === item.pothole.id
        const scaleMul = isHovered || isSelected ? 1.4 : 1.0

        item.head.rotation.y += 0.025
        item.head.scale.set(scaleMul, scaleMul, scaleMul)
        item.head.position.y = 3.3 + Math.sin(now * 0.003 + idx) * 0.25

        item.rings.forEach((ring, rIdx) => {
          const phase = (ringPulsePhase + rIdx * 0.5) % 1
          const scale = (0.5 + phase * 3.8) * scaleMul
          ring.scale.set(scale, scale, 1)
          const rMat = ring.material as THREE.MeshBasicMaterial
          rMat.opacity = Math.max(0, (1 - phase) * (isHovered ? 0.95 : 0.75))
        })
      })

      // Idle auto-orbit (pauses immediately upon user hover or drag)
      const idleTime = Date.now() - lastInteractionTime
      if (!isDragging && autoOrbit && idleTime > 1500) {
        targetAzimuth += 0.002
      }

      // Drag momentum decay
      if (!isDragging && Math.abs(velocityAzimuth) > 0.0001) {
        targetAzimuth += velocityAzimuth
        velocityAzimuth *= 0.94
      }

      // Smooth cursor follow offsets
      let followAzimuthOffset = 0
      let followElevationOffset = 0
      if (hasPointerMoved && !isDragging) {
        // Horizontal cursor movement tilts/rotates the camera smoothly
        followAzimuthOffset = cursorNormX * 0.68
        // Vertical cursor movement tilts camera elevation
        followElevationOffset = cursorNormY * 0.28
      }

      const dampFactor = isDragging ? 0.22 : 0.075
      currentAzimuth +=
        (targetAzimuth + followAzimuthOffset - currentAzimuth) * dampFactor
      currentElevation +=
        (targetElevation + followElevationOffset - currentElevation) *
        dampFactor
      currentDistance += (targetDistance - currentDistance) * dampFactor

      // Smooth look-at target transition
      lookAtTarget.lerp(desiredLookAt, 0.06)

      const clampedElevation = Math.max(0.28, Math.min(1.38, currentElevation))

      camera.position.x =
        lookAtTarget.x +
        currentDistance * Math.cos(clampedElevation) * Math.sin(currentAzimuth)
      camera.position.y =
        lookAtTarget.y + currentDistance * Math.sin(clampedElevation)
      camera.position.z =
        lookAtTarget.z +
        currentDistance * Math.cos(clampedElevation) * Math.cos(currentAzimuth)
      camera.lookAt(lookAtTarget)

      let deg = Math.round(((-currentAzimuth * 180) / Math.PI) % 360)
      if (deg < 0) deg += 360
      setBearingDeg(deg)

      // Raycast marker hover
      if (!isDragging && hasPointerMoved) {
        raycaster.setFromCamera(mouse2D, camera)
        const visibleTargets = markerInteractables
          .filter((m) => m.group.visible)
          .map((m) => m.mesh)
        const hits = raycaster.intersectObjects(visibleTargets)
        if (hits.length > 0) {
          const hit = hits[0].object
          const found = markerInteractables.find((m) => m.mesh === hit)
          if (found) {
            setHoveredPothole(found.pothole)
            const screenPos = found.head.position.clone().project(camera)
            const sx = ((screenPos.x + 1) / 2) * width
            const sy = ((-screenPos.y + 1) / 2) * height
            setTooltipPos({ x: sx, y: sy })
            container.style.cursor = "pointer"
          }
        } else {
          setHoveredPothole(null)
          setTooltipPos(null)
          container.style.cursor = "grab"
        }
      }

      renderer.render(scene, camera)
      animationFrameId = requestAnimationFrame(animate)
    }

    animationFrameId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationFrameId)
      resizeObserver.disconnect()
      container.removeEventListener("pointermove", onPointerMove)
      container.removeEventListener("pointerdown", onPointerDown)
      container.removeEventListener("pointerup", onPointerUp)
      container.removeEventListener("pointercancel", onPointerUp)
      container.removeEventListener("wheel", onWheel)
      renderer.dispose()
      scene.clear()
    }
  }, [potholes, autoOrbit])

  const getDirectionLabel = (deg: number) => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
    const idx = Math.round(deg / 45) % 8
    return directions[idx]
  }

  const handleSeverityFilter = (s: Severity | "All") => {
    setSelectedFilter(s)
    controlsRef.current.setFilter(s)
  }

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full select-none overflow-hidden bg-[#0a1633]"
    >
      <canvas ref={canvasRef} className="block h-full w-full outline-none" />

      {/* Interactive HUD - Top Left */}
      <div className="hud-control pointer-events-auto absolute left-6 top-6 z-20 flex flex-col gap-2">
        <div className="flex items-center gap-2.5 rounded-full border border-white/15 bg-[#0d2352]/85 px-4 py-2 shadow-lg backdrop-blur-md">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-300 opacity-75" />
            <span className="relative h-2.5 w-2.5 rounded-full bg-primary-300" />
          </span>
          <span className="text-xs font-medium tracking-wide text-white">
            Kanpur Nagar Nigam · RoadWatch
          </span>
          <span className="rounded-full bg-primary-500/60 px-2 py-0.5 text-[10px] font-medium text-primary-100">
            3D Live Twin
          </span>
        </div>

        <div className="flex w-fit items-center gap-2 rounded-lg border border-white/10 bg-[#0a1633]/70 px-3 py-1.5 text-[11px] text-primary-200 backdrop-blur-sm">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span>64 Detections Active Across 6 Zones</span>
        </div>
      </div>

      {/* Interactive HUD - Top Right (Presets & Bearing Compass) */}
      <div className="hud-control pointer-events-auto absolute right-6 top-6 z-20 flex flex-wrap items-center justify-end gap-2">
        {/* Preset View Buttons */}
        <div className="flex items-center rounded-full border border-white/15 bg-[#0d2352]/85 p-0.5 backdrop-blur-md">
          {[
            { id: "overview", label: "Overview" },
            { id: "civil_lines", label: "Civil Lines" },
            { id: "density", label: "Hotspots" },
          ].map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => controlsRef.current.flyToPreset(preset.id)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition active:scale-95 ${
                activePreset === preset.id
                  ? "bg-primary-300 text-white"
                  : "text-primary-200 hover:text-white"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Compass / 360 Bearing Button */}
        <button
          type="button"
          onClick={() => controlsRef.current.resetCamera()}
          title="Click to reset orientation to North"
          className="flex items-center gap-1.5 rounded-full border border-white/15 bg-[#0d2352]/85 px-3 py-1.5 text-xs font-medium text-white shadow-md backdrop-blur-md transition hover:bg-primary-500/80 active:scale-95"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="h-3.5 w-3.5 text-primary-200"
          >
            <polygon
              points="12 2 19 21 12 17 5 21 12 2"
              fill="currentColor"
              opacity={0.3}
            />
            <polygon points="12 2 19 21 12 17 5 21 12 2" />
          </svg>
          <span className="tabular-nums">
            {bearingDeg}° {getDirectionLabel(bearingDeg)}
          </span>
        </button>

        {/* Auto Orbit Toggle */}
        <button
          type="button"
          onClick={() => {
            setAutoOrbit(!autoOrbit)
            controlsRef.current.toggleAutoOrbit()
          }}
          title="Toggle 360° idle auto-orbit"
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium backdrop-blur-md transition active:scale-95 ${
            autoOrbit
              ? "border-primary-400/40 bg-primary-500/70 text-white"
              : "border-white/15 bg-[#0d2352]/85 text-primary-200 hover:text-white"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            className="h-3.5 w-3.5"
          >
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
          <span>360° {autoOrbit ? "Auto" : "Manual"}</span>
        </button>
      </div>

      {/* Floating 3D Hover Tooltip */}
      {hoveredPothole && tooltipPos && (
        <div
          className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-[115%] rounded-xl border border-white/20 bg-[#0d2352]/95 p-3 text-white shadow-2xl backdrop-blur-md transition-all duration-75"
          style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-xs font-medium text-primary-100">
              {hoveredPothole.id}
            </span>
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{
                backgroundColor: `${SEV_COLORS[hoveredPothole.severity]}25`,
                color: SEV_COLORS[hoveredPothole.severity],
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: SEV_COLORS[hoveredPothole.severity] }}
              />
              {hoveredPothole.severity}
            </span>
          </div>
          <div className="mt-1 text-xs text-white/90">
            {hoveredPothole.road}
          </div>
          <div className="mt-0.5 text-[11px] text-primary-200">
            Zone {hoveredPothole.zone} · {hoveredPothole.ward}
          </div>
          <div className="mt-2 flex items-center justify-between gap-3 border-t border-white/10 pt-1.5 text-[11px] text-primary-100">
            <span>Area: {hoveredPothole.size} m²</span>
            <span>Depth: {hoveredPothole.depth} cm</span>
            <span className="text-emerald-300">
              Conf: {hoveredPothole.confidence}%
            </span>
          </div>
        </div>
      )}

      {/* Selected Pothole Detail Card (if clicked) */}
      {selectedPothole && (
        <div className="hud-control pointer-events-auto absolute left-6 top-28 z-20 w-72 rounded-xl border border-white/20 bg-[#0d2352]/90 p-4 text-white shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-medium text-primary-200">
              {selectedPothole.id}
            </span>
            <button
              type="button"
              onClick={() => setSelectedPothole(null)}
              className="text-xs text-primary-300 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="mt-2 text-sm font-medium">{selectedPothole.road}</div>
          <div className="mt-0.5 text-xs text-primary-200">
            Zone {selectedPothole.zone} · {selectedPothole.ward}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/10 pt-2 text-xs">
            <div>
              <div className="text-[10px] uppercase text-primary-300">
                Severity
              </div>
              <div
                className="mt-0.5 font-medium"
                style={{ color: SEV_COLORS[selectedPothole.severity] }}
              >
                {selectedPothole.severity}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-primary-300">
                AI Confidence
              </div>
              <div className="mt-0.5 font-medium text-emerald-400">
                {selectedPothole.confidence}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Hero & Interactive Legend Overlay */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#0a1633] via-[#0a1633]/85 to-transparent p-8 pt-16">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div className="max-w-md">
            <h2 className="text-2xl font-medium leading-snug text-white">
              Every pothole found is a safer ride home.
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-primary-100/90">
              AI-assisted road inspection and real-time dashcam telemetry across
              all six zones of Kanpur Nagar Nigam.
            </p>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-primary-200">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary-300" />
              <span>
                Move cursor to follow in 3D · Drag to spin 360° · Scroll to zoom
                · Click pins to focus
              </span>
            </div>
          </div>

          {/* Interactive Severity Filter Buttons */}
          <div className="hud-control pointer-events-auto flex items-center gap-1.5 rounded-xl border border-white/15 bg-[#0d2352]/80 p-1.5 backdrop-blur-md">
            <button
              type="button"
              onClick={() => handleSeverityFilter("All")}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                selectedFilter === "All"
                  ? "bg-white/20 text-white"
                  : "text-primary-200 hover:text-white"
              }`}
            >
              All ({potholes.length})
            </button>
            {(["High", "Medium", "Low"] as Severity[]).map((s) => {
              const count = potholes.filter((p) => p.severity === s).length
              const isSelected = selectedFilter === s
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSeverityFilter(s)}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition active:scale-95 ${
                    isSelected
                      ? "bg-white/20 text-white shadow-sm"
                      : "text-primary-200 hover:text-white"
                  }`}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: SEV_COLORS[s] }}
                  />
                  <span>{s}</span>
                  <span className="rounded-full bg-white/10 px-1.5 text-[10px] tabular-nums text-white">
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Floating Camera Control Buttons - Bottom Right */}
      <div className="hud-control pointer-events-auto absolute bottom-28 right-6 z-20 flex flex-col gap-1.5">
        <button
          type="button"
          onClick={() => controlsRef.current.zoomIn()}
          title="Zoom in"
          className="grid h-8 w-8 place-items-center rounded-lg border border-white/15 bg-[#0d2352]/85 text-sm font-medium text-white shadow-md backdrop-blur-md transition hover:bg-primary-500/80 active:scale-95"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => controlsRef.current.zoomOut()}
          title="Zoom out"
          className="grid h-8 w-8 place-items-center rounded-lg border border-white/15 bg-[#0d2352]/85 text-sm font-medium text-white shadow-md backdrop-blur-md transition hover:bg-primary-500/80 active:scale-95"
        >
          −
        </button>
        <button
          type="button"
          onClick={() => controlsRef.current.resetCamera()}
          title="Reset 360° view"
          className="grid h-8 w-8 place-items-center rounded-lg border border-white/15 bg-[#0d2352]/85 text-xs font-medium text-white shadow-md backdrop-blur-md transition hover:bg-primary-500/80 active:scale-95"
        >
          ↺
        </button>
      </div>
    </div>
  )
}
