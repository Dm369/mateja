"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ijfpjgrrbxxigqungnwd.supabase.co";
const SUPABASE_KEY = "sb_publishable_bHtyii6oVryrUPx6kJRhxQ_CXeIJ9FX";
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

const GRAVE_LAT = 45.82000375027724;
const GRAVE_LNG = 14.15691135669589;
const ALLOWED_RADIUS_M = 50;
const CANDLE_LIFETIME_MS = 365 * 24 * 60 * 60 * 1000;

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function Home() {
  const [candles, setCandles] = useState<any[]>([]);
  const [count, setCount] = useState(0);
  const [isNear, setIsNear] = useState(false);
  const [name, setName] = useState("");

  async function loadCandles() {
    const oneYearAgo = new Date(Date.now() - CANDLE_LIFETIME_MS).toISOString();

    const { data } = await db
      .from("candles")
      .select("*")
      .gte("created_at", oneYearAgo)
      .order("created_at", { ascending: false });

    setCandles(data || []);
    setCount(data?.length || 0);
  }

  async function addCandle() {
    if (!name || name.length < 2) return;

    await db.from("candles").insert([{ name }]);
    setName("");
    await loadCandles();
  }

  function checkGeo() {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition((pos) => {
      const dist = haversine(
        pos.coords.latitude,
        pos.coords.longitude,
        GRAVE_LAT,
        GRAVE_LNG
      );

      setIsNear(dist <= ALLOWED_RADIUS_M);
    });
  }

  useEffect(() => {
    loadCandles();
    checkGeo();
  }, []);

  return (
    <main style={{ fontFamily: "sans-serif", padding: 20 }}>
      {/* HERO */}
      <section style={{ textAlign: "center", padding: "40px 0" }}>
        <h1>Mateja Modrič</h1>
        <p>19. november 1987 ✦ 9. februar 2026</p>

        <p>{count} svečk v njen spomin</p>

        <input
          placeholder="Tvoje ime"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button
          onClick={addCandle}
          disabled={!isNear}
        >
          Prižgi svečko
        </button>

        {!isNear && <p>Za prižig moraš biti pri grobu (50m)</p>}
      </section>

      {/* CANDLES */}
      <section>
        <h2>Svečke</h2>

        {candles.length === 0 && <p>Ni svečk</p>}

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {candles.map((c, i) => (
            <div key={i} style={{ border: "1px solid #ccc", padding: 10 }}>
              🕯 {c.name}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
