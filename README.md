# Banana Man

A 2D pixel-art top-down survival shooter. The fruit has turned. Bring a banana to a gunfight.

## Play locally

Run `node server.mjs` and open http://127.0.0.1:5173 in a desktop browser. No package installation or build step is required. The game uses Canvas 2D and original bitmap sprites. Optional Google Fonts fall back to system fonts offline.

## Controls

- WASD or arrow keys: move
- Mouse: aim; hold left click to fire
- Space: dash with brief invulnerability and a 1.6-second cooldown
- Escape: pause / resume
- Sound button: toggle synthesized effects

Survive increasingly difficult waves. Purple fruit appears from wave 3 and takes more hits. Every tenth defeated enemy drops health. Crates block movement and shots. Your best score is saved in browser local storage when available.

## Project

- `src/game.js`: Canvas 2D rendering, bitmap sprites, combat, waves, input and sound
- `style.css`: pixel-style menus and HUD
- `server.mjs`: dependency-free local development server
- `src/game-3d.js` and `vendor/`: preserved original Three.js prototype, not loaded by the current game

Run `node --check src/game.js` for a syntax check. This is a desktop prototype; touch controls and multiplayer are not implemented.

## Combat feel

Shots have recoil, muzzle flashes, trails and layered synthesized audio (enabled by default; use Sound to mute). Hits add knockback, white sprite flashes and brief hit-stop. Defeats create chunky particles, fruit splats and floating score rewards. Consecutive kills within 2.2 seconds award a multiplier capped at 5x. Dashes leave afterimages. Screen shake respects the system reduced-motion setting.

The original 112 BPM funk soundtrack features a syncopated bassline, swung hi-hats, kick/snare groove, wah-style chord stabs and a pentatonic hook. It starts when you play, fades out on pause, and resumes with gameplay. MUSIC toggles the soundtrack independently; SOUND mutes all audio. Music is synthesized locally without downloads.

## Bananarang

Start with only the banana gun. Choose BANANARANG from a between-wave upgrade draft to unlock and equip it for the run. PEEL THROUGH only appears once it is unlocked. Scroll the mouse wheel or press Q to switch owned weapons, or use the number shown in the weapon HUD. You can also click the weapon display. Hold left click to throw. One bananarang can be airborne at a time. It flies straight outward at constant speed, piercing one enemy before returning on the next enemy hit. Crates and arena walls always turn it back. The stacking PEEL THROUGH upgrade adds two enemy pierces per throw. It can hit other enemies along its return path, without double-hitting the enemy that turned it around. it passes through cover on return so it cannot get stuck. You can switch back to the gun while it returns.


## Roguelike runs

After each cleared wave, combat pauses and three distinct random upgrades appear. Click a card or press 1, 2, or 3 to choose one. The next wave starts only after selection. Upgrades stack for the current run and reset on restart; your personal best remains saved.

The pool includes damage, fire rate, maximum health, replenishing shields, movement speed, dash cooldown, wave-clear healing, knockback, full healing, and two weapon unlocks. Bunch Blaster fires five short-range rounds; Big Banana fires slower rounds with triple damage. Q and the scroll wheel cycle all unlocked weapons; 1–4 select them directly outside the upgrade screen. Capped upgrades and already-unlocked weapons are excluded from future drafts. Enemy health increases every two waves, with an extra bump every eight waves.

Validation: `node --test src/upgrades.test.js src/run-flow.test.js` checks draft uniqueness, stacking/caps, wave-clear gating, single-choice application, weapon behavior, shields, and run resets.


## Menus

The main menu includes Play, How to Play, Settings and your personal best. Press Escape or click PAUSE during combat to open the pause menu. It includes resume, restart, return to main menu, controls, audio toggles and current build details. Restart and leaving an active run have an in-game confirmation. Escape backs out of a pause submenu before resuming. Returning to the menu preserves your best score but ends the run.

Each weapon now has its own hand-drawn pixel silhouette and HUD icon: a compact pistol, twin-barrel Bunch Blaster, oversized Big Banana cannon with teal fittings, and a broad curved bananarang. Muzzle effects align with each barrel profile.

Additional upgrade weapons: Peel Railgun fires every 0.85 seconds for 2.5× damage and hits up to four enemies; Banana Bomber fires every 0.95 seconds for 2× area damage within 48 arena units, detonating on impact or fuse expiry without self-damage. All benefit from damage and firing-speed upgrades. Use Q/wheel to cycle or keys 1–7 for the current arsenal order.

## Enemy behaviors

- Charging Lime (wave 2+): marks its direction for 0.65 seconds, charges in a straight line, then recovers.
- Cherry Spitter (wave 3+): keeps its distance and telegraphs aimed seed shots. Crates block the projectiles; shields and dash invulnerability protect against them.
- Splitter Melon (wave 5+): slow, large and durable. Defeating it spawns two smaller, lower-health Seedlings with the same telegraphed charge and recovery as limes; both count toward clearing the wave.

