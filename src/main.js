// -----------------------------------------------------------------------------
// main.js: arquivo principal do jogo
// -----------------------------------------------------------------------------

import Phaser from 'phaser';

// Importa as cenas do jogo
import PreloadScene from './scenes/PreloadScene.js';
import MenuScene from './scenes/MenuScene.js';
import PreScene from './scenes/PreScene.js';
import GameScene from './scenes/GameScene.js';
import VictoryScene from './scenes/VictoryScene.js';


// -----------------------------------------------------------------------------
// Configurações globais
// -----------------------------------------------------------------------------

// Dimensões da tela do jogo
const WIDTH = 1280;  
const HEIGHT = 720;  

// Configurações compartilhadas entre as cenas
const SHARED_CONFIG = {
  width: WIDTH,
  height: HEIGHT,
  debug: false 
};

// Ordem das cenas 
const SCENES = [
  PreloadScene,
  MenuScene,
  PreScene,
  GameScene,
  VictoryScene
];

const createScene = Scene => new Scene(SHARED_CONFIG);

const initScenes = () => SCENES.map(createScene);

// -----------------------------------------------------------------------------
// Configuração geral do Phaser.Game
// -----------------------------------------------------------------------------

const config = {
  type: Phaser.AUTO,
  ...SHARED_CONFIG,
  backgroundColor: '#2c3e50', 
  parent: 'game-container',
  pixelArt: false, 
  physics: {
    default: 'arcade',
    arcade: {
      debug: SHARED_CONFIG.debug,
      gravity: { y: 800 } 
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: {
      width: 800,
      height: 600
    },
    max: {
      width: 1920,
      height: 1080
    }
  },
  scene: initScenes(),
  render: {
    antialias: true,
    roundPixels: false
  }
};

// Inicializa o jogo
new Phaser.Game(config);