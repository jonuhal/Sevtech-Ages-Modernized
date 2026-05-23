// priority: 10

/**
 * SevTech: Ages 1.20.1 Core Staging Script (Phase 3 Finalized).
 * 
 * Replaces legacy CraftTweaker ZenStages, TinkerStages, and ItemStages.
 * This server-side KubeJS script manages all stages, dimension restrictions,
 * ore/item pickup gating, and item interaction blocks.
 */

// 1. Stage Definitions
const STAGES = {
    TUTORIAL: 'tutorial',
    ZERO: 'zero',
    ONE: 'one',
    TWO: 'two',
    THREE: 'three',
    FOUR: 'four',
    FIVE: 'five',
    CREATIVE: 'creative',
    DISABLED: 'disabled'
};

// 2. Dimension Gating Mapping
const DIMENSION_STAGES = {
    'undergarden:undergarden': STAGES.ONE,
    'twilightforest:twilight_forest': STAGES.TWO,
    'minecraft:the_nether': STAGES.THREE,
    'minecraft:the_end': STAGES.FOUR
};

// 3. Item Staging Mapping (Pickup & Usage locks)
const ITEM_STAGES = {
    // Stage One (Bronze Age) Locks
    'minecraft:copper_ingot': STAGES.ONE,
    'minecraft:copper_block': STAGES.ONE,
    'create:copper_sheet': STAGES.ONE,
    'create:bronze_ingot': STAGES.ONE,
    'create:bronze_sheet': STAGES.ONE,

    // Stage Two (Iron/Arcane Age) Locks
    'minecraft:iron_ingot': STAGES.TWO,
    'minecraft:iron_ore': STAGES.TWO,
    'minecraft:raw_iron': STAGES.TWO,
    'minecraft:gold_ingot': STAGES.TWO,
    'minecraft:gold_ore': STAGES.TWO,
    'minecraft:lapis_lazuli': STAGES.TWO,
    'minecraft:lapis_ore': STAGES.TWO,
    'minecraft:redstone': STAGES.TWO,
    'minecraft:redstone_ore': STAGES.TWO,
    'minecraft:furnace': STAGES.TWO,

    // Stage Three (Industrial Age) Locks
    'create:steel_ingot': STAGES.THREE,
    'immersiveengineering:ingot_steel': STAGES.THREE,
    'immersiveengineering:ingot_lead': STAGES.THREE,
    'immersiveengineering:ingot_nickel': STAGES.THREE,
    'minecraft:soul_sand': STAGES.THREE,
    'minecraft:quartz': STAGES.THREE,
    'minecraft:nether_quartz_ore': STAGES.THREE,

    // Stage Four (High Tech Age) Locks
    'ae2:certus_quartz_crystal': STAGES.FOUR,
    'ae2:charged_certus_quartz_crystal': STAGES.FOUR,
    'pneumaticcraft:ingot_iron_compressed': STAGES.FOUR,

    // Stage Five (Space Age) Locks
    'mekanism:ingot_osmium': STAGES.FIVE,
    'mekanism:osmium_ore': STAGES.FIVE,
    'immersiveengineering:ingot_uranium': STAGES.FIVE,
    'immersiveengineering:ore_uranium': STAGES.FIVE,
    'ad_astra:steel_engine': STAGES.FIVE,
    'ad_astra:tier_1_rocket': STAGES.FIVE
};

// 4. Block Interaction / Placement Gating Mapping
const BLOCK_STAGES = {
    'minecraft:furnace': STAGES.TWO,
    'minecraft:blast_furnace': STAGES.THREE,
    'minecraft:smoker': STAGES.TWO,
    'ae2:controller': STAGES.FOUR,
    'mekanism:enrichment_chamber': STAGES.FIVE
};

/**
 * Handle Player Teleportation / Dimension Staging.
 * If a player teleports to a staged dimension without the correct stage, 
 * cancel the teleport and notify them.
 */
PlayerEvents.tick(event => {
    const { player } = event;
    // Only check every 20 ticks (1 second) to be extremely performant!
    if (player.age % 20 !== 0) return;

    const dimension = player.level.dimension.toString();
    const requiredStage = DIMENSION_STAGES[dimension];

    if (requiredStage && !player.stages.has(requiredStage)) {
        player.tell(Text.red(`You do not possess the knowledge to survive in this dimension yet! Required Age: ${requiredStage.toUpperCase()}`));
        // Silently teleport the player back to the Overworld at their relative portal coordinates
        player.server.runCommandSilent(`execute in minecraft:overworld run tp ${player.username} ~ ~ ~`);
    }
});

