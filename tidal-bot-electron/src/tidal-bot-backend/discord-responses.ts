import DiscordStreamable from "./discord";
import { Message } from "discord.js";

export default class DiscordResopnse {
  noSongFound(message: Message) {
    message.react('😔');
    message.reply(`Nothing found. Sorry.`);
  }

  constructor(private readonly parent: DiscordStreamable) {

  }

  async pong(message: Message) {
    message.reply(`Pong! ∆ ${message.createdTimestamp - Date.now()}ms`)
  }

  async somethingProfane(message: Message) {
    const profaneAnswers = [
      "Fuck you.",
      "No.",
      "I hope your mum doesn't hear that.",
      "Rude bitches make me tired.",
      "Boomer.",
      "Rebellious you.",
      "Don't sweat much for a fat girl.",
      "Woa.",
      "RUDE!",
      "At the end of the night, your sides hurt, your mascara's ruined, and you realize you haven't eaten anything for almost an hour",
      "Stop dressing your six-year-old like a skank.",
      "It's all your fault, you know.",
      "AHOLEHOLE",
      "BUMFIDDLER",
      "COCKAPERT",
      "And so rude, your honor!",
      "He wasn't trying to be rude; he was merely fending off an uncomfortable subject.",
      "This man seemed to me to lean over the cornice, and timidly whisper his half truth to the rude occupants who really knew it better than he.",
      "I'm sorry, that was rude.",
      "I resent your rude attitude.",
      "You really are rude, aren't you?",
      "Impolite, not to say rude.",
      "Quatsch mit Soße",
      "Bockmist",
      "The kind of person that would miss the urinal.",
      "Holy moly!",
      "How is the air down there?",
      "Can you actually buy your clothes in the children's department? Then they are cheaper.",
      "Insults are the cause of those who are wrong.",
      "If a donkey kicks you, never speak of it!",
      "The wise one forgets the insults as the ungrateful one forgets the favors.",
      "If you want to eat, don't offend the cook.",
      "Who lives who is not offended or offended?",
      "The stone that is not in your way does not offend you.",
      "What went wrong with you in development?",
      "What did you look like before your accident?",
      "Don't you have a loo at home or why are you dumping all that shit here?",
      "Let the doctor examine you for possible brain damage to your ass.",
      "Are your parents chemists? Looks like try!",
      "If your father had wanked against the stove, you would only have stinked briefly!",
      "Another saying and you can suck your food out of the sippy cup!",
      "Go home if you have no friends!",
      "You're dumber than a pig skips high.",
      "What's more fluid than water? You! Because you are superfluous!",
      "Your mother should have swallowed you.",
      "\"Fool!\" Thank you for introducing your name."
    ];

    message.react('😤');
    const answer = profaneAnswers[Math.floor(Math.random() * profaneAnswers.length)]
    message.reply(answer);
  }

  async joinSendersVoiceChannel(message: Message) {

    // Join the same voice channel of the author of the message
    if (message.member.voice.channel) {
      try {
        await message.member.voice.channel.join();
        message.reply(`Yes, senpai. ${message.member.voice.channel.name}, I'm there.`);
      } catch (e) {
        message.reply(`Shucks. Try again later. ${e}`);
      }
    }
  }
}