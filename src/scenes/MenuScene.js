// MenuScene.js 

import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.scale;

    console.log('MenuScene: create() executado');

    // Fundo do menu (com fallback)
    try {
      this.add.image(width / 2, height / 2, 'menuBg').setDisplaySize(width, height);
      console.log('Background do menu carregado');
    } catch (error) {
      console.warn('Background do menu não carregado, usando fallback');
      this.add.rectangle(width / 2, height / 2, width, height, 0x2c3e50);
    }

    // Título
    this.add.text(width / 2, 150, 'Soldier vs Zombies', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Botão único para iniciar jogo
    // No MenuScene.js, no botão de iniciar:
this.createMenuButton(width / 2, 320, 'INICIAR JOGO', () => {
  console.log('Botão clicado! Indo para PreGameScene...');

  if (this.scene.get('PreScene')) {
    this.scene.start('PreScene', { fase: 1 });
  } else {
    // Fallback: vai direto para o jogo
    this.scene.start('GameScene', { fase: 1 });
  }
});

    // Instruções
    this.add.text(width / 2, 400, 'Clique em INICIAR JOGO para começar', {
      fontSize: '18px',
      color: '#ffcc00'
    }).setOrigin(0.5);

    // Debug info
    this.add.text(16, height - 16, `Cenas carregadas: ${this.scene.manager.getScenes(true).length}`, {
      fontSize: '12px',
      color: '#ccc'
    });
  }

  createMenuButton(x, y, text, callback) {
    console.log(`Criando botão: "${text}" em (${x}, ${y})`);

    // Botão principal
    const btn = this.add.text(x, y, text, {
      fontSize: '32px',
      backgroundColor: '#e74c3c',
      padding: { x: 30, y: 15 },
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    // Efeitos de hover
    btn.on('pointerover', () => {
      console.log('Mouse sobre o botão');
      btn.setStyle({ backgroundColor: '#c0392b' });
      btn.setScale(1.05);
    });
    
    btn.on('pointerout', () => {
      btn.setStyle({ backgroundColor: '#e74c3c' });
      btn.setScale(1);
    });
    
    btn.on('pointerdown', () => {
      console.log('Botão pressionado - executando callback');
      btn.setStyle({ backgroundColor: '#a93226' });
      
      // Executa imediatamente (sem delay)
      try {
        callback();
      } catch (error) {
        console.error('Erro no callback do botão:', error);
      }
    });

    console.log(`Botão "${text}" criado com sucesso`);
    return btn;
  }
}