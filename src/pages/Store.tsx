import React, { useEffect, useMemo, useState, useRef } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from '@/contexts/ThemeContext';
import { useLoading } from '@/contexts/LoadingContext';

// === Visual constants ===
const PRIMARY = "#7F22FE";

type Theme = "dark" | "light";
const mode = (theme: Theme, darkCls: string, lightCls: string) => (theme === "dark" ? darkCls : lightCls);

// === Small primitives (mantidos) ==========================================================
function Chip({ label, active = false, onClick }: { label: string; active?: boolean; onClick?: () => void }) {
  const { theme } = useTheme();
  const base = mode(
    theme,
    "border-white/10 text-white/70 hover:bg-white/5",
    "border-black/10 text-zinc-700 hover:bg-black/5"
  );
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
        active ? "border-[#7F22FE]/40 text-white font-bold" : base
      }`}
      style={active ? { backgroundColor: 'rgba(127, 34, 254, 0.2)' } : undefined}
    >
      {label}
    </button>
  );
}

function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <span className="group relative">
      {children}
      <span
        className={`pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-1 text-[11px] opacity-0 shadow-lg backdrop-blur transition-opacity group-hover:opacity-100 group-active:opacity-100 ${mode(
          theme,
          "bg-black/70 text-white",
          "bg-black/70 text-white"
        )}`}
      >
        {text}
      </span>
    </span>
  );
}

function Card({ children, className = "", ...props }: { children: React.ReactNode; className?: string; [key: string]: any }) {
  const { theme } = useTheme();
  return (
    <div className={`rounded-2xl border backdrop-blur p-4 ${mode(theme, "border-white/10 bg-white/5", "border-black/10 bg-white")} ${className}`} {...props}>
      {children}
    </div>
  );
}

// === Tipos e dados (iguais ao anterior) ===================================================
export type Area = "Todas" | "Comercial" | "Supply" | "Financeiro" | "Operações";
export type Categoria =
  | "Dashboards"
  | "Risco & Compliance"
  | "Automação"
  | "Integrações"
  | "Relatórios"
  | "IA Assistida"
  | "Planejamento"
  | "Análises";

export type AppCard = {
  id: string;
  title: string;
  desc: string;
  area: Exclude<Area, "Todas">;
  categorias: Categoria[];
  instalado?: boolean;
  badge?: "novo" | "beta" | "recomendado";
};

const AREAS: Area[] = ["Todas", "Comercial", "Supply", "Financeiro", "Operações"];
const CATEGORIAS: Categoria[] = [
  "Dashboards",
  "Risco & Compliance",
  "Automação",
  "Integrações",
  "Relatórios",
  "IA Assistida",
  "Planejamento",
  "Análises",
];

const DATA: AppCard[] = [
  { id: "c1", title: "Integrações 36", desc: "Ferramenta de controle de integrações", area: "Comercial", categorias: ["Integrações", "Relatórios"], instalado: true, badge: "recomendado" },
  { id: "c2", title: "IA Assistida 6", desc: "Ferramenta de controle assistido por IA", area: "Comercial", categorias: ["IA Assistida", "Automação"] },
  { id: "c3", title: "Análises 24", desc: "Ferramenta de comparativos e tendências", area: "Comercial", categorias: ["Análises", "Dashboards"], badge: "novo" },
  { id: "c4", title: "Risco & Compliance 12", desc: "Pipeline de risco para propostas", area: "Comercial", categorias: ["Risco & Compliance"] },
  { id: "c5", title: "Planejamento Comercial", desc: "Planejamento de metas e FTEs", area: "Comercial", categorias: ["Planejamento", "Dashboards"] },
  { id: "c6", title: "Relatórios Comerciais", desc: "Modelo de relatórios executivos", area: "Comercial", categorias: ["Relatórios"] },
  { id: "c7", title: "Automação de Propostas", desc: "Templates e fluxo de aprovação", area: "Comercial", categorias: ["Automação", "Relatórios"], badge: "beta" },
  { id: "c8", title: "CRM Insights", desc: "Insights de conversão e ROAS", area: "Comercial", categorias: ["Análises", "Dashboards"] },
  { id: "s1", title: "Supply Dashboard", desc: "KPIs de supply e OTIF", area: "Supply", categorias: ["Dashboards", "Relatórios"] },
  { id: "f1", title: "Finance Hub", desc: "EBITDA, Forecast, AR", area: "Financeiro", categorias: ["Dashboards", "Análises"], badge: "recomendado" },
  { id: "o1", title: "Operações SLA", desc: "Monitor de SLAs críticos", area: "Operações", categorias: ["Dashboards", "Planejamento"] },
  { id: "o2", title: "WFM Automação", desc: "Escalas e alocação de FTEs", area: "Operações", categorias: ["Automação", "Planejamento"] },
];

function StoreCard({ app, onToggleInstall }: { app: AppCard; onToggleInstall: (id: string) => void }) {
  const { theme } = useTheme();
  const installed = !!app.instalado;
  const labels: string[] = [];
  if (app.badge) labels.push(app.badge);
  const visibleLabels = labels.slice(-2);

  const labelClass = (lbl: string) =>
    lbl === "novo"
      ? "border-emerald-400/40 text-emerald-600"
      : lbl === "beta"
      ? "border-amber-400/40 text-amber-600"
      : lbl === "recomendado"
      ? "border-[var(--p)]/60 text-[var(--fg)]"
      : mode(theme, "border-white/20 text-white/70", "border-black/20 text-zinc-600");

  return (
    <div data-store-card>
      <Card
        className={`relative p-5 ${mode(theme, "text-white", "text-zinc-900")}`}
      >
        <div style={{ height: "var(--card-h)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          {/* Linha 1 */}
          <div className="flex items-center justify-between gap-3">
            <div className={`text-[11px] ${mode(theme, "text-white/60", "text-zinc-600")}`}>{app.area}</div>
            <div className="flex items-center gap-1 flex-row-reverse min-h-[20px] min-w-[70px]">
              {visibleLabels.map((lbl, i) => (
                <span
                  key={i}
                  className={`text-[10px] rounded-full px-2 py-0.5 border ${labelClass(lbl)}`}
                  style={{ "--p": PRIMARY, "--fg": mode(theme, "#ffffff", "#111827") } as any}
                >
                  {lbl}
                </span>
              ))}
            </div>
          </div>

          {/* Linha 2 */}
          <div className="flex items-center gap-3 flex-1 min-h-0 pr-1">
            <div
              className="h-10 w-10 shrink-0 rounded-xl ring-1"
              style={{
                background: theme === "dark" ? "rgba(127,34,254,.20)" : "#F3E8FF",
                borderColor: "transparent",
                boxShadow: "inset 0 0 0 1px rgba(127,34,254,.25)",
              }}
            />
            <div className="min-w-0 flex-1 pb-1 overflow-auto" data-el="card-text-area">
              <div className="font-medium text-[16px] break-words" data-el="card-title">{app.title}</div>
              <div className={`text-xs break-words pb-2 ${mode(theme, "text-white/70", "text-zinc-600")}`}>{app.desc}</div>
            </div>
          </div>

          {/* Linha 3 */}
          <div className="mt-0 flex items-center gap-2">
            {installed ? (
              <>
                <Tooltip text="Abrir (mock)">
                  <button
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${mode(
                      theme,
                      "border-white/10 bg-[var(--p)]/20",
                      "border-black/10 bg-violet-100"
                    )}`}
                    style={{ "--p": PRIMARY } as any}
                  >
                    Abrir
                  </button>
                </Tooltip>
                <Tooltip text="Configurar (mock)">
                  <button className={`rounded-lg border px-3 py-1.5 text-xs ${mode(theme, "border-white/10", "border-black/10")}`}>
                    Configurar
                  </button>
                </Tooltip>
              </>
            ) : (
              <>
                <Tooltip text="Instalar (mock)">
                  <button
                    onClick={() => onToggleInstall(app.id)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${mode(
                      theme,
                      "border-white/10 bg-[var(--p)]/20",
                      "border-black/10 bg-violet-100"
                    )}`}
                    style={{ "--p": PRIMARY } as any}
                  >
                    Instalar
                  </button>
                </Tooltip>
                <Tooltip text="Detalhes (mock)">
                  <button className={`rounded-lg border px-3 py-1.5 text-xs ${mode(theme, "border-white/10", "border-black/10")}`}>
                    Detalhes
                  </button>
                </Tooltip>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function StoreMock() {
  const { theme } = useTheme();
  const { withLoading } = useLoading();

  const [area, setArea] = useState<Area>("Todas");
  const [activeCats, setActiveCats] = useState<Categoria[]>([]);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"Relevância" | "Mais recentes" | "Mais instalados">("Relevância");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;
  const gridTopRef = useRef<HTMLDivElement>(null);
  const [apps, setApps] = useState<AppCard[]>(DATA);

  // === SIZER: mede a altura do card "Automação de Propostas" e aplica a todos ===
  const sizerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const measure = () => {
      const el = sizerRef.current;
      const h = el?.getBoundingClientRect().height ?? 220; // fallback
      document.documentElement.style.setProperty('--card-h', `${Math.round(h)}px`);
    };
    // medir após pintura
    requestAnimationFrame(measure);
    // remedir em mudanças de tema/viewport
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [theme]);

  const filtered = useMemo(() => {
    const base = area === "Todas" ? apps : apps.filter((a) => a.area === area);
    const byCat = activeCats.length ? base.filter((a) => activeCats.every((c) => a.categorias.includes(c))) : base;
    const term = q.trim().toLowerCase();
    const byQ = term ? byCat.filter((a) => [a.title, a.desc, ...a.categorias].join(" ").toLowerCase().includes(term)) : byCat;
    const ordered = [...byQ].sort((a, b) => {
      if (sort === "Mais recentes") return b.id.localeCompare(a.id);
      if (sort === "Mais instalados") return Number(!!b.instalado) - Number(!!a.instalado);
      const score = (x: AppCard) => (x.badge === "recomendado" ? 2 : 0) + (x.instalado ? 1 : 0);
      return score(b) - score(a);
    });
    return ordered;
  }, [area, activeCats, q, sort, apps]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = useMemo(() => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE), [filtered, currentPage]);

  useEffect(() => {
    setPage(1);
  }, [area, activeCats, q, sort]);
  useEffect(() => {
    gridTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [currentPage]);

  function toggleCat(c: Categoria) {
    setActiveCats((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  }
  async function toggleInstall(id: string) {
    await withLoading(() => {
      setApps((prev) => prev.map((a) => (a.id === id ? { ...a, instalado: !a.instalado } : a)));
    }, 600);
  }

  // === Vars de tema iguais às da Home (para nav, chips, etc.) ===
  const vars = useMemo(() => {
    if (theme === "light") {
      return {
        "--bg": `radial-gradient(1200px 600px at 20% -10%, rgba(127,34,254,.10), transparent), radial-gradient(1000px 500px at 90% 0%, rgba(60,99,255,.08), transparent), #F7F8FB`,
        "--fg": "#0B0F1A",
        "--muted": "rgba(11,15,26,0.65)",
        "--muted-weak": "rgba(11,15,26,0.55)",
        "--muted-strong": "rgba(11,15,26,0.8)",
        "--panel-bg": "rgba(0,0,0,0.03)",
        "--panel-border": "rgba(0,0,0,0.08)",
        "--chip-border": "rgba(0,0,0,0.12)",
        "--chip-fg": "rgba(11,15,26,0.70)",
        "--chip-hover": "rgba(0,0,0,0.05)",
        "--input-bg": "rgba(0,0,0,0.04)",
        "--placeholder": "rgba(11,15,26,0.40)",
        "--nav-bg": "color-mix(in oklab, var(--bg) 88%, black 12%)",
        "--nav-border": "rgba(0,0,0,0.10)",
        "--nav-shadow": "0 4px 12px rgba(0,0,0,0.06)",
        "--card-h": "220px",
      } as React.CSSProperties;
    }
    return {
      "--bg": `radial-gradient(1200px 600px at 20% -10%, rgba(127,34,254,.18), transparent), radial-gradient(1000px 500px at 90% 0%, rgba(60,99,255,.12), transparent), #0B0F1A`,
      "--fg": "#FFFFFF",
      "--muted": "rgba(255,255,255,0.70)",
      "--muted-weak": "rgba(255,255,255,0.60)",
      "--muted-strong": "rgba(255,255,255,0.80)",
      "--panel-bg": "rgba(255,255,255,0.05)",
      "--panel-border": "rgba(255,255,255,0.10)",
      "--chip-border": "rgba(255,255,255,0.15)",
      "--chip-fg": "rgba(255,255,255,0.80)",
      "--chip-hover": "rgba(255,255,255,0.08)",
      "--input-bg": "rgba(0,0,0,0.30)",
      "--placeholder": "rgba(255,255,255,0.40)",
      "--nav-bg": "color-mix(in oklab, var(--bg) 90%, black 10%)",
      "--nav-border": "rgba(255,255,255,0.12)",
      "--nav-shadow": "0 6px 18px rgba(0,0,0,0.35)",
      "--card-h": "220px",
    } as React.CSSProperties;
  }, [theme]);

  return (
    <div className="min-h-screen pt-28" style={{ ...vars, background: "var(--bg)", color: "var(--fg)" }}>
      <main className="mx-auto max-w-[1400px] p-4 md:p-6">
        {/* Barra global de filtros */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {CATEGORIAS.map((c) => (
            <Chip key={c} label={c} active={activeCats.includes(c)} onClick={() => toggleCat(c)} />
          ))}
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <Search className={`h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-[color:var(--placeholder)]`} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar por nome ou função..."
                className={`pl-8 pr-3 py-1.5 rounded-xl border text-sm outline-none bg-[var(--panel-bg)] border-[var(--panel-border)] placeholder-[var(--placeholder)]`}
                style={{ color: "var(--fg)" }}
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className={`rounded-xl border text-sm px-2 py-1.5 bg-[var(--panel-bg)] border-[var(--panel-border)]`}
              style={{ color: "var(--fg)" }}
            >
              <option>Relevância</option>
              <option>Mais recentes</option>
              <option>Mais instalados</option>
            </select>
          </div>
        </div>

          <div className="grid grid-cols-[260px_1fr] gap-6">
            {/* Left rail (áreas) */}
            <aside>
              <Card>
                <div className="text-sm font-medium mb-3" style={{ color: "var(--fg)" }}>
                  App selection by area
                </div>
                <div className="space-y-2">
                  {AREAS.map((a) => (
                    <button
                      key={a}
                      onClick={() => setArea(a)}
                      aria-pressed={area === a}
                      className={`w-full text-left rounded-xl border px-3 py-3 text-sm transition-colors ${
                        area === a
                          ? "border-[#7F22FE]/40 text-white font-bold"
                          : mode(theme, "bg-white/5 border-white/10 hover:bg-white/10", "bg-white border-black/10 hover:bg-black/5")
                      }`}
                      style={area === a ? { backgroundColor: 'rgba(127, 34, 254, 0.15)' } : { color: "var(--fg)" }}
                    >
                      <div className="font-medium" style={{ color: "var(--fg)" }}>
                        {a}
                      </div>
                      <div className={`${mode(theme, "text-white/60", "text-zinc-600")} text-xs`}>
                        {(a === "Todas" ? DATA : DATA.filter((x) => x.area === a)).length} apps
                      </div>
                    </button>
                  ))}
                </div>
              </Card>
            </aside>

            {/* Main (cards) */}
            <section className="space-y-1.5 -mt-1">
              <div ref={gridTopRef} />
              {paged.length === 0 ? (
                <Card className="text-center text-sm" style={{ color: "var(--muted)" }}>
                  Nenhum app encontrado.{" "}
                  <button
                    onClick={() => {
                      setActiveCats([]);
                      setQ("");
                    }}
                    className="underline"
                    style={{ color: "var(--fg)" }}
                  >
                    Limpar filtros
                  </button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {paged.map((app) => (
                    <StoreCard key={app.id} app={app} onToggleInstall={toggleInstall} />
                  ))}
                </div>
              )}

              {/* Paginação */}
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={`h-8 w-8 grid place-items-center rounded-md border disabled:opacity-40 ${mode(
                    theme,
                    "border-white/10",
                    "border-black/10"
                  )}`}
                  aria-label="Página anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    aria-current={currentPage === i + 1}
                    className={`h-8 w-8 rounded-md border text-sm ${
                      currentPage === i + 1 
                        ? "border-[#7F22FE]/40 text-white font-bold" 
                        : mode(theme, "border-white/10 text-white hover:bg-white/10", "border-black/10 text-zinc-800 hover:bg-black/5")
                    }`}
                    style={currentPage === i + 1 ? { backgroundColor: 'rgba(127, 34, 254, 0.2)' } : undefined}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className={`h-8 w-8 grid place-items-center rounded-md border disabled:opacity-40 ${mode(
                    theme,
                    "border-white/10",
                    "border-black/10"
                  )}`}
                  aria-label="Próxima página"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </section>
          </div>

          {/* Sizer escondido: mede o card "Automação de Propostas" para definir --card-h */}
          <div style={{ position: 'fixed', left: -9999, top: -9999, opacity: 0, pointerEvents: 'none' }} aria-hidden>
            <div ref={sizerRef}>
              <Card className={`relative p-5 ${mode(theme, "text-white", "text-zinc-900")}`}>
                <div style={{ width: 320 }}>
                  <div className="flex items-center justify-between gap-3">
                    <div className={`text-[11px] ${mode(theme, "text-white/60", "text-zinc-600")}`}>Comercial</div>
                    <div className="flex items-center gap-1 flex-row-reverse min-h-[20px] min-w-[70px]">
                      <span className={`text-[10px] rounded-full px-2 py-0.5 border border-[var(--p)]/60`} style={{ "--p": PRIMARY } as any}>
                        beta
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 mt-3">
                    <div className={`mt-1 h-10 w-10 shrink-0 rounded-xl ring-1`} />
                    <div className="min-w-0 flex-1 pb-1">
                      <div className="font-medium text-[16px] break-words">Automação de Propostas</div>
                      <div className={`text-xs break-words pb-2 ${mode(theme, "text-white/70", "text-zinc-600")}`}>
                        Templates e fluxo de aprovação
                      </div>
                    </div>
                  </div>
                  <div className="mt-0 flex items-center gap-2">
                    <button className={`rounded-lg border px-3 py-1.5 text-xs`}>Instalar</button>
                    <button className={`rounded-lg border px-3 py-1.5 text-xs`}>Detalhes</button>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* smoke checks / tests */}
          <Smoke />
        </main>
      </div>
    );
  }

