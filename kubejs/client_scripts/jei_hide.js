// priority: 0

/**
 * SevTech: Ages 1.20.1 JEI Integration Client Script (Phase 4 Finalized).
 * 
 * Client-side scripts execute on the player's client and handle UI modifications,
 * tooltip rendering, and JEI/REI item hiding.
 */

if (typeof JEIEvents !== 'undefined') {
    JEIEvents.hideItems(event => {
        // 1. Completely disabled items (hidden from JEI for all players)
        const disabledItems = [
            'cyclicmagic:uncrafting_block', // Highly exploitable in expert packs
            'environmentaltech:modifier_creative_flight'
        ];

        disabledItems.forEach(item => {
            if (Item.of(item).id !== 'minecraft:air') {
                event.hide(item);
            }
        });

        // 2. Hide vanilla/advanced progression items early in the game
        // Although Game Stages and JEI/REI Stages handle hiding dynamically in-game
        // based on stages, this list guarantees that standard bypasses are hard-hidden.
        const gatedEarlyItems = [
            // Vanilla tools gated behind Age 2 (Iron Age)
            'minecraft:iron_sword', 'minecraft:iron_shovel', 'minecraft:iron_pickaxe', 'minecraft:iron_axe', 'minecraft:iron_hoe',
            'minecraft:iron_helmet', 'minecraft:iron_chestplate', 'minecraft:iron_leggings', 'minecraft:iron_boots',
            
            // Vanilla tools gated behind Age 3 (Industrial/Nether Age)
            'minecraft:golden_sword', 'minecraft:golden_shovel', 'minecraft:golden_pickaxe', 'minecraft:golden_axe', 'minecraft:golden_hoe',
            
            // Vanilla tools gated behind Age 5 (High Tech / Space Age)
            'minecraft:diamond_sword', 'minecraft:diamond_shovel', 'minecraft:diamond_pickaxe', 'minecraft:diamond_axe', 'minecraft:diamond_hoe',
            'minecraft:diamond_helmet', 'minecraft:diamond_chestplate', 'minecraft:diamond_leggings', 'minecraft:diamond_boots',
            'minecraft:netherite_sword', 'minecraft:netherite_shovel', 'minecraft:netherite_pickaxe', 'minecraft:netherite_axe', 'minecraft:netherite_hoe'
        ];

        gatedEarlyItems.forEach(item => {
            event.hide(item);
        });

        // 3. Hide entire advanced mods from JEI in Age 0
        const gatedMods = [
            'ad_astra',     // Stage 5
            'occultism',    // Stage 1/2
            'undergarden'   // Stage 1
        ];
        gatedMods.forEach(mod => {
            event.hide(RegExp(`^${mod}:.*`));
        });

        // 4. Hide advanced vanilla elements from JEI in Age 0 (Redstone, beds, ores, chainmail/armor)
        const advancedVanillaPatterns = [
            /^minecraft:iron_.*/,
            /^minecraft:gold_.*/,
            /^minecraft:raw_gold.*/,
            /^minecraft:diamond_.*/,
            /^minecraft:netherite_.*/,
            /^minecraft:redstone.*/,
            'minecraft:repeater',
            'minecraft:comparator',
            'minecraft:piston',
            'minecraft:sticky_piston',
            'minecraft:observer',
            'minecraft:dispenser',
            'minecraft:dropper',
            'minecraft:daylight_detector',
            /^minecraft:.*_bed$/,
            /^minecraft:leather_(helmet|chestplate|leggings|boots)/,
            /^minecraft:chainmail_(helmet|chestplate|leggings|boots)/,
            /^minecraft:.*_spawn_egg$/,
            'minecraft:coal_ore',
            'minecraft:deepslate_coal_ore',
            'minecraft:copper_ore',
            'minecraft:deepslate_copper_ore',
            'minecraft:iron_ore',
            'minecraft:deepslate_iron_ore',
            'minecraft:gold_ore',
            'minecraft:deepslate_gold_ore',
            'minecraft:redstone_ore',
            'minecraft:deepslate_redstone_ore',
            'minecraft:lapis_ore',
            'minecraft:deepslate_lapis_ore',
            'minecraft:emerald_ore',
            'minecraft:deepslate_emerald_ore',
            'minecraft:diamond_ore',
            'minecraft:deepslate_diamond_ore',
            'minecraft:nether_gold_ore',
            'minecraft:nether_quartz_ore'
        ];

        advancedVanillaPatterns.forEach(pattern => {
            event.hide(pattern);
        });

        console.info("JEI Staged Items cleanups applied successfully.");
    });
}

/**
 * Custom tooltips for progression items.
 */
ItemEvents.tooltip(event => {
    // Add custom tooltips to guide players on how to progress
    event.add('kubejs:creeper_tear', Text.darkAqua('Obtained by performing an occult ritual on an enraged creeper.'));
    
    event.add('minecraft:chest', [
        Text.gold('Carpentry Storage'),
        Text.gray('Age 1 progression item. Requires Copper nails/nuggets to craft.')
    ]);

    event.add('minecraft:furnace', [
        Text.red('Requires Copper or Bronze casing to craft.'),
        Text.gray('Age 2 progression item.')
    ]);
});
