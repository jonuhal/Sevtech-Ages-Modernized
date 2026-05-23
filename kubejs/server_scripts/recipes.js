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
    if (Platform.isModLoaded('notreepunching')) {
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
    }

    // ==================================
    // 3. Early Storage & Utility Crafting
    // ==================================

    // Primitive Fiber Torch (Requires stick and plant fibers in Age 0)
    if (Platform.isModLoaded('notreepunching')) {
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
    if (Platform.isModLoaded('create')) {
        
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
