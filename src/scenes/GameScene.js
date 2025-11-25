// -----------------------------------------------------------------------------
// GameScene.js 
// -----------------------------------------------------------------------------

import Phaser from 'phaser';


// Classe da cena do jogo 
export default class GameScene extends Phaser.Scene {
  constructor(config) {
    super({ key: 'GameScene' });
    this.config = config || { width: 1280, height: 720 };

    this.isShooting = false;
    this.isDead = false;
    this.currentBgm = null;
  }

  init(data = {}) {
    console.log('GameScene iniciando...');

    this.fase = data.fase ?? 1;

    // Mapeamento: fase1 -> soldier1, fase2 -> soldier2, fase3 -> soldier2
    const faseToSoldier = { 1: 'soldier1', 2: 'soldier2', 3: 'soldier2' };
    this.soldierKey = data.soldierKey ?? faseToSoldier[this.fase] ?? 'soldier1';

    this.zombiesParaPassar = { 1: 10, 2: 15, 3: 20 };
    this.zombiesMortos = 0;
    this.zombiesNecessarios = this.zombiesParaPassar[this.fase] || 10;

    this.zombiesPorFase = {
      1: ['zombie1'],
      2: ['zombie1', 'zombie2'],
      3: ['zombie1', 'zombie2', 'zombie3', 'zombie4']
    };

    this.maxBullets = 10;
    this.currentBullets = this.maxBullets;
    this.isReloading = false;
    this.reloadTime = 2000;

    this.playerMaxHealth = 10;
    this.jumpsAvailable = 2;

    this.isDead = false;

    this.soldierConfig = soldierConfigs[this.soldierKey] || soldierConfigs['soldier1'];

    console.log(`Fase ${this.fase}, Soldier: ${this.soldierKey}, Zumbis necessários: ${this.zombiesNecessarios}`);
  }

  create() {
    const { width, height } = this.scale;
    console.log('GameScene create() executado');

    // Background
    const bgKey = `bg_phase${this.fase}`;
    if (this.textures.exists(bgKey)) {
      this.add.image(width / 2, height / 2, bgKey).setDisplaySize(width, height).setDepth(0);
      console.log(`Background ${bgKey} carregado`);
    } else {
      this.add.rectangle(width / 2, height / 2, width, height, 0x2c3e50);
    }

    // Tocar BGM (zombieSound)
    try {
      if (this.cache.audio.exists('zombieSound')) {
        this.currentBgm = this.sound.add('zombieSound', { loop: true, volume: 0.45 });
        if (this.sound.context && this.sound.context.state === 'suspended') {
          this.sound.context.resume().then(() => { try { this.currentBgm.play(); } catch (e) {} });
        } else {
          this.currentBgm.play();
        }
      } else {
        console.warn('[GameScene] zombieSound não encontrado no cache.');
      }
    } catch (e) {
      console.warn('[GameScene] erro ao iniciar zombieSound:', e);
    }

    // Posição
    this.playerBaseY = height * 0.66 + 20;
    this.enemyBaseY = height * 0.66;

    // Grupos de física
    this.bullets = this.physics.add.group({ classType: Phaser.Physics.Arcade.Sprite, runChildUpdate: true });
    this.zombies = this.physics.add.group({ classType: Phaser.Physics.Arcade.Sprite, runChildUpdate: true });

    // Ground (invisível mas com colisão)
    this.ground = this.add.rectangle(width / 2, height * 0.66 + 100, width, 20, 0x00ff00, 0.3).setVisible(false);
    this.physics.add.existing(this.ground, true);

    // Criar animações primeiro 
    this.createAllAnimations();

    // Cria player
    this.createPlayer();

    // Spawn inicial baseado na fase
    this.spawnZumbisIniciais();

    // Colisões
    this.physics.add.overlap(this.bullets, this.zombies, this.onBulletHitZombie, null, this);
    this.physics.add.overlap(this.player, this.zombies, this.onPlayerHit, null, this);

    // Input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    // HUD
    this.playerHealth = this.playerMaxHealth;
    this.createHealthDisplay();
    this.createScoreDisplay();
    this.createAmmoDisplay();

    // Timer para spawn contínuo de zumbis
    this.setupZombieSpawning();

    console.log(`Jogo pronto! Mate ${this.zombiesNecessarios} zumbis para vencer!`);
    console.log(`Fase ${this.fase}: Zumbis precisam de ${this.fase === 3 ? '2' : '1-2'} tiros para morrer`);
  }

  // HUD
  createHealthDisplay() {
    const heartSize = 32; const spacing = 8; const startX = 30; const startY = 30;
    this.hearts = [];
    for (let i = 0; i < this.playerMaxHealth; i++) {
      const heart = this.add.text(startX + i * (heartSize + spacing), startY, '❤️', { fontSize: `${heartSize}px`, stroke: '#000000', strokeThickness: 3 });
      this.hearts.push(heart);
    }
    this.updateHealthDisplay();
  }

  updateHealthDisplay() {
    for (let i = 0; i < this.playerMaxHealth; i++) {
      if (i < this.playerHealth) this.hearts[i].setText('❤️').setTint(0xff0000);
      else this.hearts[i].setText('💔').setTint(0x666666);
    }
  }

