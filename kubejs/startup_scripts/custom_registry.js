// priority: 0

/**
 * SevTech: Ages 1.20.1 Custom Registry Startup Script.
 * 
 * Replaces the legacy 1.12.2 ContentTweaker registration.
 * Startup scripts are executed during game boot to register custom items, blocks, and fluids.
 */

StartupEvents.registry('item', event => {
    // Register basic custom items
    event.create('creeper_tear')
        .texture('kubejs:item/creeper_tear')
        .displayName('Creeper Tear');

    event.create('the_oj')
        .texture('kubejs:item/the_oj')
        .displayName('The OJ');

    // Register custom progression gear items (e.g. Bronze, Steel, Compressed Iron gears)
    // Note: Modern tech mods (Create/IE) handle vanilla metal gears, but we register
    // custom ones here if needed for specific progression mechanics.
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

    // Custom plates
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

StartupEvents.registry('block', event => {
    // Custom blocks can be registered here if needed for progression (e.g. custom structure blocks)
});

StartupEvents.registry('fluid', event => {
    // Custom molten metals registered here if they are missing from Tinker's/Create
    const customFluids = [
        'enhanced_galgadorian',
        'galgadorian',
        'modularium',
        'reinforced_metal',
        'steeleaf'
    ];

    customFluids.forEach(fluid => {
        event.create(`molten_${fluid}`)
            .thinTexture(0x7F000000) // Base color mask will be applied via resource pack
            .displayName(`Molten ${fluid.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`);
    });
});
