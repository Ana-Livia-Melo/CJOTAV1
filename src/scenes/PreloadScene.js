// -----------------------------------------------------------------------------
// PreloadScene.js: configuração da cena responsável pelo carregamento dos
// objetos do jogo 
// -----------------------------------------------------------------------------

import Phaser from 'phaser';


export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    this.displayProgressBar();

    // ---------------------------------------------------------------------
    // Carrega backgrounds por fase
    // ---------------------------------------------------------------------
    Object.values(phaseBackgroundMap).forEach(bg => {
      this.load.image(bg.key, bg.path);
    });
    
    // imagem do menu
    this.load.image('menuBg', 'assets/images/menu.png');
    
    // imagem da tela antes da fase 
    this.load.image('preSceneBg', 'assets/images/pre.png');
    
    // imagem da tela de vitória 
    this.load.image('victoryBg', 'assets/images/fim.png');

    
  const soldierConfigs = {
  soldier1: {
    keyPrefix: 'soldier1',
    path: '/assets/images/spritesheets/soldier1/',
    files: {
      idle:     'idle.png',
      attack:   'attack.png',
      dead:     'dead.png',
      hurt:     'hurt.png',
      recharge: 'recharge.png',
      jump:      'jump.png',
      shot:     'shot.png',
      walk:     'walk.png'
    },
    frameSize: {
      idle:     { frameWidth: 128, frameHeight: 128, frameCount: 7 },
      attack:   { frameWidth: 128, frameHeight: 128, frameCount: 3 },
      dead:      { frameWidth: 128, frameHeight: 128, frameCount: 4 },
      hurt:     { frameWidth: 128, frameHeight: 128, frameCount: 3 },
      recharge: { frameWidth: 128, frameHeight: 128, frameCount: 13 },
      jump:      { frameWidth: 128, frameHeight: 128, frameCount: 8 },
      shot:     { frameWidth: 128, frameHeight: 128, frameCount: 4 },
      walk:     { frameWidth: 128, frameHeight: 128, frameCount: 7 }
    }
  },

  soldier2: {
    keyPrefix: 'soldier2',
    path: '/assets/images/spritesheets/soldier2/',
    files: {
      idle:     'idle.png',
      attack:   'attack.png',
      dead:     'dead.png',
      hurt:     'hurt.png',
      recharge: 'recharge.png',
      jump:      'jump.png',
      shot:     'shot.png',
      walk:     'walk.png'
    },
    frameSize: {
      idle:     { frameWidth: 128, frameHeight: 128, frameCount: 9 },
      attack:   { frameWidth: 128, frameHeight: 128, frameCount: 4 },
      dead:     { frameWidth: 128, frameHeight: 128, frameCount: 4 },
      hurt:     { frameWidth: 128, frameHeight: 128, frameCount: 3 },
      recharge: { frameWidth: 128, frameHeight: 128, frameCount: 7 },
      jump:      { frameWidth: 128, frameHeight: 128, frameCount: 8 },
      shot:     { frameWidth: 128, frameHeight: 128, frameCount: 4 },
      walk:     { frameWidth: 128, frameHeight: 128, frameCount: 8 }
    }
  },

};

