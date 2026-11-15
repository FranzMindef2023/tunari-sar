# TUNARI-SAR: Sistema Predictivo de Alerta Temprana Hidrológica y Deslizamientos

**NASA International Space Apps Challenge 2026 — Sede Cochabamba, Bolivia**
**Equipo:** KillaTech
**Desafío:** Dancing with the SARs (Earth Sciences & Urban Climate Resilience)

## Resumen del Proyecto
Plataforma geoespacial interactiva de alerta temprana que fusiona Radar de Apertura Sintética (NISAR/Sentinel-1), Modelos Digitales de Elevación (NASA SRTM) y datos de precipitación (NASA GPM IMERG), calibrados con 60 puntos históricos del Gobierno Autónomo Municipal de Cochabamba (GAMC) para prevenir desbordes de torrenteras y deslizamientos en el Parque Nacional Tunari.

## Fuentes de Datos Abiertos
1. **NASA-ISRO SAR (NISAR) / Sentinel-1 C-Band SAR:** Detección de humedad subsuperficial y microdeformación bajo nubes.
2. **NASA SRTM (30m DEM):** Pendientes críticas y acumulación de escorrentía.
3. **NASA GPM (IMERG):** Simulación y monitoreo de intensidad de precipitación (mm/h).
4. **Dataset Local GAMC (Ground-Truth):** 60 puntos históricos de inundación y movimientos de masa en Cochabamba (88.3% de precisión).

## Ejecución Local
```bash
npm install
npm run dev
```

## Licencia
MIT License - Equipo KillaTech 2026
