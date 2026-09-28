
module.exports.execute = async (s,m,{from,args})=>{
  let target = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
  if(!target && args[0]){
    let num = args[0].replace(/[^0-9]/g,'')
    target = num + '@s.whatsapp.net'
  }
  if(!target) target = m.key.participant || from
  try{
    let url = await s.profilePictureUrl(target, 'image')
    await s.sendMessage(from, { image: {url}, caption: '*DP of @'+target.split('@')[0]+'*\nBy NXT SULTAN BOT', mentions:[target] }, {quoted:m})
  }catch{
    await s.sendMessage(from,{text:'DP not found', mentions:[target]}, {quoted:m})
  }
}
