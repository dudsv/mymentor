import React from "react";
import { useState, useEffect, useMemo, useRef } from "react";
import { ChevronRight, Plus, MessageSquare, BarChart3, Clock } from "lucide-react";
import { useTheme } from '@/contexts/ThemeContext';
import { useLoading } from '@/contexts/LoadingContext';
import { useCustomFolders } from '@/contexts/CustomFoldersContext';
import FolderManagementModal from '@/components/FolderManagementModal';

// Paleta
const PRIMARY = "#7F22FE";
// Logo (mock) para cards internos (Toolkit/Assistente)
const LOGO_SRC = "https://raw.githubusercontent.com/dudsv/nestle-tools/refs/heads/main/image%2041%20(1).png";

type Tone = 'good' | 'warn' | 'bad';
type FolderId = 'hr' | 'new' | 'financas' | 'all';
type Theme = 'light' | 'dark';

// >>> Ajuste de contraste: classes diferentes para light/dark
function getToneClasses(theme: Theme, t: Tone){
  if(theme === 'light'){
    // tons mais escuros e fundo um pouco mais forte para legibilidade
    return {
      card: t==='good' ? 'border-emerald-500/35 bg-emerald-500/10' : t==='warn' ? 'border-amber-500/35 bg-amber-500/10' : 'border-red-500/35 bg-red-500/10',
      text: t==='good' ? 'text-emerald-700' : t==='warn' ? 'text-amber-700' : 'text-red-700',
      borderBtn: t==='good' ? 'border-emerald-600/50 text-emerald-700' : t==='warn' ? 'border-amber-600/50 text-amber-700' : 'border-red-600/50 text-red-700',
    };
  }
  // dark mantém estética suave
  return {
    card: t==='good' ? 'border-emerald-400/30 bg-emerald-400/5' : t==='warn' ? 'border-amber-400/30 bg-amber-400/5' : 'border-red-400/30 bg-red-400/5',
    text: t==='good' ? 'text-emerald-300' : t==='warn' ? 'text-amber-300' : 'text-red-300',
    borderBtn: t==='good' ? 'border-emerald-400/40 text-emerald-300' : t==='warn' ? 'border-amber-400/40 text-amber-300' : 'border-red-400/40 text-red-300',
  };
}

