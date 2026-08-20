import { useState, useEffect, useRef, useCallback } from "react";
import rccLogo from "@/assets/Content-Creator-Project.png";
import rccMascot from "@/assets/image-3.png";
import dataPolicyCertificate from "@/assets/Certificate.png";

/* ─────────────────────────────────────────
   Programming Technology Background Canvas
───────────────────────────────────────── */
function TechBackgroundCanvas({ opacity = 1 }: { opacity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animId: number;
    let frame = 0;

    // Programming tokens — mix of syntax, binary, operators, keywords
    const CODE_TOKENS = [
      "function","const","=>","return","async","await","import","export",
      "class","extends","interface","type","null","void","true","false",
      "if","else","for","while","try","catch","new","this","super",
      "SELECT","FROM","WHERE","JOIN","INSERT","UPDATE","DELETE","INDEX",
      "API","REST","JSON","HTTP","SSH","TCP","UDP","DNS","SSL","JWT",
      "0x1F","0xFF","0xA0","0x00","NaN","Inf","EOF","ERR",
      "01","10","11","00","1","0","{}","[]","()","</>","<!--","-->",
      "git","npm","pip","sudo","bash","curl","grep","chmod","docker",
      "#!","//","/*","*/","===","!==","&&","||","??","?.","...",
    ];

    const COL_W = 22;
    type Col = {
      x: number;
      y: number;        // current head row (in px)
      speed: number;
      length: number;   // trail length in chars
      tokens: string[]; // current displayed tokens in trail
      tickNext: number; // frame to advance on
      isOrange: boolean;
    };
    let cols: Col[] = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initCols();
    };

    const initCols = () => {
      const count = Math.ceil(canvas.width / COL_W);
      cols = Array.from({ length: count }, (_, i) => {
        const length = 6 + Math.floor(Math.random() * 14);
        return {
          x: i * COL_W,
          y: Math.random() * -canvas.height,
          speed: 18 + Math.random() * 28,
          length,
          tokens: Array.from({ length }, () => CODE_TOKENS[Math.floor(Math.random() * CODE_TOKENS.length)]),
          tickNext: Math.floor(Math.random() * 40),
          isOrange: Math.random() < 0.12,
        };
      });
    };

    resize();
    window.addEventListener("resize", resize);

    // Circuit board horizontal traces (static lines rendered each frame)
    type Trace = { y: number; x1: number; x2: number; alpha: number };
    const traces: Trace[] = Array.from({ length: 18 }, () => ({
      y: Math.random() * canvas.height,
      x1: Math.random() * canvas.width * 0.4,
      x2: canvas.width * (0.5 + Math.random() * 0.5),
      alpha: 0.03 + Math.random() * 0.06,
    }));

    // Scanline Y position
    let scanY = 0;

    const draw = () => {
      frame++;
      const w = canvas.width;
      const h = canvas.height;
      if (!w || !h) { animId = requestAnimationFrame(draw); return; }
      scanY = (scanY + 1.2) % h;

      // Fade background — low alpha = longer trail glow
      ctx.fillStyle = "rgba(6,14,32,0.14)";
      ctx.fillRect(0, 0, w, h);

      // Deep ambient glows — ocean blue left, orange-tint right
      const g1 = ctx.createRadialGradient(w * 0.08, h * 0.5, 0, w * 0.08, h * 0.5, w * 0.5);
      g1.addColorStop(0, "rgba(14,165,233,0.07)");
      g1.addColorStop(1, "rgba(14,165,233,0)");
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, w, h);

      const g2 = ctx.createRadialGradient(w * 0.92, h * 0.3, 0, w * 0.92, h * 0.3, w * 0.38);
      g2.addColorStop(0, "rgba(234,88,12,0.06)");
      g2.addColorStop(1, "rgba(234,88,12,0)");
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, w, h);

      // Circuit board traces
      ctx.save();
      ctx.lineWidth = 1;
      traces.forEach((tr) => {
        ctx.globalAlpha = tr.alpha;
        ctx.strokeStyle = "#0ea5e9";
        ctx.beginPath();
        ctx.moveTo(tr.x1, tr.y);
        // L-bend
        const mid = tr.x1 + (tr.x2 - tr.x1) * 0.45;
        ctx.lineTo(mid, tr.y);
        ctx.lineTo(mid, tr.y + 18);
        ctx.lineTo(tr.x2, tr.y + 18);
        ctx.stroke();
        // junction dot
        ctx.globalAlpha = tr.alpha * 1.8;
        ctx.fillStyle = "#0ea5e9";
        ctx.beginPath();
        ctx.arc(mid, tr.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // Code rain columns
      ctx.font = `bold 11px 'JetBrains Mono', monospace`;
      cols.forEach((col) => {
        if (frame >= col.tickNext) {
          // Advance head
          col.y += col.speed * 0.5;
          col.tickNext = frame + Math.floor(2 + Math.random() * 4);
          // Shuffle a random token in the trail
          const ri = Math.floor(Math.random() * col.tokens.length);
          col.tokens[ri] = CODE_TOKENS[Math.floor(Math.random() * CODE_TOKENS.length)];
          // Reset if off screen
          if (col.y - col.length * 18 > h) {
            col.y = -Math.random() * h * 0.5;
            col.speed = 18 + Math.random() * 28;
            col.length = 6 + Math.floor(Math.random() * 14);
            col.isOrange = Math.random() < 0.12;
            col.tokens = Array.from({ length: col.length }, () =>
              CODE_TOKENS[Math.floor(Math.random() * CODE_TOKENS.length)]
            );
          }
        }

        // Draw trail — fade from head downward
        for (let t = 0; t < col.tokens.length; t++) {
          const charY = col.y - t * 18;
          if (charY < 0 || charY > h) continue;
          const fade = 1 - t / col.tokens.length;

          if (t === 0) {
            // Bright head character
            ctx.fillStyle = col.isOrange
              ? `rgba(251,146,60,${0.95})`
              : `rgba(186,230,253,${0.98})`;
            // Glow behind head
            ctx.shadowColor = col.isOrange ? "#ea580c" : "#38bdf8";
            ctx.shadowBlur = 10;
          } else if (t === 1) {
            ctx.fillStyle = col.isOrange
              ? `rgba(234,88,12,${fade * 0.85})`
              : `rgba(56,189,248,${fade * 0.85})`;
            ctx.shadowBlur = 4;
            ctx.shadowColor = col.isOrange ? "#ea580c" : "#0ea5e9";
          } else {
            ctx.fillStyle = col.isOrange
              ? `rgba(194,68,15,${fade * 0.5})`
              : `rgba(14,165,233,${fade * 0.55})`;
            ctx.shadowBlur = 0;
          }

          ctx.fillText(col.tokens[t], col.x + 1, charY);
          ctx.shadowBlur = 0;
        }
      });

      // Horizontal scan line
      const scanGrad = ctx.createLinearGradient(0, scanY - 2, 0, scanY + 2);
      scanGrad.addColorStop(0, "rgba(14,165,233,0)");
      scanGrad.addColorStop(0.5, "rgba(14,165,233,0.06)");
      scanGrad.addColorStop(1, "rgba(14,165,233,0)");
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY - 2, w, 4);

      // Vignette overlay — darken edges so center stays readable
      const vign = ctx.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, h * 0.85);
      vign.addColorStop(0, "rgba(6,14,32,0)");
      vign.addColorStop(1, "rgba(6,14,32,0.55)");
      ctx.fillStyle = vign;
      ctx.fillRect(0, 0, w, h);

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity }}
    />
  );
}

/* ─────────────────────────────────────────
   NavBar
───────────────────────────────────────── */
function NavBar({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);
  const links = [
    { label: "Home", href: "#home" },
    { label: "Services", href: "#services" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ];
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        margin: 0,
        height: "55px",
        boxShadow: "none",
        filter: "none",
        position: "fixed",
        background: scrolled ? "rgba(6,14,32,0.97)" : "rgba(6,14,32,0.55)",
        backdropFilter: "blur(18px)",
        borderBottom: scrolled
          ? "1px solid rgba(26,61,140,0.45)"
          : "1px solid rgba(26,61,140,0.15)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <button
          onClick={() => onNavigate("home")}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
        >
          <img
            src={rccLogo}
            alt="RCC Colab Solutions Inc"
            style={{ height: "42px", width: "auto", display: "block", filter: "brightness(0) invert(1)" }}
          />
        </button>
        <div className="hidden md:flex items-center gap-8">
          {links.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              onClick={() => onNavigate("home")}
              className="text-sm font-medium tracking-wider transition-all duration-300 hover:text-orange-400"
              style={{ fontFamily: "Inter, sans-serif", color: "#cbd5e1" }}
            >
              {label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={() => onNavigate("home")}
            className="px-5 py-2 text-sm font-semibold tracking-wider btn-orange"
            style={{ fontFamily: "Rajdhani, sans-serif", letterSpacing: "0.1em" }}
          >
            GET A QUOTE
          </a>
        </div>
        <button
          className="md:hidden"
          style={{ color: "#ea580c" }}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>
      {menuOpen && (
        <div
          className="md:hidden px-6 pb-6 flex flex-col gap-4"
          style={{ background: "rgba(6,14,32,0.99)", borderBottom: "1px solid rgba(26,61,140,0.3)" }}
        >
          {links.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              onClick={() => { setMenuOpen(false); onNavigate("home"); }}
              className="text-sm font-medium transition-colors hover:text-orange-400"
              style={{ fontFamily: "Inter, sans-serif", color: "#7ba7c9" }}
            >
              {label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}

/* ─────────────────────────────────────────
   Hero Section
───────────────────────────────────────── */
function HeroSection() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: "#060e20" }}
    >
      <TechBackgroundCanvas opacity={0.92} />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, rgba(6,14,32,0.35) 0%, rgba(6,14,32,0.82) 72%)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, #060e20)" }}
      />
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-xs font-medium tracking-widest"
          style={{
            fontFamily: "JetBrains Mono, monospace",
            background: "rgba(234, 88, 12, 0.12)",
            border: "1px solid rgba(234, 88, 12, 0.38)",
            color: "#fb923c",
          }}
        >
          <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse inline-block" />
          TECHNOLOGY · COLLABORATION · INNOVATION
        </div>
        <h1
          className="font-black mb-5 leading-none"
          style={{
            fontFamily: "Rajdhani, sans-serif",
            fontSize: "clamp(2.4rem, 7vw, 6rem)",
            color: "#ffffff",
            letterSpacing: "0.04em",
            textShadow: "0 0 60px rgba(26,61,140,0.5)",
          }}
        >
          RCC COLAB <span className="gradient-text">SOLUTIONS INC</span>
        </h1>
        <div className="neon-line-orange max-w-xs mx-auto mb-6" />
        <p
          className="text-base md:text-lg max-w-2xl mx-auto mb-6 font-light leading-relaxed"
          style={{ fontFamily: "Inter, sans-serif", color: "#94a3b8" }}
        >
          End-to-end technology services engineered to solve complex challenges
          and unlock new growth for enterprises, SMEs, and government agencies.
        </p>
        <div
          className="inline-flex items-center gap-2 px-4 py-2 mb-10 text-sm"
          style={{
            fontFamily: "JetBrains Mono, monospace",
            color: "#fb923c",
            background: "rgba(234, 88, 12, 0.08)",
            border: "1px solid rgba(234, 88, 12, 0.25)",
            borderRadius: "3px",
          }}
        >
          📞 +632 8651 6572
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="#services" className="px-8 py-4 font-bold tracking-wider btn-orange" style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "15px", letterSpacing: "0.12em" }}>
            EXPLORE SERVICES
          </a>
          <a href="#contact" className="px-8 py-4 font-bold tracking-wider btn-outline-navy" style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "15px", letterSpacing: "0.12em" }}>
            CONTACT US
          </a>
        </div>
        <div className="mt-16 flex justify-center">
          <div className="text-center">
            <div className="text-3xl font-black gradient-text" style={{ fontFamily: "Rajdhani, sans-serif" }}>24/7</div>
            <div className="text-xs mt-1 tracking-widest" style={{ fontFamily: "JetBrains Mono, monospace", color: "#7ba7c9" }}>SUPPORT</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   Services Data
