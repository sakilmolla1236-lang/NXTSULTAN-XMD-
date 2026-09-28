module.exports.execute = async (s,m,{from,config})=>{
let txt=`*_${config.BOT_NAME} MAIN MENU ☃️_*
╭────────────────┈⊷
┇ *${config.BOT_NAME}*
┋.menu - sob menu
┋.groupmenu - group control
┋.tagall - sobai ke tag
┋.hidetag <msg> - lukiye tag
┋.kick @user
┋.promote /.demote @user
┋.mute /.unmute
┋.gopen /.gclose
┋.link /.revoke
┋.jid /.getdp
┋.vv - viewonce dekho
┋.ping
╰────────────────┈⊷
*${config.FOOTER}*`
await s.sendMessage(from,{text:txt},{quoted:m})}
