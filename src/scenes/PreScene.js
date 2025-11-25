// PreGameScene.js - Tela antes de começar a fase
import Phaser from 'phaser';

export default class PreScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreScene' });
  }

  init(data) {
    // Recebe qual fase vai começar
    this.fase = data.fase || 1;
    console.log(`PreScene: Preparando fase ${this.fase}`);
  }

  create() {
    const { width, height } = this.scale;

    console.log(`PreScene: create() - Fase ${this.fase}`);

    this.add.image(width / 2, height / 2, 'preSceneBg').setDisplaySize(width, height);
    

    // Controle por teclado também
    this.input.keyboard.on('keydown-ENTER', () => {
      console.log('Enter pressionado - iniciando fase');
      this.scene.start('GameScene', { fase: this.fase });
    });

    this.input.keyboard.on('keydown-ESC', () => {
      console.log('ESC pressionado - voltando ao menu');
      this.scene.start('MenuScene');
    });

    // Timer automático 
    this.startCountdown();
  }

  
  startCountdown() {
    // Contagem regressiva automática 
    let countdown = 5;
    const countdownText = this.add.text(this.scale.width / 2, 600, `Iniciando em ${countdown}...`, {
      fontSize: '16px',
      color: '#bdc3c7'
    }).setOrigin(0.5);

    const timer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        countdown--;
        countdownText.setText(`Iniciando em ${countdown}...`);
        
        if (countdown <= 0) {
          timer.remove();
          console.log('Countdown finalizado - iniciando fase');
          this.scene.start('GameScene', { fase: this.fase });
        }
      },
      callbackScope: this,
      loop: true
    });

    // Cancelar countdown se interagir
    this.input.on('pointerdown', () => {
      timer.remove();
      countdownText.setText('Iniciando...');
    });
  }

  getZumbisFase(fase) {
    // Define quantidade de zumbis por fase
    const zumbisPorFase = {
      1: 15,
      2: 20,
      3: 30,
    };
    return zumbisPorFase[fase] || 15;  //lembrar de oq é esse q15
  }
}