Tomatoes and tougher grapes remain in the mix. New enemies have distinct pixel sprites and attack cues. Enemy projectiles are cleared between waves and on restart.


## Banana Phone

Defeat 50 enemies to fill the Banana Phone meter. Press F or click the meter during combat to spend the charge. After a 0.9-second warning and horn, the Banana Express truck sweeps left to right across the middle horizontal third of the arena. Enemies in its path are crushed (including melons without spawning seedlings), and enemy projectiles are cleared. The truck does not harm the player or change crate positions. Truck kills award score but do not recharge the phone. Charge carries between waves; a new run resets it. Pausing freezes the call-in, and the next upgrade draft waits for the truck to finish.

Stat upgrade balance: Rapid Ripening grants +35% additive fire rate per pick; Hearty Bunch grants +2 max hearts and heals 3; Thick Peel grants 2 shields per wave; Banana Boots grants +20% movement; Slipstream removes 0.30 seconds from dash cooldown (four levels); Fresh Delivery heals 2 per level each wave; Pulp Fiction grants +60% knockback; Peel Through adds 2 pierces. Emergency Smoothie now also grants +1 permanent max heart for the run before fully healing. Base damage upgrades remain +1, benefiting every owned weapon.

Weapon cards can repeat: the first pick unlocks a weapon at level 1; further picks level it up to level 5. The starting Banana Gun begins at level 1 and can also be upgraded. Each extra level adds 25% base damage and 10% base firing speed (flight and return speed for the bananarang), stacking with global upgrades. Maxed weapons leave the draft pool. Weapon levels appear on cards, the HUD, and the pause menu, and reset each run.

Choose the Banana Gun or Banana Catana on the main menu to start with it at level 1. Other weapons must be unlocked during that run. Restart keeps your selected starter; all weapon levels reset. The SMG has been removed.

Banana Catana: choose it as one of the two starters or as a wave reward. Circle the mouse around the player to sweep the blade in either direction; no click required. Reach is 52 arena units, with 2× damage and heavy knockback. A still blade does no damage. Crates block the blade, and each enemy can be struck again after 0.32 seconds while sweeping. Weapon levels increase damage and repeat-hit speed.

Goofy Mode is a main-menu toggle for the next run: a giant head, a 180-unit Catana, every weapon at level 5, 25 base damage, 3× global fire rate, 50 hearts, 12 shields per wave, 2.4× movement, 0.2s dash cooldown, full wave healing, 21 bananarang pierces, and 4× knockback. Normally unlimited upgrades use finite Goofy caps. Waves advance automatically because the build is already maxed. Particle, ring, label, sound, mouse-input, and active-enemy limits bound the extra work. Turn it off before starting a normal run.

Level-5 weapons use a metallic gold palette and five lightweight pixel glints. This includes the held weapons, flying bananarang, Catana, and golden HUD icons; Goofy Mode starts with the gold arsenal. Gold sprites are cached once, and sparkles do not spawn particles.

Armored Coconut: once you own the Catana (including as a starter or in Goofy Mode), 16% of new enemy spawns are armored Coconuts. Their pale armor and overhead sword identify them. They chase slowly and only take Catana damage; bullets, explosions, bananarangs, and the Banana Phone truck are blocked with a CATANA ONLY cue. Switching weapons does not remove their spawn eligibility.

Each selectable weapon has a matching armored enemy: Banana Gun → Iron Apple (PISTOL), Bunch Blaster → Spiked Pineapple (BLASTER), Big Banana → Iron Walnut (CANNON), Peel Railgun → Crystal Dragonfruit (RAIL), Banana Bomber → Blast Orange (BOMBER), and Catana → Armored Coconut (CATANA). Only owned weapons enable their enemies. All specialists share a combined 16% spawn chance, split evenly among eligible types. Their overhead labels show the required weapon; other damage, including the truck, is blocked.

Upgrade cards have cached pixel-art icons: weapon silhouettes for unlocks/levels, and individual glyphs for every stat upgrade. Weapons retain their original banana-yellow palettes. Weapon upgrade cards are yellow; cards that raise a weapon to level 5 have a metallic gold finish. Level-5 weapons retain their gold finish and sparkles; the level-5 upgrade card previews the gold icon.

The wave-reward build summary and pause-menu build page use icon tiles with level/stack badges. Hover or keyboard-focus a tile to see its name and description; tapping focuses it on touch devices. Maxed weapon tiles retain their gold icons.