// Enemy configs (zumbis)
const enemyConfigs = {
  zombie1: {
    keyPrefix: 'zombie1',
    path: '/assets/images/spritesheets/zombies/zombie1/',
    files: {
      attack: 'attack.png',
      dead:   'dead.png',
      hurt:   'hurt.png',
      idle:   'idle.png',
      walk:   'walk.png' 
    },
    frameSize: {
      attack: { frameWidth: 128, frameHeight: 128, frameCount: 4 }, 
      dead:   { frameWidth: 128, frameHeight: 128, frameCount: 5 }, 
      hurt:   { frameWidth: 128, frameHeight: 128, frameCount: 4 }, 
      idle:   { frameWidth: 128, frameHeight: 128, frameCount: 6 }, 
      walk:   { frameWidth: 128, frameHeight: 128, frameCount: 6 }  
    }
  },

  zombie2: {
    keyPrefix: 'zombie2',
    path: '/assets/images/spritesheets/zombies/zombie2/',
    files: {
      attack: 'attack.png',
      dead:   'dead.png',
      hurt:   'hurt.png',
      idle:   'idle.png',
      walk:   'walk.png'
    },
    frameSize: {
      attack: { frameWidth: 128, frameHeight: 128, frameCount: 10 }, 
      dead:   { frameWidth: 128, frameHeight: 128, frameCount: 5 },  
      hurt:   { frameWidth: 128, frameHeight: 128, frameCount: 4 },  
      idle:   { frameWidth: 128, frameHeight: 128, frameCount: 7 },  
      walk:   { frameWidth: 128, frameHeight: 128, frameCount: 12 }
    }
  },

  zombie3: {
    keyPrefix: 'zombie3',
    path: '/assets/images/spritesheets/zombies/zombie3/',
    files: {
      attack: 'attack.png',
      dead:   'dead.png',
      eating: 'eating.png',
      hurt:   'hurt.png',
      idle:   'idle.png',
      jump:   'jump.png',
      run:    'run.png',
      walk:   'walk.png'
    },
    frameSize: {
      attack: { frameWidth: 96, frameHeight: 96, frameCount: 4 },    
      dead:   { frameWidth: 96, frameHeight: 96, frameCount: 5 },    
      eating: { frameWidth: 96, frameHeight: 95, frameCount: 11 },   
      hurt:   { frameWidth: 96, frameHeight: 96, frameCount: 5 },    
      idle:   { frameWidth: 96, frameHeight: 96, frameCount: 9 },    
      jump:   { frameWidth: 96, frameHeight: 96, frameCount: 6 },    
      run:    { frameWidth: 96, frameHeight: 96, frameCount: 8 },    
      walk:   { frameWidth: 96, frameHeight: 96, frameCount: 10 }    
    }
  },

  zombie4: {
    keyPrefix: 'zombie4',
    path: '/assets/images/spritesheets/zombies/zombie4/',
    files: {
      attack: 'attack.png',
      bite:   'bite.png',
      dead:   'dead.png',
      hurt:   'hurt.png',
      idle:   'idle.png',
      jump:   'jump.png',
      run:    'run.png',
      walk:   'walk.png'
    },
    frameSize: {
      attack: { frameWidth: 96, frameHeight: 96, frameCount: 5 },   
      bite:   { frameWidth: 96, frameHeight: 96, frameCount: 11 },  
      dead:   { frameWidth: 96, frameHeight: 96, frameCount: 5 },   
      hurt:   { frameWidth: 96, frameHeight: 96, frameCount: 3 },   
      idle:   { frameWidth: 96, frameHeight: 96, frameCount: 8 },   
      jump:   { frameWidth: 96, frameHeight: 96, frameCount: 8 },   
      run:    { frameWidth: 96, frameHeight: 96, frameCount: 7 },   
      walk:   { frameWidth: 96, frameHeight: 96, frameCount: 8 }    
    }
  }
};

   // BACKGROUNDS POR FASE
   const phaseBackgroundMap = {
    1: { key: 'bg_phase1', path: '/assets/images/level1.png' },
    2: { key: 'bg_phase2', path: '/assets/images/level2.png' },
    3: { key: 'bg_phase3', path: '/assets/images/level3.png' }
  };

    // ---------------------------------------------------------------------
    // Sons
    // ---------------------------------------------------------------------
    this.load.audio('zombieSound', 'assets/som/zombie.mp3');

    // ---------------------------------------------------------------------
    // Carrega soldados automaticamente a partir de soldierConfigs
    // ---------------------------------------------------------------------
    Object.values(soldierConfigs).forEach((cfg) => {
      const base = cfg.path;
      const prefix = cfg.keyPrefix;

      Object.entries(cfg.files).forEach(([animName, filename]) => {
        const key = `${prefix}_${animName}`; 
        const size = cfg.frameSize[animName] || {};
        // Verificação simples: se width/height forem zero, loga aviso
        if (!size.frameWidth || !size.frameHeight || !size.frameCount) {
          console.warn(`[PreloadScene] frameSize não preenchido para ${key}. Atualize soldierConfigs.`);
        }
        this.load.spritesheet(key, base + filename, {
          frameWidth: size.frameWidth || 1,
          frameHeight: size.frameHeight || 1
        });
      });
    });

    // ---------------------------------------------------------------------
    // Carrega zumbis automaticamente a partir de enemyConfigs
    // ---------------------------------------------------------------------
    Object.values(enemyConfigs).forEach((cfg) => {
      const base = cfg.path;
      const prefix = cfg.keyPrefix;

      Object.entries(cfg.files).forEach(([animName, filename]) => {
        const key = `${prefix}_${animName}`; 
        const size = cfg.frameSize[animName] || {};
        if (!size.frameWidth || !size.frameHeight || !size.frameCount) {
          console.warn(`[PreloadScene] frameSize não preenchido para ${key}. Atualize enemyConfigs.`);
        }
        this.load.spritesheet(key, base + filename, {
          frameWidth: size.frameWidth || 1,
          frameHeight: size.frameHeight || 1
        });
      });
    });

  }

  create() {
    // Vai para o menu 
    this.scene.start('MenuScene');
  }

  // ---------------------------------------------------------------------------
  // Barra de progresso padrão
  // ---------------------------------------------------------------------------
  displayProgressBar() {
    const { width, height } = this.cameras.main;

    const progressBarBg = this.add.graphics();
    progressBarBg.fillStyle(0x222222, 0.8);
    progressBarBg.fillRect(width / 4 - 2, height / 2 - 12, width / 2 + 4, 24);

    const progressBar = this.add.graphics();

    const loadingText = this.add.text(width / 2, height / 2 - 30, 'Loading...', {
      fontSize: '20px',
      fill: '#fff'
    }).setOrigin(0.5);

    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 4, height / 2 - 10, (width / 2) * value, 20);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBarBg.destroy();
      loadingText.destroy();
    });
  }
}





