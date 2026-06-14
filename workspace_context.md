# SevTech: Ages Modernized - Current Development Context

This file serves as the handoff/context guide for the Antigravity IDE agent to pick up where the web/chat agent left off.

## 1. Project Goal
We are modernizing **SevTech: Ages** from Minecraft 1.12 to **Minecraft 1.20.1**. 
* **Target CurseForge Instance:** `C:\Users\jonuh\curseforge\minecraft\Instances\Sevtech Ages - Modernized`
* **Development Workspace:** Located in WSL (`\\wsl.localhost\Ubuntu-22.04\home\juhal\projects\sevtech\Sevtech-Ages-Modernized`)

## 2. What We Just Accomplished
* **Windows Deployment Script:** 
  The original repository contained a macOS deployment script (`deploy.sh`). We created a Windows-compatible PowerShell script: [deploy.ps1](file:///./deploy.ps1).
* **Script Verification:** We executed `powershell.exe -ExecutionPolicy Bypass -File .\deploy.ps1` successfully. It:
  * Cleared logs and crash reports in the CurseForge profile.
  * Deployed KubeJS scripts (`kubejs/`).
  * Deployed OpenLoader configurations (`config/openloader/`).
  * Deployed Biome Spawn Point configs (`config/biomespawnpoint/`).

## 3. Core Feature Ready for Testing (Age 0 Gating)
We need to verify that villagers successfully trade the custom items required for progression in **Age 0 (Stone Age)**:
1. **Farmer:** Right-clicking with 8x Bone Meal -> yields 1x Farmland (`minecraft:farmland`).
2. **Cartographer:** Right-clicking with 1x Feather (in hand) and 8x Charcoal (in inventory) -> yields 1x Map (`minecraft:map`).

### Key Files:
* [kubejs/server_scripts/staging.js](file:///./kubejs/server_scripts/staging.js#L370-L416) handles the interactive trade logic (`EntityEvents.interacted`).
* [kubejs/server_scripts/test_runner.js](file:///./kubejs/server_scripts/test_runner.js) defines a custom playtest command: `/testprogression`.

## 4. Next Step for the IDE Agent
Run the playtest!
1. Start the Minecraft client via the CurseForge profile.
2. Load a test world.
3. Run the in-game operator command: `/testprogression`.
4. This command will backup your state, clear your inventory/advancements, run 12 positive and negative progression assertions (defined in `test_runner.js`), output a green/red pass/fail report to the chat, and restore your previous survival state.