  createScoreDisplay() {
    const { width } = this.scale;
    this.scoreBackground = this.add.rectangle(width - 150, 50, 280, 80, 0x000000, 0.7).setStrokeStyle(3, 0x00ff00).setOrigin(0.5, 0);
    this.add.text(width - 240, 35, '🧟', { fontSize: '32px' });
    this.scoreText = this.add.text(width - 150, 30, `${this.zombiesMortos} / ${this.zombiesNecessarios}`, { fontSize: '28px', color: '#00ff00', fontStyle: 'bold', stroke: '#000000', strokeThickness: 4 }).setOrigin(0.5, 0);
    this.add.text(width - 150, 65, 'ELIMINADOS', { fontSize: '16px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5, 0);
    this.faseText = this.add.text(width - 20, 20, `FASE ${this.fase}`, { fontSize: '24px', color: '#ffff00', fontStyle: 'bold', stroke: '#000000', strokeThickness: 3 }).setOrigin(1, 0);
  }

  // Sistema de Munição
  createAmmoDisplay() {
    const { width } = this.scale;
    
    // Container principal
    this.ammoContainer = this.add.container(150, 120);
    
    // Fundo sutil
    const bg = this.add.rectangle(0, 0, 200, 50, 0x000000, 0.6)
      .setStrokeStyle(1, 0x444444);
    
    // Texto de munição
    this.ammoText = this.add.text(0, -8, `BALAS: ${this.currentBullets}/${this.maxBullets}`, {
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0);
    
    // Barra de recarga 
    this.reloadBarBg = this.add.rectangle(0, 10, 160, 6, 0x333333)
      .setStrokeStyle(1, 0x555555)
      .setVisible(false);
    
    this.reloadBar = this.add.rectangle(-80, 10, 0, 4, 0xffff00)
      .setVisible(false);
    
    // Texto de instrução
    const reloadText = this.add.text(0, 10, 'R - RECARREGAR', {
      fontSize: '10px',
      color: '#aaaaaa'
    }).setOrigin(0.5, 0);
    
    this.ammoContainer.add([bg, this.ammoText, this.reloadBarBg, this.reloadBar, reloadText]);
    this.updateAmmoDisplay();
  }

  updateAmmoDisplay() {
    this.ammoText.setText(`BALAS: ${this.currentBullets}/${this.maxBullets}`);
    
    // Muda cor baseada na munição
    if (this.currentBullets === 0) {
      this.ammoText.setColor('#ff4444');
    } else if (this.currentBullets <= 2) {
      this.ammoText.setColor('#ffaa00');
    } else {
      this.ammoText.setColor('#ffffff');
    }
    
    // Mostra/Esconde barra de recarga
    this.reloadBar.setVisible(this.isReloading);
    this.reloadBarBg.setVisible(this.isReloading);
  }

  updateScore() {
    this.scoreText.setText(`${this.zombiesMortos} / ${this.zombiesNecessarios}`);
    if (this.zombiesMortos >= this.zombiesNecessarios) { 
      this.scoreText.setColor('#ffff00'); 
      this.onLevelComplete(); 
    }
    else if (this.zombiesMortos >= this.zombiesNecessarios * 0.8) this.scoreText.setColor('#ff9900');
    else this.scoreText.setColor('#00ff00');
  }

  // Barras de Vida dos Zumbis
  createZombieHealthBar(zombie) {
   
    if (this.fase !== 3 && (!enemyConfigs[zombie.type] || enemyConfigs[zombie.type].hp <= 1)) {
      return null;
    }
    
    // Container 
    const healthBarContainer = this.add.container(zombie.x, zombie.y - 60);
    healthBarContainer.setDepth(1000);
    
    // Fundo da barra 
    const bg = this.add.rectangle(0, 0, 50, 4, 0x000000, 0.8)
      .setStrokeStyle(1, 0x333333);
    
    // Barra de vida principal
    const healthBar = this.add.rectangle(-25, 0, 50, 3, 0xff5555);
    
    healthBarContainer.add([bg, healthBar]);
    
    // Armazena referências no zumbi
    zombie.healthBar = healthBar;
    zombie.healthBarContainer = healthBarContainer;
    zombie.maxHealth = zombie.currentHealth; // Usa currentHealth que já foi definido
    zombie.currentHealth = zombie.currentHealth; // Mantém o valor atual
    
    return healthBarContainer;
  }

  updateZombieHealthBar(zombie) {
    if (!zombie.healthBar || !zombie.healthBarContainer) return;
    
    // Atualiza posição para seguir o zumbi
    zombie.healthBarContainer.setPosition(zombie.x, zombie.y - 60);
    
    // Atualiza largura da barra
    const healthPercent = zombie.currentHealth / zombie.maxHealth;
    zombie.healthBar.width = 50 * healthPercent;
    zombie.healthBar.x = -25 + (zombie.healthBar.width / 2);
    
    // Muda cor baseada na vida - cores mais sutis
    if (healthPercent > 0.6) {
      zombie.healthBar.setFillStyle(0xff5555); 
    } else if (healthPercent > 0.3) {
      zombie.healthBar.setFillStyle(0xffaa00);
    } else {
      zombie.healthBar.setFillStyle(0xffff00); 
    }
  }

  destroyZombieHealthBar(zombie) {
    if (zombie.healthBarContainer) {
      zombie.healthBarContainer.destroy();
      zombie.healthBar = null;
      zombie.healthBarContainer = null;
    }
  }

  // Spawn helpers
  spawnZumbisIniciais() {
    const spawnConfig = {
      1: { count: 2, types: ['zombie1'] },
      2: { count: 3, types: ['zombie1', 'zombie2'] },
      3: { count: 5, types: ['zombie1', 'zombie2', 'zombie3', 'zombie4'] }
    };
    const config = spawnConfig[this.fase] || spawnConfig[1];
    this.spawnZombies(config.count, config.types);
  }

  setupZombieSpawning() {
    this.zombieSpawnTimer = this.time.addEvent({ delay: 3500, callback: this.spawnRandomZombie, callbackScope: this, loop: true });
  }

  spawnRandomZombie() {
    const { width } = this.scale;
    if (this.zombiesMortos >= this.zombiesNecessarios) return;
    const maxZumbis = { 1: 4, 2: 5, 3: 8 };
    const maxAtual = maxZumbis[this.fase] || 4;
    if (this.zombies.getChildren().filter(z => z.active).length >= maxAtual) return;

    const spawnLeft = Phaser.Math.Between(0, 1) === 0;
    const x = spawnLeft ? Phaser.Math.Between(50, 200) : Phaser.Math.Between(width - 200, width - 50);
    const tiposDisponiveis = this.zombiesPorFase[this.fase] || ['zombie1'];
    const type = tiposDisponiveis[Phaser.Math.Between(0, tiposDisponiveis.length - 1)];

    this.createZombie(type, x, this.enemyBaseY);
  }

  // Animations
  createAllAnimations() {
    Object.entries(this.soldierConfig.animFiles).forEach(([animName, animData]) => {
      const animKey = `${this.soldierKey}_${animName}`;
      this.createAnimation(animKey, animData);
    });

    Object.values(enemyConfigs).forEach(zombieConfig => {
      Object.entries(zombieConfig.animFiles).forEach(([animName, animData]) => {
        const animKey = `${zombieConfig.keyPrefix}_${animName}`;
        this.createAnimation(animKey, animData);
      });
    });
  }

  createAnimation(animKey, animData) {
    if (!this.textures.exists(animData.key)) {
      return;
    }
    if (this.anims.exists(animKey)) return;

    try {
      const texture = this.textures.get(animData.key);
      let availableFrames = 0;
      if (texture && texture.frames) availableFrames = Object.keys(texture.frames).filter(k => k !== '__BASE').length;
      if (!availableFrames || availableFrames <= 0) availableFrames = animData.frameCount || 1;

      const declaredFrames = Math.max(1, animData.frameCount || 1);
      const endFrame = Math.min(declaredFrames - 1, availableFrames - 1);

      let frameRate = 8; let repeat = -1;
      if (animKey.includes('attack')) frameRate = 10;
      else if (animKey.includes('walk')) frameRate = 6;
      else if (animKey.includes('idle')) frameRate = 4;

      if (animKey.includes('_recharge') || animKey.includes('_shot') || animKey.includes('_dead')) {
        frameRate = animKey.includes('_recharge') ? 12 : frameRate;
        repeat = 0;
      }

      this.anims.create({ key: animKey, frames: this.anims.generateFrameNumbers(animData.key, { start: 0, end: endFrame }), 
      frameRate: frameRate, repeat: repeat });
    } catch (error) {
      console.error(`Erro ao criar animação ${animKey}:`, error);
    }
  }

  // Update 
  update(time) {
    if (!this.player) return;

    const moveLeft = this.keyA.isDown || this.cursors.left.isDown;
    const moveRight = this.keyD.isDown || this.cursors.right.isDown;
    const jump = Phaser.Input.Keyboard.JustDown(this.keyW) || Phaser.Input.Keyboard.JustDown(this.cursors.up);
    const shoot = Phaser.Input.Keyboard.JustDown(this.keySpace);
    const reload = Phaser.Input.Keyboard.JustDown(this.keyR);

    if (reload && !this.isReloading && this.currentBullets < this.maxBullets) { 
      this.startReload(); 
      return; 
    }

    if (this.isReloading) { 
      if (this.player) this.player.setVelocityX(0); 
      
      // Atualiza barra de recarga
      if (this.reloadStartTime) {
        const elapsed = time - this.reloadStartTime;
        const progress = Math.min(elapsed / this.reloadTime, 1);
        this.reloadBar.width = 160 * progress;
        
        if (progress >= 1) {
          this.reloadStartTime = null;
        }
      }
      return; 
    }

    const isShooting = !!this.isShooting;
    const baseSpeed = 140;
    const currentSpeed = isShooting ? baseSpeed * 0.5 : baseSpeed;

    if (moveLeft) {
      this.player.setVelocityX(-currentSpeed); this.player.setFlipX(true);
      const walkKey = `${this.soldierKey}_walk`;
      if (this.anims.exists(walkKey) && !isShooting) this.player.play(walkKey, true);
    } else if (moveRight) {
      this.player.setVelocityX(currentSpeed); this.player.setFlipX(false);
      const walkKey = `${this.soldierKey}_walk`;
      if (this.anims.exists(walkKey) && !isShooting) this.player.play(walkKey, true);
    } else {
      this.player.setVelocityX(0);
      const idleKey = `${this.soldierKey}_idle`;
      if (this.anims.exists(idleKey) && !isShooting) this.player.play(idleKey, true);
    }

    if (jump && this.jumpsAvailable > 0 && !this.isReloading) {
      this.player.setVelocityY(-400); this.jumpsAvailable--;
      const jumpKey = `${this.soldierKey}_jump`; if (this.anims.exists(jumpKey)) this.player.play(jumpKey, true);
    }

    if (this.player.body.onFloor() && this.jumpsAvailable < 2) { this.jumpsAvailable = 2; }

    if (shoot && !this.isReloading && this.currentBullets > 0) this.shootBullet();
    else if (shoot && this.currentBullets === 0 && !this.isReloading) {
      this.player.setTint(0xff0000);
      this.time.delayedCall(200, () => { this.player.clearTint(); });
    }

    // Zumbis
    this.zombies.getChildren().forEach((zombie) => {
      if (!zombie || !zombie.active || !zombie.body) return;
      
      // Atualiza barra de vida dos zumbis
      this.updateZombieHealthBar(zombie);
      
      const cfg = enemyConfigs[zombie.type] || {};
      const distanceToPlayer = Phaser.Math.Distance.Between(zombie.x, zombie.y, this.player.x, this.player.y);

      if (distanceToPlayer <= (cfg.attackRange || 80)) {
        zombie.setVelocityX(0);
        const attackKey = `${zombie.type}_attack`;
        if (this.anims.exists(attackKey) && (!zombie.anims.isPlaying || zombie.anims.currentAnim?.key !== attackKey)) zombie.play(attackKey, true);
        if (!zombie.lastAttackTime || time - zombie.lastAttackTime > (cfg.attackCooldown || 1000)) { zombie.lastAttackTime = time; this.handleZombieAttack(zombie); }
      } else {
        const direction = this.player.x > zombie.x ? 1 : -1;
        zombie.setVelocityX(cfg.speed * direction);
        zombie.setFlipX(direction < 0);
        const walkKey = `${zombie.type}_walk`;
        const idleKey = `${zombie.type}_idle`;
        if (Math.abs(zombie.body.velocity.x) > 10) {
          if (this.anims.exists(walkKey) && (!zombie.anims.isPlaying || zombie.anims.currentAnim?.key !== walkKey)) zombie.play(walkKey, true);
        } else {
          if (this.anims.exists(idleKey) && (!zombie.anims.isPlaying || zombie.anims.currentAnim?.key !== idleKey)) zombie.play(idleKey, true);
        }
      }
    });
  }

  startReload() {
    this.isReloading = true;
    this.reloadStartTime = this.time.now;
    this.ammoText.setText('RECARREGANDO');
    this.ammoText.setColor('#ffaa00');

    if (this.player) this.player.setVelocityX(0);

    const rechargeKey = `${this.soldierKey}_recharge`;
    if (this.anims.exists(rechargeKey)) {
      this.player.play(rechargeKey);
      this.player.once('animationcomplete', (anim) => {
        if (anim && anim.key === rechargeKey && this.player.active) {
          const idleKey = `${this.soldierKey}_idle`; if (this.anims.exists(idleKey)) this.player.play(idleKey, true);
        }
      });
    } else {
      const idleKey = `${this.soldierKey}_idle`; if (this.anims.exists(idleKey)) this.player.play(idleKey, true);
    }

    this.time.delayedCall(this.reloadTime, () => {
      this.currentBullets = this.maxBullets; 
      this.isReloading = false; 
      this.reloadStartTime = null;
      this.updateAmmoDisplay();
    });
  }

  shootBullet() {
    if (this._lastShot && this.time.now - this._lastShot < 400) return;
    this._lastShot = this.time.now;

    this.currentBullets--; 
    this.updateAmmoDisplay();

    const bx = this.player.flipX ? this.player.x - 40 : this.player.x + 40;
    const by = this.player.y - 10;
    const vel = this.player.flipX ? -800 : 800;

    const bullet = this.bullets.create(bx, by, null);
    bullet.setDisplaySize(10, 5); 
    bullet.setTint(0xffff00); 
    bullet.setVelocityX(vel); 
    bullet.body.allowGravity = false;
    bullet.setCollideWorldBounds(true); 
    bullet.body.onWorldBounds = true;

    this.time.delayedCall(1500, () => { if (bullet.active) bullet.destroy(); });

    const shotKey = `${this.soldierKey}_shot`; 
    const idleKey = `${this.soldierKey}_idle`;
    if (this.anims.exists(shotKey)) {
      this.isShooting = true; 
      this.player.play(shotKey);
      this.player.once('animationcomplete', (anim) => {
        if (anim && anim.key === shotKey && this.player.active) {
          this.isShooting = false; 
          if (this.anims.exists(idleKey)) this.player.play(idleKey, true);
        }
      });
    }

  }

  async onBulletHitZombie(bullet, zombie) {
    if (!bullet.active || !zombie.active) return;
    bullet.destroy();

    // Na fase 3, todos os zumbis levam 2 tiros
    if (this.fase === 3) {
      zombie.currentHealth -= 1;
      
      // Toca animação de hurt 
      const hurtKey = `${zombie.type}_hurt`;
      if (this.anims.exists(hurtKey)) {
        zombie.play(hurtKey, true);
      }
      
      // Aplica efeito visual de dano
      zombie.setTint(0xff0000);
      this.time.delayedCall(100, () => { zombie.clearTint(); });
      
      // Verifica se o zumbi ainda está vivo
      if (zombie.currentHealth > 0) {
        console.log(`Zumbi atingido! Vida restante: ${zombie.currentHealth}/3`);
        return; // Zumbi ainda vivo, não incrementa contador
      }
    }

    // Remove barra de vida do zumbi
    this.destroyZombieHealthBar(zombie);

    // Desativa física e movimento do zumbi
    zombie.setActive(false);
    zombie.body.enable = false;
    zombie.setVelocity(0, 0);

    const zombieType = zombie.type;
    const cfg = enemyConfigs[zombieType];
    
    if (cfg && cfg.animFiles && cfg.animFiles.dead) {
      const animData = cfg.animFiles.dead;
      const animKey = `${zombieType}_dead`;
      const prefix = cfg.keyPrefix || zombieType;
      const path = `/assets/images/spritesheets/${prefix}/dead.png`;

      // spritesheet carregado corretamente
      await this.ensureSpritesheetLoaded(animData.key, { 
        path, 
        frameWidth: animData.frameWidth, 
        frameHeight: animData.frameHeight, 
        expectedFrames: animData.frameCount 
      });
      if (!this.anims.exists(animKey)) {
        this.createAnimation(animKey, animData);
      }
      if (this.anims.exists(animKey) && this.textures.exists(animData.key)) {
        zombie.setVisible(false);
        
        // Toca animação de morte no sprite visual
        deathSprite.play(animKey);

        // Espera a animação terminar antes de destruir tudo
        deathSprite.once('animationcomplete', () => {
          try {
            deathSprite.destroy();
            zombie.destroy();
            this.zombiesMortos++;
            this.updateScore();
          } catch (e) {
            console.warn('Erro ao destruir sprites de morte:', e);
          }
        });

        // Safety timeout
        this.time.delayedCall(3000, () => {
          if (deathSprite.active) {
            try { deathSprite.destroy(); } catch (e) {}
          }
          if (zombie.active) {
            try { zombie.destroy(); } catch (e) {}
          }
          this.zombiesMortos++;
          this.updateScore();
        });

      } else {
        // Fallback: comportamento original
        this.zombiesMortos++;
        this.updateScore();
        zombie.setVisible(false);
        this.tweens.add({ 
          targets: zombie, 
          alpha: 0, 
          scaleX: 1.5, 
          scaleY: 1.5, 
          duration: 300, 
          onComplete: () => { 
            if (zombie) zombie.destroy(); 
          } 
        });
      }
    } 
  }

  onPlayerHit(player, zombie) {
    
  }

  handleZombieAttack(zombie) {
    if (this.isDead) return;

    const distanceToPlayer = Phaser.Math.Distance.Between(zombie.x, zombie.y, this.player.x, this.player.y);
    const attackRange = enemyConfigs[zombie.type]?.attackRange || 80;

    if (distanceToPlayer <= attackRange) {
      if (this._playerHitCooldown && this.time.now - this._playerHitCooldown < 800) return;
      this._playerHitCooldown = this.time.now;

      this.playerHealth -= zombie.damage ?? 1;
      this.playerHealth = Math.max(0, this.playerHealth);
      this.updateHealthDisplay();

      const hurtKey = `${this.soldierKey}_hurt`;
      if (this.anims.exists(hurtKey)) this.player.play(hurtKey, true);

      this.player.setTint(0xff0000);
      this.time.delayedCall(200, () => { this.player.clearTint(); });

      console.log(`Zumbi atacou! Vidas: ${this.playerHealth}`);

      if (this.playerHealth <= 0 && !this.isDead) {
        this.isDead = true;
        this.onPlayerDeath();
      }
    }
  }

  // onPlayerDeath: usa sprite visual separado 
  async onPlayerDeath() {
    // trava controles e física do player
    if (this.player) {
      this.player.setVelocity(0, 0);
      if (this.player.body) this.player.body.enable = false;
    }

    // desabilitar inputs
    if (this.keyA) this.keyA.enabled = false;
    if (this.keyD) this.keyD.enabled = false;
    if (this.keyW) this.keyW.enabled = false;
    if (this.keySpace) this.keySpace.enabled = false;
    if (this.keyR) this.keyR.enabled = false;

    const animData = this.soldierConfig?.animFiles?.dead;
    const animKey = `${this.soldierKey}_dead`;

    if (animData) {
      const prefix = this.soldierConfig.keyPrefix || this.soldierKey;
      const path = `/assets/images/spritesheets/${prefix}/dead.png`;

      // Garante que o spritesheet esteja carregado corretamente
      await this.ensureSpritesheetLoaded(animData.key, { path, frameWidth: animData.frameWidth, frameHeight: animData.frameHeight, expectedFrames: animData.frameCount });

      // (Re)cria animação se necessário
      if (!this.anims.exists(animKey)) this.createAnimation(animKey, animData);
    }

    // Se a animação existe: cria sprite visual independente para tocar a animação
    if (animData && this.anims.exists(animKey) && this.textures.exists(animData.key)) {
      // Esconde o player físico (mantém o body desabilitado)
      if (this.player) this.player.setVisible(false);

      // ajusta origin para ficar alinhado com player (usa defaults do player se existirem)
      deathSprite.setOrigin((this.player && this.player.originX) || 0.5, (this.player && this.player.originY) || 0.5);

      // Toca animação de morte no sprite visual
      deathSprite.play(animKey);

      // Para caso BGM esteja tocando
      if (this.currentBgm && this.currentBgm.isPlaying) {
        try { this.currentBgm.stop(); } catch (e) { /* noop */ }
      }

  
      // Espera a animação terminar 
      let completed = false;
      const onComplete = () => {
        completed = true;
        try { deathSprite.off('animationcomplete', onComplete); } catch (e) {}
        try { deathSprite.destroy(); } catch (e) {}
        this.showGameOverAndReturnToMenu();
      };
      deathSprite.once('animationcomplete', onComplete);

      // Safety timeout: se algo falhar, continua após 5s
      this.time.delayedCall(5000, () => {
        if (!completed) {
          try { deathSprite.off('animationcomplete', onComplete); } catch (e) {}
          try { deathSprite.destroy(); } catch (e) {}
          this.showGameOverAndReturnToMenu();
        }
      });

    } else {
      // fallback: não há animação; apenas tint e seguir
      if (this.player) {
        this.player.setVisible(true);
        this.player.setTint(0x666666);
      }
      if (this.currentBgm && this.currentBgm.isPlaying) {
        try { this.currentBgm.stop(); } catch (e) { /* noop */ }
      }
      if (this.cache.audio.exists('player_hit')) {
        try { this.sound.play('player_hit'); } catch (e) {}
      }
      this.time.delayedCall(400, () => { this.showGameOverAndReturnToMenu(); });
    }
  }

  // Helper: mostra o texto "VOCÊ PERDEU" e volta ao menu
  showGameOverAndReturnToMenu() {
    if (this.zombieSpawnTimer) {
      try { this.zombieSpawnTimer.remove(); } catch (e) {}
    }

    const { width, height } = this.scale;
    const lostText = this.add.text(width / 2, height / 2, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    this.tweens.add({
      targets: lostText,
      alpha: { from: 0, to: 1 },
      duration: 500
    });

    this.time.delayedCall(2500, () => {
      this.scene.start('MenuScene');
    });
  }

  createPlayer() {
    const { width } = this.scale;
    const idleTextureKey = this.soldierConfig.animFiles.idle.key;

    if (!this.textures.exists(idleTextureKey)) {
      this.player = this.physics.add.sprite(width / 2, this.playerBaseY, null);
      this.player.setDisplaySize(60, 80);
      this.player.setTint(0x00ff00);
    } else {
      this.player = this.physics.add.sprite(width / 2, this.playerBaseY, idleTextureKey, 0);
      this.player.setScale(this.soldierConfig.scale ?? 2);
    }

    this.player.setCollideWorldBounds(true);
    this.player.body.setGravityY(500);
    this.player.body.setSize(30, 50).setOffset(20, 15);

    const idleKey = `${this.soldierKey}_idle`;
    if (this.anims.exists(idleKey)) this.player.play(idleKey, true);

    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.zombies, this.ground);
  }

  createZombie(type, x, y) {
    const cfg = enemyConfigs[type];
    if (!cfg) return null;

    let textureKey = cfg.animFiles.idle?.key || cfg.animFiles.walk?.key || cfg.animFiles.attack?.key;

    if (!textureKey || !this.textures.exists(textureKey)) {
      const zombie = this.physics.add.sprite(x, y, null);
      zombie.setDisplaySize(60, 80);
      zombie.setTint(0xff0000);
      zombie.type = type;
      
      // NA FASE 3: Todos os zumbis têm 2 de vida
      if (this.fase === 3) {
        zombie.health = 2;
        zombie.currentHealth = 2;
      } else {
        zombie.health = cfg.hp ?? 1;
        zombie.currentHealth = cfg.hp ?? 1;
      }
      
      zombie.speed = cfg.speed ?? 60;
      zombie.damage = cfg.damage ?? 1;
      zombie.body.setGravityY(500);
      this.zombies.add(zombie);
      if (this.cache.audio.exists('zombieSound')) { try { this.sound.play('zombieSound'); } catch (e) {} }
      return zombie;
    }

    try {
      const zombie = this.physics.add.sprite(x, y, textureKey, 0);
      zombie.setScale(cfg.scale ?? 2);
      zombie.type = type;
      
      // Cria barra de vida para zumbis (na fase 3, todos têm barra)
      if (this.fase === 3 || cfg.hp > 1) {
        this.createZombieHealthBar(zombie);
      }

      const walkKey = `${type}_walk`;
      if (this.anims.exists(walkKey)) zombie.play(walkKey, true);

      this.zombies.add(zombie);
      if (this.cache.audio.exists('zombieSound')) { try { this.sound.play('zombieSound'); } catch (e) {} }
      return zombie;

    } catch (error) {

      return null;
    }
  }

  spawnZombies(count, typesArray = ['zombie1']) {
    const { width } = this.scale;
    let spawned = 0;
    for (let i = 0; i < count; i++) {
      const spawnLeft = i % 2 === 0;
      const x = spawnLeft ? Phaser.Math.Between(50, 200) : Phaser.Math.Between(width - 200, width - 50);
      const type = typesArray[Phaser.Math.Between(0, typesArray.length - 1)];
      const zombie = this.createZombie(type, x, this.enemyBaseY);
      if (zombie) spawned++;
    }
  }

  onLevelComplete() {
    const { width, height } = this.scale;

    if (this.zombieSpawnTimer) this.zombieSpawnTimer.remove();

    this.add.text(width / 2, height / 2 - 50, 'ZONA SEGURA', {
      fontSize: '72px',
      color: '#105a10a9',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    const proximaFase = this.fase + 1;

    if (proximaFase <= 3) {
      this.add.text(width / 2, height / 2 + 50, `${proximaFase}`, {
        fontSize: '36px',
        color: '#ffff00',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      const faseToSoldier = {
        1: 'soldier1',
        2: 'soldier2', 
        3: 'soldier2'
      };

      this.time.delayedCall(3000, () => {
        this.scene.start('GameScene', {
          fase: proximaFase,
          soldierKey: faseToSoldier[proximaFase] 
        });
      });

    } else {
      this.add.text(width / 2, height / 2 + 50, 'PARABÉNS! MISSÃO CUMPRIDA!', {
        fontSize: '36px',
        color: '#ffff00',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      this.time.delayedCall(3000, () => {
        console.log('TODAS AS 3 FASES COMPLETAS! Indo para VictoryScene');
        this.scene.start('VictoryScene');
      });
    }
  }
  // ---------------------------------------------------------------------
  // ensureSpritesheetLoaded: 
  // ---------------------------------------------------------------------
  ensureSpritesheetLoaded(key, opts = {}) {
    return new Promise((resolve) => {
      try {
        const expectedFrames = opts.expectedFrames || null;
        const desiredFW = opts.frameWidth || 128;
        const desiredFH = opts.frameHeight || 128;
        const path = opts.path || `/assets/images/spritesheets/${key.replace(/_.+$/, '')}/dead.png`;

        const checkAndMaybeReload = () => {
          if (this.textures.exists(key)) {
            const tex = this.textures.get(key);
            let detected = 0;
            if (tex && tex.frames) detected = Object.keys(tex.frames).filter(k => k !== '__BASE').length;
            if (expectedFrames && detected < expectedFrames) {
              console.warn(`[ensureSpritesheetLoaded] textura ${key} carregada com ${detected} frames, esperado ${expectedFrames}. Recarregando com frameWidth=${desiredFW}`);
              try { this.textures.remove(key); } catch (e) { console.warn('Erro removendo textura do cache:', e); }
            } else {
              resolve(); return;
            }
          }

          let completed = false;
          const onFileComplete = (fileKey) => { if (fileKey === key) { completed = true; cleanup(); resolve(); } };
          const onComplete = () => { if (!completed && this.textures.exists(key)) { completed = true; cleanup(); resolve(); return; } if (!completed) { cleanup(); resolve(); } };
          const cleanup = () => { try { this.load.off('filecomplete', onFileComplete); } catch (e) {} try { this.load.off('complete', onComplete); } catch (e) {} };

          this.load.on('filecomplete', onFileComplete);
          this.load.on('complete', onComplete);

          try {
            this.load.spritesheet(key, path, { frameWidth: desiredFW, frameHeight: desiredFH });
            if (!this.load.isLoading) this.load.start();
          } catch (e) {
            console.error('[ensureSpritesheetLoaded] erro ao registrar spritesheet:', e);
          }

          this.time.delayedCall(5000, () => { if (!completed) { cleanup(); resolve(); } });
        };

        checkAndMaybeReload();
      } catch (e) {
        console.error('[ensureSpritesheetLoaded] erro geral:', e);
        resolve();
      }
    });
  }
}

// Soldados 
const soldierConfigs = {
  soldier1: {
    keyPrefix: 'soldier1',
    animFiles: {
      idle:     { key: 'soldier1_idle',     frameWidth: 128, frameHeight: 128, frameCount: 7 },
      attack:   { key: 'soldier1_attack',   frameWidth: 128, frameHeight: 128, frameCount: 3 },
      dead:     { key: 'soldier1_dead',     frameWidth: 128, frameHeight: 128, frameCount: 4 },
      hurt:     { key: 'soldier1_hurt',     frameWidth: 128, frameHeight: 128, frameCount: 3 },
      recharge: { key: 'soldier1_recharge', frameWidth: 128, frameHeight: 128, frameCount: 13 },
      jump:     { key: 'soldier1_jump',     frameWidth: 128, frameHeight: 128, frameCount: 8 },
      shot:     { key: 'soldier1_shot',     frameWidth: 128, frameHeight: 128, frameCount: 4 },
      walk:     { key: 'soldier1_walk',     frameWidth: 128, frameHeight: 128, frameCount: 7 }
    },
    hitbox: { width: 12, height: 28, offsetX: 10, offsetY: 16 },
    scale: 2
  },

  soldier2: {
    keyPrefix: 'soldier2',
    animFiles: {
      idle:     { key: 'soldier2_idle',     frameWidth: 128, frameHeight: 128, frameCount: 9 },
      attack:   { key: 'soldier2_attack',   frameWidth: 128, frameHeight: 128, frameCount: 4 },
      dead:     { key: 'soldier2_dead',     frameWidth: 128, frameHeight: 128, frameCount: 4 },
      hurt:     { key: 'soldier2_hurt',     frameWidth: 128, frameHeight: 128, frameCount: 3 },
      recharge: { key: 'soldier2_recharge', frameWidth: 128, frameHeight: 128, frameCount: 7 },
      jump:     { key: 'soldier2_jump',     frameWidth: 128, frameHeight: 128, frameCount: 8 },
      shot:     { key: 'soldier2_shot',     frameWidth: 128, frameHeight: 128, frameCount: 4 },
      walk:     { key: 'soldier2_walk',     frameWidth: 128, frameHeight: 128, frameCount: 8 }
    },
    hitbox: { width: 16, height: 32, offsetX: 12, offsetY: 12 },
    scale: 2
  },
};

// Zumbis 
const enemyConfigs = {
  zombie1: {
    keyPrefix: 'zombie1',
    animFiles: {
      attack: { key: 'zombie1_attack', frameWidth: 128, frameHeight: 128, frameCount: 4 },
      dead:   { key: 'zombie1_dead',   frameWidth: 128, frameHeight: 128, frameCount: 5 },
      hurt:   { key: 'zombie1_hurt',   frameWidth: 128, frameHeight: 128, frameCount: 4 },
      idle:   { key: 'zombie1_idle',   frameWidth: 128, frameHeight: 128, frameCount: 6 },
      walk:   { key: 'zombie1_walk',   frameWidth: 128, frameHeight: 128, frameCount: 6 }
    },
    hitbox: { width: 40, height: 60, offsetX: 44, offsetY: 68 },
    scale: 2,
    hp: 1,
    speed: 50,
    damage: 1,
    attackRange: 80,
    attackCooldown: 1000
  },

  zombie2: {
    keyPrefix: 'zombie2',
    animFiles: {
      attack: { key: 'zombie2_attack', frameWidth: 128, frameHeight: 128, frameCount: 10 },
      dead:   { key: 'zombie2_dead',   frameWidth: 107, frameHeight: 128, frameCount: 5 },
      hurt:   { key: 'zombie2_hurt',   frameWidth: 128, frameHeight: 128, frameCount: 4 },
      idle:   { key: 'zombie2_idle',   frameWidth: 128, frameHeight: 128, frameCount: 7 },
      walk:   { key: 'zombie2_walk',   frameWidth: 128, frameHeight: 128, frameCount: 12 }
    },
    hitbox: { width: 40, height: 60, offsetX: 44, offsetY: 68 },
    scale: 2,
    hp: 1,
    speed: 70,
    damage: 1,
    attackRange: 90,
    attackCooldown: 900
  },

  zombie3: {
    keyPrefix: 'zombie3',
    animFiles: {
      attack: { key: 'zombie3_attack', frameWidth: 96, frameHeight: 96, frameCount: 4 },
      dead:   { key: 'zombie3_dead',   frameWidth: 96, frameHeight: 96, frameCount: 5 },
      eating: { key: 'zombie3_eating', frameWidth: 96, frameHeight: 95, frameCount: 11 },
      hurt:   { key: 'zombie3_hurt',   frameWidth: 96, frameHeight: 96, frameCount: 5 },
      idle:   { key: 'zombie3_idle',   frameWidth: 96, frameHeight: 96, frameCount: 9 },
      jump:   { key: 'zombie3_jump',   frameWidth: 96, frameHeight: 96, frameCount: 6 },
      run:    { key: 'zombie3_run',    frameWidth: 96, frameHeight: 96, frameCount: 8 },
      walk:   { key: 'zombie3_walk',   frameWidth: 96, frameHeight: 96, frameCount: 10 }
    },
    hitbox: { width: 30, height: 50, offsetX: 33, offsetY: 46 },
    scale: 2,
    hp: 2,
    speed: 90,
    damage: 1,
    attackRange: 70,
    attackCooldown: 800
  },

  zombie4: {
    keyPrefix: 'zombie4',
    animFiles: {
      attack: { key: 'zombie4_attack', frameWidth: 96, frameHeight: 96, frameCount: 5 },
      bite:   { key: 'zombie4_bite',   frameWidth: 96, frameHeight: 96, frameCount: 11 },
      dead:   { key: 'zombie4_dead',   frameWidth: 96, frameHeight: 96, frameCount: 5 },
      hurt:   { key: 'zombie4_hurt',   frameWidth: 96, frameHeight: 96, frameCount: 3 },
      idle:   { key: 'zombie4_idle',   frameWidth: 96, frameHeight: 96, frameCount: 8 },
      jump:   { key: 'zombie4_jump',   frameWidth: 96, frameHeight: 96, frameCount: 8 },
      run:    { key: 'zombie4_run',    frameWidth: 96, frameHeight: 96, frameCount: 7 },
      walk:   { key: 'zombie4_walk',   frameWidth: 96, frameHeight: 96, frameCount: 8 }
    },
    hitbox: { width: 30, height: 50, offsetX: 33, offsetY: 46 },
    scale: 2,
    hp: 2,
    speed: 60,
    damage: 1,
    attackRange: 85,
    attackCooldown: 1100
  }
};

// BACKGROUNDS POR FASE
const phaseBackgroundMap = {
  1: { key: 'bg_phase1', path: '/assets/images/level1.png' },
  2: { key: 'bg_phase2', path: '/assets/images/level2.png' },
  3: { key: 'bg_phase3', path: '/assets/images/level3.png' }
};

