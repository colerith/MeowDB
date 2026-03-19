import type { MeowDBConfig } from '@/config/schema';

export const defaultConfig: MeowDBConfig = {
  api: {
    enabled: false,
    url: '',
    key: '',
    model: '',
    temperature: 0.7,
    maxTokens: 2048,
  },
  trigger: {
    autoUpdate: false,
    autoUpdateInterval: 1,
    summarizeThreshold: 10,
    manualConfirm: true,
  },
  display: {
    enabled: true,
    position: 'below_last',
    collapsedModules: [],
    showNSFW: true,
    showEnigma: true,
    cardWidth: 280,
  },
  template: {
    nsfwMax: 20,
    echoesMax: 10,
    seedsMax: 5,
    plotMinLength: 150,
    plotMaxLength: 300,
  },
};
