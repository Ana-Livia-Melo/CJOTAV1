//---------------------------------------------------------------------------------- 
// PreloadScene.js 
//---------------------------------------------------------------------------------- 

import Phaser from 'phaser';

const phaseBackgroundMap = {
  1: { key: 'bg_phase1', path: '/assets/images/level1.png' },
  2: { key: 'bg_phase2', path: '/assets/images/level2.png' },
  3: { key: 'bg_phase3', path: '/assets/images/level3.png' }
};

// Soldier configs (soldados)
const soldierConfigs = {
  soldier1: {
    keyPrefix: 'soldier1',
    path: '/assets/images/spritesheets/soldier1/',
    files: {
      idle: 'idle.png', attack: 'attack.png', dead: 'dead.png', hurt: 'hurt.png',
      recharge: 'recharge.png', jump: 'jump.png', shot: 'shot.png', walk: 'walk.png'
    },
    frameSize: {
      idle: { frameWidth: 128, frameHeight: 128, frameCount: 7 },
      attack: { frameWidth: 128, frameHeight: 128, frameCount: 3 },
      dead: { frameWidth: 128, frameHeight: 128, frameCount: 4 },
      hurt: { frameWidth: 128, frameHeight: 128, frameCount: 3 },
      recharge: { frameWidth: 128, frameHeight: 128, frameCount: 13 },
      jump: { frameWidth: 128, frameHeight: 128, frameCount: 8 },
      shot: { frameWidth: 128, frameHeight: 128, frameCount: 4 },
      walk: { frameWidth: 128, frameHeight: 128, frameCount: 7 }
    }
  },
  soldier2: {
    keyPrefix: 'soldier2',
    path: '/assets/images/spritesheets/soldier2/',
    files: {
      idle: 'idle.png', attack: 'attack.png', dead: 'dead.png', hurt: 'hurt.png',
      recharge: 'recharge.png', jump: 'jump.png', shot: 'shot.png', walk: 'walk.png'
    },
    frameSize: {
      idle: { frameWidth: 128, frameHeight: 128, frameCount: 9 },
      attack: { frameWidth: 128, frameHeight: 128, frameCount: 4 },
      dead: { frameWidth: 128, frameHeight: 128, frameCount: 4 },
      hurt: { frameWidth: 128, frameHeight: 128, frameCount: 3 },
      recharge: { frameWidth: 128, frameHeight: 128, frameCount: 7 },
      jump: { frameWidth: 128, frameHeight: 128, frameCount: 8 },
      shot: { frameWidth: 128, frameHeight: 128, frameCount: 4 },
      walk: { frameWidth: 128, frameHeight: 128, frameCount: 8 }
    }
  }
};

// Enemy configs (zumbis)
const enemyConfigs = {
  zombie1: {
    keyPrefix: 'zombie1',
    path: '/assets/images/spritesheets/zombies/zombie1/',
    files: { attack: 'attack.png', dead: 'dead.png', hurt: 'hurt.png', idle: 'idle.png', walk: 'walk.png' },
    frameSize: { attack: { frameWidth:128,frameHeight:128,frameCount:4 }, dead: { frameWidth:128,frameHeight:128,frameCount:5 }, hurt:{frameWidth:128,frameHeight:128,frameCount:4}, idle:{frameWidth:128,frameHeight:128,frameCount:6}, walk:{frameWidth:128,frameHeight:128,frameCount:6} }
  },
  zombie2: {
    keyPrefix: 'zombie2',
    path: '/assets/images/spritesheets/zombies/zombie2/',
    files: { attack: 'attack.png', dead: 'dead.png', hurt: 'hurt.png', idle: 'idle.png', walk: 'walk.png' },
    frameSize: { attack:{frameWidth:128,frameHeight:128,frameCount:10}, dead:{frameWidth:128,frameHeight:128,frameCount:5}, hurt:{frameWidth:128,frameHeight:128,frameCount:4}, idle:{frameWidth:128,frameHeight:128,frameCount:7}, walk:{frameWidth:128,frameHeight:128,frameCount:12} }
  },
  zombie3: {
    keyPrefix: 'zombie3',
    path: '/assets/images/spritesheets/zombies/zombie3/',
    files: { attack:'attack.png', dead:'dead.png', eating:'eating.png', hurt:'hurt.png', idle:'idle.png', jump:'jump.png', run:'run.png', walk:'walk.png' },
    frameSize: { attack:{frameWidth:96,frameHeight:96,frameCount:4}, dead:{frameWidth:96,frameHeight:96,frameCount:5}, eating:{frameWidth:96,frameHeight:95,frameCount:11}, hurt:{frameWidth:96,frameHeight:96,frameCount:5}, idle:{frameWidth:96,frameHeight:96,frameCount:9}, jump:{frameWidth:96,frameHeight:96,frameCount:6}, run:{frameWidth:96,frameHeight:96,frameCount:8}, walk:{frameWidth:96,frameHeight:96,frameCount:10} }
  },
  zombie4: {
    keyPrefix: 'zombie4',
    path: '/assets/images/spritesheets/zombies/zombie4/',
    files: { attack:'attack.png', bite:'bite.png', dead:'dead.png', hurt:'hurt.png', idle:'idle.png', jump:'jump.png', run:'run.png', walk:'walk.png' },
    frameSize: { attack:{frameWidth:96,frameHeight:96,frameCount:5}, bite:{frameWidth:96,frameHeight:96,frameCount:11}, dead:{frameWidth:96,frameHeight:96,frameCount:5}, hurt:{frameWidth:96,frameHeight:96,frameCount:3}, idle:{frameWidth:96,frameHeight:96,frameCount:8}, jump:{frameWidth:96,frameHeight:96,frameCount:8}, run:{frameWidth:96,frameHeight:96,frameCount:7}, walk:{frameWidth:96,frameHeight:96,frameCount:8} }
  }
};

