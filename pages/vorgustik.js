// pages/vorgustik.js
import Head from "next/head";
import Link from "next/link";
import { useRef, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { fetchData } from "@/lib/sheets";

// ── Füüsika konstnadid ─────────────────────────────────────────────
const REPULSION   = 5000;
const SPRING_K    = 0.022;
const REST_LEN    = 140;
const GRAVITY     = 0.005;
const DAMPING     = 0.85;
const ALPHA_DECAY = 0.993;

// ── Visuaalsed konstandid ──────────────────────────────────────────
const MIN_R = 7;
const MAX_R = 26;
const COLORS = [
  "#4e79a7","#f28e2b","#e15759","#76b7b2",
  "#59a14f","#edc948","#b07aa1","#ff9da7","#9c755f","#bab0ac",
];

// ── Abiülesanded (väljaspool komponenti) ──────────────────────────
function firstTsunft(t) {
  if (!t) return null;
  return t.split(/[,;]/)[0].trim() || null;
}

function buildColorMap(nodes) {
  const guilds = [...new Set(nodes.map(n => firstTsunft(n.tsunft)).filter(Boolean))].sort();
  const m = {};
  guilds.forEach((g, i) => { m[g] = COLORS[i % COLORS.length]; });
  return m;
}

function nodeRadius(n) {
  const deg = (n.students || 0) + (n.teachers || 0);
  return MIN_R + Math.min(deg / 10, 1) * (MAX_R - MIN_R);
}

function worldToScreen(wx, wy, tx, ty, scale, cw, ch) {
  return [cw / 2 + tx + wx * scale, ch / 2 + ty + wy * scale];
}

function screenToWorld(sx, sy, tx, ty, scale, cw, ch) {
  return [(sx - cw / 2 - tx) / scale, (sy - ch / 2 - ty) / scale];
}

function nodeAt(sx, sy, nodes, tx, ty, scale, cw, ch) {
  const [wx, wy] = screenToWorld(sx, sy, tx, ty, scale, cw, ch);
  let best = null, bestD = Infinity;
  for (const n of nodes) {
    const d = Math.hypot(n.x - wx, n.y - wy);
    if (d < nodeRadius(n) && d < bestD) { best = n; bestD = d; }
  }
  return best;
}

function drawScene(canvas, sim, tr, colorMap, hoveredId, searchQ) {
  if (!canvas || !sim) return;
  const ctx = canvas.getContext("2d");
  const { nodes, edges, nodeMap } = sim;
  const { tx, ty, scale } = tr;
  const cw = canvas.width, ch = canvas.height;

  ctx.clearRect(0, 0, cw, ch);

  // Jooned (servad)
  for (const e of edges) {
    const s = nodeMap[e.source];
    const t = nodeMap[e.target];
    if (!s || !t) continue;
    const [sx, sy] = worldToScreen(s.x, s.y, tx, ty, scale, cw, ch);
    const [ex, ey] = worldToScreen(t.x, t.y, tx, ty, scale, cw, ch);
    const d = Math.hypot(ex - sx, ey - sy);
    if (d < 1) continue;

    const isHov = hoveredId && (e.source === hoveredId || e.target === hoveredId);
    const isSearch = searchQ && (
      nodeMap[e.source]?.nimi.toLowerCase().includes(searchQ.toLowerCase()) ||
      nodeMap[e.target]?.nimi.toLowerCase().includes(searchQ.toLowerCase())
    );
    const highlight = isHov || isSearch;

    ctx.globalAlpha = searchQ ? (isSearch ? 0.85 : 0.05) : (isHov ? 0.85 : 0.22);
    ctx.strokeStyle = highlight ? "#3b82f6" : "#94a3b8";
    ctx.lineWidth   = highlight ? 2 : 1;

    const ux = (ex - sx) / d, uy = (ey - sy) / d;
    const tr_ = nodeRadius(t) * scale;
    const arrX = ex - ux * tr_, arrY = ey - uy * tr_;

    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(arrX, arrY);
    ctx.stroke();

    // Nool
    const hl = Math.max(7, 11 * Math.min(scale, 1.5));
    const ang = Math.atan2(ey - sy, ex - sx);
    const ha  = Math.PI / 6;
    ctx.fillStyle = highlight ? "#3b82f6" : "#94a3b8";
    ctx.beginPath();
    ctx.moveTo(arrX, arrY);
    ctx.lineTo(arrX - hl * Math.cos(ang - ha), arrY - hl * Math.sin(ang - ha));
    ctx.lineTo(arrX - hl * Math.cos(ang + ha), arrY - hl * Math.sin(ang + ha));
    ctx.closePath();
    ctx.fill();
  }

  // Sõlmed
  for (const n of nodes) {
    const [sx, sy] = worldToScreen(n.x, n.y, tx, ty, scale, cw, ch);
    const r        = nodeRadius(n) * scale;
    const guild    = firstTsunft(n.tsunft);
    const color    = colorMap[guild] || "#94a3b8";
    const isHov    = n.id === hoveredId;
    const matches  = searchQ && n.nimi.toLowerCase().includes(searchQ.toLowerCase());

    ctx.globalAlpha = searchQ ? (matches ? 1 : 0.08) : 1;

    // Vari valitud sõlmel
    if (isHov) {
      ctx.shadowColor = color;
      ctx.shadowBlur  = 20;
    }

    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fillStyle   = color;
    ctx.fill();
    ctx.strokeStyle = isHov ? "#fff" : "rgba(0,0,0,0.18)";
    ctx.lineWidth   = isHov ? 2.5 : 1;
    ctx.stroke();

    if (isHov) ctx.shadowBlur = 0;

    // Silt (suures vaates ja hoveril)
    if (scale > 1.6 || isHov || matches) {
      ctx.globalAlpha = searchQ ? (matches ? 1 : 0.08) : 1;
      const fSize = Math.max(10, 13 / scale);
      ctx.font      = `600 ${fSize}px 'Segoe UI', sans-serif`;
      ctx.textAlign = "center";
      ctx.fillStyle = "#1e293b";
      ctx.fillText(n.nimi, sx, sy + r + fSize + 2);
    }

    ctx.globalAlpha = 1;
  }
}

function runPhysics(nodes, edges, nodeMap, alpha) {
  // Tõukejõud sõlmede vahel
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const ni = nodes[i], nj = nodes[j];
      const dx = nj.x - ni.x || 0.01;
      const dy = nj.y - ni.y || 0.01;
      const d2 = Math.max(dx * dx + dy * dy, 1);
      const d  = Math.sqrt(d2);
      const f  = alpha * REPULSION / d2;
      ni.vx -= (dx / d) * f; ni.vy -= (dy / d) * f;
      nj.vx += (dx / d) * f; nj.vy += (dy / d) * f;
    }
  }
  // Vedru-jõud mööda servi
  for (const e of edges) {
    const s = nodeMap[e.source], t = nodeMap[e.target];
    if (!s || !t) continue;
    const dx = t.x - s.x, dy = t.y - s.y;
    const d  = Math.hypot(dx, dy) || 0.01;
    const f  = alpha * SPRING_K * (d - REST_LEN);
    s.vx += (dx / d) * f; s.vy += (dy / d) * f;
    t.vx -= (dx / d) * f; t.vy -= (dy / d) * f;
  }
  // Gravitatsioon keskmesse + integreerimine
  for (const n of nodes) {
    if (n.fixed) continue;
    n.vx += alpha * GRAVITY * -n.x;
    n.vy += alpha * GRAVITY * -n.y;
    n.vx *= DAMPING; n.vy *= DAMPING;
    n.x  += n.vx;   n.y  += n.vy;
  }
}