Every defeated enemy can drop a banana-slice coin, including truck kills: tomatoes and seedlings 20%, limes 30%, cherries 35%, grapes 40%, armored specialists 50%, and melons 60%. Walk over coins to collect them; remaining coins are automatically banked at wave clear. On the upgrade screen, click Reroll or press R to spend one coin on three new eligible choices (previous choices excluded when enough alternatives exist). Rerolls do not heal or advance the wave. Coins carry between waves and reset with a new run.

Starting weapon selection is limited to Banana Gun and Banana Catana. Other weapons remain wave rewards. Goofy Mode still grants its full maxed arsenal.

Every normal run now includes a level-1 Bananarang alongside the selected Banana Gun or Catana. The selected starter remains equipped; use Q or the mouse wheel to switch. Bananarang rewards level it up, and its piercing upgrade is immediately eligible.

Press either Shift key to throw the Bananarang toward the mouse while keeping your current weapon equipped. One throw can be active at a time; press again after it returns. Bananarang is excluded from Q/wheel and number-key selection, and its upgrades never equip it. Its throw and catch do not interrupt gun cooldowns. HUD shows readiness; numbered weapon slots are now 1–6.

Weapon-specific enemies now have individual detailed pixel sprites: steel-plated apple, spiked pineapple, reinforced walnut, crystal dragonfruit, blast-armored orange, and horned samurai coconut. Their required-weapon labels remain visible.

Catana hits now scale with mouse angular speed: slow swings retain normal damage, with a smooth bonus up to 3× at 14 radians/second. The multiplier stacks with weapon and damage upgrades. Pointer-event timing keeps it independent of frame rate; fast hits show a slice multiplier.

Golden progression: ending a run by dying, restarting, or returning to the menu banks floor(unspent collected banana coins / 5) golden coins exactly once. Coins already spent on rerolls and uncollected ground coins do not count; remainders under five are lost. The main-menu Golden Shop sells permanent health, damage, firing speed, movement, and shield upgrades with rising prices and level caps. Purchases apply to future normal runs; Goofy Mode retains its fixed boosted stats. Golden balance and purchases persist in browser local storage across runs and reloads.

Golden Mode unlocks permanently in the Golden Shop for 5 golden coins. Toggle it on the main menu (exclusive with Goofy Mode). All seven weapons start at level 5 and accept five further upgrades, reaching diamond at level 10. Permanent stats still apply. Enemies have double health, 20% more movement speed, 35% larger waves, and 20% shorter spawn intervals (minimum interval unchanged). Regular wave drafts and coin rewards remain active.

Hidden shortcut: click the Settings tab five consecutive times in either menu to permanently unlock and max every Golden Shop item for free, including Golden Mode. Other clicks or leaving the menu reset the sequence. Golden coin balance is unchanged; stat bonuses apply to the next run.

Diamond Shop: Golden Mode runs convert every five unspent banana coins into one diamond banana coin instead of gold. The saved diamond wallet buys permanent health, damage, attack speed, movement, and shield bonuses for future Golden Mode runs, stacking with Golden Shop upgrades. Prices and caps match the gold tier. The five-click Settings shortcut also maxes Diamond Shop items.

Settings → Reset Progress opens a confirmation before clearing saved gold/diamond balances, permanent purchases, Golden Mode unlock, and personal best. It ends the current run without conversion rewards and returns to Settings. Cancel or Escape keeps progress. Audio preferences are unchanged.

Cherry seeds can be shot, exploded, or destroyed by the Bananarang. A moving Catana bats them away from the player as fast friendly baseballs, with speed and damage scaling with the swing. Returned seeds count as Catana attacks, respect enemy armor and cover, and cannot hurt the player.

Every tenth wave is a solo King Melon boss fight. The crowned boss alternates marked charges and radial seed bursts, with faster attacks below half health. Seeds remain destructible and bat-backable. A health bar shows progress; later bosses scale health by 1.65× per encounter, and Golden Mode doubles it. Defeating a boss awards five banana coins and the usual wave upgrade. A truck hit deals 25% of boss max health once per call.

Main menu → Boss Practice lets you select exactly three switchable weapons and jump directly to King Melon on wave 10. The Shift Bananarang is included separately. Permanent upgrades and the selected Golden/Goofy mode apply; weapons start at level 1 normally or 5 in those modes. After defeating the boss, the run continues normally.

Choose Bananarang or Bombnana as your Shift secondary on the Play tab. Bombnana places a stationary bomb at your feet, explodes after exactly one gameplay second, deals 5× base damage in a 70-unit radius, and never hurts the player. Base recharge is 3 seconds, reduced by attack-speed/weapon levels. Only one bomb can be armed; pausing freezes its fuse. Bombnana upgrades replace Bananarang upgrades when selected. It cannot be equipped as a primary and respects weapon-specific enemy armor. Boss Practice uses the same secondary choice.
