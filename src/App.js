import React, { useState, useEffect } from "react";

// ================= CHECKLIST DATA (from Monthly Deep Clean CheckList) =================
const CHECKLIST = [
{
section: "Whole House",
items: [
"Dust ceiling fans", "Dust light fixtures", "Clean air vents and returns",
"Wipe door frames, edges, and handles", "Clean baseboards and molding",
"Wipe walls and remove scuffs", "Clean window sills and tracks", "Vacuum",
"Spot clean switches and outlets", "Clean mirrors and glass surfaces",
"Clean carpet if applicable", "Clean and sanitize trash cans",
"Organize/restock janitor closet", "Check and clean dryer vent",
],
},
{
section: "Kitchen",
items: [
"Clean inside microwave", "Clean oven interior", "Wipe inside refrigerator",
"Clean exterior of all appliances", "Scrub backsplash",
"Wipe cabinet fronts, handles, and edges", "Disinfect sink, faucet, and drain",
"Sweep and mop",
],
},
{
section: "Bathroom",
items: [
"Deep clean shower/tub", "Remove soap scum and hard water stains",
"Scrub toilet base, hinges, and behind toilet", "Wipe cabinet fronts and handles",
"Clean mirrors and light fixtures", "Disinfect faucets and handles",
"Clean exhaust fan and covers", "Wipe baseboards and walls", "Sweep and mop",
],
},
{
section: "Bedrooms",
items: [
"Dust lamps, picture frames, and decor", "Vacuum or sweep",
"Wipe shelves and surfaces", "Clean mirrors and windows", "Wipe baseboards",
"Mop if applicable", "Clean carpet if applicable",
],
},
{
section: "Living Areas",
items: [
"Dust TV screens", "Dust electronics, shelves, and decor",
"Wipe tables and surfaces", "Vacuum or sweep", "Wipe baseboards",
"Mop if applicable", "Clean carpet if applicable", "Clean the dryer lint trap",
],
},
{
section: "Entryways & Hallways",
items: [
"Clean front door", "Wipe door handles", "Clean entry mats and rugs",
"Wipe walls, switches, and baseboards", "Clean mirrors and glass surfaces",
],
},
];

const QUALITY_CHECK = [
"No visible dust, dirt, or debris on surfaces", "Floors clean",
"Baseboards, edges, and corners wiped", "Glass, mirrors, and stainless steel streak free",
"Surfaces feel smooth, not sticky or gritty", "Handles, switches, and high-touch areas sanitized",
"Behind and under furniture cleaned", "Vents, fans, and fixtures dust free",
"Trash removed and liners replaced", "Toilets, tubs, and sinks disinfected",
"Appliances cleaned", "Sinks and drains sanitized",
"Rooms smell fresh and odor free", "Spaces look cleaned and decluttered",
];

const CLEAN_TYPES = [
"Daily Clean", "Weekly Clean", "Monthly Deep Clean",
"Full House", "Vacancy", "Specific Room or Area", "Emergency Pull", "Other",
];

const ROOMS = Array.from({ length: 20 }, (_, i) => String(i + 1));
const BEDS = ["A", "B", "C", "D"];
const DEFAULT_LOCATION_GROUPS = [
{
group: "Assisted Living",
items: [
"3021 Garrison Boulevard, Baltimore, MD 21216",
"1638 Ruxton Avenue, Baltimore, MD 21216",
"1620 Druid Hill Avenue, Baltimore, MD 21217",
"809 North Rose Street, Baltimore, MD 21205",
],
},
{
group: "Supportive Housing",
items: [
"1649 Darley Avenue, Baltimore, MD 21213",
"819 North Fremont Avenue, Baltimore, MD 21217",
"248 North Fulton Avenue, Baltimore, MD 21223",
"1006 East North Avenue, Baltimore, MD 21202",
"3415 Holmes Avenue, Baltimore, MD 21217",
],
},
{
group: "Residential Treatment",
items: [
"1114 East 20th Street, Baltimore, MD 21218",
"1116 East 20th Street, Baltimore, MD 21218",
"1723 Gwynns Falls Parkway, Baltimore, MD 21217",
"2140 Druid Hill Avenue, Baltimore, MD 21217",
],
},
{
group: "Offices",
items: [
"1119 E Monument Street, Baltimore, MD 21202",
"3310 Eastern Avenue, Baltimore, MD 21224",
"301 S Conkling Street, Baltimore, MD 21224",
"303 S Conkling Street, Baltimore, MD 21224",
"116 W Main Street, Suite 401, Salisbury, MD 21801",
"112 S Mount Street, Baltimore, MD 21223",
],
},
{
group: "Storage",
items: [
"3500 Pulaski Hwy, Baltimore, MD 21224",
"1711 Ensor Street, Baltimore, MD 21202",
"1425 Ensor Street, Baltimore, MD 21202",
],
},
];
const flattenGroups = (groups) => groups.flatMap((g) => g.items);

const ENTRIES_KEY = "hk-entries-v2";
const USERS_KEY = "hk-users-v1";
const SESSION_KEY = "hk-session-v1";
const ADMIN_PIN = "172106";

// Hash PINs so raw credentials are never stored
const hashPin = async (pin) => {
const data = new TextEncoder().encode(`hk-salt-${pin}`);
const buf = await crypto.subtle.digest("SHA-256", data);
return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
};
const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const SETTINGS_KEY = "hk-settings-v3";
const OLD_SETTINGS_KEY = "hk-settings-v2";

