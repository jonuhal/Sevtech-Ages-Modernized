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
    'occultism:datura_seeds': STAGES.ONE,

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

// 5. Block Breaking / Ore Staging Locks (Simulating OreStages)
const BLOCK_BREAK_STAGES = {
    // Stage One (Bronze Age / Stone Age transition) Ore Locks
    'minecraft:coal_ore': STAGES.ONE,
    'minecraft:deepslate_coal_ore': STAGES.ONE,
    'minecraft:coal_block': STAGES.ONE,
    'minecraft:copper_ore': STAGES.ONE,
    'minecraft:deepslate_copper_ore': STAGES.ONE,
    'minecraft:raw_copper_block': STAGES.ONE,
    'minecraft:copper_block': STAGES.ONE,

    // Stage Two (Iron Age) Ore Locks
    'minecraft:iron_ore': STAGES.TWO,
    'minecraft:deepslate_iron_ore': STAGES.TWO,
    'minecraft:raw_iron_block': STAGES.TWO,
    'minecraft:iron_block': STAGES.TWO,
    'minecraft:gold_ore': STAGES.TWO,
    'minecraft:deepslate_gold_ore': STAGES.TWO,
    'minecraft:lapis_ore': STAGES.TWO,
    'minecraft:deepslate_lapis_ore': STAGES.TWO,
    'minecraft:redstone_ore': STAGES.TWO,
    'minecraft:deepslate_redstone_ore': STAGES.TWO
};

/**
 * Handle Player Teleportation / Dimension Staging.
 * If a player teleports to a staged dimension without the correct stage, 
 * cancel the teleport and notify them.
 */
PlayerEvents.tick(event => {
    let player = event.player;

    // Only check dimension and advancement staging every 20 ticks (1 second) to be extremely performant!
    if (player.age % 20 !== 0) return;

    // 1. Dimension Gating
    let dimension = player.level.dimension.toString();
    let requiredStage = DIMENSION_STAGES[dimension];

    if (requiredStage && !player.stages.has(requiredStage)) {
        player.tell(Text.red(`You do not possess the knowledge to survive in this dimension yet! Required Age: ${requiredStage.toUpperCase()}`));
        // Silently teleport the player back to the Overworld at their relative portal coordinates
        player.server.runCommandSilent(`execute in minecraft:overworld run tp ${player.username} ~ ~ ~`);
    }

    // 2. Strict Stage 0 Advancement Gating & Automatic Unlocking
    global.checkStage0Progression(player);
});

