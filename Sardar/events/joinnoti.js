const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const moment = require('moment-timezone');

module.exports = {
    config: {
        credits: "SARDAR RDX",
        name: 'joinnoti',
        eventType: 'log:subscribe',
        version: '2.0.0',
        description: 'Bot joins group — stylish intro message + admin notification'
    },

    async run({ api, event, Threads, config }) {
        const { threadID, logMessageData } = event;
        const addedParticipants = logMessageData?.addedParticipants || [];
        const botID = api.getCurrentUserID();
        const botJoined = addedParticipants.some(p => p.userFbId === botID);
        if (!botJoined) return;

        try {
            const botnick = config.BOTNICK || config.BOTNAME || 'RDX BOT';
            try { await api.changeNickname(botnick, threadID, botID); } catch {}

            let threadName = 'Unknown Group';
            try {
                const cached = await Threads.get(threadID);
                if (cached?.name) {
                    threadName = cached.name;
                } else {
                    const info = await Threads.getInfo(threadID);
                    threadName = info?.threadName || info?.name || 'Unknown Group';
                }
            } catch {}

            const time = moment().tz(config.TIMEZONE || 'Asia/Karachi').format('hh:mm:ss A');
            const date = moment().tz(config.TIMEZONE || 'Asia/Karachi').format('DD/MM/YYYY');

            const msg1 =
                `🔗 𝐒𝐲𝐬𝐭𝐞𝐦 𝐂𝐨𝐧𝐧𝐞𝐜𝐭𝐢𝐧𝐠... ⚡\n` +
                `Hello Everyone! 🙋‍♂️\n` +
                `𝐁𝐨𝐭 𝐢𝐬 𝐍𝐨𝐰 𝐀𝐜𝐭𝐢𝐯𝐞 ✅`;

            const msg2 =
                `┏━━━ ⚡ 𝐑𝐃𝐗 𝐁𝐎𝐓 ⚡ ━━━┓\n` +
                `┃                           \n` +
                `┃  🌹 ꧁𝐒𝐀𝐑𝐃𝐀𝐑 𝐑𝐃𝐗꧂ 🌹  \n` +
                `┃                           \n` +
                `┃   ✨ 𝐒𝐘𝐒𝐓𝐄𝐌 𝐋𝐈𝐕𝐄 ✨    \n` +
                `┃                           \n` +
                `┣━━━━━━━━━━━━━━━━━━┫\n` +
                `┃ 👑 𝐎𝐖𝐍𝐄𝐑 𝐈𝐍𝐅𝐎            \n` +
                `┃ 👤 Sardar RDX             \n` +
                `┃ 🌐 fb.com/Sardar.RDX.786  ┃\n` +
                ` 📞 +923301068874          \n` +
                `✈️ Telegram: @SardarRDX7  \n` +
                `┣━━━━━━━━━━━━━━━━━━━┫\n` +
                `┃ 🏠 Group : ${threadName.slice(0, 18)}\n` +
                `┃ 📅 Date  : ${date}\n` +
                `┃ 🕐 Time  : ${time}\n` +
                `┣━━━━━━━━━━━━━━━━━━━┫\n` +
                `┃ ⚠️ 𝐈𝐌𝐏𝐎𝐑𝐓𝐀𝐍𝐓             \n` +
                `┃ 📍 Bot active for 5 days  \n` +
                `┃ 📍 Add dev to keep bot    \n` +
                `┃ 📍 ${config.PREFIX}help — all commands     \n` +
                `┗━━━━━━━━━━━━━━━━━━━┛\n` +
                `  🎀🌸 𝐒𝐀𝐑𝐃𝐀𝐑 𝐑𝐃𝐗 𝐁𝐎𝐓 🌸🎀`;

            const videoPath = path.join(__dirname, 'cache', 'botjoin.mp4');

            try { await api.sendMessage(msg1, threadID); } catch {}
            await new Promise(r => setTimeout(r, 2000));

            try {
                if (fs.existsSync(videoPath)) {
                    await api.sendMessage({ body: msg2, attachment: fs.createReadStream(videoPath) }, threadID);
                } else {
                    await api.sendMessage(msg2, threadID);
                }
            } catch {
                try { await api.sendMessage(msg2, threadID); } catch {}
            }

            const notifyTid = config.NOTIFY_TID;
            if (!notifyTid) return;

            const getRealUptime = require('../../controller/utility/getRealUptime');
            const uptime = getRealUptime();
            const h = Math.floor(uptime / 3600);
            const m = Math.floor((uptime % 3600) / 60);
            const freeMem = os.freemem();
            const totalMem = os.totalmem();
            const ramUsed = ((totalMem - freeMem) / 1024 / 1024 / 1024).toFixed(2);
            const ramTotal = (totalMem / 1024 / 1024 / 1024).toFixed(2);

            const adminMsg =
                `╔══〔 🟢 𝐁𝐎𝐓 𝐀𝐃𝐃𝐄𝐃 〕══╗\n\n` +
                `🏠 𝐆𝐫𝐨𝐮𝐩  : ${threadName}\n` +
                `🆔 𝐓𝐈𝐃    : ${threadID}\n` +
                `📅 𝐃𝐚𝐭𝐞   : ${date}\n` +
                `🕐 𝐓𝐢𝐦𝐞   : ${time}\n\n` +
                `📊 𝐁𝐨𝐭 𝐇𝐞𝐚𝐥𝐭𝐡\n` +
                `⏱️ Uptime : ${h}h ${m}m\n` +
                `🧠 RAM    : ${ramUsed}GB / ${ramTotal}GB\n` +
                `🚀 Status : Healthy ✅\n\n` +
                `👑 SARDAR RDX BOT`;

            try { await api.sendMessage(adminMsg, notifyTid); } catch {}

        } catch (e) {
            console.log('[joinnoti] Error:', e.message);
        }
    }
};
