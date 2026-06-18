
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Guestbook(){
  const [form,setForm]=useState({name:"",relation:"",message:""});
  const [honeypot,setHoneypot]=useState("");
  const [entries,setEntries]=useState([]);

  async function load(){
    const {data}=await supabase.from("messages").select("*").order("created_at",{ascending:false});
    setEntries(data||[]);
  }

  async function submit(){
    if(honeypot) return;
    if(form.name.length<2 || form.message.length<3) return;

    await supabase.from("messages").insert([form]);
    setForm({name:"",relation:"",message:""});
    load();
  }

  useEffect(()=>{load();},[]);

  return (
    <section>
      <h2>Spominska knjiga</h2>

      <input placeholder="Ime"
        value={form.name}
        onChange={(e)=>setForm({...form,name:e.target.value})}
      />

      <input placeholder="Povezava"
        value={form.relation}
        onChange={(e)=>setForm({...form,relation:e.target.value})}
      />

      <textarea placeholder="Sporočilo"
        value={form.message}
        onChange={(e)=>setForm({...form,message:e.target.value})}
      />

      <input style={{display:"none"}} value={honeypot} onChange={(e)=>setHoneypot(e.target.value)} />

      <button onClick={submit}>Oddaj</button>

      {entries.map(e=>(
        <div key={e.id}>
          <b>{e.name}</b> ({e.relation})
          <p>{e.message}</p>
        </div>
      ))}
    </section>
  );
}
