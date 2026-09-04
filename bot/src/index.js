import {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from "discord.js";

const token = process.env.DISCORD_TOKEN;

if (!token) {
  throw new Error("DISCORD_TOKEN is missing");
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const commands = [
  new SlashCommandBuilder()
    .setName("watch")
    .setDescription("Open the Jellyfin Watch Party")
];

client.once("clientReady", async () => {
  console.log(`Logged in as ${client.user.tag}`);

  const guild = client.guilds.cache.first();

  if (!guild) {
    console.error("The bot is not currently in any Discord server.");
    return;
  }

  console.log(`Registering commands in: ${guild.name}`);

  try {
    await guild.commands.set(commands);
    console.log("/watch registered successfully");
  } catch (error) {
    console.error("Failed to register commands:", error);
  }
});

client.on("interactionCreate", async interaction => {
  try {
    // /watch command
    if (interaction.isChatInputCommand()) {
      if (interaction.commandName === "watch") {
        const button = new ButtonBuilder()
          .setLabel("Open Jellyfin Watch Party")
          .setStyle(ButtonStyle.Primary)
          .setCustomId("open-watch-party");

        const row = new ActionRowBuilder()
          .addComponents(button);

        await interaction.reply({
          content: "Jellyfin Watch Party",
          components: [row]
        });

        return;
      }
    }

    // Watch Party button
    if (interaction.isButton()) {
      if (interaction.customId === "open-watch-party") {
        console.log(`Launching Activity for ${interaction.user.tag}`);

        await interaction.launchActivity();

        console.log("Activity launch requested");
      }
    }
  } catch (error) {
    console.error("Interaction error:", error);

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "Failed to launch the Jellyfin Watch Party.",
        ephemeral: true
      });
    }
  }
});

client.login(token);
