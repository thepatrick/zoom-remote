import { spawn } from 'child_process';

// TODO: Queue this

export const display = {
  power: {
    on(): void {
      const child = spawn('caffeinate', ['-u', '-t', '1']);
      child.on('close', () => {
        console.log('caffeinate done');
      });
    },
    off(): void {
      const child = spawn('pmset', ['displaysleepnow']);
      child.on('close', () => {
        console.log('pmset done');
      });
    },
  },
};
