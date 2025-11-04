import React from 'react';
import { Moon, Sun, LifeBuoy, Home, Store, Settings } from 'lucide-react';
import { VscAccount } from 'react-icons/vsc';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLoading } from '@/contexts/LoadingContext';

const PRIMARY = '#7F22FE';
const NAV_LOGO_DARK = 'https://github.com/dudsv/nestle-tools/blob/7d48a7535965b152ef3b187e84625df92209f39f/src/home-dot-black-mode.png?raw=true';
const NAV_LOGO_LIGHT = 'https://github.com/dudsv/nestle-tools/blob/7d48a7535965b152ef3b187e84625df92209f39f/src/home-dot-white-mode.png?raw=true';

export default function Navigation() {
  const { theme, toggle } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { withLoading } = useLoading();
  
  const currentPage = location.pathname === '/store' ? 'store' : location.pathname === '/settings' ? 'settings' : 'home';
  const active = currentPage;

  const handleNavChange = async (page: 'home' | 'store' | 'settings') => {
    await withLoading(() => {
      if (page === 'home') navigate('/');
      else if (page === 'store') navigate('/store');
      else navigate('/settings');
    });
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-40">
      <div className="mx-auto px-4 py-3">
        <div className="grid grid-cols-12 gap-4 items-center">
          {/* Logo */}
          <div className="col-span-4 md:col-span-3 flex items-center gap-3">
            <div className="h-[72px] md:h-[88px] w-[220px] md:w-[320px] shrink-0">
              <img
                src={theme === 'dark' ? NAV_LOGO_DARK : NAV_LOGO_LIGHT}
                alt="Logo"
                className="h-full w-full object-contain drop-shadow-lg"
              />
            </div>
          </div>

          {/* Center nav */}
          <nav className="hidden md:flex col-span-6 items-center justify-center">
            <div className="relative w-full max-w-[520px] rounded-full border bg-[rgb(var(--panel-bg))] backdrop-blur-sm overflow-visible px-5 py-2.5" style={{ borderColor: 'rgb(var(--panel-border))' }}>
              <div className="flex items-end justify-between gap-0">
                <NavItem 
                  id="store" 
                  icon={<Store />} 
                  label="Store" 
                  active={active} 
                  onChange={handleNavChange}
                />
                <NavItem 
                  id="home" 
                  icon={<Home />} 
                  label="Home" 
                  active={active} 
                  onChange={handleNavChange}
                />
                <NavItem 
                  id="settings" 
                  icon={<Settings />} 
                  label="Settings" 
                  active={active} 
                  onChange={handleNavChange}
                />
              </div>
            </div>
          </nav>

          {/* Right actions */}
          <div className="col-span-8 md:col-span-3 flex items-center justify-end gap-2">
            <button
              onClick={toggle}
              className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:opacity-90 backdrop-blur-sm bg-[rgb(var(--panel-bg))]"
              style={{ borderColor: 'rgb(var(--panel-border))' }}
              title={theme === 'dark' ? 'Modo escuro: ligado' : 'Modo escuro: desligado'}
            >
              {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              <span className="hidden sm:inline text-[rgb(var(--muted-strong))]">{theme === 'dark' ? 'Dark' : 'Light'}</span>
              <span className={`hidden sm:inline ml-1 text-[11px] rounded-full px-1.5 py-0.5 border ${theme === 'dark' ? 'border-emerald-400/40 text-emerald-300' : 'border-[rgb(var(--chip-border))] text-[rgb(var(--muted-weak))]'}`}>
                {theme === 'dark' ? 'On' : 'Off'}
              </span>
            </button>

            <button
              className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:opacity-90 backdrop-blur-sm bg-[rgb(var(--panel-bg))]"
              style={{ borderColor: 'rgb(var(--panel-border))' }}
              title="Contactar suporte"
            >
              <LifeBuoy className="h-4 w-4" />
              <span className="hidden sm:inline">Suporte</span>
            </button>

            <button
              className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:opacity-90 backdrop-blur-sm bg-[rgb(var(--panel-bg))]"
              style={{ borderColor: 'rgb(var(--panel-border))' }}
              title="Minha conta"
            >
              <VscAccount className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden mt-3 flex items-center justify-center">
          <div className="rounded-full border backdrop-blur-sm px-5 py-2.5 bg-[rgb(var(--panel-bg))]" style={{ borderColor: 'rgb(var(--panel-border))' }}>
            <div className="flex items-end justify-between gap-0">
              <NavItem 
                id="store" 
                icon={<Store />} 
                label="Store" 
                active={active} 
                onChange={handleNavChange}
              />
              <NavItem 
                id="home" 
                icon={<Home />} 
                label="Home" 
                active={active} 
                onChange={handleNavChange}
              />
              <NavItem 
                id="settings" 
                icon={<Settings />} 
                label="Settings" 
                active={active} 
                onChange={handleNavChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavItem({
  id,
  icon,
  label,
  active,
  onChange,
}: {
  id: 'home' | 'store' | 'settings';
  icon: React.ReactElement;
  label: string;
  active: 'home' | 'store' | 'settings';
  onChange: (id: 'home' | 'store' | 'settings') => void;
}) {
  const isActive = active === id;
  
  // Ícones maiores quando ativos
  const inactiveIcon = React.cloneElement(icon, { className: "h-8 w-8" });
  const activeIcon = React.cloneElement(icon, { className: "h-11 w-11" });

  return (
    <button
      type="button"
      aria-current={isActive ? 'page' : undefined}
      onClick={() => onChange(id)}
      className="relative group flex-1 grid place-items-center rounded-xl py-3 px-2 text-[12px] text-[rgb(var(--muted-weak))] hover:text-foreground transition-colors"
    >
      {/* Badge ativo vazando para baixo */}
      {isActive && (
        <span
          className="absolute -bottom-9 h-[68px] w-[68px] aspect-square rounded-full grid place-items-center ring-2 ring-white/20 z-20 shadow-[0_12px_32px_rgba(127,34,254,0.45)]"
          style={{ background: PRIMARY }}
        >
          <span className="text-white">{activeIcon}</span>
        </span>
      )}
      
      {/* Ícone padrão (escondido quando ativo) */}
      <span className={`grid place-items-center ${isActive ? 'opacity-0' : ''}`}>
        {inactiveIcon}
      </span>
      
      {/* Label (invisível quando ativo) */}
      <span className={`mt-1 ${isActive ? 'invisible' : ''}`}>{label}</span>
    </button>
  );
}
