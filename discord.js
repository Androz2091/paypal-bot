const {
    DISCORD_TOKEN,
    DISCORD_PREFIX,
    DISCORD_OWNER,
    BASE_URL
} = process.env;

const Discord = require("discord.js");
const client = new Discord.Client();
client.login(DISCORD_TOKEN);

client.on("ready", () => {
    console.log("Bot is listening");
});

client.on("message", (message) => {

    // Si le message ne vient pas du propriétaire du bot
    if(message.author.id !== DISCORD_OWNER) return;
    // Si le message ne commence pas par le préfixe
    if(!message.content.startsWith(DISCORD_PREFIX)) return;

    // Analysation du message
    const args = message.content.slice(DISCORD_PREFIX.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    
    // Si la commande est create
    if(command === "create"){

        // Récupération des informations sur la facture
        const member = message.mentions.members.first();
        if(!member) return message.reply("vous devez mentionner un membre à qui envoyer une facture!");
        const sentPrice = args[1];
        if(!sentPrice) return message.reply("vous devez indiquer un montant!");
        const price = sentPrice.endsWith("€") ? parseInt(sentPrice.split("€")[0]) : parseInt(sentPrice);
        if(!price) return message.reply("vvous devez indiquer un montant **valide**!");
        const name = args.slice(2).join(" ");
        if(!name) return message.reply("vous devez indiquer un nom de facture!");
        const user = client.db.get(member.id);
        if(!user) client.db.set(member.id, []);

        // Génération de la facture
        const paymentID = Math.random().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5);
        const paymentData = {
            id: paymentID,
            userID: member.id,
            username: member.user.username,
            avatarURL: member.user.displayAvatarURL(),
            paid: false,
            price,
            name
        };
        // Sauvegarde de la facture
        client.db.push(member.id, paymentData);

        // Envoi de la facture
        const embed = new Discord.MessageEmbed()
        .setAuthor(`Bonjour, ${member.user.tag}`, member.user.displayAvatarURL())
        .setDescription("Voici un résumé de votre commande:")
        .addField("Nom", paymentData.name, true)
        .addField("Prix", `${paymentData.price}€`, true)
        .addField("Paiement", `[Effectuer le paiement](${BASE_URL}/payment/${member.id}/${paymentData.id})`)
        .setColor("#0091fc")
        .setFooter("Une fois le paiement effectué, vous recevrez un message de confirmation");

        member.user.send(embed);
    }

});

module.exports = client;
