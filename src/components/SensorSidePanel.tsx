import React, { useState } from 'react';
import {
  Thermometer,
  Droplets,
  Activity,
  Wind,
  Gauge,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Radio,
  CheckCircle2,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { AquariumTheme, SensorTelemetry } from '../types/aquarium';

interface SensorSidePanelProps {
  currentTheme: AquariumTheme;
  telemetry: SensorTelemetry;
  tempUnit: 'C' | 'F';
  setTempUnit: (unit: 'C' | 'F') => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isCalibrating: boolean;
  onCalibrate: () => void;
}

export const SensorSidePanel: React.FC<SensorSidePanelProps> = ({
  currentTheme,
  telemetry,
  tempUnit,
  setTempUnit,
  isCollapsed,
  setIsCollapsed,
  isCalibrating,
  onCalibrate,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');

  const displayTemp = tempUnit === 'C' ? telemetry.waterTempC : telemetry.waterTempF;
  const displayAmbient = tempUnit === 'C' ? telemetry.ambientTempC : telemetry.ambientTempF;

  // Mini sparkline SVG renderer
  const renderSparkline = (data: number[], color: string, minVal?: number, maxVal?: number) => {
    if (!data || data.length < 2) return null;
    const min = minVal ?? Math.min(...data);
    const max = maxVal ?? Math.max(...data);
    const range = max - min || 1;
    const width = 80;
    const height = 24;

    const points = data
      .map((val, idx) => {
        const x = (idx / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 6) - 3;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');

    return (
      <svg className="w-20 h-6 shrink-0 overflow-visible" viewBox={`0 0 ${width} ${height}`}>
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        {/* Current reading point dot */}
        {data.length > 0 && (
          <circle
            cx={width}
            cy={height - ((data[data.length - 1] - min) / range) * (height - 6) - 3}
            r="3"
            fill={color}
            className="animate-pulse"
          />
        )}
      </svg>
    );
  };

  // pH meter position (range: 6.0 to 9.0)
  const phPercent = Math.min(100, Math.max(0, ((telemetry.phLevel - 6.0) / 3.0) * 100));

  return (
    <>
      {/* 1. COLLAPSED FLOATING SIDE PILL */}
      {isCollapsed && (
        <aside
          aria-label="Sensor summary"
          className="absolute top-3 sm:top-5 left-3 sm:left-5 z-20 select-none animate-in fade-in zoom-in-95 duration-200"
        >
          <button
            onClick={() => setIsCollapsed(false)}
            className="group flex items-center gap-2.5 px-3 py-2 bg-slate-950/85 hover:bg-slate-900/95 backdrop-blur-xl border border-cyan-500/30 hover:border-cyan-400/60 rounded-2xl shadow-xl shadow-black/40 text-left transition-all active:scale-95"
            title="Expand Aquarium Sensor Telemetry"
          >
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-bold tracking-wider uppercase text-cyan-400">Sensors</span>
            </div>

            <div className="hidden xs:flex items-center gap-2 text-xs font-mono text-slate-200 tabular-nums">
              <span>{displayTemp}°{tempUnit}</span>
              <span className="text-slate-600">·</span>
              <span>{telemetry.humidityPercent}% RH</span>
              <span className="text-slate-600">·</span>
              <span>pH {telemetry.phLevel}</span>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-300 transition-transform group-hover:translate-x-0.5" />
          </button>
        </aside>
      )}

      {/* 2. EXPANDED TELEMETRY SIDE PANEL */}
      {!isCollapsed && (
        <aside
          aria-label="Aquarium telemetry panel"
          className="absolute top-3 sm:top-4 left-3 sm:left-4 z-30 w-[calc(100vw-1.5rem)] xs:w-80 sm:w-84 max-h-[calc(100vh-6.5rem)] flex flex-col bg-slate-950/90 backdrop-blur-2xl border border-cyan-500/25 rounded-2xl shadow-2xl shadow-black/70 overflow-hidden select-none animate-in fade-in slide-in-from-left-4 duration-200"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-3.5 py-3 border-b border-white/10 bg-slate-900/60">
            <div className="flex items-center gap-2 min-w-0">
              <Radio className="w-4 h-4 text-cyan-400 shrink-0 animate-pulse" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white truncate">
                    Telemetry Probes
                  </h3>
                  <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">
                  {currentTheme.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Temp Unit Selector */}
              <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-white/10 text-[10px] font-mono">
                <button
                  onClick={() => setTempUnit('C')}
                  className={`px-1.5 py-0.5 rounded transition-colors ${
                    tempUnit === 'C' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  °C
                </button>
                <button
                  onClick={() => setTempUnit('F')}
                  className={`px-1.5 py-0.5 rounded transition-colors ${
                    tempUnit === 'F' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  °F
                </button>
              </div>

              {/* Minimize Panel Button */}
              <button
                onClick={() => setIsCollapsed(true)}
                className="p-1.5 min-w-[32px] min-h-[32px] flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Collapse sensor panel"
                aria-label="Collapse sensor panel"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Subheader / Mode switcher tabs */}
          <div className="flex items-center px-3.5 pt-2 pb-1 gap-2 border-b border-white/5 bg-slate-950/40 text-[11px]">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-1 font-medium transition-colors border-b-2 ${
                activeTab === 'overview'
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Real-Time Readout
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`pb-1 font-medium transition-colors border-b-2 ${
                activeTab === 'history'
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Trend History
            </button>
          </div>

          {/* Scrollable Sensor Body */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 no-scrollbar text-xs">
            {activeTab === 'overview' && (
              <>
                {/* 1. TEMPERATURE SENSOR */}
                <div className="p-2.5 rounded-xl bg-slate-900/70 border border-white/5 space-y-1.5 hover:border-cyan-500/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-300 font-medium text-[11px]">
                      <Thermometer className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      Water Temperature
                    </span>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Optimal
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-bold font-mono tabular-nums text-white">
                        {displayTemp.toFixed(1)}°{tempUnit}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        (Air: {displayAmbient.toFixed(1)}°)
                      </span>
                    </div>
                    {renderSparkline(telemetry.history.temp, '#38bdf8')}
                  </div>

                  {/* Range indicator bar */}
                  <div className="space-y-1 pt-0.5">
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                      {/* Optimal band indicator: 23° to 27° in range 18° to 32° */}
                      <div className="absolute inset-y-0 left-[35%] right-[35%] bg-emerald-500/30"></div>
                      <div
                        className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, Math.max(10, ((telemetry.waterTempC - 18) / 14) * 100))}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                      <span>18°C Min</span>
                      <span className="text-emerald-400">Target 24°-27°C</span>
                      <span>32°C Max</span>
                    </div>
                  </div>
                </div>

                {/* 2. HUMIDITY SENSOR */}
                <div className="p-2.5 rounded-xl bg-slate-900/70 border border-white/5 space-y-1.5 hover:border-cyan-500/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-300 font-medium text-[11px]">
                      <Droplets className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      Canopy Humidity
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Surface Air
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-bold font-mono tabular-nums text-white">
                        {telemetry.humidityPercent.toFixed(1)}%
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">RH</span>
                    </div>
                    {renderSparkline(telemetry.history.humidity, '#60a5fa')}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                    <span>Target: 60% – 75% RH</span>
                    <span className="text-emerald-400 font-mono">Stable</span>
                  </div>
                </div>

                {/* 3. pH PROBE */}
                <div className="p-2.5 rounded-xl bg-slate-900/70 border border-white/5 space-y-1.5 hover:border-cyan-500/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-300 font-medium text-[11px]">
                      <Activity className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      Water pH Acidity
                    </span>
                    <span className="text-[10px] text-cyan-300 font-mono">
                      {currentTheme.category}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-bold font-mono tabular-nums text-white">
                        {telemetry.phLevel.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">pH</span>
                    </div>
                    {renderSparkline(telemetry.history.ph, '#34d399', 6.0, 9.0)}
                  </div>

                  {/* Visual pH spectrum gradient */}
                  <div className="space-y-1 pt-0.5">
                    <div className="relative w-full h-2 rounded-full overflow-hidden bg-gradient-to-r from-amber-500 via-emerald-400 to-cyan-500">
                      {/* Needle indicator */}
                      <div
                        className="absolute top-0 bottom-0 w-1 bg-white shadow-sm transition-all duration-500"
                        style={{ left: `calc(${phPercent}% - 2px)` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                      <span>6.0 Acidic</span>
                      <span className="text-white font-semibold">7.0 Neutral</span>
                      <span>9.0 Alkaline</span>
                    </div>
                  </div>
                </div>

                {/* 4. DISSOLVED OXYGEN & WATER PURITY */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-xl bg-slate-900/70 border border-white/5 space-y-1 hover:border-cyan-500/30 transition-colors">
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Wind className="w-3 h-3 text-cyan-300" />
                      <span>Oxygen (DO)</span>
                    </div>
                    <div className="font-mono text-sm font-bold text-white">
                      {telemetry.dissolvedOxygenMgL.toFixed(1)}{' '}
                      <span className="text-[9px] font-normal text-slate-400">mg/L</span>
                    </div>
                    <div className="text-[9px] text-emerald-400">
                      {Math.round((telemetry.dissolvedOxygenMgL / 8.0) * 100)}% Saturation
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-900/70 border border-white/5 space-y-1 hover:border-cyan-500/30 transition-colors">
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Gauge className="w-3 h-3 text-cyan-300" />
                      <span>Salinity / TDS</span>
                    </div>
                    <div className="font-mono text-sm font-bold text-white">
                      {telemetry.salinityPpt > 1 ? (
                        <>
                          {telemetry.salinityPpt}{' '}
                          <span className="text-[9px] font-normal text-slate-400">ppt</span>
                        </>
                      ) : (
                        <>
                          {telemetry.tdsPpm}{' '}
                          <span className="text-[9px] font-normal text-slate-400">ppm</span>
                        </>
                      )}
                    </div>
                    <div className="text-[9px] text-slate-400 truncate">
                      {currentTheme.category}
                    </div>
                  </div>
                </div>

                {/* 5. TANK CLARITY */}
                <div className="p-2 rounded-xl bg-slate-900/70 border border-white/5 flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    Water Clarity Index
                  </span>
                  <span className="font-mono text-emerald-400 font-semibold">
                    {telemetry.clarityPercent.toFixed(0)}% Clear
                  </span>
                </div>
              </>
            )}

            {/* HISTORY / TRENDS TAB */}
            {activeTab === 'history' && (
              <div className="space-y-3 p-1">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-200">10-Sample Telemetry Stream</span>
                    <span className="text-[10px] text-cyan-400 font-mono">Live buffer</span>
                  </div>
                  <div className="space-y-1.5 font-mono text-[10px]">
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Water Temp:</span>
                      <span className="text-cyan-300">{telemetry.history.temp.slice(-4).join('° → ')}°C</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Humidity:</span>
                      <span className="text-blue-300">{telemetry.history.humidity.slice(-4).join('% → ')}%</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>pH Level:</span>
                      <span className="text-emerald-300">{telemetry.history.ph.slice(-4).join(' → ')}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Dissolved O₂:</span>
                      <span className="text-purple-300">{telemetry.history.oxygen.slice(-4).join(' → ')} mg/L</span>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 leading-relaxed bg-slate-900/40 p-2.5 rounded-xl border border-white/5">
                  Probes continuously sample water parameters every 1.5 seconds. Changes to lighting modes, aerator bubbling, current speed, or water theme dynamically update baseline sensor readings.
                </div>
              </div>
            )}
          </div>

          {/* Footer Bar with Calibration Action */}
          <div className="p-2.5 border-t border-white/10 bg-slate-900/80 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Sensors Calibrated</span>
            </div>

            <button
              onClick={onCalibrate}
              disabled={isCalibrating}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-cyan-300 hover:text-white bg-cyan-950/60 hover:bg-cyan-900/80 disabled:opacity-50 rounded-lg border border-cyan-800/40 transition-all active:scale-95"
              title="Perform simulated sensor zero & probe calibration"
            >
              <RefreshCw className={`w-3 h-3 ${isCalibrating ? 'animate-spin' : ''}`} />
              <span>{isCalibrating ? 'Calibrating...' : 'Zero Probes'}</span>
            </button>
          </div>
        </aside>
      )}
    </>
  );
};