export default class PreloadScene extends Phaser.Scene {
  constructor() { super({ key: 'PreloadScene' }); }

  preload() {
    this.displayProgressBar();

    // exporta globalmente para GameScene
    try { window.phaseBackgroundMap = phaseBackgroundMap; } catch (e) {}
    try { window.soldierConfigs = soldierConfigs; } catch (e) {}
    try { window.enemyConfigs = enemyConfigs; } catch (e) {}

    // Carrega backgrounds
    Object.values(phaseBackgroundMap).forEach(bg => {
      if (bg && bg.key && bg.path) this.load.image(bg.key, bg.path);
    });

    // UI images
    this.load.image('menuBg', '/assets/images/menu.png');
    this.load.image('preSceneBg', '/assets/images/pre.png');
    this.load.image('victoryBg', '/assets/images/fim.png');

    // audio
    this.load.audio('zombieSound', '/assets/som/zombie.mp3');

    // Carrega soldier spritesheets
    Object.values(soldierConfigs).forEach((cfg) => {
      const base = cfg.path;
      const prefix = cfg.keyPrefix;
      Object.entries(cfg.files).forEach(([animName, filename]) => {
        const key = `${prefix}_${animName}`;
        const size = cfg.frameSize[animName] || {};
        const fw = size.frameWidth || 128;
        const fh = size.frameHeight || 128;
        this.load.spritesheet(key, base + filename, { frameWidth: fw, frameHeight: fh });
      });
    });

    // Carrega enemy spritesheets
    Object.values(enemyConfigs).forEach((cfg) => {
      const base = cfg.path;
      const prefix = cfg.keyPrefix;
      Object.entries(cfg.files).forEach(([animName, filename]) => {
        const key = `${prefix}_${animName}`;
        const size = cfg.frameSize[animName] || {};
        const fw = size.frameWidth || 96;
        const fh = size.frameHeight || 96;
        this.load.spritesheet(key, base + filename, { frameWidth: fw, frameHeight: fh });
      });
    });
  }

  create() {
    this.scene.start('MenuScene');
  }

  displayProgressBar() {
    const { width, height } = this.cameras.main;
    const progressBarBg = this.add.graphics(); progressBarBg.fillStyle(0x222222, 0.8);
    progressBarBg.fillRect(width / 4 - 2, height / 2 - 12, width / 2 + 4, 24);
    const progressBar = this.add.graphics();
    const loadingText = this.add.text(width / 2, height / 2 - 30, 'Loading...', { fontSize: '20px', fill: '#fff' }).setOrigin(0.5);
    this.load.on('progress', value => {
      progressBar.clear(); progressBar.fillStyle(0xffffff, 1); progressBar.fillRect(width / 4, height / 2 - 10, (width / 2) * value, 20);
    });
    this.load.on('complete', () => { progressBar.destroy(); progressBarBg.destroy(); loadingText.destroy(); });
  }
}
