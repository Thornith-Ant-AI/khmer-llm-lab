import React, { useState, useEffect, useMemo } from 'react';
import {
  CLOUD_INSTANCES,
  CLOUD_REGIONS,
  estimateCloudExpenditure
} from '../utils/scalingCalculator';
import { PricingModel, ScalingConfig } from '../types';
import {
  DollarSign,
  Globe,
  Clock,
  Server,
  HardDrive,
  TrendingDown,
  Calculator,
  Layers
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface CloudCostEstimatorProps {
  config: ScalingConfig;
  computedTrainingHours: number;
  onUpdateConfig: (patch: Partial<ScalingConfig>) => void;
  onInvalidInput?: (title: string, message: string) => void;
}

export const CloudCostEstimator: React.FC<CloudCostEstimatorProps> = ({
  config,
  computedTrainingHours,
  onUpdateConfig,
  onInvalidInput
}) => {
  const { isKm, tr } = useLanguage();
  const activeInstance = CLOUD_INSTANCES[config.gpuType] || CLOUD_INSTANCES.gcp_tpu_v4_16;
  const derivedUnits = Math.max(1, Math.round((config.gpuCount || activeInstance.acceleratorCount) / activeInstance.acceleratorCount));

  const [computeUnits, setComputeUnits] = useState<number>(derivedUnits);
  const [durationMode, setDurationMode] = useState<'scaling_sync' | 'custom'>('scaling_sync');
  const [customHours, setCustomHours] = useState<number>(Math.max(1, Math.round(computedTrainingHours)));
  const [checkpointTB, setCheckpointTB] = useState<number>(1.5);
  const [storagePercent, setStoragePercent] = useState<number>(config.storageOverheadPercent ?? 6);

  // Sync computeUnits when parent gpuCount or gpuType changes externally
  useEffect(() => {
    setComputeUnits(Math.max(1, Math.round((config.gpuCount || activeInstance.acceleratorCount) / activeInstance.acceleratorCount)));
  }, [config.gpuCount, activeInstance.acceleratorCount]);

  // Select default region matching provider when instance provider changes
  const defaultRegionForProvider = (provider: string) => {
    if (provider === 'AWS') return 'aws_us_east_1';
    if (provider === 'LambdaLabs') return 'lambda_us_texas';
    return 'gcp_us_central1';
  };

  const [selectedRegionId, setSelectedRegionId] = useState<string>(
    config.regionId || defaultRegionForProvider(activeInstance.provider)
  );

  // Ensure selected region matches active instance provider if provider switches
  useEffect(() => {
    const currentReg = CLOUD_REGIONS[selectedRegionId];
    if (!currentReg || currentReg.provider !== activeInstance.provider) {
      const nextReg = defaultRegionForProvider(activeInstance.provider);
      setSelectedRegionId(nextReg);
      onUpdateConfig({ regionId: nextReg });
    }
  }, [activeInstance.provider]);

  const effectiveHours = durationMode === 'scaling_sync' ? Math.max(0.1, computedTrainingHours) : customHours;
  const pricingModel: PricingModel = config.pricingModel || 'on_demand';

  const handleComputeUnitsChange = (nextUnitsRaw: number) => {
    if (isNaN(nextUnitsRaw) || nextUnitsRaw <= 0) {
      onInvalidInput?.(
        tr('Invalid Compute Units', 'ចំនួនឯកតាគណនាមិនត្រឹមត្រូវ'),
        tr(
          'Compute unit count must be at least 1 node / pod slice.',
          'ចំនួនឯកតាគណនាត្រូវតែមានយ៉ាងតិច 1 ណូដ / ចំណែក Pod។'
        )
      );
      setComputeUnits(1);
      onUpdateConfig({ gpuCount: activeInstance.acceleratorCount, instanceCount: 1 });
      return;
    }
    const clamped = Math.min(64, Math.round(nextUnitsRaw));
    setComputeUnits(clamped);
    onUpdateConfig({
      gpuCount: clamped * activeInstance.acceleratorCount,
      instanceCount: clamped
    });
  };

  const handleCustomHoursChange = (val: number) => {
    if (isNaN(val) || val <= 0) {
      onInvalidInput?.(
        tr('Invalid Training Duration', 'រយៈពេលបង្វឹកមិនត្រឹមត្រូវ'),
        tr(
          'Training duration must be strictly positive (> 0 hours).',
          'រយៈពេលបង្វឹកត្រូវតែធំជាងសូន្យ (> 0 ម៉ោង)។'
        )
      );
      setCustomHours(1);
      return;
    }
    setCustomHours(Math.min(8760, val));
  };

  const estimate = useMemo(() => {
    return estimateCloudExpenditure({
      instanceId: activeInstance.id,
      regionId: selectedRegionId,
      computeUnits,
      durationHours: effectiveHours,
      pricingModel,
      storageOverheadPercent: storagePercent,
      checkpointSizeTB: checkpointTB
    });
  }, [activeInstance.id, selectedRegionId, computeUnits, effectiveHours, pricingModel, storagePercent, checkpointTB]);

  // Cross-region comparison across representative AWS, GCP, and Bare-Metal hubs
  const crossRegionComparison = useMemo(() => {
    const benchmarkPairs = [
      { instanceId: 'gcp_tpu_v4_16', regionId: 'gcp_us_central1', tag: tr('US TPU Baseline', 'មូលដ្ឋាន TPU សហរដ្ឋអាមេរិក') },
      { instanceId: 'gcp_tpu_v4_16', regionId: 'gcp_asia_east1', tag: tr('APAC TPU Hub', 'មជ្ឈមណ្ឌល TPU អាស៊ីប៉ាស៊ីហ្វិក') },
      { instanceId: 'gcp_a3_h100', regionId: 'gcp_asia_southeast1', tag: tr('ASEAN Low Latency', 'ភាពយឺតយ៉ាវទាប ASEAN') },
      { instanceId: 'aws_p5_48xlarge', regionId: 'aws_us_east_1', tag: tr('AWS H100 Base', 'មូលដ្ឋាន AWS H100') },
      { instanceId: 'aws_p5_48xlarge', regionId: 'aws_ap_southeast_1', tag: tr('AWS Singapore', 'AWS សិង្ហបុរី') },
      { instanceId: 'aws_p4de_24xlarge', regionId: 'aws_ap_southeast_1', tag: tr('AWS A100 Singapore', 'AWS A100 សិង្ហបុរី') },
      { instanceId: 'lambda_h100_node', regionId: 'lambda_us_texas', tag: tr('Bare-Metal Value', 'តម្លៃសមរម្យ Bare-Metal') }
    ];

    return benchmarkPairs.map((pair) => {
      const inst = CLOUD_INSTANCES[pair.instanceId];
      // Match total accelerator target as closely as possible
      const matchedUnits = Math.max(1, Math.round(estimate.totalAccelerators / inst.acceleratorCount));
      const proj = estimateCloudExpenditure({
        instanceId: pair.instanceId,
        regionId: pair.regionId,
        computeUnits: matchedUnits,
        durationHours: effectiveHours,
        pricingModel,
        storageOverheadPercent: storagePercent,
        checkpointSizeTB: checkpointTB
      });
      return {
        ...proj,
        tag: pair.tag,
        isCurrent: pair.instanceId === activeInstance.id && pair.regionId === selectedRegionId
      };
    });
  }, [estimate.totalAccelerators, effectiveHours, pricingModel, storagePercent, checkpointTB, activeInstance.id, selectedRegionId, tr]);

  const providerRegions = useMemo(() => {
    return Object.values(CLOUD_REGIONS).filter((r) => r.provider === activeInstance.provider);
  }, [activeInstance.provider]);

  // Proportions for cost composition bar
  const totalSafe = Math.max(1, estimate.totalExpenditureUSD);
  const baseComputePct = (estimate.baseComputeCostUSD / totalSafe) * 100;
  const regionalPremiumPct = (estimate.regionalPremiumUSD / totalSafe) * 100;
  const storageEgressPct = ((estimate.storageCostUSD + estimate.egressCostUSD) / totalSafe) * 100;

  return (
    <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider font-mono">
            <Calculator className="w-3.5 h-3.5" />
            <span>{tr('CLOUD TRAINING EXPENDITURE ESTIMATOR', 'ឧបករណ៍ប៉ាន់ស្មានការចំណាយបង្វឹកលើពពក')}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>{tr('AWS / GCP REGIONAL PRICING', 'តម្លៃតាមតំបន់ AWS / GCP')}</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            {tr('Interactive Cloud Cost & Regional Budget Planner', 'កម្មវិធីរៀបចំផែនការថ្លៃដើមពពក និងថវិកាតាមតំបន់')}
          </h3>
          <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
            {tr(
              'Calculate total training expenditure by pairing your selected compute units and regional cloud pricing tariffs (US baseline vs. Singapore/Taiwan APAC hubs) with either scaling-law duration or a custom runtime budget.',
              'គណនាការចំណាយបង្វឹកសរុបដោយផ្គូផ្គងឯកតាគណនា និងអត្រាតម្លៃពពកតាមតំបន់ (មូលដ្ឋានអាមេរិក ធៀបនឹងសិង្ហបុរី/តៃវ៉ាន់ APAC) ជាមួយនឹងរយៈពេលតាមច្បាប់មាត្រដ្ឋាន ឬថវិកាម៉ោងកំណត់ផ្ទាល់ខ្លួន។'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
            {tr('Active Provider:', 'ក្រុមហ៊ុនកំពុងប្រើ៖')} <strong className="text-amber-400">{activeInstance.provider}</strong>
          </span>
        </div>
      </div>

      {/* Interactive Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Compute Units Control */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-amber-400" />
              <span>{tr('Compute Units', 'ឯកតាគណនា')}</span>
            </span>
            <span className="text-amber-400 font-bold tabular-nums">
              {computeUnits} {tr(computeUnits === 1 ? 'Unit' : 'Units', 'ឯកតា')}
            </span>
          </div>

          <div className="space-y-2">
            <input
              type="range"
              min={1}
              max={16}
              step={1}
              value={computeUnits}
              onChange={(e) => handleComputeUnitsChange(parseInt(e.target.value, 10))}
              className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="grid grid-cols-4 gap-1 font-mono">
              {[1, 2, 4, 8].map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => handleComputeUnitsChange(u)}
                  className={`py-1 rounded text-[11px] transition-colors ${
                    computeUnits === u
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {u}×
                </button>
              ))}
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-900 flex justify-between">
            <span>{tr('Total Chips/GPUs:', 'ឈីប/GPU សរុប៖')}</span>
            <strong className="text-white tabular-nums">{estimate.totalAccelerators}×</strong>
          </div>
        </div>

        {/* 2. Regional Cloud Pricing Control */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>{tr('Cloud Region', 'តំបន់ពពក')}</span>
            </span>
            <span className={`font-bold tabular-nums ${
              estimate.region.priceMultiplier > 1 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {estimate.region.priceMultiplier.toFixed(2)}× {tr('Rate', 'អត្រា')}
            </span>
          </div>

          <select
            aria-label={tr('Select regional cloud pricing zone', 'ជ្រើសរើសតំបន់តម្លៃពពក')}
            value={selectedRegionId}
            onChange={(e) => {
              setSelectedRegionId(e.target.value);
              onUpdateConfig({ regionId: e.target.value });
            }}
            className="w-full py-2 px-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
          >
            {providerRegions.map((reg) => (
              <option key={reg.id} value={reg.id}>
                {reg.code} ({reg.priceMultiplier === 1 ? tr('Base 1.00×', 'មូលដ្ឋាន 1.00×') : `+${Math.round((reg.priceMultiplier - 1) * 100)}%`})
              </option>
            ))}
          </select>

          <p className="text-[11px] text-slate-400 leading-snug">
            {isKm ? (estimate.region.notesKm || estimate.region.notes) : estimate.region.notes}
          </p>
        </div>

        {/* 3. Training Duration Control */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>{tr('Duration', 'រយៈពេល')}</span>
            </span>
            <span className="text-emerald-400 font-bold tabular-nums">
              {estimate.durationHours}{tr('h', 'ម៉')} ({estimate.durationDays}{tr('d', 'ថ្ងៃ')})
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1 p-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono">
            <button
              type="button"
              onClick={() => setDurationMode('scaling_sync')}
              className={`py-1 rounded transition-colors ${
                durationMode === 'scaling_sync'
                  ? 'bg-emerald-400 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tr('Auto Scaling', 'គណនាស្វ័យប្រវត្តិ')}
            </button>
            <button
              type="button"
              onClick={() => {
                setDurationMode('custom');
                setCustomHours(Math.max(1, Math.round(computedTrainingHours)));
              }}
              className={`py-1 rounded transition-colors ${
                durationMode === 'custom'
                  ? 'bg-emerald-400 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tr('Custom Hours', 'ម៉ោងផ្ទាល់ខ្លួន')}
            </button>
          </div>

          {durationMode === 'custom' ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={8760}
                value={customHours}
                onChange={(e) => handleCustomHoursChange(parseFloat(e.target.value))}
                className="w-full py-1.5 px-2.5 text-xs font-mono rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-400"
              />
              <span className="text-[11px] font-mono text-slate-400 shrink-0">{tr('hrs', 'ម៉ោង')}</span>
            </div>
          ) : (
            <div className="text-[11px] text-slate-400 font-mono pt-1">
              {isKm
                ? `គណនាពី ${config.modelParamsB}B ប៉ារ៉ាម៉ែត្រ និង ${config.targetTokensB}B ថូខិន លើ ${computeUnits}× ឯកតា។`
                : `Derived from ${config.modelParamsB}B params & ${config.targetTokensB}B tokens across ${computeUnits}× units.`}
            </div>
          )}
        </div>

        {/* 4. Checkpoint Storage & Egress Overhead */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-violet-400" />
              <span>{tr('Storage & Egress', 'ផ្ទុក និងបញ្ជូនទិន្នន័យ')}</span>
            </span>
            <span className="text-violet-300 font-bold tabular-nums">
              {storagePercent}% · {checkpointTB}TB
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>{tr('S3/GCS Storage Buffer:', 'ទុនបម្រុងផ្ទុក S3/GCS៖')}</span>
              <span>{storagePercent}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={20}
              step={1}
              value={storagePercent}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setStoragePercent(val);
                onUpdateConfig({ storageOverheadPercent: val });
              }}
              className="w-full accent-violet-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-900">
            <span>{tr('Weight Export', 'នាំចេញទម្ងន់ម៉ូដែល')} ({estimate.region.egressPerGBUSD}/GB):</span>
            <select
              value={checkpointTB}
              onChange={(e) => setCheckpointTB(parseFloat(e.target.value))}
              className="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-white text-[11px]"
            >
              <option value={0.5}>0.5 TB</option>
              <option value={1.5}>1.5 TB</option>
              <option value={4.0}>4.0 TB</option>
              <option value={10.0}>10.0 TB</option>
            </select>
          </div>
        </div>
      </div>

      {/* Expenditure Summary + Breakdown Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Total Expenditure Hero Card */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-950 to-amber-950/20 border border-amber-500/30 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-amber-400 font-bold uppercase flex items-center gap-1.5">
                <DollarSign className="w-4 h-4" />
                <span>{tr('PROJECTED TOTAL EXPENDITURE', 'ការចំណាយសរុបប៉ាន់ស្មាន')}</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[10px] uppercase font-bold">
                {pricingModel.replace('_', ' ')}
              </span>
            </div>

            <div className="text-4xl font-extrabold font-mono text-white tabular-nums tracking-tight">
              ${estimate.totalExpenditureUSD.toLocaleString()}
              <span className="text-sm font-normal text-slate-400 ml-1.5">USD</span>
            </div>

            <div className="text-xs font-mono text-slate-400">
              {estimate.computeUnits}× {activeInstance.instanceType} ({estimate.totalAccelerators} {tr('chips', 'ឈីប')}) · {estimate.durationHours} {tr('hrs in', 'ម៉ោងនៅ')} <strong className="text-cyan-300">{estimate.region.code}</strong>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-800/80 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">{tr('Regional Effective Hourly Rate:', 'អត្រាប្រចាំម៉ោងតាមតំបន់៖')}</span>
              <span className="text-white font-bold tabular-nums">${estimate.regionalHourlyClusterUSD.toFixed(2)} {tr('/hr', '/ម៉ោង')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">{tr('Effective Chip Hourly Rate:', 'អត្រាប្រចាំម៉ោងក្នុងមួយឈីប៖')}</span>
              <span className="text-cyan-300 tabular-nums">${estimate.costPerAcceleratorHourUSD.toFixed(2)} {tr('/chip/hr', '/ឈីប/ម៉ោង')}</span>
            </div>
            {estimate.savingsVsOnDemandUSD > 0 && (
              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{tr('Savings vs Regional On-Demand:', 'ប្រាក់សន្សំធៀបនឹង On-Demand តាមតំបន់៖')}</span>
                </span>
                <strong className="tabular-nums">-${estimate.savingsVsOnDemandUSD.toLocaleString()}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Itemized Ledger & Stacked Breakdown Bar */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>{tr('Itemized Training Expenditure Breakdown', 'ការបំបែកលម្អិតនៃការចំណាយបង្វឹក')}</span>
            </h4>
            <span className="text-[11px] font-mono text-slate-400">
              {isKm ? (estimate.region.nameKm || estimate.region.name) : estimate.region.name}
            </span>
          </div>

          {/* Visual Stacked Cost Composition Bar */}
          <div className="space-y-1.5">
            <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${baseComputePct}%` }}
                className="bg-cyan-400 h-full transition-all duration-300"
                title={`${tr('Base Accelerator Compute', 'ការគណនាមូលដ្ឋាន')}: $${estimate.baseComputeCostUSD.toLocaleString()}`}
              />
              <div
                style={{ width: `${regionalPremiumPct}%` }}
                className="bg-amber-400 h-full transition-all duration-300"
                title={`${tr('Regional Pricing Uplift', 'អត្រាបន្ថែមតាមតំបន់')}: $${estimate.regionalPremiumUSD.toLocaleString()}`}
              />
              <div
                style={{ width: `${storageEgressPct}%` }}
                className="bg-violet-400 h-full transition-all duration-300"
                title={`${tr('Storage & Egress', 'ផ្ទុក និងបញ្ជូនទិន្នន័យ')}: $${(estimate.storageCostUSD + estimate.egressCostUSD).toLocaleString()}`}
              />
            </div>
            <div className="flex flex-wrap gap-4 text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400" />
                {tr('Base Compute', 'ការគណនាមូលដ្ឋាន')} ({Math.round(baseComputePct)}%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
                {tr('Regional Tariff', 'ពន្ធតាមតំបន់')} ({Math.round(regionalPremiumPct)}%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-violet-400" />
                {tr('Storage & Egress', 'ផ្ទុក និងបញ្ជូនទិន្នន័យ')} ({Math.round(storageEgressPct)}%)
              </span>
            </div>
          </div>

          {/* Line Items */}
          <div className="divide-y divide-slate-900 text-xs font-mono">
            <div className="py-2.5 flex items-center justify-between">
              <div>
                <span className="text-slate-200 font-semibold">
                  {isKm
                    ? `1. ការគណនាចង្កោមដើម (${computeUnits}× ឯកតា × ${effectiveHours.toFixed(1)}ម៉)`
                    : `1. Raw Cluster Compute (${computeUnits}× units × ${effectiveHours.toFixed(1)}h)`}
                </span>
                <span className="block text-[10px] text-slate-500 font-sans">
                  {isKm
                    ? `អត្រាមូលដ្ឋានអាមេរិក ($${estimate.baseHourlyPerUnitUSD.toFixed(2)}/ឯកតា/ម៉ោង) ក្រោមកម្រិត ${pricingModel.replace('_', ' ')}`
                    : `US baseline rate ($${estimate.baseHourlyPerUnitUSD.toFixed(2)}/unit/hr) under ${pricingModel.replace('_', ' ')} tier`}
                </span>
              </div>
              <span className="text-cyan-300 font-bold tabular-nums">${estimate.baseComputeCostUSD.toLocaleString()}</span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <div>
                <span className="text-slate-200 font-semibold">
                  {tr('2. Regional Cloud Multiplier', '2. មេគុណពពកតាមតំបន់')} ({estimate.region.code})
                </span>
                <span className="block text-[10px] text-slate-500 font-sans">
                  {estimate.region.priceMultiplier === 1
                    ? tr('Baseline US datacenter pricing (0% uplift)', 'តម្លៃមជ្ឈមណ្ឌលទិន្នន័យអាមេរិកមូលដ្ឋាន (បន្ថែម 0%)')
                    : isKm
                    ? `+${Math.round((estimate.region.priceMultiplier - 1) * 100)}% តម្លៃបន្ថែមមជ្ឈមណ្ឌលទិន្នន័យតាមតំបន់`
                    : `+${Math.round((estimate.region.priceMultiplier - 1) * 100)}% regional datacenter tariff`}
                </span>
              </div>
              <span className="text-amber-300 font-bold tabular-nums">+${estimate.regionalPremiumUSD.toLocaleString()}</span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <div>
                <span className="text-slate-200 font-semibold">
                  {isKm
                    ? `3. ការផ្ទុកចំណុចត្រួតពិនិត្យចែកចាយ (${storagePercent}% បន្ថែម)`
                    : `3. Distributed Checkpoint Storage (${storagePercent}% overhead)`}
                </span>
                <span className="block text-[10px] text-slate-500 font-sans">
                  {tr(
                    'High-IOPS GCS / S3 Express buckets for FSDP optimizer shards & recovery states',
                    'កញ្ចប់ GCS / S3 Express IOPS ខ្ពស់សម្រាប់បំណែក FSDP optimizer និងស្ថានភាពសង្គ្រោះ'
                  )}
                </span>
              </div>
              <span className="text-violet-300 font-bold tabular-nums">+${estimate.storageCostUSD.toLocaleString()}</span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <div>
                <span className="text-slate-200 font-semibold">
                  {tr('4. Checkpoint & Weights Egress', '4. ការនាំចេញចំណុចត្រួតពិនិត្យ និងទម្ងន់')} ({checkpointTB} TB)
                </span>
                <span className="block text-[10px] text-slate-500 font-sans">
                  {isKm
                    ? `នាំចេញទម្ងន់ safetensors ចុងក្រោយចេញពី ${estimate.region.code} ($${estimate.region.egressPerGBUSD}/GB)`
                    : `Exporting final safetensors weights out of ${estimate.region.code} ($${estimate.region.egressPerGBUSD}/GB)`}
                </span>
              </div>
              <span className="text-violet-300 font-bold tabular-nums">+${estimate.egressCostUSD.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cross-Region & Cross-Provider Snapshot Table */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
            <Globe className="w-4 h-4 text-amber-400" />
            <span>
              {isKm
                ? `ការប្រៀបធៀបតម្លៃពពកតាមតំបន់ (សមមូល ${estimate.totalAccelerators}× ឈីប · ${estimate.durationHours}ម៉)`
                : `Regional Cloud Pricing Comparison (${estimate.totalAccelerators}× Chip Equivalent · ${estimate.durationHours}h)`}
            </span>
          </h4>
          <span className="text-[11px] font-mono text-slate-400">
            {tr('Click any row to switch active provider & region', 'ចុចលើជួរដេកណាមួយដើម្បីប្ដូរក្រុមហ៊ុន និងតំបន់')}
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4">{tr('Provider & Region', 'ក្រុមហ៊ុន និងតំបន់')}</th>
                <th className="py-2.5 px-4">{tr('Instance Profile', 'ទម្រង់ម៉ាស៊ីន')}</th>
                <th className="py-2.5 px-4">{tr('Regional Uplift', 'អត្រាបន្ថែមតាមតំបន់')}</th>
                <th className="py-2.5 px-4">{tr('Cluster Rate', 'អត្រាចង្កោម')}</th>
                <th className="py-2.5 px-4">{tr('Storage & Egress', 'ផ្ទុក និងបញ្ជូន')}</th>
                <th className="py-2.5 px-4 text-amber-400 font-bold">{tr('Total Expenditure', 'ការចំណាយសរុប')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {crossRegionComparison.map((row) => (
                <tr
                  key={`${row.instance.id}-${row.region.id}`}
                  onClick={() => {
                    onUpdateConfig({
                      gpuType: row.instance.id,
                      gpuCount: row.totalAccelerators,
                      instanceCount: row.computeUnits,
                      regionId: row.region.id
                    });
                    setSelectedRegionId(row.region.id);
                    setComputeUnits(row.computeUnits);
                  }}
                  className={`cursor-pointer transition-colors ${
                    row.isCurrent
                      ? 'bg-amber-400/10 text-white font-semibold'
                      : 'hover:bg-slate-900/60 text-slate-300'
                  }`}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        row.instance.provider === 'GCP'
                          ? 'bg-cyan-400'
                          : row.instance.provider === 'AWS'
                          ? 'bg-amber-400'
                          : 'bg-violet-400'
                      }`} />
                      <span className="text-white font-semibold">{isKm ? (row.region.nameKm || row.region.name) : row.region.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-sans ml-4">{row.tag}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div>{row.instance.instanceType}</div>
                    <div className="text-[10px] text-slate-500">{row.computeUnits}× {tr('units', 'ឯកតា')} ({row.totalAccelerators} {tr('chips', 'ឈីប')})</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                      row.region.priceMultiplier === 1
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                        : 'bg-amber-950 text-amber-300 border border-amber-800/60'
                    }`}>
                      {row.region.priceMultiplier === 1 ? tr('1.00× Base', '1.00× មូលដ្ឋាន') : `+${Math.round((row.region.priceMultiplier - 1) * 100)}%`}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300 tabular-nums">
                    ${row.regionalHourlyClusterUSD.toFixed(2)}{tr('/hr', '/ម៉')}
                  </td>
                  <td className="py-3 px-4 text-slate-400 tabular-nums">
                    ${(row.storageCostUSD + row.egressCostUSD).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-amber-300 font-bold tabular-nums">
                    ${row.totalExpenditureUSD.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
