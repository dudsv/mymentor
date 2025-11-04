import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CustomFolder {
  id: string;
  name: string;
  color: string;
  apps: Array<{
    id: string;
    name: string;
    description: string;
    url: string; // novo campo
  }>;
}

interface CustomFoldersContextType {
  folders: CustomFolder[];
  addFolder: (folder: Omit<CustomFolder, 'id' | 'apps'>) => void;
  updateFolder: (id: string, patch: Partial<Pick<CustomFolder, 'name' | 'color'>>) => void;
  deleteFolder: (id: string) => void;
  addAppToFolder: (folderId: string, app: Omit<CustomFolder['apps'][0], 'id'>) => void;
  updateAppInFolder: (
    folderId: string,
    appId: string,
    patch: Partial<Pick<CustomFolder['apps'][0], 'name' | 'description' | 'url'>>
  ) => void;
  reorderApps: (folderId: string, from: number, to: number) => void;
  deleteAppFromFolder: (folderId: string, appId: string) => void;
}

const CustomFoldersContext = createContext<CustomFoldersContextType | undefined>(undefined);
const STORAGE_KEY = 'customFolders';

export function CustomFoldersProvider({ children }: { children: React.ReactNode }) {
  const [folders, setFolders] = useState<CustomFolder[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // migração: garante 'url' em cada app
          const migrated = parsed.map((f: any) => ({
            ...f,
            apps: Array.isArray(f?.apps)
              ? f.apps.map((a: any) => ({
                  id: a?.id ?? (crypto?.randomUUID?.() || String(Date.now())),
                  name: String(a?.name ?? ''),
                  description: String(a?.description ?? ''),
                  url: String(a?.url ?? ''), // novo
                }))
              : [],
          }));
          return migrated as CustomFolder[];
        }
      } catch {}
    }
    // fallback inicial
    return [
      { id: '1', name: 'Pasta Marketing', color: '#7F22FE', apps: [] },
      { id: '2', name: 'Pasta Operações', color: '#00D4AA', apps: [] },
    ];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(folders));
  }, [folders]);

  const addFolder: CustomFoldersContextType['addFolder'] = (folder) => {
    const newFolder: CustomFolder = { id: crypto?.randomUUID?.() || Date.now().toString(), ...folder, apps: [] };
    setFolders(prev => [...prev, newFolder]);
  };

  const updateFolder: CustomFoldersContextType['updateFolder'] = (id, patch) => {
    setFolders(prev => prev.map(f => (f.id === id ? { ...f, ...patch } : f)));
  };

  const deleteFolder: CustomFoldersContextType['deleteFolder'] = (id) => {
    setFolders(prev => prev.filter(f => f.id !== id));
  };

  const addAppToFolder: CustomFoldersContextType['addAppToFolder'] = (folderId, app) => {
    setFolders(prev => prev.map(folder => {
      if (folder.id !== folderId) return folder;
      return {
        ...folder,
        apps: [...folder.apps, { id: crypto?.randomUUID?.() || Date.now().toString(), ...app }],
      };
    }));
  };

  const updateAppInFolder: CustomFoldersContextType['updateAppInFolder'] = (folderId, appId, patch) => {
    setFolders(prev => prev.map(folder => {
      if (folder.id !== folderId) return folder;
      return {
        ...folder,
        apps: folder.apps.map(app => (app.id === appId ? { ...app, ...patch } : app)),
      };
    }));
  };

  const reorderApps: CustomFoldersContextType['reorderApps'] = (folderId, from, to) => {
    setFolders(prev => prev.map(folder => {
      if (folder.id !== folderId) return folder;
      const next = [...folder.apps];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return { ...folder, apps: next };
    }));
  };

  const deleteAppFromFolder: CustomFoldersContextType['deleteAppFromFolder'] = (folderId, appId) => {
    setFolders(prev => prev.map(folder => {
      if (folder.id !== folderId) return folder;
      return { ...folder, apps: folder.apps.filter(app => app.id !== appId) };
    }));
  };

  return (
    <CustomFoldersContext.Provider
      value={{ folders, addFolder, updateFolder, deleteFolder, addAppToFolder, updateAppInFolder, reorderApps, deleteAppFromFolder }}
    >
      {children}
    </CustomFoldersContext.Provider>
  );
}

export function useCustomFolders() {
  const context = useContext(CustomFoldersContext);
  if (!context) throw new Error('useCustomFolders must be used within CustomFoldersProvider');
  return context;
}
