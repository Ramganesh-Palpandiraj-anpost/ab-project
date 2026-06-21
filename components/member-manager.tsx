"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit3, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { members as seed } from "@/lib/demo-data";
import { createClient } from "@/lib/supabase/client";
import type { Member } from "@/lib/types";
import { DataTable } from "./data-table";

const schema = z.object({
  member_name: z.string().min(2, "Enter a member name"),
  phone: z.string().min(7, "Enter a valid contact number"),
  location: z.string().min(2, "Enter a location"),
  occupation: z.string().min(2, "Enter an occupation"),
});
type Form = z.infer<typeof schema>;

export function MemberManager() {
  const [rows, setRows] = useState(seed);
  const [editing, setEditing] = useState<Member | null | undefined>();
  const enabled = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!enabled) return;
    createClient().from("members").select("*").order("member_name").then(({ data, error }) => {
      if (error) toast.error(error.message);
      else if (data) setRows(data);
    });
  }, [enabled]);

  function open(member: Member | null) {
    setEditing(member);
    reset(member ? {
      member_name: member.member_name,
      phone: member.phone || "",
      location: member.location || "",
      occupation: member.occupation || "",
    } : { member_name: "", phone: "", location: "", occupation: "" });
  }

  async function save(values: Form) {
    const record: Member = {
      id: editing?.id || crypto.randomUUID(),
      ...values,
      family_name: editing?.family_name || null,
      status: editing?.status || "active",
      annual_commitment: editing?.annual_commitment,
    };
    if (enabled) {
      const { error } = await createClient().from("members").upsert(record);
      if (error) return toast.error(error.message);
    }
    setRows(current => editing ? current.map(member => member.id === editing.id ? record : member) : [record, ...current]);
    setEditing(undefined);
    toast.success(editing ? "Member updated" : "Member added");
  }

  async function remove(member: Member) {
    if (!window.confirm(`Remove ${member.member_name}?`)) return;
    if (enabled) {
      const { error } = await createClient().from("members").delete().eq("id", member.id);
      if (error) return toast.error(error.message);
    }
    setRows(current => current.filter(item => item.id !== member.id));
    toast.success("Member removed");
  }

  const columns: ColumnDef<Member>[] = [
    { accessorKey: "member_name", header: "Name", cell: cell => <b>{cell.getValue() as string}</b> },
    { accessorKey: "phone", header: "Contact number" },
    { accessorKey: "location", header: "Location" },
    { accessorKey: "occupation", header: "Occupation" },
    { id: "actions", header: "", cell: ({ row }) => <div className="flex justify-end gap-1">
      <button aria-label={`Edit ${row.original.member_name}`} title="Edit member" className="p-2 hover:text-brand" onClick={() => open(row.original)}><Edit3 className="size-4" /></button>
      <button aria-label={`Remove ${row.original.member_name}`} title="Remove member" className="p-2 hover:text-red-600" onClick={() => remove(row.original)}><Trash2 className="size-4" /></button>
    </div> },
  ];

  return <>
    <div className="card">
      <div className="mb-5 flex justify-end"><button className="btn" onClick={() => open(null)}><Plus className="size-4" />Add member</button></div>
      <DataTable data={rows} columns={columns} search="Search members..." />
    </div>
    {editing !== undefined && <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/50 p-4">
      <form onSubmit={handleSubmit(save)} className="card w-full max-w-lg">
        <div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-bold">{editing ? "Edit member" : "Add member"}</h2><button type="button" aria-label="Close" onClick={() => setEditing(undefined)}><X /></button></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" error={errors.member_name?.message}><input className="input" {...register("member_name")} /></Field>
          <Field label="Contact number" error={errors.phone?.message}><input className="input" type="tel" {...register("phone")} /></Field>
          <Field label="Location" error={errors.location?.message}><input className="input" {...register("location")} /></Field>
          <Field label="Occupation" error={errors.occupation?.message}><input className="input" {...register("occupation")} /></Field>
        </div>
        <div className="mt-6 flex justify-end gap-2"><button type="button" className="btn-secondary" onClick={() => setEditing(undefined)}>Cancel</button><button className="btn" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save member"}</button></div>
      </form>
    </div>}
  </>;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label><span className="mb-1 block text-sm">{label}</span>{children}<small className="text-red-500">{error}</small></label>;
}
