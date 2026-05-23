// priority: 0

/**
 * SevTech: Ages 1.20.1 JEI Integration Client Script.
 * 
 * Client-side scripts execute on the player's client and handle UI modifications,
 * tooltip rendering, and JEI/REI item hiding.
 */

JEIEvents.hideItems(event => {
    // 1. Completely disabled items (hidden from JEI for all players)
    const disabledItems = [
        'cyclicmagic:uncrafting_block', // Uncrafting blocks are highly exploitable in expert packs
        'environmentaltech:modifier_creative_flight'
    ];

    disabledItems.forEach(item => {
        if (Item.of(item).id !== 'minecraft:air') {
            event.hide(item);
        }
    });

    // 2. Hide items that are stage-restricted in JEI.
    // In 1.20.1, Game Stages integrates with JEI automatically, hiding recipes 
    // and items in the search panel based on what stages the player has unlocked.
    // This client script is used as a fallback or for specific aesthetic cleanup.
    
    console.info("JEI Staged Items cleanups applied successfully.");
});

/**
 * Custom tooltips for progression items.
 */
ItemEvents.tooltip(event => {
    // Add custom tooltips to guide players on how to progress
    event.add('kubejs:creeper_tear', Text.darkAqua('Obtained by performing an occult ritual on an enraged creeper.'));
    
    event.add('minecraft:furnace', [
        Text.red('Requires Copper or Bronze casing to craft.'),
        Text.gray('Age 1 progression item.')
    ]);
});