───────────────────────────────────────── */
const SERVICES = [
  { icon: "🔄", title: "Application Modernization", slug: "app-modernization", hasDetail: true },
  { icon: "💻", title: "Custom Software Development", slug: "software-development", hasDetail: true },
  { icon: "👥", title: "Staff Augmentation", slug: "staff-augmentation", hasDetail: true },
  { icon: "🧭", title: "IT Strategy & Consulting", slug: "it-strategy", hasDetail: true },
  { icon: "🤖", title: "Robotic Process Automation (RPA)", slug: "rpa", hasDetail: true },
  { icon: "☁️", title: "Cloud Solutions & Migration", slug: "cloud-solutions", hasDetail: true },
  { icon: "🔗", title: "System Integration", slug: "system-integration", hasDetail: true },
  { icon: "🛡️", title: "Managed IT Services", slug: "managed-it", hasDetail: true },
  { icon: "✅", title: "QA & Software Testing", slug: "qa-testing", hasDetail: true },
  { icon: "🖥️", title: "POS & Kiosk Software Systems", slug: "pos-kiosk", hasDetail: true },
  { icon: "📊", title: "Data Analytics & Business Intelligence", slug: "data-analytics", hasDetail: true },
];

const SERVICE_DESCS: Record<string, string> = {
  "Application Modernization": "Migrate legacy systems into scalable, cloud-native architectures that accelerate delivery and reduce technical debt.",
  "Custom Software Development": "Bespoke web, mobile, and enterprise software designed around your exact workflows and business goals.",
  "Staff Augmentation": "Extend your team with vetted senior engineers, QA specialists, and solution architects on demand.",
  "IT Strategy & Consulting": "Strategic advisory that aligns your technology roadmap with your long-term business objectives.",
  "Robotic Process Automation (RPA)": "Automate repetitive tasks to free your team for higher-value work and cut operational costs.",
  "Cloud Solutions & Migration": "Seamless cloud strategy, migration, and optimization across AWS, Azure, and Google Cloud.",
  "System Integration": "Connect your applications, APIs, and data sources into a unified ecosystem that eliminates silos.",
  "Managed IT Services": "Proactive monitoring, maintenance, and support keeping your infrastructure at peak performance 24/7.",
  "QA & Software Testing": "Comprehensive manual and automated testing that ensures quality, reliability, and performance at every release.",
  "POS & Kiosk Software Systems": "Reliable point-of-sale and self-service kiosk solutions for retail, hospitality, and service industries.",
  "Data Analytics & Business Intelligence": "Turn raw data into actionable insights with dashboards and BI tools that drive smarter decisions.",
};

