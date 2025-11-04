import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun, Bell, Lock, User, Plus, Trash2, Folder } from "lucide-react";
import { useState } from "react";
import { useLoading } from "@/contexts/LoadingContext";
import { useCustomFolders } from "@/contexts/CustomFoldersContext";

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border backdrop-blur p-4 bg-[rgb(var(--panel-bg))] ${className}`}
      style={{ borderColor: "rgb(var(--panel-border))" }}
    >
      {children}
    </div>
  );
}

export default function Settings() {
  const { theme, toggle } = useTheme();
  const { withLoading } = useLoading();
  const { folders, addFolder, deleteFolder } = useCustomFolders();
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderColor, setNewFolderColor] = useState("#7F22FE");

  const handleAddFolder = async () => {
    if (!newFolderName.trim()) return;

    await withLoading(() => {
      addFolder({ name: newFolderName, color: newFolderColor });
      setNewFolderName("");
      setNewFolderColor("#7F22FE");
    });
  };

  const handleDeleteFolder = async (id: string) => {
    await withLoading(() => {
      deleteFolder(id);
    });
  };

  return (
    <div
      className="min-h-screen pt-28 pb-12 px-4"
      style={{
        background:
          theme === "light"
            ? "radial-gradient(1200px 600px at 20% -10%, rgba(127,34,254,.08), transparent), radial-gradient(1000px 500px at 90% 0%, rgba(60,99,255,.06), transparent), #F7FAFD"
            : "radial-gradient(1200px 600px at 20% -10%, rgba(127,34,254,.18), transparent), radial-gradient(1000px 500px at 90% 0%, rgba(60,99,255,.12), transparent), #0B0F1A",
      }}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold" style={{ color: theme === "light" ? "#0B0F1A" : "#FFFFFF" }}>
          Configurações
        </h1>

        {/* Theme */}
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              <div>
                <h3 className="font-semibold">Tema</h3>
                <p className="text-sm text-[rgb(var(--muted-weak))]">Alternar entre modo claro e escuro</p>
              </div>
            </div>
            <button
              onClick={toggle}
              className="rounded-lg px-4 py-2 border hover:opacity-90"
              style={{ borderColor: "rgb(var(--panel-border))" }}
            >
              {theme === "dark" ? "Escuro" : "Claro"}
            </button>
          </div>
        </Card>

        {/* Custom Folders Management */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Folder className="h-5 w-5" />
              <div>
                <h3 className="font-semibold">Ferramentas do Gestor - Pastas Personalizadas</h3>
                <p className="text-sm text-[rgb(var(--muted-weak))]">Crie e gerencie suas pastas customizadas</p>
              </div>
            </div>
          </div>

          {/* Add new folder */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Nome da pasta"
              className="flex-1 rounded-lg px-3 py-2 border text-sm bg-[rgba(0,0,0,0.04)]"
              style={{
                borderColor: "rgb(var(--panel-border))",
                color: theme === "light" ? "#0B0F1A" : "#FFFFFF",
              }}
            />
            <input
              type="color"
              value={newFolderColor}
              onChange={(e) => setNewFolderColor(e.target.value)}
              className="w-12 h-10 rounded-lg border cursor-pointer"
              style={{ borderColor: "rgb(var(--panel-border))" }}
              title="Escolher cor"
            />
            <button
              onClick={handleAddFolder}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 border hover:opacity-90"
              style={{ borderColor: "rgb(var(--panel-border))" }}
              disabled={!newFolderName.trim()}
            >
              <Plus className="h-4 w-4" />
              Adicionar
            </button>
          </div>

          {/* List of custom folders */}
          <div className="space-y-2">
            {folders.length === 0 && (
              <p className="text-sm text-[rgb(var(--muted-weak))] text-center py-4">
                Nenhuma pasta personalizada criada ainda
              </p>
            )}
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="flex items-center justify-between rounded-lg border p-3"
                style={{ borderColor: "rgb(var(--panel-border))" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: folder.color }} />
                  <span className="font-medium">{folder.name}</span>
                </div>
                <button
                  onClick={() => handleDeleteFolder(folder.id)}
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm border border-red-500/30 text-red-500 hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