// ── Andmete laadimine (server) ─────────────────────────────────────
export async function getServerSideProps() {
  const allData = await fetchData();
  const valid = allData.filter(r => r.ID && (r.eesnimi || r.perekonnanimi));

  const nodes = valid.map(r => ({
    id:             String(r.ID),
    nimi:           [r.eesnimi, r.perekonnanimi].filter(Boolean).join(" "),
    tsunft:         r.tsunft || "",
    tegutsemiskoht: r.tegutsemiskoht || "",
    students: 0,
    teachers: 0,
  }));

  const nameToId = Object.fromEntries(nodes.map(n => [n.nimi, n.id]));
  const nodeById = Object.fromEntries(nodes.map(n => [n.id, n]));

  const edges = [];
  for (const r of valid) {
    if (!r.opetaja) continue;
    const sid = String(r.ID);
    for (const tname of r.opetaja.split(",").map(s => s.trim()).filter(Boolean)) {
      const tid = nameToId[tname];
      if (tid) edges.push({ source: tid, target: sid });
    }
  }

  // Kraadide annotaatsioon
  for (const e of edges) {
    if (nodeById[e.source]) nodeById[e.source].students++;
    if (nodeById[e.target]) nodeById[e.target].teachers++;
  }

  return { props: { nodes, edges } };
}