// Global helper for advancement sequencing and automatic unlocking.
// Shared with the automated playtest script for instantaneous validation!
global.checkStage0Progression = function(player) {
    let isDone = (advId) => {
        let adv = player.server.getAdvancements().getAdvancement(Utils.id(advId));
        if (!adv) return false;
        let progress = player.advancements.getOrStartProgress(adv);
        return progress && progress.isDone();
    };
    if (!isDone('sevtech:stage0/root')) return;

    let hasItem = (itemId) => {
        if (itemId.startsWith('#')) {
            return player.inventory.find(itemId) !== -1;
        }
        return player.inventory.contains(itemId);
    };

    let grant = (advId) => {
        if (!isDone(advId)) {
            player.server.runCommandSilent(`advancement grant ${player.username} only ${advId}`);
        }
    };

    // fiber (Fibrous Diet) -> requires plant string
    if (hasItem('notreepunching:plant_string')) {
        grant('sevtech:stage0/fiber');
    }

    // mesh (Mesh Your Flint) -> requires flint and parent 'fiber'
    if (isDone('sevtech:stage0/fiber') && hasItem('minecraft:flint')) {
        grant('sevtech:stage0/mesh');
    }

    // firsttool (It's Too Dangerous to Go Alone) -> requires flint axe
    if (hasItem('notreepunching:flint_axe')) {
        grant('sevtech:stage0/firsttool');
    }

    // firstbreak (Caveman Hate Tree!) -> requires log and parent 'firsttool'
    if (isDone('sevtech:stage0/firsttool') && hasItem('#minecraft:logs')) {
        grant('sevtech:stage0/firstbreak');
    }

    // collectplank (Rough Cut) -> requires plank and parent 'firstbreak'
    if (isDone('sevtech:stage0/firstbreak') && hasItem('#minecraft:planks')) {
        grant('sevtech:stage0/collectplank');
    }

    // workstump (Primitive Carpentry) -> requires crafting table and parent 'collectplank'
    if (isDone('sevtech:stage0/collectplank') && hasItem('minecraft:crafting_table')) {
        grant('sevtech:stage0/workstump');
    }

    // upgrade (Upgrade!) -> requires flint pickaxe and parent 'firsttool'
    if (isDone('sevtech:stage0/firsttool') && hasItem('notreepunching:flint_pickaxe')) {
        grant('sevtech:stage0/upgrade');
    }

    // workblade (Working for the Weekend) -> requires flint knife and parent 'upgrade'
    if (isDone('sevtech:stage0/upgrade') && hasItem('notreepunching:flint_knife')) {
        grant('sevtech:stage0/workblade');
    }

    // stonetools (Stone Age!) -> requires stone pickaxe and parent 'upgrade'
    if (isDone('sevtech:stage0/upgrade') && hasItem('minecraft:stone_pickaxe')) {
        grant('sevtech:stage0/stonetools');
    }

    // farmland (Teach A Man To Farm) -> requires farmland and parent 'workblade'
    if (isDone('sevtech:stage0/workblade') && hasItem('minecraft:farmland')) {
        grant('sevtech:stage0/farmland');
    }

    // atlas (Lost but Now Found) -> requires map and parent 'workblade'
    if (isDone('sevtech:stage0/workblade') && hasItem('minecraft:map')) {
        grant('sevtech:stage0/atlas');
    }
};

/**
 * Handle Item Pickups.
 * Prevents players from picking up items they are not staged to handle.
 */
ItemEvents.canPickUp(event => {
    let player = event.player;
    let itemEntity = event.item;
    if (!itemEntity) return;

    let itemStack = itemEntity.item;
    if (!itemStack) return;

    let requiredStage = ITEM_STAGES[itemStack.id];

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
    let player = event.player;
    let block = event.block;
    let requiredStage = BLOCK_STAGES[block.id];

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
    let player = event.player;
    let block = event.block;
    let requiredStage = BLOCK_STAGES[block.id];

    if (requiredStage && !player.stages.has(requiredStage)) {
        player.tell(Text.red(`You do not know how this mechanism functions! Required Age: ${requiredStage.toUpperCase()}`));
        event.setCanceled(true);
    }
});

/**
 * Handle Player Login / Sync.
 */
PlayerEvents.loggedIn(event => {
    let player = event.player;

    // Default tutorial and Stage Zero stages if the player is new
    if (!player.stages.has(STAGES.TUTORIAL)) {
        player.stages.add(STAGES.TUTORIAL);
        player.stages.add(STAGES.ZERO);
        player.tell(Text.green('Welcome to SevTech: Ages (Upgraded to 1.20.1)! Begin by collecting flint and fibers.'));
    }
});

PlayerEvents.advancement(event => {
    let player = event.player;
    let advancement = event.advancement;
    let advId = advancement.id.toString();

    // Award stages upon key root unlocks
    if (advId === 'sevtech:stage0/root') {
        if (!player.stages.has(STAGES.ZERO)) {
            player.stages.add(STAGES.ZERO);
            player.tell(Text.green('You have advanced to the Stone Age (Stage Zero)! You can now break and craft primitive wooden logs and tools.'));
            player.playSound('minecraft:ui.toast.challenge_complete');
        }
    }
});

/**
 * Handle Block Breaking and Ore Staging.
 * Prevents players from mining ores early, and implements fiber drops from grass.
 */
