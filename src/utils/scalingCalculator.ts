import { CloudInstance, CloudRegion, CostProjectionBreakdown, PricingModel, ScalingConfig } from '../types';

export const CLOUD_REGIONS: Record<string, CloudRegion> = {
  gcp_us_central1: {
    id: 'gcp_us_central1',
    provider: 'GCP',
    code: 'us-central1',
    name: 'GCP US Central (Iowa)',
    nameKm: 'GCP សហរដ្ឋអាមេរិកកណ្តាល (Iowa)',
    location: 'North America · Low Cost',
    locationKm: 'អាមេរិកខាងជើង · តម្លៃទាប',
    priceMultiplier: 1.0,
    egressPerGBUSD: 0.08,
    tpuV4Available: true,
    notes: 'Primary Google TPU v4 availability zone with baseline US pricing.',
    notesKm: 'តំបន់ចម្បងដែលមាន Google TPU v4 ជាមួយតម្លៃមូលដ្ឋាននៅអាមេរិក។'
  },
  gcp_us_west1: {
    id: 'gcp_us_west1',
    provider: 'GCP',
    code: 'us-west1',
    name: 'GCP US West (Oregon)',
    nameKm: 'GCP សហរដ្ឋអាមេរិកខាងលិច (Oregon)',
    location: 'North America · Hydro',
    locationKm: 'អាមេរិកខាងជើង · ថាមពលវារីអគ្គិសនី',
    priceMultiplier: 1.0,
    egressPerGBUSD: 0.08,
    tpuV4Available: false,
    notes: 'Carbon-free hydro grid; hosts TPU v5e and A3 H100 nodes.',
    notesKm: 'ប្រើប្រាស់ថាមពលវារីអគ្គិសនីស្អាត; គាំទ្រ TPU v5e និង A3 H100។'
  },
  gcp_asia_southeast1: {
    id: 'gcp_asia_southeast1',
    provider: 'GCP',
    code: 'asia-southeast1',
    name: 'GCP Asia Southeast (Singapore)',
    nameKm: 'GCP អាស៊ីអាគ្នេយ៍ (សិង្ហបុរី)',
    location: 'ASEAN · Low Latency to Cambodia',
    locationKm: 'អាស៊ាន · ល្បឿនឆ្លើយតបលឿនមកកម្ពុជា',
    priceMultiplier: 1.12,
    egressPerGBUSD: 0.12,
    tpuV4Available: false,
    notes: 'Closest GCP region to Phnom Penh (~25ms RTT); +12% APAC compute rate.',
    notesKm: 'តំបន់ GCP ជិតភ្នំពេញបំផុត (~25ms RTT); តម្លៃគណនា APAC +១២%។'
  },
  gcp_asia_east1: {
    id: 'gcp_asia_east1',
    provider: 'GCP',
    code: 'asia-east1',
    name: 'GCP Asia East (Taiwan)',
    nameKm: 'GCP អាស៊ីខាងកើត (តៃវ៉ាន់)',
    location: 'APAC · TPU Research Hub',
    locationKm: 'APAC · មជ្ឈមណ្ឌលស្រាវជ្រាវ TPU',
    priceMultiplier: 1.1,
    egressPerGBUSD: 0.12,
    tpuV4Available: true,
    notes: 'Supports APAC TPU pods with +10% regional uplift over Iowa.',
    notesKm: 'គាំទ្រ TPU Pods នៅអាស៊ីប៉ាស៊ីហ្វិក ជាមួយតម្លៃ +១០% ធៀបនឹង Iowa។'
  },
  gcp_europe_west4: {
    id: 'gcp_europe_west4',
    provider: 'GCP',
    code: 'europe-west4',
    name: 'GCP Europe West (Netherlands)',
    nameKm: 'GCP អឺរ៉ុបខាងលិច (ហូឡង់)',
    location: 'Europe · Eemshaven',
    locationKm: 'អឺរ៉ុប · Eemshaven',
    priceMultiplier: 1.09,
    egressPerGBUSD: 0.08,
    tpuV4Available: true,
    notes: 'EU TPU v4 zone compliant with strict data residency requirements.',
    notesKm: 'តំបន់ TPU v4 សហភាពអឺរ៉ុប អនុលោមតាមច្បាប់រក្សាទុកទិន្នន័យតឹងរ៉ឹង។'
  },
  aws_us_east_1: {
    id: 'aws_us_east_1',
    provider: 'AWS',
    code: 'us-east-1',
    name: 'AWS US East (N. Virginia)',
    nameKm: 'AWS អាមេរិកខាងកើត (N. Virginia)',
    location: 'North America · Baseline',
    locationKm: 'អាមេរិកខាងជើង · មូលដ្ឋាន',
    priceMultiplier: 1.0,
    egressPerGBUSD: 0.09,
    notes: 'Deepest p4d/p5/trn1 capacity pool with lowest AWS list prices.',
    notesKm: 'មានសមត្ថភាព p4d/p5/trn1 ច្រើនបំផុត និងតម្លៃ AWS ទាបបំផុត។'
  },
  aws_us_west_2: {
    id: 'aws_us_west_2',
    provider: 'AWS',
    code: 'us-west-2',
    name: 'AWS US West (Oregon)',
    nameKm: 'AWS អាមេរិកខាងលិច (Oregon)',
    location: 'North America · West',
    locationKm: 'អាមេរិកខាងជើង · ខាងលិច',
    priceMultiplier: 1.02,
    egressPerGBUSD: 0.09,
    notes: 'UltraCluster EC2 capacity blocks for large multi-node FSDP runs.',
    notesKm: 'ប្លុក EC2 UltraCluster សម្រាប់ការបង្វឹក FSDP ពហុណូដទ្រង់ទ្រាយធំ។'
  },
  aws_ap_southeast_1: {
    id: 'aws_ap_southeast_1',
    provider: 'AWS',
    code: 'ap-southeast-1',
    name: 'AWS Asia Pacific (Singapore)',
    nameKm: 'AWS អាស៊ីប៉ាស៊ីហ្វិក (សិង្ហបុរី)',
    location: 'ASEAN · Regional Hub',
    locationKm: 'អាស៊ាន · មជ្ឈមណ្ឌលតំបន់',
    priceMultiplier: 1.16,
    egressPerGBUSD: 0.12,
    notes: 'Lowest latency AWS region for Cambodian engineering teams (+16% APAC rate).',
    notesKm: 'តំបន់ AWS ដែលមានភាពយឺតយ៉ាវទាបបំផុតសម្រាប់ក្រុមវិស្វករកម្ពុជា (+១៦%)។'
  },
  aws_ap_northeast_1: {
    id: 'aws_ap_northeast_1',
    provider: 'AWS',
    code: 'ap-northeast-1',
    name: 'AWS Asia Pacific (Tokyo)',
    nameKm: 'AWS អាស៊ីប៉ាស៊ីហ្វិក (តូក្យូ)',
    location: 'East Asia · Tokyo',
    locationKm: 'អាស៊ីខាងកើត · តូក្យូ',
    priceMultiplier: 1.19,
    egressPerGBUSD: 0.114,
    notes: 'Enterprise APAC AI zone with +19% regional infrastructure premium.',
    notesKm: 'តំបន់ AI សម្រាប់សហគ្រាសនៅ APAC ជាមួយថ្លៃហេដ្ឋារចនាសម្ព័ន្ធបន្ថែម +១៩%។'
  },
  lambda_us_texas: {
    id: 'lambda_us_texas',
    provider: 'LambdaLabs',
    code: 'us-south-1',
    name: 'Bare-Metal AI Cloud (US South)',
    nameKm: 'Bare-Metal AI Cloud (អាមេរិកខាងត្បូង)',
    location: 'USA · Zero Egress',
    locationKm: 'អាមេរិក · គ្មានថ្លៃទាញទិន្នន័យចេញ',
    priceMultiplier: 1.0,
    egressPerGBUSD: 0.0,
    notes: 'Dedicated InfiniBand H100 clusters with $0 data egress fees.',
    notesKm: 'ចង្កោម InfiniBand H100 ផ្តាច់មុខ ជាមួយថ្លៃផ្ទេរទិន្នន័យចេញ $0។'
  }
};