// ==== Runtime testcases (não alteram lógica de produto) ==================================
function Smoke() {
  useEffect(() => {
    // Teste 1: Navbar central existe
    const navCapsule = document.querySelector('header nav');
    console.assert(!!navCapsule, 'Navbar central (cápsula) deve existir');

    // Teste 2: Avatar 50x50 acessível
    const avatar = document.querySelector('header [aria-label="Perfil"]');
    console.assert(!!avatar, 'Avatar circular 50x50 deve existir');
    if (avatar instanceof HTMLElement) {
      const { width, height } = avatar.getBoundingClientRect();
      console.assert(Math.round(width) === 50 && Math.round(height) === 50, 'Avatar deve ser 50x50');
    }

    // Teste 3: Máximo de 8 cards por página
    const cards = document.querySelectorAll('[data-store-card] > div > div');
    // cards NodeList -> cada item corresponde ao wrapper interno com height: var(--card-h)
    console.assert(cards.length <= 8, 'Máx. 8 cards por página');

    // Teste 4: Todos os cards iguais à altura alvo
    const target = getComputedStyle(document.documentElement).getPropertyValue('--card-h').trim();
    if (target) {
      const targetPx = parseInt(target);
      cards.forEach((c) => {
        const h = Math.round((c as HTMLElement).getBoundingClientRect().height);
        console.assert(h === targetPx, `Card deve ter altura fixa ${targetPx}px, obtido ${h}px`);
      });
    }

    // Teste 5: Aba ativa padrão é "store"
    const activeBtn = document.querySelector('header nav button[aria-current="page"]');
    console.assert(!!activeBtn, 'Uma aba deve estar ativa por padrão');

    // Teste 6 (novo): Quando ativo é "store", o botão ativo deve ser o do MEIO (Home, Store, Settings)
    const navButtons = Array.from(document.querySelectorAll('header nav button'));
    if (navButtons.length >= 3) {
      const middle = navButtons[1];
      console.assert(middle === activeBtn, 'O item ativo (store) deve estar ao centro');
    }

    // Teste 7 (novo): Título não deve estar truncado por classes utilitárias
    const titleEl = document.querySelector('[data-el="card-title"]');
    console.assert(!!titleEl, 'Deve existir um título de card');
    if (titleEl) {
      const cls = (titleEl as HTMLElement).className || '';
      console.assert(!/line-clamp|truncate/.test(cls), 'Título não deve usar line-clamp/truncate');
    }

    // Teste 8 (novo): Área de texto é rolável para manter o box fixo quando conteúdo extrapola
    const textArea = document.querySelector('[data-el="card-text-area"]');
    console.assert(!!textArea, 'Deve existir área de texto do card');
    if (textArea) {
      const style = getComputedStyle(textArea as HTMLElement);
      console.assert(style.overflowY === 'auto' || style.overflow === 'auto' || (textArea as HTMLElement).className.includes('overflow-auto'), 'Área de texto deve permitir scroll (overflow-auto)');
    }

    // Teste 9 (novo): Ícone/texto centralizados verticalmente dentro do bloco do meio
    const middleRow = document.querySelector('[data-store-card] .flex.flex-1.min-h-0.pr-1');
    const middleIcon = document.querySelector('[data-store-card] .flex.flex-1.min-h-0.pr-1 > div.rounded-xl');
    if (middleRow && middleIcon) {
      const pr = (middleRow as HTMLElement).getBoundingClientRect();
      const ic = (middleIcon as HTMLElement).getBoundingClientRect();
      const parentCenter = pr.top + pr.height / 2;
      const iconCenter = ic.top + ic.height / 2;
      const delta = Math.abs(Math.round(parentCenter - iconCenter));
      console.assert(delta <= 2, `Conteúdo do meio deve estar centralizado verticalmente (delta ${delta}px)`);
    }
  }, []);
  return null;
}
