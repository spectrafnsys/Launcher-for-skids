import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog";
import { exists, readBinaryFile } from "@tauri-apps/api/fs";
import { join } from "@tauri-apps/api/path";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Home,
  Grid,
  Settings,
  Play,
  Plus,
  Trash2,
  User,
  LogOut,
  Minus,
  X,
} from "lucide-react";
import "./App.css";

/* ================= HELPERS ================= */

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

const folderName = (p: string) =>
  p.split(/\\|\//).filter(Boolean).pop() ?? p;

/* ================= TYPES ================= */

type Tab = "home" | "library" | "settings";
type Build = { id: string; path: string; name: string; cover?: string };
type UserAccount = { email: string; password: string };

/* ================= MAIN ================= */

export default function Onboard() {
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>("home");
  const [builds, setBuilds] = useState<Build[]>([]);
  const [activePath, setActivePath] = useState<string | null>(null);
  const [user, setUser] = useState<UserAccount | null>(null);
  const [EOR, setEOR] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ================= EDITABLE DATA ================= */

  const bannerImage =
    "https://i.ibb.co/1GMRpg3f/Chapter2season4.png";

  const newsData = [
    {
      img: "https://imageio.forbes.com/specials-images/imageserve/5f474fba4b4e97e57fc084b9/0x0.jpg",
      title: "Nexus UI Update",
      text: "Cleaner black UI with a fully redesigned homepage.",
    },
    {
      img: "https://www.denofgeek.com/wp-content/uploads/2020/08/fortnite-marvel-nexus-war.png",
      title: "Build Importing",
      text: "Easily import and manage multiple Fortnite builds.",
    },
    {
      img: "https://xboxwire.thesourcemediaassets.com/sites/2/2020/08/FortniteS4_HERO.jpg",
      title: "Launcher Progress",
      text: "Stats and progress now displayed directly in launcher.",
    },
  ];

  /* ================= MOCK STATS ================= */

  const stats = {
    wins: 128,
    kills: 4392,
    matches: 812,
    levelProgress: 72, // %
  };

  /* ================= INIT ================= */

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));

    const b = localStorage.getItem("PabloMP.builds");
    if (b) setBuilds(JSON.parse(b));

    const p = localStorage.getItem("buildPath");
    if (p) setActivePath(p);

    const e = localStorage.getItem("EOR");
    if (e) setEOR(e === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("PabloMP.builds", JSON.stringify(builds));
  }, [builds]);

  /* ================= ACTIONS ================= */

  async function launch() {
    const path = activePath ?? builds[0]?.path;
    if (!path || !user) {
      setError("Missing build or account");
      return;
    }

    try {
      setLaunching(true);
      await invoke("firstlaunch", {
        path,
        email: user.email,
        password: user.password,
        eor: EOR,
      });
    } catch (e) {
      setError(String(e));
      setLaunching(false);
    }
  }

  async function addBuild() {
    const selected = await open({ directory: true });
    if (!selected || typeof selected !== "string") return;

    if (!(await exists(await join(selected, "Engine")))) {
      setError("Invalid build folder");
      return;
    }

    let cover: string | undefined;
    const splash = await join(
      selected,
      "FortniteGame",
      "Content",
      "Splash",
      "Splash.bmp"
    );
    if (await exists(splash)) {
      const bytes = await readBinaryFile(splash);
      cover = "data:image/bmp;base64," + bytesToBase64(bytes);
    }

    const item: Build = {
      id: crypto.randomUUID(),
      path: selected,
      name: folderName(selected),
      cover,
    };

    setBuilds((b) => [item, ...b]);
    setActivePath(selected);
  }

  function removeBuild(id: string) {
    setBuilds((b) => b.filter((x) => x.id !== id));
  }

  function logout() {
    localStorage.clear();
    navigate("/login");
  }

  const activeBuild = builds.find((b) => b.path === activePath) ?? builds[0];

  /* ================= UI ================= */

  return (
    <div className="w-screen h-screen bg-black text-slate-200 flex overflow-hidden select-none">
      {/* SIDEBAR */}
      <aside className="w-52 border-r border-white/5 flex flex-col">
        <div className="p-4 text-lg font-bold">Nexus</div>

        <nav className="px-2 space-y-1">
          <Nav icon={<Home size={16} />} label="Home" active={tab === "home"} onClick={() => setTab("home")} />
          <Nav icon={<Grid size={16} />} label="Library" active={tab === "library"} onClick={() => setTab("library")} />
        </nav>

        <div className="mt-auto border-t border-white/5">
          <Nav icon={<Settings size={16} />} label="Settings" active={tab === "settings"} onClick={() => setTab("settings")} />
          <div className="flex items-center gap-2 p-3 text-xs">
            <User size={14} />
            <div className="flex-1 truncate">{user?.email}</div>
            <button onClick={logout}><LogOut size={14} /></button>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">
        {/* WINDOW BAR */}
        <div className="h-9 flex justify-end gap-2 px-3 border-b border-white/5">
          <button onClick={() => invoke("window_minimize")}><Minus size={12} /></button>
          <button onClick={() => invoke("window_close")}><X size={12} /></button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-hidden">
          {/* HOME */}
          {tab === "home" && (
            <div className="p-6 max-w-[1300px] mx-auto space-y-6">

              {/* HERO */}
              <div className="relative h-[260px] border border-white/10 rounded">
                <img src={bannerImage} className="absolute inset-0 w-full h-full object-cover rounded" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 to-black/40 rounded" />
                <div className="relative h-full flex items-end justify-between p-6">
                  <div>
                    <div className="text-2xl font-semibold">Nexus Launcher</div>
                    <div className="text-sm opacity-60">{activeBuild?.name ?? "No build selected"}</div>
                  </div>
                  <button
                    onClick={launch}
                    disabled={launching || !activeBuild}
                    className="px-8 py-3 bg-white text-black font-semibold flex items-center gap-2 disabled:opacity-50"
                  >
                    <Play size={16} /> {launching ? "Launching…" : "Play"}
                  </button>
                </div>
              </div>

              {/* STATS */}
              <div className="grid grid-cols-4 gap-4">
                <Stat title="Wins" value={stats.wins} />
                <Stat title="Kills" value={stats.kills} />
                <Stat title="Matches" value={stats.matches} />
                <Progress title="Level Progress" value={stats.levelProgress} />
              </div>

              {/* NEWS */}
              <div>
                <div className="font-semibold mb-3">News</div>
                <div className="grid grid-cols-3 gap-4">
                  {newsData.map((n, i) => (
                    <News key={i} img={n.img} title={n.title} text={n.text} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* LIBRARY */}
          {tab === "library" && (
            <div className="p-6 max-w-[1300px] mx-auto">
              <button
                onClick={addBuild}
                className="mb-4 px-4 py-2 bg-white text-black text-sm font-semibold flex gap-2 rounded hover:bg-gray-200"
              >
                <Plus size={14} /> Add Build
              </button>

              <div className="grid grid-cols-4 gap-4">
                {builds.map((b) => (
                  <div key={b.id} className="bg-black border border-white/5 rounded overflow-hidden flex flex-col">
                    <div className="h-32 bg-black">
                      {b.cover ? (
                        <img src={b.cover} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-white/10 flex items-center justify-center text-xs opacity-50">
                          No Cover
                        </div>
                      )}
                    </div>
                    <div className="p-3 text-sm flex-1 flex flex-col justify-between">
                      <div className="truncate">{b.name}</div>
                      <div className="flex justify-between mt-2 text-xs">
                        <button
                          onClick={() => setActivePath(b.path)}
                          className="underline hover:text-white"
                        >
                          Select
                        </button>
                        <button onClick={() => removeBuild(b.id)} className="text-red-500 hover:text-red-600">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {tab === "settings" && (
            <div
              className="p-6 max-w-[600px] mx-auto text-sm flex flex-col"
              style={{ height: "calc(100vh - 72px)", overflow: "hidden" }}
            >
              {/* Options */}
              <section className="border border-white/10 rounded p-6 mb-6 flex items-center justify-between">
                <span className="text-base font-medium">EOR Mode</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={EOR}
                    onChange={() => {
                      setEOR(!EOR);
                      localStorage.setItem("EOR", (!EOR).toString());
                    }}
                    className="sr-only"
                  />
                  <div className="w-14 h-8 bg-white/20 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-500 peer-checked:bg-blue-600 transition-colors"></div>
                  <div
                    className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform peer-checked:translate-x-6"
                  ></div>
                </label>
              </section>

              {/* Buttons container with scroll if needed */}
              <section
                className="flex flex-col gap-4 overflow-y-auto"
                style={{ flexGrow: 1, paddingRight: 4 }}
              >
                <a
                  href="https://discord.gg"
                  target="_blank"
                  rel="noreferrer"
                  className="border border-white/10 p-4 rounded text-center hover:bg-white/5 transition"
                >
                  Join Discord
                </a>
                <a
                  href="https://yourshop.com"
                  target="_blank"
                  rel="noreferrer"
                  className="border border-white/10 p-4 rounded text-center hover:bg-white/5 transition"
                >
                  Donate
                </a>
                <div className="border-t border-white/10 pt-4 opacity-60 text-xs text-center select-none">
                  <div>© Nexus Launcher</div>
                  <div>Designed & Built by Nexus Team</div>
                </div>
              </section>

              {/* Logout fixed bottom right */}
              <button
                onClick={logout}
                className="fixed bottom-6 right-6 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded shadow-lg transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-6 right-6 bg-red-600 px-3 py-2 text-sm rounded"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function Nav({ icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full px-3 py-2 flex gap-2 items-center text-sm ${
        active ? "bg-white/10" : "hover:bg-white/5"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function Stat({ title, value }: any) {
  return (
    <div className="border border-white/5 p-4 rounded">
      <div className="text-xs opacity-60">{title}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

function Progress({ title, value }: any) {
  return (
    <div className="border border-white/5 p-4 rounded">
      <div className="text-xs opacity-60 mb-2">{title}</div>
      <div className="h-2 bg-white/10 rounded">
        <div className="h-2 bg-white rounded" style={{ width: `${value}%` }} />
      </div>
      <div className="text-xs mt-1">{value}%</div>
    </div>
  );
}

function News({ img, title, text }: any) {
  return (
    <div className="border border-white/5 rounded overflow-hidden">
      <img src={img} className="h-32 w-full object-cover" alt={title} />
      <div className="p-3">
        <div className="font-medium">{title}</div>
        <div className="text-xs opacity-60">{text}</div>
      </div>
    </div>
  );
}