/* ─────────────────────────────────────────
   Services Section
───────────────────────────────────────── */
function ServicesSection({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [active, setActive] = useState<number | null>(null);
  return (
    <section id="services" className="relative py-28 overflow-hidden" style={{ background: "#060e20" }}>
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-6">
          <div className="inline-block px-3 py-1 mb-4 text-xs tracking-widest tag-orange" style={{ fontFamily: "JetBrains Mono, monospace" }}>
            WHAT WE OFFER
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-3" style={{ fontFamily: "Rajdhani, sans-serif", color: "#e8f0f8", letterSpacing: "0.05em" }}>
            OUR <span className="gradient-text">SERVICES</span> INCLUDE
          </h2>
          <p className="max-w-2xl mx-auto text-sm md:text-base leading-relaxed mt-4" style={{ fontFamily: "Inter, sans-serif", color: "#7ba7c9", lineHeight: 1.75 }}>
            End-to-end technology services engineered to solve complex challenges and unlock new growth.
          </p>
          <div className="neon-line-orange max-w-xs mx-auto mt-6" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-14">
          {SERVICES.map((svc, i) => (
            <div
              key={i}
              className="card-navy rounded p-6 relative overflow-hidden"
              style={{ cursor: "pointer" }}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
            >
              <div
                className="absolute top-0 left-0 right-0 h-0.5 transition-all duration-500"
                style={{
                  background: active === i
                    ? "linear-gradient(90deg, transparent, #ea580c, transparent)"
                    : "transparent",
                }}
              />
              <div className="flex items-start gap-4">
                <div
                  className="text-2xl w-12 h-12 rounded flex items-center justify-center flex-shrink-0 transition-all duration-300"
                  style={{
                    background: active === i ? "rgba(234,88,12,0.18)" : "rgba(26,61,140,0.25)",
                    border: active === i ? "1px solid rgba(234,88,12,0.4)" : "1px solid rgba(26,61,140,0.35)",
                  }}
                >
                  {svc.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className="font-bold mb-2 leading-tight transition-colors duration-300"
                    style={{
                      fontFamily: "Rajdhani, sans-serif",
                      fontSize: "1rem",
                      letterSpacing: "0.04em",
                      color: active === i ? "#fb923c" : "#e8f0f8",
                    }}
                  >
                    {svc.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ fontFamily: "Inter, sans-serif", color: "#94a3b8", lineHeight: 1.65 }}>
                    {SERVICE_DESCS[svc.title]}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(26,61,140,0.2)" }}>
                <button
                  onClick={() => onNavigate(svc.slug)}
                  className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider transition-all duration-300"
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    color: active === i ? "#ea580c" : "#7ba7c9",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  LEARN MORE
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   CTA Banner
───────────────────────────────────────── */
function CTABanner() {
  return (
    <section className="relative py-20 overflow-hidden" style={{ background: "#040a1c" }}>
      <div className="absolute inset-0">
        <TechBackgroundCanvas opacity={0.22} />
      </div>
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(135deg, rgba(6,14,32,0.85) 0%, rgba(26,61,140,0.5) 50%, rgba(6,14,32,0.85) 100%)" }}
      />
      <div className="absolute inset-0 dot-pattern opacity-15" />
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <div className="text-xs tracking-widest mb-4" style={{ fontFamily: "JetBrains Mono, monospace", color: "#ea580c" }}>
          READY TO START?
        </div>
        <h2 className="text-3xl md:text-5xl font-black mb-5" style={{ fontFamily: "Rajdhani, sans-serif", color: "#e8f0f8", letterSpacing: "0.04em" }}>
          READY TO SIMPLIFY YOUR <span className="gradient-text">IT COMPLEXITY?</span>
        </h2>
        <p className="text-base mb-8" style={{ fontFamily: "Inter, sans-serif", color: "#7ba7c9", lineHeight: 1.75 }}>
          {"Let's start a conversation. Our engineers and consultants are standing by to design the right solution."}
        </p>
        <a href="#contact" className="inline-block px-10 py-4 font-bold tracking-wider btn-orange" style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "15px", letterSpacing: "0.14em" }}>
          GET IN TOUCH
        </a>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   About
───────────────────────────────────────── */
function AboutSection() {
  return (
    <section id="about" className="relative py-28 overflow-hidden" style={{ background: "#060e20" }}>
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-16">
          <div>
            <div className="inline-block px-3 py-1 mb-6 text-xs tracking-widest tag-navy" style={{ fontFamily: "JetBrains Mono, monospace" }}>
              WHO WE ARE
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: "Rajdhani, sans-serif", color: "#e8f0f8", lineHeight: 1.1, letterSpacing: "0.03em" }}>
              YOUR TRUSTED<br /><span className="gradient-text">TECH PARTNER</span>
            </h2>
            <p className="text-base leading-relaxed mb-5" style={{ fontFamily: "Inter, sans-serif", color: "#7ba7c9", lineHeight: 1.8 }}>
              RCC Colab Solutions Inc is a full-spectrum technology company based in Makati City, Philippines. We deliver integrated IT services to enterprises, SMEs, and government agencies.
            </p>
            <p className="text-base leading-relaxed mb-10" style={{ fontFamily: "Inter, sans-serif", color: "#94a3b8", lineHeight: 1.8 }}>
              From cloud migrations to custom software and managed services — we own every layer so you do not have to juggle multiple vendors.
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[{ val: "50+", label: "Projects" }, { val: "5+", label: "Yrs Experience" }, { val: "100%", label: "Retention" }].map(({ val, label }) => (
                <div key={label} className="p-4 rounded" style={{ background: "rgba(10,28,70,0.6)", border: "1px solid rgba(26,61,140,0.3)" }}>
                  <div className="text-2xl font-black gradient-text mb-1" style={{ fontFamily: "Rajdhani, sans-serif" }}>{val}</div>
                  <div className="text-xs" style={{ fontFamily: "JetBrains Mono, monospace", color: "#7ba7c9" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="rounded overflow-hidden" style={{ border: "1px solid rgba(26,61,140,0.4)" }}>
              <img
                src="https://images.unsplash.com/photo-1758073519996-6d3c63b4922c?w=700&h=500&fit=crop&auto=format"
                alt="Abstract blue glowing technology network"
                className="w-full h-80 object-cover"
                style={{ filter: "brightness(0.65) saturate(1.3)" }}
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: "🔬", title: "Innovation", desc: "We continuously research and adopt emerging technologies to keep clients ahead." },
            { icon: "🤝", title: "Collaboration", desc: "We embed with your team — transparent, responsive, and aligned to your goals." },
            { icon: "🛡️", title: "Reliability", desc: "Enterprise-grade solutions designed for uptime, security, and long-term stability." },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="p-6 rounded card-navy">
              <div className="text-3xl mb-4">{icon}</div>
              <h4 className="text-lg font-bold mb-2" style={{ fontFamily: "Rajdhani, sans-serif", color: "#e8f0f8", letterSpacing: "0.06em" }}>{title.toUpperCase()}</h4>
              <p className="text-sm leading-relaxed" style={{ fontFamily: "Inter, sans-serif", color: "#94a3b8", lineHeight: 1.7 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   Contact
───────────────────────────────────────── */
function ContactSection() {
  const [form, setForm] = useState({ name: "", email: "", service: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Inquiry: ${form.service || "General"} — ${form.name}`);
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nService: ${form.service}\n\nMessage:\n${form.message}`
    );
    window.location.href = `mailto:info@rcccolabsolutions.com?subject=${subject}&body=${body}`;
    setSent(true);
    setTimeout(() => setSent(false), 5000);
    setForm({ name: "", email: "", service: "", message: "" });
  };

  const inputBase = {
    fontFamily: "Inter, sans-serif",
    background: "rgba(10,28,70,0.4)",
    border: "1px solid rgba(26,61,140,0.35)",
    color: "#e8f0f8",
  };
  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = "rgba(234,88,12,0.6)";
    e.target.style.outline = "none";
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = "rgba(26,61,140,0.35)";
  };

  return (
    <section id="contact" className="relative py-28 overflow-hidden" style={{ background: "#060e20" }}>
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-block px-3 py-1 mb-4 text-xs tracking-widest tag-orange" style={{ fontFamily: "JetBrains Mono, monospace" }}>GET IN TOUCH</div>
          <h2 className="text-4xl md:text-5xl font-black" style={{ fontFamily: "Rajdhani, sans-serif", color: "#e8f0f8", letterSpacing: "0.05em" }}>
            CONTACT <span className="gradient-text">US</span>
          </h2>
          <div className="neon-line-orange max-w-xs mx-auto mt-6" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div className="space-y-4 mb-8">
              {[
                { icon: "📍", label: "ADDRESS", value: "7/F Ascott Makati Glorietta 4", sub: "Ayala Center San Lorenzo, Makati City, Philippines", isHours: false },
                { icon: "📞", label: "PHONE", value: "+632 8651 6572", sub: "Mon – Fri: 8:00 AM – 7:00 PM", isHours: false },
                { icon: "✉️", label: "EMAIL", value: "info@rcccolabsolutions.com", sub: "We reply within 24 hours", isHours: false },
                { icon: "🌐", label: "WEBSITE", value: "rcccolabsolutions.com", sub: "Visit our online presence", isHours: false },
                { icon: "🕐", label: "OFFICE HOURS", value: "Mon – Fri", sub: "8:00 AM – 7:00 PM · Managed IT support 24/7", isHours: true },
              ].map(({ icon, label, value, sub, isHours }) => (
                <div key={label} className="flex gap-4 p-4 rounded" style={{ background: "rgba(10,28,70,0.45)", border: "1px solid rgba(26,61,140,0.3)" }}>
                  <div className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0 text-lg" style={{ background: "rgba(234,88,12,0.1)" }}>{icon}</div>
                  <div>
                    <div className="text-xs tracking-widest mb-0.5" style={{ fontFamily: "JetBrains Mono, monospace", color: "#ea580c" }}>{label}</div>
                    {isHours ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="font-bold text-sm"
                          style={{ fontFamily: "Rajdhani, sans-serif", color: "#0ea5e9", letterSpacing: "0.06em" }}
                        >
                          {value}
                        </span>
                        <span
                          className="font-bold text-sm"
                          style={{
                            fontFamily: "Rajdhani, sans-serif",
                            background: "linear-gradient(90deg, #ea580c, #fb923c)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                            letterSpacing: "0.06em",
                          }}
                        >
                          8:00 AM – 7:00 PM
                        </span>
                      </div>
                    ) : (
                      <div className="font-semibold text-sm" style={{ fontFamily: "Inter, sans-serif", color: "#e8f0f8" }}>{value}</div>
                    )}
                    <div className="text-xs mt-0.5" style={{ fontFamily: "Inter, sans-serif", color: isHours ? "#7dd3fc" : "#94a3b8" }}>{sub}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded overflow-hidden" style={{ border: "1px solid rgba(26,61,140,0.4)" }}>
              <div className="px-4 py-2 flex items-center gap-2" style={{ background: "rgba(10,28,70,0.6)", borderBottom: "1px solid rgba(26,61,140,0.3)" }}>
                <span style={{ color: "#ea580c", fontSize: "14px" }}>📍</span>
                <span className="text-xs tracking-wider" style={{ fontFamily: "JetBrains Mono, monospace", color: "#7ba7c9" }}>
                  ASCOTT MAKATI · GLORIETTA 4, AYALA CENTER
                </span>
              </div>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3861.7983!2d121.0245!3d14.5513!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c90264d70a77%3A0xb4e7b9e5b6c8a3f0!2sAscott%20Makati!5e0!3m2!1sen!2sph!4v1700000000000!5m2!1sen!2sph"
                width="100%"
                height="320"
                style={{ border: 0, display: "block" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="RCC Colab Solutions Inc — 7/F Ascott Makati Glorietta 4, Ayala Center San Lorenzo, Makati City"
              />
              <div className="px-4 py-2 flex items-center justify-between" style={{ background: "rgba(10,28,70,0.4)" }}>
                <span className="text-xs" style={{ fontFamily: "Inter, sans-serif", color: "#94a3b8" }}>Makati City, 1224 Metro Manila, Philippines</span>
                <a href="https://maps.google.com/?q=Ascott+Makati+Glorietta+4" target="_blank" rel="noopener noreferrer" className="text-xs font-medium transition-colors hover:text-orange-400" style={{ fontFamily: "JetBrains Mono, monospace", color: "#7ba7c9" }}>OPEN IN MAPS →</a>
              </div>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="p-8 rounded" style={{ background: "rgba(5,14,31,0.9)", border: "1px solid rgba(26,61,140,0.4)" }}>
            <h3 className="text-xl font-bold mb-6" style={{ fontFamily: "Rajdhani, sans-serif", color: "#e8f0f8", letterSpacing: "0.06em" }}>
              SEND US A <span className="gradient-text">MESSAGE</span>
            </h3>
            {sent && (
              <div className="mb-6 p-3 rounded text-sm text-center" style={{ fontFamily: "JetBrains Mono, monospace", color: "#fb923c", background: "rgba(234,88,12,0.08)", border: "1px solid rgba(234,88,12,0.35)" }}>
                ✓ OPENING EMAIL TO info@rcccolabsolutions.com — SEND TO REACH US
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {[{ key: "name", placeholder: "Your Name", label: "FULL NAME" }, { key: "email", placeholder: "you@company.com", label: "EMAIL ADDRESS" }].map(({ key, placeholder, label }) => (
                <div key={key}>
                  <label className="block text-xs mb-2 tracking-widest" style={{ fontFamily: "JetBrains Mono, monospace", color: "#7ba7c9" }}>{label}</label>
                  <input type={key === "email" ? "email" : "text"} placeholder={placeholder} value={form[key as keyof typeof form]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} required className="w-full px-4 py-3 text-sm rounded" style={inputBase} onFocus={onFocus} onBlur={onBlur} />
                </div>
              ))}
            </div>
            <div className="mb-4">
              <label className="block text-xs mb-2 tracking-widest" style={{ fontFamily: "JetBrains Mono, monospace", color: "#7ba7c9" }}>SERVICE INTEREST</label>
              <select value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} required className="w-full px-4 py-3 text-sm rounded" style={{ ...inputBase, color: form.service ? "#e8f0f8" : "#94a3b8" }} onFocus={onFocus} onBlur={onBlur}>
                <option value="" disabled>Select a service...</option>
                {SERVICES.map((s) => <option key={s.title} value={s.title}>{s.title}</option>)}
                <option value="other">General Inquiry</option>
              </select>
            </div>
            <div className="mb-6">
              <label className="block text-xs mb-2 tracking-widest" style={{ fontFamily: "JetBrains Mono, monospace", color: "#7ba7c9" }}>MESSAGE</label>
              <textarea placeholder="Describe your project, challenge, or question..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required rows={5} className="w-full px-4 py-3 text-sm rounded resize-none" style={inputBase} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <button type="submit" className="w-full py-4 font-bold tracking-wider btn-orange" style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "15px", letterSpacing: "0.14em" }}>
              SEND MESSAGE
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   Footer
───────────────────────────────────────── */
function Footer({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <footer className="relative py-10" style={{ background: "#03091a", borderTop: "1px solid rgba(26,61,140,0.35)" }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <button onClick={() => onNavigate("home")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            <img src={rccLogo} alt="RCC Colab Solutions Inc" style={{ height: "38px", width: "auto", display: "block", filter: "brightness(0) invert(1)" }} />
          </button>
          <div className="text-xs text-center" style={{ fontFamily: "JetBrains Mono, monospace", color: "#1e3a5f" }}>
            © RCC COLAB SOLUTIONS INC · +632 8651 6572
          </div>
          <div className="flex gap-6">
            {["Home", "Services", "About", "Contact"].map((link) => (
              <a key={link} href={`#${link.toLowerCase()}`} onClick={() => onNavigate("home")} className="text-xs tracking-wider transition-colors duration-200 hover:text-orange-400" style={{ fontFamily: "JetBrains Mono, monospace", color: "#1e3a5f" }}>
                {link.toUpperCase()}
              </a>
            ))}
            <a
              href={dataPolicyCertificate}
              target="_blank"
              rel="noreferrer"
              className="text-xs tracking-wider transition-colors duration-200 hover:text-orange-400"
              style={{ fontFamily: "JetBrains Mono, monospace", color: "#1e3a5f" }}
            >
              DATA POLICY
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────
   Shared Detail Page Header
───────────────────────────────────────── */
function DetailPageHeader({ onNavigate, tag, title, subtitle, breadcrumb }: {
  onNavigate: (page: string) => void;
  tag: string;
  title: React.ReactNode;
  subtitle: string;
  breadcrumb: string;
}) {
  return (
    <div className="relative pt-24 pb-20 overflow-hidden" style={{ background: "#060e20" }}>
      <div className="absolute inset-0">
        <TechBackgroundCanvas opacity={0.3} />
      </div>
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(6,14,32,0.7) 0%, rgba(6,14,32,0.92) 100%)" }} />
      <div className="relative z-10 max-w-5xl mx-auto px-6">
        <div className="flex items-center gap-2 mb-8">
          <button
            onClick={() => onNavigate("home")}
            className="text-xs tracking-wider transition-colors hover:text-orange-400 flex items-center gap-1"
            style={{ fontFamily: "JetBrains Mono, monospace", color: "#7ba7c9", background: "none", border: "none", cursor: "pointer" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            BACK TO SERVICES
          </button>
          <span style={{ color: "#1e3a5f", fontFamily: "JetBrains Mono, monospace", fontSize: "12px" }}>/</span>
          <span className="text-xs tracking-wider" style={{ fontFamily: "JetBrains Mono, monospace", color: "#ea580c" }}>{breadcrumb}</span>
        </div>
        <div className="inline-block px-3 py-1 mb-5 text-xs tracking-widest tag-orange" style={{ fontFamily: "JetBrains Mono, monospace" }}>
          {tag}
        </div>
        <h1 className="font-black mb-5" style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "clamp(2rem, 6vw, 4rem)", color: "#e8f0f8", letterSpacing: "0.03em", lineHeight: 1.1 }}>
          {title}
        </h1>
        <div className="neon-line-orange max-w-xs mb-6" />
        <p className="text-base md:text-lg leading-relaxed max-w-3xl" style={{ fontFamily: "Inter, sans-serif", color: "#94a3b8", lineHeight: 1.85 }}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Shared Detail Page CTA
───────────────────────────────────────── */
function DetailPageCTA({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <div className="text-center mt-14">
      <p className="text-base mb-6" style={{ fontFamily: "Inter, sans-serif", color: "#7ba7c9" }}>
        Ready to get started?
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <a href="#contact" onClick={() => onNavigate("home")} className="px-8 py-4 font-bold tracking-wider btn-orange" style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "14px", letterSpacing: "0.12em" }}>
          GET IN TOUCH
        </a>
        <button onClick={() => onNavigate("home")} className="px-8 py-4 font-bold tracking-wider btn-outline-navy" style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "14px", letterSpacing: "0.12em" }}>
          BACK TO SERVICES
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Application Modernization Detail Page
───────────────────────────────────────── */
function AppModernizationPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const strategies = [
    {
      icon: "☁️",
      key: "REFACTORING",
      title: "Refactoring",
      desc: "With this strategy, businesses can reduce code complexity and increase speed and efficiency. It helps the developers save too much time trying to find bugs and errors, saving the company money.",
      benefits: ["Reduced infrastructure costs", "Improved scalability and reliability", "Enhanced security posture"],
    },
    {
      icon: "</>",
      key: "REPLATFORMING",
      title: "Replatforming",
      desc: "This approach does not require major changes in code or architecture. However, it involves complimentary updates that allow the legacy app to adopt a modern cloud platform to improve scalability.",
      benefits: ["Improved user experience", "Better cross-platform compatibility", "Easier future updates and maintenance"],
    },
    {
      icon: "🔧",
      key: "REPLACING",
      title: "Replacing",
      desc: "If no modernization approach suits your business goals, replacement is a viable solution. This method can be faster than rebuilding and free up valuable development resources.",
      benefits: ["Faster time-to-market for new features", "Reduced development complexity", "Improved code quality and reliability"],
    },
  ];
  const steps = [
    { num: "1", title: "Assessment", desc: "Evaluate existing systems and define modernization goals" },
    { num: "2", title: "Strategy", desc: "Develop a roadmap with prioritized modernization targets" },
    { num: "3", title: "Implementation", desc: "Execute modernization with minimal business disruption" },
    { num: "4", title: "Optimization", desc: "Continuous improvement and refinement of modernized systems" },
  ];
  return (
    <div className="min-h-screen" style={{ background: "#060e20" }}>
      <DetailPageHeader
        onNavigate={onNavigate}
        tag="SERVICE DETAIL"
        title={<>APPLICATION <span className="gradient-text">MODERNIZATION</span></>}
        subtitle="Moving legacy applications onto a modern infrastructure empowers businesses to reduce IT spending and convert savings into a competitive advantage. Our team will use the following strategy to modernize the application depending on each client's current and future business needs."
        breadcrumb="APPLICATION MODERNIZATION"
      />
      <div className="max-w-5xl mx-auto px-6 pb-16">
        <div className="rounded-lg p-8 mb-14" style={{ background: "rgba(10,28,70,0.55)", border: "2px solid rgba(26,61,140,0.4)", borderLeft: "4px solid #1a3d8c" }}>
          <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "Rajdhani, sans-serif", color: "#e8f0f8", letterSpacing: "0.05em" }}>
            WHY MODERNIZE YOUR <span className="gradient-text">APPLICATIONS?</span>
          </h2>
          <div className="space-y-5">
            {[
              { label: "Reduced Costs", text: "Modernized applications typically reduce operational costs by 30–50% through efficient resource utilization and lower maintenance requirements." },
              { label: "Enhanced Security", text: "Legacy systems often lack critical security features, making them vulnerable to modern threats and compliance issues." },
              { label: "Improved Performance", text: "Modern applications deliver better performance, supporting growing workloads and user expectations." },
            ].map(({ label, text }) => (
              <div key={label} className="flex gap-4">
                <div className="flex-shrink-0 mt-0.5">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="#ea580c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-sm leading-relaxed" style={{ fontFamily: "Inter, sans-serif", color: "#94a3b8", lineHeight: 1.75 }}>
                  <strong style={{ color: "#e8f0f8", fontWeight: 600 }}>{label}: </strong>{text}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {strategies.map((s) => (
            <div key={s.key} className="card-navy rounded-lg overflow-hidden">
              <div className="h-1" style={{ background: "linear-gradient(90deg, #ea580c, #fb923c)" }} />
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded flex items-center justify-center text-lg flex-shrink-0" style={{ background: "rgba(234,88,12,0.12)", border: "1px solid rgba(234,88,12,0.3)" }}>
                    {s.icon}
                  </div>
                  <h3 className="font-bold tracking-wider" style={{ fontFamily: "Rajdhani, sans-serif", color: "#ea580c", fontSize: "1rem", letterSpacing: "0.1em" }}>{s.key}</h3>
                </div>
                <h4 className="text-lg font-bold mb-3" style={{ fontFamily: "Rajdhani, sans-serif", color: "#e8f0f8", letterSpacing: "0.04em" }}>{s.title}</h4>
                <p className="text-sm mb-5" style={{ fontFamily: "Inter, sans-serif", color: "#64748b", lineHeight: 1.7 }}>{s.desc}</p>
                <div>
                  <div className="text-xs font-semibold tracking-widest mb-3" style={{ fontFamily: "JetBrains Mono, monospace", color: "#7ba7c9" }}>KEY BENEFITS:</div>
                  <ul className="space-y-2">
                    {s.benefits.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-sm" style={{ fontFamily: "Inter, sans-serif", color: "#7ba7c9" }}>
                        <span style={{ color: "#ea580c", marginTop: "2px", flexShrink: 0 }}>•</span>{b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-lg p-8 mb-14" style={{ background: "rgba(5,14,31,0.85)", border: "1px solid rgba(26,61,140,0.35)" }}>
          <h2 className="text-2xl font-bold mb-10 text-center" style={{ fontFamily: "Rajdhani, sans-serif", color: "#e8f0f8", letterSpacing: "0.05em" }}>
            OUR <span className="gradient-text">MODERNIZATION PROCESS</span>
          </h2>
          <div className="hidden md:grid grid-cols-4 gap-4 relative">
            <div className="absolute top-10 left-16 right-16 h-px" style={{ background: "linear-gradient(90deg, #ea580c, #1a3d8c, #ea580c)" }} />
            {steps.map((step) => (
              <div key={step.num} className="flex flex-col items-center text-center relative">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 z-10" style={{ background: "linear-gradient(135deg, #ea580c, #c2440f)", boxShadow: "0 0 24px rgba(234,88,12,0.35)" }}>
                  <span className="text-2xl font-black text-white" style={{ fontFamily: "Rajdhani, sans-serif" }}>{step.num}</span>
                </div>
                <h4 className="font-bold mb-2" style={{ fontFamily: "Rajdhani, sans-serif", color: "#e8f0f8", fontSize: "1.05rem", letterSpacing: "0.05em" }}>{step.title.toUpperCase()}</h4>
                <p className="text-xs leading-relaxed" style={{ fontFamily: "Inter, sans-serif", color: "#64748b", lineHeight: 1.65 }}>{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="md:hidden space-y-6">
            {steps.map((step) => (
              <div key={step.num} className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #ea580c, #c2440f)", boxShadow: "0 0 16px rgba(234,88,12,0.3)" }}>
                  <span className="text-lg font-black text-white" style={{ fontFamily: "Rajdhani, sans-serif" }}>{step.num}</span>
                </div>
                <div>
                  <h4 className="font-bold mb-1" style={{ fontFamily: "Rajdhani, sans-serif", color: "#e8f0f8", letterSpacing: "0.06em" }}>{step.title.toUpperCase()}</h4>
                  <p className="text-sm" style={{ fontFamily: "Inter, sans-serif", color: "#64748b", lineHeight: 1.65 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <DetailPageCTA onNavigate={onNavigate} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   IT Strategy & Consulting Detail Page
───────────────────────────────────────── */
function ITStrategyPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const transformCards = [
    { icon: "🎯", title: "Technology Alignment", desc: "We ensure your IT investments directly support your business objectives and provide measurable ROI." },
    { icon: "🏆", title: "Competitive Advantage", desc: "Leverage technology to outperform competitors and capture new market opportunities." },
    { icon: "🚀", title: "Digital Transformation", desc: "Navigate the complexities of digital transformation with a clear, actionable roadmap." },
  ];

  const steps = [
    {
      num: "1",
      title: "Discovery and Assessment",
      desc: "The consultants begin with a comprehensive discovery phase to understand the client's business landscape, existing IT infrastructure, and strategic goals. This involves stakeholder interviews, technology audits, and competitive analysis.",
      deliverable: "Comprehensive assessment report identifying strengths, weaknesses, opportunities, and threats in your current IT landscape.",
    },
    {
      num: "2",
      title: "Stakeholder Alignment",
      desc: "With insights gleaned from the discovery phase, consultants facilitate workshops and meetings to align all key stakeholders around common IT objectives. This ensures that the IT strategy reflects the needs and priorities of the entire organization.",
      deliverable: "Strategic IT roadmap aligned with your business goals, with clear milestones and metrics for success.",
    },
    {
      num: "3",
      title: "Analysis and Strategy Development",
      desc: "In this phase, the consultants embark on the strategic planning process. They analyze the data collected to identify patterns and insights that will inform the IT strategy. They then work with the client to develop a comprehensive IT strategy that covers all aspects of IT.",
      deliverable: "Detailed implementation plan with resource allocation, timeline, and risk mitigation strategies.",
    },
    {
      num: "4",
      title: "Roadmap and Implementation Plan",
      desc: "Consultants will work closely with the client's team to ensure clarity and understanding. The roadmap includes specific initiatives, timelines, resource requirements, and key performance indicators (KPIs) to measure success.",
      deliverable: "Performance monitoring framework with KPIs to track the success of your IT strategy implementation.",
    },
    {
      num: "5",
      title: "Continuous Monitoring and Optimization",
      desc: "Consultants remain actively involved in monitoring progress against the roadmap and making adjustments as necessary. This ongoing engagement helps clients stay agile and responsive in changing market dynamics.",
      deliverable: "Monthly progress reports and strategic adjustments to keep your IT initiatives on track.",
    },
    {
      num: "6",
      title: "Knowledge Transfer and Capability Building",
      desc: "As the engagement concludes, consultants focus on transferring knowledge and building internal capabilities. This ensures that the client's team can continue to execute the IT strategy effectively and independently.",
      deliverable: "Training sessions, documentation, and internal capability frameworks to sustain long-term IT excellence.",
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#060e20" }}>
      <DetailPageHeader
        onNavigate={onNavigate}
        tag="SERVICE DETAIL"
        title={<>IT STRATEGY &amp; <span className="gradient-text">CONSULTING</span></>}
        subtitle="Below is our consultant's step-by-step approach to crafting effective IT strategies that drive business growth for our clients."
        breadcrumb="IT STRATEGY & CONSULTING"
      />
      <div className="max-w-5xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold mb-8 text-center" style={{ fontFamily: "Rajdhani, sans-serif", color: "#e8f0f8", letterSpacing: "0.05em" }}>
          HOW OUR IT STRATEGY SERVICES <span className="gradient-text">TRANSFORM YOUR BUSINESS</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {transformCards.map((c) => (
            <div key={c.title} className="card-navy rounded-lg p-6 text-center">
              <div className="text-3xl mb-4">{c.icon}</div>
              <h3 className="font-bold mb-3" style={{ fontFamily: "Rajdhani, sans-serif", color: "#fb923c", fontSize: "1.1rem", letterSpacing: "0.05em" }}>{c.title}</h3>
              <p className="text-sm" style={{ fontFamily: "Inter, sans-serif", color: "#64748b", lineHeight: 1.7 }}>{c.desc}</p>
            </div>
          ))}
        </div>

        <div className="space-y-6 mb-14">
          {steps.map((step, idx) => (
            <div key={step.num} className="rounded-lg overflow-hidden" style={{ background: "rgba(10,28,70,0.5)", border: "1px solid rgba(26,61,140,0.35)" }}>
              <div className="flex items-center gap-4 p-5" style={{ borderBottom: "1px solid rgba(26,61,140,0.2)" }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: idx % 2 === 0 ? "linear-gradient(135deg, #ea580c, #c2440f)" : "linear-gradient(135deg, #1a3d8c, #0f2a6a)", boxShadow: "0 0 16px rgba(234,88,12,0.25)" }}>
                  <span className="text-lg font-black text-white" style={{ fontFamily: "Rajdhani, sans-serif" }}>{step.num}</span>
                </div>
                <h3 className="font-bold" style={{ fontFamily: "Rajdhani, sans-serif", color: "#e8f0f8", fontSize: "1.1rem", letterSpacing: "0.04em" }}>{step.title}</h3>
              </div>
              <div className="p-5">
                <p className="text-sm mb-4" style={{ fontFamily: "Inter, sans-serif", color: "#7ba7c9", lineHeight: 1.75 }}>{step.desc}</p>
                <div className="flex gap-3 p-4 rounded" style={{ background: "rgba(234,88,12,0.06)", border: "1px solid rgba(234,88,12,0.2)" }}>
                  <span style={{ color: "#ea580c", flexShrink: 0, marginTop: "2px" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>
                  </span>
                  <div>
                    <span className="text-xs font-semibold tracking-widest block mb-1" style={{ fontFamily: "JetBrains Mono, monospace", color: "#ea580c" }}>KEY DELIVERABLE:</span>
                    <span className="text-sm" style={{ fontFamily: "Inter, sans-serif", color: "#94a3b8" }}>{step.deliverable}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-lg p-8 mb-6" style={{ background: "rgba(5,14,31,0.85)", border: "1px solid rgba(26,61,140,0.35)" }}>
          <h2 className="text-2xl font-bold mb-8 text-center" style={{ fontFamily: "Rajdhani, sans-serif", color: "#e8f0f8", letterSpacing: "0.05em" }}>
            OUR <span className="gradient-text">EXPERTISE</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold mb-4 text-sm tracking-widest" style={{ fontFamily: "JetBrains Mono, monospace", color: "#ea580c" }}>INDUSTRIES</h3>
              <ul className="space-y-3">
                {["Financial Services", "Healthcare & Life Sciences", "Manufacturing & Supply Chain", "Retail & E-commerce", "Professional Services"].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm" style={{ fontFamily: "Inter, sans-serif", color: "#7ba7c9" }}>
                    <span style={{ color: "#ea580c" }}>▸</span>{item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-sm tracking-widest" style={{ fontFamily: "JetBrains Mono, monospace", color: "#ea580c" }}>TECHNOLOGY FOCUS AREAS</h3>
              <ul className="space-y-3">
                {["Cloud Migration & Strategy", "Digital Transformation", "Enterprise Architecture", "IT Governance & Compliance", "Technology Modernization"].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm" style={{ fontFamily: "Inter, sans-serif", color: "#7ba7c9" }}>
                    <span style={{ color: "#ea580c" }}>▸</span>{item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <DetailPageCTA onNavigate={onNavigate} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Software Development Detail Page
───────────────────────────────────────── */
function SoftwareDevelopmentPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const approaches = [
    {
      icon: "🌐",
      title: "Web Applications",
      desc: "Scalable, performant web applications built with modern frameworks tailored to your business processes.",
      bullets: ["SaaS platforms & portals", "E-commerce solutions", "Enterprise web systems", "Progressive Web Apps (PWA)"],
    },
    {
      icon: "📱",
      title: "Mobile Applications",
      desc: "Native and cross-platform mobile apps delivering seamless user experiences on iOS and Android.",
      bullets: ["iOS & Android native apps", "React Native / Flutter", "Mobile-first enterprise tools", "App store deployment support"],
    },
    {
      icon: "🏢",
      title: "Enterprise Systems",
      desc: "Robust back-office systems and platforms designed for reliability, security, and scale.",
      bullets: ["ERP & CRM customization", "Workflow automation systems", "Legacy system integration", "High-availability architecture"],
    },
  ];

  const whyUs = [
    { icon: "⚙️", title: "Technical Excellence", desc: "Our engineers are proficient across a wide range of modern programming languages, frameworks, and cloud platforms, ensuring we can tackle any technical challenge." },
    { icon: "🔄", title: "Agile Methodology", desc: "We follow agile development practices, delivering working software in short sprints and adapting quickly to changing requirements — keeping you in the loop at every stage." },
    { icon: "🧪", title: "Comprehensive Testing", desc: "Every release goes through rigorous manual and automated testing to ensure reliability, performance, and security before reaching your users." },
  ];

  const steps = [
    {
      num: "1",
      title: "Planning",
      desc: "We define project scope, objectives, timelines, and resource requirements. Our team collaborates with you to establish clear success criteria and milestones.",
      approach: "Joint discovery workshops and stakeholder interviews to align technical direction with business strategy.",
    },
    {
      num: "2",
      title: "Analysis",
      desc: "Our business analysts and architects translate your requirements into detailed technical specifications, identifying integration points, data flows, and system constraints.",
      approach: "Requirements documentation, use case mapping, and technical feasibility assessment.",
    },
    {
      num: "3",
      title: "Design",
      desc: "We create UI/UX wireframes, system architecture diagrams, and database schemas before a single line of code is written — ensuring the design aligns with your vision.",
      approach: "Iterative prototyping with stakeholder reviews to validate design decisions early.",
    },
    {
      num: "4",
      title: "Implementation",
      desc: "Our development team builds the solution in agile sprints, with regular demos and code reviews. We prioritize clean, maintainable code and security best practices throughout.",
      approach: "Sprint-based delivery with continuous integration and automated code quality checks.",
    },
    {
      num: "5",
      title: "Testing and Deployment",
      desc: "Comprehensive QA — including unit, integration, regression, and performance testing — ensures your software is production-ready. We manage staged deployments to minimize risk.",
      approach: "Zero-downtime deployment strategies with rollback plans and monitoring in place from day one.",
    },
    {
      num: "6",
      title: "Maintenance",
      desc: "Post-launch, we provide ongoing support, bug fixes, performance optimization, and feature enhancements. Our managed support tiers ensure your software evolves with your business.",
      approach: "SLA-backed support packages with proactive monitoring and regular health reports.",
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#060e20" }}>
      <DetailPageHeader
        onNavigate={onNavigate}
        tag="SERVICE DETAIL"
        title={<>CUSTOM SOFTWARE <span className="gradient-text">DEVELOPMENT</span></>}
        subtitle="In the digital age, having a good software system is no longer a choice but a necessity. It enables companies to operate more efficiently, respond to customers promptly, and adapt to market changes rapidly."
        breadcrumb="CUSTOM SOFTWARE DEVELOPMENT"
      />
      <div className="max-w-5xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {approaches.map((a) => (
            <div key={a.title} className="card-navy rounded-lg overflow-hidden">
              <div className="h-1" style={{ background: "linear-gradient(90deg, #ea580c, #fb923c)" }} />
              <div className="p-6">
                <div className="text-3xl mb-3">{a.icon}</div>
                <h3 className="font-bold mb-2" style={{ fontFamily: "Rajdhani, sans-serif", color: "#e8f0f8", fontSize: "1.1rem", letterSpacing: "0.05em" }}>{a.title}</h3>
                <p className="text-sm mb-4" style={{ fontFamily: "Inter, sans-serif", color: "#64748b", lineHeight: 1.7 }}>{a.desc}</p>
                <div className="text-xs font-semibold tracking-widest mb-2" style={{ fontFamily: "JetBrains Mono, monospace", color: "#7ba7c9" }}>IDEAL FOR:</div>
                <ul className="space-y-1.5">
                  {a.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm" style={{ fontFamily: "Inter, sans-serif", color: "#7ba7c9" }}>
                      <span style={{ color: "#ea580c", flexShrink: 0 }}>•</span>{b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Product showcase images */}
        <div className="mb-14">
          <h3
            className="text-xs font-semibold tracking-widest mb-5 text-center"
            style={{ fontFamily: "JetBrains Mono, monospace", color: "#ea580c" }}
          >
            SOLUTIONS WE BUILD
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { src: "https://images.unsplash.com/photo-1731458769726-cef60c792665?w=700&h=420&fit=crop&auto=format", alt: "Business team using HRIS software", caption: "HRIS & HR Management" },
              { src: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=700&h=420&fit=crop&auto=format", alt: "Monitor showing web application UI", caption: "Web App & Portal" },
              { src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=700&h=420&fit=crop&auto=format", alt: "Development team collaborating", caption: "Enterprise Software" },
            ].map((img, i) => (
              <div key={i} className="rounded-lg overflow-hidden" style={{ border: "1px solid rgba(26,61,140,0.35)" }}>
                <div className="relative" style={{ height: "180px" }}>
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    style={{ filter: "brightness(0.8) saturate(1.1)" }}
                  />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 50%, rgba(6,14,32,0.88) 100%)" }} />
                  <div
                    className="absolute bottom-3 left-3 text-xs font-semibold tracking-widest px-2 py-1 rounded"
                    style={{
                      fontFamily: "JetBrains Mono, monospace",
                      color: "#fb923c",
                      background: "rgba(6,14,32,0.75)",
                      border: "1px solid rgba(234,88,12,0.35)",
                    }}
                  >
                    {img.caption.toUpperCase()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg p-8 mb-14" style={{ background: "rgba(10,28,70,0.55)", border: "1px solid rgba(26,61,140,0.35)" }}>
          <h2 className="text-2xl font-bold mb-8 text-center" style={{ fontFamily: "Rajdhani, sans-serif", color: "#e8f0f8", letterSpacing: "0.05em" }}>
            WHY <span className="gradient-text">CHOOSE US</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {whyUs.map((w) => (
              <div key={w.title} className="text-center p-4">
                <div className="text-3xl mb-3">{w.icon}</div>
                <h3 className="font-bold mb-2" style={{ fontFamily: "Rajdhani, sans-serif", color: "#fb923c", fontSize: "1rem", letterSpacing: "0.06em" }}>{w.title.toUpperCase()}</h3>
                <p className="text-sm" style={{ fontFamily: "Inter, sans-serif", color: "#64748b", lineHeight: 1.7 }}>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-8 text-center" style={{ fontFamily: "Rajdhani, sans-serif", color: "#e8f0f8", letterSpacing: "0.05em" }}>
          OUR DEVELOPMENT <span className="gradient-text">PROCESS</span>
        </h2>
        <div className="space-y-5 mb-6">
          {steps.map((step, idx) => (
            <div key={step.num} className="rounded-lg overflow-hidden" style={{ background: "rgba(10,28,70,0.5)", border: "1px solid rgba(26,61,140,0.35)" }}>
              <div className="flex items-center gap-4 p-5" style={{ borderBottom: "1px solid rgba(26,61,140,0.2)" }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: idx % 2 === 0 ? "linear-gradient(135deg, #ea580c, #c2440f)" : "linear-gradient(135deg, #1a3d8c, #0f2a6a)" }}>
                  <span className="font-black text-white text-sm" style={{ fontFamily: "Rajdhani, sans-serif" }}>{step.num}</span>
                </div>
                <h3 className="font-bold" style={{ fontFamily: "Rajdhani, sans-serif", color: "#e8f0f8", fontSize: "1.05rem", letterSpacing: "0.04em" }}>{step.title}</h3>
              </div>
              <div className="p-5">
                <p className="text-sm mb-3" style={{ fontFamily: "Inter, sans-serif", color: "#7ba7c9", lineHeight: 1.75 }}>{step.desc}</p>
                <div className="flex gap-2 text-sm" style={{ fontFamily: "Inter, sans-serif", color: "#94a3b8" }}>
                  <span style={{ color: "#ea580c", flexShrink: 0 }}>→</span>
                  <span><strong style={{ color: "#94a3b8" }}>Our approach: </strong>{step.approach}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <DetailPageCTA onNavigate={onNavigate} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Generic Service Pages
───────────────────────────────────────── */
interface GenericPageData {
  title: string;
  breadcrumb: string;
  intro: string;
  highlights: { icon: string; title: string; desc: string }[];
  steps: { title: string; desc: string }[];
  extras?: { heading: string; items: string[] }[];
  images?: { src: string; alt: string; caption?: string }[];
}

const GENERIC_PAGE_DATA: Record<string, GenericPageData> = {
  "staff-augmentation": {
    title: "Staff Augmentation",
    breadcrumb: "STAFF AUGMENTATION",
    intro: "Scale your engineering capacity instantly with pre-vetted technology professionals. Our staff augmentation model gives you direct access to senior engineers, QA specialists, solution architects, and DevOps experts who integrate seamlessly with your team.",
    highlights: [
      { icon: "⚡", title: "Rapid Deployment", desc: "Get skilled professionals onboarded and productive within days, not months. We handle sourcing, vetting, and initial orientation." },
      { icon: "🎯", title: "Skills-Matched Talent", desc: "We match candidates to your exact tech stack, domain knowledge, and seniority level — no mismatches, no ramp-up waste." },
      { icon: "🔄", title: "Flexible Engagements", desc: "Scale up or down based on project demand. Choose from short-term sprints, long-term placements, or dedicated team models." },
    ],
    steps: [
      { title: "Requirements Intake", desc: "We conduct a deep-dive session to understand your team structure, tech stack, project goals, and the specific skills you need." },
      { title: "Talent Sourcing", desc: "Our talent team searches our curated network and conducts initial screening, technical assessments, and background checks." },
      { title: "Candidate Presentation", desc: "You receive a shortlist of top candidates with profiles, technical scores, and our recommendation. You choose who to interview." },
      { title: "Integration & Onboarding", desc: "Selected professionals are onboarded to your tools, communication channels, and workflows with minimal friction." },
      { title: "Ongoing Management", desc: "We provide continuous support, performance check-ins, and replacements if needed — ensuring consistent delivery quality." },
    ],
    extras: [{ heading: "ROLES WE PLACE", items: ["Frontend & Backend Developers", "Full-Stack Engineers", "Mobile Developers (iOS / Android)", "DevOps & Cloud Engineers", "QA Automation Engineers", "Business Analysts", "Solution Architects", "Project Managers"] }],
  },
  "rpa": {
    title: "Robotic Process Automation (RPA)",
    breadcrumb: "ROBOTIC PROCESS AUTOMATION",
    intro: "Automate repetitive, rule-based tasks across your enterprise to free your team for higher-value work. Our RPA practice designs, builds, and manages software bots that work around the clock — reducing errors, cutting costs, and accelerating throughput.",
    highlights: [
      { icon: "🤖", title: "Intelligent Automation", desc: "We combine RPA with AI/ML capabilities to handle complex, semi-structured tasks that go beyond simple rule-based automation." },
      { icon: "📉", title: "Cost Reduction", desc: "Clients typically achieve 40–70% reduction in processing costs by automating repetitive back-office and middle-office operations." },
      { icon: "✅", title: "Zero-Error Processing", desc: "Bots execute tasks with 100% accuracy and consistency, eliminating human error from critical data entry and processing workflows." },
    ],
    steps: [
      { title: "Process Discovery", desc: "We identify and document automation candidates using process mining and stakeholder workshops, prioritizing by ROI and feasibility." },
      { title: "Bot Design", desc: "Our RPA architects design the automation workflow, exception handling logic, and integration points before development begins." },
      { title: "Bot Development", desc: "Using leading platforms like UiPath, Automation Anywhere, or Power Automate, we build and unit-test the automation scripts." },
      { title: "UAT & Deployment", desc: "Bots undergo rigorous user acceptance testing in a staging environment before production deployment with rollback capability." },
      { title: "Monitoring & Support", desc: "We operate a bot monitoring center with alerting, exception management, and proactive maintenance to ensure continuous uptime." },
    ],
    extras: [{ heading: "COMMON USE CASES", items: ["Invoice processing & AP automation", "HR onboarding workflows", "Customer data migration", "Report generation & distribution", "Compliance reporting", "Order management & fulfillment", "IT provisioning & password resets"] }],
  },
  "cloud-solutions": {
    title: "Cloud Solutions & Migration",
    breadcrumb: "CLOUD SOLUTIONS & MIGRATION",
    intro: "Modernize your infrastructure with a cloud strategy tailored to your workloads, compliance requirements, and growth trajectory. We help organizations migrate, optimize, and operate across AWS, Microsoft Azure, and Google Cloud Platform.",
    images: [
      { src: "https://images.unsplash.com/photo-1741795990628-7ec99d7d2044?w=700&h=440&fit=crop&auto=format", alt: "Blue glowing digital futuristic lines representing cloud", caption: "Cloud Infrastructure" },
      { src: "https://images.unsplash.com/photo-1561233835-f937539b95b9?w=700&h=440&fit=crop&auto=format", alt: "Server room indicator lights for cloud data center", caption: "Data Center Migration" },
    ],
    highlights: [
      { icon: "☁️", title: "Multi-Cloud Expertise", desc: "Certified architects across AWS, Azure, and GCP ensure you get the right cloud for each workload — or a seamless multi-cloud setup." },
      { icon: "🔒", title: "Security-First Design", desc: "Every migration and cloud architecture is built with security controls, compliance frameworks, and data governance from the ground up." },
      { icon: "💰", title: "Cost Optimization", desc: "We continuously right-size resources, implement reserved capacity strategies, and enforce tagging policies to minimize your cloud spend." },
    ],
    steps: [
      { title: "Cloud Readiness Assessment", desc: "Evaluate your existing workloads, dependencies, and compliance requirements to determine the optimal cloud strategy." },
      { title: "Migration Strategy", desc: "Select the right migration approach — Rehost, Replatform, Refactor, or Rebuild — for each application in your portfolio." },
      { title: "Architecture Design", desc: "Design cloud-native architectures with high availability, disaster recovery, auto-scaling, and security controls baked in." },
      { title: "Migration Execution", desc: "Execute migrations in waves with minimal downtime using proven tools and runbooks, validating each step before cutover." },
      { title: "Cloud Operations", desc: "Provide ongoing managed cloud operations including monitoring, patching, cost governance, and continuous optimization." },
    ],
  },
  "system-integration": {
    title: "System Integration",
    breadcrumb: "SYSTEM INTEGRATION",
    intro: "Connect your disparate applications, data sources, and platforms into a unified digital ecosystem. Our integration services eliminate data silos, automate cross-system workflows, and provide a single source of truth across your enterprise.",
    images: [
      { src: "https://images.unsplash.com/photo-1644088379091-d574269d422f?w=700&h=440&fit=crop&auto=format", alt: "Digital network integration nodes and lines", caption: "API-First Integration" },
      { src: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=700&h=440&fit=crop&auto=format", alt: "Network cable connections", caption: "Enterprise Connectivity" },
      { src: "https://images.unsplash.com/photo-1683322499436-f4383dd59f5a?w=700&h=440&fit=crop&auto=format", alt: "Blue network wires interconnected", caption: "Data Pipeline Architecture" },
    ],
    highlights: [
      { icon: "🔗", title: "API-First Architecture", desc: "We design RESTful and GraphQL APIs that enable clean, maintainable integrations between any system — on-premise or cloud." },
      { icon: "📊", title: "Real-Time Data Flows", desc: "Event-driven integration patterns ensure data moves between systems in real time, keeping every application in sync." },
      { icon: "🛡️", title: "Enterprise-Grade Reliability", desc: "Integration pipelines are built with error handling, retry logic, circuit breakers, and monitoring to guarantee data integrity." },
    ],
    steps: [
      { title: "Integration Discovery", desc: "Map all systems, APIs, data formats, and business processes to identify integration requirements and dependencies." },
      { title: "Architecture Design", desc: "Design the integration architecture — point-to-point, hub-and-spoke, or ESB/iPaaS — based on your complexity and scale." },
      { title: "Development & Testing", desc: "Build and unit-test each integration connector, transformation, and mapping against real data scenarios." },
      { title: "End-to-End Testing", desc: "Validate complete business workflows across all integrated systems under realistic load and failure conditions." },
      { title: "Go-Live & Support", desc: "Deploy integrations with monitoring dashboards and provide ongoing support to handle schema changes and system upgrades." },
    ],
  },
  "managed-it": {
    title: "Managed IT Services",
    breadcrumb: "MANAGED IT SERVICES",
    intro: "Offload the complexity of IT operations to our expert team. Our Managed IT Services provide proactive monitoring, maintenance, and support for your entire technology stack — keeping your business running at peak performance, 24 hours a day, 7 days a week.",
    highlights: [
      { icon: "🖥️", title: "Proactive Monitoring", desc: "Our NOC monitors your infrastructure around the clock, detecting and resolving issues before they impact your business." },
      { icon: "🔒", title: "Security Management", desc: "Continuous vulnerability scanning, patch management, and security incident response keep your environment protected at all times." },
      { icon: "📞", title: "Dedicated Help Desk", desc: "Tier 1–3 support with defined SLAs ensures your team always has fast, expert help when issues arise." },
    ],
    steps: [
      { title: "Onboarding & Discovery", desc: "We document your entire IT environment, establish monitoring agents, and create a complete asset and configuration inventory." },
      { title: "Baseline & SLA Definition", desc: "Define performance baselines, response time SLAs, escalation paths, and reporting cadences tailored to your needs." },
      { title: "Monitoring Deployment", desc: "Deploy monitoring tools across servers, networks, applications, and security systems with customized alert thresholds." },
      { title: "Proactive Maintenance", desc: "Execute scheduled patching, backup verification, capacity planning, and performance tuning to prevent issues proactively." },
      { title: "Reporting & Review", desc: "Deliver monthly management reports covering uptime, incident trends, capacity forecasts, and improvement recommendations." },
    ],
    extras: [{ heading: "WHAT WE MANAGE", items: ["Server & network infrastructure", "Cloud environments (AWS, Azure, GCP)", "End-user computing & help desk", "Backup & disaster recovery", "Cybersecurity & compliance", "Vendor management & licensing", "IT procurement"] }],
  },
  "qa-testing": {
    title: "QA & Software Testing",
    breadcrumb: "QA & SOFTWARE TESTING",
    intro: "Quality is not an afterthought — it is engineered in. Our QA practice provides comprehensive testing across the full development lifecycle, combining manual expertise with intelligent automation to deliver software you can trust at every release.",
    images: [
      { src: "https://images.unsplash.com/photo-1575024357670-2b5164f470c3?w=700&h=440&fit=crop&auto=format", alt: "Developer testing code on MacBook Pro", caption: "Automated Test Suites" },
      { src: "https://images.unsplash.com/photo-1577375729152-4c8b5fcda381?w=700&h=440&fit=crop&auto=format", alt: "Laptop displaying code for testing", caption: "Code Quality Review" },
      { src: "https://images.unsplash.com/photo-1525373698358-041e3a460346?w=700&h=440&fit=crop&auto=format", alt: "Developer working on software testing", caption: "Performance Testing" },
    ],
    highlights: [
      { icon: "🤖", title: "Test Automation", desc: "We build robust automated regression suites using Selenium, Playwright, Cypress, and Appium — enabling fast, repeatable CI/CD quality gates." },
      { icon: "📋", title: "Manual Expertise", desc: "Experienced QA engineers perform exploratory, usability, and scenario-based testing that automated tools simply cannot replicate." },
      { icon: "⚡", title: "Performance Testing", desc: "Load, stress, and endurance testing validate that your system performs under peak conditions before users experience it." },
    ],
    steps: [
      { title: "Test Planning", desc: "Define test strategy, scope, environments, entry/exit criteria, and resource requirements aligned with your release schedule." },
      { title: "Test Case Design", desc: "Create comprehensive test cases covering functional requirements, edge cases, regression scenarios, and non-functional requirements." },
      { title: "Automation Framework Setup", desc: "Build a maintainable, scalable test automation framework integrated with your CI/CD pipeline for continuous testing." },
      { title: "Test Execution", desc: "Execute test cycles, log defects with reproducible steps and severity ratings, and track resolution through to closure." },
      { title: "Release Certification", desc: "Produce a test summary report with pass rates, risk assessment, and a clear go/no-go recommendation for each release." },
    ],
    extras: [{ heading: "TESTING TYPES WE PROVIDE", items: ["Functional & regression testing", "API & web services testing", "Mobile application testing", "Performance & load testing", "Security & penetration testing", "Accessibility testing", "User acceptance testing (UAT)"] }],
  },
  "pos-kiosk": {
    title: "POS & Kiosk Software Systems",
    breadcrumb: "POS & KIOSK SOFTWARE SYSTEMS",
    intro: "Deliver seamless customer experiences at the point of interaction. Our POS and kiosk software solutions are purpose-built for retail, food & beverage, hospitality, and service industries — combining reliability, speed, and deep integration with your back-end systems.",
    images: [
      { src: "https://images.unsplash.com/photo-1647427017067-8f33ccbae493?w=700&h=440&fit=crop&auto=format", alt: "Cashier using POS machine in retail store", caption: "Retail Point-of-Sale" },
      { src: "https://images.unsplash.com/photo-1726065235239-b20b88d43eea?w=700&h=440&fit=crop&auto=format", alt: "Modern desktop POS system", caption: "Desktop POS Terminal" },
      { src: "https://images.unsplash.com/photo-1602665742701-389671bc40c0?w=700&h=440&fit=crop&auto=format", alt: "Kiosk software on laptop", caption: "Self-Service Kiosk" },
    ],
    highlights: [
      { icon: "🖥️", title: "Customizable Platforms", desc: "Purpose-built POS and kiosk interfaces designed for your specific industry workflows, products, and branding." },
      { icon: "🔗", title: "Deep Integrations", desc: "Seamless connectivity to inventory management, ERP systems, payment gateways, loyalty programs, and analytics platforms." },
      { icon: "🛡️", title: "Offline Resilience", desc: "Our systems are engineered to operate offline with automatic sync upon reconnection — zero lost transactions." },
    ],
    steps: [
      { title: "Requirements & Workflow Analysis", desc: "Map your operational workflows, menu/product structures, payment flows, and reporting needs to define system requirements." },
      { title: "UI/UX Design", desc: "Design intuitive touchscreen interfaces optimized for fast transactions, staff efficiency, and customer self-service scenarios." },
      { title: "Development & Integration", desc: "Build the POS/kiosk software and integrate with payment processors, inventory systems, and back-office platforms." },
      { title: "Pilot & Testing", desc: "Deploy in a pilot location for real-world validation, gather feedback, and refine before full rollout." },
      { title: "Rollout & Training", desc: "Execute multi-site rollout with comprehensive staff training and on-site support during the go-live period." },
    ],
  },
  "data-analytics": {
    title: "Data Analytics & Business Intelligence",
    breadcrumb: "DATA ANALYTICS & BI",
    intro: "Turn raw data into the decisions that drive growth. Our Data Analytics and BI practice helps organizations collect, transform, and visualize their data — delivering actionable insights through dashboards and reports that business leaders actually use.",
    highlights: [
      { icon: "📊", title: "Executive Dashboards", desc: "Real-time dashboards built in Power BI, Tableau, or Looker give leadership instant visibility into KPIs that matter most." },
      { icon: "🔄", title: "Data Pipeline Engineering", desc: "Robust ETL/ELT pipelines ensure clean, timely data flows from every source system into your analytics platform." },
      { icon: "🤖", title: "Predictive Analytics", desc: "Apply machine learning to your historical data to forecast demand, detect anomalies, and identify growth opportunities." },
    ],
    steps: [
      { title: "Data Discovery", desc: "Inventory all data sources, assess data quality, and understand the business questions stakeholders need answered." },
      { title: "Data Architecture Design", desc: "Design the data warehouse or lakehouse architecture, including data models, integration patterns, and governance policies." },
      { title: "Pipeline Development", desc: "Build automated data pipelines that extract, transform, and load data from all sources into the analytics platform." },
      { title: "Dashboard & Report Development", desc: "Create interactive dashboards and self-service reports with drill-through capability and role-based access control." },
      { title: "Training & Adoption", desc: "Train power users and business analysts to build their own reports, driving a data-driven culture across the organization." },
    ],
  },
};

function GenericServicePage({ slug, onNavigate }: { slug: string; onNavigate: (page: string) => void }) {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const data = GENERIC_PAGE_DATA[slug];
  if (!data) return null;
  return (
    <div className="min-h-screen" style={{ background: "#060e20" }}>
      <DetailPageHeader
        onNavigate={onNavigate}
        tag="SERVICE DETAIL"
        title={<><span className="gradient-text">{data.title.toUpperCase()}</span></>}
        subtitle={data.intro}
        breadcrumb={data.breadcrumb}
      />
      <div className="max-w-5xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {data.highlights.map((h) => (
            <div key={h.title} className="card-navy rounded-lg p-6">
              <div className="text-3xl mb-4">{h.icon}</div>
              <h3 className="font-bold mb-2" style={{ fontFamily: "Rajdhani, sans-serif", color: "#fb923c", fontSize: "1rem", letterSpacing: "0.05em" }}>{h.title.toUpperCase()}</h3>
              <p className="text-sm" style={{ fontFamily: "Inter, sans-serif", color: "#64748b", lineHeight: 1.7 }}>{h.desc}</p>
            </div>
          ))}
        </div>

        {/* Product / service images */}
        {data.images && data.images.length > 0 && (
          <div className="mb-14">
            <div
              className={`grid gap-4 ${data.images.length === 1 ? "grid-cols-1" : data.images.length === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-3"}`}
            >
              {data.images.map((img, i) => (
                <div
                  key={i}
                  className="rounded-lg overflow-hidden"
                  style={{ border: "1px solid rgba(26,61,140,0.35)" }}
                >
                  <div className="relative overflow-hidden" style={{ height: "200px" }}>
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      style={{ filter: "brightness(0.82) saturate(1.15)" }}
                    />
                    <div
                      className="absolute inset-0"
                      style={{ background: "linear-gradient(to bottom, transparent 55%, rgba(6,14,32,0.85) 100%)" }}
                    />
                    {img.caption && (
                      <div
                        className="absolute bottom-3 left-3 text-xs font-semibold tracking-widest px-2 py-1 rounded"
                        style={{
                          fontFamily: "JetBrains Mono, monospace",
                          color: "#fb923c",
                          background: "rgba(6,14,32,0.75)",
                          border: "1px solid rgba(234,88,12,0.35)",
                        }}
                      >
                        {img.caption.toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <h2 className="text-2xl font-bold mb-8 text-center" style={{ fontFamily: "Rajdhani, sans-serif", color: "#e8f0f8", letterSpacing: "0.05em" }}>
          OUR <span className="gradient-text">PROCESS</span>
        </h2>
        <div className="space-y-4 mb-12">
          {data.steps.map((step, idx) => (
            <div key={step.title} className="flex gap-5 p-5 rounded-lg" style={{ background: "rgba(10,28,70,0.5)", border: "1px solid rgba(26,61,140,0.35)" }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-black text-white" style={{ background: idx % 2 === 0 ? "linear-gradient(135deg, #ea580c, #c2440f)" : "linear-gradient(135deg, #1a3d8c, #0f2a6a)", fontFamily: "Rajdhani, sans-serif" }}>{idx + 1}</div>
              <div>
                <h3 className="font-bold mb-1" style={{ fontFamily: "Rajdhani, sans-serif", color: "#e8f0f8", fontSize: "1rem", letterSpacing: "0.04em" }}>{step.title}</h3>
                <p className="text-sm" style={{ fontFamily: "Inter, sans-serif", color: "#7ba7c9", lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {data.extras && data.extras.map((extra) => (
          <div key={extra.heading} className="rounded-lg p-6 mb-10" style={{ background: "rgba(5,14,31,0.85)", border: "1px solid rgba(26,61,140,0.35)" }}>
            <h3 className="font-bold mb-5 text-sm tracking-widest" style={{ fontFamily: "JetBrains Mono, monospace", color: "#ea580c" }}>{extra.heading}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {extra.items.map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm" style={{ fontFamily: "Inter, sans-serif", color: "#7ba7c9" }}>
                  <span style={{ color: "#ea580c" }}>▸</span>{item}
                </div>
              ))}
            </div>
          </div>
        ))}
        <DetailPageCTA onNavigate={onNavigate} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   RCC.ai Floating Chatbot
───────────────────────────────────────── */
interface ChatMessage {
  id: number;
  role: "bot" | "user";
  text: string;
}

function getBotResponse(input: string): string {
  const q = input.toLowerCase();
  if (q.includes("service") || q.includes("offer") || q.includes("what do you")) {
    return "We offer 11 IT services:\n• Application Modernization\n• Custom Software Development\n• Staff Augmentation\n• IT Strategy & Consulting\n• Robotic Process Automation (RPA)\n• Cloud Solutions & Migration\n• System Integration\n• Managed IT Services\n• QA & Software Testing\n• POS & Kiosk Systems\n• Data Analytics & BI\n\nWhich would you like to know more about?";
  }
  if (q.includes("location") || q.includes("address") || q.includes("where") || q.includes("office")) {
    return "Our office is located at:\n📍 7/F Ascott Makati Glorietta 4\nAyala Center San Lorenzo\nMakati City, Philippines\n\nOffice hours: Mon–Fri, 8:00 AM – 7:00 PM.";
  }
  if (q.includes("phone") || q.includes("call") || q.includes("contact") || q.includes("reach")) {
    return "You can reach us at:\n📞 +632 8651 6572\n✉️ info@rcccolabsolutions.com\n\nOffice hours: Mon–Fri, 8:00 AM – 7:00 PM. Managed IT support is available 24/7!";
  }
  if (q.includes("quote") || q.includes("pricing") || q.includes("cost") || q.includes("price") || q.includes("rate")) {
    return "Pricing depends on your specific needs and project scope. Please fill out our contact form on this page or call +632 8651 6572 and our team will prepare a custom quote for you — usually within 24 hours!";
  }
  if (q.includes("hello") || q.includes("hi") || q.includes("hey") || q.includes("good")) {
    return "Hello! 👋 Great to hear from you. How can RCC Colab Solutions help you today? You can ask about our services, location, pricing, or how to get started.";
  }
  return "I'll connect you with our team for that. Please use the contact form on this page or call us directly at +632 8651 6572. We respond within 24 hours!";
}

function FloatingChatbot() {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, role: "bot", text: "Hi! I'm RCC.Ai 👋 Your AI assistant for RCC Colab Solutions. Ask me anything about our services, location, pricing, or how to get started!" },
  ]);
  const [input, setInput] = useState("");
  const [position, setPosition] = useState({ x: window.innerWidth - 90, y: window.innerHeight - 110 });
  const isDragging = useRef(false);
  const hasDragged = useRef(false);
  const dragStart = useRef({ mx: 0, my: 0, px: 0, py: 0 });
  const msgBottom = useRef<HTMLDivElement>(null);
  const nextId = useRef(2);

  const beginDrag = useCallback((clientX: number, clientY: number) => {
    isDragging.current = true;
    hasDragged.current = false;
    dragStart.current = { mx: clientX, my: clientY, px: position.x, py: position.y };
  }, [position]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    beginDrag(e.clientX, e.clientY);
    e.preventDefault();
  }, [beginDrag]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    beginDrag(t.clientX, t.clientY);
  }, [beginDrag]);

  useEffect(() => {
    const applyMove = (clientX: number, clientY: number) => {
      if (!isDragging.current) return;
      const dx = clientX - dragStart.current.mx;
      const dy = clientY - dragStart.current.my;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) hasDragged.current = true;
      const newX = Math.max(0, Math.min(window.innerWidth - 70, dragStart.current.px + dx));
      const newY = Math.max(0, Math.min(window.innerHeight - 70, dragStart.current.py + dy));
      setPosition({ x: newX, y: newY });
    };
    const onMove = (e: MouseEvent) => applyMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => { if (!isDragging.current) return; applyMove(e.touches[0].clientX, e.touches[0].clientY); e.preventDefault(); };
    const onUp = () => { isDragging.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onUp);
    };
  }, []);

  useEffect(() => {
    msgBottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleToggle = () => {
    if (!hasDragged.current) setChatOpen((o) => !o);
  };

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: ChatMessage = { id: nextId.current++, role: "user", text };
    const botMsg: ChatMessage = { id: nextId.current++, role: "bot", text: getBotResponse(text) };
    setMessages((m) => [...m, userMsg, botMsg]);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  const quickActions = ["Our Services", "Location", "Get Quote", "Contact"];
  const handleQuick = (label: string) => {
    const userMsg: ChatMessage = { id: nextId.current++, role: "user", text: label };
    const botMsg: ChatMessage = { id: nextId.current++, role: "bot", text: getBotResponse(label) };
    setMessages((m) => [...m, userMsg, botMsg]);
  };

  return (
    <div style={{ position: "fixed", left: position.x, top: position.y, zIndex: 1000, userSelect: "none" }}>
      {/* Chat Panel */}
      {chatOpen && (
        <div
          style={{
            position: "absolute",
            bottom: "74px",
            right: 0,
            width: "320px",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
            border: "1px solid rgba(26,61,140,0.5)",
            background: "#060e20",
          }}
        >
          {/* Header */}
          <div style={{ background: "#ea580c", padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "28px", height: "28px", background: "rgba(255,255,255,0.2)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "14px" }}>🤖</span>
              </div>
              <div>
                <div style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700, color: "#fff", fontSize: "15px", letterSpacing: "0.05em" }}>RCC.Ai</div>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#4ade80" }} />
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "rgba(255,255,255,0.9)" }}>Online · Always ready</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "6px", width: "28px", height: "28px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "16px" }}
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div style={{ height: "260px", overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: "10px", background: "#060e20" }}>
            {messages.map((msg) => (
              <div key={msg.id} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                <div
                  style={{
                    maxWidth: "80%",
                    padding: "8px 12px",
                    borderRadius: msg.role === "user" ? "12px 12px 0 12px" : "12px 12px 12px 0",
                    background: msg.role === "user" ? "#ea580c" : "rgba(10,28,70,0.8)",
                    border: msg.role === "bot" ? "1px solid rgba(26,61,140,0.4)" : "none",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "13px",
                    color: "#e8f0f8",
                    lineHeight: 1.5,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={msgBottom} />
          </div>

          {/* Quick Actions */}
          <div style={{ padding: "8px 12px", borderTop: "1px solid rgba(26,61,140,0.3)", display: "flex", flexWrap: "wrap", gap: "6px", background: "#060e20" }}>
            {quickActions.map((label) => (
              <button
                key={label}
                onClick={() => handleQuick(label)}
                style={{
                  padding: "4px 10px",
                  borderRadius: "20px",
                  background: "transparent",
                  border: "1px solid #ea580c",
                  color: "#ea580c",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "11px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.background = "rgba(234,88,12,0.15)"; }}
                onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.background = "transparent"; }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding: "10px 12px", borderTop: "1px solid rgba(26,61,140,0.3)", display: "flex", gap: "8px", background: "#060e20" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask RCC.Ai anything..."
              style={{
                flex: 1,
                background: "rgba(10,28,70,0.5)",
                border: "1px solid rgba(26,61,140,0.4)",
                borderRadius: "8px",
                padding: "8px 12px",
                color: "#e8f0f8",
                fontFamily: "Inter, sans-serif",
                fontSize: "13px",
                outline: "none",
              }}
            />
            <button
              onClick={sendMessage}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: "#ea580c",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Mascot Toggle Button */}
      <div
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onClick={handleToggle}
        style={{
          width: "62px",
          height: "62px",
          borderRadius: "50%",
          overflow: "hidden",
          cursor: "grab",
          position: "relative",
          boxShadow: "0 4px 20px rgba(234,88,12,0.5)",
          border: "2px solid #ea580c",
          background: "#060e20",
          userSelect: "none",
        }}
      >
        <img
          src={rccMascot}
          alt="RCC.Ai Chatbot"
          draggable={false}
          style={{ width: "100%", height: "100%", objectFit: "contain", pointerEvents: "none", padding: "4px" }}
        />
        {chatOpen && (
          <div style={{
            position: "absolute", inset: 0, background: "rgba(6,14,32,0.7)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}


function MobileHomeSlides_UNUSED({ onNavigate }: { onNavigate: (p: string) => void }) {
  const [slide, setSlide] = useState(0);
  const total = SLIDE_LABELS.length;
  const touchX = useRef<number | null>(null);
  const touchY = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const goTo = (n: number) => setSlide(Math.max(0, Math.min(total - 1, n)));

  const onTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.touches[0].clientX;
    touchY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null || touchY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    const dy = e.changedTouches[0].clientY - touchY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      goTo(dx < 0 ? slide + 1 : slide - 1);
    }
    touchX.current = null;
    touchY.current = null;
  };

  // Navigate to anchor when slide changes
  useEffect(() => {
    const anchors = ["#home", "#services", "#about", "#contact"];
    const el = document.querySelector(`.mobile-slide-${slide}`);
    if (el) el.scrollTop = 0;
  }, [slide]);

  return (
    <div
      style={{ position: "relative", width: "100vw", overflow: "hidden", minHeight: "100dvh" }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Slide track */}
      <div
        ref={containerRef}
        style={{
          display: "flex",
          width: `${total * 100}vw`,
          transform: `translateX(-${slide * (100 / total)}%)`,
          transition: "transform 0.42s cubic-bezier(0.4,0,0.2,1)",
          willChange: "transform",
        }}
      >
        {/* Slide 0 — Hero */}
        <div className={`mobile-slide-0`} style={{ width: "100vw", minHeight: "100dvh", overflowY: "auto", flexShrink: 0 }}>
          <HeroSection />
        </div>

        {/* Slide 1 — Services */}
        <div className={`mobile-slide-1`} style={{ width: "100vw", minHeight: "100dvh", overflowY: "auto", flexShrink: 0, background: "#060e20" }}>
          <div style={{ paddingTop: "64px" }}>
            <ServicesSection onNavigate={onNavigate} />
          </div>
        </div>

        {/* Slide 2 — About */}
        <div className={`mobile-slide-2`} style={{ width: "100vw", minHeight: "100dvh", overflowY: "auto", flexShrink: 0, background: "#060e20" }}>
          <div style={{ paddingTop: "64px" }}>
            <AboutSection />
          </div>
        </div>

        {/* Slide 3 — Contact */}
        <div className={`mobile-slide-3`} style={{ width: "100vw", minHeight: "100dvh", overflowY: "auto", flexShrink: 0, background: "#060e20" }}>
          <div style={{ paddingTop: "64px" }}>
            <ContactSection />
          </div>
        </div>
      </div>

      {/* Slide indicators — dots */}
      <div
        style={{
          position: "fixed",
          bottom: "28px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "10px",
          zIndex: 60,
          padding: "8px 16px",
          borderRadius: "24px",
          background: "rgba(6,14,32,0.75)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(14,165,233,0.2)",
        }}
      >
        {SLIDE_LABELS.map((label, i) => (
          <button
            key={label}
            onClick={() => goTo(i)}
            title={label}
            style={{
              width: i === slide ? "28px" : "8px",
              height: "8px",
              borderRadius: "4px",
              background: i === slide ? "#ea580c" : "rgba(148,163,184,0.4)",
              border: "none",
              cursor: "pointer",
              transition: "all 0.3s ease",
              padding: 0,
            }}
          />
        ))}
      </div>

      {/* Prev / Next arrows */}
      {slide > 0 && (
        <button
          onClick={() => goTo(slide - 1)}
          style={{
            position: "fixed",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 60,
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            background: "rgba(6,14,32,0.80)",
            border: "1px solid rgba(14,165,233,0.35)",
            color: "#38bdf8",
            fontSize: "18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            backdropFilter: "blur(8px)",
          }}
        >‹</button>
      )}
      {slide < total - 1 && (
        <button
          onClick={() => goTo(slide + 1)}
          style={{
            position: "fixed",
            right: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 60,
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            background: "rgba(6,14,32,0.80)",
            border: "1px solid rgba(14,165,233,0.35)",
            color: "#38bdf8",
            fontSize: "18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            backdropFilter: "blur(8px)",
          }}
        >›</button>
      )}

      {/* Slide label */}
      <div
        style={{
          position: "fixed",
          bottom: "68px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 60,
          fontFamily: "JetBrains Mono, monospace",
          fontSize: "10px",
          letterSpacing: "0.18em",
          color: "#64748b",
          pointerEvents: "none",
          whiteSpace: "nowrap",
        }}
      >
        {SLIDE_LABELS[slide].toUpperCase()} · {slide + 1}/{total}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   App Root
───────────────────────────────────────── */
export default function App() {
  const [page, setPage] = useState<string>("home");

  const navigate = (p: string) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPage = () => {
    if (page === "app-modernization") return <AppModernizationPage onNavigate={navigate} />;
    if (page === "it-strategy") return <ITStrategyPage onNavigate={navigate} />;
    if (page === "software-development") return <SoftwareDevelopmentPage onNavigate={navigate} />;
    if (GENERIC_PAGE_DATA[page]) return <GenericServicePage slug={page} onNavigate={navigate} />;

    return (
      <>
        <HeroSection />
        <ServicesSection onNavigate={navigate} />
        <CTABanner />
        <AboutSection />
        <ContactSection />
      </>
    );
  };

  return (
    <div className="min-h-screen" style={{ background: "#060e20" }}>
      <NavBar onNavigate={navigate} />
      {renderPage()}
      <Footer onNavigate={navigate} />
      <FloatingChatbot />
    </div>
  );
}
