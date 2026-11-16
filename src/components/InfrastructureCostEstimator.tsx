import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  Calculator,
  DollarSign,
  Clock,
  Server,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { CLOUD_INSTANCES } from '../utils/scalingCalculator';
import { PricingModel } from '../types';

export type GpuClusterTierId =
  | 'h100_lambda'
  | 'h100_gcp_a3'
  | 'h100_aws_p5'
  | 'a100_80gb_aws'
  | 'a100_40gb_aws';

interface GpuClusterTierSpec {
  id: GpuClusterTierId;
  instanceId: string;
  gpuFamily: 'H100' | 'A100';
  label: string;
  labelKm: string;
  shortLabel: string;
  vramPerGpuGB: number;
  relativeTflopsPerGpu: number; // relative to A100 40GB = 1.0 (FP16/BF16 Tensor Core)
  defaultMfu: number;
}

const GPU_TIER_SPECS: Record<GpuClusterTierId, GpuClusterTierSpec> = {
  h100_lambda: {
    id: 'h100_lambda',
    instanceId: 'lambda_h100_node',
    gpuFamily: 'H100',
    label: 'NVIDIA H100 SXM5 80GB (Lambda Bare-Metal)',
    labelKm: 'NVIDIA H100 SXM5 80GB (Lambda Bare-Metal)',
    shortLabel: 'H100 80GB · Lambda',
    vramPerGpuGB: 80,
    relativeTflopsPerGpu: 3.17,
    defaultMfu: 0.44
  },
  h100_gcp_a3: {
    id: 'h100_gcp_a3',
    instanceId: 'gcp_a3_h100',
    gpuFamily: 'H100',
    label: 'NVIDIA H100 SXM5 80GB (GCP A3 High)',
    labelKm: 'NVIDIA H100 SXM5 80GB (GCP A3 High)',
    shortLabel: 'H100 80GB · GCP A3',
    vramPerGpuGB: 80,
    relativeTflopsPerGpu: 3.17,
    defaultMfu: 0.44
  },
  h100_aws_p5: {
    id: 'h100_aws_p5',
    instanceId: 'aws_p5_48xlarge',
    gpuFamily: 'H100',
    label: 'NVIDIA H100 SXM5 80GB (AWS p5.48xlarge)',
    labelKm: 'NVIDIA H100 SXM5 80GB (AWS p5.48xlarge)',
    shortLabel: 'H100 80GB · AWS p5',
    vramPerGpuGB: 80,
    relativeTflopsPerGpu: 3.17,
    defaultMfu: 0.43
  },
  a100_80gb_aws: {
    id: 'a100_80gb_aws',
    instanceId: 'aws_p4de_24xlarge',
    gpuFamily: 'A100',
    label: 'NVIDIA A100 SXM4 80GB (AWS p4de.24xlarge)',
    labelKm: 'NVIDIA A100 SXM4 80GB (AWS p4de.24xlarge)',
    shortLabel: 'A100 80GB · AWS p4de',
    vramPerGpuGB: 80,
    relativeTflopsPerGpu: 1.0,
    defaultMfu: 0.36
  },
  a100_40gb_aws: {
    id: 'a100_40gb_aws',
    instanceId: 'aws_p4d_24xlarge',
    gpuFamily: 'A100',
    label: 'NVIDIA A100 40GB (AWS p4d.24xlarge)',
    labelKm: 'NVIDIA A100 40GB (AWS p4d.24xlarge)',
    shortLabel: 'A100 40GB · AWS p4d',
    vramPerGpuGB: 40,
    relativeTflopsPerGpu: 1.0,
    defaultMfu: 0.34
  }
};

const CLUSTER_SIZES = [8, 16, 32, 64, 128] as const;

export interface InfrastructureCostEstimatorProps {
  estimatedTrainingHours: number;
  activeGpuCount: number;
  activeGpuType: string;
  pricingModel: PricingModel;
  storageOverheadPercent: number;
  modelParamsB: number;
  targetTokensB: number;
  onApplyCluster: (gpuType: string, gpuCount: number, mfu: number) => void;
}

