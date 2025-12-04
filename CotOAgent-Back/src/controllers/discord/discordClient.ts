import { Client, GatewayIntentBits } from 'discord.js';

export const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

const token = process.env.DISCORD_BOT_TOKEN || 'YOUR_DISCORD_BOT_TOKEN';

export let clientReady = false;

client.once('clientReady', () => {
  clientReady = true;
  console.log(`[Discord Bot] Logged in as ${client.user?.tag}`);
});

if (token && token !== 'YOUR_DISCORD_BOT_TOKEN') {
  client
    .login(token)
    .catch((error) => {
      console.error('[Discord Bot] Failed to login:', error);
    });
} else {
  console.warn('[Discord Bot] DISCORD_BOT_TOKEN not configured. Bot will not start.');
}