function Chip({ label, active=false, onClick }: {label:string; active?:boolean; onClick?:()=>void}){
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border transition-colors ${
        active ? "border-[#7F22FE]/40 text-white font-bold" : "border-[var(--chip-border)] text-[var(--chip-fg)] hover:bg-[var(--chip-hover)]"
      }`}
      style={active ? { backgroundColor: 'rgba(127, 34, 254, 0.1)' } : undefined}
    >
      {label}
    </button>
  );
}

// Tooltip simples (hover/click)
function Tooltip({children, text}:{children: React.ReactNode; text:string}){
  return (
    <span className="group relative">
      {children}
      <span className="pointer-events-none absolute -top-8 right-0 whitespace-nowrap rounded-md bg-black/70 px-2 py-1 text-[11px] text-white opacity-0 shadow-lg backdrop-blur transition-opacity group-hover:opacity-100 group-active:opacity-100">
        {text}
      </span>
    </span>
  );
}

function Card({ children, className="", ...props }: {children: React.ReactNode; className?: string; [key: string]: any}){
  return (
    <div className={`rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] backdrop-blur p-4 ${className}`} {...props}>{children}</div>
  );
}

function Metric({ title, value, report, theme }: {title:string; value:string; report:string; theme:Theme}){
  // cor do relatório: verde se positivo, vermelho se negativo, amarelo se neutro/zero
  const trimmed = (report || '').trim();
  const tone: Tone = trimmed.startsWith('-') ? 'bad' : trimmed.startsWith('+') ? 'good' : 'warn';
  const cls = getToneClasses(theme, tone);
  return (
    <Card>
      <div data-testid="metric-card">
        <div className="text-sm text-[var(--muted)]">{title}</div>
        <div className="mt-1 text-2xl font-semibold text-[var(--fg)] tabular-nums leading-tight">{value}</div>
        <div className={`mt-1 text-sm tabular-nums ${cls.text}`}>{report}</div>
      </div>
    </Card>
  );
}

function Toolkit(){
  const items = [
    { icon: <BarChart3 className="h-4 w-4"/>, t: "Cockpit view gestor", s: "PowerBI" },
    { icon: <Clock className="h-4 w-4"/>, t: "EzTime Insights", s: "Relógio & produtividade" },
  ];
  return (
    <Card className="space-y-3">
      <div className="flex items-center gap-2">
        <img
          data-source-pos="609:10-609:115"
          data-source-name="img"
          src="https://raw.githubusercontent.com/dudsv/nestle-tools/refs/heads/main/image%2041%20(1).png"
          alt="Logo MyAI"
          className="h-16 w-16 rounded-sm object-contain border-0 shadow-none outline-none"
          style={{ maxWidth: '20%' }}
        />
        <h3 className="font-semibold">MyAiMentor Toolkit</h3>
      </div>
      <div className="space-y-2">
        {items.map((x,i)=> (
          <div key={i} className="flex items-center justify-between rounded-xl border border-[var(--panel-border)] bg-white/[.03] p-3">
            <div className="flex items-center gap-3">
              <div className="grid place-items-center h-8 w-8 rounded-lg bg-[var(--panel-bg)] border border-[var(--panel-border)]">
                {x.icon}
              </div>
              <div>
                <div className="text-sm font-medium text-[var(--fg)]">{x.t}</div>
                <div className="text-xs text-[color:var(--muted-weak)]">{x.s}</div>
              </div>
            </div>
            <Tooltip text="Função em desenvolvimento">
              <button className="rounded-lg text-xs px-3 py-1.5 border border-[var(--panel-border)] hover:opacity-90">Abrir</button>
            </Tooltip>
          </div>
        ))}
      </div>
    </Card>
  );
}

function GestorTools(){
  const { theme } = useTheme();
  const { folders } = useCustomFolders();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Pastas (abas) — ordem: Todas · HR · New Services · Finanças
  const FOLDERS = [
    { id: 'all', name: 'Todas' },
    { id: 'hr', name: 'HR' },
    { id: 'new', name: 'New Services' },
    { id: 'financas', name: 'Finanças' },
  ] as const;

  type FolderId = typeof FOLDERS[number]['id'] | string;
  const [folder, setFolder] = useState<FolderId>('all');

  // Combinar pastas base com pastas customizadas
  const allFolders = [
    ...FOLDERS,
    ...folders.map(f => ({ id: f.id, name: f.name, color: f.color }))
  ];

  const tools = [
    { id: 'scorecards', t: 'Scorecards', d: 'KPIs por área, metas e owners', folderId: 'new' },
    { id: 'risk-register', t: 'Risk Register', d: 'Riscos, impacto, mitigação', folderId: 'hr' },
    { id: 'finance-hub', t: 'Finance Hub', d: 'Receita, EBITDA, fluxo de caixa', folderId: 'financas' },
  ];

  const currentTools = folder === 'all'
    ? tools
    : tools.filter(x => x.folderId === folder);

  // Se a pasta selecionada for uma pasta customizada, mostrar seus apps
  const isCustomFolder = !['all', 'hr', 'new', 'financas'].includes(folder);
  const currentCustomFolder = isCustomFolder ? folders.find(f => f.id === folder) : null;
  const displayApps = currentCustomFolder?.apps || [];

  return (
    <>
      <Card className="space-y-3 md:min-h-[420px]">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Ferramentas do gestor</h3>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1 text-xs rounded-lg border border-[var(--panel-border)] px-2 py-1 hover:opacity-90"
          >
            <Plus className="h-3 w-3"/> Adicionar
          </button>
        </div>

      {/* Abas / Pílulas de organização */}
      <div className="flex flex-wrap items-center gap-2" data-testid="gestor-folders">
        {allFolders.map((f) => {
          const isCustom = !FOLDERS.find(base => base.id === f.id);
          const isActive = folder === f.id;
          
          return (
            <button
              key={f.id}
              data-testid={`folder-${f.id}`}
              onClick={() => setFolder(f.id)}
              aria-pressed={isActive}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium border transition-colors ${
                isActive 
                  ? (isCustom ? 'border-[#7F22FE]/40 text-white font-bold' : 'border-[#7F22FE]/40 text-white font-bold')
                  : 'border-[var(--chip-border)] text-[var(--chip-fg)] hover:bg-[var(--chip-hover)]'
              }`}
              style={
                isActive && isCustom 
                  ? { backgroundColor: (f as any).color } 
                  : isActive && !isCustom 
                    ? { backgroundColor: 'rgba(127, 34, 254, 0.1)' }
                    : undefined
              }
            >
              {isCustom && (
                <div className="w-3 h-3 rounded" style={{ backgroundColor: (f as any).color }} />
              )}
              {f.name}
            </button>
          );
        })}
        
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          data-testid="folder-add"
          className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium border border-dashed border-[var(--panel-border)] text-[var(--muted)] hover:opacity-90"
        >
          <Plus className="h-3 w-3"/> Pasta
        </button>
      </div>

      {/* Lista de ferramentas (filtrada) ou apps customizados */}
      <div className="space-y-2">
        {isCustomFolder && displayApps.length === 0 && (
          <div className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-4 text-sm text-[var(--muted)]">
            <div className="font-medium text-[var(--fg)]">Nenhum app nesta pasta</div>
            <div className="mt-1">Clique em <span className="text-[var(--fg)]">Adicionar</span> ou <span className="text-[var(--fg)]">+ Pasta</span> para gerenciar apps.</div>
            <button onClick={() => setIsModalOpen(true)} className="mt-3 rounded-lg border border-[var(--panel-border)] px-3 py-1.5 text-xs hover:opacity-90">Gerenciar Apps</button>
          </div>
        )}
        
        {isCustomFolder && displayApps.map((app) => (
          <div key={app.id} className="flex items-center justify-between rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-3">
            <div>
              <div className="text-sm font-medium text-[var(--fg)]">{app.name}</div>
              <div className="text-xs text-[color:var(--muted-weak)]">{app.description}</div>
            </div>
            <Tooltip text="App placeholder">
              <button className="rounded-lg text-xs px-3 py-1.5 border border-[var(--panel-border)] hover:opacity-90">Abrir</button>
            </Tooltip>
          </div>
        ))}
        
        {!isCustomFolder && currentTools.length === 0 && (
          <div className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-4 text-sm text-[var(--muted)]">
            <div className="font-medium text-[var(--fg)]">Nenhuma ferramenta nesta pasta</div>
            <div className="mt-1">Use <span className="text-[var(--fg)]">Reorganizar</span> para mover ferramentas para esta pasta.</div>
            <button disabled className="mt-3 cursor-not-allowed rounded-lg border border-[var(--panel-border)] px-3 py-1.5 text-xs opacity-50">Reorganizar</button>
          </div>
        )}
        
        {!isCustomFolder && currentTools.map((x)=> (
          <div key={x.id} className="flex items-center justify-between rounded-xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-3">
            <div>
              <div className="text-sm font-medium text-[var(--fg)]">{x.t}</div>
              <div className="text-xs text-[color:var(--muted-weak)]">{x.d}</div>
            </div>
            <Tooltip text="Mock">
              <button className="rounded-lg text-xs px-3 py-1.5 border border-[var(--panel-border)] hover:opacity-90">Abrir</button>
            </Tooltip>
          </div>
        ))}
      </div>
    </Card>
    
    <FolderManagementModal 
      isOpen={isModalOpen} 
      onClose={() => setIsModalOpen(false)}
      theme={theme === 'light' ? 'light' : 'dark'}
    />
  </>
  );
}

