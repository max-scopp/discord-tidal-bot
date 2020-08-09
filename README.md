# discord-tidal-bot

If you read this and want it, but don't know how to make it work:  
**Open an issue to let me know you're interested**

Currently only for testing purposes.
Thank you for understanding!

## Advantages over other music bots

- Runs locally - No cloud service, be assured the bot doesn't silently log messages
- If you have a premium subscription, the HIGH sound quality is quite noticable!
  - Later, you will later be able to change the quality, even LOSSLESS, but I'm afraid this won't change the streamed quality, HIGH is plently good enough.
- YOU have full control, while others are allowed to intervene
- Offers seperate UI to manage everything - No more random commands to remember!
- Intuitive commands for users - Only mention the bot and (mostly) write simple sentences
- Song search is mostly prioritized by your taste, Tidal offers a very good search, even if you have no taste
- You can stream whole Playlists you prepared, or your own whole music library
  - In case you really just want to listen to music together and don't want to worry about it
- Will also support the usual things people stream using bots
  - WIP, but currently planned is direct URL support, YouTube and SoundCloud
- Possibly Lyrics support will be added, not important **_for now_**
- The bot can be re-used over multiple servers (but not simultaneously)

## Disadvantages

- Tidal is less known
- The Tidal api can change anytime as there is **no official api support from tidal**
  - Therefor, this App _could_ break anytime, but it's unlikely
- Does not support broadcasting (same song over multiple servers) - make more bots!
- Everyone else except you have fewer possibilities - they can't (shouldn't\* IMO) just change the track, queue, etc.
  - Please open an Issue with some background info on why if you think otherwise, this could be made configuratable
- Is not always online for others
  - This may change. I'm thinking that the bot can be re-used by other users who have this client.
  - Still, you REQUIRE this client to be able to stream.
- You must create the discord bot yourself, then register him to this App
  - Can be a bit difficult for non-power-users, but I'll make a tutorial!

## Getting started

1. Clone this repo
2. Checkout submodules (the tidalapi fork)
3. Install dependencies
4. Link the tidalapi to `tidal-bot-electron`
5. `npm start` in `tidal-bot-electron`
   - This will compile both the frontend and electron backend
6. When both finished, you'll be promted with the running application.
7. You should see a Login screen that doesn't work yet. Close the app.
8. `vim src/tidal-bot-backend/config.json` and add

```json
{
  "token": "<bot-token>"
}
```

9. `vim ~/.tidal-bot-creds` and add

```json
{
  "username": "<tidal user name/mail>",
  "password": "<tidal password>"
}
```

10. `npm run start:electron`
11. The application should work as intended and you will no longer see the login screen.

**See [my Notes](#notes) in case it does not work as described.**  
Same steps apply to windows, except it's more annoying.

I'm running this with WSL 2, using VcXsrv. Use Node 12.

## Working Features

- Searching from UI (does not suggest yet, see todo)
- Search and play from Discord user-request
- Query your favorites
- Partial Pagination support (will do [VirtualScroll](https://ionicframework.com/docs/api/virtual-scroll))
- Respond to user-requests with the found track, or "not found" otherwise
- Profanity filter

## TODO

List is NOT ordered. Prioritized by mood, or Issue importance if that's happening.

- Let users request a current queue priority list
- Allow user-requests to be cancelable if it's the wrong track
  - Only allow the original requestee
- Add display filter for channel selection
  - All joinable voice channels are NOT grouped by Guilds, should I do that?
  - (e.g. multiple servers have the same channel names, like "General")
- Allow Playlists and Library to be [VirtualScroll](https://ionicframework.com/docs/api/virtual-scroll)-able
- Improve UI
  - Requires to refine [my component-library](https://github.com/max-scopp/msc-public)
- Add URL Support
  - Add directly playable URL support (Example: https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3)
  - Do I _have_ to download the full ressource by third-party modules?
  - Add YouTube support
  - Add SoundCloud support
- Pre load stream URLs (How many? Is the URL static or bound by time?)
- QueueManager
  - Allow Discord suggestions
  - Add Discord suggestion in-timeline, but prefer master-dj entries afterwards
  - Allow "Infinite Playlists" (Doable by API? Did not look at radio stations yet.)
    - Infinite Playlists have the lowest priority and therefor prefers user-suggestions over the next radio-track.
- Add Settings Page
  - Tell the bot who is the master-dj in discord
    - So you can also suggest songs like the others, but prioritized
    - Maybe also some other administrative commands.

## Notes

@discordjs/opus doesn't have prebuild binaries for my setup.

Letting them build using node-gyp works (what a suprise!), but it has some quirky naming scheme and compiles to the wrong path.

<mark>Github Builds?</mark>

Compile to node at compile-time, requests at runtime using electron signature.

Don't know why that even is important to differenciate.
