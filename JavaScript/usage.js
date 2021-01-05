'use strict';

const MultichannelQueue = require('./multich-queue.js');

const multQueue = new MultichannelQueue(2, 1);
multQueue.on('drain', (id) => {
  console.log(`Channel ${id} is empty`);
});
multQueue.on('timeout', (id) => {
  console.log(`Channel ${id} is timedout`);
});
multQueue.on('pick', (parsel) => {
  console.dir(parsel);
});

const channel1 = multQueue.addChannel(144);
const channel2 = multQueue.addChannel(154);

channel1.push('abcd');
channel2.push('bdca');
multQueue.pick();
multQueue.pick();

setTimeout(() => {
  multQueue.pick();
  channel1.push('defy');
  multQueue.pick();
  console.log(channel1.isAlive);  //Expected output: false
  console.log(channel2.isAlive);  //Expected output: false
}, 2000);
