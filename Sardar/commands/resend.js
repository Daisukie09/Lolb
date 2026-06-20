module.exports = {
  config: {
    credits: "SARDAR RDX",
    name: "resend",
    aliases: ["antiDelete", "antidelete"],
    description: "Deleted messages ko group mein wapas send karo.",
    usage: "resend on | resend off | resend status",
    category: "Admin",
    prefix: true,
    adminOnly: false,
    cooldowns: 3
  },

  async run({ api, event, args, send, Threads, config, isAdmin }) {
    const { threadID, senderID, messageID } = event;
    if (!isAdmin) {
      return send.reply(
        `╭─── « ❌ ACCESS DENIED » ───⟡\n` +
        `│\n` +
        `│ 🚫 Yeh command sirf Bot\n` +
        `│    Admins use kar sakte hain!\n` +
        `│\n` +
        `╰───────────────⟡`
      );
    }

    const action = (args[0] || "").toLowerCase();
    const settings = await Threads.getSettings(threadID);

    if (!action || action === "status") {
      const status = settings.resend ? "✅ ON" : "❌ OFF";
      return send.reply(
        `╭── 🔄 RESEND MODE ──╮\n` +
        `│\n` +
        `│  Status : ${status}\n` +
        `│\n` +
        `│  Jab ON ho, delete\n` +
        `│  kiya gaya message\n` +
        `│  bot wapas send\n` +
        `│  karega group mein!\n` +
        `│\n` +
        `│  Use:\n` +
        `│  ${config.PREFIX}resend on\n` +
        `│  ${config.PREFIX}resend off\n` +
        `│\n` +
        `╰───────────────────╯`
      );
    }

    if (!["on", "off"].includes(action)) {
      return send.reply(`❌ Galat option!\nUse: ${config.PREFIX}resend on / off`);
    }

    const enable = action === "on";
    await Threads.setSettings(threadID, { resend: enable });

    api.setMessageReaction(enable ? "✅" : "❌", messageID, () => {}, true);

    send.reply(
      enable
        ? `╭─── 🔄 RESEND ON ───╮\n` +
          `│\n` +
          `│  ✅ Resend mode ON!\n` +
          `│\n` +
          `│  Ab agar koi message\n` +
          `│  delete karega, bot\n` +
          `│  wapas send karega! 👀\n` +
          `│\n` +
          `╰──────────────────╯`
        : `╭─── 🔄 RESEND OFF ──╮\n` +
          `│\n` +
          `│  ❌ Resend mode OFF!\n` +
          `│\n` +
          `│  Ab deleted messages\n` +
          `│  wapas nahi ayenge.\n` +
          `│\n` +
          `╰──────────────────╯`
    );
  }
};
