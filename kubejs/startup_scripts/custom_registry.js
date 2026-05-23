// priority: 0

/**
 * SevTech: Ages 1.20.1 Custom Registry Startup Script (Phase 2 Finalized).
 * 
 * Replaces the legacy 1.12.2 ContentTweaker scripts:
 * - vanillaFactory.zs (Items)
 * - fluids.zs (Fluids)
 * - materials/init.zs & largeScale.zs & misc.zs (Metals, Gears, Plates)
 * 
 * Modern tech mods (Create, Immersive Engineering, Mekanism, Thermal) natively register
 * standard gears, plates, rods, and fluids (like copper, bronze, tin, steel, plastic, ender, redstone).
 * This script only registers items, blocks, and fluids that are uniquely custom to SevTech's progression.
 */

// 1. Custom Item Registration
StartupEvents.registry('item', event => {
    // Basic Progression & Easter Egg Items
    event.create('creeper_tear')
        .texture('kubejs:item/creeper_tear')
        .displayName('Creeper Tear');

    event.create('grass_fiber_mesh')
        .texture('kubejs:item/grass_fiber_mesh')
        .displayName('Grass Fiber Mesh')
        .containerItem('kubejs:grass_fiber_mesh');

    event.create('the_oj')
        .texture('kubejs:item/the_oj')
        .displayName('The OJ');

    // Unique custom gears for progression gating
    // (Standard metal gears are provided by Create/IE/Thermal)
    const customGears = [
        'compressed_iron_gear',
        'enhanced_galgadorian_gear',
        'galgadorian_gear',
        'modularium_gear',
        'reinforced_metal_gear',
        'steeleaf_gear'
    ];

    customGears.forEach(gear => {
        event.create(gear)
            .texture(`kubejs:item/gear/${gear}`)
            .displayName(gear.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '));
    });

    // Unique custom plates for structural casing progression
    // (Standard plates are provided by Create/IE)
    const customPlates = [
        'enhanced_galgadorian_plate',
        'galgadorian_plate',
        'modularium_plate',
        'reinforced_metal_plate',
        'steeleaf_plate'
    ];

    customPlates.forEach(plate => {
        event.create(plate)
            .texture(`kubejs:item/plate/${plate}`)
            .displayName(plate.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '));
    });
});

// 2. Custom Block Registration
StartupEvents.registry('block', event => {
    // Custom blocks can be registered here if needed for unique multiblocks or structural gating
});

// 3. Custom Fluid Registration
StartupEvents.registry('fluid', event => {
    // Unique fluids registered to support custom recipes & space exploration
    
    // Slime Fluid (Legacy fluids.zs)
    event.create('liquid_slime')
        .thickTexture(0x3F5329) // Olive green
        .displayName('Liquid Slime')
        .bucketColor(0x3F5329);

    // Cheese Fluid (Legacy fluids.zs - used for Moon exploration)
    event.create('liquid_cheese')
        .thinTexture(0xFFE000) // Cheese yellow
        .displayName('Liquid Cheese')
        .bucketColor(0xFFE000);

    // Molten alloys unique to custom progression machines
    const customMoltenAlloys = [
        'enhanced_galgadorian',
        'galgadorian',
        'modularium',
        'reinforced_metal',
        'steeleaf'
    ];

    customMoltenAlloys.forEach(alloy => {
        event.create(`molten_${alloy}`)
            .stillTexture('minecraft:block/water_still') // Base fluid texture
            .flowingTexture('minecraft:block/water_flow')
            .color(0x7F000000) // Default mask color (will be overridden by resourcepack assets)
            .displayName(`Molten ${alloy.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`);
    });
});

console.info("SevTech Phase 2 Custom Registry successfully loaded.");
