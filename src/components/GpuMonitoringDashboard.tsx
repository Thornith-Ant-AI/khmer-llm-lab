import React, { useState, useEffect, useMemo } from 'react';
import { ScalingConfig, CloudInstance } from '../types';
import {
  Cpu,
  Zap,
  Activity,
  Thermometer,
  HardDrive,
  Play,
  Pause,
  RotateCcw,
  Flame,
  Clock,
  TrendingDown
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface GpuMonitoringDashboardProps {
  config: ScalingConfig;
  instance: CloudInstance;
  memoryPerGpuGB: {
    weights: number;
    gradients: number;
    optimizerAdam: number;
    activationsEst: number;
    totalPerGpuFsdp: number;
  };
  effectiveClusterTflops: number;
}

interface TelemetryPoint {
  time: number;
  tflops: number;
  temp: number;
  vram: number;
  loss: number;
}

export const GpuMonitoringDashboard: React.FC<GpuMonitoringDashboardProps> = ({
  config,
  instance,
  memoryPerGpuGB,
  effectiveClusterTflops
}) => {
  const { isKm, tr } = useLanguage();
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [thermalStressActive, setThermalStressActive] = useState<boolean>(false);
  const [checkpointingActive, setCheckpointingActive] = useState<boolean>(false);
  const [telemetryMetric, setTelemetryMetric] = useState<'tflops' | 'temp' | 'vram' | 'loss'>('tflops');

  // Job progress state
  const [globalStep, setGlobalStep] = useState<number>(4120);
  const [trainedTokensB, setTrainedTokensB] = useState<number>(8.24);
  const [currentLoss, setCurrentLoss] = useState<number>(2.418);

  // Per-GPU telemetry state (up to 8 cards visualized)
  const numGpusToVisualize = Math.min(8, instance.acceleratorCount || 8);
  const targetPerGpuTflops = Math.round(effectiveClusterTflops / Math.max(1, instance.acceleratorCount));
  const vramMaxGB = Math.round(instance.vramTotalGB / Math.max(1, instance.acceleratorCount));
  const baselineVram = Math.min(vramMaxGB * 0.95, memoryPerGpuGB.totalPerGpuFsdp);

  // Live GPU telemetry array
  const [gpuMetrics, setGpuMetrics] = useState<Array<{
    id: number;
    temp: number;
    vramUsed: number;
    tflops: number;
    smUtil: number;
    powerW: number;
    fanSpeedPct: number;
  }>>(() => {
    return Array.from({ length: numGpusToVisualize }, (_, i) => ({
      id: i,
      temp: 62 + (i % 3) * 2,
      vramUsed: Number((baselineVram * (0.98 + (i % 4) * 0.01)).toFixed(1)),
      tflops: Number((targetPerGpuTflops * (0.97 + (i % 3) * 0.02)).toFixed(1)),
      smUtil: 95 + (i % 4),
      powerW: 620 + (i % 3) * 15,
      fanSpeedPct: 72 + (i % 2) * 4
    }));
  });

  // Rolling sparkline history
  const [history, setHistory] = useState<TelemetryPoint[]>(() => {
    return Array.from({ length: 25 }, (_, i) => ({
      time: i,
      tflops: targetPerGpuTflops + (Math.sin(i) * 6),
      temp: 63 + Math.cos(i * 0.8) * 3,
      vram: baselineVram + Math.sin(i * 0.5) * 0.8,
      loss: 2.55 - (i * 0.005)
    }));
  });

  // Live simulation tick interval
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      // Step and tokens advance
      setGlobalStep(s => s + 1);
      setTrainedTokensB(t => {
        const next = t + 0.002;
        return Number(Math.min(config.targetTokensB, next).toFixed(3));
      });

      // Loss decays with stochastic variance
      setCurrentLoss(l => {
        const delta = (Math.random() - 0.52) * 0.004;
        return Number(Math.max(1.15, l + delta).toFixed(4));
      });

      // Update per-GPU telemetry
      setGpuMetrics(prev => {
        return prev.map(gpu => {
          let tempTarget = 62 + (gpu.id % 4) * 2.5;
          let tflopsTarget = targetPerGpuTflops;
          let vramTarget = baselineVram;
          let powerTarget = 640;

          if (thermalStressActive) {
            tempTarget += 17; // Spikes to ~81°C
            powerTarget = 690;
            tflopsTarget *= 0.91; // Thermal throttle
          }

          if (checkpointingActive) {
            tflopsTarget *= 0.35; // IO stall during checkpoint flush
            vramTarget += 3.2; // Extra buffer during state serialize
          }

          const jitter = (Math.random() - 0.5);
          const nextTemp = Math.round((gpu.temp * 0.85 + (tempTarget + jitter * 2) * 0.15) * 10) / 10;
          const nextVram = Number((gpu.vramUsed * 0.9 + (vramTarget + jitter * 0.4) * 0.1).toFixed(1));
          const nextTflops = Number((gpu.tflops * 0.85 + (tflopsTarget + jitter * 12) * 0.15).toFixed(1));
          const nextSm = Math.min(100, Math.max(82, Math.round(95 + jitter * 5)));
          const nextPower = Math.round(powerTarget + jitter * 25);
          const nextFan = Math.min(100, Math.max(60, Math.round(nextTemp * 1.15)));

          return {
            ...gpu,
            temp: nextTemp,
            vramUsed: Math.min(vramMaxGB, nextVram),
            tflops: Math.max(20, nextTflops),
            smUtil: nextSm,
            powerW: nextPower,
            fanSpeedPct: nextFan
          };
        });
      });

      // Update history buffer
      setHistory(prev => {
        const lastTime = prev[prev.length - 1]?.time || 0;
        const avgTflops = gpuMetrics.reduce((sum, g) => sum + g.tflops, 0) / gpuMetrics.length;
        const avgTemp = gpuMetrics.reduce((sum, g) => sum + g.temp, 0) / gpuMetrics.length;
        const avgVram = gpuMetrics.reduce((sum, g) => sum + g.vramUsed, 0) / gpuMetrics.length;

        const nextPoint: TelemetryPoint = {
          time: lastTime + 1,
          tflops: Math.round(avgTflops),
          temp: Number(avgTemp.toFixed(1)),
          vram: Number(avgVram.toFixed(1)),
          loss: currentLoss
        };

        return [...prev.slice(1), nextPoint];
      });
    }, 1100);

    return () => clearInterval(interval);
  }, [isRunning, thermalStressActive, checkpointingActive, targetPerGpuTflops, baselineVram, vramMaxGB, config.targetTokensB, currentLoss, gpuMetrics]);

  // Aggregate cluster telemetry
  const clusterAvgTemp = useMemo(() => {
    return Number((gpuMetrics.reduce((s, g) => s + g.temp, 0) / gpuMetrics.length).toFixed(1));
  }, [gpuMetrics]);

  const clusterTotalVramUsed = useMemo(() => {
    return Number((gpuMetrics.reduce((s, g) => s + g.vramUsed, 0)).toFixed(1));
  }, [gpuMetrics]);

  const clusterLiveTflops = useMemo(() => {
    const avgPerGpu = gpuMetrics.reduce((s, g) => s + g.tflops, 0) / gpuMetrics.length;
    return Math.round(avgPerGpu * (instance.acceleratorCount || 8));
  }, [gpuMetrics, instance.acceleratorCount]);

  const clusterTotalPowerKW = useMemo(() => {
    const totalW = gpuMetrics.reduce((s, g) => s + g.powerW, 0) * (instance.acceleratorCount / gpuMetrics.length);
    return Number((totalW / 1000).toFixed(1));
  }, [gpuMetrics, instance.acceleratorCount]);

  // SVG Chart Scaling
  const chartHeight = 120;
  const chartWidth = 520;
  const minVal = useMemo(() => {
    if (telemetryMetric === 'tflops') return Math.min(...history.map(h => h.tflops)) * 0.95;
    if (telemetryMetric === 'temp') return Math.min(...history.map(h => h.temp)) - 4;
    if (telemetryMetric === 'vram') return Math.min(...history.map(h => h.vram)) * 0.9;
    return Math.min(...history.map(h => h.loss)) * 0.98;
  }, [history, telemetryMetric]);

  const maxVal = useMemo(() => {
    if (telemetryMetric === 'tflops') return Math.max(...history.map(h => h.tflops)) * 1.05;
    if (telemetryMetric === 'temp') return Math.max(...history.map(h => h.temp)) + 4;
    if (telemetryMetric === 'vram') return Math.max(...history.map(h => h.vram)) * 1.1;
    return Math.max(...history.map(h => h.loss)) * 1.02;
  }, [history, telemetryMetric]);

  const sparklinePoints = useMemo(() => {
    const range = Math.max(0.001, maxVal - minVal);
    return history.map((pt, idx) => {
      const x = (idx / (history.length - 1)) * chartWidth;
      const val = pt[telemetryMetric];
      const y = chartHeight - ((val - minVal) / range) * chartHeight;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }, [history, telemetryMetric, minVal, maxVal, chartHeight, chartWidth]);

  const handleResetRun = () => {
    setGlobalStep(100);
    setTrainedTokensB(0.2);
    setCurrentLoss(2.85);
    setThermalStressActive(false);
    setCheckpointingActive(false);
  };

  const handleTriggerCheckpoint = () => {
    setCheckpointingActive(true);
    setTimeout(() => {
      setCheckpointingActive(false);
    }, 3500);
  };

  return (
    <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-6 animate-in fade-in">
      {/* Top Header & Simulation Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              {isRunning && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isRunning ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            </span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
              {isRunning
                ? tr('LIVE TRAINING TELEMETRY', 'ទិន្នន័យតាមដានការបង្វឹកផ្ទាល់')
                : tr('TELEMETRY PAUSED', 'បានផ្អាកទិន្នន័យតាមដាន')}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs font-mono text-slate-400">{instance.accelerator}</span>
          </div>

          <h3 className="text-xl font-bold text-white tracking-tight">
            {tr('GPU Utilization & Real-Time Thermal/Memory Monitor', 'កម្មវិធីតាមដានការប្រើប្រាស់ GPU សីតុណ្ហភាព និងអង្គចងចាំផ្ទាល់')}
          </h3>
          <p className="text-xs text-slate-400">
            {isKm
              ? `ក្លែងធ្វើល្បឿនស្នូល Tensor ផ្ទាល់ កម្រិត VRAM និងប្រព័ន្ធត្រជាក់រាវសម្រាប់ការបង្វឹក Khmer LLM ទំហំ ${config.modelParamsB}B។`
              : `Simulating live tensor core throughput, VRAM high-water marks, and liquid cooling thermals for a ${config.modelParamsB}B Khmer LLM pretraining job.`}
          </p>
        </div>

        {/* Master Run Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-semibold transition-colors ${
              isRunning
                ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-sm'
                : 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
            }`}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isRunning ? tr('Pause Sim', 'ផ្អាកការក្លែងធ្វើ') : tr('Resume Sim', 'បន្តការក្លែងធ្វើ')}</span>
          </button>

          <button
            onClick={handleTriggerCheckpoint}
            disabled={checkpointingActive}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
              checkpointingActive
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                : 'bg-slate-950 text-slate-300 border-slate-800 hover:text-white hover:border-slate-700'
            }`}
            title={tr('Simulate IO write checkpoint burst to cloud storage', 'ក្លែងធ្វើការសរសេរ IO ចំណុចត្រួតពិនិត្យទៅកាន់ពពក')}
          >
            <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
            <span>{checkpointingActive ? tr('Saving Checkpoint...', 'កំពុងរក្សាទុក...') : tr('Trigger Save', 'រក្សាទុកចំណុច')}</span>
          </button>

          <button
            onClick={() => setThermalStressActive(!thermalStressActive)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
              thermalStressActive
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                : 'bg-slate-950 text-slate-300 border-slate-800 hover:text-white hover:border-slate-700'
            }`}
            title={tr('Test thermal throttling and high-temperature fan response', 'សាកល្បងការកាត់បន្ថយល្បឿនដោយកម្ដៅ និងការឆ្លើយតបរបស់កង្ហារ')}
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>{thermalStressActive ? tr('Stress Active', 'កំពុងសាកល្បងកម្ដៅ') : tr('Thermal Stress', 'សាកល្បងកម្ដៅ')}</span>
          </button>

          <button
            onClick={handleResetRun}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
            title={tr('Reset training telemetry', 'កំណត់ទិន្នន័យតាមដានឡើងវិញ')}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Primary KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 font-mono text-xs">
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-[10px]">
            <span>{tr('CLUSTER TFLOPS', 'TFLOPS ចង្កោម')}</span>
            <Zap className="w-3 h-3 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-amber-400 tabular-nums">
            {clusterLiveTflops.toLocaleString()} <span className="text-xs font-normal text-slate-400">TF</span>
          </div>
          <div className="text-[10px] text-slate-500">
            {Math.round((clusterLiveTflops / (instance.fp16Bf16Tflops * (instance.acceleratorCount / 8))) * 100)}% MFU
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-[10px]">
            <span>{tr('AVG THERMAL', 'សីតុណ្ហភាពមធ្យម')}</span>
            <Thermometer className="w-3 h-3 text-rose-400" />
          </div>
          <div className={`text-lg font-bold tabular-nums ${clusterAvgTemp >= 78 ? 'text-rose-400' : clusterAvgTemp >= 68 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {clusterAvgTemp}°C
          </div>
          <div className="text-[10px] text-slate-500">
            {clusterAvgTemp >= 78 ? tr('Thermal Throttling', 'កំពុងថយល្បឿនដោយកម្ដៅ') : tr('Optimal Cooling', 'ប្រព័ន្ធត្រជាក់ល្អបំផុត')}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-[10px]">
            <span>{tr('TOTAL VRAM ALLOC', 'ការបែងចែក VRAM សរុប')}</span>
            <HardDrive className="w-3 h-3 text-cyan-400" />
          </div>
          <div className="text-lg font-bold text-cyan-400 tabular-nums">
            {clusterTotalVramUsed} <span className="text-xs font-normal text-slate-400">GB</span>
          </div>
          <div className="text-[10px] text-slate-500">
            {Math.round((clusterTotalVramUsed / (vramMaxGB * gpuMetrics.length)) * 100)}% {tr('Capacity', 'សមត្ថភាព')}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-[10px]">
            <span>{tr('GLOBAL STEP', 'ជំហានសកល')}</span>
            <Clock className="w-3 h-3 text-indigo-400" />
          </div>
          <div className="text-lg font-bold text-white tabular-nums">
            #{globalStep.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500">
            ~285ms / {tr('step', 'ជំហាន')}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-slate-500 text-[10px]">
            <span>{tr('TRAINING LOSS', 'កម្រិតកំហុសបង្វឹក (Loss)')}</span>
            <TrendingDown className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-emerald-400 tabular-nums">
            {currentLoss}
          </div>
          <div className="text-[10px] text-slate-500">
            {tr('Tokens:', 'ថូខិន៖')} {trainedTokensB}B / {config.targetTokensB}B
          </div>
        </div>
      </div>

      {/* Live Cluster Accelerator Cards (GPU Matrix) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="uppercase font-semibold text-slate-300 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>
              {isKm
                ? `តារាងឧបករណ៍បង្កើនល្បឿន (បង្ហាញ ${gpuMetrics.length} នៃ ${instance.acceleratorCount} ណូដ)`
                : `Accelerator Matrix (Visualizing ${gpuMetrics.length} of ${instance.acceleratorCount} nodes)`}
            </span>
          </span>
          <span>{tr('Interconnect:', 'ការតភ្ជាប់៖')} <strong className="text-white">{(isKm ? (instance.interconnectKm || instance.interconnect) : instance.interconnect).split('(')[0]}</strong></span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {gpuMetrics.map(gpu => {
            const vramPct = Math.round((gpu.vramUsed / vramMaxGB) * 100);
            const isHot = gpu.temp >= 78;
            const isWarm = gpu.temp >= 68 && gpu.temp < 78;

            return (
              <div
                key={gpu.id}
                className={`p-3.5 rounded-xl border transition-all space-y-3 font-mono text-xs ${
                  isHot
                    ? 'bg-rose-950/20 border-rose-500/60 ring-1 ring-rose-500/20'
                    : 'bg-slate-950/80 border-slate-800'
                }`}
              >
                {/* Node ID & Status Header */}
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>GPU #{gpu.id}</span>
                  </span>

                  <span className={`text-[11px] font-bold ${isHot ? 'text-rose-400' : isWarm ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {gpu.temp}°C
                  </span>
                </div>

                {/* VRAM Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>VRAM:</span>
                    <span className="text-white font-semibold">{gpu.vramUsed} / {vramMaxGB} GB</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${vramPct}%` }}
                      className={`h-full transition-all duration-300 ${
                        vramPct > 90 ? 'bg-amber-400' : 'bg-cyan-400'
                      }`}
                    />
                  </div>
                </div>

                {/* TFLOPS & SM Activity */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80 text-[11px]">
                  <div>
                    <span className="text-[10px] text-slate-500 block">{tr('TENSOR TFLOPS', 'TENSOR TFLOPS')}</span>
                    <span className="text-amber-400 font-bold tabular-nums">{gpu.tflops} TF</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">{tr('SM UTILIZATION', 'ការប្រើប្រាស់ SM')}</span>
                    <span className="text-emerald-400 font-bold tabular-nums">{gpu.smUtil}%</span>
                  </div>
                </div>

                {/* Power & Cooling Telemetry */}
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                  <span>{tr('Power:', 'ថាមពល៖')} <strong className="text-slate-300">{gpu.powerW}W</strong></span>
                  <span>{tr('Fan/Pump:', 'កង្ហារ/បូម៖')} <strong className="text-slate-300">{gpu.fanSpeedPct}%</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Telemetry History Chart */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-mono">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-white uppercase">{tr('Rolling Telemetry Stream (Last 30s)', 'ក្រាហ្វទិន្នន័យតាមដានបន្តបន្ទាប់ (30វិនាទីចុងក្រោយ)')}</span>
          </div>

          {/* Metric Selector Buttons */}
          <div className="flex items-center gap-1 text-[11px] font-mono">
            {[
              { id: 'tflops', label: tr('TFLOPS (Compute)', 'TFLOPS (គណនា)'), color: 'text-amber-400' },
              { id: 'temp', label: tr('Thermal (°C)', 'កម្ដៅ (°C)'), color: 'text-rose-400' },
              { id: 'vram', label: tr('VRAM Usage (GB)', 'ការប្រើ VRAM (GB)'), color: 'text-cyan-400' },
              { id: 'loss', label: tr('Training Loss', 'កំហុសបង្វឹក'), color: 'text-emerald-400' }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setTelemetryMetric(m.id as 'tflops' | 'temp' | 'vram' | 'loss')}
                className={`px-2.5 py-1 rounded-md border transition-colors ${
                  telemetryMetric === m.id
                    ? 'bg-slate-800 text-white border-slate-600 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* SVG Sparkline Graph */}
        <div className="relative w-full overflow-hidden bg-slate-900/50 rounded-lg p-2 border border-slate-800/80">
          <div className="flex justify-between text-[10px] font-mono text-slate-500 pb-1">
            <span>{tr('Current:', 'បច្ចុប្បន្ន៖')} <strong className="text-white">
              {telemetryMetric === 'tflops' && `${clusterLiveTflops.toLocaleString()} ${tr('Cluster TFLOPS', 'TFLOPS ចង្កោម')}`}
              {telemetryMetric === 'temp' && `${clusterAvgTemp} °C`}
              {telemetryMetric === 'vram' && `${clusterTotalVramUsed} GB`}
              {telemetryMetric === 'loss' && `${currentLoss} ${tr('Cross-Entropy', 'Cross-Entropy')}`}
            </strong></span>
            <span>{tr('Range:', 'ចន្លោះ៖')} {minVal.toFixed(1)} &mdash; {maxVal.toFixed(1)}</span>
          </div>

          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-28 overflow-visible"
            preserveAspectRatio="none"
          >
            {/* Gridlines */}
            <line x1="0" y1="0" x2={chartWidth} y2="0" stroke="#334155" strokeDasharray="2 4" strokeWidth="0.5" />
            <line x1="0" y1={chartHeight / 2} x2={chartWidth} y2={chartHeight / 2} stroke="#334155" strokeDasharray="2 4" strokeWidth="0.5" />
            <line x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="#334155" strokeDasharray="2 4" strokeWidth="0.5" />

            {/* Polyline */}
            <polyline
              fill="none"
              stroke={
                telemetryMetric === 'tflops' ? '#fbbf24' :
                telemetryMetric === 'temp' ? '#f43f5e' :
                telemetryMetric === 'vram' ? '#22d3ee' : '#10b981'
              }
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={sparklinePoints}
            />
          </svg>
        </div>
      </div>

      {/* Thermal & Communication Diagnostic Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase block">{tr('INTERCONNECT TRAFFIC', 'ចរាចរណ៍តភ្ជាប់ខាងក្នុង')}</span>
          <div className="text-white font-bold">Ring AllReduce (820 GB/s)</div>
          <div className="text-slate-400 text-[11px]">{tr('86% GEMM Compute · 14% Comm Sync', '86% គណនា GEMM · 14% សមកាលកម្ម')}</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase block">{tr('CLUSTER POWER DRAW', 'ការប្រើប្រាស់ថាមពលចង្កោម')}</span>
          <div className="text-white font-bold">{clusterTotalPowerKW} kW {tr('Total', 'សរុប')}</div>
          <div className="text-slate-400 text-[11px]">{tr('PUE 1.12 · Hydro-electric Datacenter', 'PUE 1.12 · មជ្ឈមណ្ឌលទិន្នន័យវារីអគ្គិសនី')}</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase block">{tr('CHECKPOINT CADENCE', 'ភាពញឹកញាប់នៃការរក្សាទុកចំណុច')}</span>
          <div className="text-white font-bold">{tr('Every 500 Steps (Async)', 'រៀងរាល់ 500 ជំហាន (Async)')}</div>
          <div className="text-slate-400 text-[11px]">{tr('Snapshot Size:', 'ទំហំរក្សាទុក៖')} ~{Math.round(config.modelParamsB * 4)} GB / {tr('save', 'ម្ដង')}</div>
        </div>
      </div>
    </div>
  );
};
