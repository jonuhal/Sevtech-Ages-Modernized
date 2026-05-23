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
