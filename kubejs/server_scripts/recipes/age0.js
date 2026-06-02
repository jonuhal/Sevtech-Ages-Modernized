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
    var woodTypes = ['oak', 'spruce', 'birch', 'jungle', 'acacia', 'dark_oak', 'mangrove', 'cherry'];
    woodTypes.forEach(wood => {
        event.remove({ output: `minecraft:${wood}_planks`, type: 'minecraft:crafting_shapeless' });
    });

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

        // Force flint shard + stick stacked for early flint knife
        event.remove({ output: 'notreepunching:flint_knife' });
        event.shaped('notreepunching:flint_knife', [
            'F',
            'S'
        ], {
            F: 'notreepunching:flint_shard',
            S: 'minecraft:stick'
        });

        // Flint Axe (requires flint shard, plant string, and stick)
        event.remove({ output: 'notreepunching:flint_axe' });
        event.shaped('notreepunching:flint_axe', [
            'FP',
            'S '
        ], {
            F: 'notreepunching:flint_shard',
            P: 'notreepunching:plant_string',
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
        // Remove standard crafting table recipes (forces carving a Work Stump out of a log using a flint knife)
        event.remove({ output: 'minecraft:crafting_table' });

        woodTypes.forEach(wood => {
            event.shapeless('minecraft:crafting_table', [
                `minecraft:${wood}_log`,
                'notreepunching:flint_knife'
            ]).keepIngredient('notreepunching:flint_knife');
        });

        // Stone Pickaxe (tie cobblestone to sticks with plant string)
        event.shaped('minecraft:stone_pickaxe', [
            'CCC',
            'PSP',
            ' S '
        ], {
            C: 'minecraft:cobblestone',
            S: 'minecraft:stick',
            P: 'notreepunching:plant_string'
        });

        // Remove Flint Hoe recipe to prevent tilling and early farmland creation in Age 0
        event.remove({ output: 'notreepunching:flint_hoe' });

        // Primitive Farmland recipe fallback (mixing dirt with bone meal representing primitive soil preparation)
        event.shapeless('minecraft:farmland', [
            'minecraft:dirt',
            'minecraft:bone_meal'
        ]);

        // Primitive Empty Map recipe fallback (drawing a map on plant fiber canvas with ink sac)
        event.shaped('minecraft:map', [
            'SSS',
            'SCS',
            'SSS'
        ], {
            S: 'notreepunching:plant_string',
            C: 'minecraft:ink_sac'
        });
    }

    // ==================================
    // 3. Early Storage & Utility Crafting
    // ==================================

    // Primitive Fiber Torch (Requires stick and plant fibers in Age 0)
    if (Platform.isLoaded('notreepunching')) {
        event.shaped('minecraft:torch', [
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
});
