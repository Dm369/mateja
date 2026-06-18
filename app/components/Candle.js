
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Candle(){
  const [name,setName]=useState("");
  const [honeypot,setHoneypot]=useState("");
  const [candles,setCandles]=useState([]);

  async function load(){
    const {data}=await supabase.from("candles").select("*").order("created_at",{ascending:false});
    setCandles(data||[]);
  }

  async function add(){
    if(honeypot) return; // spam bot trap
    if(name.length<2) return;

    await supabase.from("candles").insert([{name}]);
    setName("");
    load();
  }

  useEffect(()=>{load();},[]);

  return (
    <section>
      <h2>Svečke</h2>

      <span className="candle">🕯</span>

      <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Tvoje ime"/>

      {/* honeypot hidden field */}
      <input style={{display:"none"}} value={honeypot} onChange={(e)=>setHoneypot(e.target.value)} />

      <button onClick={add}>Prižgi svečko</button>

      <div>
        {candles.map(c=>(
          <p key={c.id}>🕯 {c.name}</p>
        ))}
      </div>
    </section>
  );
}
