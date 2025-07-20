class SoundManager {
  private sounds: { [key: string]: HTMLAudioElement } = {};
  private isMuted: boolean = false;

  constructor() {
    this.initializeSounds();
  }

  private initializeSounds() {
    // 기본 사운드들 (실제 파일이 없으므로 빈 오디오 객체 생성)
    this.sounds = {
      move: new Audio(),
      rotate: new Audio(),
      drop: new Audio(),
      lineClear: new Audio(),
      gameOver: new Audio(),
      levelUp: new Audio(),
      background: new Audio(),
    };

    // 사운드 설정
    Object.values(this.sounds).forEach(sound => {
      sound.volume = 0.3;
      sound.preload = 'auto';
    });

    // 배경음악 설정
    if (this.sounds.background) {
      this.sounds.background.loop = true;
      this.sounds.background.volume = 0.1;
    }
  }

  play(soundName: string) {
    // 소리 기능 일시 비활성화
    return;
    
    // if (this.isMuted || !this.sounds[soundName]) return;
    
    // try {
    //   // 사운드 재생 시도
    //   this.sounds[soundName].currentTime = 0;
    //   this.sounds[soundName].play().catch(() => {
    //     // 브라우저 정책으로 인한 자동 재생 실패 시 무시
    //     console.log(`Sound ${soundName} play failed (autoplay policy)`);
    //   });
    // } catch (error) {
    //   console.log(`Sound ${soundName} play error:`, error);
    // }
  }

  playMove() {
    this.play('move');
  }

  playRotate() {
    this.play('rotate');
  }

  playDrop() {
    this.play('drop');
  }

  playLineClear() {
    this.play('lineClear');
  }

  playGameOver() {
    this.play('gameOver');
  }

  playLevelUp() {
    this.play('levelUp');
  }

  startBackgroundMusic() {
    // 소리 기능 일시 비활성화
    return;
    
    // if (this.isMuted) return;
    // this.play('background');
  }

  stopBackgroundMusic() {
    if (this.sounds.background) {
      this.sounds.background.pause();
      this.sounds.background.currentTime = 0;
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopBackgroundMusic();
    } else {
      this.startBackgroundMusic();
    }
    return this.isMuted;
  }

  setVolume(volume: number) {
    Object.values(this.sounds).forEach(sound => {
      sound.volume = Math.max(0, Math.min(1, volume));
    });
  }

  isSoundMuted(): boolean {
    return this.isMuted;
  }
}

export const soundManager = new SoundManager(); 