'use strict';
const path = require('path')
const fs = require('fs')
/**
 * @param {Egg.Application} app - egg application
 */
function streamToBuffer(stream) {  
  return new Promise((resolve, reject) => {
    let buffers = [];
    stream.on('error', reject);
    stream.on('data', (data) => buffers.push(data))
    stream.on('end', () => resolve(Buffer.concat(buffers)));
  });
}
module.exports = app => {
  const { router, controller } = app;
  //获取所有controller生成路由 规则为 ${name}_${method}
  for(const sub in controller){
    for(const way in controller[sub]){
      if(way.indexOf('_') < 0)throw error(`the controller about ${way} in ${sub} need rename!`)
      let [name,method] = way.split('_')
      router[method](`/community/${sub}/${name}`, controller[sub][way]);
      // console.log(`/${sub}/${name}`)
    }
  }
};