export const CLOUD_INSTANCES: Record<string, CloudInstance> = {
  gcp_tpu_v4_16: {
    id: 'gcp_tpu_v4_16',
    provider: 'GCP',
    name: 'Google Cloud TPU v4-16 Pod Slice',
    nameKm: 'Google Cloud TPU v4-16 Pod Slice',
    instanceType: 'tpu-v4-podslice-16',
    accelerator: '16x Google TPU v4 Chips (32 TensorCores)',
    acceleratorCount: 16,
    fp16Bf16Tflops: 4400, // 275 TFLOPs per chip * 16
    vramTotalGB: 512, // 32GB HBM per chip
    onDemandHourlyUSD: 51.52, // $3.22 / chip / hr
    spotHourlyUSD: 21.60, // $1.35 / chip / hr
    reserved1yrHourlyUSD: 32.80, // $2.05 / chip / hr
    interconnect: '3D Torus Interconnect (Inter-chip optical wrap-around)',
    interconnectKm: 'បណ្តាញតភ្ជាប់ 3D Torus (តភ្ជាប់អុបទិករវាងឈីប)',
    notes: 'Google Cloud native custom silicon. Optimal for XLA/JAX or PyTorch/XLA pretraining with high TPU MFU.',
    notesKm: 'ឈីបពិសេសរបស់ Google Cloud។ ប្រសើរបំផុតសម្រាប់ការបង្វឹក XLA/JAX ឬ PyTorch/XLA ជាមួយ TPU MFU ខ្ពស់។'
  },
  gcp_tpu_v5e_16: {
    id: 'gcp_tpu_v5e_16',
    provider: 'GCP',
    name: 'Google Cloud TPU v5e-16 Pod Slice',
    nameKm: 'Google Cloud TPU v5e-16 Pod Slice',
    instanceType: 'tpu-v5e-podslice-16',
    accelerator: '16x Google TPU v5e Chips',
    acceleratorCount: 16,
    fp16Bf16Tflops: 3152, // 197 TFLOPs per chip * 16
    vramTotalGB: 256, // 16GB HBM per chip
    onDemandHourlyUSD: 19.20, // $1.20 / chip / hr
    spotHourlyUSD: 8.80, // $0.55 / chip / hr
    reserved1yrHourlyUSD: 13.44, // $0.84 / chip / hr
    interconnect: '2D Torus Interconnect',
    interconnectKm: 'បណ្តាញតភ្ជាប់ 2D Torus',
    notes: 'Highly cost-effective efficiency TPU. Ideal for 1.5B Khmer models under budget constraints.',
    notesKm: 'TPU សន្សំសំចៃខ្ពស់។ ស័ក្តិសមបំផុតសម្រាប់ម៉ូដែលខ្មែរ 1.5B ដែលមានថវិកាកំណត់។'
  },
  gcp_a3_h100: {
    id: 'gcp_a3_h100',
    provider: 'GCP',
    name: 'Google Cloud A3 High (8x H100)',
    nameKm: 'Google Cloud A3 High (8x H100)',
    instanceType: 'a3-highgpu-8g',
    accelerator: '8x NVIDIA H100 SXM5 80GB',
    acceleratorCount: 8,
    fp16Bf16Tflops: 6000, // 750 TFLOPs per GPU * 8
    vramTotalGB: 640,
    onDemandHourlyUSD: 30.80, // $3.85 / GPU / hr
    spotHourlyUSD: 12.32,
    reserved1yrHourlyUSD: 20.02,
    interconnect: '3.2 Tbps GPUDirect RDMA with Intel Sapphire Rapids',
    interconnectKm: '3.2 Tbps GPUDirect RDMA ជាមួយ Intel Sapphire Rapids',
    notes: 'Top tier GPU training node on Google Cloud. Highest bandwidth for FlashAttention-2.',
    notesKm: 'ណូដ GPU បង្វឹកកម្រិតកំពូលលើ Google Cloud។ មាន Bandwidth ខ្ពស់បំផុតសម្រាប់ FlashAttention-2។'
  },
  aws_p4d_24xlarge: {
    id: 'aws_p4d_24xlarge',
    provider: 'AWS',
    name: 'AWS EC2 p4d.24xlarge (8x A100 40GB)',
    nameKm: 'AWS EC2 p4d.24xlarge (8x A100 40GB)',
    instanceType: 'p4d.24xlarge',
    accelerator: '8x NVIDIA A100-SXM4-40GB',
    acceleratorCount: 8,
    fp16Bf16Tflops: 2496, // 312 TFLOPs per GPU * 8
    vramTotalGB: 320,
    onDemandHourlyUSD: 32.77,
    spotHourlyUSD: 11.47,
    reserved1yrHourlyUSD: 20.08,
    interconnect: '400 Gbps Elastic Fabric Adapter (EFA) + NVLink 3.0',
    interconnectKm: '400 Gbps Elastic Fabric Adapter (EFA) + NVLink 3.0',
    notes: 'Standard enterprise workhorse. Solid PyTorch FSDP multi-node scaling on AWS.',
    notesKm: 'ម៉ាស៊ីនសហគ្រាសស្តង់ដារ។ រឹងមាំសម្រាប់ PyTorch FSDP ពហុណូដលើ AWS។'
  },
  aws_p4de_24xlarge: {
    id: 'aws_p4de_24xlarge',
    provider: 'AWS',
    name: 'AWS EC2 p4de.24xlarge (8x A100 80GB)',
    nameKm: 'AWS EC2 p4de.24xlarge (8x A100 80GB)',
    instanceType: 'p4de.24xlarge',
    accelerator: '8x NVIDIA A100-SXM4-80GB',
    acceleratorCount: 8,
    fp16Bf16Tflops: 2496,
    vramTotalGB: 640,
    onDemandHourlyUSD: 40.96,
    spotHourlyUSD: 14.34,
    reserved1yrHourlyUSD: 25.10,
    interconnect: '400 Gbps EFA + NVLink 3.0',
    interconnectKm: '400 Gbps EFA + NVLink 3.0',
    notes: 'Doubles VRAM to 80GB per GPU for longer 8k context window sequences without out-of-memory.',
    notesKm: 'បង្កើន VRAM ទ្វេដងដល់ 80GB/GPU សម្រាប់បរិបទ 8k វែងដោយមិនអស់អង្គចងចាំ។'
  },
  aws_p5_48xlarge: {
    id: 'aws_p5_48xlarge',
    provider: 'AWS',
    name: 'AWS EC2 p5.48xlarge (8x H100 80GB)',
    nameKm: 'AWS EC2 p5.48xlarge (8x H100 80GB)',
    instanceType: 'p5.48xlarge',
    accelerator: '8x NVIDIA H100-SXM5-80GB',
    acceleratorCount: 8,
    fp16Bf16Tflops: 6000,
    vramTotalGB: 640,
    onDemandHourlyUSD: 98.32,
    spotHourlyUSD: 39.30,
    reserved1yrHourlyUSD: 61.20,
    interconnect: '3,200 Gbps EFA v2 (GPUDirect RDMA across UltraClusters)',
    interconnectKm: '3,200 Gbps EFA v2 (GPUDirect RDMA លើ UltraClusters)',
    notes: 'AWS flagship accelerated node. Unsurpassed inter-node bandwidth across thousands of GPUs.',
    notesKm: 'ណូដកំពូលរបស់ AWS។ មានល្បឿនតភ្ជាប់រវាងណូដខ្ពស់បំផុតលើ GPU រាប់ពាន់គ្រឿង។'
  },
  aws_trn1_32xlarge: {
    id: 'aws_trn1_32xlarge',
    provider: 'AWS',
    name: 'AWS EC2 trn1.32xlarge (16x Trainium)',
    nameKm: 'AWS EC2 trn1.32xlarge (16x Trainium)',
    instanceType: 'trn1.32xlarge',
    accelerator: '16x AWS Trainium Chips (32 NeuronCores)',
    acceleratorCount: 16,
    fp16Bf16Tflops: 3360, // 210 TFLOPs per chip * 16
    vramTotalGB: 512,
    onDemandHourlyUSD: 21.50,
    spotHourlyUSD: 6.45,
    reserved1yrHourlyUSD: 14.62,
    interconnect: '800 Gbps EFA with NeuronLink-v2 ring topology',
    interconnectKm: '800 Gbps EFA ជាមួយបណ្តាញរង្វង់ NeuronLink-v2',
    notes: 'AWS purpose-built training chip. Exceptional price-to-performance for BF16 Transformers.',
    notesKm: 'ឈីបបង្វឹកផលិតផ្ទាល់របស់ AWS។ ផ្តល់តម្លៃធៀបនឹងសមត្ថភាពខ្ពស់សម្រាប់ BF16 Transformers។'
  },
  lambda_h100_node: {
    id: 'lambda_h100_node',
    provider: 'LambdaLabs',
    name: 'Lambda Cloud / RunPod (8x H100 Node)',
    nameKm: 'Lambda Cloud / RunPod (ណូដ 8x H100)',
    instanceType: 'gpu-h100-sxm5-8x',
    accelerator: '8x NVIDIA H100 SXM5 80GB',
    acceleratorCount: 8,
    fp16Bf16Tflops: 6000,
    vramTotalGB: 640,
    onDemandHourlyUSD: 23.92, // $2.99 / GPU / hr
    spotHourlyUSD: 19.92,
    reserved1yrHourlyUSD: 17.52,
    interconnect: 'Quantum-2 InfiniBand 3.2 Tbps',
    interconnectKm: 'Quantum-2 InfiniBand 3.2 Tbps',
    notes: 'Lowest raw cost per H100 hour for startups, academic researchers, and sovereign foundation labs.',
    notesKm: 'តម្លៃដើមទាបបំផុតក្នុង ១ ម៉ោង H100 សម្រាប់ក្រុមហ៊ុន Startup អ្នកស្រាវជ្រាវ និងមន្ទីរពិសោធន៍ជាតិ។'
  }
};

