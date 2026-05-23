// priority: 0

/**
 * SevTech: Ages 1.20.1 Recipes Migration Script.
 * 
 * Replaces the legacy 1.12.2 CraftTweaker recipe modifications.
 * Server scripts handle recipe removals, additions, and machine integration recipes.
 */

ServerEvents.recipes(event => {
    // ==================================
    // 1. Recipe Removals
    // ==================================

    // List of mod IDs whose recipes should be completely removed (replaced by our custom progression)
    const blacklistedMods = [
        'totemic',
        'spartanshields',
        'dungpipe',
        'wopper'
    ];

    blacklistedMods.forEach(modId => {
        if (Platform.isModLoaded(modId)) {
            event.remove({ mod: modId });
        }
    });

    // Remove specific item recipes
    const blacklistedItems = [
        'minecraft:charcoal_block',
        'minecraft:furnace' // Gate furnace behind bronze/iron age
    ];

    blacklistedItems.forEach(item => {
        event.remove({ output: item });
    });

    // Remove by recipe ID
    const blacklistedRecipeIds = [
        'chisel:emerald',
        'chisel:redstone'
    ];

    blacklistedRecipeIds.forEach(recipeId => {
        event.remove({ id: recipeId });
    });

    // ==================================
    // 2. Custom Shaped & Shapeless Recipes
    // ==================================

    // Flint hatchet (Primitive tool for Age 0)
    if (Platform.isModLoaded('notreepunching')) {
        event.remove({ output: 'notreepunching:flint_axe' });
        
        event.shaped('notreepunching:flint_axe', [
            'FS',
            ' W'
        ], {
            F: 'minecraft:flint',
            S: 'notreepunching:loose_rock', // Flint knapping rock
            W: 'minecraft:stick'
        });
    }

    // Gated Furnace (Requires copper/bronze plating in modern SevTech)
    event.shaped('minecraft:furnace', [
        'CCC',
        'C C',
        'CCC'
    ], {
        C: '#forge:cobblestone' // Require stone
    });

    // ==================================
    // 3. Create Mod Integration (Age 0 Mechanical Progression)
    // ==================================
    if (Platform.isModLoaded('create')) {
        // Example: Making plates using the Create Mechanical Press
        // Replaces the old Better With Mods grinding / pressing
        event.recipes.create.pressing('kubejs:compressed_iron_plate', 'minecraft:iron_ingot');
        event.recipes.create.pressing('kubejs:steeleaf_plate', 'twilightforest:steeleaf_ingot');

        // Example: Millstone grinding
        // Replaces the legacy horse grinder
        event.recipes.create.milling([
            'minecraft:wheat_flour',
            Item.of('minecraft:wheat_flour').withChance(0.5)
        ], 'minecraft:wheat');

        // Example: Basin Mixing (Staged Alloy)
        // Mixing Copper and Tin to make Bronze in Age 1
        event.recipes.create.mixing('3x #forge:ingots/bronze', [
            '3x #forge:ingots/copper',
            '1x #forge:ingots/tin'
        ]).heated();
    }
});