/**
 * Handle Item Pickups.
 * Prevents players from picking up items they are not staged to handle.
 */
ItemEvents.canPickUp(event => {
    const { player, item } = event;
    const requiredStage = ITEM_STAGES[item.id];

    if (requiredStage && !player.stages.has(requiredStage)) {
        player.tell(Text.red(`You do not understand how to use this item! Required Age: ${requiredStage.toUpperCase()}`));
        event.cancel();
    }
});

/**
 * Handle Block Placement.
 * Prevents players from placing advanced blocks they haven't researched.
 */
BlockEvents.placed(event => {
    const { player, block } = event;
    const requiredStage = BLOCK_STAGES[block.id];

    if (requiredStage && !player.stages.has(requiredStage)) {
        player.tell(Text.red(`You do not possess the knowledge to construct this block! Required Age: ${requiredStage.toUpperCase()}`));
        event.setCanceled(true);
    }
});

/**
 * Handle Right-Click Block Interaction.
 * Prevents players from using advanced machines/stations (e.g. AE2 Controller, Mekanism Enrichment Chamber).
 */
BlockEvents.rightClicked(event => {
    const { player, block } = event;
    const requiredStage = BLOCK_STAGES[block.id];

    if (requiredStage && !player.stages.has(requiredStage)) {
        player.tell(Text.red(`You do not know how this mechanism functions! Required Age: ${requiredStage.toUpperCase()}`));
        event.setCanceled(true);
    }
});

/**
 * Handle Player Login / Sync.
 */
PlayerEvents.loggedIn(event => {
    const { player } = event;
    
    // Default tutorial and Stage Zero stages if the player is new
    if (!player.stages.has(STAGES.TUTORIAL)) {
        player.stages.add(STAGES.TUTORIAL);
        player.stages.add(STAGES.ZERO);
        player.tell(Text.green('Welcome to SevTech: Ages (Upgraded to 1.20.1)! Begin by collecting flint and fibers.'));
    }
});

/**
 * Handle Advancement Unlocks.
 * When players earn custom advancements in our datapack, award them the matching game stage.
 */
PlayerEvents.advancement(event => {
    const { player, advancement } = event;
    
    if (advancement.id.toString() === 'sevtech:stage0/root') {
        if (!player.stages.has(STAGES.ZERO)) {
            player.stages.add(STAGES.ZERO);
            player.tell(Text.green('You have advanced to the Stone Age (Stage Zero)! You can now break and craft primitive wooden logs and tools.'));
            player.playSound('minecraft:ui.toast.challenge_complete');
        }
    }
});

/**
 * Handle Grass Breaking to Drop Plant Fiber.
 * Since other mods or internal configs can override datapack loot tables,
 * this KubeJS event guarantees that breaking grass with bare hands drops plant fibers.
 */
BlockEvents.broken(event => {
    const { block, level, player } = event;
    
    // Only run on the server side
    if (level.isClientSide()) return;
    
    // 1. Grass & Tall Grass drop Plant Fiber
    if (block.id === 'minecraft:grass' || block.id === 'minecraft:tall_grass') {
        const chance = block.id === 'minecraft:grass' ? 0.65 : 0.80;
        if (Math.random() < chance) {
            // Do not drop if using shears or silk touch
            const mainHandItem = player.getMainHandItem();
            if (mainHandItem.id === 'minecraft:shears' || mainHandItem.hasEnchantment('minecraft:silk_touch', 1)) {
                return;
            }
            
            // Spawn plant fiber entity safely
            let itemEntity = level.createEntity('item');
            itemEntity.item = 'notreepunching:plant_fiber';
            itemEntity.setPosition(block.x + 0.5, block.y + 0.5, block.z + 0.5);
            itemEntity.spawn();
        }
    }

    // 2. Tree Leaves drop Sticks (15% chance, matching the original SevTech Ages)
    if (block.hasTag('minecraft:leaves')) {
        if (Math.random() < 0.15) {
            let itemEntity = level.createEntity('item');
            itemEntity.item = 'minecraft:stick';
            itemEntity.setPosition(block.x + 0.5, block.y + 0.5, block.z + 0.5);
            itemEntity.spawn();
        }
    }
});

console.info("SevTech Phase 5 Staging & Advancement Subsystem fully loaded.");