// ── Komponent ──────────────────────────────────────────────────────
export default function Vorgustik({ nodes: initNodes, edges }) {
  const canvasRef    = useRef(null);
  const simRef       = useRef(null);
  const trRef        = useRef({ tx: 0, ty: 0, scale: 1 });
  const alphaRef     = useRef(1.0);
  const colorMapRef  = useRef({});
  const hovIdRef     = useRef(null);
  const searchQRef   = useRef("");
  const isDragging   = useRef(false);
  const dragNode     = useRef(null);
  const lastMouse    = useRef({ x: 0, y: 0 });
  const didMove      = useRef(false);

  const [tooltip,  setTooltip]  = useState(null);
  const [searchQ,  setSearchQ]  = useState("");
  const [stats,    setStats]    = useState(null);
  const [legend,   setLegend]   = useState([]);
  const [settled,  setSettled]  = useState(false);

  const router = useRouter();

  // Sünkroniseeri ref-id state-ga
  useEffect(() => { searchQRef.current = searchQ; }, [searchQ]);

  // ── Simuleerimine + joonistamine ──────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width  = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Algsed positsioonid
    const nodes = initNodes.map((n, i) => {
      const angle = (i / initNodes.length) * 2 * Math.PI;
      const r = 80 + (n.students + n.teachers) * 8;
      return {
        ...n,
        x:  r * Math.cos(angle) + (Math.random() - 0.5) * 40,
        y:  r * Math.sin(angle) + (Math.random() - 0.5) * 40,
        vx: 0, vy: 0,
      };
    });
    const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

    colorMapRef.current = buildColorMap(nodes);
    simRef.current = { nodes, edges, nodeMap };
    alphaRef.current = 1.0;
    setSettled(false);

    // Statistika
    const sorted = [...nodes].sort((a, b) => b.students - a.students);
    setStats({
      total:     nodes.length,
      edgeCount: edges.length,
      connected: nodes.filter(n => n.students + n.teachers > 0).length,
      topTeacher: sorted[0]?.students > 0 ? sorted[0] : null,
    });
    setLegend(Object.entries(colorMapRef.current).map(([guild, color]) => ({ guild, color })));

    let rafId;
    const loop = () => {
      const alpha = alphaRef.current;
      if (alpha > 0.003) {
        runPhysics(simRef.current.nodes, simRef.current.edges, simRef.current.nodeMap, alpha);
        alphaRef.current *= ALPHA_DECAY;
      } else if (!settled) {
        setSettled(true);
      }
      drawScene(canvas, simRef.current, trRef.current, colorMapRef.current, hovIdRef.current, searchQRef.current);
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, [initNodes, edges]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Hiiresündmused ────────────────────────────────────────────
  const getPos = useCallback((e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    const sim    = simRef.current;
    if (!canvas || !sim) return;
    const pos = getPos(e);
    const { tx, ty, scale } = trRef.current;

    if (isDragging.current) {
      didMove.current = true;
      if (dragNode.current) {
        const [wx, wy] = screenToWorld(pos.x, pos.y, tx, ty, scale, canvas.width, canvas.height);
        dragNode.current.x  = wx;
        dragNode.current.y  = wy;
        dragNode.current.vx = 0;
        dragNode.current.vy = 0;
        alphaRef.current = Math.max(alphaRef.current, 0.25);
      } else {
        trRef.current = { ...trRef.current, tx: tx + pos.x - lastMouse.current.x, ty: ty + pos.y - lastMouse.current.y };
      }
    }
    lastMouse.current = pos;

    const node = nodeAt(pos.x, pos.y, sim.nodes, tx, ty, scale, canvas.width, canvas.height);
    hovIdRef.current = node?.id ?? null;
    canvas.style.cursor = node ? "pointer" : isDragging.current ? "grabbing" : "grab";

    if (node) {
      setTooltip({ x: pos.x + 16, y: pos.y - 10, node });
    } else {
      setTooltip(null);
    }
  }, [getPos]);

  const handleMouseDown = useCallback((e) => {
    const canvas = canvasRef.current;
    const sim    = simRef.current;
    if (!canvas || !sim) return;
    const pos = getPos(e);
    const { tx, ty, scale } = trRef.current;
    const node = nodeAt(pos.x, pos.y, sim.nodes, tx, ty, scale, canvas.width, canvas.height);
    isDragging.current  = true;
    didMove.current     = false;
    dragNode.current    = node || null;
    if (node) node.fixed = true;
    lastMouse.current   = pos;
  }, [getPos]);

  const handleMouseUp = useCallback(() => {
    if (!didMove.current && dragNode.current) {
      router.push(`/meister/${dragNode.current.id}`);
    }
    if (dragNode.current) dragNode.current.fixed = false;
    isDragging.current = false;
    dragNode.current   = null;
  }, [router]);

  const handleMouseLeave = useCallback(() => {
    hovIdRef.current   = null;
    isDragging.current = false;
    dragNode.current   = null;
    setTooltip(null);
  }, []);

  // Ratas: suurendus kursori all
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onWheel = (e) => {
      e.preventDefault();
      const pos = { x: e.clientX - canvas.getBoundingClientRect().left, y: e.clientY - canvas.getBoundingClientRect().top };
      const { tx, ty, scale } = trRef.current;
      const [wx, wy] = screenToWorld(pos.x, pos.y, tx, ty, scale, canvas.width, canvas.height);
      const newScale = Math.max(0.12, Math.min(8, scale * (e.deltaY < 0 ? 1.1 : 0.91)));
      trRef.current = {
        tx:    pos.x - canvas.width  / 2 - wx * newScale,
        ty:    pos.y - canvas.height / 2 - wy * newScale,
        scale: newScale,
      };
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", onWheel);
  }, []);

  // Tõmbepuuteekraanide tugi (scroll)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let lastTouch = null;
    const onTouchStart = (e) => {
      if (e.touches.length === 1) lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchMove = (e) => {
      e.preventDefault();
      if (e.touches.length === 1 && lastTouch) {
        const dx = e.touches[0].clientX - lastTouch.x;
        const dy = e.touches[0].clientY - lastTouch.y;
        trRef.current = { ...trRef.current, tx: trRef.current.tx + dx, ty: trRef.current.ty + dy };
        lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove",  onTouchMove,  { passive: false });
    return () => {
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove",  onTouchMove);
    };
  }, []);

  const zoomIn    = useCallback(() => { trRef.current = { ...trRef.current, scale: Math.min(8, trRef.current.scale * 1.25) }; }, []);
  const zoomOut   = useCallback(() => { trRef.current = { ...trRef.current, scale: Math.max(0.12, trRef.current.scale / 1.25) }; }, []);
  const resetView = useCallback(() => { trRef.current = { tx: 0, ty: 0, scale: 1 }; }, []);

  return (
    <div style={styles.page}>
      <Head>
        <title>Võrgustik – tsunftimeisrid</title>
      </Head>

      {/* Ülariba */}
      <div style={styles.topBar}>
        <Link href="/search" style={styles.backBtn}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style={{ flexShrink: 0 }}>
            <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
          Nimekiri
        </Link>

        <h1 style={styles.heading}>Meistrite võrgustik</h1>

        <input
          type="search"
          placeholder="Otsi meistrit..."
          value={searchQ}
          onChange={e => setSearchQ(e.target.value)}
          style={styles.searchInput}
        />

        {stats && (
          <span style={styles.statsText}>
            {stats.total} isikut · {stats.edgeCount} seost
            {stats.topTeacher && ` · enim õpilasi: ${stats.topTeacher.nimi} (${stats.topTeacher.students})`}
          </span>
        )}

        <div style={styles.zoomBtns}>
          <button onClick={zoomIn}    style={styles.iconBtn} title="Suurenda">+</button>
          <button onClick={zoomOut}   style={styles.iconBtn} title="Vähenda">−</button>
          <button onClick={resetView} style={styles.iconBtn} title="Algvaade">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M12 5.69l5 4.5V18h-2v-6H9v6H7v-7.81l5-4.5M12 3L2 12h3v9h6v-6h2v6h6v-9h3L12 3z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Canvas ala */}
      <div style={styles.canvasWrap}>
        <canvas
          ref={canvasRef}
          style={styles.canvas}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        />

        {/* Laadimisindikator */}
        {!settled && (
          <div style={styles.settling}>
            <span style={styles.settlingDot} />
            Paigutus arvutamisel…
          </div>
        )}

        {/* Tooltip */}
        {tooltip && (
          <div style={{
            ...styles.tooltip,
            left: Math.min(tooltip.x, (canvasRef.current?.clientWidth ?? 600) - 240),
            top:  tooltip.y,
          }}>
            <div style={styles.tooltipName}>{tooltip.node.nimi}</div>
            {tooltip.node.tsunft && (
              <div style={styles.tooltipField}>{tooltip.node.tsunft}</div>
            )}
            {tooltip.node.tegutsemiskoht && (
              <div style={styles.tooltipMuted}>{tooltip.node.tegutsemiskoht}</div>
            )}
            <div style={styles.tooltipStats}>
              <span>Õpilasi: {tooltip.node.students}</span>
              <span>Õpetajaid: {tooltip.node.teachers}</span>
            </div>
            <div style={styles.tooltipHint}>Kliki, et avada profiil →</div>
          </div>
        )}

        {/* Värvide legend (paremas nurgas) */}
        {legend.length > 0 && (
          <div style={styles.legend}>
            <div style={styles.legendTitle}>Tsunft</div>
            {legend.map(({ guild, color }) => (
              <div key={guild} style={styles.legendRow}>
                <span style={{ ...styles.legendDot, background: color }} />
                <span style={styles.legendLabel}>{guild}</span>
              </div>
            ))}
            <div style={{ ...styles.legendRow, marginTop: 4, paddingTop: 4, borderTop: "1px solid #e2e8f0" }}>
              <span style={{ ...styles.legendDot, background: "#94a3b8" }} />
              <span style={{ ...styles.legendLabel, color: "#94a3b8" }}>määramata</span>
            </div>
          </div>
        )}

        {/* Juhend (vasakus nurgas) */}
        <div style={styles.guide}>
          <div style={styles.guideTitle}>Juhend</div>
          <div style={styles.guideRow}>
            <span style={styles.guideArrow}>→</span> nool = õpetaja–õpilane
          </div>
          <div style={styles.guideRow}>
            <span style={styles.guideDotBig} /> suurem = rohkem seoseid
          </div>
          <div style={styles.guideRow}>
            <span style={{ fontSize: 11 }}>🖱</span> keri = zoom, lohista = nihutu
          </div>
          <div style={styles.guideRow}>
            <span style={{ fontSize: 11 }}>👆</span> kliki sõlmel = profiil
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Inline stiilid ─────────────────────────────────────────────────
const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    height: "calc(100vh - 60px)",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    background: "#f8fafc",
  },
  topBar: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 16px",
    background: "#fff",
    borderBottom: "1px solid #e2e8f0",
    flexWrap: "wrap",
    flexShrink: 0,
  },
  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "6px 12px",
    background: "#eef4ff",
    color: "#1a237e",
    border: "1px solid #c9d6ff",
    borderRadius: 8,
    fontWeight: 700,
    fontSize: "0.88rem",
    textDecoration: "none",
    whiteSpace: "nowrap",
  },
  heading: {
    margin: 0,
    fontSize: "1rem",
    fontWeight: 700,
    color: "#1e293b",
    whiteSpace: "nowrap",
  },
  searchInput: {
    padding: "6px 10px",
    border: "1px solid #cbd5e0",
    borderRadius: 6,
    fontSize: "0.88rem",
    width: 200,
    outline: "none",
  },
  statsText: {
    fontSize: "0.8rem",
    color: "#64748b",
    flex: 1,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  zoomBtns: {
    display: "flex",
    gap: 4,
    marginLeft: "auto",
  },
  iconBtn: {
    width: 32,
    height: 32,
    border: "1px solid #cbd5e0",
    borderRadius: 6,
    background: "#fff",
    cursor: "pointer",
    fontSize: "1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#374151",
  },
  canvasWrap: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },
  canvas: {
    width: "100%",
    height: "100%",
    display: "block",
    cursor: "grab",
  },
  settling: {
    position: "absolute",
    top: 14,
    left: "50%",
    transform: "translateX(-50%)",
    background: "rgba(255,255,255,0.92)",
    border: "1px solid #e2e8f0",
    borderRadius: 20,
    padding: "5px 14px",
    fontSize: "0.78rem",
    color: "#64748b",
    display: "flex",
    alignItems: "center",
    gap: 8,
    pointerEvents: "none",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  settlingDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#3b82f6",
    animation: "pulse 1s infinite",
  },
  tooltip: {
    position: "absolute",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    padding: "10px 14px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
    pointerEvents: "none",
    zIndex: 20,
    minWidth: 180,
    maxWidth: 240,
  },
  tooltipName: {
    fontWeight: 700,
    color: "#1e293b",
    fontSize: "0.92rem",
    marginBottom: 4,
  },
  tooltipField: {
    color: "#475569",
    fontSize: "0.82rem",
    marginBottom: 2,
  },
  tooltipMuted: {
    color: "#94a3b8",
    fontSize: "0.78rem",
    marginBottom: 6,
  },
  tooltipStats: {
    display: "flex",
    gap: 12,
    fontSize: "0.8rem",
    color: "#475569",
    borderTop: "1px solid #f1f5f9",
    paddingTop: 6,
    marginTop: 4,
  },
  tooltipHint: {
    fontSize: "0.72rem",
    color: "#94a3b8",
    marginTop: 4,
  },
  legend: {
    position: "absolute",
    bottom: 16,
    right: 16,
    background: "rgba(255,255,255,0.96)",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    padding: "10px 14px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    fontSize: "0.78rem",
    maxHeight: 220,
    overflowY: "auto",
    minWidth: 130,
  },
  legendTitle: {
    fontWeight: 700,
    color: "#475569",
    marginBottom: 7,
    fontSize: "0.8rem",
  },
  legendRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    flexShrink: 0,
  },
  legendLabel: {
    color: "#1e293b",
  },
  guide: {
    position: "absolute",
    bottom: 16,
    left: 16,
    background: "rgba(255,255,255,0.96)",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    padding: "10px 14px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    fontSize: "0.78rem",
    color: "#475569",
  },
  guideTitle: {
    fontWeight: 700,
    color: "#475569",
    marginBottom: 6,
    fontSize: "0.8rem",
  },
  guideRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginBottom: 3,
  },
  guideArrow: {
    color: "#3b82f6",
    fontWeight: 700,
    fontSize: "0.9rem",
  },
  guideDotBig: {
    display: "inline-block",
    width: 12,
    height: 12,
    borderRadius: "50%",
    background: "#64748b",
    flexShrink: 0,
  },
};
