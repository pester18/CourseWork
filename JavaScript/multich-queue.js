'use strict';

class Channel {
  constructor(chunkSize) {
    this.buffer = Buffer.alloc(0);
    this.chunks = [];
    this.chunkSize = chunkSize;
    this.timeStamp = process.hrtime();
    this.isAlive = true;
  }

  push(data) {
    if (!this.isAlive) return;
    const buffer = Buffer.from(data);
    this.timeStamp = process.hrtime();
    this.buffer = Buffer.concat([this.buffer, buffer], this.sizeOfBuff);
    while (this.buffer.length >= this.chunkSize) {
      const chunk = this.buffer.slice(0, this.chunkSize);
      this.buffer = this.buffer.slice(this.chunkSize, this.buffer.length);
      this.chunks.unshift(chunk);
    }
  }

}

class MultichannelQueue {
  constructor(chunkSize, timeout) {
    this.chunkSize = chunkSize;
    this.channels = new Map();
    this.timeout = timeout;
  }

  addChannel(id) {
    if (this.channels.has(id)) return;
    const queue = new Channel(this.chunkSize);
    this.channels.set(id, queue);
    return queue;
  }

  removeChannel(id) {
    if (!this.channels.has(id)) return;
    const channel = this.channels.get(id);
    channel.isAlive = false;
    this.channels.delete(id);
  }

  pick() {
    const parsel = [];
    this.channels.forEach((queue, id) => {
      let data = null;
      if (queue.chunks.length) {
        data = queue.chunks.pop();
      } else if (queue.buffer.length) {
        data = queue.buffer;
        queue.buffer = Buffer.alloc(0);
      } else {
        const diff = process.hrtime(queue.timeStamp)[0];
        if (diff >= this.timeout) {
          const channel = this.channels.get(id);
          channel.isAlive = false;
          this.channels.delete(id);
          return;
        }
      }
      data = data ? data.toString() : data;
      parsel.push({ id, data });
    });
    return parsel;
  }

}


module.exports = MultichannelQueue;
