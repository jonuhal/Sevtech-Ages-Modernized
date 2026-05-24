// priority: 0

/**
 * SevTech: Ages 1.20.1 Recipes Migration Script (Phase 4 Finalized).
 * 
 * Replaces the legacy 1.12.2 recipe configurations for Primal Tech, Horse Power, and early vanilla.
 * Manages comprehensive recipe modifications for:
 * - No Tree Punching (Flint tools, Knapping, primitive fires)
 * - Create Mod (Age 0 Mechanical Windmills, Waterwheels, Millstone, Mixing Basin)
 * - Early progression gating (Blocks vanilla iron tools, chests, and furnaces early on)
 */

ServerEvents.recipes(event => {
    // ==================================
    // 1. Primitive Recipe Removals
    // ==================================
    
    // Remove vanilla wood plank recipes (forces the player to use a chopping block/saw)
    event.remove({ output: 'minecraft:oak_planks', type: 'minecraft:crafting_shapeless' });
    event.remove({ output: 'minecraft:spruce_planks', type: 'minecraft:crafting_shapeless' });
    event.remove({ output: 'minecraft:birch_planks', type: 'minecraft:crafting_shapeless' });
    event.remove({ output: 'minecraft:jungle_planks', type: 'minecraft:crafting_shapeless' });
    event.remove({ output: 'minecraft:acacia_planks', type: 'minecraft:crafting_shapeless' });
    event.remove({ output: 'minecraft:dark_oak_planks', type: 'minecraft:crafting_shapeless' });
    event.remove({ output: 'minecraft:mangrove_planks', type: 'minecraft:crafting_shapeless' });
    event.remove({ output: 'minecraft:cherry_planks', type: 'minecraft:crafting_shapeless' });

    // Remove vanilla wooden chest recipe (gates storage behind carpentry in Age 1)
    event.remove({ output: 'minecraft:chest', type: 'minecraft:crafting_shaped' });

    // Remove vanilla torches (forces fiber torches in Age 0)
    event.remove({ output: 'minecraft:torch', type: 'minecraft:crafting_shaped' });

    // Remove early metal tools (iron, gold, diamond) to prevent bypasses
    event.remove({ output: '#forge:tools/iron' });
    event.remove({ output: '#forge:tools/gold' });
    event.remove({ output: '#forge:tools/diamond' });

    // ==================================
    // 2. No Tree Punching (Age 0 Flint Gating)
    // ==================================
    if (Platform.isLoaded('notreepunching')) {
        // Grass Fiber Mesh Recipe (2x2 grid to break circular dependency!)
        event.shaped('kubejs:grass_fiber_mesh', [
            'SF',
            'FS'
        ], {
            S: 'minecraft:stick',
            F: 'notreepunching:plant_string'
        });

        // Disable all standard flint recipes (such as NTP's 3 gravel -> 1 flint recipe)
        event.remove({ output: 'minecraft:flint', not: { input: 'kubejs:grass_fiber_mesh' } });

        // Gravel + Grass Fiber Mesh -> Flint (Mesh gets damaged by 1 and remains in grid)
        event.shapeless('minecraft:flint', [
            'minecraft:gravel',
            'kubejs:grass_fiber_mesh'
        ]).damageIngredient('kubejs:grass_fiber_mesh', 1);

        // Remove NTP's log-chopping to stick recipes to prevent collision with custom plank chopping recipes
        event.remove({ output: 'minecraft:stick', input: 'notreepunching:flint_axe' });

        // Chopping Logs into Planks using the Flint Axe (representing the legacy Chopping Block workflow)
        var woodTypes = ['oak', 'spruce', 'birch', 'jungle', 'acacia', 'dark_oak', 'mangrove', 'cherry'];
        woodTypes.forEach(wood => {
            event.shapeless(`2x minecraft:${wood}_planks`, [
                `minecraft:${wood}_log`,
                'notreepunching:flint_axe'
            ]).damageIngredient('notreepunching:flint_axe', 1);
        });

        // Force loose rock + flint combination for early flint tools
        event.remove({ output: 'notreepunching:flint_knife' });
        event.shaped('notreepunching:flint_knife', [
            'F',
            'S'
        ], {
            F: 'minecraft:flint',
            S: 'minecraft:stick'
        });

        // Flint Hatchet (forces knapping wood gathering)
        event.remove({ output: 'notreepunching:flint_axe' });
        event.shaped('notreepunching:flint_axe', [
            'FK',
            ' S'
        ], {
            F: 'minecraft:flint',
            K: 'notreepunching:loose_rock',
            S: 'minecraft:stick'
        });

        // Primitive Fire Starter (Sticks + plant fibers)
        event.remove({ output: 'notreepunching:fire_starter' });
        event.shaped('notreepunching:fire_starter', [
            'SS',
            'FF'
        ], {
            S: 'minecraft:stick',
            F: 'notreepunching:plant_fiber'
        });

        // Crafting Table (Work Stump carving)
        // Remove standard crafting table recipes (forces carving a Work Stump out of a log using a flint knife or grass fiber mesh!)
        event.remove({ output: 'minecraft:crafting_table' });
        
        woodTypes.forEach(wood => {
            event.shapeless('minecraft:crafting_table', [
                `minecraft:${wood}_log`,
                'notreepunching:flint_knife'
            ]).keepIngredient('notreepunching:flint_knife');

            event.shapeless('minecraft:crafting_table', [
                `minecraft:${wood}_log`,
                'kubejs:grass_fiber_mesh'
            ]).keepIngredient('kubejs:grass_fiber_mesh');
        });
    }

    // ==================================
    // 3. Early Storage & Utility Crafting
    // ==================================

    // Primitive Fiber Torch (Requires stick and plant fibers in Age 0)
    if (Platform.isLoaded('notreepunching')) {
        event.shaped('3x minecraft:torch', [
            'F',
            'S'
        ], {
            F: 'notreepunching:plant_fiber',
            S: 'minecraft:stick'
        });
    }

    // Stage 1 Gated Wooden Chest (Requires copper nails/plates and wood boards)
    event.shaped('minecraft:chest', [
        'PPP',
        'PCP',
        'PPP'
    ], {
        P: '#minecraft:planks',
        C: '#forge:nuggets/copper' // Gated behind smelting/nuggets
    });

    // ==================================
    // 4. Create Mod Integration (Age 0/1 Kinetic Era)
    // ==================================
    if (Platform.isLoaded('create')) {
        
        // Mechanical Waterwheel (Requires wood boards and copper nuggets in Age 1)
        event.remove({ output: 'create:water_wheel' });
        event.shaped('create:water_wheel', [
            'PPP',
            'PCP',
            'PPP'
        ], {
            P: '#minecraft:planks',
            C: '#forge:ingots/copper'
        });

        // Grinding Flour in the Millstone (Replaces Horse Power grinding block)
        event.recipes.create.milling([
            'minecraft:wheat_flour',
            Item.of('minecraft:wheat_flour').withChance(0.4)
        ], 'minecraft:wheat');

        // Compressing copper into plates via Mechanical Press
        event.recipes.create.pressing('create:copper_sheet', 'minecraft:copper_ingot');

        // Mixing Copper and Tin to smelt Bronze (Gated in Stage 1 Basin Mixing)
        event.recipes.create.mixing('3x create:bronze_ingot', [
            '3x #forge:ingots/copper',
            '1x #forge:ingots/tin'
        ]).heated();
    }
});