export const InfrastructureCostEstimator: React.FC<InfrastructureCostEstimatorProps> = ({
  estimatedTrainingHours,
  activeGpuCount,
  activeGpuType,
  pricingModel,
  storageOverheadPercent,
  modelParamsB,
  targetTokensB,
  onApplyCluster
}) => {
  const { isKm, tr } = useLanguage();
  const [selectedTier, setSelectedTier] = useState<GpuClusterTierId>('h100_gcp_a3');
  const [hoursBasis, setHoursBasis] = useState<'fixed_hours' | 'throughput_scaled'>('fixed_hours');
  const [customHoursOverride, setCustomHoursOverride] = useState<number | null>(null);
  const [localPricing, setLocalPricing] = useState<PricingModel>(pricingModel);

  const effectiveHours = Math.max(
    1,
    customHoursOverride !== null ? customHoursOverride : Math.round(estimatedTrainingHours * 10) / 10
  );

  const getTierHourlyRatePerNode = (tier: GpuClusterTierSpec, tierPricing: PricingModel): number => {
    const inst = CLOUD_INSTANCES[tier.instanceId] || CLOUD_INSTANCES.gcp_a3_h100;
    if (tierPricing === 'spot') return inst.spotHourlyUSD;
    if (tierPricing === 'reserved_1yr') return inst.reserved1yrHourlyUSD;
    return inst.onDemandHourlyUSD;
  };

  const clusterRows = useMemo(() => {
    const activeTier = GPU_TIER_SPECS[selectedTier];
    const inst = CLOUD_INSTANCES[activeTier.instanceId] || CLOUD_INSTANCES.gcp_a3_h100;
    const nodeHourlyUSD = getTierHourlyRatePerNode(activeTier, localPricing);
    const gpusPerNode = inst.acceleratorCount; // 8 GPUs per node for H100/A100
    const overheadMult = 1 + (storageOverheadPercent || 6) / 100;

    return CLUSTER_SIZES.map((gpuCount) => {
      const nodeCount = Math.max(1, Math.round(gpuCount / gpusPerNode));
      const hourlyClusterUSD = Number((nodeHourlyUSD * nodeCount).toFixed(2));

      // In fixed_hours mode, multiply directly by estimated training hours (e.g. fixed reservation window).
      // In throughput_scaled mode, scale the active cluster's hours inversely with GPU count (with mild multi-node comm tax).
      const commEfficiency = gpuCount >= 128 ? 0.91 : gpuCount >= 64 ? 0.95 : 1.0;
      const baseNormalizedHours =
        hoursBasis === 'fixed_hours'
          ? effectiveHours
          : Math.max(
              0.5,
              Number(
                ((effectiveHours * Math.max(1, activeGpuCount)) / (gpuCount * commEfficiency)).toFixed(1)
              )
            );

      const computeBudgetUSD = Math.round(hourlyClusterUSD * baseNormalizedHours);
      const totalBudgetUSD = Math.round(computeBudgetUSD * overheadMult);
      const storageBufferUSD = Math.max(0, totalBudgetUSD - computeBudgetUSD);

      // Side-by-side H100 vs A100 reference for this cluster size at fixed/scaled hours
      const a100RatePerNode = getTierHourlyRatePerNode(GPU_TIER_SPECS.a100_80gb_aws, localPricing);
      const a100HourlyUSD = Number((a100RatePerNode * nodeCount).toFixed(2));
      const a100TotalBudgetUSD = Math.round(a100HourlyUSD * baseNormalizedHours * overheadMult);

      const h100GcpRatePerNode = getTierHourlyRatePerNode(GPU_TIER_SPECS.h100_gcp_a3, localPricing);
      const h100HourlyUSD = Number((h100GcpRatePerNode * nodeCount).toFixed(2));
      const h100TotalBudgetUSD = Math.round(h100HourlyUSD * baseNormalizedHours * overheadMult);

      return {
        gpuCount,
        sizeLabel: `${gpuCount}× GPUs (${nodeCount} ${nodeCount === 1 ? tr('node', 'ណូដ') : tr('nodes', 'ណូដ')})`,
        shortSize: `${gpuCount}×`,
        nodeCount,
        totalVramGB: gpuCount * activeTier.vramPerGpuGB,
        hourlyClusterUSD,
        hoursUsed: baseNormalizedHours,
        daysUsed: Number((baseNormalizedHours / 24).toFixed(1)),
        computeBudgetUSD,
        storageBufferUSD,
        totalBudgetUSD,
        h100HourlyUSD,
        h100TotalBudgetUSD,
        a100HourlyUSD,
        a100TotalBudgetUSD,
        isCurrentCluster: activeGpuType === activeTier.instanceId && activeGpuCount === gpuCount
      };
    });
  }, [
    selectedTier,
    localPricing,
    storageOverheadPercent,
    hoursBasis,
    effectiveHours,
    activeGpuCount,
    activeGpuType,
    tr
  ]);

  const activeTierMeta = GPU_TIER_SPECS[selectedTier];
  const minCluster = clusterRows[0];
  const maxCluster = clusterRows[clusterRows.length - 1];
  const midCluster = clusterRows[1]; // 16x GPUs default reference

  return (
    <section
      aria-labelledby="infra-cost-estimator-heading"
      className="p-5 sm:p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div
            className={`inline-flex items-center gap-2 text-xs font-semibold text-amber-400 tracking-wider ${
              isKm ? 'font-khmer' : 'font-mono uppercase'
            }`}
          >
            <Calculator className="w-3.5 h-3.5 shrink-0" />
            <span>{tr('INFRASTRUCTURE COST ESTIMATOR', 'កម្មវិធីប៉ាន់ស្មានថ្លៃដើមហេដ្ឋារចនាសម្ព័ន្ធ')}</span>
            <span aria-hidden="true" className="text-slate-600">
              ·
            </span>
            <span className="tabular-nums">
              {modelParamsB}B / {targetTokensB}B · {effectiveHours}h {tr('est. training', 'ម៉ោងបង្វឹក')}
            </span>
          </div>
          <h3
            id="infra-cost-estimator-heading"
            className={`text-lg sm:text-xl font-bold text-white tracking-tight ${isKm ? 'font-khmer' : ''}`}
          >
            {tr(
              'H100 & A100 Cloud Cluster Budget Matrix (8× to 128× GPUs)',
              'តារាងថវិកាចង្កោមពពក H100 និង A100 (៨× ដល់ ១២៨× GPUs)'
            )}
          </h3>
          <p className={`text-xs text-slate-300 max-w-3xl leading-relaxed ${isKm ? 'font-khmer' : ''}`}>
            {tr(
              'Calculates hourly cluster burn rates and total pretraining budget across 8×, 16×, 32×, 64×, and 128× NVIDIA H100/A100 cloud topologies using your estimated training hours.',
              'គណនាអត្រាចំណាយប្រចាំម៉ោង និងថវិកាសរុបលើចង្កោម NVIDIA H100/A100 ទំហំ 8×, 16×, 32×, 64× និង 128× GPUs ដោយផ្អែកលើរយៈពេលបង្វឹកដែលបានប៉ាន់ស្មាន។'
            )}
          </p>
        </div>

        {/* Hours Basis & Pricing Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono">
            <button
              type="button"
              onClick={() => setHoursBasis('fixed_hours')}
              className={`px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                hoursBasis === 'fixed_hours'
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tr(`Fixed ${effectiveHours}h Window`, `ថេរ ${effectiveHours} ម៉ោង`)}
            </button>
            <button
              type="button"
              onClick={() => setHoursBasis('throughput_scaled')}
              className={`px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                hoursBasis === 'throughput_scaled'
                  ? 'bg-cyan-400 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tr('GPU-Scaled Duration', 'ប្តូរម៉ោងតាម GPU')}
            </button>
          </div>
        </div>
      </div>

      {/* Configuration Row: GPU Cloud Tier, Pricing Tier, Custom Hours Override */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl border border-slate-800 bg-slate-950/60">
        <label className="space-y-1.5 text-xs block">
          <span className={`font-semibold text-slate-300 flex items-center gap-1.5 ${isKm ? 'font-khmer' : ''}`}>
            <Server className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>{tr('H100 / A100 Cloud Cluster Profile:', 'ប្រភេទចង្កោម H100 / A100៖')}</span>
          </span>
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value as GpuClusterTierId)}
            className="w-full py-2 px-3 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
          >
            {(Object.keys(GPU_TIER_SPECS) as GpuClusterTierId[]).map((id) => (
              <option key={id} value={id}>
                {isKm ? GPU_TIER_SPECS[id].labelKm : GPU_TIER_SPECS[id].label}
              </option>
            ))}
          </select>
        </label>

        <div className="space-y-1.5 text-xs">
          <span className={`font-semibold text-slate-300 flex items-center gap-1.5 ${isKm ? 'font-khmer' : ''}`}>
            <DollarSign className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{tr('Commitment Pricing Tier:', 'កម្រិតតម្លៃបង់ប្រាក់៖')}</span>
          </span>
          <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-slate-900 border border-slate-800">
            {(
              [
                { id: 'on_demand', label: tr('On-Demand', 'តាមតម្រូវការ') },
                { id: 'spot', label: 'Spot' },
                { id: 'reserved_1yr', label: tr('1-Yr CUD', 'កក់ 1 ឆ្នាំ') }
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setLocalPricing(opt.id)}
                className={`py-1.5 px-2 rounded text-[11px] font-mono transition-colors whitespace-nowrap ${
                  localPricing === opt.id
                    ? 'bg-emerald-400 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className={`font-semibold text-slate-300 flex items-center gap-1.5 ${isKm ? 'font-khmer' : ''}`}>
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{tr('Baseline Training Hours:', 'រយៈពេលបង្វឹកមូលដ្ឋាន (ម៉ោង)៖')}</span>
            </span>
            {customHoursOverride !== null && (
              <button
                type="button"
                onClick={() => setCustomHoursOverride(null)}
                className="text-[10px] font-mono text-cyan-400 hover:underline"
              >
                {tr('Sync Calculator', 'ធ្វើសមកាលកម្ម')} ({Math.round(estimatedTrainingHours * 10) / 10}h)
              </button>
            )}
          </div>
          <input
            type="number"
            min="1"
            max="8760"
            step="1"
            value={effectiveHours}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setCustomHoursOverride(Number.isFinite(v) && v > 0 ? Math.min(8760, v) : 1);
            }}
            aria-label={tr('Estimated training hours baseline', 'រយៈពេលបង្វឹកមូលដ្ឋាន')}
            className="w-full py-2 px-3 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono tabular-nums focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* 3 Headline Budget Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-1">
          <div className="text-[11px] font-mono text-slate-400 uppercase">
            {tr('16× GPU HOURLY BURN RATE', 'អត្រាចំណាយប្រចាំម៉ោង (១៦× GPU)')}
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-300 tabular-nums">
            ${midCluster.hourlyClusterUSD.toFixed(2)}
            <span className="text-xs font-normal text-slate-400"> /hr</span>
          </div>
          <div className={`text-[11px] text-slate-400 ${isKm ? 'font-khmer' : 'font-mono'}`}>
            {activeTierMeta.shortLabel} · {midCluster.totalVramGB.toLocaleString()} GB VRAM
          </div>
        </div>

        <div className="p-4 rounded-xl border border-amber-500/30 bg-slate-950/70 space-y-1">
          <div className="text-[11px] font-mono text-amber-400 uppercase">
            {tr('16× CLUSTER TOTAL BUDGET', 'ថវិកាសរុបសម្រាប់ចង្កោម ១៦× GPU')}
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300 tabular-nums">
            ${midCluster.totalBudgetUSD.toLocaleString()}
          </div>
          <div className={`text-[11px] text-slate-400 tabular-nums ${isKm ? 'font-khmer' : 'font-mono'}`}>
            {midCluster.hoursUsed}h ({midCluster.daysUsed}d) · +{storageOverheadPercent}% {tr('storage', 'ផ្ទុកទិន្នន័យ')}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-1">
          <div className="text-[11px] font-mono text-slate-400 uppercase">
            {tr('CLUSTER SCALE SPREAD (8× – 128×)', 'ចន្លោះថវិកាតាមទំហំ (៨× – ១២៨×)')}
          </div>
          <div className="text-xl font-bold font-mono text-emerald-300 tabular-nums">
            ${minCluster.hourlyClusterUSD.toFixed(0)}–${maxCluster.hourlyClusterUSD.toFixed(0)}/hr
          </div>
          <div className="text-[11px] font-mono text-slate-400 tabular-nums">
            ${minCluster.totalBudgetUSD.toLocaleString()} → ${maxCluster.totalBudgetUSD.toLocaleString()} {tr('total', 'សរុប')}
          </div>
        </div>
      </div>

      {/* H100 vs A100 Cluster Size Chart */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className={`font-bold text-white flex items-center gap-2 ${isKm ? 'font-khmer' : 'font-mono uppercase'}`}>
            <Layers className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              {tr(
                'Total Budget Comparison: H100 SXM5 (GCP A3) vs A100 80GB (AWS p4de) Across Cluster Sizes',
                'ប្រៀបធៀបថវិកាសរុប៖ H100 SXM5 (GCP A3) ធៀបនឹង A100 80GB (AWS p4de) តាមទំហំចង្កោម'
              )}
            </span>
          </span>
          <span className="text-[11px] font-mono text-slate-400 tabular-nums">
            {hoursBasis === 'fixed_hours'
              ? `${effectiveHours}h ${tr('fixed window', 'ថេរ')}`
              : tr('scaled by cluster GPUs', 'ប្តូរម៉ោងតាមចំនួន GPU')}
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={clusterRows} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="shortSize" stroke="#94a3b8" tick={{ fill: '#e2e8f0', fontSize: 11, fontFamily: 'monospace' }} />
              <YAxis
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                tickFormatter={(val) => `$${Number(val) >= 1000 ? `${(Number(val) / 1000).toFixed(0)}k` : val}`}
              />
              <Tooltip
                cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
                contentStyle={{
                  backgroundColor: '#020617',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  color: '#f8fafc'
                }}
                formatter={(value, name) => [`$${Number(value ?? 0).toLocaleString()}`, String(name)]}
              />
              <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
              <Bar dataKey="h100TotalBudgetUSD" name="H100 80GB (GCP A3)" fill="#fbbf24" radius={[4, 4, 0, 0]} />
              <Bar dataKey="a100TotalBudgetUSD" name="A100 80GB (AWS p4de)" fill="#38bdf8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cluster Size Breakdown Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/70">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/60 text-[11px] font-mono text-slate-400 uppercase">
              <th className="py-3 px-4">{tr('Cluster Size', 'ទំហំចង្កោម')}</th>
              <th className="py-3 px-3 text-right">{tr('Total VRAM', 'VRAM សរុប')}</th>
              <th className="py-3 px-3 text-right">{tr('Hourly Rate', 'ថ្លៃប្រចាំម៉ោង')}</th>
              <th className="py-3 px-3 text-right">{tr('Est. Hours', 'រយៈពេល (ម៉ោង)')}</th>
              <th className="py-3 px-3 text-right">{tr('Compute Subtotal', 'ថ្លៃគណនា')}</th>
              <th className="py-3 px-3 text-right">{tr('Total Budget', 'ថវិកាសរុប')}</th>
              <th className="py-3 px-4 text-right">{tr('Apply', 'ប្រើប្រាស់')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70 font-mono tabular-nums">
            {clusterRows.map((row) => (
              <tr
                key={row.gpuCount}
                className={
                  row.isCurrentCluster
                    ? 'bg-amber-400/10 text-white'
                    : 'text-slate-300 hover:bg-slate-900/40'
                }
              >
                <td className="py-3 px-4 font-bold text-white whitespace-nowrap">{row.sizeLabel}</td>
                <td className="py-3 px-3 text-right text-cyan-300 whitespace-nowrap">
                  {row.totalVramGB.toLocaleString()} GB
                </td>
                <td className="py-3 px-3 text-right text-white font-semibold whitespace-nowrap">
                  ${row.hourlyClusterUSD.toFixed(2)}/hr
                </td>
                <td className="py-3 px-3 text-right text-slate-300 whitespace-nowrap">
                  {row.hoursUsed}h ({row.daysUsed}d)
                </td>
                <td className="py-3 px-3 text-right text-slate-300 whitespace-nowrap">
                  ${row.computeBudgetUSD.toLocaleString()}
                </td>
                <td className="py-3 px-3 text-right text-amber-300 font-bold whitespace-nowrap">
                  ${row.totalBudgetUSD.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() =>
                      onApplyCluster(activeTierMeta.instanceId, row.gpuCount, activeTierMeta.defaultMfu)
                    }
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                      row.isCurrentCluster
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-slate-800 text-slate-200 hover:bg-amber-400 hover:text-slate-950'
                    }`}
                  >
                    <span>{row.isCurrentCluster ? tr('Active', 'កំពុងប្រើ') : tr('Use Cluster', 'ជ្រើសប្រើ')}</span>
                    {!row.isCurrentCluster && <ArrowRight className="w-3 h-3" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
