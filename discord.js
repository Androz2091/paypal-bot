const {
	DISCORD_TOKEN,
	DISCORD_PREFIX,
	DISCORD_OWNER,
	BASE_URL,
} = process.env;

const Discord = require('discord.js');
const client = new Discord.Client();
client.login(DISCORD_TOKEN);

client.on('ready', () => {
	console.log('Bot is listening');
});

client.on('message', (message) => {

	// If the message does not come from the bot owner
	if(message.author.id !== DISCORD_OWNER) return;
	// If the message does not start with the prefix
	if(!message.content.startsWith(DISCORD_PREFIX)) return;

	// Message analysis
	const args = message.content.slice(DISCORD_PREFIX.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();

	// If the command is create
	if(command === 'create') {

		// Retrieving invoice information
		const member = message.mentions.members.first();
		if(!member) return message.reply('you must mention a member to whom to send an invoice!');
		const sentPrice = args[1];
		if(!sentPrice) return message.reply('you must indicate an amount!');
		const price = sentPrice.endsWith('€') ? parseFloat(sentPrice.split('€')[0]) : parseFloat(sentPrice);
		if(!price) return message.reply('you must indicate a ** valid ** amount!');
		const name = args.slice(2).join(' ');
		if(!name) return message.reply('you must enter an invoice name!');
		const user = client.db.get(member.id);
		if(!user) client.db.set(member.id, []);

		// Invoice generation
		const paymentID = Math.random().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5);
		const paymentData = {
			id: paymentID,
			userID: member.id,
			username: member.user.username,
			avatarURL: member.user.displayAvatarURL(),
			paid: false,
			price,
			name,
		};
		// Saving the invoice
		client.db.push(member.id, paymentData);

		// Sending the invoice
		const embed = new Discord.MessageEmbed()
			.setAuthor(`Hello, ${member.user.tag}`, member.user.displayAvatarURL())
			.setDescription('Here is a summary of your order:')
			.addField('Name', paymentData.name, true)
			.addField('Price', `${paymentData.price}€`, true)
			.addField('Payment', `[Click here](${BASE_URL}/payment/${member.id}/${paymentData.id})`)
			.setColor('#0091fc')
			.setFooter('Once payment is made, you will receive a confirmation message');

		member.user.send(embed);

		message.reply(`invoice sent to ${member.toString()}!`);
	}

});

module.exports = client;
