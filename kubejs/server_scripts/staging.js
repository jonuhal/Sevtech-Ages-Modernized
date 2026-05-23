// priority: 10

/**
 * SevTech: Ages 1.20.1 Core Staging Script.
 * 
 * Replaces the legacy 1.12.2 ZenStages and orestages configuration.
 * Server scripts handle recipe modification, game stages, and player/world events.
 */

// Define core stages
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

// Map dimensions to the stage required to enter them
const DIMENSION_STAGES = {
    // Undergarden (replaces Betweenlands) -> Stage One
    'undergarden:undergarden': STAGES.ONE,
    
    // Twilight Forest -> Stage Two
    'twilightforest:twilight_forest': STAGES.TWO,
    
    // Nether -> Stage Three
    'minecraft:the_nether': STAGES.THREE,
    
    // The End -> Stage Four
    'minecraft:the_end': STAGES.FOUR
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
        
        // Cancel teleportation. In KubeJS 1.20.1, we cancel the teleport event.
        // If cancellation is not supported directly on this event in certain Forge versions, 
        // we can teleport them back to their respawn position or spawn point.
        event.setCanceled(true);
    }
});

/**
 * Handle Player Login / Sync.
 * Perform check on login to ensure stages are synchronized or setup defaults.
 */
PlayerEvents.loggedIn(event => {
    const { player } = event;
    
    // Default tutorial stage if the player is new
    if (!player.stages.has(STAGES.TUTORIAL)) {
        player.stages.add(STAGES.TUTORIAL);
        player.tell(Text.green('Welcome to SevTech: Ages (Upgraded to 1.20.1)! Begin by collecting flint and fibers.'));
    }
});

/**
 * Custom Staging Event Hook.
 * Developers can call /gamestage add <player> <stage> in-game.
 */
// This script runs on the server and sets up the event listening architecture
console.info("SevTech Staging Subsystem Initialized.");
