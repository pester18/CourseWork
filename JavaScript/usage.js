'use strict';

const MultichannelQueue = require('./multich-queue.js')

const multQueue = new MultichannelQueue(2, 1);
const channel1 = multQueue.addChannel(144);
const channel2 = multQueue.addChannel(154);
channel1.push('A');
channel2.push('B');
console.dir(multQueue.pick());  //Expected output: [{ id: 144, data: 'A' }, { id: 154, data: 'B' }]
console.dir(multQueue.pick());  //Expected output: [{ id: 144, data: null }, { id: 154, data: null }]
setTimeout(() => {
  console.dir(multQueue.pick());  //Expected output: []
  channel1.push('def');
  console.dir(multQueue.pick());  //Expected output: []
  console.log(channel1.isAlive);  //Expected output: false
  console.log(channel2.isAlive);  //Expected output: false
}, 2000);
