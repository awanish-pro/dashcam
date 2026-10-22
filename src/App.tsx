import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

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
  "Search by pothole ID, road, ward, engineer or vehicle...":
    "गड्ढा आईडी, सड़क, वार्ड, अभियंता या वाहन से खोजें...",
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
  Light: "लाइट",
  Dark: "डार्क",
  "Log out": "लॉग आउट",
  "System Administrator": "सिस्टम प्रशासक",
  "Rajesh Kumar": "राजेश कुमार",
}
const LangCtx = createContext<Lang>("en")
const useT = () => {
  const lang = useContext(LangCtx)
  return (s: string) => (lang === "hi" ? (HI[s] ?? s) : s)
}

type Severity = "High" | "Medium" | "Low"
type IssueType = "Pothole" | "Garbage"

type Pothole = {
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
type User = {
  id: string
  name: string
  role: string
  phone: string
  zones: number[]
  wards: string[]
  active: boolean
  last: string
}

export const KANPUR_WARDS: Record<number, string[]> = {
  1: ["Civil Lines", "Naveen Market", "Chunni Ganj", "Phool Bagh", "Colonelganj", "Bada Chauraha"],
  2: ["Kalyanpur", "IIT Kanpur Campus", "Panki", "Indira Nagar", "Vikas Nagar", "Rawatpur"],
  3: ["Kidwai Nagar", "Juhi", "Babupurwa", "Barra", "Transport Nagar", "Yashoda Nagar"],
  4: ["Govind Nagar", "Dada Nagar", "Fazalganj", "Shastri Nagar", "Udyog Nagar", "Ratan Lal Nagar"],
  5: ["Kakadeo", "Swaroop Nagar", "Arya Nagar", "Geeta Nagar", "Sharda Nagar", "Tilak Nagar"],
  6: ["Chakeri", "Jajmau", "Harjinder Nagar", "Shyam Nagar", "Ramadevi", "Cantt South"],
}

const ZONES = [
  { id: 1, name: "Zone 1 · Civil Lines", lat: 26.4745, lng: 80.3485, cx: 170, cy: 120 },
  { id: 2, name: "Zone 2 · Kalyanpur", lat: 26.4950, lng: 80.2620, cx: 380, cy: 115 },
  { id: 3, name: "Zone 3 · Kidwai Nagar", lat: 26.4350, lng: 80.3360, cx: 565, cy: 150 },
  { id: 4, name: "Zone 4 · Govind Nagar", lat: 26.4420, lng: 80.2840, cx: 190, cy: 270 },
  { id: 5, name: "Zone 5 · Kakadeo", lat: 26.4800, lng: 80.3060, cx: 400, cy: 260 },
  { id: 6, name: "Zone 6 · Chakeri", lat: 26.4320, lng: 80.4060, cx: 565, cy: 290 },
]

const ROADS = [
  "GT Road",
  "Mall Road",
  "VIP Road",
  "Kalpi Road",
  "Hamirpur Road",
  "Naveen Market Rd",
  "Swaroop Nagar Rd",
  "Jajmau Rd",
] as const

const ROAD_PATHS: Record<string, [number, number][]> = {
  "GT Road": [
    [26.4980, 80.2580],
    [26.4920, 80.2750],
    [26.4850, 80.2950],
    [26.4780, 80.3120],
    [26.4680, 80.3320],
    [26.4520, 80.3600],
    [26.4380, 80.3880],
    [26.4250, 80.4180],
  ],
  "Mall Road": [
    [26.4765, 80.3320],
    [26.4740, 80.3410],
    [26.4720, 80.3500],
    [26.4695, 80.3590],
    [26.4660, 80.3680],
  ],
  "VIP Road": [
    [26.4890, 80.3250],
    [26.4850, 80.3380],
    [26.4810, 80.3520],
    [26.4760, 80.3650],
  ],
  "Kalpi Road": [
    [26.4720, 80.3150],
    [26.4610, 80.3010],
    [26.4490, 80.2850],
    [26.4380, 80.2680],
  ],
  "Hamirpur Road": [
    [26.4520, 80.3370],
    [26.4410, 80.3350],
    [26.4300, 80.3330],
    [26.4180, 80.3310],
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

const ROAD_ZONES: Record<string, number> = {
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
      color: SEV[dominantSeverity],
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
const TWO_MONTHS_AGO_ISO = "2026-08-22"

function formatDisplayDate(iso: string) {
  if (!iso) return ""
  const parts = iso.split("-").map(Number)
  if (parts.length < 3) return iso
  const [y, m, d] = parts
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  return `${d} ${months[(m || 1) - 1]} ${y}`
}

function getDeterministicDate(i: number, zone: number): { dateIso: string; detectedStr: string } {
  let daysAgo = 0
  if ((zone === 1 && i < 65) || i % 3 === 0) {
    daysAgo = 0 // Today (22 Oct 2026) - ensures 50+ records on today's date for Zone 1
  } else if (i % 5 === 1) {
    daysAgo = 1 // Yesterday (21 Oct 2026)
  } else if (i % 5 === 2) {
    daysAgo = 2 + (i % 5) // Last 7 days (17 - 20 Oct 2026)
  } else if (i % 5 === 3) {
    daysAgo = 8 + (i % 20) // Last 30 days (02 Oct - 14 Oct 2026)
  } else {
    daysAgo = 28 + (i % 30) // Last 2 months (late Aug - Sep 2026)
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

const POTHOLES: Pothole[] = Array.from({ length: 220 }, (_, i) => {
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
  const issueType: IssueType = (i % 4 === 1 || i % 7 === 0) ? "Garbage" : "Pothole"
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

const INITIAL_USERS: User[] = [
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
const ROLES = ["Zonal Administrator", "Engineer", "Field Staff", "Viewer"]

// PGR Design System Color Mappings
const SEV: Record<Severity, string> = {
  High: "#c62839", // Colors/Red/300
  Medium: "#e69f00", // Colors/Yellow/300
  Low: "#11806a", // Colors/Teal/300
}

const SEV_BADGE: Record<Severity, {
  bg: string
  text: string
  border: string
  label: string
}> = {
  High: {
    bg: "bg-[#f6dfe1]",
    text: "text-[#771822]",
    border: "border-[#edbcc2]",
    label: "High Risk",
  },
  Medium: {
    bg: "bg-[#fbf1d9]",
    text: "text-[#8a5f00]",
    border: "border-[#f7e1b0]",
    label: "Medium",
  },
  Low: {
    bg: "bg-[#dbece9]",
    text: "text-[#0a4d40]",
    border: "border-[#b5d8d1]",
    label: "Low Risk",
  },
}

function NagarDristiLogo({
  size = 36,
  className = "",
}: {
  size?: number
  className?: string
}) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative grid place-items-center rounded-xl bg-gradient-to-br from-[#2563eb] to-[#0d2352] p-1.5 shadow-md shadow-primary-500/20 ring-1 ring-white/20 shrink-0 ${className}`}
    >
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
      >
        <path
          d="M2.5 16C6.5 9.8 11 6.8 16 6.8S25.5 9.8 29.5 16C25.5 22.2 21 25.2 16 25.2S6.5 22.2 2.5 16Z"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="16" cy="16" r="5.2" stroke="#bbcff9" strokeWidth="1.8" />
        <circle cx="16" cy="16" r="2.4" fill="white" />
        <path
          d="M13.5 23.5L15 18H17L18.5 23.5"
          stroke="#dee8fc"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

const Icon = ({
  d,
  className = "w-4 h-4",
}: {
  d: string
  className?: string
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d={d} />
  </svg>
)

const I = {
  map: "M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Zm0 0v14m6-12v14",
  list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  users:
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.3-4.3",
  x: "M18 6 6 18M6 6l12 12",
  pin: "M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Zm0-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  bell: "M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9m4.3 13a2 2 0 0 0 3.4 0",
  edit: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z",
  video: "m22 8-6 4 6 4V8ZM2 6h14v12H2z",
  crosshair:
    "M12 2v4m0 12v4M2 12h4m12 0h4m-10 6a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z",
  external:
    "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6m4-3h6v6m-11 5L21 3",
  sun: "M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0-14v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4",
  moon: "M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z",
  eye: "M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  shapes: "M12 2 2 7l10 5 10-5-10-5ZM2 17l10 5 10-5M2 12l10 5 10-5",
  calendar:
    "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z",
  chevron: "m6 9 6 6 6-6",
  check: "m5 13 4 4L19 7",
}

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

const getEvidenceImg = (p: Pothole, w = 400) => {
  const i = POTHOLES.findIndex((x) => x.id === p.id)
  const idxVal = i >= 0 ? i : 0
  if (p.issueType === "Garbage") {
    const id = GARBAGE_IMGS[idxVal % GARBAGE_IMGS.length]
    return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${Math.round(w * 0.75)}&q=70`
  }
  const id = POTHOLE_IMGS[idxVal % POTHOLE_IMGS.length]
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${Math.round(w * 0.75)}&q=70`
}

const idx = (p: Pothole) => {
  const i = POTHOLES.findIndex((x) => x.id === p.id)
  return i >= 0 ? i : 0
}
const WARDS = (z: number) => KANPUR_WARDS[z] || []

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
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setShowPopup((prev) => !prev)
  }

  useEffect(() => {
    const handleDocClick = (e: MouseEvent) => {
      if (cellRef.current && !cellRef.current.contains(e.target as Node)) {
        setShowPopup(false)
      }
    }
    if (showPopup) {
      document.addEventListener("click", handleDocClick)
    }
    return () => {
      document.removeEventListener("click", handleDocClick)
    }
  }, [showPopup])

  const openDownward = typeof rowIndex === "number" && rowIndex < 3

  return (
    <div
      ref={cellRef}
      className="relative inline-block"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        type="button"
        onClick={handleClick}
        title={`Click or hover to preview ${p.issueType} photo`}
        className="group inline-flex items-center gap-1 text-xs font-medium text-primary-500 hover:text-primary-600 transition text-left cursor-pointer focus:outline-none"
      >
        <span className="underline decoration-dotted underline-offset-4 decoration-primary-300 group-hover:decoration-primary-500">
          {p.issueType}
        </span>
      </button>

      {showPopup && (
        <div
          onClick={(e) => {
            e.stopPropagation()
            onOpenPreview()
          }}
          className={`absolute left-0 z-50 w-64 rounded-xl border border-[#e4e4e4] bg-white p-2 shadow-2xl backdrop-blur transition-all duration-150 animate-in fade-in zoom-in-95 cursor-pointer pointer-events-auto ${
            openDownward ? "top-full mt-2" : "bottom-full mb-2"
          }`}
        >
          <div className="relative overflow-hidden rounded-lg aspect-[16/10] bg-[#fafafa]">
            <img
              src={getEvidenceImg(p, 480)}
              alt={`${p.issueType} detection`}
              className="h-full w-full object-cover transition duration-300 hover:scale-105"
            />
            <div className="absolute top-1.5 left-1.5 rounded-md bg-[#1a1a1a]/85 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur">
              {p.issueType}
            </div>
            <div className="absolute top-1.5 right-1.5 rounded-md bg-primary-500/90 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur">
              {p.confidence}% AI
            </div>
            <div className="absolute bottom-1.5 left-1.5 right-1.5 rounded-md bg-[#1a1a1a]/80 px-2 py-1 text-[10px] text-white backdrop-blur truncate">
              {p.road} · {p.ward}
            </div>
          </div>
          <div className="mt-1.5 flex items-center justify-between px-1 text-[10.5px]">
            <span className="text-[#6e6e6e] truncate max-w-[140px]">{p.road}</span>
            <span className="text-primary-500 font-medium hover:underline">Click to enlarge ↗</span>
          </div>
        </div>
      )}
    </div>
  )
}

function formatSlashDate(iso?: string) {
  if (!iso) return "05/08/2026"
  const parts = iso.split("-")
  if (parts.length < 3) return iso
  const [y, m, d] = parts
  return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`
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
  return "15:26"
}

function Preview({ p, onClose }: { p: Pothole; onClose: () => void }) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[#1a1a1a]/60 p-4 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-[#e4e4e4] bg-white shadow-2xl animate-in fade-in zoom-in-95 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top-Right Cross Icon */}
        <button
          type="button"
          onClick={onClose}
          style={{ position: "absolute", top: "16px", right: "16px", zIndex: 50 }}
          className="flex items-center justify-center h-8 w-8 rounded-full bg-[#1a1a1a]/80 hover:bg-[#1a1a1a] text-white transition shadow-lg backdrop-blur cursor-pointer focus:outline-none"
          title="Close (Esc)"
          aria-label="Close modal"
        >
          <Icon d={I.x} className="h-4 w-4" />
        </button>

        <div className="relative">
          <img
            src={getEvidenceImg(p, 1000)}
            alt={`Evidence photo for ${p.issueType} ${p.id}`}
            className="aspect-[16/9] w-full object-cover"
          />
          <div className="absolute left-3 top-3 flex items-center gap-2 rounded-lg bg-[#1a1a1a]/80 px-2.5 py-1 text-xs text-white backdrop-blur">
            <span className="font-mono">{p.id}</span>
            <span>·</span>
            <span>AI {p.confidence}%</span>
            <span>·</span>
            <span>{p.vehicle}</span>
          </div>
        </div>

        {/* Bottom Information Strip */}
        <div className="p-5 bg-white">
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 sm:gap-2">
            <div>
              <div className="text-[10.5px] font-medium uppercase text-[#737373] tracking-wide mb-1">
                DATE
              </div>
              <div className="text-xs sm:text-sm font-medium text-[#1a1a1a] whitespace-nowrap">
                {formatSlashDate(p.dateIso)}
              </div>
            </div>
            <div>
              <div className="text-[10.5px] font-medium uppercase text-[#737373] tracking-wide mb-1">
                TIME
              </div>
              <div className="text-xs sm:text-sm font-medium text-[#1a1a1a] whitespace-nowrap">
                {extractTime24(p)}
              </div>
            </div>
            <div>
              <div className="text-[10.5px] font-medium uppercase text-[#737373] tracking-wide mb-1">
                SEVERITY
              </div>
              <div className="text-xs sm:text-sm font-medium text-[#1a1a1a] whitespace-nowrap">
                -
              </div>
            </div>
            <div>
              <div className="text-[10.5px] font-medium uppercase text-[#737373] tracking-wide mb-1">
                VEHICLE
              </div>
              <div className="text-xs sm:text-sm font-medium text-[#1a1a1a] whitespace-nowrap">
                {p.vehicle}
              </div>
            </div>
            <div>
              <div className="text-[10.5px] font-medium uppercase text-[#737373] tracking-wide mb-1">
                LAT
              </div>
              <div className="text-xs sm:text-sm font-medium text-[#1a1a1a] whitespace-nowrap">
                {p.lat.toFixed(4)}
              </div>
            </div>
            <div>
              <div className="text-[10.5px] font-medium uppercase text-[#737373] tracking-wide mb-1">
                LNG
              </div>
              <div className="text-xs sm:text-sm font-medium text-[#1a1a1a] whitespace-nowrap">
                {p.lng.toFixed(4)}
              </div>
            </div>
            <div>
              <div className="text-[10.5px] font-medium uppercase text-[#737373] tracking-wide mb-1">
                ZONE
              </div>
              <div className="text-xs sm:text-sm font-medium text-[#1a1a1a] whitespace-nowrap">
                Zone {p.zone}
              </div>
            </div>
            <div>
              <div className="text-[10.5px] font-medium uppercase text-[#737373] tracking-wide mb-1">
                WARD
              </div>
              <div className="text-xs sm:text-sm font-medium text-[#1a1a1a] uppercase truncate whitespace-nowrap" title={p.ward}>
                {p.ward || ""}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function EditUser({
  user,
  onSave,
  onClose,
}: {
  user: User
  onSave: (u: User) => void
  onClose: () => void
}) {
  const [u, setU] = useState(user)
  const field =
    "mt-1.5 w-full rounded-lg border border-[#c7c7c7] px-3.5 py-2.5 text-sm text-[#1a1a1a] outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100"
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[#1a1a1a]/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-[#e4e4e4] bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#e4e4e4] px-5 py-4">
          <div className="text-base font-medium text-[#1a1a1a]">
            Edit Employee{" "}
            <span className="font-mono text-xs text-[#4b4b4b]">{u.id}</span>
          </div>
          <button
            onClick={onClose}
            className="text-[#4b4b4b] hover:text-[#1a1a1a]"
          >
            <Icon d={I.x} />
          </button>
        </div>
        <div className="space-y-4 p-5">
          <label className="block">
            <span className="text-xs font-medium text-[#2d2d2d]">
              Full Name
            </span>
            <input
              className={field}
              value={u.name}
              onChange={(e) => setU({ ...u, name: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-[#2d2d2d]">Phone</span>
            <input
              className={field}
              value={u.phone}
              onChange={(e) => setU({ ...u, phone: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-[#2d2d2d] mb-1.5 block">Role</span>
            <DropdownSelect
              value={u.role}
              onChange={(val) => setU({ ...u, role: val })}
              placeholder="Select role"
              className="w-full"
              options={ROLES.map((r) => ({ value: r, label: r }))}
            />
          </label>
        </div>
        <div className="flex justify-end gap-2 border-t border-[#e4e4e4] px-5 py-3">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-[#2d2d2d] hover:bg-[#fafafa]"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(u)}
            className="rounded-lg bg-primary-300 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-400 active:bg-primary-500"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

function SearchBox({
  value,
  onChange,
  placeholder,
  className = "",
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  className?: string
}) {
  return (
    <div className={`relative ${className}`}>
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4b4b4b]">
        <Icon d={I.search} className="h-4 w-4" />
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-[#c7c7c7] bg-white py-2.5 pl-10 pr-4 text-sm text-[#1a1a1a] placeholder-[#4b4b4b] outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100"
      />
    </div>
  )
}

const TILES = { Street: "m", Satellite: "y" } as const

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
    <div className="rounded-xl border border-[#e4e4e4] bg-[#fafafa]/60 p-3 shadow-2xs">
      {/* Month Header */}
      <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-[#e4e4e4]">
        {onPrevMonth ? (
          <button
            type="button"
            disabled={!canPrev}
            onClick={onPrevMonth}
            className={`p-1 rounded-md text-[#4b4b4b] hover:bg-white hover:text-[#1a1a1a] transition ${
              !canPrev ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
            }`}
            title="Previous Month"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        ) : (
          <div className="w-5" />
        )}
        <span className="text-xs font-medium text-[#1a1a1a]">
          {MONTH_NAMES[month]} {year}
        </span>
        {onNextMonth ? (
          <button
            type="button"
            disabled={!canNext}
            onClick={onNextMonth}
            className={`p-1 rounded-md text-[#4b4b4b] hover:bg-white hover:text-[#1a1a1a] transition ${
              !canNext ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
            }`}
            title="Next Month"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <div className="w-5" />
        )}
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 mb-1 text-center">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div key={day} className="text-[10px] font-medium text-[#6e6e6e] py-0.5">
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
                isInRange ? "bg-primary-100" : ""
              } ${isStart && !isEnd ? "bg-gradient-to-r from-transparent to-primary-100 rounded-l-full" : ""} ${
                isEnd && !isStart ? "bg-gradient-to-l from-transparent to-primary-100 rounded-r-full" : ""
              }`}
            >
              <button
                type="button"
                disabled={isFuture}
                onClick={() => onDateClick(dateIso)}
                onMouseEnter={() => onDateHover(dateIso)}
                className={`h-7 w-7 flex items-center justify-center text-[11px] font-medium transition cursor-pointer ${
                  isStart || isEnd
                    ? "bg-primary-500 text-white rounded-full shadow-xs ring-2 ring-primary-300"
                    : isInRange
                      ? "text-primary-700 hover:bg-primary-200 rounded-none"
                      : isFuture
                        ? "text-[#c7c7c7] cursor-not-allowed"
                        : isToday
                          ? "text-primary-600 ring-1 ring-primary-400 rounded-full hover:bg-primary-50"
                          : "text-[#1a1a1a] hover:bg-[#e4e4e4] rounded-full"
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

  // Left card default: September 2026 (month index 8), right card: October 2026 (month index 9)
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
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
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
    if (rangeStep === "end") {
      setHoverDate(dateIso)
    }
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
    // Cap at October 2026 for the right card (leftMonth cannot exceed 8 for Sep)
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
          className={`flex items-center gap-2 rounded-lg border border-[#e4e4e4] bg-white/95 px-3 py-1.5 text-xs font-medium text-[#1a1a1a] shadow-sm backdrop-blur transition hover:bg-white hover:border-primary-300 cursor-pointer ${
            isOpen ? "ring-2 ring-primary-300 border-primary-400" : ""
          }`}
          title="Filter by Calendar Date Range (2 Month Cards)"
        >
          <Icon d={I.calendar} className="h-3.5 w-3.5 text-primary-500 shrink-0" />
          <span className="font-medium text-[#1a1a1a] max-w-[190px] truncate">{labelText}</span>
          <span className="rounded-full bg-primary-100 px-1.5 py-0.2 text-[10.5px] font-medium text-primary-500">
            {hazardCount}
          </span>
          <svg
            className={`h-3 w-3 text-[#6e6e6e] transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-1.5 w-[530px] max-w-[calc(100vw-32px)] max-h-[85vh] overflow-y-auto rounded-2xl border border-[#e4e4e4] bg-white p-3.5 shadow-2xl backdrop-blur animate-in fade-in zoom-in-95 z-50">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#e4e4e4] pb-2 mb-3">
              <div className="flex items-center gap-2">
                <Icon d={I.calendar} className="h-4 w-4 text-primary-500" />
                <span className="text-xs font-medium text-[#1a1a1a]">Select Date Range (2 Months)</span>
              </div>
              <span className="text-[11px] text-[#6e6e6e]">
                {rangeStep === "end" ? "Click to set end date" : "Click to select range"}
              </span>
            </div>

            {/* 2 Month Cards Side-by-Side */}
            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              onMouseLeave={() => setHoverDate(null)}
            >
              {/* Card 1: Left Month (September 2026) */}
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

              {/* Card 2: Right Month (October 2026) */}
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

            {/* Footer */}
            <div className="mt-3.5 pt-3 border-t border-[#e4e4e4] flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-xs text-[#3c3c3c]">
                <span className="font-medium text-[#1a1a1a]">Range:</span>
                <span className="font-mono text-primary-500 font-medium bg-primary-50 border border-primary-200 px-2 py-0.5 rounded-md">
                  {tempStart === tempEnd
                    ? formatDisplayDate(tempStart)
                    : `${formatDisplayDate(tempStart)} → ${formatDisplayDate(tempEnd)}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTempStart(TODAY_ISO)
                    setTempEnd(TODAY_ISO)
                    setRangeStep("start")
                    onRangeChange(TODAY_ISO, TODAY_ISO)
                    setIsOpen(false)
                  }}
                  className="text-xs text-[#4b4b4b] hover:text-[#1a1a1a] underline px-2 py-1 cursor-pointer"
                >
                  Reset to Today
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onRangeChange(tempStart, tempEnd)
                    setIsOpen(false)
                  }}
                  className="rounded-lg bg-primary-500 px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-primary-600 shadow-sm cursor-pointer"
                >
                  Apply Range
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {isDrilledDown && onResetCityView && (
        <button
          type="button"
          onClick={onResetCityView}
          className="rounded-lg border border-[#e4e4e4] bg-white/95 px-2.5 py-1.5 text-xs font-medium text-[#1a1a1a] shadow-sm backdrop-blur hover:bg-white hover:text-primary-500 transition cursor-pointer"
          title="Zoom out to Kanpur City View"
        >
          ↩ City View
        </button>
      )}
    </div>
  )
}

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

    m.on("zoomend", () => {
      setZoom(m.getZoom())
    })

    const ro = new ResizeObserver(() => {
      m.invalidateSize()
    })
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

  // 1. Render Street-Level Road Corridors
  useEffect(() => {
    if (!roadLayer.current || !map.current) return
    const rg = roadLayer.current
    rg.clearLayers()

    Object.values(roadSummaries).forEach((summary) => {
      if (!summary.points.length || summary.totalCount === 0) return
      const isRoadFocused = (focusedRoad || selected?.road) === summary.name
      const isRoadHovered = hoveredRoad === summary.name

      // Outer Glow Polyline
      const glowPoly = L.polyline(summary.points, {
        color: summary.color,
        weight: isRoadFocused ? 14 : isRoadHovered ? 12 : 9,
        opacity: isRoadFocused ? 0.6 : isRoadHovered ? 0.48 : isDetailLevel ? 0.28 : 0.38,
        lineCap: "round",
        lineJoin: "round",
        interactive: true,
      })

      // Inner Core Stroke
      const corePoly = L.polyline(summary.points, {
        color: summary.color,
        weight: isRoadFocused ? 6 : isRoadHovered ? 5 : 4,
        opacity: isRoadFocused ? 1.0 : isRoadHovered ? 0.95 : isDetailLevel ? 0.65 : 0.88,
        lineCap: "round",
        lineJoin: "round",
        interactive: true,
      })

      const tooltipContent = `
        <div style="font-family:inherit;font-size:12px;padding:3px 5px;color:#1a1a1a;">
          <div style="font-weight:500;font-size:13px;color:#1a1a1a;margin-bottom:2px;">${summary.name}</div>
          <div style="display:flex;align-items:center;gap:5px;">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${summary.color};"></span>
            <span style="color:${summary.color};font-weight:500;">${summary.dominantSeverity} Severity Corridor</span>
            <span style="color:#a1a1a1;">·</span>
            <span style="color:#2d2d2d;font-weight:500;">${summary.totalCount} Hazards</span>
          </div>
          <div style="font-size:11px;color:#4b4b4b;margin-top:2px;">
            <span style="color:#c62839;font-weight:500;">${summary.highCount} High</span> · 
            <span style="color:#e69f00;font-weight:500;">${summary.medCount} Med</span> · 
            <span style="color:#11806a;font-weight:500;">${summary.lowCount} Low</span>
          </div>
          <div style="font-size:10px;color:#2563eb;margin-top:4px;font-weight:500;">Click street to drill down & inspect hazards →</div>
        </div>
      `
      glowPoly.bindTooltip(tooltipContent, { sticky: true, opacity: 0.95 })
      corePoly.bindTooltip(tooltipContent, { sticky: true, opacity: 0.95 })

      const handleRoadClick = () => {
        onFocusRoad?.(summary.name)
        if (map.current) {
          map.current.fitBounds(L.polyline(summary.points).getBounds(), {
            padding: [45, 45],
            maxZoom: 16,
          })
        }
      }

      glowPoly.on("click", handleRoadClick)
      corePoly.on("click", handleRoadClick)
      glowPoly.on("mouseover", () => onHoverRoad?.(summary.name))
      glowPoly.on("mouseout", () => onHoverRoad?.(undefined))
      corePoly.on("mouseover", () => onHoverRoad?.(summary.name))
      corePoly.on("mouseout", () => onHoverRoad?.(undefined))

      glowPoly.addTo(rg)
      corePoly.addTo(rg)

      // Midpoint Street Badge Pill (shown on Overview or when Focused)
      if (!isDetailLevel || isRoadFocused) {
        const badgeIcon = L.divIcon({
          className: "road-badge-icon",
          iconSize: [0, 0],
          iconAnchor: [0, 0],
          html: `
            <div class="road-badge-pill ${isRoadFocused ? "is-focused" : ""}" style="--c:${summary.color}">
              <span class="badge-dot" style="background:${summary.color}"></span>
              <span>${summary.name}</span>
              <span class="badge-count">${summary.totalCount}</span>
            </div>
          `,
        })

        const badgeMarker = L.marker(summary.center, {
          icon: badgeIcon,
          zIndexOffset: isRoadFocused ? 500 : 200,
        })
        badgeMarker.on("click", handleRoadClick)
        badgeMarker.addTo(rg)
      }
    })
  }, [roadSummaries, isDetailLevel, focusedRoad, selected, hoveredRoad, onFocusRoad, onHoverRoad])

  // 2. Render Individual Pothole Detection Markers
  useEffect(() => {
    if (!markerLayer.current) return
    const mg = markerLayer.current
    mg.clearLayers()

    list.forEach((p) => {
      const isSel = selected?.id === p.id
      const delay = ((idx(p) % 8) * 0.35).toFixed(2)
      const sevClass = `sev-${p.severity.toLowerCase()}`

      // In Level 1 (Overview), keep markers subtle/minimized to eliminate clutter
      const markerModeClass = !isDetailLevel ? "is-minimized" : ""

      const icon = L.divIcon({
        className: "pothole-bubble-icon",
        iconSize: [0, 0],
        iconAnchor: [0, 0],
        html: `
          <div class="pothole-bubble-wrapper ${isSel ? "is-selected" : ""} ${markerModeClass} ${sevClass}" style="--c:${SEV[p.severity]};--d:${delay}s">
            <div class="bubble-halo"></div>
            ${
              isSel
                ? `<svg class="selected-dashed-ring" viewBox="0 0 46 46">
                    <circle cx="23" cy="23" r="19" fill="none" stroke="currentColor" stroke-width="2.5" stroke-dasharray="5 3.5" />
                  </svg>`
                : ""
            }
            <div class="bubble-ripple ripple-1"></div>
            <div class="bubble-ripple ripple-2"></div>
            <div class="bubble-dot"></div>
            <div class="bubble-hitarea"></div>
          </div>
        `,
      })

      const marker = L.marker([p.lat, p.lng], {
        icon,
        zIndexOffset: isSel ? 3000 : p.severity === "High" ? 150 : 50,
      })
        .bindTooltip(
          `<div style="font-family:inherit;font-size:12px;padding:3px 5px;color:#1a1a1a;">
            <div style="display:flex;align-items:center;gap:5px;">
              <span style="font-weight:500;color:#2563eb;">${p.id}</span>
              <span style="color:#c7c7c7;">|</span>
              <span style="color:${SEV[p.severity]};font-weight:500;">${p.issueType} · ${p.severity}</span>
            </div>
            <div style="color:#4b4b4b;font-weight:500;margin-top:1px;">${p.road}, ${p.ward}</div>
            <div style="color:#3c3c3c;font-size:11px;margin-top:2px;">AI Confidence: ${p.confidence}% · ${p.vehicle}</div>
          </div>`,
          { direction: "top", offset: [0, isSel ? -24 : -16] },
        )
        .on("click", () => {
          onSelect(p)
          onFocusRoad?.(p.road)
        })

      marker.addTo(mg)

      if (isSel) {
        marker.openTooltip()
      }
    })
  }, [list, selected, isDetailLevel, onSelect, onFocusRoad])

  const lastKey = useRef(filterKey)
  const hasInitialFit = useRef(false)

  useEffect(() => {
    if (!map.current || !list.length) return
    if (!hasInitialFit.current || filterKey !== lastKey.current) {
      hasInitialFit.current = true
      lastKey.current = filterKey
      if (!selected && !focusedRoad) {
        map.current.fitBounds(L.latLngBounds(list.map((p) => [p.lat, p.lng])), {
          padding: [32, 32],
          maxZoom: 13,
        })
      }
    }
  }, [list, filterKey, selected, focusedRoad])

  // Center/Zoom on Selected Pothole
  useEffect(() => {
    if (selected && map.current) {
      map.current.flyTo([selected.lat, selected.lng], 16, { duration: 0.7 })
    }
  }, [selected])

  const resetToCity = () => {
    onFocusRoad?.(undefined)
    onSelect(undefined as any)
    if (map.current) {
      map.current.setView([26.4600, 80.3320], 12.5)
    }
  }

  return (
    <>
      <div ref={el} className="absolute inset-0 z-0" />

      {/* Top Left: Date Range Selector Filter (up to 2 months, default current date) */}
      <MapDateRangeFilter
        startDate={startDate}
        endDate={endDate}
        onRangeChange={onDateRangeChange}
        hazardCount={list.length}
        isDrilledDown={Boolean(focusedRoad || selected)}
        onResetCityView={resetToCity}
      />

      {/* Bottom Left: GPS Accuracy Information Tooltip */}
      <div
        className="absolute bottom-3 left-3 z-[400]"
        onMouseEnter={() => setShowGpsInfo(true)}
        onMouseLeave={() => setShowGpsInfo(false)}
      >
        <button
          type="button"
          onClick={() => setShowGpsInfo((prev) => !prev)}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e4e4e4] bg-white shadow-md transition hover:bg-[#fafafa] hover:shadow-lg focus:outline-none cursor-pointer"
          title="GPS Accuracy Information"
          aria-label="GPS Accuracy Information"
        >
          <svg
            className="h-4 w-4 text-[#2563eb]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </button>

        {/* Tooltip Card */}
        {showGpsInfo && (
          <div
            role="tooltip"
            className="absolute bottom-0 left-10 z-50 w-[280px] sm:w-[320px] rounded-xl border border-[#e4e4e4] bg-white p-3.5 shadow-xl transition-all animate-in fade-in zoom-in-95 pointer-events-none"
          >
            {/* Pointer arrow on left border aligned with icon center */}
            <div className="absolute -left-[6px] bottom-[10px] h-3 w-3 rotate-45 border-b border-l border-[#e4e4e4] bg-white" />
            <p className="relative z-10 text-xs font-normal leading-relaxed text-[#2d2d2d]">
              Locations are approximate and may be inaccurate due to GPS signal interference, obstructions, multipath errors, satellite positioning, or device limitations.
            </p>
          </div>
        )}
      </div>

      {/* Bottom Right Map Tile Type Switcher */}
      <div className="absolute bottom-3 right-3 z-[400] flex rounded-lg border border-[#e4e4e4] bg-white/95 p-0.5 text-xs shadow-sm backdrop-blur">
        {(Object.keys(TILES) as keyof typeof TILES[]).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
              type === t
                ? "bg-primary-300 text-white"
                : "text-[#3c3c3c] hover:text-[#1a1a1a]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
    </>
  )
}

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

  // Wards options for Kanpur based on selected Zone
  const wardOptions: DropdownOption[] = useMemo(() => {
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

  // Road options for Kanpur based on selected Zone
  const roadOptions: DropdownOption[] = useMemo(() => {
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
        const idx = list.findIndex((x) => x.id === p.id)
        if (idx >= 0) {
          const targetPage = Math.floor(idx / pageSize) + 1
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
  const kpis = [
    {
      l: t("Videos"),
      v: "13",
      tag: t("Live"),
      icon: I.video,
    },
    {
      l: t("Detections"),
      v: String(list.length),
      tag: selectedZone === "All" ? t("Total") : `Zone ${selectedZone}`,
      icon: I.eye,
    },
    {
      l: t("Detection Classes"),
      v: "2",
      tag: "Pothole, Garbage",
      icon: I.shapes,
    },
    {
      l: t("Periods (Days)"),
      v: "1",
      tag: t("Day"),
      icon: I.calendar,
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((c) => (
          <div
            key={c.l}
            className="rounded-xl border border-[#e4e4e4] bg-white px-3.5 py-3 shadow-2xs transition hover:border-primary-200"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-xs font-medium text-[#3c3c3c]">
                {c.l}
              </span>
              <span className="inline-flex shrink-0 items-center justify-center h-6 w-6 rounded-lg bg-primary-100 text-primary-500">
                <Icon d={c.icon} className="h-3.5 w-3.5" />
              </span>
            </div>
            <div className="mt-1">
              <div className="text-2xl font-medium tracking-tight text-primary-500 tabular-nums">
                {c.v}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Big white container enclosing Kanpur Filters, Map, and Table */}
      <div className="rounded-2xl border border-[#e4e4e4] bg-white p-4 sm:p-5 shadow-xs space-y-4">
        {/* Kanpur Location Filters: Zone (default Zone 1), Ward (Show ward name), Road name */}
        <div className="flex flex-col gap-3 rounded-xl border border-[#e4e4e4] bg-[#fafafa] p-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-wrap items-end gap-3 flex-1 min-w-0">
            {/* a. Zone (default Zone 1) */}
            <div className="w-full sm:w-[190px]">
              <span className="text-xs font-medium text-[#2d2d2d] mb-1.5 block">
                Zone (Kanpur)
              </span>
              <DropdownSelect
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
                placeholder="Select Zone"
              />
            </div>

            {/* b. Ward (Show ward name) */}
            <div className="w-full sm:w-[200px]">
              <span className="text-xs font-medium text-[#2d2d2d] mb-1.5 block">
                Ward Name
              </span>
              <DropdownSelect
                value={selectedWard}
                onChange={(w) => {
                  setSelectedWard(w)
                  setSelected(undefined)
                }}
                options={wardOptions}
                placeholder="All Wards"
              />
            </div>

            {/* c. Road Name */}
            <div className="w-full sm:w-[200px]">
              <span className="text-xs font-medium text-[#2d2d2d] mb-1.5 block">
                Road Name
              </span>
              <DropdownSelect
                value={selectedRoad}
                onChange={(r) => {
                  setSelectedRoad(r)
                  setSelected(undefined)
                  if (r !== "All") {
                    setFocusedRoad(r)
                  } else {
                    setFocusedRoad(undefined)
                  }
                }}
                options={roadOptions}
                placeholder="All Roads"
              />
            </div>
          </div>

          {/* Severity selector */}
          <div className="flex flex-col sm:items-end shrink-0">
            <span className="text-xs font-medium text-[#2d2d2d] mb-1.5 block">
              Severity
            </span>
            <div className="flex items-center gap-1 rounded-lg border border-[#e4e4e4] bg-white p-1">
              {(["All", "High", "Medium", "Low"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSev(s)}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                    sev === s
                      ? "bg-white text-primary-500 shadow-sm border border-[#e4e4e4]"
                      : "text-[#3c3c3c] hover:text-[#1a1a1a]"
                  }`}
                >
                  {s !== "All" && (
                    <span className="h-2 w-2 rounded-full" style={{ background: SEV[s] }} />
                  )}
                  {t(s)}
                  <span className="text-[11px] text-[#4b4b4b]">
                    ({s === "All" ? list.length : list.filter((p) => p.severity === s).length})
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Screen divided into 2 parts: 40% Left Map and 60% Right Table (or 100% in Table Only mode) */}
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          {/* 40% Left Screen: Real Map of Kanpur (shown in split view mode) */}
          {viewMode === "split" && (
            <div className="w-full lg:w-[40%] flex flex-col gap-3 lg:sticky lg:top-20">
              <div className="relative h-[460px] lg:h-[calc(100vh-290px)] lg:min-h-[420px] w-full overflow-hidden rounded-xl border border-[#e4e4e4] bg-white shadow-sm">
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

          {/* Right Screen: Pothole Detection Table (60% in split mode, 100% in table only mode) */}
          <div className={`w-full ${viewMode === "split" ? "lg:w-[60%]" : "lg:w-full"} flex flex-col gap-3 min-w-0 transition-all`}>
            <div className="overflow-hidden rounded-xl border border-[#e4e4e4] bg-white shadow-sm flex flex-col">
              <div className="flex items-center justify-between border-b border-[#e4e4e4] bg-[#fafafa] px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#1a1a1a]">
                    {t("Hazard Records")}
                  </span>
                  <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-500">
                    {list.length} {t("Records")}
                  </span>
                  {totalPages > 1 && (
                    <span className="text-xs text-[#6e6e6e] font-medium hidden sm:inline">
                      (Page {validPage} of {totalPages})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 rounded-lg border border-[#e4e4e4] bg-white p-0.5 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setViewMode("split")}
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                      viewMode === "split"
                        ? "bg-primary-100 text-primary-500 font-medium"
                        : "text-[#4b4b4b] hover:bg-[#fafafa] hover:text-[#1a1a1a]"
                    }`}
                  >
                    <Icon d={I.map} className="h-3.5 w-3.5" />
                    {t("Map & Table")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("table")}
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                      viewMode === "table"
                        ? "bg-primary-100 text-primary-500 font-medium"
                        : "text-[#4b4b4b] hover:bg-[#fafafa] hover:text-[#1a1a1a]"
                    }`}
                  >
                    <Icon d={I.list} className="h-3.5 w-3.5" />
                    {t("Table Only")}
                  </button>
                </div>
              </div>

            <div className="overflow-x-auto overflow-y-auto max-h-[460px] lg:h-[calc(100vh-395px)] lg:max-h-none lg:min-h-[320px]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 border-b border-[#e4e4e4] bg-[#fafafa] text-left text-xs font-medium text-[#3c3c3c]">
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
                      <th
                        key={col.key}
                        className={`whitespace-nowrap px-3.5 py-3 font-medium ${col.align}`}
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e4e4e4] text-[#2d2d2d]">
                  {paginatedList.map((p, rowIdx) => {
                    const isSel = selected?.id === p.id
                    const isRoadMatch = !isSel && (hoveredRoad === p.road || focusedRoad === p.road)
                    const badge = SEV_BADGE[p.severity]
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
                        className={`cursor-pointer transition ${
                          isSel
                            ? "bg-primary-50/90 ring-1 ring-inset ring-primary-300"
                            : isRoadMatch
                              ? "bg-primary-50/40 hover:bg-primary-50/60"
                              : "hover:bg-[#fafafa]"
                        }`}
                      >
                        {/* 1. Issue Type (simple text, hover/click popup) */}
                        <td className="whitespace-nowrap px-3.5 py-2.5">
                          <IssueTypeCell
                            p={p}
                            rowIndex={(validPage - 1) * pageSize + rowIdx}
                            onOpenPreview={() => setPreview(p)}
                          />
                        </td>

                        {/* 2. Date & Time */}
                        <td className="whitespace-nowrap px-3.5 py-2.5">
                          <div className="text-xs font-medium text-[#1a1a1a]">
                            {p.detected.split(",")[0]}
                          </div>
                          <div className="text-[11px] text-[#4b4b4b]">
                            {p.detected.split(",")[1]?.trim() || "09:30 AM"}
                          </div>
                        </td>

                        {/* 4. Severity */}
                        <td className="whitespace-nowrap px-3.5 py-2.5">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${badge.bg} ${badge.text} ${badge.border}`}
                          >
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ background: SEV[p.severity] }}
                            />
                            {p.severity}
                          </span>
                        </td>

                        {/* 5. Road & Ward */}
                        <td className="whitespace-nowrap px-3.5 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-medium text-[#1a1a1a]">
                              {p.road}
                            </span>
                            {focusedRoad === p.road && (
                              <span className="rounded bg-primary-100 px-1 py-0.2 text-[10px] font-medium text-primary-500">
                                Corridor
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#4b4b4b]">
                            {p.ward}
                          </div>
                        </td>

                        {/* 6. Zone */}
                        <td className="whitespace-nowrap px-3.5 py-2.5 text-xs">
                          Zone {p.zone}
                        </td>

                        {/* 7. Surface (dash centered) */}
                        <td className="whitespace-nowrap px-3.5 py-2.5 text-center">
                          <span className="text-xs font-medium text-[#4b4b4b] inline-block text-center" title="Surface data API in progress">
                            --
                          </span>
                        </td>

                        {/* 8. AI Confidence */}
                        <td className="whitespace-nowrap px-3.5 py-2.5 tabular-nums">
                          <span className="text-xs font-medium text-[#1a1a1a]">
                            {p.confidence}%
                          </span>
                        </td>

                        {/* 9. Actions */}
                        <td className="whitespace-nowrap px-3.5 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelected(p)
                                setFocusedRoad(p.road)
                              }}
                              title="Locate on Kanpur Map"
                              className="rounded-md border border-[#e4e4e4] p-1.5 text-[#3c3c3c] hover:border-primary-300 hover:bg-primary-50 hover:text-primary-500 transition"
                            >
                              <Icon d={I.pin} className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setPreview(p)
                              }}
                              title="View Evidence Image"
                              className="rounded-md border border-[#e4e4e4] p-1.5 text-[#3c3c3c] hover:border-primary-300 hover:bg-primary-50 hover:text-primary-500 transition"
                            >
                              <Icon d={I.external} className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {!paginatedList.length && (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-12 text-center text-sm text-[#4b4b4b]"
                      >
                        No hazards match your selected Zone, Ward, Road, or Severity filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Pagination Bar (50 rows per screen) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#e4e4e4] bg-[#fafafa] px-4 py-2.5 text-xs text-[#4b4b4b]">
              <div className="flex items-center gap-1.5 font-medium">
                {list.length > 0 ? (
                  <>
                    <span>Showing</span>
                    <span className="font-medium text-[#1a1a1a]">
                      {(validPage - 1) * pageSize + 1}
                    </span>
                    <span>–</span>
                    <span className="font-medium text-[#1a1a1a]">
                      {Math.min(validPage * pageSize, list.length)}
                    </span>
                    <span>of</span>
                    <span className="font-medium text-[#1a1a1a]">{list.length}</span>
                    <span>records</span>
                    <span className="text-[#a1a1a1] mx-1">·</span>
                    <span className="text-[#6e6e6e]">50 per screen</span>
                  </>
                ) : (
                  <span>0 records</span>
                )}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  {/* Previous Button */}
                  <button
                    type="button"
                    disabled={validPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className={`flex items-center gap-1 rounded-md border border-[#e4e4e4] px-2.5 py-1 text-xs font-medium transition ${
                      validPage <= 1
                        ? "cursor-not-allowed bg-white/60 text-[#a1a1a1] opacity-60"
                        : "bg-white text-[#2d2d2d] hover:bg-slate-50 hover:text-[#1a1a1a] cursor-pointer"
                    }`}
                  >
                    <Icon d={I.chevron} className="h-3.5 w-3.5 rotate-90" />
                    <span>Prev</span>
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {getPageNumbers(validPage, totalPages).map((pNum, idx) => {
                      if (pNum === "...") {
                        return (
                          <span key={`dots-${idx}`} className="px-1 text-xs text-[#a1a1a1]">
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
                          className={`h-6 min-w-[26px] rounded-md px-1.5 text-xs font-medium transition cursor-pointer ${
                            isActive
                              ? "bg-primary-500 text-white shadow-2xs"
                              : "border border-[#e4e4e4] bg-white text-[#3c3c3c] hover:bg-slate-50 hover:text-[#1a1a1a]"
                          }`}
                        >
                          {pNum}
                        </button>
                      )
                    })}
                  </div>

                  {/* Next Button */}
                  <button
                    type="button"
                    disabled={validPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className={`flex items-center gap-1 rounded-md border border-[#e4e4e4] px-2.5 py-1 text-xs font-medium transition ${
                      validPage >= totalPages
                        ? "cursor-not-allowed bg-white/60 text-[#a1a1a1] opacity-60"
                        : "bg-white text-[#2d2d2d] hover:bg-slate-50 hover:text-[#1a1a1a] cursor-pointer"
                    }`}
                  >
                    <span>Next</span>
                    <Icon d={I.chevron} className="h-3.5 w-3.5 -rotate-90" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>

      {preview && <Preview p={preview} onClose={() => setPreview(undefined)} />}
    </div>
  )
}

type Assignment = { zone: number; ward: string; officer: string }
const INITIAL_ASSIGN: Assignment[] = ZONES.flatMap((z) =>
  WARDS(z.id).map((w, i) => ({
    zone: z.id,
    ward: w,
    officer: i < 3 ? INITIAL_USERS[(z.id - 1) % INITIAL_USERS.length].id : "",
  })),
)

type DropdownOption = {
  value: string
  label: string
  sub?: string
  disabled?: boolean
}

function DropdownSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  className = "",
  variant = "default",
  openUp = false,
}: {
  value: string
  onChange: (val: string) => void
  options: DropdownOption[]
  placeholder?: string
  className?: string
  variant?: "default" | "warning"
  openUp?: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    if (open) {
      document.addEventListener("mousedown", handleOutside)
      document.addEventListener("keydown", handleKey)
    }
    return () => {
      document.removeEventListener("mousedown", handleOutside)
      document.removeEventListener("keydown", handleKey)
    }
  }, [open])

  const selectedOpt = options.find((o) => o.value === value)
  const isWarning = variant === "warning" || (!value && variant !== "default")

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex w-full items-center justify-between gap-3 rounded-lg border px-3.5 py-2 text-left text-sm transition-all focus:outline-none ${
          isWarning
            ? "border-[#f7e1b0] bg-[#fef9f1] text-[#8a5f00] hover:border-[#f3ce85]"
            : "border-[#c7c7c7] bg-white text-[#1a1a1a] hover:border-primary-300"
        } ${open ? "ring-2 ring-primary-100 border-primary-300 shadow-xs" : "shadow-2xs"}`}
      >
        <span className="truncate">
          {selectedOpt && selectedOpt.value ? (
            <span className="inline-flex items-center gap-1.5 truncate">
              <span className="font-medium text-[#1a1a1a]">{selectedOpt.label}</span>
              {selectedOpt.sub && (
                <span className="text-xs text-[#6e6e6e]">· {selectedOpt.sub}</span>
              )}
            </span>
          ) : (
            <span className={isWarning ? "text-[#8a5f00] font-medium" : "text-[#717171]"}>
              {placeholder}
            </span>
          )}
        </span>
        <span
          className={`shrink-0 text-[#6e6e6e] transition-transform duration-200 ${
            open ? "rotate-180 text-primary-500" : ""
          }`}
        >
          <Icon d={I.chevron} className="h-4 w-4" />
        </span>
      </button>

      {open && (
        <div
          className={`absolute left-0 ${
            openUp ? "bottom-full mb-1.5" : "top-full mt-1.5"
          } w-full min-w-[260px] rounded-xl border border-[#e4e4e4] bg-white p-1.5 shadow-xl z-50`}
        >
          <div className="space-y-0.5 overflow-y-auto max-h-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {options.map((opt) => {
              const isSelected = opt.value === value
              return (
                <button
                  key={opt.value || "__empty"}
                  type="button"
                  disabled={opt.disabled}
                  onClick={() => {
                    onChange(opt.value)
                    setOpen(false)
                  }}
                  className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
                    opt.disabled
                      ? "cursor-not-allowed opacity-40 text-[#8c8c8c]"
                      : isSelected
                        ? "bg-primary-50 text-primary-500 font-medium"
                        : "text-[#1a1a1a] hover:bg-[#f5f5f5]"
                  }`}
                >
                  <div className="min-w-0 flex-1 truncate">
                    <span className="font-medium">{opt.label}</span>
                    {opt.sub && (
                      <span className="text-xs text-[#6e6e6e]"> · {opt.sub}</span>
                    )}
                    {opt.disabled && (
                      <span className="ml-1.5 text-[11px] font-normal text-[#c62839]">
                        (inactive)
                      </span>
                    )}
                  </div>
                  {isSelected && (
                    <span className="shrink-0 text-primary-500">
                      <Icon d={I.check} className="h-4 w-4" />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: string | number
  sub: string
  accent?: string
}) {
  return (
    <div className="rounded-xl border border-[#e4e4e4] bg-white p-4">
      <div className="text-xs uppercase tracking-wider text-[#4b4b4b]">
        {label}
      </div>
      <div
        className="mt-1.5 text-2xl font-medium tabular-nums text-[#1a1a1a]"
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </div>
      <div className="mt-0.5 text-xs text-[#3c3c3c]">{sub}</div>
    </div>
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
  const [toast, setToast] = useState<{ message: string; show: boolean }>({
    message: "",
    show: false,
  })
  const timerRef = useRef<NodeJS.Timeout | number | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const t = useT()

  const hasChanges = useMemo(() => {
    return assign.some((a, i) => a.officer !== savedAssign[i]?.officer)
  }, [assign, savedAssign])

  const handleApply = () => {
    setSavedAssign(assign)
    setToast({
      message: t("Changes applied successfully!"),
      show: true,
    })
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }))
    }, 3000)
  }

  const name = (id: string) => users.find((u) => u.id === id)
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
    <div className="space-y-5">
      <div className="flex gap-1 rounded-xl border border-[#e4e4e4] bg-[#f5f5f5] p-1 w-fit">
        {([
          ["status", "Activate / Deactivate"],
          ["assign", "Zone & Ward Assignment"],
        ] as const).map(([k, l]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              tab === k
                ? "bg-[#262626] text-white shadow-xs"
                : "text-[#525252] hover:bg-[#e5e5e5] hover:text-[#171717]"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {tab === "status" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Stat
              label="Total Employees"
              value={users.length}
              sub="Across all municipal roles"
            />
            <Stat
              label="Active Staff"
              value={users.filter((u) => u.active).length}
              sub="Authorized access"
              accent={SEV.Low}
            />
            <Stat
              label="Deactivated"
              value={users.filter((u) => !u.active).length}
              sub="Access revoked"
              accent={SEV.High}
            />
          </div>

          {/* Big white container enclosing search and table */}
          <div className="rounded-2xl border border-[#e4e4e4] bg-white p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex flex-col gap-3 rounded-xl border border-[#e4e4e4] bg-[#fafafa] p-3 sm:flex-row sm:items-center justify-between">
              <SearchBox
                value={q}
                onChange={setQ}
                placeholder="Search employees by name, ID or role..."
                className="max-w-md w-full"
              />
              <div className="text-xs text-[#4b4b4b]">
                {shown.length} {shown.length === 1 ? "Employee" : "Employees"} found
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-[#e4e4e4] bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="border-b border-[#e4e4e4] bg-[#fafafa] text-left text-xs font-medium text-[#3c3c3c]">
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
              <tbody className="divide-y divide-[#e4e4e4] text-[#2d2d2d]">
                {shown.map((u) => (
                  <tr key={u.id} className={u.active ? "" : "bg-[#fafafa]/80"}>
                    <td className="px-4 py-3">
                      <div
                        className={`flex items-center gap-3 ${
                          u.active ? "" : "opacity-50"
                        }`}
                      >
                        <div className="grid h-9 w-9 place-items-center rounded-full bg-primary-100 text-xs font-medium text-primary-500">
                          {u.name
                            .split(" ")
                            .map((x) => x[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-medium text-[#1a1a1a]">
                            {u.name}
                          </div>
                          <div className="font-mono text-xs text-[#4b4b4b]">
                            {u.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{u.role}</td>
                    <td className="px-4 py-3 text-[#3c3c3c]">{u.phone}</td>
                    <td className="px-4 py-3 text-xs text-[#4b4b4b]">
                      {u.last}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                          u.active
                            ? "border-[#b5d8d1] bg-[#dbece9] text-[#0a4d40]"
                            : "border-[#edbcc2] bg-[#f6dfe1] text-[#771822]"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            u.active ? "bg-[#11806a]" : "bg-[#c62839]"
                          }`}
                        />
                        {u.active ? "Active" : "Deactivated"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditing(u)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#c7c7c7] px-3 py-1.5 text-xs font-medium text-[#2d2d2d] transition hover:bg-[#fafafa]"
                        >
                          <Icon d={I.edit} className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            setUsers(
                              users.map((x) =>
                                x.id === u.id ? { ...x, active: !x.active } : x,
                              ),
                            )
                          }
                          className={`w-24 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                            u.active
                              ? "border border-[#edbcc2] bg-[#f6dfe1] text-[#771822] hover:bg-[#fcf3f4]"
                              : "bg-primary-300 text-white hover:bg-primary-400"
                          }`}
                        >
                          {u.active ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        </>
      )}

      {tab === "assign" && (
        /* Big white container enclosing zone selector and table */
        <div className="rounded-2xl border border-[#e4e4e4] bg-white p-4 sm:p-5 shadow-xs">
          <div className="grid gap-5 lg:grid-cols-[260px_1fr] items-start">
            <div className="space-y-1.5">
              {ZONES.map((z) => {
                const rows = assign.filter((a) => a.zone === z.id)
                const done = rows.filter(
                  (a) => a.officer && name(a.officer)?.active,
                ).length
                return (
                  <button
                    key={z.id}
                    onClick={() => setZone(z.id)}
                    className={`block w-full rounded-xl border p-3 text-left transition ${
                      zone === z.id
                        ? "border-primary-300 bg-primary-50/70 shadow-sm"
                        : "border-[#e4e4e4] bg-[#fafafa] hover:border-[#c7c7c7] hover:bg-white"
                    }`}
                  >
                  <div className="text-sm font-medium text-[#1a1a1a]">
                    Zone {z.id}
                  </div>
                  <div className="text-xs text-[#3c3c3c]">
                    {z.name.split(" · ")[1]}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-[#4b4b4b]">
                    <div className="h-1 flex-1 rounded-full bg-[#e4e4e4] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary-300"
                        style={{ width: `${(done / rows.length) * 100}%` }}
                      />
                    </div>
                    {done}/{rows.length} wards
                  </div>
                </button>
              )
            })}
          </div>
          <div className="rounded-xl border border-[#e4e4e4] bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e4e4e4] px-5 py-4 rounded-t-xl bg-white">
              <div>
                <div className="font-medium text-[#1a1a1a]">
                  {ZONES[zone - 1].name}
                </div>
                <div className="text-xs text-[#3c3c3c]">
                  Assign a municipal officer to each ward in this zone
                </div>
              </div>
              <div className="flex items-center gap-2">
                {hasChanges && (
                  <button
                    type="button"
                    onClick={handleApply}
                    className="flex items-center gap-1.5 rounded-lg bg-primary-300 px-4 py-2 text-sm font-medium text-white shadow-xs transition hover:bg-primary-400 active:bg-primary-500 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <Icon d={I.check} className="h-4 w-4" />
                    {t("Apply Changes")}
                  </button>
                )}
              </div>
            </div>
            <table className="w-full text-sm">
              <thead className="border-b border-[#e4e4e4] bg-[#fafafa] text-left text-xs font-medium text-[#3c3c3c]">
                <tr>
                  {["Ward", "Open Potholes", "Assigned Officer", ""].map(
                    (h) => (
                      <th key={h} className="px-5 py-3 font-medium">
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e4e4e4] text-[#2d2d2d]">
                {zoneRows.map((a, rIdx) => {
                  const o = name(a.officer)
                  const inactive = o && !o.active
                  const isNearBottom = rIdx >= zoneRows.length - 2
                  return (
                    <tr key={a.ward}>
                      <td className="px-5 py-3 font-mono text-xs font-medium text-[#1a1a1a]">
                        {a.ward}
                      </td>
                      <td className="px-5 py-3 tabular-nums">
                        {POTHOLES.filter((p) => p.ward === a.ward).length ||
                          Math.round(
                            rand(a.ward.length + zone + +a.ward.slice(2)) * 9,
                          )}
                      </td>
                      <td className="px-5 py-3">
                        <DropdownSelect
                          value={a.officer}
                          onChange={(val) => setOfficer(a.ward, val)}
                          placeholder="Unassigned"
                          variant={!a.officer || inactive ? "warning" : "default"}
                          className="w-64"
                          openUp={isNearBottom}
                          options={[
                            { value: "", label: "Unassigned" },
                            ...users
                              .filter((u) => u.role !== "Viewer")
                              .map((u) => ({
                                value: u.id,
                                label: u.name,
                                sub: u.role,
                                disabled: !u.active,
                              })),
                          ]}
                        />
                        {inactive && (
                          <div className="mt-1 text-[11px] text-[#8a5f00]">
                            Officer is deactivated; reassign this ward
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {a.officer && (
                          <button
                            onClick={() => setOfficer(a.ward, "")}
                            className="text-xs text-[#4b4b4b] hover:text-[#c62839]"
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      )}

      {editing && (
        <EditUser
          user={editing}
          onClose={() => setEditing(undefined)}
          onSave={(u) => {
            setUsers(users.map((x) => (x.id === u.id ? u : x)))
            setEditing(undefined)
          }}
        />
      )}

      {/* Toast notification at top center */}
      {toast.show && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 rounded-xl border border-[#e4e4e4] bg-white px-4 py-3 text-sm text-[#1a1a1a] shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-top-3">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-[#dbece9] text-[#0a4d40]">
            <Icon d={I.check} className="h-4 w-4" />
          </span>
          <span className="font-medium">{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast((prev) => ({ ...prev, show: false }))}
            className="ml-2 text-[#8c8c8c] hover:text-[#1a1a1a] transition"
          >
            <Icon d={I.x} className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [user, setUser] = useState("admin.knn")
  const [pass, setPass] = useState("Kanpur@2025")
  const [show, setShow] = useState(false)
  const [err, setErr] = useState("")

  const field =
    "mt-2 w-full rounded-lg border border-[#c7c7c7] bg-white px-3.5 py-3 text-sm text-[#1a1a1a] placeholder-[#4b4b4b] outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100"

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user.trim() || !pass) {
      return setErr("Please enter both username and password")
    }
    setErr("")
    onLogin()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fafafa] px-4 py-12 text-[#1a1a1a]">
      <div className="w-full max-w-md rounded-2xl border border-[#e4e4e4] bg-white p-8 sm:p-10 shadow-sm">
        {/* Header with Nagar Dristi Logo */}
        <div className="flex items-center gap-3">
          <NagarDristiLogo size={44} />
          <div>
            <div className="text-xl font-medium tracking-tight text-[#1a1a1a]">
              Nagar Dristi
            </div>
            <div className="text-xs text-[#3c3c3c]">
              Kanpur Nagar Nigam · नगर निगम कानपुर
            </div>
          </div>
        </div>

        <h1 className="mt-8 text-2xl font-medium text-[#1a1a1a]">Sign in</h1>
        <p className="mt-1.5 text-sm text-[#3c3c3c]">
          Enter your official credentials to access the administrative portal
        </p>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-[#2d2d2d]">
              User name / Official ID
            </span>
            <input
              autoFocus
              value={user}
              onChange={(e) => setUser(e.target.value)}
              autoComplete="username"
              placeholder="e.g. admin.knn"
              className={field}
            />
          </label>

          <label className="block">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#2d2d2d]">
                Password
              </span>
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="text-xs font-medium text-primary-300 hover:text-primary-400"
              >
                {show ? "Hide password" : "Show password"}
              </button>
            </div>
            <input
              type={show ? "text" : "password"}
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              autoComplete="current-password"
              placeholder="Enter password"
              className={field}
            />
          </label>

          {err && (
            <div className="rounded-lg border border-[#edbcc2] bg-[#f6dfe1] p-3 text-xs font-medium text-[#771822]">
              {err}
            </div>
          )}

          <button
            type="submit"
            className="mt-6 w-full rounded-lg bg-primary-300 py-3 text-sm font-medium text-white transition hover:bg-primary-400 active:bg-primary-500 shadow-sm"
          >
            Sign In
          </button>
        </form>

        <div className="mt-8 border-t border-[#e4e4e4] pt-6 text-center text-xs text-[#4b4b4b]">
          Nagar Dristi · Kanpur Nagar Nigam
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [authed, setAuthed] = useState(false)
  const [page, setPage] = useState<"detect" | "users">("detect")
  const [lang, setLang] = useState<Lang>(
    () => (localStorage.getItem("nd-lang") as Lang) || "en",
  )
  const [dark, setDark] = useState(() => localStorage.getItem("nd-theme") === "dark")
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
    localStorage.setItem("nd-theme", dark ? "dark" : "light")
  }, [dark])
  useEffect(() => {
    localStorage.setItem("nd-lang", lang)
    document.documentElement.lang = lang
  }, [lang])
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return
      const target = (e.target as HTMLElement).closest<HTMLElement>(
        "button, [role='button']",
      )
      if (
        !target ||
        target.hasAttribute("disabled") ||
        target.getAttribute("aria-disabled") === "true"
      ) {
        return
      }

      const rect = target.getBoundingClientRect()
      const radius = Math.hypot(
        Math.max(e.clientX - rect.left, rect.right - e.clientX),
        Math.max(e.clientY - rect.top, rect.bottom - e.clientY),
      )

      const ripple = document.createElement("span")
      ripple.className = "material-ripple"
      ripple.style.width = `${radius * 2}px`
      ripple.style.height = `${radius * 2}px`
      ripple.style.left = `${e.clientX - rect.left - radius}px`
      ripple.style.top = `${e.clientY - rect.top - radius}px`

      target.appendChild(ripple)

      const removeRipple = () => {
        ripple.classList.add("material-ripple-fade-out")
        setTimeout(() => {
          ripple.remove()
        }, 350)
      }

      target.addEventListener("pointerup", removeRipple, { once: true })
      target.addEventListener("pointerleave", removeRipple, { once: true })
      target.addEventListener("pointercancel", removeRipple, { once: true })
      setTimeout(removeRipple, 600)
    }

    document.addEventListener("pointerdown", handlePointerDown, { passive: true })
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
    }
  }, [])
  const t = (s: string) => (lang === "hi" ? (HI[s] ?? s) : s)
  const seg = (on: boolean) =>
    `flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition ${
      on
        ? "bg-white text-primary-500 shadow-sm border border-[#e4e4e4]"
        : "text-[#3c3c3c] hover:text-primary-500"
    }`

  const nav = [
    {
      k: "detect",
      l: "Live Detection",
      d: "Real-time pothole map and records",
      i: I.map,
    },
    {
      k: "users",
      l: "User Management",
      d: "Employees, status and ward/zone assignment",
      i: I.users,
    },
  ] as const

  const cur = nav.find((x) => x.k === page)!

  if (!authed) return <LoginPage onLogin={() => setAuthed(true)} />

  return (
    <LangCtx.Provider value={lang}>
    <div className="flex min-h-screen bg-[#fafafa] font-sans text-[#1a1a1a]">
      {/* Sidebar styled per PGR Design System: White BG, #e4e4e4 border */}
      <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-[#e4e4e4] bg-white">
        <div className="flex items-center gap-3 border-b border-[#e4e4e4] px-5 py-4">
          <NagarDristiLogo size={36} />
          <div>
            <div className="text-base font-medium text-primary-500 leading-tight">
              Nagar Dristi
            </div>
            <div className="text-xs text-[#3c3c3c]">{t("Kanpur Nagar Nigam")}</div>
          </div>
        </div>

        <nav className="mt-3 space-y-1 px-3">
          {nav.map((x) => (
            <button
              key={x.k}
              onClick={() => setPage(x.k)}
              className={`flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition ${
                page === x.k
                  ? "bg-primary-300 text-white shadow-sm"
                  : "text-primary-500 hover:bg-primary-100 hover:text-primary-500"
              }`}
            >
              <Icon d={x.i} />
              {t(x.l)}
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-3 border-t border-[#e4e4e4] px-4 py-4">
          <div>
            <div className="mb-1.5 text-[11px] font-medium text-[#4b4b4b]">
              {t("Language")}
            </div>
            <div className="flex gap-1 rounded-lg border border-[#e4e4e4] bg-[#fafafa] p-1">
              <button onClick={() => setLang("en")} className={seg(lang === "en")}>
                English
              </button>
              <button onClick={() => setLang("hi")} className={seg(lang === "hi")}>
                हिन्दी
              </button>
            </div>
          </div>
          <div>
            <div className="mb-1.5 text-[11px] font-medium text-[#4b4b4b]">
              {t("Theme")}
            </div>
            <div className="flex gap-1 rounded-lg border border-[#e4e4e4] bg-[#fafafa] p-1">
              <button onClick={() => setDark(false)} className={seg(!dark)}>
                <Icon d={I.sun} className="h-3.5 w-3.5" />
                {t("Light")}
              </button>
              <button onClick={() => setDark(true)} className={seg(dark)}>
                <Icon d={I.moon} className="h-3.5 w-3.5" />
                {t("Dark")}
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-[#e4e4e4] p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-primary-100 text-xs font-medium text-primary-500">
              SA
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-[#1a1a1a]">
                {t("Rajesh Kumar")}
              </div>
              <div className="truncate text-[11px] text-[#4b4b4b]">
                {t("System Administrator")}
              </div>
            </div>
            <button
              onClick={() => setAuthed(false)}
              className="rounded-md border border-[#e4e4e4] px-2 py-1 text-xs font-medium text-[#4b4b4b] transition hover:bg-[#fafafa] hover:text-[#1a1a1a]"
            >
              {t("Log out")}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="min-w-0 flex-1">
        <header className="flex items-center justify-between border-b border-[#e4e4e4] bg-white px-8 py-4 sticky top-0 z-20 shadow-xs">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-medium text-[#1a1a1a]">{t(cur.l)}</h1>
              {page !== "detect" && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-100 px-2.5 py-0.5 text-[11px] font-medium text-primary-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary-300" />
                  Nagar Dristi
                </span>
              )}
            </div>
            <p className="text-xs text-[#3c3c3c]">
              {t(cur.d)} · {t("Kanpur Nagar Nigam")}
            </p>
          </div>
        </header>

        <div className="p-5 sm:p-6">
          {page === "detect" ? <DetectionPage /> : <UsersPage />}
        </div>
      </main>
    </div>
    </LangCtx.Provider>
  )
}