function QuickOverviews({folder, onChange, theme}:{folder:FolderId; onChange:(f:FolderId)=>void; theme:Theme}){
  const order: {id:FolderId; label:string}[] = [
    {id:'hr', label:'HR'},
    {id:'new', label:'New Services'},
    {id:'financas', label:'Finanças'},
    {id:'all', label:'Todas'},
  ];

  // Mock de métricas por área (cada uma com 4 cards)
  const metricsByFolder: Record<Exclude<FolderId,'all'>, Array<{title:string; value:string; report:string}>> = {
    hr: [
      { title: 'FTEs alocados', value: '312', report: '+6 FTEs' },
      { title: 'Cobertura de turnos', value: '92%', report: '-3 FTEs' },
      { title: 'Absenteísmo', value: '4,1%', report: '0' },
      { title: 'Treinamentos válidos', value: '85%', report: '+5' },
    ],
    new: [
      { title: 'Pedidos no pipeline', value: '48', report: '+4' },
      { title: 'Conversões', value: '12', report: '-2' },
      { title: 'Onboarding (dias)', value: '18', report: '0' },
      { title: 'FTEs em pré-venda', value: '22', report: '+3 FTEs' },
    ],
    financas: [
      { title: 'Riscos altos', value: '2', report: '-1' },
      { title: 'Forecast receita', value: 'R$ 312M', report: '+2.3%' },
      { title: 'AR > 90 dias', value: '7', report: '-2' },
      { title: 'Opex (FTE eq.)', value: '186', report: '0' },
    ],
  };

  const metrics = useMemo(()=>{
    if(folder==='all'){
      return [...metricsByFolder.hr, ...metricsByFolder.new, ...metricsByFolder.financas];
    }
    return metricsByFolder[folder];
  },[folder]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <h2 className="text-[var(--fg)] text-lg font-semibold">Overviews rápidos</h2>
        <div className="flex gap-2">
          {order.map((c)=> (
            <Chip key={c.id} label={c.label} active={folder===c.id} onClick={()=>onChange(c.id)} />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metrics.map((m,idx)=> (
          <Metric key={idx} title={m.title} value={m.value} report={m.report} theme={theme}/>
        ))}
      </div>
    </div>
  );
}

// --- Data (mock) por pasta ---
function useMockData(folder: FolderId){
  const base = {
    hr: {
      insights: [
        { t: 'Rebalancear FTEs em recrutamento (+6 FTEs)', s: 'Melhorar lead time de vagas críticas', tone: 'good' as Tone, src: 'Scorecards → FTEs' },
        { t: 'Reduzir horas extras (-12 FTEs-equivalente)', s: 'Política e automação de ponto', tone: 'good' as Tone, src: 'EzTime → FTEs' },
        { t: 'Absenteísmo acima do alvo', s: 'Cobertura de turnos sob risco', tone: 'bad' as Tone, src: 'Scorecards → FTEs' },
        { t: 'Treinamentos obrigatórios vencendo', s: 'Compliance de certificações', tone: 'warn' as Tone, src: 'LMS → Compliance' },
      ],
      risks: Array.from({length: 8}).map((_,i)=> ({ t:`FTEs críticos descobertos #${i+1}`, s:'Backoffice sem cobertura total', tone: (i%3===0?'bad': i%3===1?'warn':'good') as Tone, src:'Scorecards → FTEs' })),
    },
    new: {
      insights: [
        { t: 'Acelerar 5 contas com prob. >70%', s: 'Potencial +R$ 18M no tri', tone: 'good' as Tone, src: 'CRM → Pipeline' },
        { t: 'Alocar 4 FTEs para hunting', s: 'Reduz gargalos em pré-venda', tone: 'good' as Tone, src: 'CRM → FTEs' },
        { t: 'Churn em 3 contas-chave', s: 'Engajar CS e ofertar bundle', tone: 'bad' as Tone, src: 'CRM → Health' },
        { t: 'SLAs de onboarding inconsistentes', s: 'Padronizar playbook', tone: 'warn' as Tone, src: 'Ops → SLAs' },
      ],
      risks: Array.from({length: 9}).map((_,i)=> ({ t:`Leads sem owner #${i+1}`, s:'Distribuição de FTEs desequilibrada', tone: (i%3===0?'warn': i%3===1?'bad':'good') as Tone, src:'CRM → Regras' })),
    },
    financas: {
      insights: [
        { t: 'EBITDA com alavanca de FTEs', s: 'Reduzir 10 FTEs-equivalente em Opex', tone: 'good' as Tone, src: 'Finance Hub → Opex' },
        { t: 'Forecast com pressão de FTEs', s: 'Avaliar freezing de vagas', tone: 'warn' as Tone, src: 'Finance Hub → Forecast' },
        { t: 'Contas a receber antigas', s: 'Aumentar FTEs de cobrança', tone: 'bad' as Tone, src: 'Finance Hub → AR' },
        { t: 'Negociar fornecedores', s: 'Reduzir custo unidade', tone: 'good' as Tone, src: 'Finance Hub → Spend' },
      ],
      risks: Array.from({length: 10}).map((_,i)=> ({ t:`Desvios em centros de custo #${i+1}`, s:'Atenção aos FTEs alocados', tone: (i%3===0?'good': i%3===1?'warn':'bad') as Tone, src:'Finance Hub → Centros' })),
    }
  } as const;

  if (folder==='all'){
    return {
      // concatenar todos os insights para habilitar o slider com múltiplos slides
      insights: [...base.hr.insights, ...base.new.insights, ...base.financas.insights],
      risks: [...base.hr.risks, ...base.new.risks, ...base.financas.risks],
    };
  }
  return base[folder];
}

// --- Helpers ---
function chunk<T>(arr:T[], size:number){ const out:T[][]=[]; for(let i=0;i<arr.length;i+=size) out.push(arr.slice(i,i+size)); return out; }

function AIInsights({items, onDeepDive, folder, theme}:{items: readonly {t:string; s:string; tone:Tone; src:string}[] | {t:string; s:string; tone:Tone; src:string}[]; onDeepDive:(payload:{t:string;s:string;src:string;tone:Tone})=>void; folder:FolderId; theme:Theme}){
  const isAll = folder==='all';
  const slides = useMemo(()=> isAll ? chunk(Array.from(items), 4) : [Array.from(items).slice(0,4)], [items, isAll]);
  const [page, setPage] = useState(0);
  const wrap = (n:number)=> (n+slides.length)%slides.length;
  const containerRef = useRef<HTMLDivElement>(null);

  // Garanta que o índice da página seja válido quando o conjunto de slides mudar (ex.: volta de "all" para "hr")
  useEffect(()=>{
    setPage(p => (slides.length ? Math.min(Math.max(p,0), slides.length-1) : 0));
  }, [slides.length]);

  // autoplay simples quando for slider
  useEffect(()=>{
    if(!isAll || slides.length<=1) return;
    const id = window.setInterval(()=> setPage(p=>wrap(p+1)), 5000);
    return ()=> window.clearInterval(id);
  },[isAll, slides.length]);

  // drag simples (somente quando slider)
  useEffect(()=>{
    if(!isAll) return;
    const el = containerRef.current; if(!el) return;
    let startX=0, dx=0, dragging=false;
    const down=(e:any)=>{ dragging=true; startX = 'touches' in e ? e.touches[0].clientX : e.clientX; dx=0; };
    const move=(e:any)=>{ if(!dragging) return; const x = 'touches' in e ? e.touches[0].clientX : e.clientX; dx = x-startX; };
    const up=()=>{ if(!dragging) return; dragging=false; if(Math.abs(dx)>40){ setPage(p=>wrap(p + (dx<0?1:-1))); } };
    el.addEventListener('pointerdown', down as any); el.addEventListener('pointermove', move as any); el.addEventListener('pointerup', up as any);
    el.addEventListener('touchstart', down as any, {passive:true}); el.addEventListener('touchmove', move as any, {passive:true}); el.addEventListener('touchend', up as any);
    return ()=>{
      el.removeEventListener('pointerdown', down as any); el.removeEventListener('pointermove', move as any); el.removeEventListener('pointerup', up as any);
      el.removeEventListener('touchstart', down as any); el.removeEventListener('touchmove', move as any); el.removeEventListener('touchend', up as any);
    };
  },[isAll, slides.length]);

  const current = slides[page] ?? [];

  return (
    <div className="space-y-3" ref={containerRef}>
      <div className="flex items-center justify-between">
        <h2 className="text-[var(--fg)] text-lg font-semibold">Insights gerados por IA</h2>
        {isAll && (
          <div className="flex items-center gap-2">
            <button onClick={()=>setPage(p=>wrap(p-1))} aria-label="Anterior" className="h-7 w-7 grid place-items-center rounded-md border border-[var(--panel-border)] hover:opacity-90">‹</button>
            <button onClick={()=>setPage(p=>wrap(p+1))} aria-label="Próximo" className="h-7 w-7 grid place-items-center rounded-md border border-[var(--panel-border)] hover:opacity-90">›</button>
          </div>
        )}
      </div>
      {current.length>0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {current.map((x,i)=> {
            const cls = getToneClasses(theme, x.tone);
            return (
              <Card key={i} className={`relative flex items-start gap-4 ${cls.card} min-h-[120px]`} data-tone={x.tone}>
                <div className="pr-20">
                  <div className={`text-sm font-medium ${cls.text}`}>{x.t}</div>
                  <div className="text-sm text-[color:var(--muted-strong)] mt-1">{x.s}</div>
                </div>
                <button
                  onClick={()=>onDeepDive(x)}
                  className={`absolute bottom-3 right-3 rounded-lg px-3 py-1.5 text-xs font-medium border hover:opacity-90 ${cls.borderBtn}`}
                >
                  Aprofundar
                </button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RisksAlertsSlider({items, theme}:{items:{t:string;s:string;tone:Tone;src:string}[]; theme:Theme}){
  const slides = useMemo(()=> chunk(items, 4), [items]);
  const [page, setPage] = useState(0);
  const wrap = (n:number)=> (n+slides.length)%slides.length;
  const containerRef = useRef<HTMLDivElement>(null);
  const autoplayMs = 5000;

  // Garante índice válido quando o número de slides muda
  useEffect(()=>{
    setPage(p => (slides.length ? Math.min(Math.max(p,0), slides.length-1) : 0));
  }, [slides.length]);

  useEffect(()=>{
    if(slides.length<=1) return;
    const id = window.setInterval(()=> setPage(p=>wrap(p+1)), autoplayMs);
    return ()=> window.clearInterval(id);
  },[slides.length]);

  // drag básico
  useEffect(()=>{
    const el = containerRef.current; if(!el) return;
    let startX=0, dx=0, dragging=false;
    const down=(e:any)=>{ dragging=true; startX = 'touches' in e ? e.touches[0].clientX : e.clientX; dx=0; };
    const move=(e:any)=>{ if(!dragging) return; const x = 'touches' in e ? e.touches[0].clientX : e.clientX; dx = x-startX; };
    const up=()=>{ if(!dragging) return; dragging=false; if(Math.abs(dx)>40){ setPage(p=>wrap(p + (dx<0?1:-1))); } };
    el.addEventListener('pointerdown', down as any); el.addEventListener('pointermove', move as any); el.addEventListener('pointerup', up as any);
    el.addEventListener('touchstart', down as any, {passive:true}); el.addEventListener('touchmove', move as any, {passive:true}); el.addEventListener('touchend', up as any);
    return ()=>{
      el.removeEventListener('pointerdown', down as any); el.removeEventListener('pointermove', move as any); el.removeEventListener('pointerup', up as any);
      el.removeEventListener('touchstart', down as any); el.removeEventListener('touchmove', move as any); el.removeEventListener('touchend', up as any);
    };
  },[slides.length]);

  const current = slides[page] ?? [];

  return (
    <div className="space-y-3" ref={containerRef}>
      <div className="flex items-center justify-between">
        <h2 className="text-[var(--fg)] text-lg font-semibold">Riscos & Alertas</h2>
        {slides.length>1 && (
          <div className="flex items-center gap-2">
            <button onClick={()=>setPage(p=>wrap(p-1))} aria-label="Anterior" className="h-7 w-7 grid place-items-center rounded-md border border-[var(--panel-border)] hover:opacity-90">‹</button>
            <button onClick={()=>setPage(p=>wrap(p+1))} aria-label="Próximo" className="h-7 w-7 grid place-items-center rounded-md border border-[var(--panel-border)] hover:opacity-90">›</button>
          </div>
        )}
      </div>
      <Card className="space-y-3">
        {current.length===0 && <div className="text-sm text-[color:var(--muted-weak)]">Sem alertas.</div>}
        {current.length>0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3" data-testid="risks-slide">
            {current.map((r, i)=>{
              const cls = getToneClasses(theme, r.tone);
              return (
                <div key={i} data-tone={r.tone} className={`relative rounded-xl p-3 border ${cls.card} min-h-[120px]`}>
                  <div className={`text-sm font-semibold ${cls.text}`}>{r.t}</div>
                  <div className="text-sm text-[color:var(--muted-strong)] mt-1">
                    {r.s} — Monitorar evolução nos próximos 7 dias com foco em FTEs e impacto operacional.
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <Tooltip text="Função em desenvolvimento">
                      <button className={`text-xs inline-flex items-center gap-1 opacity-90 hover:opacity-100 ${cls.text}`}>Ver mais <ChevronRight className="h-3 w-3"/></button>
                    </Tooltip>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {/* bullets */}
        {slides.length>1 && (
          <div className="flex items-center justify-center gap-2 pt-1" role="tablist">
            {slides.map((_,i)=> (
              <button 
                key={i} 
                aria-current={i===page} 
                aria-label={`Ir ao slide ${i+1}`} 
                onClick={()=>setPage(i)} 
                className={`h-1.5 w-3 rounded-full transition-colors ${i===page ? 'bg-[#7F22FE]' : 'bg-[color:var(--muted-weak)] hover:bg-[var(--muted)]'}`}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function AIDisclaimer({theme}:{theme:Theme}){
  const light = theme==='light';
  const cls = light
    ? 'border-amber-600/40 bg-amber-500/10 text-amber-800'
    : 'border-amber-400/30 bg-amber-400/5 text-[color:var(--muted-strong)]';
  const titleCls = light ? 'text-amber-800' : 'text-amber-300';
  return (
    <Card className={`mt-auto text-sm ${cls}`} role="note" aria-label="Aviso: conteúdo gerado por IA">
      <b className={`font-semibold ${titleCls}`}>Atenção: conteúdo gerado por IA.</b>
      <p className="mt-1">Use como suporte. Não substitui análise humana para decisões. <a className="underline hover:no-underline" href="#">Saiba mais</a></p>
    </Card>
  );
}



function RightRail({onDeepDive}:{onDeepDive:(payload:{t:string;s:string;src:string;tone:Tone})=>void}){
  const [msg, setMsg] = useState("");

  const [messages, setMessages] = useState<Array<{id:string; role:'assistant'|'user'; text:string}>>([
    { id: 'm1', role:'assistant', text:'Pronto. KPIs, riscos e fluxo de caixa em foco.' },
    { id: 'm2', role:'user', text:'Ok, traga o resumo executivo do QTD.' },
    { id: 'm3', role:'assistant', text:'Receita +5,2% vs plano; EBITDA +1,4pp; OTIF 96%.' },
  ]);

  function send(v?:string){
    const value = (v ?? msg).trim();
    if(!value) return;
    setMessages(prev => [...prev, { id: String(Date.now()), role:'user', text:value }]);
    setMsg("");
    setTimeout(()=>{
      setMessages(prev => [...prev, { id: String(Date.now()+1), role:'assistant', text:'Fonte de dados: Scorecards, Finance Hub e CRM. Aprofundando o tópico com recomendações de ação e drivers de FTEs.' }]);
    }, 300);
  }

  useEffect(()=>{
    (window as any).__deepDive = (payload:{t:string;s:string;src:string;tone:Tone})=>{
      send(`Aprofundar: ${payload.t} — ${payload.s} (origem: ${payload.src})`);
    };
    return ()=>{ delete (window as any).__deepDive; };
  },[]);

  return (
    <div className="w-[340px] shrink-0 h-full">
      <Card className="h-full flex flex-col">
        <div className="flex items-center gap-3 mb-3">
          <img src={LOGO_SRC} alt="Logo MyAI" className="h-6 w-6 rounded-full object-cover ring-1 ring-white/10" />
          <h3 className="font-semibold">MyAiMentor Assistant</h3>
        </div>
        
        {/* Chat log ocupa espaço flexível */}
        <div className="flex-1 space-y-2 overflow-auto pr-1" data-testid="chat-log">
          {messages.map(m => (
            <div key={m.id} className={`flex ${m.role==='user'?'justify-end':'justify-start'}`} data-container-role={m.role}>
              <div
                data-role={m.role}
                className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                  m.role==='user'
                    ? 'bg-[var(--p)] text-white shadow-sm'
                    : 'bg-[var(--panel-bg)] text-[color:var(--muted-strong)]'
                }`}
                style={{"--p": PRIMARY} as any}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {/* Quick prompts (placeholders acima do input) */}
        <div className="grid grid-cols-2 gap-2 mt-2" role="list">
          {['Board brief em 60s (QTD)','Top 3 riscos + owner + due','Mapa de automação: tarefas manuais > 50%','Alocação FTE por área vs plano'].map((p,i)=> (
            <button
              key={i}
              onClick={()=>send(p)}
              className="text-left rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] px-3 py-2 text-[12px] text-[var(--fg)]/80 hover:bg-white/5 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Entrada fixa no rodapé do card */}
        <form onSubmit={(e)=>{e.preventDefault(); send();}} className="relative mt-2">
          <input
            value={msg}
            onChange={e=>setMsg(e.target.value)}
            placeholder="Como posso ajudar?"
            className="w-full pr-10 rounded-xl bg-[var(--input-bg)] border border-[var(--panel-border)] px-3 py-2 text-sm outline-none placeholder-[var(--placeholder)]"
          />
        
          <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 grid place-items-center rounded-lg p-1.5 hover:opacity-90" aria-label="Enviar" style={{color:'var(--fg)'}}>
            <MessageSquare className="h-4 w-4"/>
          </button>
        </form>
        <div className="text-[11px] text-[var(--muted)] mt-2">v0.8 · MyAIMentor — ambiente mock</div>
      </Card>
    </div>
  );
}

export default function DashboardMock(){
  const [folder, setFolder] = useState<FolderId>('hr');
  const { theme } = useTheme();
  const data = useMockData(folder);

  const handleDeepDive = (payload:{t:string;s:string;src:string;tone:Tone})=>{
    if((window as any).__deepDive){ (window as any).__deepDive(payload); }
  };

  const vars = useMemo(()=>{
    if(theme==='light'){
      // >>> Ajustes para legibilidade no light mode
      return {
        '--bg': `radial-gradient(1200px 600px at 20% -10%, rgba(127,34,254,.08), transparent), radial-gradient(1000px 500px at 90% 0%, rgba(60,99,255,.06), transparent), #F7FAFD`,
        '--fg': '#0B0F1A',
        '--muted': 'rgba(11,15,26,0.70)',
        '--muted-weak': 'rgba(11,15,26,0.60)',
        '--muted-strong': 'rgba(11,15,26,0.85)',
        '--panel-bg': 'rgba(0,0,0,0.05)',
        '--panel-border': 'rgba(0,0,0,0.12)',
        '--chip-border': 'rgba(0,0,0,0.16)',
        '--chip-fg': 'rgba(11,15,26,0.78)',
        '--chip-hover': 'rgba(0,0,0,0.07)',
        '--input-bg': 'rgba(0,0,0,0.04)',
        '--placeholder': 'rgba(11,15,26,0.45)',
        '--nav-bg': 'color-mix(in oklab, var(--bg) 88%, black 12%)',
        '--nav-border': 'rgba(0,0,0,0.12)',
        '--nav-shadow': '0 4px 12px rgba(0,0,0,0.07)'
      } as React.CSSProperties;
    }
    return {
      '--bg': `radial-gradient(1200px 600px at 20% -10%, rgba(127,34,254,.18), transparent), radial-gradient(1000px 500px at 90% 0%, rgba(60,99,255,.12), transparent), #0B0F1A`,
      '--fg': '#FFFFFF',
      '--muted': 'rgba(255,255,255,0.70)',
      '--muted-weak': 'rgba(255,255,255,0.60)',
      '--muted-strong': 'rgba(255,255,255,0.80)',
      '--panel-bg': 'rgba(255,255,255,0.05)',
      '--panel-border': 'rgba(255,255,255,0.10)',
      '--chip-border': 'rgba(255,255,255,0.15)',
      '--chip-fg': 'rgba(255,255,255,0.80)',
      '--chip-hover': 'rgba(255,255,255,0.08)',
      '--input-bg': 'rgba(0,0,0,0.30)',
      '--placeholder': 'rgba(255,255,255,0.40)',
      '--nav-bg': 'color-mix(in oklab, var(--bg) 90%, black 10%)',
      '--nav-border': 'rgba(255,255,255,0.12)',
      '--nav-shadow': '0 6px 18px rgba(0,0,0,0.35)'
    } as React.CSSProperties;
  },[theme]);

  // ==== DEV TESTS (opt-in) ====
  useEffect(()=>{
    if (typeof window === 'undefined' || !(window as any).__RUN_UI_TESTS__) return;

    try {
      const header = document.querySelector('header');
      console.assert(!!header, 'Header deve existir');

      const hasAnyLogo = document.querySelector('header img');
      console.assert(!!hasAnyLogo, 'Navbar deve exibir um ícone de marca');

      const chatTitle = Array.from(document.querySelectorAll('h3')).some(h => h.textContent?.trim() === 'MyAiMentor');
      console.assert(chatTitle, 'Bloco de agente deve se chamar MyAiMentor');

      // Novo teste: pelo menos um botão deve definir a CSS var --p inline
      const anyBtnWithVar = Array.from(document.querySelectorAll('button')).some(btn => (btn as HTMLElement).getAttribute('style')?.includes('--p'));
      console.assert(anyBtnWithVar, 'Pelo menos um botão deve definir --p via inline style');
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[DEV_TESTS] falhou:', e);
    }
  },[]);

  return (
    <div className="min-h-screen text-[var(--fg)] pt-28" style={{...vars, background: 'var(--bg)'}}>
      <main className="mx-auto max-w-[1400px] p-4 md:p-6">
        <div className="grid grid-cols-[300px_1fr_340px] items-stretch gap-6">
          {/* Sidebar esquerda: só Ferramentas do gestor */}
          <aside className="space-y-4">
            <Toolkit/>
            <GestorTools/>
          </aside>

          {/* Centro: ordem solicitada */}
          <section className="flex flex-col min-h-full space-y-6">
            <QuickOverviews folder={folder} onChange={setFolder} theme={theme}/>
            <AIInsights folder={folder} items={data.insights} onDeepDive={handleDeepDive} theme={theme}/>
            <RisksAlertsSlider items={data.risks} theme={theme}/>
            <AIDisclaimer theme={theme}/>
          </section>

          {/* Lateral direita */}
          <RightRail onDeepDive={handleDeepDive}/>
        </div>
      </main>
    </div>
  );
}
