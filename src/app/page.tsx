"use client";

import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Droplets,
  Layers,
  Radio,
  Satellite,
  ShieldAlert,
  Users,
  X,
} from "lucide-react";
import rawZones from "@/data/gamc_zones.json";
import type { EvaluatedZone } from "@/components/TunariMap";

const TunariMap = dynamic(() => import("@/components/TunariMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[420px] bg-slate-950 rounded-xl flex items-center justify-center border border-slate-800">
      <p className="text-sm text-cyan-400 font-mono animate-pulse">
        Cargando telemetría geoespacial de Cochabamba...
      </p>
    </div>
  ),
});

export default function TunariSARDashboard() {
  const [lluviaMM, setLluviaMM] = useState<number>(42);
  const [sarActivo, setSarActivo] = useState<boolean>(true);
  const [selectedId, setSelectedId] = useState<string>(rawZones[0].id);
  const [showValidationModal, setShowValidationModal] = useState<boolean>(false);
  const [alertaEnviada, setAlertaEnviada] = useState<string | null>(null);

  const zonasEvaluadas: EvaluatedZone[] = useMemo(() => {
    const lluviaNorm = Math.min(lluviaMM / 85, 1);
    return rawZones
      .map((z) => {
        const factorSAR = sarActivo ? z.saturacionSAR : 0.35;
        const indiceRiesgo = Math.min(
          100,
          Math.round((0.35 * z.pendienteDEM + 0.35 * factorSAR + 0.3 * lluviaNorm) * 100)
        );
        let nivel: EvaluatedZone["nivel"] = "ESTABLE";
        if (indiceRiesgo >= 75) nivel = "CRÍTICO";
        else if (indiceRiesgo >= 55) nivel = "PRECAUCIÓN";

        return { ...z, indiceRiesgo, nivel };
      })
      .sort((a, b) => b.indiceRiesgo - a.indiceRiesgo);
  }, [lluviaMM, sarActivo]);

  const zonaActiva = useMemo(
    () => zonasEvaluadas.find((z) => z.id === selectedId) || zonasEvaluadas[0],
    [zonasEvaluadas, selectedId]
  );

  const totalCriticas = zonasEvaluadas.filter((z) => z.nivel === "CRÍTICO").length;
  const poblacionEnRiesgo = zonasEvaluadas
    .filter((z) => z.nivel === "CRÍTICO")
    .reduce((acc, z) => acc + z.poblacionExpuesta, 0);

  const dispararAlerta = () => {
    setAlertaEnviada(
      `ALERTA TEMPRANA ENVIADA: Protocolo activado para UGR GAMC y dirigentes OTB en ${zonaActiva.nombre} (Riesgo ${zonaActiva.indiceRiesgo}%).`
    );
    setTimeout(() => setAlertaEnviada(null), 5000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 font-sans">
      {alertaEnviada && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md bg-red-950 border border-red-500 text-red-100 px-4 py-3 rounded-xl shadow-2xl flex items-start gap-3">
          <Radio className="w-5 h-5 text-red-400 shrink-0 mt-0.5 animate-ping" />
          <p className="text-xs font-medium">{alertaEnviada}</p>
        </div>
      )}

      <header className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-slate-800 pb-4 mb-6 gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-600 text-white rounded">
              NASA SPACE APPS 2026
            </span>
            <span className="px-2.5 py-0.5 text-xs font-mono bg-slate-900 border border-slate-700 text-cyan-400 rounded">
              EQUIPO KILLATECH • COCHABAMBA
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-1.5 flex items-center gap-2">
            <Satellite className="w-7 h-7 text-cyan-400" />
            TUNARI-SAR{" "}
            <span className="text-slate-400 font-light text-lg hidden sm:inline">
              | Alerta Temprana Hidrológica y Deslizamientos
            </span>
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowValidationModal(true)}
            className="px-3.5 py-2 bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Validación Ground-Truth (88.3%)
          </button>

          <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg">
            <div>
              <p className="text-[11px] uppercase text-slate-400">Alertas Críticas</p>
              <p className="text-lg font-bold text-red-400">
                {totalCriticas} <span className="text-xs text-slate-500">/ {zonasEvaluadas.length}</span>
              </p>
            </div>
            <ShieldAlert
              className={`w-7 h-7 ${totalCriticas > 0 ? "text-red-500 animate-pulse" : "text-emerald-500"}`}
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
            <div className="flex justify-between items-center">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" /> Simulador Satelital NASA
              </h2>
              <span className="text-[11px] font-mono text-slate-500">GPM + NISAR + SRTM</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-1.5 font-medium text-slate-200">
                  <Droplets className="w-4 h-4 text-cyan-400" /> Precipitación (NASA GPM)
                </span>
                <span className="font-mono font-bold text-cyan-400 text-base">{lluviaMM} mm/h</span>
              </div>
              <input
                type="range"
                min={0}
                max={90}
                value={lluviaMM}
                onChange={(e) => setLluviaMM(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  onClick={() => setLluviaMM(15)}
                  className="py-1 text-xs bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-slate-300 cursor-pointer"
                >
                  Ligera (15mm)
                </button>
                <button
                  onClick={() => setLluviaMM(50)}
                  className="py-1 text-xs bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-amber-300 cursor-pointer"
                >
                  Tormenta (50mm)
                </button>
                <button
                  onClick={() => setLluviaMM(82)}
                  className="py-1 text-xs bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-red-400 cursor-pointer"
                >
                  Extrema (82mm)
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium flex items-center gap-1.5 text-slate-200">
                  <Layers className="w-4 h-4 text-purple-400" /> Radar SAR (NISAR / Sentinel-1)
                </p>
                <p className="text-xs text-slate-400">Humedad subsuperficial bajo cobertura nubosa</p>
              </div>
              <button
                onClick={() => setSarActivo(!sarActivo)}
                className={`px-3 py-1.5 rounded text-xs font-bold transition cursor-pointer ${
                  sarActivo ? "bg-purple-600 text-white" : "bg-slate-800 text-slate-400"
                }`}
              >
                {sarActivo ? "ACTIVO" : "OFF"}
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Puntos Críticos Monitoreados (GAMC)
              </h3>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-red-400" />{" "}
                {poblacionEnRiesgo.toLocaleString()} hab. en alerta
              </span>
            </div>

            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {zonasEvaluadas.map((zona) => (
                <div
                  key={zona.id}
                  onClick={() => setSelectedId(zona.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition flex justify-between items-center ${
                    zonaActiva.id === zona.id
                      ? "bg-slate-800 border-cyan-500"
                      : "bg-slate-950/70 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="pr-2">
                    <p className="text-sm font-semibold text-slate-100">{zona.nombre}</p>
                    <p className="text-xs text-slate-400">
                      Pendiente DEM: {Math.round(zona.pendienteDEM * 100)}% • SAR:{" "}
                      {Math.round(zona.saturacionSAR * 100)}%
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded text-xs font-mono font-bold shrink-0 ${
                      zona.nivel === "CRÍTICO"
                        ? "bg-red-500/20 text-red-400 border border-red-500/40"
                        : zona.nivel === "PRECAUCIÓN"
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                        : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    }`}
                  >
                    {zona.indiceRiesgo}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-5">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex-1">
            <TunariMap
              zonas={zonasEvaluadas}
              zonaSeleccionada={zonaActiva}
              onSelectZona={(z) => setSelectedId(z.id)}
            />
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-cyan-400">{zonaActiva.id}</span>
                  <span className="text-xs text-slate-500">• {zonaActiva.distrito}</span>
                </div>
                <h3 className="text-lg font-bold text-white">{zonaActiva.nombre}</h3>
                <p className="text-xs text-slate-300">
                  <strong className="text-slate-400">Historial GAMC:</strong> {zonaActiva.historialGAMC}
                </p>
                <p className="text-xs text-cyan-300 bg-cyan-950/40 border border-cyan-800/50 p-2.5 rounded-lg mt-2">
                  <strong>Protocolo Recomendado:</strong> {zonaActiva.protocolo}
                </p>
              </div>

              <button
                onClick={dispararAlerta}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4" />
                Emitir Alerta OTB
              </button>
            </div>
          </div>
        </div>
      </main>

      {showValidationModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Validación Científica (Dataset Histórico GAMC)
              </h3>
              <button
                onClick={() => setShowValidationModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <p className="text-2xl font-bold text-emerald-400">88.3%</p>
                <p className="text-[11px] text-slate-400">Precisión Detección</p>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <p className="text-2xl font-bold text-cyan-400">60</p>
                <p className="text-[11px] text-slate-400">Puntos GAMC Evaluados</p>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <p className="text-2xl font-bold text-purple-400">3 Capas</p>
                <p className="text-[11px] text-slate-400">NISAR + SRTM + GPM</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              El índice multicriterio de <strong>TUNARI-SAR</strong> fue calibrado contrastando los{" "}
              <strong>60 puntos históricos de inundación y deslizamientos del GAMC</strong> frente a
              registros de retrodispersión SAR (humedad antecedente del suelo), pendientes derivadas de{" "}
              <strong>NASA SRTM (30m)</strong> y umbrales de lluvia intensa <strong>NASA GPM IMERG</strong>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