export interface ScalingOutput {
  totalFlops: number; // in floating point operations
  totalFlopsFormatted: string;
  effectiveTflopsPerGpu: number;
  totalClusterTflops: number;
  trainingHours: number;
  trainingDays: number;
  totalGpuHours: number;
  estimatedCostUSD: number;
  memoryPerGpuGB: {
    weights: number;
    gradients: number;
    optimizerAdam: number;
    activationsEst: number;
    totalPerGpuFsdp: number;
  };
  recommendedBatchSize: number;
  recommendedLearningRate: string;
  chinchillaOptimalTokensB: number;
  overtrainingRatio: number; // targetTokensB / (modelParamsB * 20)
  activeInstance: CloudInstance;
  costProjections: CostProjectionBreakdown[];
  selectedCostBreakdown: CostProjectionBreakdown;
}

/**
 * Project training cost and duration across multiple cloud providers and instances
 */
export function projectCloudCost(
  instance: CloudInstance,
  instanceCount: number,
  totalFlops: number,
  targetTokensB: number,
  modelParamsB: number,
  mfu: number,
  pricingModel: PricingModel,
  storageOverheadPercent: number = 6
): CostProjectionBreakdown {
  const totalAccelerators = instance.acceleratorCount * instanceCount;
  const clusterPeakTflops = instance.fp16Bf16Tflops * instanceCount;
  const effectiveTflops = clusterPeakTflops * mfu;

  // Total seconds needed = totalFlops / (effectiveTflops * 10^12)
  const totalSeconds = totalFlops / (effectiveTflops * 1e12);
  const trainingHours = Math.max(0.1, Number((totalSeconds / 3600).toFixed(1)));
  const trainingDays = Math.max(0.01, Number((trainingHours / 24).toFixed(1)));

  // Determine hourly instance cost based on pricing model
  let hourlyRatePerInstance = instance.onDemandHourlyUSD;
  if (pricingModel === 'spot') {
    hourlyRatePerInstance = instance.spotHourlyUSD;
  } else if (pricingModel === 'reserved_1yr') {
    hourlyRatePerInstance = instance.reserved1yrHourlyUSD;
  }

  const hourlyClusterCost = Number((hourlyRatePerInstance * instanceCount).toFixed(2));
  const computeCostUSD = Math.round(trainingHours * hourlyClusterCost);
  const storageAndEgressUSD = Math.round(computeCostUSD * (storageOverheadPercent / 100));
  const totalCostUSD = computeCostUSD + storageAndEgressUSD;

  const costPerBillionTokensUSD = targetTokensB > 0 ? Number((totalCostUSD / targetTokensB).toFixed(2)) : 0;
  const costPerMillionParamsUSD = modelParamsB > 0 ? Number((totalCostUSD / (modelParamsB * 1000)).toFixed(2)) : 0;

  // Approximate energy: ~700W per modern accelerator + host overhead (~1kW per accelerator equivalent)
  const energyKWh = Math.round(trainingHours * totalAccelerators * 0.9);
  // Average US/Global grid emission factor ~0.385 kg CO2e / kWh
  const carbonTonsCO2 = Number(((energyKWh * 0.385) / 1000).toFixed(2));

  return {
    instanceId: instance.id,
    provider: instance.provider,
    name: instance.name,
    accelerator: instance.accelerator,
    instanceCount,
    totalAccelerators,
    trainingHours,
    trainingDays,
    hourlyClusterCost,
    computeCostUSD,
    storageAndEgressUSD,
    totalCostUSD,
    costPerBillionTokensUSD,
    costPerMillionParamsUSD,
    effectiveTflops: Math.round(effectiveTflops),
    energyKWh,
    carbonTonsCO2
  };
}