// ================= HELPERS =================
const todayStr = () => {
const d = new Date();
return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const nowTime = () => {
const d = new Date();
return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};
const fmtTime = (t) => {
if (!t) return "—";
const [h, m] = t.split(":").map(Number);
const ampm = h >= 12 ? "PM" : "AM";
const hr = h % 12 === 0 ? 12 : h % 12;
return `${hr}:${String(m).padStart(2, "0")} ${ampm}`;
};
const fmtDate = (ds) => {
const [y, m, d] = ds.split("-").map(Number);
return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
};
const duration = (tin, tout) => {
if (!tin || !tout) return null;
const [h1, m1] = tin.split(":").map(Number);
const [h2, m2] = tout.split(":").map(Number);
let mins = h2 * 60 + m2 - (h1 * 60 + m1);
if (mins < 0) mins += 24 * 60;
const h = Math.floor(mins / 60);
return h > 0 ? `${h}h ${mins % 60}m` : `${mins % 60}m`;
};
const totalItems = CHECKLIST.reduce((n, s) => n + s.items.length, 0);

// ================= STYLES =================
// EMS brand: black, gold, white (enterprisemgmtinc.com)
const C = {
navy: "#0F0F0F", navyDeep: "#000000", gold: "#F2C94C", goldSoft: "#FBF1CF",
paper: "#FAFAF8", white: "#FFFFFF", ink: "#1A1A1A", inkSoft: "#6E6E6E",
line: "#E6E4DC", green: "#2E7D52", red: "#B3433B",
};
const inputStyle = {
width: "100%", padding: "13px 14px", fontSize: 16, border: `1.5px solid ${C.line}`,
borderRadius: 10, background: C.white, color: C.ink, fontFamily: "inherit", boxSizing: "border-box",
};
const labelStyle = {
display: "block", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em",
textTransform: "uppercase", color: C.navy, marginBottom: 6,
};
const cardStyle = {
background: C.white, borderRadius: 14, padding: 18,
border: `1px solid ${C.line}`, boxShadow: "0 1px 4px rgba(27,42,74,0.06)", marginBottom: 14,
};

// Mock storage implementation for browser compatibility
const mockStorage = {
  data: {},
  set: async (key, value, useJson = false) => {
    mockStorage.data[key] = value;
    if (typeof window !== 'undefined' && window.localStorage) {
      try { window.localStorage.setItem(key, value); } catch (e) { }
    }
  },
  get: async (key, useJson = false) => {
    let value = mockStorage.data[key];
    if (!value && typeof window !== 'undefined' && window.localStorage) {
      try { value = window.localStorage.getItem(key); } catch (e) { }
    }
    return value ? { value } : null;
  },
  delete: async (key) => {
    delete mockStorage.data[key];
    if (typeof window !== 'undefined' && window.localStorage) {
      try { window.localStorage.removeItem(key); } catch (e) { }
    }
  },
};

// Initialize window.storage if not available
if (typeof window !== 'undefined' && !window.storage) {
  window.storage = mockStorage;
}

// ================= COMPONENT =================
export default function HousekeepingApp() {
const [tab, setTab] = useState("clean");
const [entries, setEntries] = useState([]);
const [locationGroups, setLocationGroups] = useState(DEFAULT_LOCATION_GROUPS);
const [keepers, setKeepers] = useState([]);
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [toast, setToast] = useState(null);
const [openSection, setOpenSection] = useState(null);
const [expandedEntry, setExpandedEntry] = useState(null);
const [filterDate, setFilterDate] = useState("");
const [filterLoc, setFilterLoc] = useState("");
const [newLoc, setNewLoc] = useState("");
const [newKeeper, setNewKeeper] = useState("");
const [useNewName, setUseNewName] = useState(false);
const [adminUnlocked, setAdminUnlocked] = useState(false);
const [pinInput, setPinInput] = useState("");

// ---- auth state ----
const [users, setUsers] = useState([]);
const [currentUser, setCurrentUser] = useState(null);
const [authView, setAuthView] = useState("login"); // login | register
const [authBusy, setAuthBusy] = useState(false);
const [auth, setAuth] = useState({ name: "", email: "", pin: "", pin2: "" });

const persistUsers = async (next) => {
try { await window.storage.set(USERS_KEY, JSON.stringify(next), true); return true; }
catch (err) { showToast("Couldn't save account — try again", false); return false; }
};

const registerUser = async () => {
const name = auth.name.trim();
const email = auth.email.trim().toLowerCase();
if (!name) return showToast("Enter your full name", false);
if (!validEmail(email)) return showToast("Enter a valid email address", false);
if (!/^\d{4,6}$/.test(auth.pin)) return showToast("PIN must be 4–6 digits", false);
if (auth.pin !== auth.pin2) return showToast("PINs don't match", false);
if (users.some((u) => u.email === email)) return showToast("That email is already registered — sign in instead", false);
setAuthBusy(true);
const pinHash = await hashPin(auth.pin);
const user = { name, email, pinHash, created: todayStr() };
const next = [...users, user];
if (await persistUsers(next)) {
setUsers(next);
setCurrentUser(user);
setAuth({ name: "", email: "", pin: "", pin2: "" });
try { await window.storage.set(SESSION_KEY, JSON.stringify({ email })); } catch (e) { /* session optional */ }
showToast(`Welcome, ${name.split(" ")[0]}! ✓`);
}
setAuthBusy(false);
};

const loginUser = async () => {
const email = auth.email.trim().toLowerCase();
if (!validEmail(email)) return showToast("Enter your email address", false);
if (!auth.pin) return showToast("Enter your PIN", false);
setAuthBusy(true);
const user = users.find((u) => u.email === email);
const pinHash = await hashPin(auth.pin);
if (!user || user.pinHash !== pinHash) {
setAuthBusy(false);
setAuth((a) => ({ ...a, pin: "" }));
return showToast("Email or PIN is incorrect", false);
}
setCurrentUser(user);
setAuth({ name: "", email: "", pin: "", pin2: "" });
try { await window.storage.set(SESSION_KEY, JSON.stringify({ email })); } catch (e) { /* session optional */ }
showToast(`Welcome back, ${user.name.split(" ")[0]}!`);
setAuthBusy(false);
};

const logoutUser = async () => {
setCurrentUser(null);
setAdminUnlocked(false);
setTab("clean");
try { await window.storage.delete(SESSION_KEY); } catch (e) { /* fine */ }
};

const removeUser = async (email) => {
const next = users.filter((u) => u.email !== email);
if (await persistUsers(next)) { setUsers(next); showToast("Account removed"); }
};

const tryUnlock = () => {
if (pinInput === ADMIN_PIN) {
setAdminUnlocked(true);
setPinInput("");
showToast("Admin unlocked ✓");
} else {
setPinInput("");
showToast("Incorrect PIN", false);
}
};

const blank = {
location: "", name: "", cleanType: "", cleanTypeOther: "",
timeIn: "", timeOut: "", room: "", bed: "", notes: "", signature: "",
checked: {}, quality: {},
};
const [form, setForm] = useState(blank);

// ---- load ----
useEffect(() => {
(async () => {
try {
const e = await window.storage.get(ENTRIES_KEY, true);
if (e?.value) setEntries(JSON.parse(e.value));
} catch (err) { /* none yet */ }
let loadedUsers = [];
try {
const u = await window.storage.get(USERS_KEY, true);
if (u?.value) { loadedUsers = JSON.parse(u.value); setUsers(loadedUsers); }
} catch (err) { /* none yet */ }
try {
const sess = await window.storage.get(SESSION_KEY);
if (sess?.value) {
const { email } = JSON.parse(sess.value);
const u = loadedUsers.find((x) => x.email === email);
if (u) setCurrentUser(u);
}
} catch (err) { /* no session — show login */ }
try {
const s = await window.storage.get(SETTINGS_KEY, true);
if (s?.value) {
const p = JSON.parse(s.value);
if (p.locationGroups?.length) setLocationGroups(p.locationGroups);
if (p.keepers) setKeepers(p.keepers);
}
} catch (err) {
// no v3 settings yet — carry over housekeeper names from the old version if present
try {
const old = await window.storage.get(OLD_SETTINGS_KEY, true);
if (old?.value) {
const p = JSON.parse(old.value);
if (p.keepers) setKeepers(p.keepers);
}
} catch (e2) { /* none yet */ }
}
setLoading(false);
})();
}, []);

const showToast = (msg, ok = true) => {
setToast({ msg, ok });
setTimeout(() => setToast(null), 2600);
};
const persistEntries = async (next) => {
try { await window.storage.set(ENTRIES_KEY, JSON.stringify(next), true); return true; }
catch (err) { showToast("Couldn't save — try again", false); return false; }
};
const persistSettings = async (groups, keeps) => {
try { await window.storage.set(SETTINGS_KEY, JSON.stringify({ locationGroups: groups, keepers: keeps }), true); return true; }
catch (err) { showToast("Couldn't save settings", false); return false; }
};

// ---- checklist helpers ----
const toggleItem = (sec, idx) => {
const key = `${sec}|${idx}`;
setForm((f) => ({ ...f, checked: { ...f.checked, [key]: !f.checked[key] } }));
};
const toggleAllInSection = (sec, items) => {
const allDone = items.every((_, i) => form.checked[`${sec}|${i}`]);
const next = { ...form.checked };
items.forEach((_, i) => { next[`${sec}|${i}`] = !allDone; });
setForm({ ...form, checked: next });
};
const sectionDone = (sec, items) => items.filter((_, i) => form.checked[`${sec}|${i}`]).length;
const checkedCount = Object.values(form.checked).filter(Boolean).length;
const qualityCount = Object.values(form.quality).filter(Boolean).length;
const toggleQuality = (i) => setForm((f) => ({ ...f, quality: { ...f.quality, [i]: !f.quality[i] } }));

// ---- submit ----
const submit = async () => {
if (!form.location || !form.cleanType || !form.timeIn || !form.room || !form.bed) {
showToast("Fill in location, clean type, time in, room, and bed", false);
return;
}
if (!form.signature.trim()) {
showToast("Sign off by typing your full name at the bottom", false);
return;
}
setSaving(true);
const entry = {
id: Date.now().toString(36),
date: todayStr(),
location: form.location,
name: currentUser.name,
email: currentUser.email,
cleanType: form.cleanType === "Other" ? `Other: ${form.cleanTypeOther || "—"}` : form.cleanType,
timeIn: form.timeIn, timeOut: form.timeOut,
room: form.room, bed: form.bed, notes: form.notes,
signature: form.signature.trim(),
checked: Object.keys(form.checked).filter((k) => form.checked[k]),
quality: Object.keys(form.quality).filter((k) => form.quality[k]).map(Number),
};
const next = [entry, ...entries];
const ok = await persistEntries(next);
if (ok) {
setEntries(next);
setForm({ ...blank, location: form.location });
setUseNewName(false);
setOpenSection(null);
showToast("Clean saved & signed off ✓");
window.scrollTo({ top: 0, behavior: "smooth" });
}
setSaving(false);
};

const removeEntry = async (id) => {
const next = entries.filter((e) => e.id !== id);
if (await persistEntries(next)) { setEntries(next); showToast("Entry deleted"); }
};

// ---- settings ----
const [newLocGroup, setNewLocGroup] = useState(DEFAULT_LOCATION_GROUPS[0].group);
const addLocation = () => {
const v = newLoc.trim();
if (!v || flattenGroups(locationGroups).includes(v)) return;
let groups = locationGroups.map((g) =>
g.group === newLocGroup ? { ...g, items: [...g.items, v] } : g
);
if (!groups.some((g) => g.group === newLocGroup)) {
groups = [...groups, { group: newLocGroup, items: [v] }];
}
setLocationGroups(groups); setNewLoc(""); persistSettings(groups, keepers);
};
const removeLocation = (groupName, loc) => {
const groups = locationGroups
.map((g) => g.group === groupName ? { ...g, items: g.items.filter((l) => l !== loc) } : g)
.filter((g) => g.items.length > 0);
setLocationGroups(groups); persistSettings(groups, keepers);
};

// ---- CSV ----
const downloadCSV = () => {
const header = "Date,Location,Housekeeper,Email,Clean Type,Time In,Time Out,Duration,Room,Bed,Tasks Done,Quality Checks,Signed By,Notes";
const rows = entries.map((e) =>
[e.date, e.location, e.name, e.email || "", e.cleanType, e.timeIn, e.timeOut,
duration(e.timeIn, e.timeOut) || "", e.room, e.bed,
`${e.checked.length}/${totalItems}`, `${e.quality.length}/${QUALITY_CHECK.length}`,
e.signature, (e.notes || "").replace(/"/g, '""')]
.map((v) => `"${v}"`).join(",")
);
const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = `housekeeping-log-${todayStr()}.csv`;
a.click();
URL.revokeObjectURL(url);
};

// ---- filtered log ----
const visible = entries.filter((e) =>
(!filterDate || e.date === filterDate) && (!filterLoc || e.location === filterLoc)
);
const grouped = visible.reduce((acc, e) => { (acc[e.date] = acc[e.date] || []).push(e); return acc; }, {});
const sortedDates = Object.keys(grouped).sort().reverse();

// ================= RENDER =================
if (loading) {
return (
<div style={{ minHeight: "100vh", background: C.paper, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", color: C.navy }}>
Loading the log…
</div>
);
}

const pct = Math.round((checkedCount / totalItems) * 100);

// ============ LOGIN / REGISTER SCREEN ============
if (!currentUser) {
return (
<div style={{ minHeight: "100vh", background: C.paper, fontFamily: "'Helvetica Neue', Arial, sans-serif", color: C.ink, display: "flex", flexDirection: "column" }}>
<div style={{ background: C.navy, padding: "26px 20px 22px", borderBottom: `4px solid ${C.gold}`, textAlign: "center" }}>
<img
src="https://enterprisemgmtinc.com/assets/images/emslogo.svg"
alt="Enterprise Management Solutions"
style={{ height: 52, width: "auto", display: "inline-block" }}
onError={(e) => { e.target.style.display = "none"; }}
/>
<div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 22, fontWeight: 700, color: C.white, marginTop: 10 }}>
Enterprise Management <span style={{ color: C.gold, fontStyle: "italic" }}>Solutions</span>
</div>
<div style={{ fontSize: 11, color: C.gold, letterSpacing: "0.16em", textTransform: "uppercase", marginTop: 4 }}>
Housekeeping Cleaning Log
</div>
</div>

<div style={{ flex: 1, maxWidth: 420, width: "100%", margin: "0 auto", padding: "26px 18px", boxSizing: "border-box" }}>
<div style={{ ...cardStyle, padding: 22 }}>
<div style={{ fontFamily: "Georgia, serif", fontSize: 19, fontWeight: 700, color: C.navy, marginBottom: 4, textAlign: "center" }}>
{authView === "login" ? "Sign In" : "Create Your Account"}
</div>
<div style={{ fontSize: 13, color: C.inkSoft, textAlign: "center", marginBottom: 18 }}>
{authView === "login"
? "Welcome back — enter your email and PIN."
: "One-time setup: your name, email, and a PIN you'll use to sign in."}
</div>

{authView === "register" && (
<div style={{ marginBottom: 13 }}>
<label style={labelStyle}>Full Name</label>
<input style={inputStyle} placeholder="First and last name" value={auth.name}
onChange={(e) => setAuth({ ...auth, name: e.target.value })} />
</div>
)}

<div style={{ marginBottom: 13 }}>
<label style={labelStyle}>Email</label>
<input style={inputStyle} type="email" inputMode="email" autoCapitalize="none" placeholder="name@email.com" value={auth.email}
onChange={(e) => setAuth({ ...auth, email: e.target.value })} />
</div>

<div style={{ marginBottom: 13 }}>
<label style={labelStyle}>{authView === "login" ? "PIN" : "Create a PIN (4–6 digits)"}</label>
<input style={{ ...inputStyle, letterSpacing: "0.3em" }} type="password" inputMode="numeric" maxLength={6} placeholder="••••"
value={auth.pin}
onChange={(e) => setAuth({ ...auth, pin: e.target.value.replace(/\D/g, "") })}
onKeyDown={(e) => { if (e.key === "Enter" && authView === "login") loginUser(); }} />
</div>

{authView === "register" && (
<div style={{ marginBottom: 13 }}>
<label style={labelStyle}>Confirm PIN</label>
<input style={{ ...inputStyle, letterSpacing: "0.3em" }} type="password" inputMode="numeric" maxLength={6} placeholder="••••"
value={auth.pin2}
onChange={(e) => setAuth({ ...auth, pin2: e.target.value.replace(/\D/g, "") })}
onKeyDown={(e) => { if (e.key === "Enter") registerUser(); }} />
</div>
)}

<button onClick={authView === "login" ? loginUser : registerUser} disabled={authBusy}
style={{ width: "100%", padding: "15px", marginTop: 6, fontSize: 16, fontWeight: 700, color: C.white, background: authBusy ? C.inkSoft : C.navy, border: "none", borderRadius: 12, cursor: "pointer" }}>
{authBusy ? "One moment…" : authView === "login" ? "Sign In" : "Create Account & Sign In"}
</button>

<button onClick={() => { setAuthView(authView === "login" ? "register" : "login"); setAuth({ name: "", email: "", pin: "", pin2: "" }); }}
style={{ width: "100%", padding: "12px", marginTop: 10, fontSize: 14, fontWeight: 600, color: C.navy, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
{authView === "login" ? "First time here? Create an account" : "Already have an account? Sign in"}
</button>
</div>

<div style={{ marginTop: 18, fontSize: 11, color: C.inkSoft, textAlign: "center", lineHeight: 1.6 }}>
Use a PIN created just for this app — not a password you use elsewhere.<br />
Forgot your PIN? Ask your administrator to remove your account so you can re-register.
</div>

<div style={{ marginTop: 22, paddingTop: 12, borderTop: `1px solid ${C.line}`, textAlign: "center", fontSize: 11, color: C.inkSoft }}>
Housekeeping Cleaning Log™ · © {new Date().getFullYear()} Michele Y. Greene. All rights reserved.
</div>
</div>

{toast && (
<div style={{ position: "fixed", bottom: 40, left: "50%", transform: "translateX(-50%)", background: toast.ok ? C.navyDeep : C.red, color: C.white, padding: "11px 22px", borderRadius: 24, fontSize: 14, fontWeight: 600, boxShadow: "0 4px 16px rgba(0,0,0,0.25)", zIndex: 50, whiteSpace: "nowrap" }}>
{toast.msg}
</div>
)}
</div>
);
}

return (
<div style={{ minHeight: "100vh", background: C.paper, fontFamily: "'Helvetica Neue', Arial, sans-serif", color: C.ink, paddingBottom: 90 }}>

{/* header */}
<div style={{ background: C.navy, padding: "18px 20px 16px", borderBottom: `4px solid ${C.gold}` }}>
<div style={{ maxWidth: 560, margin: "0 auto", display: "flex", alignItems: "center", gap: 14 }}>
<img
src="https://enterprisemgmtinc.com/assets/images/emslogo.svg"
alt="Enterprise Management Solutions"
style={{ height: 44, width: "auto", display: "block" }}
onError={(e) => { e.target.style.display = "none"; document.getElementById("ems-fallback").style.display = "flex"; }}
/>
<div id="ems-fallback" style={{ display: "none", width: 44, height: 44, minWidth: 44, borderRadius: 8, background: C.gold, color: C.navyDeep, alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 17, letterSpacing: "0.02em" }}>
EMS
</div>
<div>
<div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 20, fontWeight: 700, color: C.white, lineHeight: 1.15 }}>
Enterprise Management <span style={{ color: C.gold, fontStyle: "italic" }}>Solutions</span>
</div>
<div style={{ fontSize: 11, color: C.gold, letterSpacing: "0.16em", textTransform: "uppercase", marginTop: 3 }}>
Housekeeping Cleaning Log
</div>
<div style={{ fontSize: 11.5, color: "#CFCFCF", marginTop: 4 }}>
Signed in as <span style={{ color: C.white, fontWeight: 600 }}>{currentUser.name}</span>
{" · "}
<button onClick={logoutUser} style={{ background: "none", border: "none", color: C.gold, fontSize: 11.5, cursor: "pointer", padding: 0, textDecoration: "underline" }}>
Log out
</button>
</div>
</div>
</div>
</div>

<div style={{ maxWidth: 560, margin: "0 auto", padding: "16px 14px" }}>

{/* ============ NEW CLEAN ============ */}
{tab === "clean" && (
<div>
{/* --- info card --- */}
<div style={cardStyle}>
<div style={{ fontFamily: "Georgia, serif", fontSize: 17, fontWeight: 700, color: C.navy, marginBottom: 14 }}>
Clean Details
</div>

<div style={{ marginBottom: 13 }}>
<label style={labelStyle}>Location</label>
<select style={inputStyle} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}>
<option value="">Choose location…</option>
{locationGroups.map((g) => (
<optgroup key={g.group} label={g.group}>
{g.items.map((l) => <option key={l} value={l}>{l}</option>)}
</optgroup>
))}
</select>
</div>

<div style={{ marginBottom: 13 }}>
<label style={labelStyle}>House Attendant</label>
<div style={{ ...inputStyle, background: C.paper, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
<span style={{ fontWeight: 600 }}>{currentUser.name}</span>
<span style={{ fontSize: 12, color: C.inkSoft }}>{currentUser.email}</span>
</div>
</div>

<div style={{ marginBottom: 13 }}>
<label style={labelStyle}>Type of Clean</label>
<select style={inputStyle} value={form.cleanType} onChange={(e) => setForm({ ...form, cleanType: e.target.value })}>
<option value="">Choose type…</option>
{CLEAN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
</select>
{form.cleanType === "Other" && (
<input style={{ ...inputStyle, marginTop: 8 }} placeholder="Describe the clean"
value={form.cleanTypeOther} onChange={(e) => setForm({ ...form, cleanTypeOther: e.target.value })} />
)}
</div>

<div style={{ display: "flex", gap: 10, marginBottom: 13 }}>
<div style={{ flex: 1 }}>
<label style={labelStyle}>Time In</label>
<div style={{ display: "flex", gap: 6 }}>
<input type="time" style={{ ...inputStyle, flex: 1, minWidth: 0 }} value={form.timeIn} onChange={(e) => setForm({ ...form, timeIn: e.target.value })} />
<button onClick={() => setForm({ ...form, timeIn: nowTime() })}
style={{ padding: "0 11px", border: "none", borderRadius: 10, background: C.goldSoft, color: C.navy, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Now</button>
</div>
</div>
<div style={{ flex: 1 }}>
<label style={labelStyle}>Time Out</label>
<div style={{ display: "flex", gap: 6 }}>
<input type="time" style={{ ...inputStyle, flex: 1, minWidth: 0 }} value={form.timeOut} onChange={(e) => setForm({ ...form, timeOut: e.target.value })} />
<button onClick={() => setForm({ ...form, timeOut: nowTime() })}
style={{ padding: "0 11px", border: "none", borderRadius: 10, background: C.goldSoft, color: C.navy, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Now</button>
</div>
</div>
</div>

<div style={{ display: "flex", gap: 10 }}>
<div style={{ flex: 1 }}>
<label style={labelStyle}>Room #</label>
<select style={inputStyle} value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })}>
<option value="">Room…</option>
{ROOMS.map((r) => <option key={r} value={r}>Room {r}</option>)}
</select>
</div>
<div style={{ flex: 1 }}>
<label style={labelStyle}>Bed</label>
<select style={inputStyle} value={form.bed} onChange={(e) => setForm({ ...form, bed: e.target.value })}>
<option value="">Bed…</option>
{BEDS.map((b) => <option key={b} value={b}>Bed {b}</option>)}
</select>
</div>
</div>
</div>

{/* --- progress bar --- */}
<div style={{ ...cardStyle, padding: "14px 18px" }}>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
<span style={{ fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 700, color: C.navy }}>Cleaning Checklist</span>
<span style={{ fontSize: 13, fontWeight: 700, color: pct === 100 ? C.green : C.inkSoft }}>{checkedCount}/{totalItems} · {pct}%</span>
</div>
<div style={{ height: 8, background: C.paper, borderRadius: 4, overflow: "hidden" }}>
<div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? C.green : C.gold, transition: "width 0.25s" }} />
</div>
</div>

{/* --- checklist sections --- */}
{CHECKLIST.map(({ section, items }) => {
const done = sectionDone(section, items);
const open = openSection === section;
return (
<div key={section} style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
<button onClick={() => setOpenSection(open ? null : section)}
style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 18px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
<span style={{ fontSize: 15.5, fontWeight: 700, color: C.navy }}>{section}</span>
<span style={{ display: "flex", alignItems: "center", gap: 10 }}>
<span style={{ fontSize: 13, fontWeight: 700, color: done === items.length ? C.green : C.inkSoft }}>
{done}/{items.length}{done === items.length ? " ✓" : ""}
</span>
<span style={{ color: C.gold, fontSize: 13 }}>{open ? "▲" : "▼"}</span>
</span>
</button>
{open && (
<div style={{ padding: "0 18px 14px" }}>
<button onClick={() => toggleAllInSection(section, items)}
style={{ marginBottom: 10, padding: "6px 14px", fontSize: 12.5, fontWeight: 700, color: C.navy, background: C.goldSoft, border: "none", borderRadius: 8, cursor: "pointer" }}>
{items.every((_, i) => form.checked[`${section}|${i}`]) ? "Uncheck all" : "Check all"}
</button>
{items.map((item, i) => {
const on = !!form.checked[`${section}|${i}`];
return (
<button key={i} onClick={() => toggleItem(section, i)}
style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "11px 4px", background: "none", border: "none", borderBottom: `1px solid ${C.paper}`, cursor: "pointer", textAlign: "left" }}>
<span style={{
width: 24, height: 24, minWidth: 24, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
border: on ? `2px solid ${C.green}` : `2px solid ${C.line}`,
background: on ? C.green : C.white, color: C.white, fontSize: 14, fontWeight: 700,
}}>{on ? "✓" : ""}</span>
<span style={{ fontSize: 15, color: on ? C.inkSoft : C.ink, textDecoration: on ? "line-through" : "none" }}>{item}</span>
</button>
);
})}
</div>
)}
</div>
);
})}

{/* --- quality check --- */}
<div style={{ ...cardStyle, borderLeft: `4px solid ${C.gold}` }}>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
<span style={{ fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 700, color: C.navy }}>Quick Quality Check</span>
<span style={{ fontSize: 13, fontWeight: 700, color: qualityCount === QUALITY_CHECK.length ? C.green : C.inkSoft }}>
{qualityCount}/{QUALITY_CHECK.length}
</span>
</div>
<div style={{ fontSize: 12.5, color: C.inkSoft, marginBottom: 10 }}>
Final walkthrough — bedrooms, kitchen, bathrooms, basements (if finished), and outdoors.
</div>
{QUALITY_CHECK.map((q, i) => {
const on = !!form.quality[i];
return (
<button key={i} onClick={() => toggleQuality(i)}
style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 4px", background: "none", border: "none", borderBottom: `1px solid ${C.paper}`, cursor: "pointer", textAlign: "left" }}>
<span style={{
width: 24, height: 24, minWidth: 24, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
border: on ? `2px solid ${C.gold}` : `2px solid ${C.line}`,
background: on ? C.gold : C.white, color: C.white, fontSize: 13, fontWeight: 700,
}}>{on ? "✓" : ""}</span>
<span style={{ fontSize: 14.5, color: on ? C.inkSoft : C.ink }}>{q}</span>
</button>
);
})}
</div>

{/* --- notes + sign off --- */}
<div style={cardStyle}>
<div style={{ marginBottom: 13 }}>
<label style={labelStyle}>Notes <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, color: C.inkSoft }}>(optional)</span></label>
<input style={inputStyle} placeholder="Maintenance issues, supplies needed, etc." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
</div>
<div style={{ marginBottom: 16 }}>
<label style={labelStyle}>Sign Off — Type Your Full Name</label>
<input style={{ ...inputStyle, fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 18 }}
placeholder="Signature" value={form.signature} onChange={(e) => setForm({ ...form, signature: e.target.value })} />
</div>
<button onClick={submit} disabled={saving}
style={{ width: "100%", padding: "16px", fontSize: 17, fontWeight: 700, color: C.white, background: saving ? C.inkSoft : C.navy, border: "none", borderRadius: 12, cursor: "pointer" }}>
{saving ? "Saving…" : "Save & Sign Off"}
</button>
</div>
</div>
)}

{/* ============ LOG BOOK ============ */}
{tab === "entries" && (
<div>
<div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
<input type="date" style={{ ...inputStyle, flex: 1, padding: "10px 12px", fontSize: 14 }} value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
<select style={{ ...inputStyle, flex: 1, padding: "10px 12px", fontSize: 14 }} value={filterLoc} onChange={(e) => setFilterLoc(e.target.value)}>
<option value="">All locations</option>
{locationGroups.map((g) => (
<optgroup key={g.group} label={g.group}>
{g.items.map((l) => <option key={l} value={l}>{l}</option>)}
</optgroup>
))}
</select>
</div>

{entries.length > 0 && adminUnlocked && (
<button onClick={downloadCSV}
style={{ width: "100%", padding: "11px", marginBottom: 14, fontSize: 14, fontWeight: 700, color: C.navy, background: C.goldSoft, border: `1px solid ${C.gold}`, borderRadius: 10, cursor: "pointer" }}>
⬇ Download CSV ({visible.length} entries)
</button>
)}
{entries.length > 0 && !adminUnlocked && (
<div style={{ textAlign: "center", fontSize: 12.5, color: C.inkSoft, marginBottom: 14 }}>
🔒 Export and delete are admin-only — unlock in Settings
</div>
)}

{sortedDates.length === 0 && (
<div style={{ textAlign: "center", padding: "48px 20px", color: C.inkSoft, background: C.white, borderRadius: 14, border: `1px dashed ${C.line}` }}>
No entries yet. Log a clean from the New Clean tab to get started.
</div>
)}

{sortedDates.map((d) => (
<div key={d} style={{ marginBottom: 18 }}>
<div style={{ fontSize: 13, fontWeight: 700, color: C.navy, letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 8px 4px" }}>
{fmtDate(d)} <span style={{ color: C.inkSoft, fontWeight: 400 }}>· {grouped[d].length} clean{grouped[d].length > 1 ? "s" : ""}</span>
</div>
{grouped[d].map((e) => {
const exp = expandedEntry === e.id;
const taskPct = Math.round((e.checked.length / totalItems) * 100);
return (
<div key={e.id} style={{ background: C.white, borderRadius: 12, padding: "14px 16px", marginBottom: 8, border: `1px solid ${C.line}`, borderLeft: `4px solid ${taskPct === 100 ? C.green : C.gold}` }}>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
<div style={{ fontWeight: 700, fontSize: 16 }}>Room {e.room} · Bed {e.bed}</div>
<div style={{ fontSize: 13, color: C.green, fontWeight: 700 }}>{duration(e.timeIn, e.timeOut) || "In progress"}</div>
</div>
<div style={{ fontSize: 14, marginTop: 3 }}>{e.name} · {e.cleanType}</div>
<div style={{ fontSize: 13, color: C.inkSoft, marginTop: 3 }}>
{e.location} · {fmtTime(e.timeIn)} – {fmtTime(e.timeOut)}
</div>
<div style={{ fontSize: 13, marginTop: 6, fontWeight: 600, color: taskPct === 100 ? C.green : C.ink }}>
Tasks {e.checked.length}/{totalItems} ({taskPct}%) · Quality {e.quality.length}/{QUALITY_CHECK.length}
</div>
{e.notes && (
<div style={{ fontSize: 13, marginTop: 6, padding: "6px 10px", background: C.paper, borderRadius: 8 }}>{e.notes}</div>
)}
<div style={{ fontSize: 13, color: C.inkSoft, marginTop: 6, fontFamily: "Georgia, serif", fontStyle: "italic" }}>
Signed: {e.signature}
</div>
<div style={{ display: "flex", gap: 8, marginTop: 8 }}>
<button onClick={() => setExpandedEntry(exp ? null : e.id)}
style={{ padding: "4px 12px", fontSize: 12, color: C.navy, background: C.goldSoft, border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700 }}>
{exp ? "Hide tasks" : "View tasks"}
</button>
{adminUnlocked && (
<button onClick={() => removeEntry(e.id)}
style={{ padding: "4px 12px", fontSize: 12, color: C.red, background: "none", border: `1px solid ${C.line}`, borderRadius: 8, cursor: "pointer" }}>
Delete
</button>
)}
</div>
{exp && (
<div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.paper}` }}>
{CHECKLIST.map(({ section, items }) => {
const doneItems = items.filter((_, i) => e.checked.includes(`${section}|${i}`));
if (!doneItems.length) return null;
return (
<div key={section} style={{ marginBottom: 8 }}>
<div style={{ fontSize: 12, fontWeight: 700, color: C.navy, textTransform: "uppercase", letterSpacing: "0.05em" }}>{section} ({doneItems.length}/{items.length})</div>
<div style={{ fontSize: 13, color: C.inkSoft, marginTop: 2 }}>{doneItems.join(" · ")}</div>
</div>
);
})}
{e.quality.length > 0 && (
<div style={{ marginTop: 4 }}>
<div style={{ fontSize: 12, fontWeight: 700, color: C.navy, textTransform: "uppercase", letterSpacing: "0.05em" }}>Quality Check Passed</div>
<div style={{ fontSize: 13, color: C.inkSoft, marginTop: 2 }}>{e.quality.map((i) => QUALITY_CHECK[i]).join(" · ")}</div>
</div>
)}
</div>
)}
</div>
);
})}
</div>
))}
</div>
)}

{/* ============ SETTINGS ============ */}
{tab === "settings" && !adminUnlocked && (
<div style={{ ...cardStyle, textAlign: "center", padding: "32px 22px" }}>
<div style={{ fontSize: 34, marginBottom: 8 }}>🔒</div>
<div style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 6 }}>
Admin Access
</div>
<div style={{ fontSize: 13.5, color: C.inkSoft, marginBottom: 18 }}>
Settings, deleting entries, and CSV export require the admin PIN.
</div>
<input
type="password"
inputMode="numeric"
maxLength={6}
placeholder="Enter PIN"
value={pinInput}
onChange={(ev) => setPinInput(ev.target.value.replace(/\D/g, ""))}
onKeyDown={(ev) => { if (ev.key === "Enter") tryUnlock(); }}
style={{ ...inputStyle, textAlign: "center", fontSize: 22, letterSpacing: "0.4em", maxWidth: 220, margin: "0 auto 14px", display: "block" }}
/>
<button onClick={tryUnlock}
style={{ width: "100%", maxWidth: 220, padding: "13px", fontSize: 15, fontWeight: 700, color: C.white, background: C.navy, border: "none", borderRadius: 10, cursor: "pointer" }}>
Unlock
</button>
</div>
)}

{tab === "settings" && adminUnlocked && (
<div>
<button onClick={() => { setAdminUnlocked(false); showToast("Admin locked"); }}
style={{ width: "100%", padding: "10px", marginBottom: 14, fontSize: 13, fontWeight: 700, color: C.navy, background: C.goldSoft, border: `1px solid ${C.gold}`, borderRadius: 10, cursor: "pointer" }}>
🔓 Admin unlocked — tap to lock
</button>
<div style={cardStyle}>
<div style={{ ...labelStyle, fontSize: 14, marginBottom: 12 }}>Facilities &amp; Locations</div>
{locationGroups.map((g) => (
<div key={g.group} style={{ marginBottom: 14 }}>
<div style={{ fontSize: 12, fontWeight: 700, color: C.gold, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
{g.group}
</div>
{g.items.map((l) => (
<div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: `1px solid ${C.paper}` }}>
<span style={{ fontSize: 14 }}>{l}</span>
<button onClick={() => removeLocation(g.group, l)} style={{ fontSize: 12, color: C.red, background: "none", border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>Remove</button>
</div>
))}
</div>
))}
<div style={{ marginTop: 4 }}>
<select style={{ ...inputStyle, padding: "10px 12px", fontSize: 15, marginBottom: 8 }} value={newLocGroup} onChange={(e) => setNewLocGroup(e.target.value)}>
{[...new Set([...locationGroups.map((g) => g.group), "Assisted Living", "Supportive Housing", "Residential Treatment", "Offices", "Storage"])].map((g) => (
<option key={g} value={g}>{g}</option>
))}
</select>
<div style={{ display: "flex", gap: 8 }}>
<input style={{ ...inputStyle, flex: 1, padding: "10px 12px", fontSize: 15 }} placeholder="Add an address" value={newLoc} onChange={(e) => setNewLoc(e.target.value)} />
<button onClick={addLocation} style={{ padding: "0 18px", fontWeight: 700, color: C.white, background: C.navy, border: "none", borderRadius: 10, cursor: "pointer" }}>Add</button>
</div>
</div>
</div>

<div style={cardStyle}>
<div style={{ ...labelStyle, fontSize: 14, marginBottom: 12 }}>Registered Users ({users.length})</div>
{users.length === 0 && (
<div style={{ fontSize: 14, color: C.inkSoft }}>
No accounts yet — housekeepers create their own from the sign-in screen.
</div>
)}
{users.map((u) => (
<div key={u.email} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, padding: "9px 0", borderBottom: `1px solid ${C.paper}` }}>
<div>
<div style={{ fontSize: 15, fontWeight: 600 }}>{u.name}</div>
<div style={{ fontSize: 12.5, color: C.inkSoft }}>{u.email} · joined {u.created}</div>
</div>
{u.email !== currentUser.email && (
<button onClick={() => removeUser(u.email)} style={{ fontSize: 12, color: C.red, background: "none", border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>Remove</button>
)}
</div>
))}
<div style={{ fontSize: 12, color: C.inkSoft, marginTop: 10, lineHeight: 1.5 }}>
PINs are stored scrambled and can't be viewed. If someone forgets theirs, remove their account and have them re-register — their past log entries are kept.
</div>
</div>

<div style={{ marginTop: 14, fontSize: 12.5, color: C.inkSoft, lineHeight: 1.5, padding: "0 6px" }}>
Entries and settings are shared — everyone who uses this app works from the same log, so the whole team's cleans appear in one record.
</div>
</div>
)}

{/* footer — ownership fine print */}
<div style={{ marginTop: 26, paddingTop: 14, borderTop: `1px solid ${C.line}`, textAlign: "center" }}>
<div style={{ fontFamily: "Georgia, serif", fontSize: 12.5, fontWeight: 700, color: C.navy, letterSpacing: "0.03em" }}>
Housekeeping Cleaning Log™
</div>
<div style={{ fontSize: 11, color: C.inkSoft, marginTop: 4, lineHeight: 1.6 }}>
© {new Date().getFullYear()} Michele Y. Greene. All rights reserved.<br />
This application and its design, checklists, and workflows are the exclusive property of Michele Y. Greene.<br />
Unauthorized reproduction, modification, or distribution is prohibited.
</div>
</div>
</div>
{toast && (
<div style={{ position: "fixed", bottom: 84, left: "50%", transform: "translateX(-50%)", background: toast.ok ? C.navyDeep : C.red, color: C.white, padding: "11px 22px", borderRadius: 24, fontSize: 14, fontWeight: 600, boxShadow: "0 4px 16px rgba(0,0,0,0.25)", zIndex: 50, whiteSpace: "nowrap" }}>
{toast.msg}
</div>
)}

{/* bottom nav */}
<div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: C.white, borderTop: `1px solid ${C.line}`, display: "flex", zIndex: 40 }}>
{[
{ id: "clean", label: "New Clean", icon: "✚" },
{ id: "entries", label: "Log Book", icon: "☰" },
{ id: "settings", label: "Settings", icon: "⚙" },
].map((t) => (
<button key={t.id} onClick={() => setTab(t.id)}
style={{
flex: 1, padding: "12px 0 14px", background: "none", border: "none", cursor: "pointer",
color: tab === t.id ? C.navy : C.inkSoft,
borderTop: tab === t.id ? `3px solid ${C.gold}` : "3px solid transparent",
fontWeight: tab === t.id ? 700 : 500, fontSize: 12,
}}>
<div style={{ fontSize: 18, marginBottom: 2 }}>{t.icon}</div>
{t.label}
</button>
))}
</div>
</div>
);
}
