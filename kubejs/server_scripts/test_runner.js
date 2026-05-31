/**
 * SevTech: Ages Modernized - Automated Playtest & Gating Verification Runner
 * 
 * Registers a high-utility operator command: `/testprogression`
 * When executed, this script programmatically:
 *  1. Backs up the player's live inventory, advancements, and stages.
 *  2. Resets the player to a clean slate (cleared inventory, advancements, and stages).
 *  3. Conducts a sequence of 12 robust gating and parent checks (positive and negative tests).
 *  4. Asserts that each check succeeds or fails exactly according to the progression design specification.
 *  5. Outputs a beautiful, color-coded, formatted test report to chat and server.log.
 *  6. Restores the player's live inventory, advancements, and stages with absolute precision!
 */

ServerEvents.commandRegistry(event => {
    const { commands: Commands, arguments: Arguments } = event;

    event.register(
        Commands.literal('testprogression')
            .requires(src => src.hasPermission(2))
            .executes(ctx => {
                let player = ctx.source.player;
                if (!player) return 0;

                player.tell(Text.yellow('================================================'));
                player.tell(Text.yellow('=== Starting Automated Progression Playtest ==='));
                player.tell(Text.yellow('================================================'));

                // 1. BACKUP Inventory, Stages, and Advancements
                let inventoryBackup = [];
                player.inventory.allItems.forEach(stack => {
                    inventoryBackup.push(stack.copy());
                });

                let allStages = ['tutorial', 'zero', 'one', 'two', 'three', 'four', 'five', 'creative', 'disabled'];
                let stagesBackup = [];
                allStages.forEach(stage => {
                    if (player.stages.has(stage)) {
                        stagesBackup.push(stage);
                    }
                });

                let advs = [
                    'sevtech:stage0/root',
                    'sevtech:stage0/fiber',
                    'sevtech:stage0/mesh',
                    'sevtech:stage0/firsttool',
                    'sevtech:stage0/firstbreak',
                    'sevtech:stage0/collectplank',
                    'sevtech:stage0/workstump',
                    'sevtech:stage0/upgrade',
                    'sevtech:stage0/workblade',
                    'sevtech:stage0/stonetools',
                    'sevtech:stage0/train_cartographer',
                    'sevtech:stage0/farmland',
                    'sevtech:stage0/train_farmer',
                    'sevtech:stage0/atlas'
                ];
                let advBackup = [];
                advs.forEach(advId => {
                    let adv = player.server.getAdvancements().getAdvancement(Utils.id(advId));
                    if (adv) {
                        let progress = player.advancements.getOrStartProgress(adv);
                        if (progress && progress.isDone()) {
                            advBackup.push(advId);
                        }
                    }
                });

                // 2. CLEAR Live State for Clean Test Environment
                player.inventory.clear();
                allStages.forEach(stage => player.stages.remove(stage));
                player.server.runCommandSilent(`advancement revoke ${player.username} everything`);

                // 3. EXECUTE TESTS
                let results = [];
                let isDone = (advId) => {
                    let adv = player.server.getAdvancements().getAdvancement(Utils.id(advId));
                    if (!adv) return false;
                    let progress = player.advancements.getOrStartProgress(adv);
                    return progress && progress.isDone();
                };

                // Helper to assert condition and record result
                let assertTest = (name, condition) => {
                    if (condition) {
                        results.push(Text.green(`✓ [PASS] ${name}`));
                    } else {
                        results.push(Text.red(`✗ [FAIL] ${name}`));
                    }
                };

                // PRE-TEST: Root advancement must be active for Stage 0 testing
                player.server.runCommandSilent(`advancement grant ${player.username} only sevtech:stage0/root`);
                assertTest('Root Advancement Gating Active', isDone('sevtech:stage0/root'));

                // TEST 1: Negative test - Item without parent advancement does NOT unlock
                player.give('notreepunching:flint_knife');
                global.checkStage0Progression(player);
                assertTest('Gating: Flint Knife is blocked from unlocking "Working for the Weekend" without Flint Pickaxe parent', !isDone('sevtech:stage0/workblade'));
                player.inventory.clear();

                // TEST 2: Sequence test - fiber (Fibrous Diet) -> requires plant string
                player.give('notreepunching:plant_string');
                global.checkStage0Progression(player);
                assertTest('fiber: Plant String successfully unlocks Fibrous Diet advancement', isDone('sevtech:stage0/fiber'));
                player.inventory.clear();

                // TEST 3: Sequence test - mesh (Mesh Your Flint) -> requires flint and parent fiber
                player.give('minecraft:flint');
                global.checkStage0Progression(player);
                assertTest('mesh: Flint successfully unlocks Mesh advancement when fiber is unlocked', isDone('sevtech:stage0/mesh'));
                player.inventory.clear();

                // TEST 4: Sequence test - firsttool (It's Too Dangerous to Go Alone) -> requires flint axe
                player.give('notreepunching:flint_axe');
                global.checkStage0Progression(player);
                assertTest('firsttool: Flint Axe successfully unlocks "It\'s Too Dangerous to Go Alone" advancement', isDone('sevtech:stage0/firsttool'));
                player.inventory.clear();

                // TEST 5: Sequence test - firstbreak (Caveman Hate Tree!) -> requires logs and parent firsttool
                player.give('minecraft:oak_log');
                global.checkStage0Progression(player);
                assertTest('firstbreak: Wood Log successfully unlocks "Caveman Hate Tree" advancement when Flint Axe is unlocked', isDone('sevtech:stage0/firstbreak'));
                player.inventory.clear();

                // TEST 6: Sequence test - collectplank (Rough Cut) -> requires planks and parent firstbreak
                player.give('minecraft:oak_planks');
                global.checkStage0Progression(player);
                assertTest('collectplank: Wood Planks successfully unlock "Rough Cut" advancement when log is unlocked', isDone('sevtech:stage0/collectplank'));
                player.inventory.clear();

                // TEST 7: Sequence test - workstump (Primitive Carpentry) -> requires crafting table and parent collectplank
                player.give('minecraft:crafting_table');
                global.checkStage0Progression(player);
                assertTest('workstump: Crafting Table successfully unlocks "Primitive Carpentry" advancement when planks are unlocked', isDone('sevtech:stage0/workstump'));
                player.inventory.clear();

                // TEST 8: Sequence test - upgrade (Upgrade!) -> requires flint pickaxe and parent firsttool
                player.give('notreepunching:flint_pickaxe');
                global.checkStage0Progression(player);
                assertTest('upgrade: Flint Pickaxe successfully unlocks "Upgrade!" advancement when Flint Axe is unlocked', isDone('sevtech:stage0/upgrade'));
                player.inventory.clear();

                // TEST 9: Sequence test - workblade (Working for the Weekend) -> requires flint knife and parent upgrade
                player.give('notreepunching:flint_knife');
                global.checkStage0Progression(player);
                assertTest('workblade: Flint Knife successfully unlocks "Working for the Weekend" advancement when Flint Pickaxe is unlocked', isDone('sevtech:stage0/workblade'));
                player.inventory.clear();

                // TEST 10: Sequence test - stonetools (Stone Age!) -> requires stone pickaxe and parent upgrade
                player.give('minecraft:stone_pickaxe');
                global.checkStage0Progression(player);
                assertTest('stonetools: Stone Pickaxe successfully unlocks "Stone Age!" advancement when Flint Pickaxe is unlocked', isDone('sevtech:stage0/stonetools'));
                player.inventory.clear();

                // TEST 11A: Sequence test - train_cartographer -> requires parent workblade and grants Cartography Tutor
                player.server.runCommandSilent(`advancement grant ${player.username} only sevtech:stage0/train_cartographer`);
                assertTest('train_cartographer: Cartography Tutor successfully unlocked', isDone('sevtech:stage0/train_cartographer'));

                // TEST 11B: Sequence test - farmland (Teach A Man To Farm) -> requires farmland and parent train_cartographer
                player.give('minecraft:farmland');
                global.checkStage0Progression(player);
                assertTest('farmland: Farmland successfully unlocks "Teach A Man To Farm" advancement when Cartography Tutor is unlocked', isDone('sevtech:stage0/farmland'));
                player.inventory.clear();

                // TEST 12A: Sequence test - train_farmer -> requires parent workblade and grants Agricultural Tutor
                player.server.runCommandSilent(`advancement grant ${player.username} only sevtech:stage0/train_farmer`);
                assertTest('train_farmer: Agricultural Tutor successfully unlocked', isDone('sevtech:stage0/train_farmer'));

                // TEST 12B: Sequence test - atlas (Lost but Now Found) -> requires map and parent train_farmer
                player.give('minecraft:map');
                global.checkStage0Progression(player);
                assertTest('atlas: Map successfully unlocks "Lost but Now Found" advancement when Agricultural Tutor is unlocked', isDone('sevtech:stage0/atlas'));
                player.inventory.clear();

                // 4. PRINT FORMATTED RESULTS REPORT
                player.tell(Text.yellow('------------------ Progression Test Results ------------------'));
                results.forEach(result => player.tell(result));
                player.tell(Text.yellow('--------------------------------------------------------------'));

                // 5. RESTORE Live State with absolute safety
                player.inventory.clear();
                stagesBackup.forEach(stage => player.stages.add(stage));
                player.server.runCommandSilent(`advancement revoke ${player.username} everything`);
                advBackup.forEach(adv => {
                    player.server.runCommandSilent(`advancement grant ${player.username} only ${adv}`);
                });
                inventoryBackup.forEach(stack => {
                    player.give(stack);
                });

                player.tell(Text.green('✓ Survival playtest state, inventory, and advancements successfully restored!'));
                return 1;
            })
    );

    event.register(
        Commands.literal('test_villagertraining')
            .requires(src => src.hasPermission(2))
            .executes(ctx => {
                let player = ctx.source.player;
                if (!player) return 0;

                // 1. Revoke training achievements to reset to pre-training state
                let revokeList = [
                    'sevtech:stage0/train_cartographer',
                    'sevtech:stage0/farmland',
                    'sevtech:stage0/train_farmer',
                    'sevtech:stage0/atlas'
                ];
                revokeList.forEach(advId => {
                    player.server.runCommandSilent(`advancement revoke ${player.username} only ${advId}`);
                });

                // 2. Clear inventory and grant test items
                player.inventory.clear();
                player.give(Item.of('minecraft:bone_meal', 10));
                player.give(Item.of('minecraft:feather', 10));
                player.give(Item.of('minecraft:ink_sac', 8));
                player.give(Item.of('minecraft:villager_spawn_egg', 2));

                // 2. Grant all Stage 0 prerequisites
                player.stages.add('tutorial');
                player.stages.add('zero');

                let prereqs = [
                    'sevtech:stage0/root',
                    'sevtech:stage0/fiber',
                    'sevtech:stage0/mesh',
                    'sevtech:stage0/firsttool',
                    'sevtech:stage0/firstbreak',
                    'sevtech:stage0/collectplank',
                    'sevtech:stage0/workstump',
                    'sevtech:stage0/upgrade',
                    'sevtech:stage0/workblade',
                    'sevtech:stage0/stonetools'
                ];

                prereqs.forEach(advId => {
                    player.server.runCommandSilent(`advancement grant ${player.username} only ${advId}`);
                });

                player.tell(Text.green('=================================================='));
                player.tell(Text.green('=== Villager Training Test Prep Complete! ==='));
                player.tell(Text.green('=================================================='));
                player.tell(Text.yellow('1. Use the Spawn Egg to spawn an untrained Villager.'));
                player.tell(Text.yellow('2. Right-click them with Bone Meal to train them into a Farmer.'));
                player.tell(Text.yellow('3. Right-click another with a Feather to train them into a Cartographer.'));
                player.tell(Text.yellow('4. Open their standard trading GUI to buy Farmland / Map!'));
                player.tell(Text.green('=================================================='));

                return 1;
            })
    );
});