export function computeScaling(config: ScalingConfig): ScalingOutput {
  const {
    modelParamsB,
    targetTokensB,
    gpuType,
    gpuCount,
    mfuEstimate,
    pricingModel = 'on_demand',
    instanceCount = 1,
    storageOverheadPercent = 6
  } = config;

  const activeInstance = CLOUD_INSTANCES[gpuType] || CLOUD_INSTANCES.gcp_a3_h100;

  const N = modelParamsB * 1e9; // Parameters
  const D = targetTokensB * 1e9; // Tokens

  // Standard Chinchilla formula: Training FLOPs = 6 * N * D
  const totalFlops = 6 * N * D;

  // Format FLOPs into readable notation
  let totalFlopsFormatted = '';
  if (totalFlops >= 1e21) {
    totalFlopsFormatted = `${(totalFlops / 1e21).toFixed(2)} ZettaFLOPs (10²¹ FLOPs)`;
  } else if (totalFlops >= 1e18) {
    totalFlopsFormatted = `${(totalFlops / 1e18).toFixed(2)} ExaFLOPs (10¹⁸ FLOPs)`;
  } else {
    totalFlopsFormatted = `${(totalFlops / 1e15).toFixed(2)} PetaFLOPs (10¹⁵ FLOPs)`;
  }

  // Chinchilla optimal tokens is 20 * N
  const chinchillaOptimalTokensB = modelParamsB * 20;
  const overtrainingRatio = Number((targetTokensB / chinchillaOptimalTokensB).toFixed(2));

  // Compute all cloud instance cost projections
  const costProjections: CostProjectionBreakdown[] = Object.values(CLOUD_INSTANCES).map(inst => {
    // Determine instance count to match roughly the user's desired accelerator count
    // or use the specified instanceCount
    const effectiveInstances = Math.max(1, Math.round(gpuCount / inst.acceleratorCount));
    return projectCloudCost(
      inst,
      effectiveInstances,
      totalFlops,
      targetTokensB,
      modelParamsB,
      mfuEstimate,
      pricingModel,
      storageOverheadPercent
    );
  });

  const selectedCostBreakdown = projectCloudCost(
    activeInstance,
    Math.max(1, Math.round(gpuCount / activeInstance.acceleratorCount)),
    totalFlops,
    targetTokensB,
    modelParamsB,
    mfuEstimate,
    pricingModel,
    storageOverheadPercent
  );

  // Memory estimation for PyTorch FSDP
  const totalWeightBytes = 2 * N;
  const totalGradBytes = 2 * N;
  const totalOptBytes = 12 * N;
  const totalStateBytes = totalWeightBytes + totalGradBytes + totalOptBytes;

  const shardedStatePerGpu = (totalStateBytes / gpuCount) / (1024 ** 3);
  const activationsEst = Math.min(16, (config.seqLength / 2048) * (modelParamsB * 1.5));
  const totalPerGpuFsdp = Number((shardedStatePerGpu + activationsEst).toFixed(1));

  let recommendedLearningRate = '3.0e-4';
  if (modelParamsB >= 7) {
    recommendedLearningRate = '1.5e-4';
  } else if (modelParamsB >= 3) {
    recommendedLearningRate = '2.2e-4';
  } else if (modelParamsB <= 1) {
    recommendedLearningRate = '4.0e-4';
  }

  const recommendedBatchSizeTokens = modelParamsB >= 7 ? 4194304 : 2097152;
  const recommendedBatchSize = Math.round(recommendedBatchSizeTokens / config.seqLength);

  return {
    totalFlops,
    totalFlopsFormatted,
    effectiveTflopsPerGpu: Math.round((activeInstance.fp16Bf16Tflops / activeInstance.acceleratorCount) * mfuEstimate),
    totalClusterTflops: selectedCostBreakdown.effectiveTflops,
    trainingHours: selectedCostBreakdown.trainingHours,
    trainingDays: selectedCostBreakdown.trainingDays,
    totalGpuHours: Math.round(selectedCostBreakdown.trainingHours * selectedCostBreakdown.totalAccelerators),
    estimatedCostUSD: selectedCostBreakdown.totalCostUSD,
    memoryPerGpuGB: {
      weights: Number(((totalWeightBytes / gpuCount) / (1024 ** 3)).toFixed(1)),
      gradients: Number(((totalGradBytes / gpuCount) / (1024 ** 3)).toFixed(1)),
      optimizerAdam: Number(((totalOptBytes / gpuCount) / (1024 ** 3)).toFixed(1)),
      activationsEst: Number(activationsEst.toFixed(1)),
      totalPerGpuFsdp
    },
    recommendedBatchSize,
    recommendedLearningRate,
    chinchillaOptimalTokensB,
    overtrainingRatio,
    activeInstance,
    costProjections,
    selectedCostBreakdown
  };
}

