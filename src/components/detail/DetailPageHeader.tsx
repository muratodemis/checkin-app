"use client";

import { Member } from "@/types";
import { ArrowLeft, Search, Bell } from "lucide-react";
import Link from "next/link";

interface Props {
  member: Member;
  dayLabel: string;
}

export function DetailPageHeader({ member, dayLabel }: Props) {
  const initials = member.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-5">
        <Link href="/" className="text-stone-400 hover:text-stone-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-4">
          {member.avatar_url ? (
            <img src={member.avatar_url} alt={member.name} className="w-12 h-12 rounded-full object-cover border border-stone-200" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-sm font-semibold text-stone-600">
              {initials}
            </div>
          )}
          <div>
            <h1 className="text-xl font-semibold text-stone-900">{member.name}</h1>
            <p className="text-sm text-stone-500">{member.role || "Team Member"} · {dayLabel}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors">
          <Search className="w-5 h-5" />
        </button>
        <button className="p-2 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <button className="h-9 px-4 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors">
          + Create Request
        </button>
      </div>
    </div>
  );
}
