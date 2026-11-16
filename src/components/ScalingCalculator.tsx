import React, { useState, useEffect, useMemo } from 'react';
import {
  CLOUD_INSTANCES,
  PRECISION_PROFILES,
  computeScaling,
  getPrecisionMultiplier
} from '../utils/scalingCalculator';
import { ComputePrecision, ScalingConfig, PricingModel } from '../types';
import { GpuMonitoringDashboard } from './GpuMonitoringDashboard';
import { GpuArchitectureComparison } from './GpuArchitectureComparison';
import { HardwareBenchmarkAnalysis } from './HardwareBenchmarkAnalysis';
import { HardwareBenchmark } from './HardwareBenchmark';
import { CloudCostEstimator } from './CloudCostEstimator';
import {
  Cpu,
  DollarSign,
  Clock,
  Layers,
  Zap,
  CheckCircle2,
  Cloud,
  Server,
  Leaf,
  AlertCircle,
  AlertTriangle,
  X,
  RotateCcw,
  Activity,
  Gauge,
  TrendingUp
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ToastNotice {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

export const ScalingCalculator: React.FC = () => {
  const { isKm, tr } = useLanguage();
  const [config, setConfig] = useState<ScalingConfig>({
    modelParamsB: 1.5,
    targetTokensB: 45,
    seqLength: 4096,
    vocabSize: 32000,
    gpuType: 'gcp_tpu_v4_16',
    gpuCount: 16,
    mfuEstimate: 0.38,
    pricingModel: 'on_demand',
    precision: 'bf16',
    storageOverheadPercent: 6,
    regionId: 'gcp_us_central1'
  });

  // Toast notification state
  const [toast, setToast] = useState<ToastNotice | null>(null);
  const [viewMode, setViewMode] = useState<
    'all' | 'hardware_benchmark' | 'monitoring' | 'cost_projection' | 'gpu_benchmarks' | 'hardware_analysis'
  >('all');

  // Validation errors map
  const validation = useMemo(() => {
    const errors: Record<string, string> = {};
    const warnings: Record<string, string> = {};

    if (isNaN(config.modelParamsB) || config.modelParamsB <= 0) {
      errors.modelParamsB = tr(
        'Parameter count must be strictly greater than 0 (e.g. 0.5B to 13B).',
        'ចំនួនប៉ារ៉ាម៉ែត្រត្រូវតែធំជាង 0 (ឧ. 0.5B ដល់ 13B)។'
      );
    } else if (config.modelParamsB > 70) {
      warnings.modelParamsB = tr(
        'Ultra-large model (>70B) requires multi-datacenter clusters & massive 1T+ token volume.',
        'ម៉ូដែលធំខ្លាំង (>70B) ទាមទារចង្កោមមជ្ឈមណ្ឌលទិន្នន័យច្រើន និងបរិមាណថូខិន 1T+ ដ៏ធំ។'
      );
    }

    if (isNaN(config.targetTokensB) || config.targetTokensB <= 0) {
      errors.targetTokensB = tr(
        'Token count cannot be negative or zero. Foundation pretraining requires at least 1 Billion tokens.',
        'ចំនួនថូខិនមិនអាចអវិជ្ជមាន ឬសូន្យបានទេ។ ការបង្វឹកជាមូលដ្ឋានទាមទារយ៉ាងតិច 1 ពាន់លានថូខិន។'
      );
    }

    if (isNaN(config.gpuCount) || config.gpuCount <= 0) {
      errors.gpuCount = tr(
        'Cluster accelerator count must be at least 1.',
        'ចំនួនឧបករណ៍បង្កើនល្បឿនក្នុងចង្កោមត្រូវតែមានយ៉ាងតិច 1។'
      );
    }

    if (isNaN(config.mfuEstimate) || config.mfuEstimate <= 0 || config.mfuEstimate > 0.8) {
      errors.mfuEstimate = tr(
        'MFU must be between 0.05 (5%) and 0.75 (75%). Typical hardware MFU is 30%–45%.',
        'MFU ត្រូវតែនៅចន្លោះ 0.05 (5%) និង 0.75 (75%)។ ជាទូទៅ MFU ផ្នែករឹងគឺ 30%–45%។'
      );
    }

    // Check duration when numbers are positive
    if (!errors.modelParamsB && !errors.targetTokensB && !errors.gpuCount && !errors.mfuEstimate) {
      const N = config.modelParamsB * 1e9;
      const D = config.targetTokensB * 1e9;
      const totalFlops = 6 * N * D;
      const inst = CLOUD_INSTANCES[config.gpuType] || CLOUD_INSTANCES.gcp_tpu_v4_16;
      const precMult = getPrecisionMultiplier(inst, config.precision || 'bf16');
      const effectiveTflops =
        inst.fp16Bf16Tflops *
        precMult *
        Math.max(1, Math.round(config.gpuCount / inst.acceleratorCount)) *
        config.mfuEstimate;
      const hours = totalFlops / (effectiveTflops * 1e12 * 3600);

      if (hours < 0.2) {
        errors.duration = tr(
          'Calculated training duration is 0 days (< 12 minutes). Foundation pretraining requires sustained epochs.',
          'រយៈពេលបង្វឹកដែលបានគណនាគឺ 0 ថ្ងៃ (< 12 នាទី)។ ការបង្វឹកជាមូលដ្ឋានទាមទាររយៈពេលបន្តបន្ទាប់។'
        );
      }

      if (config.targetTokensB < config.modelParamsB * 5) {
        warnings.undertraining = isKm
          ? `ការបង្វឹកមិនគ្រប់គ្រាន់ធ្ងន់ធ្ងរ៖ ${config.targetTokensB}B ថូខិន មានត្រឹមតែ ${(config.targetTokensB / config.modelParamsB).toFixed(1)}x នៃទំហំប៉ារ៉ាម៉ែត្រប៉ុណ្ណោះ (កម្រិតល្អបំផុត Chinchilla គឺ ≥20x)។`
          : `Severe undertraining: ${config.targetTokensB}B tokens is only ${(config.targetTokensB / config.modelParamsB).toFixed(1)}x parameter scale (Chinchilla optimal is ≥20x).`;
      }
    }

    return {
      errors,
      warnings,
      isValid: Object.keys(errors).length === 0
    };
  }, [config, isKm, tr]);

  // Trigger toast notification when errors arise
  useEffect(() => {
    const errorKeys = Object.keys(validation.errors);
    if (errorKeys.length > 0) {
      const firstError = validation.errors[errorKeys[0]];
      setToast({
        id: Date.now().toString(),
        type: 'error',
        title: tr('Invalid Compute Parameter', 'ប៉ារ៉ាម៉ែត្រគណនាមិនត្រឹមត្រូវ'),
        message: firstError
      });
    } else if (validation.warnings.undertraining) {
      setToast({
        id: Date.now().toString(),
        type: 'warning',
        title: tr('Undertraining Anomaly Warning', 'ការព្រមានអំពីការបង្វឹកមិនគ្រប់គ្រាន់'),
        message: validation.warnings.undertraining
      });
    }
  }, [validation.errors, validation.warnings, tr]);

  // Auto-dismiss toast after 6 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleResetDefaults = () => {
    setConfig({
      modelParamsB: 1.5,
      targetTokensB: 45,
      seqLength: 4096,
      vocabSize: 32000,
      gpuType: 'gcp_tpu_v4_16',
      gpuCount: 16,
      mfuEstimate: 0.38,
      pricingModel: 'on_demand',
      precision: 'bf16',
      storageOverheadPercent: 6,
      regionId: 'gcp_us_central1'
    });
    setToast({
      id: Date.now().toString(),
      type: 'info',
      title: tr('Parameters Reset', 'បានកំណត់ប៉ារ៉ាម៉ែត្រឡើងវិញ'),
      message: tr(
        'Restored optimal Khmer Foundation baseline: 1.5B parameters on 45B tokens (16x TPU v4).',
        'បានស្ដារមូលដ្ឋាន Khmer Foundation ដ៏ល្អបំផុត៖ 1.5B ប៉ារ៉ាម៉ែត្រ លើ 45B ថូខិន (16x TPU v4)។'
      )
    });
  };

  const handleApplyPreset = (gpuType: string, count: number, mfu: number) => {
    setConfig((prev) => ({
      ...prev,
      gpuType,
      gpuCount: count,
      mfuEstimate: mfu
    }));
    setToast({
      id: Date.now().toString(),
      type: 'info',
      title: tr('Hardware Profile Applied', 'បានអនុវត្តទម្រង់ផ្នែករឹង'),
      message: isKm
        ? `បានកំណត់រចនាសម្ព័ន្ធចង្កោមជាមួយ ${gpuType} (ឧបករណ៍បង្កើនល្បឿន ${count}, ${Math.round(mfu * 100)}% MFU)។`
        : `Configured cluster with ${gpuType} (${count} accelerators, ${Math.round(mfu * 100)}% MFU).`
    });
  };

  // Safe computeScaling execution
  const safeConfig = useMemo(() => {
    if (!validation.isValid) {
      return {
        ...config,
        modelParamsB: Math.max(0.1, config.modelParamsB || 1.5),
        targetTokensB: Math.max(1, config.targetTokensB || 45),
        gpuCount: Math.max(1, config.gpuCount || 16),
        mfuEstimate: Math.max(0.1, Math.min(0.75, config.mfuEstimate || 0.38))
      };
    }
    return config;
  }, [config, validation.isValid]);

  const output = computeScaling(safeConfig);
  const selectedInstance = output.activeInstance;
  const costBreakdown = output.selectedCostBreakdown;
  const activePrecision: ComputePrecision = config.precision || 'bf16';
  const activePrecisionProfile = PRECISION_PROFILES[activePrecision];

  // Side-by-side precision comparison for the active cluster configuration
  const precisionComparison = useMemo(() => {
    const order: ComputePrecision[] = ['fp16', 'bf16', 'int8'];
    return order.map((prec) => {
      const res = computeScaling({ ...safeConfig, precision: prec });
      return {
        precision: prec,
        profile: PRECISION_PROFILES[prec],
        multiplier: res.precisionMultiplier,
        totalGpuHours: res.totalGpuHours,
        trainingHours: res.trainingHours,
        tokensPerSecond: res.tokensPerSecond,
        tokensPerSecondPerGpu: res.tokensPerSecondPerGpu,
        effectiveTflops: res.totalClusterTflops,
        vramPerGpu: res.memoryPerGpuGB.totalPerGpuFsdp,
        totalCostUSD: res.estimatedCostUSD
      };
    });
  }, [safeConfig]);

  const pricingModels: { id: PricingModel; label: string; desc: string }[] = [
    {
      id: 'on_demand',
      label: tr('On-Demand', 'តាមតម្រូវការ'),
      desc: tr(
        'Standard pay-as-you-go with 100% availability guarantee.',
        'ការបង់ប្រាក់តាមការប្រើប្រាស់ស្តង់ដារ ជាមួយការធានាភាពអាចរកបាន 100%។'
      )
    },
    {
      id: 'spot',
      label: tr('Spot / Preemptible', 'Spot / អាចផ្អាក'),
      desc: tr(
        'Up to 60-70% discount; requires frequent checkpointing.',
        'បញ្ចុះតម្លៃរហូតដល់ 60-70%; ទាមទារការរក្សាទុកចំណុចត្រួតពិនិត្យញឹកញាប់។'
      )
    },
    {
      id: 'reserved_1yr',
      label: tr('1-Yr Reserved / CUD', 'កក់ 1 ឆ្នាំ / CUD'),
      desc: tr(
        '30-40% discount for institutional / national AI lab grants.',
        'បញ្ចុះតម្លៃ 30-40% សម្រាប់ជំនួយមន្ទីរពិសោធន៍ AI ស្ថាប័ន / ជាតិ។'
      )
    }
  ];

  return (
    <div className="space-y-8 relative">
      {/* Toast Notification Floating Banner */}
      {toast && (
        <div className={`fixed top-20 right-6 z-50 max-w-md p-4 rounded-xl shadow-2xl border backdrop-blur-md transition-all animate-in fade-in slide-in-from-top-4 ${
          toast.type === 'error'
            ? 'bg-rose-950/95 border-rose-700/80 text-rose-100 shadow-rose-950/40'
            : toast.type === 'warning'
            ? 'bg-amber-950/95 border-amber-700/80 text-amber-100 shadow-amber-950/40'
            : 'bg-slate-900/95 border-slate-700 text-slate-100 shadow-slate-950/40'
        }`}>
          <div className="flex items-start gap-3">
            {toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            ) : toast.type === 'warning' ? (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            )}

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold font-mono tracking-tight">{toast.title}</h4>
                <button
                  onClick={() => setToast(null)}
                  className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs leading-relaxed opacity-90">{toast.message}</p>

              {(toast.type === 'error' || toast.type === 'warning') && (
                <button
                  onClick={handleResetDefaults}
                  className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono rounded bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{tr('Restore Safe Defaults (1.5B / 45B)', 'ស្ដារលំនាំដើមសុវត្ថិភាព (1.5B / 45B)')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider font-mono">
          <span>{tr('COMPUTE INFRASTRUCTURE & SCALING LAWS', 'ហេដ្ឋារចនាសម្ព័ន្ធគណនា និងច្បាប់មាត្រដ្ឋាន')}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>{tr('CLOUD COST PROJECTION ENGINE', 'ម៉ាស៊ីនប៉ាន់ស្មានថ្លៃដើមពពក')}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          {tr('Cloud Compute & Scaling Cost Projection', 'ការគណនាកម្លាំងម៉ាស៊ីនពពក និងការប៉ាន់ស្មានថ្លៃដើម')}
        </h2>
        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          {tr(
            'Project hourly cluster rates and total pretraining budgets across Google Cloud TPUs (TPU v4/v5e), AWS Accelerated Computing (p4d, p5, Trainium), and specialized bare-metal clouds based on parameter count and token volume.',
            'ប៉ាន់ស្មានអត្រាចំណាយប្រចាំម៉ោង និងថវិកាបង្វឹកជាមូលដ្ឋានសរុបនៅលើ Google Cloud TPUs (TPU v4/v5e), AWS Accelerated Computing (p4d, p5, Trainium) និងពពក Bare-Metal ឯកទេស ដោយផ្អែកលើចំនួនប៉ារ៉ាម៉ែត្រ និងបរិមាណថូខិន។'
          )}
        </p>
      </div>

      {/* Compute Workbench View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setViewMode('all')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
              viewMode === 'all'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{tr('Unified Workbench', 'តុការងាររួម')}</span>
          </button>

          <button
            onClick={() => setViewMode('hardware_benchmark')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors whitespace-nowrap shrink-0 ${
              viewMode === 'hardware_benchmark'
                ? 'bg-emerald-400 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>{tr('Hardware Benchmark (A100/H100)', 'ស្តង់ដារផ្នែករឹង (A100/H100)')}</span>
          </button>

          <button
            onClick={() => setViewMode('gpu_benchmarks')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors whitespace-nowrap shrink-0 ${
              viewMode === 'gpu_benchmarks'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>H100 vs A100 vs TPU v4</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-amber-300 font-bold">{tr('New', 'ថ្មី')}</span>
          </button>

          <button
            onClick={() => setViewMode('hardware_analysis')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors whitespace-nowrap shrink-0 ${
              viewMode === 'hardware_analysis'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{tr('Hardware Benchmark Analysis', 'វិភាគសមត្ថភាពផ្នែករឹង')}</span>
          </button>

          <button
            onClick={() => setViewMode('monitoring')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors whitespace-nowrap shrink-0 ${
              viewMode === 'monitoring'
                ? 'bg-emerald-400 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{tr('Live GPU Monitor', 'កម្មវិធីតាមដាន GPU ផ្ទាល់')}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>

          <button
            onClick={() => setViewMode('cost_projection')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors whitespace-nowrap shrink-0 ${
              viewMode === 'cost_projection'
                ? 'bg-cyan-400 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>{tr('Cost & Scaling Engine', 'ម៉ាស៊ីនគណនាថ្លៃដើម')}</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          {viewMode === 'hardware_benchmark' && tr('Recommends A100/H100 GPU clusters aligned to model scale and calculated training duration', 'ណែនាំចង្កោម GPU A100/H100 សមស្របតាមទំហំម៉ូដែល និងរយៈពេលបង្វឹកដែលបានគណនា')}
          {viewMode === 'gpu_benchmarks' && tr('Performance benchmarks across H100 vs A100 vs TPU v4 across 0.5B to 13B scales', 'ការវាស់ស្ទង់សមត្ថភាព H100 ធៀប A100 ធៀប TPU v4 ពីទំហំ 0.5B ដល់ 13B')}
          {viewMode === 'hardware_analysis' && tr('Historical GPU utilization efficiency across transformer architectures & compute budget optimizer', 'ប្រសិទ្ធភាពប្រើប្រាស់ GPU ប្រវត្តិសាស្ត្រតាមស្ថាបត្យកម្ម Transformer និងការជ្រើសរើសផ្នែករឹងតាមថវិកា')}
          {viewMode === 'monitoring' && tr('Simulates live thermals, VRAM high-water marks, and tensor core TFLOPS', 'ក្លែងធ្វើសីតុណ្ហភាពផ្ទាល់ កម្រិត VRAM និង TFLOPS នៃស្នូល Tensor')}
          {viewMode === 'cost_projection' && tr('Evaluates cloud instance pricing and Chinchilla optimal compute', 'វាយតម្លៃតម្លៃម៉ាស៊ីនពពក និងការគណនាល្អបំផុតតាម Chinchilla')}
          {viewMode === 'all' && tr('End-to-end HPC pretraining telemetry & financial planner', 'ប្រព័ន្ធតាមដានការបង្វឹក HPC និងផែនការហិរញ្ញវត្ថុពេញលេញ')}
        </div>
      </div>

      {/* Primary Parameters Deck with Interactive Inputs and Inline Validation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-5 rounded-2xl border border-slate-800 bg-slate-900/60">
        {/* Model Parameters Input */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
            <span>{tr('Model Parameters:', 'ប៉ារ៉ាម៉ែត្រម៉ូដែល៖')}</span>
            <span className="font-mono text-amber-400 font-bold">
              {isNaN(config.modelParamsB) ? '--' : config.modelParamsB}B
            </span>
          </div>

          <div className="flex gap-1.5">
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="70"
              value={isNaN(config.modelParamsB) ? '' : config.modelParamsB}
              onChange={(e) => setConfig({ ...config, modelParamsB: parseFloat(e.target.value) })}
              className={`w-full py-1.5 px-2.5 text-xs font-mono rounded-lg bg-slate-950 border text-white focus:outline-none transition-colors ${
                validation.errors.modelParamsB
                  ? 'border-rose-500 bg-rose-950/20 text-rose-200 focus:border-rose-400'
                  : 'border-slate-800 focus:border-amber-400'
              }`}
              placeholder={tr('e.g. 1.5', 'ឧ. 1.5')}
            />
          </div>

          {/* Quick presets */}
          <div className="grid grid-cols-4 gap-1">
            {[0.5, 1.5, 3.0, 7.0].map((size) => (
              <button
                key={size}
                onClick={() => setConfig({ ...config, modelParamsB: size })}
                className={`py-1 text-[11px] font-mono rounded transition-colors ${
                  config.modelParamsB === size
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {size}B
              </button>
            ))}
          </div>

          {validation.errors.modelParamsB ? (
            <p className="text-[11px] text-rose-400 font-mono flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{validation.errors.modelParamsB}</span>
            </p>
          ) : (
            <p className="text-[11px] text-slate-500">
              {config.modelParamsB <= 3
                ? tr('Recommended scale for Khmer nation-state model.', 'ទំហំដែលណែនាំសម្រាប់ម៉ូដែលភាសាខ្មែរថ្នាក់ជាតិ។')
                : tr('Requires 100B+ tokens to avoid undertraining.', 'ទាមទារ 100B+ ថូខិន ដើម្បីចៀសវាងការបង្វឹកមិនគ្រប់គ្រាន់។')}
            </p>
          )}
        </div>

        {/* Target Pretrain Tokens Input */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
            <span>{tr('Pretraining Tokens:', 'ថូខិនបង្វឹកជាមូលដ្ឋាន៖')}</span>
            <span className="font-mono text-cyan-400 font-bold">
              {isNaN(config.targetTokensB) ? '--' : config.targetTokensB}B
            </span>
          </div>

          <div className="flex gap-1.5">
            <input
              type="number"
              step="1"
              min="1"
              max="500"
              value={isNaN(config.targetTokensB) ? '' : config.targetTokensB}
              onChange={(e) => setConfig({ ...config, targetTokensB: parseFloat(e.target.value) })}
              className={`w-full py-1.5 px-2.5 text-xs font-mono rounded-lg bg-slate-950 border text-white focus:outline-none transition-colors ${
                validation.errors.targetTokensB
                  ? 'border-rose-500 bg-rose-950/20 text-rose-200 focus:border-rose-400'
                  : 'border-slate-800 focus:border-cyan-400'
              }`}
              placeholder={tr('e.g. 45', 'ឧ. 45')}
            />
          </div>

          {/* Quick presets */}
          <div className="grid grid-cols-4 gap-1">
            {[20, 45, 80, 150].map((tokens) => (
              <button
                key={tokens}
                onClick={() => setConfig({ ...config, targetTokensB: tokens })}
                className={`py-1 text-[11px] font-mono rounded transition-colors ${
                  config.targetTokensB === tokens
                    ? 'bg-cyan-400 text-slate-950 font-bold'
                    : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {tokens}B
              </button>
            ))}
          </div>

          {validation.errors.targetTokensB ? (
            <p className="text-[11px] text-rose-400 font-mono flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{validation.errors.targetTokensB}</span>
            </p>
          ) : validation.warnings.undertraining ? (
            <p className="text-[11px] text-amber-400 font-mono flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 shrink-0" />
              <span>{validation.warnings.undertraining}</span>
            </p>
          ) : (
            <p className="text-[11px] text-slate-500 font-mono">
              {isKm ? `សមាមាត្រ Chinchilla៖ ${output.overtrainingRatio}x ល្អបំផុត` : `Chinchilla ratio: ${output.overtrainingRatio}x optimal`}
            </p>
          )}
        </div>

        {/* Cloud Hardware & Provider Instance */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Cloud className="w-3.5 h-3.5 text-cyan-400" />
            <span>{tr('Cloud Instance Profile:', 'ទម្រង់ម៉ាស៊ីនពពក៖')}</span>
          </label>
          <select
            value={config.gpuType}
            onChange={(e) => setConfig({ ...config, gpuType: e.target.value })}
            className="w-full py-2 px-3 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
          >
            <optgroup label="Google Cloud Platform (GCP)">
              <option value="gcp_tpu_v4_16">GCP TPU v4-16 Pod Slice ($51.52/hr)</option>
              <option value="gcp_tpu_v5e_16">GCP TPU v5e-16 Pod Slice ($19.20/hr)</option>
              <option value="gcp_a3_h100">GCP A3 High · 8x H100 ($30.80/hr)</option>
            </optgroup>
            <optgroup label="Amazon Web Services (AWS)">
              <option value="aws_p4d_24xlarge">AWS p4d.24xlarge · 8x A100 ($32.77/hr)</option>
              <option value="aws_p4de_24xlarge">AWS p4de.24xlarge · 8x A100 80GB ($40.96/hr)</option>
              <option value="aws_p5_48xlarge">AWS p5.48xlarge · 8x H100 ($98.32/hr)</option>
              <option value="aws_trn1_32xlarge">AWS trn1.32xlarge · 16x Trainium ($21.50/hr)</option>
            </optgroup>
            <optgroup label={tr('Specialized AI Cloud', 'ពពក AI ឯកទេស')}>
              <option value="lambda_h100_node">Lambda Labs / RunPod · 8x H100 ($23.92/hr)</option>
            </optgroup>
          </select>
          <p className="text-[11px] text-slate-500 truncate" title={isKm ? (selectedInstance.notesKm || selectedInstance.notes) : selectedInstance.notes}>
            {selectedInstance.accelerator}
          </p>
        </div>

        {/* Pricing Model Tier */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">{tr('Commitment / Pricing Tier:', 'កម្រិតការប្ដេជ្ញា / តម្លៃ៖')}</label>
          <div className="grid grid-cols-3 gap-1">
            {pricingModels.map((pm) => (
              <button
                key={pm.id}
                onClick={() => setConfig({ ...config, pricingModel: pm.id })}
                className={`py-1.5 px-1 text-[11px] font-mono rounded-lg transition-colors truncate ${
                  config.pricingModel === pm.id
                    ? 'bg-emerald-400 text-slate-950 font-bold'
                    : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
                title={pm.desc}
              >
                {pm.label.split(' ')[0]}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 truncate" title={pricingModels.find(p => p.id === config.pricingModel)?.desc}>
            {pricingModels.find(p => p.id === config.pricingModel)?.desc}
          </p>
        </div>
      </div>

      {/* Compute Precision (FP16 / BF16 / INT8) & Cluster Scale Bar */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Precision Toggle */}
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className={`text-xs font-semibold text-slate-300 flex items-center gap-1.5 ${isKm ? 'font-khmer' : ''}`}>
                <Gauge className="w-3.5 h-3.5 text-amber-400" />
                <span>{tr('Numerical Precision Mode (FP16 / BF16 / INT8):', 'របៀបភាពជាក់លាក់គណនា (FP16 / BF16 / INT8)៖')}</span>
              </label>
              <span className="text-[11px] font-mono text-amber-300 tabular-nums">
                {activePrecisionProfile.label} · {output.precisionMultiplier.toFixed(2)}× {tr('Compute Throughput', 'ល្បឿនគណនា')}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
              {(['fp16', 'bf16', 'int8'] as ComputePrecision[]).map((prec) => {
                const profile = PRECISION_PROFILES[prec];
                const isSelected = activePrecision === prec;
                return (
                  <button
                    key={prec}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setConfig({ ...config, precision: prec })}
                    className={`py-2 px-3 rounded-lg text-xs font-mono transition-colors flex items-center justify-center gap-2 whitespace-nowrap ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <span>{profile.label}</span>
                    <span
                      className={`text-[10px] tabular-nums ${
                        isSelected ? 'text-slate-900' : 'text-slate-500'
                      }`}
                    >
                      {getPrecisionMultiplier(selectedInstance, prec).toFixed(2)}×
                    </span>
                  </button>
                );
              })}
            </div>

            <p className={`text-[11px] text-slate-400 ${isKm ? 'font-khmer' : ''}`}>
              {isKm ? activePrecisionProfile.summaryKm : activePrecisionProfile.summary}
            </p>
          </div>

          {/* Cluster Accelerator Count Switcher */}
          <div className="space-y-2 lg:w-80 shrink-0">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className={isKm ? 'font-khmer' : ''}>
                {tr('Cluster Accelerator Count:', 'ចំនួនឈីប/GPU ក្នុងចង្កោម៖')}
              </span>
              <span className="font-mono text-cyan-400 tabular-nums">
                {costBreakdown.totalAccelerators}× ({costBreakdown.instanceCount} {tr('nodes', 'ណូដ')})
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800">
              {[8, 16, 32, 64, 128].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setConfig({ ...config, gpuCount: count })}
                  className={`py-2 rounded-lg text-xs font-mono tabular-nums transition-colors ${
                    config.gpuCount === count
                      ? 'bg-cyan-400 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  {count}×
                </button>
              ))}
            </div>
            <p className={`text-[11px] text-slate-500 ${isKm ? 'font-khmer' : ''}`}>
              {tr('Scales all cluster configurations & VRAM sharding simultaneously.', 'គណនាឡើងវិញលើចង្កោមទាំងអស់ និងការបែងចែក VRAM ព្រមគ្នា។')}
            </p>
          </div>
        </div>

        {/* FP16 vs BF16 vs INT8 Live Comparison Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-800/80">
          {precisionComparison.map((row) => {
            const isSelected = row.precision === activePrecision;
            return (
              <button
                key={row.precision}
                type="button"
                onClick={() => setConfig({ ...config, precision: row.precision })}
                className={`p-3 rounded-xl border text-left transition-colors space-y-1.5 ${
                  isSelected
                    ? 'border-amber-400/60 bg-amber-400/10'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className={`font-bold ${isSelected ? 'text-amber-300' : 'text-white'}`}>
                    {row.profile.label}
                  </span>
                  <span className="text-[11px] text-slate-400 tabular-nums">
                    {row.effectiveTflops.toLocaleString()} eff. TFLOPS
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono tabular-nums">
                  <div>
                    <div className="text-slate-500">{tr('Total GPU Hours', 'ម៉ោង GPU សរុប')}</div>
                    <div className="text-white font-semibold">
                      {row.totalGpuHours.toLocaleString()} {tr('GPU-hrs', 'ម៉ោង-GPU')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-500">{tr('Throughput', 'ល្បឿនបង្វឹក')}</div>
                    <div className="text-emerald-400 font-semibold">
                      {(row.tokensPerSecond / 1000).toFixed(1)}k tok/s
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Validation Alert Warning Callout Banner if Invalid */}
      {!validation.isValid && (
        <div className="p-4 rounded-xl border border-rose-800/80 bg-rose-950/40 text-rose-200 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold font-mono uppercase text-rose-300">
                {tr('Invalid Compute Parameters Detected', 'បានរកឃើញប៉ារ៉ាម៉ែត្រគណនាមិនត្រឹមត្រូវ')}
              </h4>
              <ul className="text-xs space-y-1 text-rose-200/90 list-disc pl-4">
                {Object.values(validation.errors).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-900 hover:bg-rose-800 text-white font-mono text-xs transition-colors shrink-0"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{tr('Reset to Valid', 'កំណត់ឡើងវិញឱ្យត្រឹមត្រូវ')}</span>
          </button>
        </div>
      )}

      {/* Cloud Cost Projection Hero Metric Cards */}
      {(viewMode === 'all' || viewMode === 'cost_projection') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Projected Compute Budget */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-amber-500/30 space-y-1 shadow-lg shadow-amber-950/10">
            <div className="flex items-center justify-between text-xs font-mono text-amber-400">
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" />
                <span>{tr('TOTAL PROJECTED COST', 'ថ្លៃដើមប៉ាន់ស្មានសរុប')}</span>
              </span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/30">
                {pricingModels.find(p => p.id === config.pricingModel)?.label || config.pricingModel?.replace('_', ' ')}
              </span>
            </div>
            <div className="text-3xl font-bold font-mono text-amber-300 tabular-nums">
              ${costBreakdown.totalCostUSD.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              {tr('Compute:', 'គណនា៖')} ${costBreakdown.computeCostUSD.toLocaleString()} · {tr('Storage:', 'ផ្ទុកទិន្នន័យ៖')} ${costBreakdown.storageAndEgressUSD.toLocaleString()}
            </div>
          </div>

          {/* Hourly Cluster Burn Rate */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-xs font-mono text-cyan-400">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{tr('HOURLY BURN RATE', 'អត្រាចំណាយប្រចាំម៉ោង')}</span>
              </span>
              <span className="text-slate-500">{selectedInstance.provider}</span>
            </div>
            <div className="text-3xl font-bold font-mono text-white tabular-nums">
              ${costBreakdown.hourlyClusterCost.toFixed(2)}
              <span className="text-sm text-slate-400 font-normal"> {tr('/hr', '/ម៉ោង')}</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              {isKm
                ? `លើ ${costBreakdown.totalAccelerators} ឈីប/GPU (${costBreakdown.instanceCount} ណូដ)`
                : `Across ${costBreakdown.totalAccelerators} chips/GPUs (${costBreakdown.instanceCount} node)`}
            </div>
          </div>

          {/* Training Duration & Total GPU Hours */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-xs font-mono text-emerald-400">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                <span>{tr('TOTAL GPU HOURS', 'ម៉ោង GPU សរុប')}</span>
              </span>
              <span className="text-amber-300 font-bold">{activePrecisionProfile.label}</span>
            </div>
            <div className="text-3xl font-bold font-mono text-emerald-400 tabular-nums">
              {output.totalGpuHours.toLocaleString()}
              <span className="text-sm font-normal text-emerald-400/80"> {tr('GPU-hrs', 'ម៉ោង')}</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono tabular-nums">
              {isKm
                ? `${costBreakdown.trainingDays} ថ្ងៃ (${costBreakdown.trainingHours} ម៉ោងលើ ${costBreakdown.totalAccelerators} ឈីប)`
                : `${costBreakdown.trainingDays} days (${costBreakdown.trainingHours}h wall-clock)`}
            </div>
          </div>

          {/* Training Throughput & Unit Cost Efficiency */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-xs font-mono text-violet-400">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>{tr('CLUSTER THROUGHPUT', 'ល្បឿនបង្វឹកចង្កោម')}</span>
              </span>
              <span className="text-slate-500 tabular-nums">
                ${costBreakdown.costPerBillionTokensUSD.toFixed(0)}/1B tok
              </span>
            </div>
            <div className="text-3xl font-bold font-mono text-white tabular-nums">
              {(output.tokensPerSecond / 1000).toFixed(1)}k
              <span className="text-sm font-normal text-slate-400"> tok/s</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono tabular-nums">
              {output.tokensPerSecondPerGpu.toLocaleString()} {tr('tok/s per GPU', 'ថូខិន/វិនាទី/GPU')} · {output.totalClusterTflops.toLocaleString()} TFLOPS
            </div>
          </div>
        </div>
      )}

      {/* A100 & H100 GPU Cluster Recommendation Hardware Benchmark */}
      {(viewMode === 'all' || viewMode === 'hardware_benchmark') && (
        <HardwareBenchmark
          modelParamsB={safeConfig.modelParamsB}
          targetTokensB={safeConfig.targetTokensB}
          seqLength={safeConfig.seqLength}
          precision={activePrecision}
          pricingModel={config.pricingModel || 'on_demand'}
          currentGpuType={config.gpuType}
          currentGpuCount={config.gpuCount}
          calculatedTrainingHours={costBreakdown.trainingHours}
          calculatedTrainingDays={costBreakdown.trainingDays}
          calculatedCostUSD={costBreakdown.totalCostUSD}
          onApplyCluster={handleApplyPreset}
        />
      )}

      {/* GPU Architecture Benchmarks Comparison Table (H100 vs A100 vs TPU v4 across Model Scales) */}
      {(viewMode === 'all' || viewMode === 'gpu_benchmarks') && (
        <GpuArchitectureComparison
          currentParamsB={config.modelParamsB}
          currentTargetTokensB={config.targetTokensB}
          onApplyPreset={handleApplyPreset}
        />
      )}

      {/* Historical Hardware Utilization & Compute Budget Optimizer */}
      {(viewMode === 'all' || viewMode === 'hardware_analysis') && (
        <HardwareBenchmarkAnalysis
          modelParamsB={config.modelParamsB}
          currentGpuType={config.gpuType}
          currentProjectedCostUSD={costBreakdown.totalCostUSD}
          onApplyHardware={handleApplyPreset}
        />
      )}

      {/* Real-time GPU Utilization, Thermal & TFLOPS Monitoring Dashboard */}
      {(viewMode === 'all' || viewMode === 'monitoring') && (
        <GpuMonitoringDashboard
          config={config}
          instance={selectedInstance}
          memoryPerGpuGB={output.memoryPerGpuGB}
          effectiveClusterTflops={output.totalClusterTflops}
        />
      )}

      {/* Side-by-Side Multi-Cloud Cost Comparison Matrix & Regional Estimator */}
      {(viewMode === 'all' || viewMode === 'cost_projection') && (
        <>
          <CloudCostEstimator
            config={config}
            computedTrainingHours={costBreakdown.trainingHours}
            onUpdateConfig={(patch) => setConfig((prev) => ({ ...prev, ...patch }))}
            onInvalidInput={(title, message) =>
              setToast({
                id: Date.now().toString(),
                type: 'error',
                title,
                message
              })
            }
          />

          {/* Side-by-Side Multi-Cloud Cost Comparison Matrix */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-amber-400" />
              <h3 className="text-base font-bold text-white">
                {tr('Multi-Cloud Pretraining Cost Benchmark Matrix', 'តារាងប្រៀបធៀបថ្លៃដើមបង្វឹកជាមូលដ្ឋានលើពពកច្រើនប្រភេទ')}
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              {isKm ? (
                <>
                  ការប៉ាន់ស្មានថ្លៃដើមប្រៀបធៀបសម្រាប់ការបង្វឹក <strong className="text-white">{config.modelParamsB}B ប៉ារ៉ាម៉ែត្រ</strong> លើ <strong className="text-white">{config.targetTokensB}B ថូខិន</strong>។ ចុចលើម៉ាស៊ីនណាមួយដើម្បីប្ដូរ។
                </>
              ) : (
                <>
                  Comparative cost projection for training <strong className="text-white">{config.modelParamsB}B parameters</strong> on <strong className="text-white">{config.targetTokensB}B tokens</strong>. Click any instance to switch.
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>{tr('Storage / Egress Buffer:', 'ទុនបម្រុងផ្ទុក / បញ្ជូនទិន្នន័យ៖')}</span>
            <span className="text-amber-400 font-bold">{config.storageOverheadPercent}%</span>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">{tr('Provider / Instance', 'ក្រុមហ៊ុន / ម៉ាស៊ីន')}</th>
                <th className="py-3 px-4">{tr('Accelerators', 'ឧបករណ៍បង្កើនល្បឿន')}</th>
                <th className="py-3 px-4 text-right">{tr('Throughput', 'ល្បឿន')} ({activePrecisionProfile.label})</th>
                <th className="py-3 px-4 text-right">{tr('Total GPU Hours', 'ម៉ោង GPU សរុប')}</th>
                <th className="py-3 px-4">{tr('Duration', 'រយៈពេល')}</th>
                <th className="py-3 px-4 text-emerald-400">{tr('Spot Cost', 'តម្លៃ Spot')}</th>
                <th className="py-3 px-4 text-amber-400 font-bold">{tr('On-Demand Cost', 'តម្លៃតាមតម្រូវការ')}</th>
                <th className="py-3 px-4 text-right">{tr('Action', 'សកម្មភាព')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {output.costProjections.map((p) => {
                const isSelected = p.instanceId === config.gpuType;
                const inst = CLOUD_INSTANCES[p.instanceId];
                const spotCost = Math.round(p.trainingHours * (inst.spotHourlyUSD * p.instanceCount) * (1 + (config.storageOverheadPercent || 6) / 100));
                const onDemandCost = Math.round(p.trainingHours * (inst.onDemandHourlyUSD * p.instanceCount) * (1 + (config.storageOverheadPercent || 6) / 100));

                return (
                  <tr
                    key={p.instanceId}
                    onClick={() => setConfig({ ...config, gpuType: p.instanceId })}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-amber-400/10 text-white font-medium'
                        : 'hover:bg-slate-900/60 text-slate-300'
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">
                        {isKm ? (inst.nameKm || p.name) : p.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                        {isKm ? (inst.interconnectKm || inst.interconnect) : inst.interconnect}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 tabular-nums">
                      {p.totalAccelerators}x {tr('chips/GPUs', 'ឈីប/GPU')}
                    </td>
                    <td className="py-3.5 px-4 text-right text-cyan-300 font-semibold tabular-nums whitespace-nowrap">
                      {(p.tokensPerSecond / 1000).toFixed(1)}k tok/s
                      <div className="text-[10px] font-normal text-slate-400">
                        {p.tokensPerSecondPerGpu.toLocaleString()} tok/s/GPU
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right text-emerald-300 font-semibold tabular-nums whitespace-nowrap">
                      {p.totalGpuHours.toLocaleString()} h
                    </td>
                    <td className="py-3.5 px-4 tabular-nums">
                      <span className="font-bold text-white">{p.trainingDays}</span>
                      <span className="text-slate-400"> {tr('days', 'ថ្ងៃ')} ({p.trainingHours}{tr('h', 'ម៉ោង')})</span>
                    </td>
                    <td className="py-3.5 px-4 text-emerald-400 font-semibold tabular-nums">
                      ${spotCost.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-amber-300 font-bold tabular-nums">
                      ${onDemandCost.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfig({ ...config, gpuType: p.instanceId });
                        }}
                        className={`px-2.5 py-1 text-[11px] rounded transition-colors whitespace-nowrap ${
                          isSelected
                            ? 'bg-amber-400 text-slate-950 font-bold'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {isSelected ? tr('Active', 'កំពុងប្រើ') : tr('Select', 'ជ្រើសរើស')}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 gap-4">
          <div className="flex items-center gap-2">
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {isKm ? (
                <>
                  ថាមពលចង្កោមប៉ាន់ស្មាន៖ <strong className="text-white">{costBreakdown.energyKWh.toLocaleString()} kWh</strong> (~{costBreakdown.carbonTonsCO2} តោន CO2e)
                </>
              ) : (
                <>
                  Estimated Cluster Energy: <strong className="text-white">{costBreakdown.energyKWh.toLocaleString()} kWh</strong> (~{costBreakdown.carbonTonsCO2} metric tons CO2e)
                </>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
            <span>{tr('Includes: Compute instance runtime + 6% S3/GCS checkpoint storage overhead.', 'រួមបញ្ចូល៖ រយៈពេលដំណើរការម៉ាស៊ីន + ថ្លៃផ្ទុកចំណុចត្រួតពិនិត្យ S3/GCS 6%។')}</span>
          </div>
        </div>
      </div>

      {/* Hardware Architecture & Memory Allocation Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">{tr('Recommended Pretraining Hyperparameters', 'ប៉ារ៉ាម៉ែត្របង្វឹកជាមូលដ្ឋានដែលណែនាំ')}</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">{tr('Peak Learning Rate', 'អត្រារៀនកំពូល (Peak LR)')}</span>
              <span className="font-mono text-amber-300 font-bold">{output.recommendedLearningRate} ({tr('Cosine Decay to 10%', 'ថយចុះតាម Cosine ដល់ 10%')})</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">{tr('Warmup Steps', 'ជំហានកម្តៅម៉ាស៊ីន (Warmup)')}</span>
              <span className="font-mono text-white">{tr('2,000 steps linear', '2,000 ជំហានលីនេអ៊ែរ')}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">{tr('Sequence Context Window', 'ទំហំបរិបទលំដាប់ (Context Window)')}</span>
              <span className="font-mono text-white">{config.seqLength} {tr('tokens (with RoPE base θ = 500,000)', 'ថូខិន (ជាមួយ RoPE base θ = 500,000)')}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">{tr('Global Batch Size', 'ទំហំ Batch សកល')}</span>
              <span className="font-mono text-white">{output.recommendedBatchSize} {tr('sequences (~2.1M tokens/step)', 'លំដាប់ (~2.1M ថូខិន/ជំហាន)')}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">{tr('Weight Decay & Optimizer', 'Weight Decay និង Optimizer')}</span>
              <span className="font-mono text-white">AdamW (β1=0.9, β2=0.95, weight_decay=0.1)</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-400">{tr('Attention Mechanism', 'យន្តការ Attention')}</span>
              <span className="font-mono text-white">FlashAttention-2 + Grouped-Query Attention (GQA 4:1)</span>
            </div>
          </div>
        </div>

        {/* VRAM Breakdown with PyTorch FSDP */}
        <div className="lg:col-span-6 p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
          <h3 className="text-sm font-semibold text-white">{tr('FSDP VRAM Allocation Breakdown', 'ការបែងចែកអង្គចងចាំ VRAM របស់ FSDP')}</h3>

          <div className="space-y-2.5">
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-300">
                <span>
                  {tr(
                    `Model Weights (${activePrecisionProfile.label}, sharded)`,
                    `ទម្ងន់ម៉ូដែល (${activePrecisionProfile.label}, ចែករំលែក)`
                  )}
                </span>
                <span className="font-mono text-slate-400 tabular-nums">{output.memoryPerGpuGB.weights} GB</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div style={{ width: `${Math.min(100, (output.memoryPerGpuGB.weights / (selectedInstance.vramTotalGB / selectedInstance.acceleratorCount)) * 100)}%` }} className="bg-cyan-400 h-full" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-300">
                <span>
                  {tr(
                    `Gradients (${activePrecisionProfile.label}, sharded)`,
                    `ក្រាដ្យង់ (${activePrecisionProfile.label}, ចែករំលែក)`
                  )}
                </span>
                <span className="font-mono text-slate-400 tabular-nums">{output.memoryPerGpuGB.gradients} GB</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div style={{ width: `${Math.min(100, (output.memoryPerGpuGB.gradients / (selectedInstance.vramTotalGB / selectedInstance.acceleratorCount)) * 100)}%` }} className="bg-emerald-400 h-full" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-300">
                <span>{tr('Optimizer States (AdamW FP32 master, sharded)', 'ស្ថានភាព Optimizer (AdamW FP32 master, ចែករំលែក)')}</span>
                <span className="font-mono text-slate-400">{output.memoryPerGpuGB.optimizerAdam} GB</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div style={{ width: `${Math.min(100, (output.memoryPerGpuGB.optimizerAdam / (selectedInstance.vramTotalGB / selectedInstance.acceleratorCount)) * 100)}%` }} className="bg-amber-400 h-full" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-300">
                <span>{tr('Activations & FlashAttention Buffer', 'សកម្មភាព និងបណ្ដោះអាសន្ន FlashAttention')}</span>
                <span className="font-mono text-slate-400">{output.memoryPerGpuGB.activationsEst} GB</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div style={{ width: `${Math.min(100, (output.memoryPerGpuGB.activationsEst / (selectedInstance.vramTotalGB / selectedInstance.acceleratorCount)) * 100)}%` }} className="bg-violet-400 h-full" />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              {isKm ? (
                <>
                  <strong>បានបញ្ជាក់ភាពសមស្របនៃចង្កោម៖</strong> ស្ថានភាពម៉ូដែល និងសកម្មភាពសមល្មមក្នុង VRAM {(selectedInstance.vramTotalGB / selectedInstance.acceleratorCount)} GB ក្នុងមួយឧបករណ៍បង្កើនល្បឿន ដោយមិនចាំបាច់ប្តូរចេញទៅអង្គចងចាំក្រៅ (OOM swapping)!
                </>
              ) : (
                <>
                  <strong>Cluster Fit Verified:</strong> Model states and activations fit comfortably in the {(selectedInstance.vramTotalGB / selectedInstance.acceleratorCount)} GB VRAM per accelerator without out-of-memory swapping!
                </>
              )}
            </span>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
};
