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
type Pothole = {
  id: string
  zone: number
  ward: string
  road: string
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
]
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
function inZone(z: number, i: number) {
  const c = ZONES[z - 1]
  // Tight cluster around zone's street roads in Kanpur (radius ~300m - 900m)
  const latOffset = (rand(i + 47) - 0.5) * 0.016
  const lngOffset = (rand(i + 13) - 0.5) * 0.022
  return {
    x: c.cx + (rand(i) - 0.5) * 120,
    y: c.cy + (rand(i + 99) - 0.5) * 90,
    lat: +(c.lat + latOffset).toFixed(5),
    lng: +(c.lng + lngOffset).toFixed(5),
  }
}

const POTHOLES: Pothole[] = Array.from({ length: 64 }, (_, i) => {
  const zone = (i % 6) + 1
  const p = inZone(zone, i)
  const r = rand(i + 7)
  const severity: Severity = r > 0.7 ? "High" : r > 0.35 ? "Medium" : "Low"
  return {
    id: `PH-KNP-${String(2400 + i * 7).padStart(5, "0")}`,
    zone,
    ward: `W-${String(zone * 18 - Math.floor(rand(i + 3) * 17)).padStart(2, "0")}`,
    road: ROADS[Math.floor(rand(i + 11) * ROADS.length)],
    x: p.x,
    y: p.y,
    lat: p.lat,
    lng: p.lng,
    severity,
    confidence: Math.round(72 + rand(i + 5) * 27),
    size: +(0.2 + rand(i + 2) * 2.4).toFixed(2),
    depth: Math.round(3 + rand(i + 4) * 14),
    engineer: ENGINEERS[zone - 1],
    vehicle: `UP78-${4100 + (i % 9)}`,
    detected: `${String(1 + (i % 27)).padStart(2, "0")} Sep 2026, ${String(8 + (i % 10)).padStart(2, "0")}:${String((i * 13) % 60).padStart(2, "0")}`,
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
    wards: ["W-03", "W-07"],
    active: true,
    last: "2h ago",
  },
  {
    id: "U-102",
    name: "Ritu Mishra",
    role: "Engineer",
    phone: "+91 94150 22481",
    zones: [2],
    wards: ["W-21", "W-25"],
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
    wards: ["W-60"],
    active: false,
    last: "12d ago",
  },
  {
    id: "U-105",
    name: "Naresh Gupta",
    role: "Field Staff",
    phone: "+91 90050 87712",
    zones: [5],
    wards: ["W-77", "W-81"],
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

const IMGS = [
  "1784548789954-655c9a9e1a64",
  "1694804304298-c79443f5e2f4",
  "1709934730506-fba12664d4e4",
  "1657811146442-0d66d65dbe92",
  "1623500673097-c277c8622cf2",
  "1658223684971-f262da87168f",
]
const img = (i: number, w = 400) =>
  `https://images.unsplash.com/photo-${IMGS[i % IMGS.length]}?auto=format&fit=crop&w=${w}&h=${Math.round(w * 0.75)}&q=70`
const idx = (p: Pothole) => {
  const i = POTHOLES.findIndex((x) => x.id === p.id)
  return i >= 0 ? i : 0
}
const WARDS = (z: number) =>
  Array.from(
    { length: 6 },
    (_, i) => `W-${String(z * 18 - i * 3).padStart(2, "0")}`,
  )

function Preview({ p, onClose }: { p: Pothole; onClose: () => void }) {
  const b = SEV_BADGE[p.severity]
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[#1a1a1a]/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[#e4e4e4] bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <img
            src={img(idx(p), 1000)}
            alt={`Evidence photo for pothole ${p.id}`}
            className="aspect-[16/9] w-full object-cover"
          />
          <div className="absolute left-3 top-3 flex items-center gap-2 rounded-lg bg-[#1a1a1a]/80 px-2.5 py-1 text-xs text-white backdrop-blur">
            <span className="font-mono">{p.id}</span>
            <span>·</span>
            <span>AI {p.confidence}%</span>
            <span>·</span>
            <span>{p.vehicle}</span>
          </div>
          <button
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full bg-[#1a1a1a]/80 p-1.5 text-white transition hover:bg-[#1a1a1a]"
          >
            <Icon d={I.x} className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between border-b border-[#e4e4e4] pb-4">
            <div>
              <div className="text-lg font-medium text-[#1a1a1a]">{p.road}</div>
              <div className="text-xs text-[#3c3c3c]">
                Zone {p.zone} · {p.ward} · Detected {p.detected}
              </div>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${b.bg} ${b.text} ${b.border}`}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: SEV[p.severity] }}
              />
              {p.severity} Severity
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4 text-sm">
            <div className="rounded-lg bg-[#fafafa] p-3 border border-[#e4e4e4]">
              <div className="text-xs text-[#4b4b4b]">Estimated Area</div>
              <div className="mt-1 text-base font-medium text-[#1a1a1a]">
                {p.size} m²
              </div>
            </div>
            <div className="rounded-lg bg-[#fafafa] p-3 border border-[#e4e4e4]">
              <div className="text-xs text-[#4b4b4b]">Pothole Depth</div>
              <div className="mt-1 text-base font-medium text-[#1a1a1a]">
                {p.depth} cm
              </div>
            </div>
            <div className="rounded-lg bg-[#fafafa] p-3 border border-[#e4e4e4]">
              <div className="text-xs text-[#4b4b4b]">AI Confidence</div>
              <div className="mt-1 text-base font-medium text-primary-500">
                {p.confidence}%
              </div>
            </div>
            <div className="rounded-lg bg-[#fafafa] p-3 border border-[#e4e4e4]">
              <div className="text-xs text-[#4b4b4b]">Status</div>
              <div className="mt-1 text-base font-medium text-[#1a1a1a]">
                {p.status}
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-[#3c3c3c]">
            <div>
              <span className="text-[#4b4b4b]">GPS Coordinates: </span>
              <span className="font-mono text-[#1a1a1a]">
                {p.lat.toFixed(5)}° N, {p.lng.toFixed(5)}° E
              </span>
            </div>
            <div>
              <span className="text-[#4b4b4b]">Assigned Engineer: </span>
              <span className="font-medium text-[#1a1a1a]">{p.engineer}</span>
            </div>
            <div>
              <span className="text-[#4b4b4b]">Survey Vehicle: </span>
              <span className="font-mono text-[#1a1a1a]">{p.vehicle}</span>
            </div>
            <div>
              <span className="text-[#4b4b4b]">Telemetry Passes: </span>
              <span className="font-medium text-[#1a1a1a]">
                {p.passes} verification passes
              </span>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-[#e4e4e4] pt-4">
            <button
              onClick={onClose}
              className="rounded-lg border border-[#c7c7c7] px-4 py-2 text-sm font-medium text-[#2d2d2d] transition hover:bg-[#fafafa]"
            >
              Close
            </button>
            <button
              onClick={onClose}
              className="rounded-lg bg-primary-300 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-400 active:bg-primary-500"
            >
              Dispatch Work Order
            </button>
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

function GoogleMap({
  list,
  selected,
  onSelect,
  filterKey,
}: {
  list: Pothole[]
  selected?: Pothole
  onSelect: (p: Pothole) => void
  filterKey?: string
}) {
  const el = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map>(null)
  const tile = useRef<L.TileLayer>(null)
  const layer = useRef<L.LayerGroup>(null)
  const [type, setType] = useState<keyof typeof TILES>("Street")

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
    layer.current = L.layerGroup().addTo(m)

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

  useEffect(() => {
    if (!layer.current) return
    const g = layer.current
    g.clearLayers()
    list.forEach((p) => {
      const s = selected?.id === p.id
      const delay = ((idx(p) % 8) * 0.35).toFixed(2)
      const sevClass = `sev-${p.severity.toLowerCase()}`
      const icon = L.divIcon({
        className: "pothole-bubble-icon",
        iconSize: [0, 0],
        iconAnchor: [0, 0],
        html: `<div class="pothole-bubble-wrapper ${
          s ? "is-selected" : ""
        } ${sevClass}" style="--c:${SEV[p.severity]};--d:${delay}s"><div class="bubble-halo"></div><div class="bubble-ripple ripple-1"></div><div class="bubble-ripple ripple-2"></div><div class="bubble-ripple ripple-3"></div><div class="bubble-dot"></div><div class="bubble-hitarea"></div></div>`,
      })
      L.marker([p.lat, p.lng], {
        icon,
        zIndexOffset: s ? 1000 : p.severity === "High" ? 100 : 0,
      })
        .bindTooltip(
          `<div style="font-family:inherit;font-size:12px;padding:2px 4px;color:#1a1a1a;">
            <span style="font-weight:500;color:#2563eb;">${p.id}</span>
            <span style="margin:0 4px;color:#c7c7c7;">|</span>
            <span style="color:${SEV[p.severity]};font-weight:500;">${p.severity}</span><br/>
            <span style="color:#4b4b4b;">${p.road}, ${p.ward}</span><br/>
            <span style="color:#2d2d2d;font-size:11px;">Depth: ${p.depth} cm · Area: ${p.size} m²</span>
          </div>`,
          { direction: "top", offset: [0, -18] },
        )
        .on("click", () => onSelect(p))
        .addTo(g)
    })
  }, [list, selected, onSelect])

  const lastKey = useRef(filterKey)
  const hasInitialFit = useRef(false)

  useEffect(() => {
    if (!map.current || !list.length) return
    if (!hasInitialFit.current || filterKey !== lastKey.current) {
      hasInitialFit.current = true
      lastKey.current = filterKey
      if (!selected) {
        map.current.fitBounds(L.latLngBounds(list.map((p) => [p.lat, p.lng])), {
          padding: [32, 32],
          maxZoom: 13,
        })
      }
    }
  }, [list, filterKey, selected])

  useEffect(() => {
    if (selected && map.current) {
      map.current.flyTo([selected.lat, selected.lng], 16, { duration: 0.6 })
    }
  }, [selected])

  return (
    <>
      <div ref={el} className="absolute inset-0 z-0" />
      <div className="absolute top-3 left-3 z-[400] flex items-center gap-2 rounded-lg border border-[#e4e4e4] bg-white/95 px-3 py-1.5 text-xs font-medium text-[#1a1a1a] shadow-sm backdrop-blur">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#c62839] opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#c62839]" />
        </span>
        Kanpur GIS Live Feed · {list.length} hazards
      </div>

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

function DetectionPage() {
  const [q, setQ] = useState("")
  const [sev, setSev] = useState<Severity | "All">("All")
  const [selected, setSelected] = useState<Pothole>()
  const [preview, setPreview] = useState<Pothole>()
  const [viewMode, setViewMode] = useState<"split" | "table">("split")

  const base = useMemo(
    () =>
      POTHOLES.filter(
        (p) =>
          !q ||
            `${p.id} ${p.road} ${p.ward} ${p.engineer} ${p.vehicle}`
              .toLowerCase()
              .includes(q.toLowerCase()),
      ),
    [q],
  )
  const list = useMemo(
    () => (sev === "All" ? base : base.filter((p) => p.severity === sev)),
    [base, sev],
  )

  const selectPin = useMemo(
    () => (p: Pothole) => {
      setSelected(p)
      document
        .getElementById(p.id)
        ?.scrollIntoView({ block: "center", behavior: "smooth" })
    },
    [],
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
      v: "0",
      tag: t("Total"),
      icon: I.eye,
    },
    {
      l: t("Detection Classes"),
      v: "1",
      tag: t("Pothole"),
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

      {/* Big white container enclosing Search, Map, and Table */}
      <div className="rounded-2xl border border-[#e4e4e4] bg-white p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col gap-3 rounded-xl border border-[#e4e4e4] bg-[#fafafa] p-3 sm:flex-row sm:items-center">
          <SearchBox
            value={q}
            onChange={setQ}
            placeholder={t("Search by pothole ID, road, ward, engineer or vehicle...")}
            className="flex-1"
          />
          <div className="flex items-center gap-1 rounded-lg border border-[#e4e4e4] bg-white p-1">
            {(["All", "High", "Medium", "Low"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSev(s)}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
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
                  ({s === "All" ? base.length : base.filter((p) => p.severity === s).length})
                </span>
              </button>
            ))}
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
                  filterKey={`${sev}_${q}`}
                />
              </div>

              {/* Quick Selection Banner below map */}
              {selected && (
                <div className="flex items-center justify-between rounded-xl border border-primary-200 bg-primary-50/80 p-3.5 shadow-sm text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: SEV[selected.severity] }}
                    />
                    <div className="min-w-0">
                      <div className="font-medium text-[#1a1a1a] truncate">
                        {selected.id} · {selected.road}
                      </div>
                      <div className="text-[11px] text-[#3c3c3c]">
                        Zone {selected.zone} · {selected.ward} · {selected.size} m²
                        ({selected.depth} cm depth)
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setPreview(selected)}
                      className="rounded-lg bg-primary-300 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-primary-400"
                    >
                      Evidence
                    </button>
                    <button
                      onClick={() => setSelected(undefined)}
                      className="rounded-lg border border-[#c7c7c7] px-2 py-1 text-xs font-medium text-[#3c3c3c] hover:bg-white"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
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

            <div className="overflow-x-auto overflow-y-auto max-h-[460px] lg:h-[calc(100vh-339px)] lg:max-h-none lg:min-h-[371px]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 border-b border-[#e4e4e4] bg-[#fafafa] text-left text-xs font-medium text-[#3c3c3c]">
                  <tr>
                    {[
                      "Photo",
                      "Pothole ID",
                      "Severity",
                      "Road & Ward",
                      "Zone",
                      "Surface",
                      "AI Conf.",
                      "Status",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="whitespace-nowrap px-3.5 py-3 font-medium"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e4e4e4] text-[#2d2d2d]">
                  {list.map((p) => {
                    const isSel = selected?.id === p.id
                    const badge = SEV_BADGE[p.severity]
                    return (
                      <tr
                        id={p.id}
                        key={p.id}
                        onClick={() => setSelected(p)}
                        className={`cursor-pointer transition ${
                          isSel
                            ? "bg-primary-50/90 ring-1 ring-inset ring-primary-300"
                            : "hover:bg-[#fafafa]"
                        }`}
                      >
                        {/* Photo Thumbnail */}
                        <td className="px-3 py-2.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setPreview(p)
                            }}
                            className="block overflow-hidden rounded-md border border-[#e4e4e4] transition hover:border-primary-300 hover:shadow"
                          >
                            <img
                              src={img(idx(p), 140)}
                              alt={`Pothole ${p.id}`}
                              loading="lazy"
                              className="h-10 w-14 object-cover"
                            />
                          </button>
                        </td>

                        {/* ID */}
                        <td className="whitespace-nowrap px-3.5 py-2.5">
                          <div className="font-mono text-xs font-medium text-[#1a1a1a]">
                            {p.id}
                          </div>
                          <div className="text-[11px] text-[#4b4b4b]">
                            {p.detected.split(",")[0]}
                          </div>
                        </td>

                        {/* Severity */}
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

                        {/* Road & Ward */}
                        <td className="whitespace-nowrap px-3.5 py-2.5">
                          <div className="text-xs font-medium text-[#1a1a1a]">
                            {p.road}
                          </div>
                          <div className="text-[11px] text-[#4b4b4b]">
                            {p.ward}
                          </div>
                        </td>

                        {/* Zone */}
                        <td className="whitespace-nowrap px-3.5 py-2.5 text-xs">
                          Zone {p.zone}
                        </td>

                        {/* Surface / Dimensions */}
                        <td className="whitespace-nowrap px-3.5 py-2.5 tabular-nums">
                          <div className="text-xs font-medium text-[#1a1a1a]">
                            {p.size} m²
                          </div>
                          <div className="text-[11px] text-[#4b4b4b]">
                            {p.depth} cm depth
                          </div>
                        </td>

                        {/* AI Confidence */}
                        <td className="whitespace-nowrap px-3.5 py-2.5 tabular-nums">
                          <span className="text-xs font-medium text-[#1a1a1a]">
                            {p.confidence}%
                          </span>
                        </td>

                        {/* Status */}
                        <td className="whitespace-nowrap px-3.5 py-2.5">
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                              p.status === "New"
                                ? "border-primary-200 bg-primary-100 text-primary-500"
                                : p.status === "Verified"
                                  ? "border-[#b5d8d1] bg-[#dbece9] text-[#0a4d40]"
                                  : "border-[#e4e4e4] bg-[#fafafa] text-[#4b4b4b]"
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="whitespace-nowrap px-3.5 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelected(p)
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
                  {!list.length && (
                    <tr>
                      <td
                        colSpan={9}
                        className="py-12 text-center text-sm text-[#4b4b4b]"
                      >
                        No potholes match your selected filters. Try clearing
                        filters or search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
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
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="relative rounded-lg border border-[#e4e4e4] bg-white p-2 text-[#2d2d2d] transition hover:bg-[#fafafa]"
            >
              <Icon d={I.bell} />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary-300" />
            </button>
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
