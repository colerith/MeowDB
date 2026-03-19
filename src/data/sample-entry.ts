import type { MeowDBEntry } from '@/type/meowdb';

export const sampleEntry: MeowDBEntry = {
  serial: '🐾喵喵摘要-001',
  time: '2026-03-19 星期四 | 21:30 微雨',
  nsfw: {
    current: 3,
    max: 20,
    details: {
      intensity: 'low',
      note: 'debug-sample',
    },
  },
  scene: {
    main: '新婚公寓',
    sub: '客厅沙发区',
    stayRounds: 2,
    topic: '婚后第一夜的微醺对话',
  },
  plot: '婚礼结束后，角色们回到家中休息。氛围由热闹转向私密，主要互动集中在放松、回顾婚礼细节与确认彼此边界。',
  relations: [
    {
      name: '<user>',
      gender: '未知',
      genitalStatus: '未公开',
      identity: '主视角',
      personality: '稳重、克制',
      sexExp: 'Ghost(1)',
      coordinate: '客厅沙发左侧',
      clothing: '礼服外套半解，衬衫，长裤，袜，婚戒',
      action: '端着温水，侧身倾听',
      bond: '新婚伴侣的信任建立期',
      favor: 6.2,
      favorChange: '耐心倾听并主动照顾对方情绪',
    },
    {
      name: 'Ghost - 婚后',
      gender: '男',
      genitalStatus: '放松状态',
      identity: '伴侣',
      personality: '外冷内热，防御心较强',
      sexExp: '<user>(1)',
      coordinate: '客厅沙发右侧',
      clothing: '白衬衫，领带松开，西裤，内衣，耳饰，婚戒',
      action: '靠近并观察对方反应',
      bond: '由热恋转向长期承诺的磨合期',
      favor: 7.1,
      favorChange: '对方主动示弱并分享真实想法',
    },
  ],
  echoes: [
    {
      character: 'Ghost - 婚后',
      content: '周末一起整理婚礼相册并挑选装裱照片。',
    },
  ],
  archived: [
    {
      name: '婚礼主持人',
      location: '已离场',
      trigger: '查看婚礼录像时可再次提及',
    },
  ],
  enigmas: [
    {
      content: 'Ghost 对“家庭责任”的焦虑来源尚未完全公开',
      progress: 25,
      related: ['Ghost - 婚后', '<user>'],
    },
  ],
  seeds: [
    {
      type: 'soul',
      name: '誓词背后的真实愿望',
      bloom: 2,
      suspense: '谁先提出长期边界协商',
      driveLink: '信任与责任冲突',
    },
    {
      type: 'world',
      name: '婚后社交圈压力',
      bloom: 1,
      suspense: '外部关系会否影响二人相处节奏',
      driveLink: '家庭与社交期待',
    },
  ],
};
