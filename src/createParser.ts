import { Writable } from 'stream';

export const createParser = (): Writable => {
  let incomingBuffer = Buffer.alloc(0);
  const writable = new Writable({ decodeStrings: false });

  const parseBuffer = () => {
    while (true) {
      const next = incomingBuffer.indexOf('\n');
      if (next < 0) {
        if (incomingBuffer.length > 1024) {
          writable.emit('error', new Error('Message over 1024 without \n'));
        }
        return;
      }

      if (next > 1024) {
        writable.emit('error', new Error('Message over 1024'));
      }

      const thisMessage = incomingBuffer.slice(0, next);

      writable.emit('message', thisMessage.toString('utf-8'));

      const remainingBuffer = Buffer.alloc(incomingBuffer.length - (next + 1));
      incomingBuffer.copy(remainingBuffer, 0, next + 1);

      incomingBuffer = remainingBuffer;
    }
  };

  writable._write = (chunk, encoding, next) => {
    // Convert to chunk to a buffer (it really really should be one already)
    const newBuffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding);

    // Create a new buffer that will fit the existing incomingBuffer & the new chunk
    // and copy them both into it.
    const combinedBuffer = Buffer.allocUnsafe(incomingBuffer.length + newBuffer.length);
    incomingBuffer.copy(combinedBuffer);
    newBuffer.copy(combinedBuffer, incomingBuffer.length);

    incomingBuffer = combinedBuffer;

    // Parse anything that we can out of the resulting incomingBuffer
    parseBuffer();

    // Next!
    next();
  };

  return writable;
};
