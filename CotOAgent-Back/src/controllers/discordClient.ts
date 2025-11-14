import { Client, GatewayIntentBits } from 'discord.js';

// Initialize Discord bot client
export const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

// Login to Discord with bot token
const token = process.env.DISCORD_BOT_TOKEN || 'YOUR_DISCORD_BOT_TOKEN';

// Track if client is ready
export let clientReady = false;

// When the client is ready, run this code (only once)
client.once('clientReady', () => {
  clientReady = true;
  console.log(`[Discord Bot] Logged in as ${client.user?.tag}`);
});

// Login the bot
if (token && token !== 'YOUR_DISCORD_BOT_TOKEN') {
  client
    .login(token)
    .catch((error) => {
      console.error('[Discord Bot] Failed to login:', error);
    });
} else {
  console.warn('[Discord Bot] DISCORD_BOT_TOKEN not configured. Bot will not start.');
}
