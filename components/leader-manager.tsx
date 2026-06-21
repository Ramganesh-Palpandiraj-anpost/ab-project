"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import { Camera, Edit3, Plus, Trash2, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { leaders as seed } from "@/lib/demo-data";
import { createClient } from "@/lib/supabase/client";
import type { Leader } from "@/lib/types";
import { DataTable } from "./data-table";

const schema = z.object({
  name: z.string().min(2, "Enter a name"),
  position: z.string().min(2, "Enter a position"),
  phone: z.string().min(7, "Enter a valid contact number"),
  location: z.string().min(2, "Enter a location"),
  occupation: z.string().min(2, "Enter an occupation"),
});
type Form = z.infer<typeof schema>;
const bucket = "leader-photos";

export function LeaderManager() {
  const [rows, setRows] = useState(seed);
  const [editing, setEditing] = useState<Leader | null | undefined>();
  const [picture, setPicture] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const enabled = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!enabled) return;
    createClient().from("leaders").select("*").order("position").then(({ data, error }) => {
      if (error) toast.error(error.message);
      else if (data) setRows(data);
    });
  }, [enabled]);

  function open(leader: Leader | null) {
    setEditing(leader);
    setPicture(null);
    setPreview(leader?.picture_url || null);
    reset(leader ? {
      name: leader.name,
      position: leader.position,
      phone: leader.phone,
      location: leader.location,
      occupation: leader.occupation,
    } : { name: "", position: "", phone: "", location: "", occupation: "" });
  }

  function choosePicture(file?: File) {
    if (!file) return;
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) return toast.error("Choose a JPG, PNG, or WebP image");
    if (file.size > 5 * 1024 * 1024) return toast.error("Picture must be 5 MB or smaller");
    setPicture(file);
    setPreview(URL.createObjectURL(file));
  }

  async function save(values: Form) {
    const id = editing?.id || crypto.randomUUID();
    let pictureUrl = editing?.picture_url || null;
    let picturePath = editing?.picture_path || null;
    let uploadedPath: string | null = null;
    const supabase = enabled ? createClient() : null;

    if (picture && supabase) {
      const extension = picture.name.split(".").pop()?.toLowerCase() || "jpg";
      uploadedPath = `${id}/${crypto.randomUUID()}.${extension}`;
      const { error } = await supabase.storage.from(bucket).upload(uploadedPath, picture, { contentType: picture.type });
      if (error) return toast.error(error.message);
      picturePath = uploadedPath;
      pictureUrl = supabase.storage.from(bucket).getPublicUrl(uploadedPath).data.publicUrl;
    } else if (picture) {
      pictureUrl = preview;
    }

    const record: Leader = { id, ...values, picture_url: pictureUrl, picture_path: picturePath };
    if (supabase) {
      const { error } = await supabase.from("leaders").upsert(record);
      if (error) {
        if (uploadedPath) await supabase.storage.from(bucket).remove([uploadedPath]);
        return toast.error(error.message);
      }
      if (uploadedPath && editing?.picture_path) await supabase.storage.from(bucket).remove([editing.picture_path]);
    }
    setRows(current => editing ? current.map(leader => leader.id === editing.id ? record : leader) : [record, ...current]);
    setEditing(undefined);
    toast.success(editing ? "Leader updated" : "Leader added");
  }

  async function remove(leader: Leader) {
    if (!window.confirm(`Remove ${leader.name}?`)) return;
    if (enabled) {
      const supabase = createClient();
      const { error } = await supabase.from("leaders").delete().eq("id", leader.id);
      if (error) return toast.error(error.message);
      if (leader.picture_path) await supabase.storage.from(bucket).remove([leader.picture_path]);
    }
    setRows(current => current.filter(item => item.id !== leader.id));
    toast.success("Leader removed");
  }

  const columns: ColumnDef<Leader>[] = [
    { id: "picture", header: "Picture", cell: ({ row }) => row.original.picture_url
      ? <img className="size-11 rounded-full object-cover" src={row.original.picture_url} alt={row.original.name} />
      : <span className="grid size-11 place-items-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800"><UserRound className="size-5" /></span> },
    { accessorKey: "name", header: "Name", cell: cell => <b>{cell.getValue() as string}</b> },
    { accessorKey: "position", header: "Position" },
    { accessorKey: "phone", header: "Contact number" },
    { accessorKey: "location", header: "Location" },
    { accessorKey: "occupation", header: "Occupation" },
    { id: "actions", header: "", cell: ({ row }) => <div className="flex justify-end gap-1">
      <button aria-label={`Edit ${row.original.name}`} title="Edit leader" className="p-2 hover:text-brand" onClick={() => open(row.original)}><Edit3 className="size-4" /></button>
      <button aria-label={`Remove ${row.original.name}`} title="Remove leader" className="p-2 hover:text-red-600" onClick={() => remove(row.original)}><Trash2 className="size-4" /></button>
    </div> },
  ];

  return <>
    <div className="card">
      <div className="mb-5 flex justify-end"><button className="btn" onClick={() => open(null)}><Plus className="size-4" />Add leader</button></div>
      <DataTable data={rows} columns={columns} search="Search leaders..." />
    </div>
    {editing !== undefined && <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/50 p-4">
      <form onSubmit={handleSubmit(save)} className="card w-full max-w-2xl">
        <div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-bold">{editing ? "Edit leader" : "Add leader"}</h2><button type="button" aria-label="Close" onClick={() => setEditing(undefined)}><X /></button></div>
        <div className="mb-5 flex items-center gap-4">
          {preview ? <img className="size-20 rounded-full object-cover" src={preview} alt="Leader preview" /> : <span className="grid size-20 place-items-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800"><UserRound className="size-8" /></span>}
          <label className="btn-secondary cursor-pointer"><Camera className="size-4" />Choose picture<input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={event => choosePicture(event.target.files?.[0])} /></label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" error={errors.name?.message}><input className="input" {...register("name")} /></Field>
          <Field label="Position" error={errors.position?.message}><input className="input" {...register("position")} /></Field>
          <Field label="Contact number" error={errors.phone?.message}><input className="input" type="tel" {...register("phone")} /></Field>
          <Field label="Location" error={errors.location?.message}><input className="input" {...register("location")} /></Field>
          <Field label="Occupation" error={errors.occupation?.message}><input className="input" {...register("occupation")} /></Field>
        </div>
        <div className="mt-6 flex justify-end gap-2"><button type="button" className="btn-secondary" onClick={() => setEditing(undefined)}>Cancel</button><button className="btn" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save leader"}</button></div>
      </form>
    </div>}
  </>;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label><span className="mb-1 block text-sm">{label}</span>{children}<small className="text-red-500">{error}</small></label>;
}
