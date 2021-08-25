import net from 'net';
import { audio } from './audio';
import { createParser } from './createParser';
import { display } from './display';
import { lights } from './lights';
const server = net.createServer();

server.on('connection', (conn) => {
  const remoteAddress = `${conn.remoteAddress}:${conn.remotePort}`;

  console.log('new client connection from %s', remoteAddress);

  const parser = createParser();

  parser.on('error', (error) => {
    console.log('Um', error);
    conn.destroy(error);
  });

  parser.on('message', (message: string) => {
    if (message === 'display.power.on') {
      display.power.on();
    } else if (message === 'display.power.off') {
      display.power.off();
    } else if (message === 'audio.mic.mute') {
      audio.mic.mute();
    } else if (message === 'audio.mic.unmute') {
      audio.mic.unmute();
    } else if (message === 'audio.headphones.mute') {
      audio.headphones.mute();
    } else if (message === 'audio.headphones.unmute') {
      audio.headphones.unmute();
    } else if (message === 'audio.deskspeakers.mute') {
      audio.deskspeakers.mute();
    } else if (message === 'audio.deskspeakers.unmute') {
      audio.deskspeakers.unmute();
    } else if (message === 'lights.power.on') {
      lights.power.on();
    } else if (message === 'lights.power.off') {
      lights.power.off();
    } else if (message === 'lights.left.down') {
      lights.left.down();
    } else if (message === 'lights.left.power') {
      lights.left.power(undefined);
    } else if (message === 'lights.left.up') {
      lights.left.up();
    } else if (message === 'lights.right.down') {
      lights.right.down();
    } else if (message === 'lights.right.power') {
      lights.right.power(undefined);
    } else if (message === 'lights.right.up') {
      lights.right.up();
    } else {
      console.log('unexpected message from %s: %j', remoteAddress, message);
    }
  });

  conn.pipe(parser);

  conn.once('close', () => {
    console.log('connection from %s closed', remoteAddress);
  });

  conn.on('error', (err) => {
    console.log('Connection %s error: %s', remoteAddress, err.message);
  });
});

server.listen(9000, () => {
  console.log('server listening to %j', server.address());
});
