import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FC,
} from "react"
import { createPortal } from "react-dom"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

import {
  Display,
  Text,
  Label,
  Caption,
  Figure,
  RunningHead,
  Badge,
  CountBadge,
  StageTag,
  Button,
  IconButton,
  ButtonGroup,
  Card,
  MetricCard,
  StatFigure,
  Field,
  Input,
  Select,
  Toggle,
  Checkbox,
  ProductLockup,
  Breadcrumbs,
  Tabs,
  Avatar,
  Modal,
  EmptyState,
  ToastProvider,
  useToast,
  Square,
  Glyph,
  VastuMotif,
  JaaliMotif,
  BaoliMotif,
  type StatusTone,
} from "@/ds"

// ---------------------------------------------------------------------------
// Localization & Dictionary (English & Hindi)
// ---------------------------------------------------------------------------

type Lang = "en" | "hi"

const HI: Record<string, string> = {
  "Live Detection": "लाइव पहचान",
  "User Management": "उपयोगकर्ता प्रबंधन",
  "Real-time pothole map and records": "रीयल-टाइम गड्ढा मानचित्र और रिकॉर्ड",
  "Employees, status and ward/zone assignment": "कर्मचारी, स्थिति और वार्ड/ज़ोन आवंटन",
  "Kanpur Nagar Nigam": "कानपुर नगर निगम",
  "Active Hazards": "सक्रिय खतरे",
  "Critical Hazards": "गंभीर खतरे",
  "Damaged Surface": "क्षतिग्रस्त सतह",
  "AI Confidence": "एआई विश्वसनीयता",
  Live: "लाइव",
  Fleets: "वाहन",
  All: "सभी",
  High: "उच्च",
  Medium: "मध्यम",
  Low: "निम्न",
  Reset: "रीसेट",
  "Hazard Records": "खतरा रिकॉर्ड",
  Records: "रिकॉर्ड",
  "Map & Table": "मानचित्र और तालिका",
  "Table Only": "केवल तालिका",
  Videos: "वीडियो",
  Detections: "पहचान",
  "Detection Classes": "पहचान श्रेणियां",
  "Periods (Days)": "अवधि (दिन)",
  "Apply Changes": "परिवर्तन लागू करें",
  "Changes applied successfully!": "परिवर्तन सफलतापूर्वक लागू किए गए!",
  Language: "भाषा",
  Theme: "थीम",
  Paper: "पेपर",
  Ink: "इंक",
  "Log out": "लॉग आउट",
  "System Administrator": "सिस्टम प्रशासक",
  "Rajesh Kumar": "राजेश कुमार",
  "Staff Directory": "कर्मचारी निर्देशिका",
  "Zone & Ward Assignment": "ज़ोन और वार्ड आवंटन",
}

const LangCtx = createContext<Lang>("en")
const useT = () => {
  const lang = useContext(LangCtx)
  return (s: string) => (lang === "hi" ? (HI[s] ?? s) : s)
}

// ---------------------------------------------------------------------------
// Domain Types
// ---------------------------------------------------------------------------

export type Severity = "High" | "Medium" | "Low"
export type IssueType = "Pothole" | "Garbage"

export type Pothole = {
  id: string
  zone: number
  ward: string
  road: string
  issueType: IssueType
  x: number
  y: number
  lat: number
  lng: number
  severity: Severity
  confidence: number
  size: number
  depth: number
  engineer: string
  vehicle: string
  detected: string
  passes: number
  status: "New" | "Verified" | "Dismissed"
  dateIso: string
}

export type User = {
  id: string
  name: string
  role: string
  phone: string
  zones: number[]
  wards: string[]
  active: boolean
  last: string
}

// ---------------------------------------------------------------------------
// Airawat Status Tone Mappings (5-Color Restrained Heritage Palette)
// ---------------------------------------------------------------------------

export const SEV_COLORS: Record<Severity, string> = {
  High: "#7E4554", // Rose Deep (Critical)
  Medium: "#9A5B6A", // Rose (Caution)
  Low: "#52769A", // Slate (Notice / Brand)
}

export const SEV_TONES: Record<Severity, StatusTone> = {
  High: "critical",
  Medium: "caution",
  Low: "info",
}

// ---------------------------------------------------------------------------
// Kanpur Geographical Dataset (6 Zones, 8 Corridors)
// ---------------------------------------------------------------------------

export const KANPUR_WARDS: Record<number, string[]> = {
  1: ["Civil Lines", "Naveen Market", "Chunni Ganj", "Phool Bagh", "Colonelganj", "Bada Chauraha"],
  2: ["Kalyanpur", "IIT Kanpur Campus", "Panki", "Indira Nagar", "Vikas Nagar", "Rawatpur"],
  3: ["Kidwai Nagar", "Juhi", "Babupurwa", "Barra", "Transport Nagar", "Yashoda Nagar"],
  4: ["Govind Nagar", "Dada Nagar", "Fazalganj", "Shastri Nagar", "Udyog Nagar", "Ratan Lal Nagar"],
  5: ["Kakadeo", "Swaroop Nagar", "Arya Nagar", "Geeta Nagar", "Sharda Nagar", "Tilak Nagar"],
  6: ["Chakeri", "Jajmau", "Harjinder Nagar", "Shyam Nagar", "Ramadevi", "Cantt South"],
}

export const ZONES = [
  { id: 1, name: "Zone 1 · Civil Lines", lat: 26.4745, lng: 80.3485, cx: 170, cy: 120 },
  { id: 2, name: "Zone 2 · Kalyanpur", lat: 26.4950, lng: 80.2620, cx: 380, cy: 115 },
  { id: 3, name: "Zone 3 · Kidwai Nagar", lat: 26.4350, lng: 80.3360, cx: 565, cy: 150 },
  { id: 4, name: "Zone 4 · Govind Nagar", lat: 26.4420, lng: 80.2840, cx: 190, cy: 270 },
  { id: 5, name: "Zone 5 · Kakadeo", lat: 26.4800, lng: 80.3060, cx: 400, cy: 260 },
  { id: 6, name: "Zone 6 · Chakeri", lat: 26.4320, lng: 80.4060, cx: 565, cy: 290 },
]

export const ROADS = [
  "GT Road",
  "Mall Road",
  "VIP Road",
  "Kalpi Road",
  "Hamirpur Road",
  "Naveen Market Rd",
  "Swaroop Nagar Rd",
  "Jajmau Rd",
] as const

export const ROAD_PATHS: Record<string, [number, number][]> = {
  "GT Road": [
    [26.4980, 80.2580],
    [26.4920, 80.2750],
    [26.4850, 80.2950],
    [26.4780, 80.3120],
    [26.4680, 80.3320],
    [26.4580, 80.3480],
  ],
  "Mall Road": [
    [26.4760, 80.3350],
    [26.4730, 80.3440],
    [26.4695, 80.3520],
    [26.4660, 80.3590],
    [26.4610, 80.3660],
  ],
  "VIP Road": [
    [26.4880, 80.3300],
    [26.4830, 80.3380],
    [26.4780, 80.3450],
    [26.4710, 80.3520],
  ],
  "Kalpi Road": [
    [26.4520, 80.2650],
    [26.4480, 80.2820],
    [26.4440, 80.2980],
    [26.4410, 80.3150],
  ],
  "Hamirpur Road": [
    [26.4250, 80.3200],
    [26.4320, 80.3280],
    [26.4400, 80.3340],
    [26.4470, 80.3390],
  ],
  "Naveen Market Rd": [
    [26.4755, 80.3430],
    [26.4735, 80.3475],
    [26.4715, 80.3515],
  ],
  "Swaroop Nagar Rd": [
    [26.4860, 80.3010],
    [26.4830, 80.3100],
    [26.4795, 80.3210],
  ],
  "Jajmau Rd": [
    [26.4430, 80.3920],
    [26.4360, 80.4040],
    [26.4270, 80.4180],
  ],
}

export const ROAD_ZONES: Record<string, number> = {
  "GT Road": 2,
  "Mall Road": 1,
  "VIP Road": 1,
  "Kalpi Road": 4,
  "Hamirpur Road": 3,
  "Naveen Market Rd": 1,
  "Swaroop Nagar Rd": 5,
  "Jajmau Rd": 6,
}

const ENGINEERS = [
  "A. Verma",
  "R. Mishra",
  "S. Tiwari",
  "P. Yadav",
  "N. Gupta",
  "K. Shukla",
]

