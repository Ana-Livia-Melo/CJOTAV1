// VictoryScene.js - Tela de vitória MUITO simples
import Phaser from 'phaser';

export default class VictoryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'VictoryScene' });
  }

  create() {
    const { width, height } = this.scale;

    // Fundo de vitória 
    this.add.image(width / 2, height / 2, 'victoryBg').setDisplaySize(width, height);
    
    // Botão único para voltar ao menu
    const btn = this.add.text(width / 2, 300, 'VOLTAR AO MENU', {
      fontSize: '28px',
      backgroundColor: '#e74c3c',
      padding: { x: 20, y: 10 },
      color: '#ffffff'
    }).setOrigin(0.5).setInteractive();

    btn.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });

    // Voltar com Enter ou ESC
    this.input.keyboard.on('keydown-ENTER', () => {
      this.scene.start('MenuScene');
    });

    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.start('MenuScene');
    });
  }
}