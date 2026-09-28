const { default: makeWASocket, useMultiFileAuthState, Browsers, DisconnectReason, downloadMediaMessage } = require("@whiskeysockets/baileys")
const P = require("pino")
const fs = require("fs")
const path = require("path")
const config = require("./config")
async function start(){
  const { state, saveCreds } = await useMultiFileAuthState('./auth')
  const sock = makeWASocket({ auth: state, logger: P({level:"silent"}), browser: Browsers.ubuntu("Chrome") })
  sock.ev.on('creds.update', saveCreds)
  sock.ev.on('connection.update', (u)=>{
    if(u.connection==='open') console.log('\n✅ '+config.BOT_NAME+' CONNECTED!\n')
    if(u.connection==='close' && u.lastDisconnect?.error?.output?.statusCode!==DisconnectReason.loggedOut) start()
  })
  sock.ev.on('group-participants.update', async (an)=>{
    try{
      let metadata = await sock.groupMetadata(an.id)
      for(let user of an.participants){
        let pp = await sock.profilePictureUrl(user,'image').catch(()=> 'https://i.ibb.co/6n0f0y8/no-dp.jpg')
        let name = user.split('@')[0]
        if(an.action=='add'){
          await sock.sendMessage(an.id, { image: {url: pp}, caption: '*WELCOME ☃️*\nHey @'+name+'\nWelcome to '+metadata.subject, mentions: [user] })
        }
        if(an.action=='remove'){
          await sock.sendMessage(an.id, { image: {url: pp}, caption: '*GOOD BYE @'+name+' 👋*\n@'+name+' left '+metadata.subject, mentions: [user] })
        }
      }
    }catch(e){}
  })
  sock.ev.on('messages.upsert', async ({messages})=>{
    const m=messages[0]; if(!m.message) return
    const from=m.key.remoteJid
    const isGroup = from.endsWith('@g.us')
    const body=m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || ""

    if(isGroup && body){
      if(/chat\.whatsapp\.com/i.test(body)){
        try{
          let sender = m.key.participant || m.participant
          if(!sender) return
          console.log('Link from', sender, 'deleting...')
          // Direct delete - no admin check (LID bug bypass)
          await sock.sendMessage(from, { delete: m.key })
          await new Promise(r=>setTimeout(r,800))
          await sock.sendMessage(from, { text: `🚫 *Antilink*\n@${sender.split('@')[0]} link pathiyeche!`, mentions: [sender] })
          await sock.groupParticipantsUpdate(from, [sender], 'remove').catch(e=>console.log('kick fail (bot not admin?):', e.message))
        }catch(e){ console.log('antilink error', e) }
      }
    }

    if(!body.startsWith(config.PREFIX)) return
    const args=body.slice(1).trim().split(/ +/); const cmd=args.shift().toLowerCase()
    const file=path.join(__dirname,'commands',cmd+'.js')
    if(fs.existsSync(file)){
      delete require.cache[require.resolve(file)]
      try{ await require(file).execute(sock,m,{from,config,args,body,downloadMediaMessage}) }catch(e){ console.log(e) }
    }
  })
}
start()