function rand(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

function pointOnRoad(roadName: string, t: number, seed: number): [number, number] {
  const pts = ROAD_PATHS[roadName] || ROAD_PATHS["Mall Road"]
  if (pts.length === 1) return pts[0]
  const totalSegments = pts.length - 1
  const clampedT = Math.max(0, Math.min(0.9999, t))
  const segIndex = Math.floor(clampedT * totalSegments)
  const segT = clampedT * totalSegments - segIndex
  const p1 = pts[segIndex]
  const p2 = pts[segIndex + 1]
  const latOffset = (rand(seed + 19) - 0.5) * 0.00045
  const lngOffset = (rand(seed + 31) - 0.5) * 0.00045
  const lat = p1[0] + (p2[0] - p1[0]) * segT + latOffset
  const lng = p1[1] + (p2[1] - p1[1]) * segT + lngOffset
  return [+lat.toFixed(5), +lng.toFixed(5)]
}

export type RoadSummary = {
  name: string
  points: [number, number][]
  totalCount: number
  highCount: number
  medCount: number
  lowCount: number
  dominantSeverity: Severity
  color: string
  center: [number, number]
}

function computeRoadSummaries(potholes: Pothole[]): Record<string, RoadSummary> {
  const result: Record<string, RoadSummary> = {}
  ROADS.forEach((roadName) => {
    const list = potholes.filter((p) => p.road === roadName)
    const points = ROAD_PATHS[roadName] || []
    const highCount = list.filter((p) => p.severity === "High").length
    const medCount = list.filter((p) => p.severity === "Medium").length
    const lowCount = list.filter((p) => p.severity === "Low").length
    const totalCount = list.length

    let dominantSeverity: Severity = "Low"
    if (highCount >= 2 || (highCount >= 1 && totalCount >= 4 && highCount / totalCount >= 0.25)) {
      dominantSeverity = "High"
    } else if (medCount >= 2 || highCount >= 1) {
      dominantSeverity = "Medium"
    } else {
      dominantSeverity = "Low"
    }

    const midIdx = Math.floor(points.length / 2)
    const center = points[midIdx] || [26.46, 80.33]

    result[roadName] = {
      name: roadName,
      points,
      totalCount,
      highCount,
      medCount,
      lowCount,
      dominantSeverity,
      color: SEV_COLORS[dominantSeverity],
      center,
    }
  })
  return result
}

const KANPUR_ROADS_ASSIGNED: string[] = [
  ...Array(30).fill("Mall Road"),
  ...Array(25).fill("VIP Road"),
  ...Array(25).fill("Naveen Market Rd"),
  ...Array(30).fill("GT Road"),
  ...Array(25).fill("Hamirpur Road"),
  ...Array(25).fill("Kalpi Road"),
  ...Array(30).fill("Swaroop Nagar Rd"),
  ...Array(30).fill("Jajmau Rd"),
]

const TODAY_ISO = "2026-10-22"

function formatDisplayDate(iso: string) {
  if (!iso) return ""
  const parts = iso.split("-").map(Number)
  if (parts.length < 3) return iso
  const [y, m, d] = parts
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  return `${d} ${months[(m || 1) - 1]} ${y}`
}

function formatSlashDate(iso?: string) {
  if (!iso) return "22/10/2026"
  const parts = iso.split("-")
  if (parts.length < 3) return iso
  const [y, m, d] = parts
  return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`
}

function getDeterministicDate(i: number, zone: number): { dateIso: string; detectedStr: string } {
  let daysAgo = 0
  if ((zone === 1 && i < 65) || i % 3 === 0) {
    daysAgo = 0 // Today (22 Oct 2026)
  } else if (i % 5 === 1) {
    daysAgo = 1 // Yesterday (21 Oct 2026)
  } else if (i % 5 === 2) {
    daysAgo = 2 + (i % 5)
  } else if (i % 5 === 3) {
    daysAgo = 8 + (i % 20)
  } else {
    daysAgo = 28 + (i % 30)
  }

  const baseDate = new Date(2026, 9, 22)
  baseDate.setDate(baseDate.getDate() - daysAgo)

  const y = baseDate.getFullYear()
  const m = String(baseDate.getMonth() + 1).padStart(2, "0")
  const d = String(baseDate.getDate()).padStart(2, "0")
  const dateIso = `${y}-${m}-${d}`

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const monthName = months[baseDate.getMonth()]
  const hour = 8 + ((i * 3) % 11)
  const min = String((i * 17) % 60).padStart(2, "0")
  const ampm = hour >= 12 ? "PM" : "AM"
  const formattedHour = String(hour > 12 ? hour - 12 : hour || 12).padStart(2, "0")
  const detectedStr = `${d} ${monthName} ${y}, ${formattedHour}:${min} ${ampm}`

  return { dateIso, detectedStr }
}

function extractTime24(p: Pothole): string {
  if (p.detected) {
    const m = p.detected.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i)
    if (m) {
      let hr = parseInt(m[1], 10)
      const min = m[2]
      const ampm = m[3]?.toUpperCase()
      if (ampm === "PM" && hr < 12) hr += 12
      if (ampm === "AM" && hr === 12) hr = 0
      return `${String(hr).padStart(2, "0")}:${min}`
    }
  }
  return "14:30"
}

export const POTHOLES: Pothole[] = Array.from({ length: 220 }, (_, i) => {
  const road = KANPUR_ROADS_ASSIGNED[i] || ROADS[i % ROADS.length]
  const zone = ROAD_ZONES[road] || 1
  const wards = KANPUR_WARDS[zone] || KANPUR_WARDS[1]
  const ward = wards[i % wards.length]
  const r = rand(i + 7)
  const isHighRoad = road === "GT Road" || road === "Mall Road" || road === "Jajmau Rd"
  const isMedRoad = road === "Hamirpur Road" || road === "Kalpi Road" || road === "Swaroop Nagar Rd"
  let severity: Severity = "Low"
  if (isHighRoad) {
    severity = r > 0.35 ? "High" : r > 0.15 ? "Medium" : "Low"
  } else if (isMedRoad) {
    severity = r > 0.82 ? "High" : r > 0.35 ? "Medium" : "Low"
  } else {
    severity = r > 0.95 ? "High" : r > 0.75 ? "Medium" : "Low"
  }
  const pos = pointOnRoad(road, rand(i * 3 + 1), i)
  const issueType: IssueType = i % 4 === 1 || i % 7 === 0 ? "Garbage" : "Pothole"
  const { dateIso, detectedStr } = getDeterministicDate(i, zone)
  return {
    id: `PH-KNP-${String(2400 + i * 7).padStart(5, "0")}`,
    zone,
    ward,
    road,
    issueType,
    x: 350 + (pos[1] - 80.3319) * 3000,
    y: 200 - (pos[0] - 26.4499) * 4000,
    lat: pos[0],
    lng: pos[1],
    severity,
    confidence: Math.round(72 + rand(i + 5) * 27),
    size: +(0.2 + rand(i + 2) * 2.4).toFixed(2),
    depth: Math.round(3 + rand(i + 4) * 14),
    engineer: ENGINEERS[zone - 1],
    vehicle: `UP78-${4100 + (i % 9)}`,
    dateIso,
    detected: detectedStr,
    passes: 1 + Math.floor(rand(i + 8) * 4),
    status:
      rand(i + 21) > 0.8
        ? "Dismissed"
        : rand(i + 21) > 0.4
          ? "Verified"
          : "New",
  }
})

export const INITIAL_USERS: User[] = [
  {
    id: "U-101",
    name: "Ankit Verma",
    role: "Engineer",
    phone: "+91 98390 11223",
    zones: [1],
    wards: ["Civil Lines", "Naveen Market"],
    active: true,
    last: "2h ago",
  },
  {
    id: "U-102",
    name: "Ritu Mishra",
    role: "Engineer",
    phone: "+91 94150 22481",
    zones: [2],
    wards: ["Kalyanpur", "IIT Kanpur Campus"],
    active: true,
    last: "15m ago",
  },
  {
    id: "U-103",
    name: "Suresh Tiwari",
    role: "Zonal Administrator",
    phone: "+91 99350 44120",
    zones: [3],
    wards: [],
    active: true,
    last: "1d ago",
  },
  {
    id: "U-104",
    name: "Pooja Yadav",
    role: "Engineer",
    phone: "+91 97940 33019",
    zones: [4],
    wards: ["Govind Nagar"],
    active: false,
    last: "12d ago",
  },
  {
    id: "U-105",
    name: "Naresh Gupta",
    role: "Field Staff",
    phone: "+91 90050 87712",
    zones: [5],
    wards: ["Kakadeo", "Swaroop Nagar"],
    active: true,
    last: "5m ago",
  },
  {
    id: "U-106",
    name: "Kavita Shukla",
    role: "Zonal Administrator",
    phone: "+91 93360 51870",
    zones: [6, 5],
    wards: [],
    active: true,
    last: "3h ago",
  },
  {
    id: "U-107",
    name: "Mohd. Arif",
    role: "Field Staff",
    phone: "+91 88400 66231",
    zones: [1, 2],
    wards: [],
    active: false,
    last: "30d ago",
  },
  {
    id: "U-108",
    name: "Deepa Singh",
    role: "Viewer",
    phone: "+91 70070 12890",
    zones: [1, 2, 3, 4, 5, 6],
    wards: [],
    active: true,
    last: "6h ago",
  },
]

export const ROLES = ["Zonal Administrator", "Engineer", "Field Staff", "Viewer"]

const POTHOLE_IMGS = [
  "1784548789954-655c9a9e1a64",
  "1694804304298-c79443f5e2f4",
  "1709934730506-fba12664d4e4",
  "1657811146442-0d66d65dbe92",
  "1623500673097-c277c8622cf2",
  "1658223684971-f262da87168f",
]

const GARBAGE_IMGS = [
  "1532996122724-e3c354a0b15b",
  "1605600659908-0ef719419d41",
  "1611284446314-60a58ac0deb9",
  "1528323273322-d81458248d40",
]

const getEvidenceImg = (p: Pothole, w = 600) => {
  const i = POTHOLES.findIndex((x) => x.id === p.id)
  const idxVal = i >= 0 ? i : 0
  if (p.issueType === "Garbage") {
    const id = GARBAGE_IMGS[idxVal % GARBAGE_IMGS.length]
    return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${Math.round(w * 0.65)}&q=75`
  }
  const id = POTHOLE_IMGS[idxVal % POTHOLE_IMGS.length]
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${Math.round(w * 0.65)}&q=75`
}

// ---------------------------------------------------------------------------
// Airawat Research Disclaimer Tooltip (Preserves MDPI & ResearchGate citations)
// ---------------------------------------------------------------------------

function IssueInfoTooltip() {
  const [show, setShow] = useState(false)
  const [coords, setCoords] = useState<{
    left: number
    top: number
    arrowLeft: number
    openDownward: boolean
  } | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const tipRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<any>(null)

  const updatePosition = () => {
    if (!buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    const tooltipWidth = Math.min(330, window.innerWidth - 24)
    let left = rect.left + rect.width / 2 - 200
    if (left < 12) left = 12
    if (left + tooltipWidth > window.innerWidth - 12) {
      left = window.innerWidth - tooltipWidth - 12
    }
    const arrowLeft = Math.max(16, Math.min(tooltipWidth - 24, rect.left + rect.width / 2 - left - 6))
    const spaceBelow = window.innerHeight - rect.bottom
    const openDownward = spaceBelow >= 240 || rect.top < 240
    const top = openDownward ? rect.bottom + 6 : rect.top - 6
    setCoords({ left, top, arrowLeft, openDownward })
  }

  const handleEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    updatePosition()
    setShow(true)
  }

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShow(false)
    }, 200)
  }

  useEffect(() => {
    if (!show) return
    const handleEvents = (e: MouseEvent) => {
      if (
        tipRef.current &&
        !tipRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setShow(false)
      }
    }
    const handleScrollOrResize = () => updatePosition()
    document.addEventListener("mousedown", handleEvents)
    window.addEventListener("scroll", handleScrollOrResize, true)
    window.addEventListener("resize", handleScrollOrResize)
    return () => {
      document.removeEventListener("mousedown", handleEvents)
      window.removeEventListener("scroll", handleScrollOrResize, true)
      window.removeEventListener("resize", handleScrollOrResize)
    }
  }, [show])

  return (
    <span className="inline-flex items-center">
      <button
        ref={buttonRef}
        type="button"
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onClick={(e) => {
          e.stopPropagation()
          if (!show) updatePosition()
          setShow((v) => !v)
        }}
        aria-expanded={show}
        aria-label="Research references disclaimer"
        title="Disclaimer: Pothole dimensions & research references"
        className="flex items-center justify-center h-4 w-4 border border-rule text-text-muted hover:border-slate hover:text-slate bg-surface rounded-none transition-colors cursor-pointer focus-ring"
      >
        <span className="font-mono text-[9.5px] font-medium leading-none">i</span>
      </button>

      {show &&
        coords &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={tipRef}
            role="tooltip"
            onMouseEnter={() => {
              if (timeoutRef.current) clearTimeout(timeoutRef.current)
            }}
            onMouseLeave={handleLeave}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              left: `${coords.left}px`,
              top: `${coords.top}px`,
              transform: coords.openDownward ? "none" : "translateY(-100%)",
              zIndex: 99999,
            }}
            className="w-[330px] max-w-[calc(100vw-24px)] rounded-none border border-rule-strong bg-ink p-4 text-left text-paper theme-ink select-none animate-in fade-in zoom-in-95 pointer-events-auto"
          >
            {/* Pointer notch */}
            <div
              style={{ left: `${coords.arrowLeft}px` }}
              className={`absolute h-2.5 w-2.5 rotate-45 border-r border-b border-rule-strong bg-ink ${
                coords.openDownward ? "-top-[5px]" : "-bottom-[5px]"
              }`}
            />

            <div className="relative z-10 space-y-2.5">
              <div className="flex items-center justify-between border-b border-white/15 pb-1.5">
                <span className="font-mono text-[10px] uppercase tracking-wider text-paper-muted">
                  DISCLAIMER · METHODOLOGY
                </span>
                <span className="font-mono text-[9px] text-slate-tint">REF-PGR-26</span>
              </div>

              <p className="font-body text-xs leading-relaxed text-paper/90">
                Pothole dimensions shown are estimated based on methodologies reported in published research and may vary from actual measurements.
              </p>

              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-paper-muted">
                  RESEARCH REFERENCES
                </div>
                <div className="mt-1.5 space-y-1.5 text-[11px] font-normal">
                  <div className="flex items-start gap-1.5">
                    <span className="font-mono text-paper-muted shrink-0 text-[10px]">01</span>
                    <a
                      href="https://www.mdpi.com/2079-9292/12/4/826"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[10.5px] text-slate-tint hover:underline break-all leading-snug"
                    >
                      mdpi.com/2079-9292/12/4/826
                    </a>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-mono text-paper-muted shrink-0 text-[10px]">02</span>
                    <a
                      href="https://www.researchgate.net/publication/405297436_Pothole_Detection_and_Cost_Estimation_Using_Deep_Learning"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[10.5px] text-slate-tint hover:underline break-all leading-snug"
                    >
                      researchgate.net/publication/405297436_...
                    </a>
                  </div>
                </div>
              </div>

              <p className="pt-0.5 font-body text-[10.5px] italic text-paper-faint leading-normal border-t border-white/10">
                (More research will affect how we estimate dimensions and other aspects of detections)
              </p>
            </div>
          </div>,
          document.body,
        )}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Airawat IssueType Cell with Hover Evidence Thumbnail Popover
// ---------------------------------------------------------------------------

function IssueTypeCell({
  p,
  onOpenPreview,
  rowIndex,
}: {
  p: Pothole
  onOpenPreview: () => void
  rowIndex?: number
}) {
  const [showPopup, setShowPopup] = useState(false)
  const timeoutRef = useRef<any>(null)
  const cellRef = useRef<HTMLDivElement>(null)

  const handleEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setShowPopup(true)
  }

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowPopup(false)
    }, 180)
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowPopup((prev) => !prev)
  }

  useEffect(() => {
    const handleDocClick = (e: MouseEvent) => {
      if (cellRef.current && !cellRef.current.contains(e.target as Node)) {
        setShowPopup(false)
      }
    }
    if (showPopup) document.addEventListener("click", handleDocClick)
    return () => document.removeEventListener("click", handleDocClick)
  }, [showPopup])

  const openDownward = typeof rowIndex === "number" && rowIndex < 3

  return (
    <div className="inline-flex items-center gap-2">
      {/* 6px Square indicator in Airawat severity tone */}
      <Square size={6} color={SEV_COLORS[p.severity]} />

      {/* Issue type trigger with hover popover */}
      <div
        ref={cellRef}
        className="relative inline-block"
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        <button
          type="button"
          onClick={handleClick}
          title={`Click or hover to preview ${p.issueType} evidence photo`}
          className="group inline-flex items-center gap-1 font-body text-xs font-medium text-text hover:text-slate transition-colors text-left cursor-pointer focus-ring"
        >
          <span className="underline decoration-dotted underline-offset-4 decoration-border hover:decoration-slate">
            {p.issueType}
          </span>
        </button>

        {showPopup && (
          <div
            onClick={(e) => {
              e.stopPropagation()
              onOpenPreview()
            }}
            className={`absolute left-0 z-50 w-72 rounded-none border border-rule-strong bg-surface p-2 shadow-2xs transition-all duration-150 animate-in fade-in zoom-in-95 cursor-pointer pointer-events-auto ${
              openDownward ? "top-full mt-2" : "bottom-full mb-2"
            }`}
          >
            <div className="relative overflow-hidden rounded-none aspect-[16/10] bg-surface-sunken border border-rule">
              <img
                src={getEvidenceImg(p, 480)}
                alt={`${p.issueType} defect on ${p.road}`}
                className="h-full w-full object-cover grayscale-[15%] contrast-105"
              />
              <div className="absolute top-1.5 left-1.5 rounded-none bg-ink text-paper px-1.5 py-0.5 font-mono text-[9.5px] uppercase">
                {p.issueType}
              </div>
              <div className="absolute top-1.5 right-1.5 rounded-none bg-slate text-white px-1.5 py-0.5 font-mono text-[9.5px]">
                {p.confidence}% AI
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-ink/85 px-2 py-1 font-mono text-[10px] text-paper truncate border-t border-white/10">
                {p.road} · {p.ward}
              </div>
            </div>
            <div className="mt-1.5 flex items-center justify-between px-1 font-mono text-[10.5px]">
              <span className="text-text-muted truncate max-w-[140px]">{p.id}</span>
              <span className="text-slate hover:underline">Enlarge ↗</span>
            </div>
          </div>
        )}
      </div>

      {/* Information icon (i) with research disclaimer tooltip */}
      <IssueInfoTooltip />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Airawat Evidence Inspection Modal (Elevation Level 3)
// ---------------------------------------------------------------------------

function Preview({ p, onClose }: { p: Pothole; onClose: () => void }) {
  const { toast } = useToast()

  const handleVerify = () => {
    toast({
      title: "Defect Record Verified",
      description: `${p.id} on ${p.road} verified and logged to municipal work register.`,
      tone: "success",
    })
    onClose()
  }

  const handleExport = () => {
    toast({
      title: "Telemetry Exported",
      description: `GPS coordinates & defect telemetry exported for ${p.id}.`,
      tone: "info",
    })
  }

  return (
    <Modal
      open={true}
      onClose={onClose}
      code={p.id}
      label="VMS EVIDENCE RECORD"
      title={`Hazard Inspection: ${p.issueType}`}
      accent={p.road}
      size="lg"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-text-muted">CORRIDOR STATUS:</span>
            <Badge tone={SEV_TONES[p.severity]} word={p.severity} />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handleExport} leading="download">
              Export Telemetry
            </Button>
            <Button variant="brand" size="sm" onClick={handleVerify} leading="check">
              Verify Defect
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Photo View with Bounding Box & Metadata Overlays */}
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-none border border-rule bg-surface-sunken">
          <img
            src={getEvidenceImg(p, 1080)}
            alt={`Defect ${p.id} on ${p.road}`}
            className="h-full w-full object-cover contrast-105"
          />

          {/* Architectural Bounding Box Overlay */}
          <div className="absolute inset-[24%] border-2 border-white/90 shadow-[0_0_0_1px_rgba(0,0,0,0.5)] pointer-events-none">
            <div className="absolute -top-6 left-0 bg-ink text-paper font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border border-white/20">
              DEFECT · AI {p.confidence}% CONF
            </div>
            <div className="absolute -bottom-5 right-0 bg-paper text-ink font-mono text-[9px] uppercase px-1.5 py-0.2 border border-ink/20">
              LAT {p.lat.toFixed(4)}° / LNG {p.lng.toFixed(4)}°
            </div>
          </div>

          {/* Top Left Module Pill */}
          <div className="absolute top-3 left-3 flex items-center gap-2 rounded-none bg-ink/90 border border-white/20 px-3 py-1 font-mono text-xs text-paper backdrop-blur-none">
            <Square size={6} color={SEV_COLORS[p.severity]} />
            <span>{p.id}</span>
            <span className="text-paper-muted">·</span>
            <span>{p.vehicle}</span>
            <span className="text-paper-muted">·</span>
            <span>{p.passes} PASSES</span>
          </div>
        </div>

        {/* 8-Column Telemetry Grid (Airawat Architectural Spec) */}
        <div className="border border-rule bg-surface-raised p-3">
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 divide-x divide-rule">
            {[
              { label: "DATE", value: formatSlashDate(p.dateIso) },
              { label: "TIME", value: extractTime24(p) },
              { label: "SEVERITY", value: p.severity },
              { label: "VEHICLE", value: p.vehicle },
              { label: "LAT", value: p.lat.toFixed(4) },
              { label: "LNG", value: p.lng.toFixed(4) },
              { label: "ZONE", value: `Zone ${p.zone}` },
              { label: "WARD", value: p.ward },
            ].map((col, idx) => (
              <div key={col.label} className={idx > 0 ? "pl-2" : ""}>
                <div className="font-mono text-[9.5px] uppercase tracking-wider text-text-faint mb-0.5">
                  {col.label}
                </div>
                <div
                  className="font-mono text-xs font-medium text-text truncate"
                  title={col.value}
                >
                  {col.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}

// ---------------------------------------------------------------------------
// Airawat Calendar Date Range Selector (2 Months in One Combined Card)
// ---------------------------------------------------------------------------

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

function MonthCard({
  year,
  month,
  effStart,
  effEnd,
  onDateClick,
  onDateHover,
  onPrevMonth,
  onNextMonth,
  canPrev,
  canNext,
}: {
  year: number
  month: number
  effStart: string
  effEnd: string
  onDateClick: (d: string) => void
  onDateHover: (d: string) => void
  onPrevMonth?: () => void
  onNextMonth?: () => void
  canPrev?: boolean
  canNext?: boolean
}) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  return (
    <div>
      {/* Month Header */}
      <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-rule">
        {onPrevMonth ? (
          <button
            type="button"
            disabled={!canPrev}
            onClick={onPrevMonth}
            className={`p-1 border border-rule text-text-muted hover:border-slate hover:text-slate bg-surface rounded-none transition-colors cursor-pointer ${
              !canPrev ? "opacity-30 cursor-not-allowed" : ""
            }`}
            title="Previous Month"
          >
            <Glyph name="chevron-left" size={12} />
          </button>
        ) : (
          <div className="w-5" />
        )}
        <span className="font-display font-medium text-xs text-text">
          {MONTH_NAMES[month]} {year}
        </span>
        {onNextMonth ? (
          <button
            type="button"
            disabled={!canNext}
            onClick={onNextMonth}
            className={`p-1 border border-rule text-text-muted hover:border-slate hover:text-slate bg-surface rounded-none transition-colors cursor-pointer ${
              !canNext ? "opacity-30 cursor-not-allowed" : ""
            }`}
            title="Next Month"
          >
            <Glyph name="chevron-right" size={12} />
          </button>
        ) : (
          <div className="w-5" />
        )}
      </div>

      {/* Weekday Labels (Monospace) */}
      <div className="grid grid-cols-7 gap-1 mb-1 text-center">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div key={day} className="font-mono text-[9.5px] uppercase text-text-faint py-0.5">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {Array.from({ length: firstDay }).map((_, idx) => (
          <div key={`empty-${idx}`} className="h-7 w-7" />
        ))}
        {Array.from({ length: daysInMonth }, (_, idx) => {
          const day = idx + 1
          const dateIso = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
          const isStart = dateIso === effStart
          const isEnd = dateIso === effEnd
          const isInRange = dateIso > effStart && dateIso < effEnd
          const isToday = dateIso === TODAY_ISO
          const isFuture = dateIso > TODAY_ISO

          return (
            <div
              key={dateIso}
              className={`h-7 flex items-center justify-center relative ${
                isInRange ? "bg-slate-wash" : ""
              } ${isStart && !isEnd ? "bg-gradient-to-r from-transparent to-slate-wash" : ""} ${
                isEnd && !isStart ? "bg-gradient-to-l from-transparent to-slate-wash" : ""
              }`}
            >
              <button
                type="button"
                disabled={isFuture}
                onClick={() => onDateClick(dateIso)}
                onMouseEnter={() => onDateHover(dateIso)}
                className={`h-7 w-7 flex items-center justify-center font-mono text-[11px] rounded-none transition-colors cursor-pointer ${
                  isStart || isEnd
                    ? "bg-slate text-white border border-slate-deep font-medium"
                    : isInRange
                      ? "text-slate-deep hover:bg-slate-tint font-medium"
                      : isFuture
                        ? "text-text-faint/40 cursor-not-allowed"
                        : isToday
                          ? "text-slate border border-slate/60 hover:bg-slate-wash font-medium"
                          : "text-text hover:bg-surface-raised hover:text-slate"
                }`}
              >
                {day}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function MapDateRangeFilter({
  startDate,
  endDate,
  onRangeChange,
  hazardCount,
  onResetCityView,
  isDrilledDown,
}: {
  startDate: string
  endDate: string
  onRangeChange: (start: string, end: string) => void
  hazardCount: number
  onResetCityView?: () => void
  isDrilledDown?: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [tempStart, setTempStart] = useState(startDate)
  const [tempEnd, setTempEnd] = useState(endDate)
  const [hoverDate, setHoverDate] = useState<string | null>(null)
  const [rangeStep, setRangeStep] = useState<"start" | "end">("start")

  const [leftYear, setLeftYear] = useState(2026)
  const [leftMonth, setLeftMonth] = useState(8) // September

  const rightYear = leftMonth === 11 ? leftYear + 1 : leftYear
  const rightMonth = leftMonth === 11 ? 0 : leftMonth + 1

  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setTempStart(startDate)
    setTempEnd(endDate)
    setRangeStep("start")
  }, [startDate, endDate])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  const handleDateClick = (dateIso: string) => {
    if (rangeStep === "start") {
      setTempStart(dateIso)
      setTempEnd(dateIso)
      setRangeStep("end")
    } else {
      if (dateIso < tempStart) {
        setTempEnd(tempStart)
        setTempStart(dateIso)
      } else {
        setTempEnd(dateIso)
      }
      setRangeStep("start")
    }
  }

  const handleDateHover = (dateIso: string) => {
    if (rangeStep === "end") setHoverDate(dateIso)
  }

  const effStart =
    rangeStep === "end" && hoverDate && hoverDate < tempStart ? hoverDate : tempStart
  const effEnd =
    rangeStep === "end" && hoverDate
      ? hoverDate > tempStart
        ? hoverDate
        : tempStart
      : tempEnd

  const handlePrevMonths = () => {
    if (leftMonth === 0) {
      setLeftMonth(11)
      setLeftYear((y) => y - 1)
    } else {
      setLeftMonth((m) => m - 1)
    }
  }

  const handleNextMonths = () => {
    if (leftYear === 2026 && leftMonth >= 8) return
    if (leftMonth === 11) {
      setLeftMonth(0)
      setLeftYear((y) => y + 1)
    } else {
      setLeftMonth((m) => m + 1)
    }
  }

  const isToday = startDate === TODAY_ISO && endDate === TODAY_ISO

  const labelText = useMemo(() => {
    if (isToday) return `Today (${formatDisplayDate(TODAY_ISO)})`
    if (startDate === endDate) return formatDisplayDate(startDate)
    return `${formatDisplayDate(startDate)} – ${formatDisplayDate(endDate)}`
  }, [isToday, startDate, endDate])

  const isAtCurrentMonth = leftYear === 2026 && leftMonth >= 8

  return (
    <div ref={containerRef} className="absolute top-3 left-3 z-[400] flex items-center gap-1.5 select-none">
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`flex items-center gap-2 rounded-none border border-rule bg-surface/95 px-3 py-1.5 text-xs font-mono text-text backdrop-blur-none transition-colors hover:border-slate cursor-pointer focus-ring ${
            isOpen ? "border-slate bg-surface-raised" : ""
          }`}
          title="Filter by Calendar Date Range"
        >
          <Glyph name="calendar" size={13} className="text-slate shrink-0" />
          <span className="font-mono text-xs max-w-[200px] truncate">{labelText}</span>
          <CountBadge count={hazardCount} />
          <Glyph
            name="chevron-down"
            size={11}
            className={`text-text-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-1.5 w-[540px] max-w-[calc(100vw-32px)] max-h-[85vh] overflow-y-auto rounded-none border border-rule-strong bg-surface p-3.5 shadow-2xs z-50">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-rule pb-2 mb-3">
              <div className="flex items-center gap-2">
                <Square size={6} color="#52769A" />
                <span className="font-display font-medium text-xs text-text">
                  Select Corridor Date Range (2 Months)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 border border-transparent hover:border-rule text-text-muted hover:text-text cursor-pointer"
                title="Close calendar"
              >
                <Glyph name="x" size={13} />
              </button>
            </div>

            {/* Single Combined Month Card with Divider Line */}
            <div
              className="rounded-none border border-rule bg-surface-raised/40 p-3 sm:p-3.5"
              onMouseLeave={() => setHoverDate(null)}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 sm:divide-x sm:divide-rule gap-3 sm:gap-0">
                <div className="sm:pr-3.5">
                  <MonthCard
                    year={leftYear}
                    month={leftMonth}
                    effStart={effStart}
                    effEnd={effEnd}
                    onDateClick={handleDateClick}
                    onDateHover={handleDateHover}
                    onPrevMonth={handlePrevMonths}
                    canPrev={true}
                  />
                </div>

                <div className="sm:pl-3.5 pt-3 sm:pt-0 border-t sm:border-t-0 border-rule">
                  <MonthCard
                    year={rightYear}
                    month={rightMonth}
                    effStart={effStart}
                    effEnd={effEnd}
                    onDateClick={handleDateClick}
                    onDateHover={handleDateHover}
                    onNextMonth={handleNextMonths}
                    canNext={!isAtCurrentMonth}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-3.5 pt-3 border-t border-rule flex items-center justify-end gap-2 text-xs">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setTempStart(TODAY_ISO)
                  setTempEnd(TODAY_ISO)
                  setRangeStep("start")
                  onRangeChange(TODAY_ISO, TODAY_ISO)
                  setIsOpen(false)
                }}
              >
                Reset to Today
              </Button>
              <Button
                variant="brand"
                size="sm"
                onClick={() => {
                  onRangeChange(tempStart, tempEnd)
                  setIsOpen(false)
                }}
              >
                Apply Range
              </Button>
            </div>
          </div>
        )}
      </div>

      {isDrilledDown && onResetCityView && (
        <button
          type="button"
          onClick={onResetCityView}
          className="rounded-none border border-rule bg-surface/95 px-2.5 py-1.5 font-mono text-xs text-text hover:border-slate hover:text-slate transition-colors cursor-pointer"
          title="Zoom out to Kanpur City View"
        >
          ↩ City View
        </button>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Airawat GIS Map (Leaflet Kanpur Corridors & Pothole Pins)
// ---------------------------------------------------------------------------

const TILES = { Street: "m", Satellite: "y" } as const

function GoogleMap({
  list,
  selected,
  onSelect,
  filterKey,
  focusedRoad,
  onFocusRoad,
  hoveredRoad,
  onHoverRoad,
  startDate,
  endDate,
  onDateRangeChange,
}: {
  list: Pothole[]
  selected?: Pothole
  onSelect: (p: Pothole) => void
  filterKey?: string
  focusedRoad?: string
  onFocusRoad?: (roadName?: string) => void
  hoveredRoad?: string
  onHoverRoad?: (roadName?: string) => void
  startDate: string
  endDate: string
  onDateRangeChange: (start: string, end: string) => void
}) {
  const el = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map>(null)
  const tile = useRef<L.TileLayer>(null)
  const roadLayer = useRef<L.LayerGroup>(null)
  const markerLayer = useRef<L.LayerGroup>(null)
  const [type, setType] = useState<keyof typeof TILES>("Street")
  const [zoom, setZoom] = useState(12.5)
  const [showGpsInfo, setShowGpsInfo] = useState(false)

  const roadSummaries = useMemo(() => computeRoadSummaries(list), [list])
  const isDetailLevel = zoom >= 14 || Boolean(selected) || Boolean(focusedRoad)

  useEffect(() => {
    if (!el.current) return
    const m = L.map(el.current, {
      zoomControl: false,
      attributionControl: true,
      minZoom: 11,
      maxZoom: 18,
    }).setView([26.4600, 80.3320], 12.5)

    m.setMaxBounds([
      [26.35, 80.15],
      [26.58, 80.52],
    ])
    L.control.zoom({ position: "topright" }).addTo(m)
    map.current = m
    roadLayer.current = L.layerGroup().addTo(m)
    markerLayer.current = L.layerGroup().addTo(m)

    m.on("zoomend", () => setZoom(m.getZoom()))

    const ro = new ResizeObserver(() => m.invalidateSize())
    ro.observe(el.current)

    return () => {
      ro.disconnect()
      m.remove()
    }
  }, [])

  useEffect(() => {
    tile.current?.remove()
    tile.current = L.tileLayer(
      `https://mt{s}.google.com/vt/lyrs=${TILES[type]}&hl=en&x={x}&y={y}&z={z}`,
      {
        subdomains: "0123",
        maxZoom: 20,
        attribution: "Map data &copy; Google",
      },
    ).addTo(map.current!)
  }, [type])

  // Render Street-Level Road Corridors
  useEffect(() => {
    if (!roadLayer.current || !map.current) return
    const rg = roadLayer.current
    rg.clearLayers()

    Object.values(roadSummaries).forEach((summary) => {
      if (!summary.points.length || summary.totalCount === 0) return
      const isRoadFocused = (focusedRoad || selected?.road) === summary.name
      const isRoadHovered = hoveredRoad === summary.name

      const glowPoly = L.polyline(summary.points, {
        color: summary.color,
        weight: isRoadFocused ? 14 : isRoadHovered ? 12 : 8,
        opacity: isRoadFocused ? 0.6 : isRoadHovered ? 0.45 : isDetailLevel ? 0.28 : 0.38,
        lineCap: "square",
        lineJoin: "miter",
        interactive: true,
      })

      const corePoly = L.polyline(summary.points, {
        color: summary.color,
        weight: isRoadFocused ? 5 : isRoadHovered ? 4 : 3,
        opacity: isRoadFocused ? 1.0 : isRoadHovered ? 0.95 : isDetailLevel ? 0.65 : 0.88,
        lineCap: "square",
        lineJoin: "miter",
        interactive: true,
      })

      const attachEvents = (poly: L.Polyline) => {
        poly.on("mouseover", () => onHoverRoad?.(summary.name))
        poly.on("mouseout", () => onHoverRoad?.(undefined))
        poly.on("click", () => {
          onFocusRoad?.(summary.name)
          if (map.current) {
            const bounds = poly.getBounds()
            map.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
          }
        })
      }

      attachEvents(glowPoly)
      attachEvents(corePoly)
      glowPoly.addTo(rg)
      corePoly.addTo(rg)

      // Square corridor summary badge
      const badgeHtml = `
        <div class="airawat-road-badge" style="border-left: 3px solid ${summary.color}">
          <span class="font-mono text-[10px] uppercase font-medium">${summary.name}</span>
          <span class="font-mono text-[9px] text-paper-muted ml-1.5">${summary.totalCount} DEFECTS</span>
        </div>
      `
      const badgeIcon = L.divIcon({
        className: "custom-div-icon",
        html: badgeHtml,
        iconSize: [140, 26],
        iconAnchor: [70, 13],
      })
      const badgeMarker = L.marker(summary.center, { icon: badgeIcon, interactive: true })
      attachEvents(badgeMarker as any)
      badgeMarker.addTo(rg)
    })
  }, [roadSummaries, focusedRoad, hoveredRoad, selected, isDetailLevel, onFocusRoad, onHoverRoad])

  // Render Pothole Markers
  useEffect(() => {
    if (!markerLayer.current || !map.current) return
    const mg = markerLayer.current
    mg.clearLayers()

    list.forEach((p) => {
      const isSel = selected?.id === p.id
      const color = SEV_COLORS[p.severity]

      const markerHtml = `
        <div class="airawat-marker ${isSel ? "is-selected" : ""}" style="--marker-color: ${color}">
          <div class="marker-square"></div>
        </div>
      `
      const customIcon = L.divIcon({
        className: "custom-div-icon",
        html: markerHtml,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      })

      const m = L.marker([p.lat, p.lng], { icon: customIcon }).addTo(mg)
      m.on("click", () => onSelect(p))

      m.bindPopup(
        `
        <div class="airawat-popup">
          <div class="font-mono text-[10px] uppercase text-text-faint">${p.id}</div>
          <div class="font-display font-medium text-xs text-text mt-0.5">${p.road}</div>
          <div class="font-mono text-[11px] text-text-muted mt-0.5">Ward: ${p.ward} · Zone ${p.zone}</div>
          <div class="mt-2 pt-1.5 border-t border-rule flex items-center justify-between">
            <span class="font-mono text-[10px]" style="color: ${color}">${p.severity} Severity</span>
            <span class="font-mono text-[10px] text-text-muted">${p.confidence}% AI</span>
          </div>
        </div>
        `,
        { className: "airawat-leaflet-popup" },
      )
    })
  }, [list, filterKey, selected, onSelect])

  useEffect(() => {
    if (selected && map.current) {
      map.current.flyTo([selected.lat, selected.lng], 16, { duration: 0.7 })
    }
  }, [selected])

  const resetToCity = () => {
    onFocusRoad?.(undefined)
    onSelect(undefined as any)
    if (map.current) map.current.setView([26.4600, 80.3320], 12.5)
  }

  return (
    <>
      <div ref={el} className="absolute inset-0 z-0" />

      {/* Top Left: Date Range Filter */}
      <MapDateRangeFilter
        startDate={startDate}
        endDate={endDate}
        onRangeChange={onDateRangeChange}
        hazardCount={list.length}
        isDrilledDown={Boolean(focusedRoad || selected)}
        onResetCityView={resetToCity}
      />

      {/* Bottom Left: GPS Accuracy Disclaimer */}
      <div
        className="absolute bottom-3 left-3 z-[400]"
        onMouseEnter={() => setShowGpsInfo(true)}
        onMouseLeave={() => setShowGpsInfo(false)}
      >
        <button
          type="button"
          onClick={() => setShowGpsInfo((prev) => !prev)}
          className="flex h-7 w-7 items-center justify-center rounded-none border border-rule bg-surface text-text-muted hover:border-slate hover:text-slate transition-colors cursor-pointer focus-ring"
          title="GPS Accuracy Information"
          aria-label="GPS Accuracy Information"
        >
          <Glyph name="crosshair" size={13} />
        </button>

        {showGpsInfo && (
          <div
            role="tooltip"
            className="absolute bottom-0 left-9 z-50 w-[290px] rounded-none border border-rule-strong bg-surface p-3 text-xs shadow-2xs pointer-events-none"
          >
            <div className="font-mono text-[10px] uppercase text-text-muted mb-1">
              GIS GEOLOCATION ACCURACY
            </div>
            <p className="font-body text-xs text-text leading-relaxed">
              Locations are approximate and subject to multipath reflection, satellite occlusion, or onboard device limitations.
            </p>
          </div>
        )}
      </div>

      {/* Bottom Right: Map Tile Switcher */}
      <div className="absolute bottom-3 right-3 z-[400] flex rounded-none border border-rule bg-surface p-0.5 text-xs">
        {(Object.keys(TILES) as (keyof typeof TILES)[]).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`rounded-none px-2.5 py-1 font-mono text-[11px] transition-colors cursor-pointer ${
              type === t
                ? "bg-action text-on-action"
                : "text-text-muted hover:text-text"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Pagination Helpers
// ---------------------------------------------------------------------------

function getPageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, "...", total]
  }
  if (current >= total - 3) {
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total]
  }
  return [1, "...", current - 1, current, current + 1, "...", total]
}

// ---------------------------------------------------------------------------
// Main Page 1: DetectionPage (Live Pothole Ledger & GIS Corridors)
// ---------------------------------------------------------------------------

function DetectionPage() {
  const [selectedZone, setSelectedZone] = useState<string>("1")
  const [selectedWard, setSelectedWard] = useState<string>("All")
  const [selectedRoad, setSelectedRoad] = useState<string>("All")
  const [sev, setSev] = useState<Severity | "All">("All")
  const [startDate, setStartDate] = useState<string>(TODAY_ISO)
  const [endDate, setEndDate] = useState<string>(TODAY_ISO)
  const [selected, setSelected] = useState<Pothole>()
  const [preview, setPreview] = useState<Pothole>()
  const [viewMode, setViewMode] = useState<"split" | "table">("split")
  const [focusedRoad, setFocusedRoad] = useState<string>()
  const [hoveredRoad, setHoveredRoad] = useState<string>()
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 50

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedZone, selectedWard, selectedRoad, sev, startDate, endDate])

  const wardOptions = useMemo(() => {
    const wards =
      selectedZone === "All"
        ? Array.from(new Set(Object.values(KANPUR_WARDS).flat()))
        : KANPUR_WARDS[Number(selectedZone)] || []
    return [
      {
        value: "All",
        label: selectedZone === "All" ? "All Wards (Kanpur)" : `All Wards (Zone ${selectedZone})`,
      },
      ...wards.map((w) => ({ value: w, label: w })),
    ]
  }, [selectedZone])

  const roadOptions = useMemo(() => {
    const roads =
      selectedZone === "All"
        ? [...ROADS]
        : ROADS.filter((r) => ROAD_ZONES[r] === Number(selectedZone))
    return [
      {
        value: "All",
        label: selectedZone === "All" ? "All Roads (Kanpur)" : `All Roads (Zone ${selectedZone})`,
      },
      ...roads.map((r) => ({ value: r, label: r })),
    ]
  }, [selectedZone])

  const list = useMemo(() => {
    return POTHOLES.filter((p) => {
      if (selectedZone !== "All" && String(p.zone) !== selectedZone) return false
      if (selectedWard !== "All" && p.ward !== selectedWard) return false
      if (selectedRoad !== "All" && p.road !== selectedRoad) return false
      if (sev !== "All" && p.severity !== sev) return false
      if (startDate && p.dateIso < startDate) return false
      if (endDate && p.dateIso > endDate) return false
      return true
    })
  }, [selectedZone, selectedWard, selectedRoad, sev, startDate, endDate])

  const totalPages = Math.max(1, Math.ceil(list.length / pageSize))
  const validPage = Math.min(currentPage, totalPages)

  const paginatedList = useMemo(() => {
    const start = (validPage - 1) * pageSize
    return list.slice(start, start + pageSize)
  }, [list, validPage, pageSize])

  const selectPin = useMemo(
    () => (p: Pothole) => {
      setSelected(p)
      if (p) {
        setFocusedRoad(p.road)
        const idxVal = list.findIndex((x) => x.id === p.id)
        if (idxVal >= 0) {
          const targetPage = Math.floor(idxVal / pageSize) + 1
          setCurrentPage(targetPage)
        }
        setTimeout(() => {
          document
            .getElementById(p.id)
            ?.scrollIntoView({ block: "center", behavior: "smooth" })
        }, 50)
      }
    },
    [list, pageSize],
  )

  const t = useT()
  const highCount = list.filter((p) => p.severity === "High").length
  const criticalPercent = Math.round((highCount / (list.length || 1)) * 100)

  return (
    <div className="space-y-6">
      {/* Page Header (Airawat Running Head & Headline with Closing Accent) */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-rule pb-5">
        <div>
          <RunningHead code="01" label="HAZARD LEDGER · KANPUR NAGAR NIGAM" />
          <Display size="lg" accent="across municipal corridors." className="mt-1">
            Real-time hazard detection and pothole ledger
          </Display>
        </div>
        <div className="flex items-center gap-2">
          <StageTag stage="Live" />
          <span className="font-mono text-xs text-text-muted">
            SYNCED: 22 OCT 2026, 17:02 IST
          </span>
        </div>
      </div>

      {/* 4 Metric Cards (Airawat Section 7.2 Specification) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          code="MTR-01"
          label={t("Detections")}
          figure={list.length}
          unit="records"
          delta={{ value: "+14 today", isPositive: true }}
          progress={Math.min(100, Math.round((list.length / 220) * 100))}
          source="SRC: KNN-SURV-CAM · ZN-01"
          accentColor="#52769A"
        />
        <MetricCard
          code="MTR-02"
          label={t("Critical Hazards")}
          figure={highCount}
          unit={`${criticalPercent}% of total`}
          delta={{ value: "+2 new", isPositive: false, goodWhen: "down" }}
          progress={criticalPercent}
          source="SRC: YOLOv8-DEFECT-L4"
          accentColor="#7E4554"
        />
        <MetricCard
          code="MTR-03"
          label="Corridors Monitored"
          figure={8}
          unit="arteries"
          progress={100}
          source="SRC: GIS-KNN-CORRIDOR"
          accentColor="#52769A"
        />
        <MetricCard
          code="MTR-04"
          label={t("AI Confidence")}
          figure="84%"
          unit="mean idx"
          delta={{ value: "+3.2% vs baseline", isPositive: true }}
          progress={84}
          source="SRC: KNN-TELEMETRY-PASS"
          accentColor="#96A394"
        />
      </div>

      {/* Main Ground Container Enclosing Location Filters, Map & Table */}
      <Card level={0} className="space-y-4">
        {/* Kanpur Corridor Filter Bar */}
        <div className="flex flex-col gap-3 border border-rule bg-surface-raised p-3.5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-wrap items-end gap-3 flex-1 min-w-0">
            {/* Zone Filter */}
            <div className="w-full sm:w-[190px]">
              <Select
                label="Zone (Kanpur)"
                value={selectedZone}
                onChange={(z) => {
                  setSelectedZone(z)
                  setSelectedWard("All")
                  setSelectedRoad("All")
                  setFocusedRoad(undefined)
                  setSelected(undefined)
                }}
                options={[
                  { value: "All", label: "All Zones (Kanpur)" },
                  { value: "1", label: "Zone 1 · Civil Lines" },
                  { value: "2", label: "Zone 2 · Kalyanpur" },
                  { value: "3", label: "Zone 3 · Kidwai Nagar" },
                  { value: "4", label: "Zone 4 · Govind Nagar" },
                  { value: "5", label: "Zone 5 · Kakadeo" },
                  { value: "6", label: "Zone 6 · Chakeri" },
                ]}
              />
            </div>

            {/* Ward Name Filter */}
            <div className="w-full sm:w-[200px]">
              <Select
                label="Ward Name"
                value={selectedWard}
                onChange={(w) => {
                  setSelectedWard(w)
                  setSelected(undefined)
                }}
                options={wardOptions}
              />
            </div>

            {/* Road Corridor Filter */}
            <div className="w-full sm:w-[200px]">
              <Select
                label="Road Corridor"
                value={selectedRoad}
                onChange={(r) => {
                  setSelectedRoad(r)
                  setSelected(undefined)
                  setFocusedRoad(r !== "All" ? r : undefined)
                }}
                options={roadOptions}
              />
            </div>

            {/* Reset Filters CTA */}
            {(selectedZone !== "1" || selectedWard !== "All" || selectedRoad !== "All" || sev !== "All") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedZone("1")
                  setSelectedWard("All")
                  setSelectedRoad("All")
                  setSev("All")
                  setFocusedRoad(undefined)
                  setSelected(undefined)
                }}
                className="h-9 mb-0.5"
              >
                Reset
              </Button>
            )}
          </div>

          {/* Severity & View Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 shrink-0">
            <div>
              <Label className="mb-1.5 block">Severity Filter</Label>
              <ButtonGroup<Severity | "All">
                value={sev}
                onChange={setSev}
                items={[
                  { key: "All", label: "All", count: list.length },
                  { key: "High", label: "High", count: list.filter((p) => p.severity === "High").length },
                  { key: "Medium", label: "Med", count: list.filter((p) => p.severity === "Medium").length },
                  { key: "Low", label: "Low", count: list.filter((p) => p.severity === "Low").length },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Screen Division: 40% Left GIS Map and 60% Right Records Table (or 100% Table Only) */}
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          {viewMode === "split" && (
            <div className="w-full lg:w-[40%] flex flex-col gap-3 lg:sticky lg:top-20">
              <div className="relative h-[480px] lg:h-[calc(100vh-270px)] lg:min-h-[440px] w-full overflow-hidden rounded-none border border-rule bg-surface">
                <GoogleMap
                  list={list}
                  selected={selected}
                  onSelect={selectPin}
                  filterKey={`${selectedZone}_${selectedWard}_${selectedRoad}_${sev}_${startDate}_${endDate}`}
                  focusedRoad={focusedRoad}
                  onFocusRoad={(r) => {
                    setFocusedRoad(r)
                    if (r) setSelectedRoad(r)
                  }}
                  hoveredRoad={hoveredRoad}
                  onHoverRoad={setHoveredRoad}
                  startDate={startDate}
                  endDate={endDate}
                  onDateRangeChange={(s, e) => {
                    setStartDate(s)
                    setEndDate(e)
                    setSelected(undefined)
                  }}
                />
              </div>
            </div>
          )}

          {/* Right Screen: Pothole Detection Table */}
          <div className={`w-full ${viewMode === "split" ? "lg:w-[60%]" : "lg:w-full"} flex flex-col gap-3 min-w-0 transition-all`}>
            <div className="overflow-hidden rounded-none border border-rule bg-surface flex flex-col">
              {/* Table Header Bar with Mode Toggle */}
              <div className="flex items-center justify-between border-b border-rule bg-surface-raised px-4 py-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="font-display font-medium text-xs text-text uppercase tracking-wider">
                    {t("Hazard Records")}
                  </span>
                  <CountBadge count={list.length} />
                  {totalPages > 1 && (
                    <span className="font-mono text-[11px] text-text-muted hidden sm:inline">
                      (Page {validPage} / {totalPages})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <ButtonGroup<"split" | "table">
                    value={viewMode}
                    onChange={setViewMode}
                    items={[
                      { key: "split", label: t("Map & Table"), icon: "map" },
                      { key: "table", label: t("Table Only"), icon: "list" },
                    ]}
                  />
                </div>
              </div>

              {/* Table Body */}
              <div className="overflow-x-auto overflow-y-auto max-h-[480px] lg:h-[calc(100vh-375px)] lg:min-h-[340px]">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 z-10 border-b border-rule bg-surface-raised font-mono text-[11px] uppercase tracking-wider text-text-muted">
                    <tr>
                      {[
                        { key: "issue", label: "Issue Type", align: "text-left" },
                        { key: "datetime", label: "Date & Time", align: "text-left" },
                        { key: "severity", label: "Severity", align: "text-left" },
                        { key: "location", label: "Road & Ward", align: "text-left" },
                        { key: "zone", label: "Zone", align: "text-left" },
                        { key: "surface", label: "Surface", align: "text-center" },
                        { key: "confidence", label: "AI Conf.", align: "text-left" },
                        { key: "actions", label: "Actions", align: "text-left" },
                      ].map((col) => (
                        <th key={col.key} className={`whitespace-nowrap px-3.5 py-2.5 font-medium ${col.align}`}>
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rule font-body text-xs text-text">
                    {paginatedList.map((p, rowIdx) => {
                      const isSel = selected?.id === p.id
                      const isRoadMatch = !isSel && (hoveredRoad === p.road || focusedRoad === p.road)
                      return (
                        <tr
                          id={p.id}
                          key={p.id}
                          onMouseEnter={() => setHoveredRoad(p.road)}
                          onMouseLeave={() => setHoveredRoad(undefined)}
                          onClick={() => {
                            setSelected(p)
                            setFocusedRoad(p.road)
                          }}
                          className={`cursor-pointer transition-colors ${
                            isSel
                              ? "bg-slate-wash border-l-2 border-l-slate"
                              : isRoadMatch
                                ? "bg-surface-raised"
                                : "hover:bg-hover"
                          }`}
                        >
                          {/* 1. Issue Type */}
                          <td className="whitespace-nowrap px-3.5 py-2.5">
                            <IssueTypeCell
                              p={p}
                              rowIndex={(validPage - 1) * pageSize + rowIdx}
                              onOpenPreview={() => setPreview(p)}
                            />
                          </td>

                          {/* 2. Date & Time */}
                          <td className="whitespace-nowrap px-3.5 py-2.5 font-mono text-xs">
                            <div className="text-text">{p.detected.split(",")[0]}</div>
                            <div className="text-[10.5px] text-text-muted">
                              {p.detected.split(",")[1]?.trim() || "09:30 AM"}
                            </div>
                          </td>

                          {/* 3. Severity */}
                          <td className="whitespace-nowrap px-3.5 py-2.5">
                            <Badge
                              tone={SEV_TONES[p.severity]}
                              word={p.severity}
                              variant={p.severity === "High" ? "outline" : "soft"}
                            />
                          </td>

                          {/* 4. Road & Ward */}
                          <td className="whitespace-nowrap px-3.5 py-2.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium text-text">{p.road}</span>
                              {focusedRoad === p.road && (
                                <span className="font-mono text-[9px] uppercase px-1 py-0.2 bg-slate-tint text-slate-deep">
                                  Corridor
                                </span>
                              )}
                            </div>
                            <div className="font-mono text-[10.5px] text-text-muted">{p.ward}</div>
                          </td>

                          {/* 5. Zone */}
                          <td className="whitespace-nowrap px-3.5 py-2.5 font-mono text-xs text-text-muted">
                            ZN-0{p.zone}
                          </td>

                          {/* 6. Surface */}
                          <td className="whitespace-nowrap px-3.5 py-2.5 text-center font-mono text-xs text-text-faint">
                            --
                          </td>

                          {/* 7. AI Confidence */}
                          <td className="whitespace-nowrap px-3.5 py-2.5 font-mono text-xs">
                            <span className="text-text">{p.confidence}%</span>
                          </td>

                          {/* 8. Actions */}
                          <td className="whitespace-nowrap px-3.5 py-2.5">
                            <div className="flex items-center gap-1.5">
                              <IconButton
                                glyph="map-pin"
                                size="sm"
                                variant="secondary"
                                title="Locate on Kanpur Map"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelected(p)
                                  setFocusedRoad(p.road)
                                }}
                              />
                              <IconButton
                                glyph="external"
                                size="sm"
                                variant="secondary"
                                title="View Evidence Image"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setPreview(p)
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                    {!paginatedList.length && (
                      <tr>
                        <td colSpan={8} className="py-12">
                          <EmptyState
                            label="HAZARD LEDGER · EMPTY"
                            title="No defects match the active filter criteria."
                            actionLabel="Reset Corridor Filters"
                            onAction={() => {
                              setSelectedZone("1")
                              setSelectedWard("All")
                              setSelectedRoad("All")
                              setSev("All")
                            }}
                          />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Pagination Bar (50 rows per screen) */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-rule bg-surface-raised px-4 py-2.5 font-mono text-xs text-text-muted">
                <div>
                  {list.length > 0 ? (
                    <span>
                      Showing {(validPage - 1) * pageSize + 1} – {Math.min(validPage * pageSize, list.length)} of{" "}
                      <span className="text-text font-medium">{list.length}</span> records · 50 / screen
                    </span>
                  ) : (
                    <span>0 records</span>
                  )}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={validPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      leading="chevron-left"
                    >
                      Prev
                    </Button>

                    <div className="flex items-center gap-1">
                      {getPageNumbers(validPage, totalPages).map((pNum, idx) => {
                        if (pNum === "...") {
                          return (
                            <span key={`dots-${idx}`} className="px-1 text-xs text-text-faint">
                              ...
                            </span>
                          )
                        }
                        const isActive = pNum === validPage
                        return (
                          <button
                            key={`page-${pNum}`}
                            type="button"
                            onClick={() => setCurrentPage(Number(pNum))}
                            className={`h-7 min-w-[28px] rounded-none px-1.5 font-mono text-xs transition-colors cursor-pointer ${
                              isActive
                                ? "bg-action text-on-action font-medium"
                                : "border border-rule bg-surface text-text hover:bg-hover"
                            }`}
                          >
                            {pNum}
                          </button>
                        )
                      })}
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={validPage >= totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      trailing="chevron-right"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Evidence Preview Modal */}
      {preview && <Preview p={preview} onClose={() => setPreview(undefined)} />}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Page 2: UsersPage (Staff Directory & Municipal Ward Assignment)
// ---------------------------------------------------------------------------

type Assignment = { zone: number; ward: string; officer: string }
const INITIAL_ASSIGN: Assignment[] = ZONES.flatMap((z) =>
  (KANPUR_WARDS[z.id] || []).map((w, i) => ({
    zone: z.id,
    ward: w,
    officer: i < 3 ? INITIAL_USERS[(z.id - 1) % INITIAL_USERS.length].id : "",
  })),
)

function EditUserModal({
  user,
  onSave,
  onClose,
}: {
  user: User
  onSave: (u: User) => void
  onClose: () => void
}) {
  const [u, setU] = useState(user)

  return (
    <Modal
      open={true}
      onClose={onClose}
      code={u.id}
      label="MUNICIPAL WORKFORCE"
      title={`Edit Staff Profile: ${u.name}`}
      size="sm"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={() => onSave(u)} leading="check">
            Save Changes
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Field label="Full Name" required>
          <Input
            value={u.name}
            onChange={(e) => setU({ ...u, name: e.target.value })}
            placeholder="Official Full Name"
          />
        </Field>

        <Field label="Contact Phone" required>
          <Input
            value={u.phone}
            onChange={(e) => setU({ ...u, phone: e.target.value })}
            placeholder="+91 Phone Number"
          />
        </Field>

        <Select
          label="Municipal Role"
          value={u.role}
          onChange={(val) => setU({ ...u, role: val })}
          options={ROLES.map((r) => ({ value: r, label: r }))}
        />
      </div>
    </Modal>
  )
}

function UsersPage() {
  const [tab, setTab] = useState<"status" | "assign">("status")
  const [users, setUsers] = useState(INITIAL_USERS)
  const [assign, setAssign] = useState(INITIAL_ASSIGN)
  const [savedAssign, setSavedAssign] = useState(INITIAL_ASSIGN)
  const [editing, setEditing] = useState<User>()
  const [q, setQ] = useState("")
  const [zone, setZone] = useState(1)
  const { toast } = useToast()
  const t = useT()

  const hasChanges = useMemo(() => {
    return assign.some((a, i) => a.officer !== savedAssign[i]?.officer)
  }, [assign, savedAssign])

  const handleApply = () => {
    setSavedAssign(assign)
    toast({
      title: t("Changes applied successfully!"),
      description: "Corridor and ward responsibilities have been updated in KNN database.",
      tone: "success",
    })
  }

  const officers = users.filter((u) => u.active && u.role !== "Viewer")
  const zoneRows = assign.filter((a) => a.zone === zone)
  const setOfficer = (ward: string, officer: string) =>
    setAssign(
      assign.map((a) =>
        a.ward === ward && a.zone === zone ? { ...a, officer } : a,
      ),
    )

  const shown = users.filter((u) =>
    `${u.name} ${u.id} ${u.role}`.toLowerCase().includes(q.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-rule pb-5">
        <div>
          <RunningHead code="02" label="MUNICIPAL WORKFORCE · KANPUR NAGAR NIGAM" />
          <Display size="lg" accent="for field operations." className="mt-1">
            Employees, status and ward/zone assignment
          </Display>
        </div>
        <Tabs<"status" | "assign">
          variant="line"
          value={tab}
          onChange={setTab}
          tabs={[
            { key: "status", label: t("Staff Directory"), count: users.length },
            { key: "assign", label: t("Zone & Ward Assignment") },
          ]}
        />
      </div>

      {tab === "status" && (
        <>
          {/* Workforce Metric Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard
              code="STAFF-01"
              label="Total Workforce"
              figure={users.length}
              unit="employees"
              source="SRC: KNN-HR-PERSONNEL"
              accentColor="#52769A"
            />
            <MetricCard
              code="STAFF-02"
              label="Active Staff"
              figure={users.filter((u) => u.active).length}
              unit="authorized"
              progress={Math.round((users.filter((u) => u.active).length / users.length) * 100)}
              source="SRC: IAM-ROLES-PASS"
              accentColor="#96A394"
            />
            <MetricCard
              code="STAFF-03"
              label="Deactivated"
              figure={users.filter((u) => !u.active).length}
              unit="revoked"
              source="SRC: DISPATCH-AUTH"
              accentColor="#7E4554"
            />
          </div>

          {/* Directory Card */}
          <Card level={0} className="space-y-4">
            <div className="flex flex-col gap-3 border border-rule bg-surface-raised p-3.5 sm:flex-row sm:items-center justify-between">
              <div className="max-w-md w-full">
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search employees by name, ID or role..."
                  leading="search"
                />
              </div>
              <div className="font-mono text-xs text-text-muted">
                {shown.length} {shown.length === 1 ? "Employee" : "Employees"} indexed
              </div>
            </div>

            <div className="overflow-x-auto rounded-none border border-rule bg-surface">
              <table className="w-full text-left border-collapse">
                <thead className="border-b border-rule bg-surface-raised font-mono text-[11px] uppercase tracking-wider text-text-muted">
                  <tr>
                    {[
                      "Employee",
                      "Role",
                      "Phone",
                      "Last Active",
                      "Status",
                      "Actions",
                    ].map((h) => (
                      <th key={h} className="px-4 py-3 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule font-body text-xs text-text">
                  {shown.map((u) => (
                    <tr key={u.id} className={u.active ? "hover:bg-hover" : "bg-surface-raised/40 opacity-70"}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={u.name} size="sm" />
                          <div>
                            <div className="font-medium text-text">{u.name}</div>
                            <div className="font-mono text-[11px] text-text-muted">{u.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{u.role}</td>
                      <td className="px-4 py-3 font-mono text-xs text-text-muted">{u.phone}</td>
                      <td className="px-4 py-3 font-mono text-xs text-text-faint">{u.last}</td>
                      <td className="px-4 py-3">
                        <Badge
                          tone={u.active ? "success" : "critical"}
                          word={u.active ? "Active" : "Deactivated"}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setEditing(u)}
                          leading="edit"
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {tab === "assign" && (
        <Card level={0} className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rule pb-3">
            <div>
              <div className="font-display font-medium text-sm text-text">
                Zone & Ward Field Assignment
              </div>
              <p className="font-body text-xs text-text-muted">
                Map designated zonal engineers to municipal corridors.
              </p>
            </div>
            <Button
              variant="brand"
              size="sm"
              disabled={!hasChanges}
              onClick={handleApply}
              leading="check"
            >
              {t("Apply Changes")}
            </Button>
          </div>

          {/* Zone Selector Tabs */}
          <div className="flex flex-wrap gap-1 border-b border-rule pb-2">
            {ZONES.map((z) => (
              <button
                key={z.id}
                type="button"
                onClick={() => setZone(z.id)}
                className={`px-3 py-1.5 font-mono text-xs rounded-none transition-colors cursor-pointer ${
                  zone === z.id
                    ? "bg-action text-on-action font-medium"
                    : "border border-rule bg-surface text-text hover:bg-hover"
                }`}
              >
                Zone {z.id}
              </button>
            ))}
          </div>

          {/* Ward Table */}
          <div className="overflow-x-auto rounded-none border border-rule bg-surface">
            <table className="w-full text-left border-collapse">
              <thead className="border-b border-rule bg-surface-raised font-mono text-[11px] uppercase tracking-wider text-text-muted">
                <tr>
                  <th className="px-4 py-3">Ward Name</th>
                  <th className="px-4 py-3">Municipal Zone</th>
                  <th className="px-4 py-3">Assigned Engineer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule font-body text-xs text-text">
                {zoneRows.map((row) => (
                  <tr key={row.ward} className="hover:bg-hover">
                    <td className="px-4 py-3 font-medium">{row.ward}</td>
                    <td className="px-4 py-3 font-mono text-xs text-text-muted">Zone {row.zone}</td>
                    <td className="px-4 py-3">
                      <div className="max-w-xs">
                        <Select
                          value={row.officer}
                          onChange={(val) => setOfficer(row.ward, val)}
                          options={[
                            { value: "", label: "Unassigned" },
                            ...officers.map((o) => ({ value: o.id, label: `${o.name} (${o.role})` })),
                          ]}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {editing && (
        <EditUserModal
          user={editing}
          onClose={() => setEditing(undefined)}
          onSave={(u) => {
            setUsers(users.map((x) => (x.id === u.id ? u : x)))
            setEditing(undefined)
            toast({
              title: "Staff Updated",
              description: `${u.name} profile has been saved.`,
              tone: "success",
            })
          }}
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Airawat Login Page (Architectural Blueprint Scrim)
// ---------------------------------------------------------------------------

function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [user, setUser] = useState("admin.knn")
  const [pass, setPass] = useState("Kanpur@2025")
  const [show, setShow] = useState(false)
  const [err, setErr] = useState("")

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user.trim() || !pass) {
      return setErr("Please enter both username and password")
    }
    setErr("")
    onLogin()
  }

  return (
    <div className="min-h-screen grid place-items-center bg-grad-ink-slate theme-ink grain p-4 text-paper relative select-none">
      <div className="relative w-full max-w-md rounded-none border border-rule-strong bg-ink p-8 sm:p-10 shadow-2xs overflow-hidden">
        {/* Subtle Jaali Heritage Motif in corner */}
        <div className="absolute top-2 right-2 opacity-20 pointer-events-none text-slate-tint">
          <JaaliMotif size={90} />
        </div>

        {/* Product Lockup */}
        <div className="relative z-10 flex items-center justify-between border-b border-rule pb-5">
          <ProductLockup product="AIRAWAT OS" subtext="Kanpur Nagar Nigam · नगर निगम कानपुर" />
          <StageTag stage="Live" />
        </div>

        <div className="relative z-10 mt-6">
          <RunningHead code="00" label="GOVERNMENT ACCESS GATEWAY" />
          <Display size="lg" accent="sign in to proceed." className="mt-1">
            Municipal Console
          </Display>
          <p className="mt-1 font-body text-xs text-paper-muted">
            Enter your official credentials to access the Nagar Dristi hazard ledger.
          </p>
        </div>

        <form onSubmit={submit} className="relative z-10 mt-6 space-y-4">
          <Field label="OFFICIAL USERNAME / ID" required>
            <Input
              autoFocus
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="e.g. admin.knn"
            />
          </Field>

          <Field label="SECURE PASSCODE" required>
            <div className="relative">
              <Input
                type={show ? "text" : "password"}
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-2.5 font-mono text-[10px] uppercase text-paper-muted hover:text-paper"
              >
                {show ? "Hide" : "Show"}
              </button>
            </div>
          </Field>

          {err && (
            <div className="rounded-none border border-rose-deep bg-rose-wash p-2.5 font-mono text-xs text-rose-deep">
              {err}
            </div>
          )}

          <Button
            type="submit"
            variant="brand"
            size="lg"
            block
            className="mt-6 font-mono uppercase tracking-wider"
            trailing="arrow-right"
          >
            Authenticate & Access
          </Button>
        </form>

        <div className="relative z-10 mt-8 border-t border-rule pt-4 text-center font-mono text-[10px] uppercase tracking-wider text-paper-faint">
          AIRAWAT INTERFACE · AIRAWAT OS V2 · KNN-SURV-2026
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Root Application Shell (TopBar, Collapsible SideNav, Providers)
// ---------------------------------------------------------------------------

function AppShell() {
  const [authed, setAuthed] = useState(false)
  const [page, setPage] = useState<"detect" | "users">("detect")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [lang, setLang] = useState<Lang>(
    () => (localStorage.getItem("nd-lang") as Lang) || "en",
  )
  const [dark, setDark] = useState(() => localStorage.getItem("nd-theme") === "dark")

  useEffect(() => {
    document.documentElement.classList.toggle("theme-ink", dark)
    document.documentElement.classList.toggle("dark", dark)
    localStorage.setItem("nd-theme", dark ? "dark" : "light")
  }, [dark])

  useEffect(() => {
    localStorage.setItem("nd-lang", lang)
    document.documentElement.lang = lang
  }, [lang])

  const t = (s: string) => (lang === "hi" ? (HI[s] ?? s) : s)

  const nav = [
    {
      k: "detect",
      l: "Live Detection",
      d: "Real-time pothole map and records",
      icon: "map" as const,
      count: 220,
    },
    {
      k: "users",
      l: "User Management",
      d: "Employees, status and ward/zone assignment",
      icon: "users" as const,
      count: 8,
    },
  ] as const

  const cur = nav.find((x) => x.k === page)!

  if (!authed) return <LoginPage onLogin={() => setAuthed(true)} />

  return (
    <LangCtx.Provider value={lang}>
      <div className="flex min-h-screen bg-ground font-body text-text">
        {/* Architectural SideNav (Airawat Raised Surface 1) */}
        <aside
          className={`sticky top-0 z-30 flex h-screen ${
            sidebarOpen ? "w-64" : "w-16"
          } shrink-0 flex-col border-r border-rule bg-surface transition-[width] duration-200 ease-in-out select-none`}
        >
          {/* Sidebar Header */}
          <div className="flex h-14 items-center border-b border-rule px-4">
            {sidebarOpen ? (
              <div className="flex w-full items-center justify-between">
                <ProductLockup product="AIRAWAT OS" subtext="Nagar Dristi · KNN" />
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="flex h-7 w-7 items-center justify-center border border-rule hover:border-slate text-text-muted hover:text-text rounded-none transition-colors cursor-pointer"
                  title="Collapse sidebar"
                  aria-label="Collapse sidebar"
                >
                  <Glyph name="menu" size={13} />
                </button>
              </div>
            ) : (
              <div className="flex w-full justify-center">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="flex h-8 w-8 items-center justify-center border border-rule hover:border-slate text-text-muted hover:text-text rounded-none transition-colors cursor-pointer"
                  title="Expand sidebar"
                  aria-label="Expand sidebar"
                >
                  <Glyph name="menu" size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Module Section Label */}
          {sidebarOpen && (
            <div className="px-4 pt-4 pb-1">
              <Label className="text-[10px] text-text-faint">01 · PLATFORM</Label>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="mt-1 space-y-1 px-2.5">
            {nav.map((x) => {
              const isActive = page === x.k
              return (
                <button
                  key={x.k}
                  onClick={() => setPage(x.k)}
                  title={!sidebarOpen ? t(x.l) : undefined}
                  className={`flex w-full items-center ${
                    sidebarOpen ? "justify-between px-3 py-2" : "justify-center px-0 py-2.5"
                  } rounded-none font-body text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? "bg-action text-on-action border border-rule"
                      : "text-text hover:bg-hover"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Square size={6} color={isActive ? "#52769A" : "#D0C8B8"} />
                    <Glyph name={x.icon} size={14} className="shrink-0" />
                    {sidebarOpen && <span className="truncate">{t(x.l)}</span>}
                  </div>
                  {sidebarOpen && <CountBadge count={x.count} />}
                </button>
              )
            })}
          </nav>

          {/* Sidebar Footer Controls */}
          <div className="mt-auto space-y-3 border-t border-rule p-3">
            {sidebarOpen ? (
              <>
                <div>
                  <div className="mb-1 font-mono text-[10.5px] uppercase text-text-faint">
                    {t("Language")}
                  </div>
                  <ButtonGroup<Lang>
                    value={lang}
                    onChange={setLang}
                    items={[
                      { key: "en", label: "English" },
                      { key: "hi", label: "हिन्दी" },
                    ]}
                  />
                </div>
                <div>
                  <div className="mb-1 font-mono text-[10.5px] uppercase text-text-faint">
                    {t("Theme")}
                  </div>
                  <ButtonGroup<"paper" | "ink">
                    value={dark ? "ink" : "paper"}
                    onChange={(v) => setDark(v === "ink")}
                    items={[
                      { key: "paper", label: "Paper", icon: "sun" },
                      { key: "ink", label: "Ink", icon: "moon" },
                    ]}
                  />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLang(lang === "en" ? "hi" : "en")}
                  title={`Switch to ${lang === "en" ? "Hindi" : "English"}`}
                  className="flex h-8 w-8 items-center justify-center border border-rule font-mono text-[10.5px] font-medium text-text hover:bg-hover cursor-pointer"
                >
                  {lang.toUpperCase()}
                </button>
                <button
                  type="button"
                  onClick={() => setDark(!dark)}
                  title={dark ? "Switch to Paper mode" : "Switch to Ink mode"}
                  className="flex h-8 w-8 items-center justify-center border border-rule text-text hover:bg-hover cursor-pointer"
                >
                  <Glyph name={dark ? "sun" : "moon"} size={13} />
                </button>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="border-t border-rule p-3">
            {sidebarOpen ? (
              <div className="flex items-center gap-2.5">
                <Avatar name="Rajesh Kumar" size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-body text-xs font-medium text-text">
                    {t("Rajesh Kumar")}
                  </div>
                  <div className="truncate font-mono text-[10px] text-text-faint">
                    {t("System Administrator")}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAuthed(false)}
                  className="border border-rule px-2 py-1 font-mono text-[10.5px] text-text-muted hover:border-rose-deep hover:text-rose-deep transition-colors cursor-pointer"
                >
                  {t("Log out")}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5">
                <Avatar name="Rajesh Kumar" size="sm" />
                <button
                  type="button"
                  onClick={() => setAuthed(false)}
                  title={t("Log out")}
                  className="flex h-7 w-7 items-center justify-center border border-transparent hover:border-rule text-text-muted hover:text-rose-deep cursor-pointer"
                >
                  <Glyph name="x" size={13} />
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="min-w-0 flex-1 flex flex-col">
          {/* Top Bar (Airawat 56px Specification) */}
          <header className="flex h-14 items-center justify-between border-b border-rule bg-surface px-6 sticky top-0 z-20">
            <div className="flex items-center gap-4 min-w-0">
              <Breadcrumbs
                items={[
                  { label: "Kanpur" },
                  { label: "Zone 1-6" },
                  { label: t(cur.l) },
                ]}
              />
            </div>

            <div className="flex items-center gap-3">
              <StageTag stage="Live" />
              <div className="h-4 w-px bg-rule" />
              <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] text-text-muted">
                <Square size={6} color="#96A394" />
                <span>ALL TELEMETRY NOMINAL</span>
              </div>
            </div>
          </header>

          {/* Page Ground Content */}
          <div className="p-6 flex-1">
            {page === "detect" ? <DetectionPage /> : <UsersPage />}
          </div>
        </main>
      </div>
    </LangCtx.Provider>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <AppShell />
    </ToastProvider>
  )
}
