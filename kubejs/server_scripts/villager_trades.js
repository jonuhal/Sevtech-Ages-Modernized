/**
 * SevTech: Ages Modernized - Custom Villager Trading Script
 * 
 * Leverages the MoreJS KubeJS addon to natively modify and inject custom villager trades.
 * This replaces the legacy, unintuitive right-click-with-item interaction block in staging.js,
 * allowing players to trade with professional villagers using the standard vanilla trading GUI.
 * 
 * Trades:
 *  1. Farmer (Level 1 / Novice): 8x Bone Meal -> 1x Farmland (grants "Teach A Man To Farm")
 *  2. Cartographer (Level 1 / Novice): 1x Feather + 8x Charcoal -> 1x Empty Map (grants "Lost but Now Found")
 */

MoreJSEvents.villagerTrades(event => {
    // 1. Remove all vanilla Level 1 trades for Farmer and Cartographer to guarantee progression trades!
    event.removeTrades({
        professions: ['minecraft:farmer'],
        level: 1,
        firstItem: 'minecraft:wheat',
        secondItem: 'minecraft:air',
        outputItem: '*'
    });
    event.removeTrades({
        professions: ['minecraft:farmer'],
        level: 1,
        firstItem: 'minecraft:potato',
        secondItem: 'minecraft:air',
        outputItem: '*'
    });
    event.removeTrades({
        professions: ['minecraft:farmer'],
        level: 1,
        firstItem: 'minecraft:carrot',
        secondItem: 'minecraft:air',
        outputItem: '*'
    });
    event.removeTrades({
        professions: ['minecraft:farmer'],
        level: 1,
        firstItem: 'minecraft:beetroot',
        secondItem: 'minecraft:air',
        outputItem: '*'
    });
    event.removeTrades({
        professions: ['minecraft:farmer'],
        level: 1,
        firstItem: '*',
        secondItem: 'minecraft:air',
        outputItem: 'minecraft:bread'
    });

    event.removeTrades({
        professions: ['minecraft:cartographer'],
        level: 1,
        firstItem: 'minecraft:paper',
        secondItem: 'minecraft:air',
        outputItem: '*'
    });
    event.removeTrades({
        professions: ['minecraft:cartographer'],
        level: 1,
        firstItem: 'minecraft:emerald',
        secondItem: 'minecraft:compass',
        outputItem: 'minecraft:map'
    });

    // 2. Register guaranteed Level 1 progression trades
    // Farmer Trade: 8x Bone Meal -> 1x Farmland
    event.addTrade('minecraft:farmer', 1, Item.of('minecraft:bone_meal', 8), Item.of('minecraft:farmland', 1));

    // Cartographer Trade: 1x Feather + 8x Ink Sac -> 1x Map (Empty Map)
    event.addTrade('minecraft:cartographer', 1, [
        Item.of('minecraft:feather', 1),
        Item.of('minecraft:ink_sac', 8)
    ], Item.of('minecraft:map', 1));
});

console.info("SevTech MoreJS Villager Trading Subsystem fully loaded.");
