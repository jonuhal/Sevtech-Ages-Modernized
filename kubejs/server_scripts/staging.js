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
PlayerEvents.changedDimension(event => {
    const { player, to } = event;
    const requiredStage = DIMENSION_STAGES[to.toString()];

    if (requiredStage && !player.stages.has(requiredStage)) {
        player.tell(Text.red(`You do not possess the knowledge to survive in this dimension yet! Required Age: ${requiredStage.toUpperCase()}`));
        event.setCanceled(true);
    }
});

/**
 * Handle Item Pickups.
 * Prevents players from picking up items they are not staged to handle.
 */
PlayerEvents.pickupItem(event => {
    const { player, itemEntity } = event;
    const itemStack = itemEntity.item;
    const requiredStage = ITEM_STAGES[itemStack.id];

    if (requiredStage && !player.stages.has(requiredStage)) {
        player.tell(Text.red(`You do not understand how to use this item! Required Age: ${requiredStage.toUpperCase()}`));
        event.setCanceled(true);
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
    
    // Default tutorial stage if the player is new
    if (!player.stages.has(STAGES.TUTORIAL)) {
        player.stages.add(STAGES.TUTORIAL);
        player.tell(Text.green('Welcome to SevTech: Ages (Upgraded to 1.20.1)! Begin by collecting flint and fibers.'));
    }
});

console.info("SevTech Phase 3 Staging Subsystem fully loaded.");
