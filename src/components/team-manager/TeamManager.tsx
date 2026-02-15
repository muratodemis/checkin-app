"use client";

import { useState } from "react";
import { Plus, Trash2, UserMinus, Pencil, Check, X, Users } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useTeams } from "@/lib/hooks/useTeams";
import { TeamWithMembers, Member } from "@/types";

interface TeamManagerProps {
  open: boolean;
  onClose: () => void;
}

export function TeamManager({ open, onClose }: TeamManagerProps) {
  const {
    teams: rawTeams,
    createTeam,
    updateTeam,
    deleteTeam,
    createMember,
    updateMember,
    deactivateMember,
  } = useTeams();

  const teams = Array.isArray(rawTeams) ? rawTeams : [];

  // Team creation
  const [newTeamName, setNewTeamName] = useState("");

  // Member creation
  const [addingMemberTo, setAddingMemberTo] = useState<string | null>(null);
  const [newMember, setNewMember] = useState({ name: "", role: "", avatar_url: "" });

  // Team editing
  const [editingTeam, setEditingTeam] = useState<string | null>(null);
  const [editTeamName, setEditTeamName] = useState("");

  // Member editing
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [editMember, setEditMember] = useState({ name: "", role: "", avatar_url: "" });

  const handleAddTeam = async () => {
    if (!newTeamName.trim()) return;
    await createTeam(newTeamName.trim());
    setNewTeamName("");
  };

  const handleSaveTeam = async (id: string) => {
    if (!editTeamName.trim()) return;
    await updateTeam(id, { name: editTeamName.trim() });
    setEditingTeam(null);
  };

  const handleAddMember = async (teamId: string) => {
    if (!newMember.name.trim()) return;
    await createMember({
      name: newMember.name.trim(),
      role: newMember.role.trim() || undefined,
      avatar_url: newMember.avatar_url.trim() || undefined,
      team_id: teamId,
    });
    setNewMember({ name: "", role: "", avatar_url: "" });
    setAddingMemberTo(null);
  };

  const handleSaveMember = async (id: string) => {
    await updateMember(id, {
      name: editMember.name,
      role: editMember.role || undefined,
      avatar_url: editMember.avatar_url || undefined,
    });
    setEditingMember(null);
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-[420px] sm:max-w-[420px] p-0 flex flex-col">
        <SheetHeader className="px-5 pt-5 pb-4 border-b border-stone-100">
          <SheetTitle className="text-[16px] font-semibold text-stone-800 flex items-center gap-2">
            <Users className="w-4 h-4 text-stone-400" />
            Takım Yönetimi
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Add new team */}
          <div className="flex gap-2">
            <input
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="Yeni takım adı..."
              className="
                flex-1 h-9 px-3 text-[13px] rounded-lg
                bg-stone-50 border border-stone-200 text-stone-800
                placeholder:text-stone-300
                focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-transparent
                transition-all
              "
              onKeyDown={(e) => e.key === "Enter" && handleAddTeam()}
            />
            <button
              onClick={handleAddTeam}
              disabled={!newTeamName.trim()}
              className="
                h-9 px-3 rounded-lg bg-stone-800 text-white
                hover:bg-stone-700 disabled:opacity-30
                transition-colors
              "
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Teams list */}
          {teams.map((team: TeamWithMembers) => (
            <div key={team.id} className="animate-fade-in">
              {/* Team header */}
              <div className="flex items-center justify-between mb-2">
                {editingTeam === team.id ? (
                  <div className="flex items-center gap-1.5 flex-1 mr-2">
                    <input
                      value={editTeamName}
                      onChange={(e) => setEditTeamName(e.target.value)}
                      className="
                        flex-1 h-8 px-2.5 text-[13px] rounded-md
                        border border-stone-200 text-stone-800
                        focus:outline-none focus:ring-2 focus:ring-stone-300
                      "
                      onKeyDown={(e) => e.key === "Enter" && handleSaveTeam(team.id)}
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveTeam(team.id)}
                      className="p-1.5 rounded-md hover:bg-stone-100 text-emerald-600"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingTeam(null)}
                      className="p-1.5 rounded-md hover:bg-stone-100 text-stone-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-[12px] font-semibold text-stone-500 uppercase tracking-[0.06em]">
                      {team.name}
                    </h3>
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => {
                          setEditingTeam(team.id);
                          setEditTeamName(team.name);
                        }}
                        className="p-1.5 rounded-md text-stone-300 hover:text-stone-500 hover:bg-stone-100 transition-colors"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="p-1.5 rounded-md text-stone-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Takımı sil?</AlertDialogTitle>
                            <AlertDialogDescription>
                              &quot;{team.name}&quot; takımı ve tüm üyeleri silinecek. Bu işlem geri alınamaz.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>İptal</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteTeam(team.id)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              Sil
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </>
                )}
              </div>

              {/* Divider */}
              <div className="h-px bg-stone-100 mb-2" />

              {/* Members list */}
              <div className="space-y-0.5 ml-1">
                {(Array.isArray(team.members) ? team.members : []).map((member: Member) => (
                  <div key={member.id}>
                    {editingMember === member.id ? (
                      <div className="space-y-1.5 p-2.5 bg-stone-50 rounded-lg my-1 animate-fade-in">
                        <input
                          value={editMember.name}
                          onChange={(e) => setEditMember((d) => ({ ...d, name: e.target.value }))}
                          placeholder="İsim"
                          className="w-full h-7 px-2.5 text-[12px] rounded-md border border-stone-200 text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-300"
                          autoFocus
                        />
                        <input
                          value={editMember.role}
                          onChange={(e) => setEditMember((d) => ({ ...d, role: e.target.value }))}
                          placeholder="Rol (opsiyonel)"
                          className="w-full h-7 px-2.5 text-[12px] rounded-md border border-stone-200 text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-300"
                        />
                        <input
                          value={editMember.avatar_url}
                          onChange={(e) => setEditMember((d) => ({ ...d, avatar_url: e.target.value }))}
                          placeholder="Avatar URL (opsiyonel)"
                          className="w-full h-7 px-2.5 text-[12px] rounded-md border border-stone-200 text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-300"
                        />
                        <div className="flex gap-1.5 justify-end pt-1">
                          <button
                            onClick={() => setEditingMember(null)}
                            className="px-3 py-1 rounded-md text-[11px] text-stone-500 hover:bg-stone-100 transition-colors"
                          >
                            İptal
                          </button>
                          <button
                            onClick={() => handleSaveMember(member.id)}
                            className="px-3 py-1 rounded-md text-[11px] bg-stone-800 text-white hover:bg-stone-700 transition-colors"
                          >
                            Kaydet
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between py-1.5 px-2 rounded-lg group/m hover:bg-stone-50 transition-colors">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center text-[9px] font-semibold text-stone-500 shrink-0">
                            {member.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[12px] font-medium text-stone-700 truncate">{member.name}</p>
                            {member.role && (
                              <p className="text-[10px] text-stone-400 truncate">{member.role}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover/m:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingMember(member.id);
                              setEditMember({
                                name: member.name,
                                role: member.role || "",
                                avatar_url: member.avatar_url || "",
                              });
                            }}
                            className="p-1 rounded text-stone-300 hover:text-stone-500 hover:bg-stone-100"
                          >
                            <Pencil className="w-2.5 h-2.5" />
                          </button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button className="p-1 rounded text-stone-300 hover:text-orange-500 hover:bg-orange-50">
                                <UserMinus className="w-2.5 h-2.5" />
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Üyeyi deaktif et?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {member.name} deaktif edilecek. Geçmiş notları korunur.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>İptal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deactivateMember(member.id)}>
                                  Deaktif Et
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Add member */}
                {addingMemberTo === team.id ? (
                  <div className="space-y-1.5 p-2.5 bg-stone-50 rounded-lg my-1 animate-fade-in">
                    <input
                      value={newMember.name}
                      onChange={(e) => setNewMember((d) => ({ ...d, name: e.target.value }))}
                      placeholder="İsim *"
                      className="w-full h-7 px-2.5 text-[12px] rounded-md border border-stone-200 text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-300"
                      autoFocus
                      onKeyDown={(e) => e.key === "Enter" && handleAddMember(team.id)}
                    />
                    <input
                      value={newMember.role}
                      onChange={(e) => setNewMember((d) => ({ ...d, role: e.target.value }))}
                      placeholder="Rol (opsiyonel)"
                      className="w-full h-7 px-2.5 text-[12px] rounded-md border border-stone-200 text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-300"
                      onKeyDown={(e) => e.key === "Enter" && handleAddMember(team.id)}
                    />
                    <input
                      value={newMember.avatar_url}
                      onChange={(e) => setNewMember((d) => ({ ...d, avatar_url: e.target.value }))}
                      placeholder="Avatar URL (opsiyonel)"
                      className="w-full h-7 px-2.5 text-[12px] rounded-md border border-stone-200 text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-300"
                      onKeyDown={(e) => e.key === "Enter" && handleAddMember(team.id)}
                    />
                    <div className="flex gap-1.5 justify-end pt-1">
                      <button
                        onClick={() => {
                          setAddingMemberTo(null);
                          setNewMember({ name: "", role: "", avatar_url: "" });
                        }}
                        className="px-3 py-1 rounded-md text-[11px] text-stone-500 hover:bg-stone-100 transition-colors"
                      >
                        İptal
                      </button>
                      <button
                        onClick={() => handleAddMember(team.id)}
                        disabled={!newMember.name.trim()}
                        className="px-3 py-1 rounded-md text-[11px] bg-stone-800 text-white hover:bg-stone-700 disabled:opacity-30 transition-colors"
                      >
                        Ekle
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingMemberTo(team.id)}
                    className="
                      flex items-center gap-1.5 px-2 py-1.5
                      text-[11px] text-stone-400 hover:text-stone-600
                      rounded-lg hover:bg-stone-50 transition-colors mt-1
                    "
                  >
                    <Plus className="w-3 h-3" />
                    Üye ekle
                  </button>
                )}
              </div>
            </div>
          ))}

          {teams.length === 0 && (
            <div className="text-center py-12">
              <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-3">
                <Users className="w-4 h-4 text-stone-400" />
              </div>
              <p className="text-[13px] text-stone-400">
                Henüz takım yok. Yukarıdan yeni bir takım oluşturun.
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