BlockEvents.broken(event => {
    let block = event.block;
    let level = event.level;
    let player = event.player;

    // Only run on the server side
    if (level.isClientSide()) return;

    // 0. Block Ore Breaking based on Staging (Simulating OreStages mod)
    let requiredBreakStage = BLOCK_BREAK_STAGES[block.id];
    if (requiredBreakStage && !player.stages.has(requiredBreakStage)) {
        player.tell(Text.red(`You do not possess the tools or knowledge to mine this block! Required Age: ${requiredBreakStage.toUpperCase()}`));
        event.setCanceled(true);
        return;
    }

    // 1. Grass & Tall Grass drop Plant Fiber
    if (block.id === 'minecraft:grass' || block.id === 'minecraft:tall_grass') {
        let chance = block.id === 'minecraft:grass' ? 0.65 : 0.80;
        if (Math.random() < chance) {
            // Do not drop if using shears or silk touch
            let mainHandItem = player.getMainHandItem();
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

/**
 * Filter Early Entity Spawns.
 * Discards Occultism's Demon's Dream Seeds if they drop near an Age 0 player, preventing floating items on the ground.
 */
EntityEvents.spawned(event => {
    try {
        let entity = event.entity;
        let level = event.level;
        if (level.isClientSide()) return;
        
        let typeStr = entity.type.toString();
        let isItem = typeStr.includes('item') || (entity.type.id && entity.type.id.path === 'item');
        if (isItem) {
            let item = entity.item || (typeof entity.getItem === 'function' ? entity.getItem() : null);
            if (item && item.id === 'occultism:datura_seeds') {
                // Find closest player within 12 blocks of the spawn point
                let player = level.getNearestPlayer(entity.x, entity.y, entity.z, 12, false);
                if (player && !player.stages.has(STAGES.ONE)) {
                    entity.discard(); // Silent filter
                }
            }
        }
    } catch (e) {
        console.error("Error in EntityEvents.spawned: " + e);
    }
});

/**
 * Custom Primitive Villager Trading.
 * Recreates the classic SevTech early-game trading mechanism to obtain Farmland and Empty Maps in Age 0:
 *  1. Farmer: Right-click with 8x Bone Meal -> 1x Farmland.
 *  2. Cartographer: Right-click with 1x Feather + 8x Charcoal -> 1x Map.
 */
EntityEvents.interacted(event => {
    let player = event.player;
    let target = event.target;
    let item = event.item;

    if (player.level.isClientSide()) return;

    if (target.type == 'minecraft:villager') {
        try {
            let profession = target.getVillagerData().getProfession().toString();

            // Farmer trade for Farmland (8x Bone Meal -> 1x Farmland)
            if (profession == 'minecraft:farmer' && item.id == 'minecraft:bone_meal') {
                if (item.count >= 8) {
                    item.shrink(8);
                    player.give('minecraft:farmland');
                    player.server.runCommandSilent(`playsound minecraft:entity.villager.yes player ${player.username} ${target.x} ${target.y} ${target.z}`);
                    event.cancel();
                } else {
                    player.tell(Text.yellow('Farmer: I need at least 8x Bone Meal to trade you Farmland!'));
                }
            }

            // Cartographer trade for Map (1x Feather + 8x Charcoal -> 1x Map)
            if (profession == 'minecraft:cartographer' && item.id == 'minecraft:feather') {
                let charcoalCount = player.inventory.count('minecraft:charcoal');
                if (charcoalCount >= 8) {
                    item.shrink(1);
                    player.server.runCommandSilent(`clear ${player.username} minecraft:charcoal 8`);
                    player.give('minecraft:map');
                    player.server.runCommandSilent(`playsound minecraft:entity.villager.yes player ${player.username} ${target.x} ${target.y} ${target.z}`);
                    event.cancel();
                } else {
                    player.tell(Text.yellow('Cartographer: I need a Feather in your hand and at least 8x Charcoal in your inventory to draw you a Map!'));
                }
            }
        } catch (e) {
            console.error("Error in EntityEvents.interacted: " + e);
        }
    }
});

console.info("SevTech Phase 5 Staging & Advancement Subsystem fully loaded.");
