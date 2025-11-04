import React, { useMemo, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useCustomFolders } from '@/contexts/CustomFoldersContext';
import { FolderPlus, Save, Trash2, Plus, Edit3, ArrowUp, ArrowDown, X, Palette } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function FolderManagementModal({ isOpen, onClose }: Props) {
  const { theme } = useTheme();
  const {
    folders,
    addFolder,
    updateFolder,
    deleteFolder,
    addAppToFolder,
    updateAppInFolder,
    reorderApps,
    deleteAppFromFolder,
  } = useCustomFolders();

  const [selectedId, setSelectedId] = useState<string | null>(folders[0]?.id ?? null);

  // criação de pasta
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#7F22FE');

  // edição da pasta selecionada
  const selectedFolder = useMemo(
    () => folders.find(f => f.id === selectedId) || null,
    [folders, selectedId]
  );
  const [editFolderName, setEditFolderName] = useState<string>('');
  const [editFolderColor, setEditFolderColor] = useState<string>('#7F22FE');

  // criação/edição de app
  const [newAppName, setNewAppName] = useState('');
  const [newAppDesc, setNewAppDesc] = useState('');
  const [editingAppId, setEditingAppId] = useState<string | null>(null);
  const [editAppName, setEditAppName] = useState('');
  const [editAppDesc, setEditAppDesc] = useState('');

  React.useEffect(() => {
    // ao mudar pasta selecionada, carrega valores de edição
    if (selectedFolder) {
      setEditFolderName(selectedFolder.name);
      setEditFolderColor(selectedFolder.color);
    }
  }, [selectedFolder?.id]);

  if (!isOpen) return null;

  const panelBg = theme === 'light' ? '#FFFFFF' : 'rgb(13,18,31)';
  const borderCol = theme === 'light' ? 'rgba(0,0,0,.1)' : 'rgba(255,255,255,.12)';
  const textCol = theme === 'light' ? '#0B0F1A' : '#FFFFFF';
  const muted = theme === 'light' ? '#4b5563' : 'rgba(255,255,255,.65)';

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    addFolder({ name: newFolderName.trim(), color: newFolderColor });
    setNewFolderName('');
    setNewFolderColor('#7F22FE');
  };

  const handleSaveFolderEdits = () => {
    if (!selectedFolder) return;
    updateFolder(selectedFolder.id, {
      name: editFolderName.trim() || selectedFolder.name,
      color: editFolderColor || selectedFolder.color,
    });
  };

  const handleDeleteFolder = () => {
    if (!selectedFolder) return;
    if (window.confirm(`Excluir a pasta “${selectedFolder.name}” e todos os apps dentro dela?`)) {
      deleteFolder(selectedFolder.id);
      setSelectedId(folders.find(f => f.id !== selectedFolder.id)?.id ?? null);
    }
  };

  const startEditApp = (appId: string, name: string, description: string) => {
    setEditingAppId(appId);
    setEditAppName(name);
    setEditAppDesc(description);
  };

  const saveEditApp = () => {
    if (!selectedFolder || !editingAppId) return;
    updateAppInFolder(selectedFolder.id, editingAppId, {
      name: editAppName.trim() || '(Sem nome)',
      description: editAppDesc.trim(),
    });
    setEditingAppId(null);
    setEditAppName('');
    setEditAppDesc('');
  };

  const cancelEditApp = () => {
    setEditingAppId(null);
    setEditAppName('');
    setEditAppDesc('');
  };

  const addApp = () => {
    if (!selectedFolder || !newAppName.trim()) return;
    addAppToFolder(selectedFolder.id, { name: newAppName.trim(), description: newAppDesc.trim() });
    setNewAppName('');
    setNewAppDesc('');
  };

  const delApp = (appId: string, appName: string) => {
    if (!selectedFolder) return;
    if (window.confirm(`Remover o app “${appName}” desta pasta?`)) {
      deleteAppFromFolder(selectedFolder.id, appId);
    }
  };

  const moveApp = (index: number, dir: -1 | 1) => {
    if (!selectedFolder) return;
    const to = index + dir;
    if (to < 0 || to >= selectedFolder.apps.length) return;
    reorderApps(selectedFolder.id, index, to);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,.45)' }}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-[min(1100px,95vw)] rounded-2xl overflow-hidden shadow-xl" style={{ background: panelBg, color: textCol, border: `1px solid ${borderCol}` }}>
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: borderCol }}>
          <div className="flex items-center gap-3">
            <FolderPlus className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Ferramentas do Gestor — Pastas & Apps</h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:opacity-80" aria-label="Fechar">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-12 gap-0">
          {/* Sidebar: Lista de pastas + Criar pasta */}
          <aside className="col-span-4 border-r" style={{ borderColor: borderCol }}>
            <div className="p-4 space-y-4">
              {/* Criar pasta */}
              <div className="rounded-xl border p-3 space-y-2" style={{ borderColor: borderCol }}>
                <div className="text-sm font-medium">Nova pasta</div>
                <input
                  className="w-full rounded-lg px-3 py-2 border text-sm"
                  placeholder="Nome da pasta"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  style={{ borderColor: borderCol, background: theme === 'light' ? 'rgba(0,0,0,.035)' : 'rgba(255,255,255,.04)', color: textCol }}
                />
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    className="w-12 h-10 rounded-lg border cursor-pointer"
                    value={newFolderColor}
                    onChange={(e) => setNewFolderColor(e.target.value)}
                    title="Escolher cor"
                    style={{ borderColor: borderCol }}
                  />
                  <button
                    onClick={handleCreateFolder}
                    className="inline-flex items-center gap-2 rounded-lg px-3 py-2 border text-sm hover:opacity-90"
                    style={{ borderColor: borderCol }}
                    disabled={!newFolderName.trim()}
                  >
                    <Plus className="h-4 w-4" /> Criar
                  </button>
                </div>
              </div>

              {/* Lista de pastas */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Pastas</div>
                {folders.length === 0 && (
                  <p className="text-sm" style={{ color: muted }}>Nenhuma pasta criada.</p>
                )}
                {folders.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedId(f.id)}
                    className="w-full text-left rounded-lg px-3 py-2 border hover:opacity-90 flex items-center gap-2"
                    style={{
                      borderColor: selectedId === f.id ? f.color : borderCol,
                      background: selectedId === f.id ? (theme === 'light' ? 'rgba(0,0,0,.03)' : 'rgba(255,255,255,.04)') : 'transparent'
                    }}
                  >
                    <span className="inline-block w-3 h-3 rounded" style={{ background: f.color }} />
                    <span className="truncate">{f.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Painel principal: Gerenciar pasta selecionada */}
          <main className="col-span-8 p-5">
            {!selectedFolder ? (
              <p className="text-sm" style={{ color: muted }}>Selecione uma pasta à esquerda para editar.</p>
            ) : (
              <div className="space-y-6">
                {/* Cabeçalho de edição da pasta */}
                <div className="rounded-xl border p-4" style={{ borderColor: borderCol }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Palette className="h-5 w-5" />
                      <h4 className="font-semibold">Pasta: {selectedFolder.name}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSaveFolderEdits}
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 border text-sm hover:opacity-90"
                        style={{ borderColor: borderCol }}
                        title="Salvar alterações da pasta"
                      >
                        <Save className="h-4 w-4" /> Salvar
                      </button>
                      <button
                        onClick={handleDeleteFolder}
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm border border-red-500/30 text-red-500 hover:bg-red-500/10"
                        title="Excluir pasta"
                      >
                        <Trash2 className="h-4 w-4" /> Excluir
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-12 gap-3">
                    <div className="col-span-8">
                      <label className="block text-xs mb-1" style={{ color: muted }}>Nome</label>
                      <input
                        className="w-full rounded-lg px-3 py-2 border text-sm"
                        value={editFolderName}
                        onChange={(e) => setEditFolderName(e.target.value)}
                        style={{ borderColor: borderCol, background: theme === 'light' ? 'rgba(0,0,0,.035)' : 'rgba(255,255,255,.04)', color: textCol }}
                      />
                    </div>
                    <div className="col-span-4">
                      <label className="block text-xs mb-1" style={{ color: muted }}>Cor</label>
                      <input
                        type="color"
                        className="w-full h-[42px] rounded-lg border cursor-pointer"
                        value={editFolderColor}
                        onChange={(e) => setEditFolderColor(e.target.value)}
                        style={{ borderColor: borderCol }}
                      />
                    </div>
                  </div>
                </div>

                {/* Apps da pasta */}
                <div className="rounded-xl border p-4 space-y-4" style={{ borderColor: borderCol }}>
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Apps da pasta</h4>
                  </div>

                  {selectedFolder.apps.length === 0 ? (
                    <p className="text-sm" style={{ color: muted }}>Nenhum app nesta pasta.</p>
                  ) : (
                    <ul className="space-y-2">
                      {selectedFolder.apps.map((app, idx) => (
                        <li key={app.id} className="rounded-lg border p-3" style={{ borderColor: borderCol }}>
                          {editingAppId === app.id ? (
                            <div className="space-y-2">
                              <input
                                className="w-full rounded-lg px-3 py-2 border text-sm"
                                placeholder="Nome do app"
                                value={editAppName}
                                onChange={(e) => setEditAppName(e.target.value)}
                                style={{ borderColor: borderCol, background: theme === 'light' ? 'rgba(0,0,0,.035)' : 'rgba(255,255,255,.04)', color: textCol }}
                              />
                              <textarea
                                className="w-full rounded-lg px-3 py-2 border text-sm"
                                placeholder="Descrição"
                                value={editAppDesc}
                                onChange={(e) => setEditAppDesc(e.target.value)}
                                rows={2}
                                style={{ borderColor: borderCol, background: theme === 'light' ? 'rgba(0,0,0,.035)' : 'rgba(255,255,255,.04)', color: textCol }}
                              />
                              <div className="flex items-center gap-2">
                                <button onClick={saveEditApp} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 border text-sm hover:opacity-90" style={{ borderColor: borderCol }}>
                                  <Save className="h-4 w-4" /> Salvar
                                </button>
                                <button onClick={cancelEditApp} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 border text-sm hover:opacity-90" style={{ borderColor: borderCol }}>
                                  <X className="h-4 w-4" /> Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="font-medium">{app.name}</div>
                                <div className="text-sm" style={{ color: muted }}>{app.description || '—'}</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button onClick={() => moveApp(idx, -1)} className="rounded-lg p-2 border hover:opacity-90" style={{ borderColor: borderCol }} aria-label="Mover para cima"><ArrowUp className="h-4 w-4" /></button>
                                <button onClick={() => moveApp(idx, 1)} className="rounded-lg p-2 border hover:opacity-90" style={{ borderColor: borderCol }} aria-label="Mover para baixo"><ArrowDown className="h-4 w-4" /></button>
                                <button onClick={() => startEditApp(app.id, app.name, app.description)} className="rounded-lg p-2 border hover:opacity-90" style={{ borderColor: borderCol }} aria-label="Editar app"><Edit3 className="h-4 w-4" /></button>
                                <button onClick={() => delApp(app.id, app.name)} className="rounded-lg p-2 border border-red-500/30 text-red-500 hover:bg-red-500/10" aria-label="Excluir app"><Trash2 className="h-4 w-4" /></button>
                              </div>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Adicionar App */}
                  <div className="pt-2 border-t" style={{ borderColor: borderCol }}>
                    <div className="grid grid-cols-12 gap-2 mt-3">
                      <input
                        className="col-span-5 rounded-lg px-3 py-2 border text-sm"
                        placeholder="Nome do app"
                        value={newAppName}
                        onChange={(e) => setNewAppName(e.target.value)}
                        style={{ borderColor: borderCol, background: theme === 'light' ? 'rgba(0,0,0,.035)' : 'rgba(255,255,255,.04)', color: textCol }}
                      />
                      <input
                        className="col-span-6 rounded-lg px-3 py-2 border text-sm"
                        placeholder="Descrição (opcional)"
                        value={newAppDesc}
                        onChange={(e) => setNewAppDesc(e.target.value)}
                        style={{ borderColor: borderCol, background: theme === 'light' ? 'rgba(0,0,0,.035)' : 'rgba(255,255,255,.04)', color: textCol }}
                      />
                      <button
                        onClick={addApp}
                        disabled={!newAppName.trim()}
                        className="col-span-1 inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 border text-sm hover:opacity-90 disabled:opacity-50"
                        style={{ borderColor: borderCol }}
                        title="Adicionar app"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
