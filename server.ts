import express from 'express';
import path from 'node:path';
import 'dotenv/config';
import { createApp } from './backend/app';
import { database } from './backend/db';
const app=createApp(database());
async function start() {
  if(process.env.NODE_ENV!=='production') {
    const {createServer}=await import('vite');
    const vite=await createServer({server:{middlewareMode:true},appType:'spa'});app.use(vite.middlewares);
  } else {
    const dist=path.resolve('dist');app.use(express.static(dist));app.get('*',(_req,res)=>res.sendFile(path.join(dist,'index.html')));
  }
  app.listen(Number(process.env.PORT)||3000,'0.0.0.0',()=>console.log('PawaVet server started'));
}
start().catch(()=>{console.error('PawaVet startup failed');process.exit(1);});