export interface CloudExpenditureEstimate {
  instance: CloudInstance;
  region: CloudRegion;
  computeUnits: number;
  totalAccelerators: number;
  durationHours: number;
  durationDays: number;
  pricingModel: PricingModel;
  baseHourlyPerUnitUSD: number;
  regionalHourlyPerUnitUSD: number;
  regionalHourlyClusterUSD: number;
  baseComputeCostUSD: number;
  regionalPremiumUSD: number;
  storageCostUSD: number;
  egressCostUSD: number;
  totalExpenditureUSD: number;
  onDemandComparisonUSD: number;
  savingsVsOnDemandUSD: number;
  costPerAcceleratorHourUSD: number;
}

export function estimateCloudExpenditure(params: {
  instanceId: string;
  regionId: string;
  computeUnits: number;
  durationHours: number;
  pricingModel: PricingModel;
  storageOverheadPercent: number;
  checkpointSizeTB?: number;
}): CloudExpenditureEstimate {
  const instance = CLOUD_INSTANCES[params.instanceId] || CLOUD_INSTANCES.gcp_tpu_v4_16;
  const region = CLOUD_REGIONS[params.regionId] || CLOUD_REGIONS.gcp_us_central1;

  const computeUnits = Math.max(1, Math.round(params.computeUnits || 1));
  const durationHours = Math.max(0.1, params.durationHours || 1);
  const durationDays = Number((durationHours / 24).toFixed(2));
  const totalAccelerators = instance.acceleratorCount * computeUnits;

  let baseHourlyPerUnitUSD = instance.onDemandHourlyUSD;
  if (params.pricingModel === 'spot') {
    baseHourlyPerUnitUSD = instance.spotHourlyUSD;
  } else if (params.pricingModel === 'reserved_1yr') {
    baseHourlyPerUnitUSD = instance.reserved1yrHourlyUSD;
  }

  const regionalHourlyPerUnitUSD = Number((baseHourlyPerUnitUSD * region.priceMultiplier).toFixed(2));
  const regionalHourlyClusterUSD = Number((regionalHourlyPerUnitUSD * computeUnits).toFixed(2));

  const baseComputeCostUSD = Math.round(baseHourlyPerUnitUSD * computeUnits * durationHours);
  const regionalComputeCostUSD = Math.round(regionalHourlyClusterUSD * durationHours);
  const regionalPremiumUSD = Math.max(0, regionalComputeCostUSD - baseComputeCostUSD);

  const storageCostUSD = Math.round(regionalComputeCostUSD * (Math.max(0, params.storageOverheadPercent) / 100));
  const checkpointGB = (params.checkpointSizeTB ?? 1.5) * 1024;
  const egressCostUSD = Math.round(checkpointGB * region.egressPerGBUSD);

  const totalExpenditureUSD = regionalComputeCostUSD + storageCostUSD + egressCostUSD;

  // Baseline comparison against US On-Demand in same region
  const onDemandRegionalCostUSD =
    Math.round(instance.onDemandHourlyUSD * region.priceMultiplier * computeUnits * durationHours) +
    Math.round(instance.onDemandHourlyUSD * region.priceMultiplier * computeUnits * durationHours * (Math.max(0, params.storageOverheadPercent) / 100)) +
    egressCostUSD;

  const savingsVsOnDemandUSD = Math.max(0, onDemandRegionalCostUSD - totalExpenditureUSD);
  const costPerAcceleratorHourUSD = Number((regionalHourlyPerUnitUSD / instance.acceleratorCount).toFixed(2));

  return {
    instance,
    region,
    computeUnits,
    totalAccelerators,
    durationHours: Number(durationHours.toFixed(1)),
    durationDays,
    pricingModel: params.pricingModel,
    baseHourlyPerUnitUSD,
    regionalHourlyPerUnitUSD,
    regionalHourlyClusterUSD,
    baseComputeCostUSD,
    regionalPremiumUSD,
    storageCostUSD,
    egressCostUSD,
    totalExpenditureUSD,
    onDemandComparisonUSD: onDemandRegionalCostUSD,
    savingsVsOnDemandUSD,
    costPerAcceleratorHourUSD
  };
}

