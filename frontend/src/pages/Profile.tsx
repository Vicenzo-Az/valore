import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useUser } from "@/context";
import api from "@/lib/api";
import type { UserResponse } from "@/types";
import {
  AlertTriangle,
  Camera,
  CheckCircle,
  Loader2,
  Lock,
  Mail,
  Trash2,
  User,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user, setUser, logout } = useUser();
  const navigate = useNavigate();

  // Dados pessoais
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [isSavingInfo, setIsSavingInfo] = useState(false);
  const [infoSuccess, setInfoSuccess] = useState(false);
  const [infoError, setInfoError] = useState("");

  // Senha
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Avatar
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user?.avatar_url ?? null,
  );
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  // Deletar conta
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function handleSaveInfo() {
    if (!name.trim()) {
      setInfoError("Nome obrigatório");
      return;
    }
    if (!email.trim()) {
      setInfoError("E-mail obrigatório");
      return;
    }
    setInfoError("");
    setIsSavingInfo(true);
    try {
      const { data } = await api.put<UserResponse>("/auth/me", { name, email });
      setUser(data);
      setInfoSuccess(true);
      setTimeout(() => setInfoSuccess(false), 3000);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      setInfoError(
        status === 409 ? "E-mail já cadastrado" : "Erro ao salvar alterações",
      );
    } finally {
      setIsSavingInfo(false);
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Valida tamanho — máximo 500KB
    if (file.size > 500 * 1024) {
      setAvatarError("Imagem muito grande. Máximo 500KB.");
      return;
    }

    // Valida tipo
    if (!file.type.startsWith("image/")) {
      setAvatarError("Selecione uma imagem válida.");
      return;
    }
    setAvatarError("");
    setIsUploadingAvatar(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setAvatarPreview(base64);
      try {
        const { data } = await api.put<UserResponse>("/auth/me", {
          avatar_url: base64,
        });
        setUser(data);
      } catch {
        setAvatarError("Erro ao salvar avatar.");
        setAvatarPreview(user?.avatar_url ?? null);
      } finally {
        setIsUploadingAvatar(false);
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleSavePassword() {
    if (!currentPassword) {
      setPasswordError("Senha atual obrigatória");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("Nova senha deve ter pelo menos 8 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Senhas não coincidem");
      return;
    }
    setPasswordError("");
    setIsSavingPassword(true);
    try {
      await api.put("/auth/me", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail;
      setPasswordError(detail ?? "Erro ao alterar senha");
    } finally {
      setIsSavingPassword(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== "DELETAR") {
      setDeleteError("Digite DELETAR para confirmar.");
      return;
    }
    setDeleteError("");
    setIsDeletingAccount(true);
    try {
      await api.delete("/auth/me");
      await logout();
      navigate("/landing");
    } catch {
      setDeleteError("Erro ao deletar conta. Tente novamente.");
    } finally {
      setIsDeletingAccount(false);
    }
  }

  const passwordStrength =
    newPassword.length === 0
      ? null
      : newPassword.length < 8
        ? "fraca"
        : newPassword.length < 12
          ? "média"
          : "forte";

  const strengthColor = {
    fraca: "bg-red-400",
    média: "bg-yellow-400",
    forte: "bg-emerald-400",
  };
  const strengthWidth = { fraca: "w-1/3", média: "w-2/3", forte: "w-full" };

  return (
    <div className="space-y-8 max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Perfil</h1>

      {/* Avatar */}
      <Card>
        <CardContent className="p-6 flex items-center gap-5">
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-emerald-500/15 flex items-center justify-center">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={32} className="text-emerald-500" />
              )}
            </div>
            <label
              htmlFor="avatar-upload"
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center cursor-pointer transition-colors border-2 border-background"
            >
              {isUploadingAvatar ? (
                <Loader2 size={12} className="animate-spin text-white" />
              ) : (
                <Camera size={12} className="text-white" />
              )}
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div>
            <p className="font-semibold text-lg">{user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            {avatarError && (
              <p className="text-xs text-red-500 mt-1">{avatarError}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Máximo 500KB · JPG, PNG, WebP
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Dados pessoais */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <User size={16} className="text-muted-foreground" />
            <h2 className="font-semibold">Dados pessoais</h2>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
              Nome
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
              E-mail
            </label>
            <div className="relative">
              <Mail
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="pl-8"
              />
            </div>
          </div>
          {infoError && <p className="text-sm text-red-500">{infoError}</p>}
          {infoSuccess && (
            <div className="flex items-center gap-2 text-sm text-emerald-500">
              <CheckCircle size={14} /> Alterações salvas com sucesso
            </div>
          )}
          <Button
            className="bg-emerald-600 hover:bg-emerald-500 text-white"
            onClick={handleSaveInfo}
            disabled={isSavingInfo}
          >
            {isSavingInfo && (
              <Loader2 size={14} className="animate-spin mr-2" />
            )}
            Salvar alterações
          </Button>
        </CardContent>
      </Card>

      {/* Alterar senha */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Lock size={16} className="text-muted-foreground" />
            <h2 className="font-semibold">Alterar senha</h2>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
              Senha atual
            </label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
              Nova senha
            </label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
            />
            {passwordStrength && (
              <div className="mt-2">
                <div className="h-1 w-full rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${strengthColor[passwordStrength]} ${strengthWidth[passwordStrength]}`}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Força:{" "}
                  <span
                    className={
                      passwordStrength === "forte"
                        ? "text-emerald-400"
                        : passwordStrength === "média"
                          ? "text-yellow-400"
                          : "text-red-400"
                    }
                  >
                    {passwordStrength}
                  </span>
                </p>
              </div>
            )}
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
              Confirmar nova senha
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className={
                confirmPassword && confirmPassword !== newPassword
                  ? "border-red-500"
                  : ""
              }
            />
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="text-xs text-red-500 mt-1">Senhas não coincidem</p>
            )}
          </div>
          {passwordError && (
            <p className="text-sm text-red-500">{passwordError}</p>
          )}
          {passwordSuccess && (
            <div className="flex items-center gap-2 text-sm text-emerald-500">
              <CheckCircle size={14} /> Senha alterada com sucesso
            </div>
          )}
          <Button
            className="bg-emerald-600 hover:bg-emerald-500 text-white"
            onClick={handleSavePassword}
            disabled={isSavingPassword}
          >
            {isSavingPassword && (
              <Loader2 size={14} className="animate-spin mr-2" />
            )}
            Alterar senha
          </Button>
        </CardContent>
      </Card>

      {/* Zona de perigo */}
      <Card className="border-red-500/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-red-500" />
            <h2 className="font-semibold text-red-500">Zona de perigo</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Ao deletar sua conta, todos os seus dados serão permanentemente
            removidos — contas, transações, categorias e histórico. Essa ação
            não pode ser desfeita.
          </p>
          <Button
            variant="outline"
            className="border-red-500/40 text-red-500 hover:bg-red-500/10 gap-2"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 size={14} />
            Deletar minha conta
          </Button>
        </CardContent>
      </Card>

      {/* Dialog confirmação de deleção */}
      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          setDeleteConfirm("");
          setDeleteError("");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <AlertTriangle size={18} />
              Deletar conta permanentemente
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div
              className="rounded-xl p-4 text-sm space-y-1"
              style={{
                background: "rgba(201,74,63,0.06)",
                border: "1px solid rgba(201,74,63,0.2)",
              }}
            >
              <p className="font-medium text-red-500">
                Esta ação é irreversível.
              </p>
              <p className="text-muted-foreground">
                Todos os seus dados serão deletados: contas, transações,
                categorias e histórico financeiro.
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Digite{" "}
                <span className="font-mono font-bold text-foreground">
                  DELETAR
                </span>{" "}
                para confirmar
              </label>
              <Input
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="DELETAR"
                className={
                  deleteConfirm && deleteConfirm !== "DELETAR"
                    ? "border-red-500"
                    : ""
                }
              />
            </div>
            {deleteError && (
              <p className="text-sm text-red-500">{deleteError}</p>
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDeleteOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-500 text-white gap-2"
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount || deleteConfirm !== "DELETAR"}
              >
                {isDeletingAccount && (
                  <Loader2 size={14} className="animate-spin" />
                )}
                Deletar conta
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
