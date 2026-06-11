#!/bin/bash

# SevTech: Ages Modernized - Local Deployment Script
# Copies active KubeJS scripts and OpenLoader resource/data configurations
# from the development directory to the active CurseForge profile.

# Exit on error
set -e

# Target paths
DEV_DIR="/Users/jonuhal/projects/sevtech/SevTech-Ages"
CF_DIR="/Users/jonuhal/curseforge/Instances/SevTech_ Ages - Modernized"

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Starting SevTech: Ages Modernized Deployment ===${NC}"

# Check if target CurseForge folder exists
if [ ! -d "$CF_DIR" ]; then
    echo -e "${RED}Error: CurseForge instance folder not found at:${NC}"
    echo -e "  $CF_DIR"
    exit 1
fi

# 0. Clear existing Minecraft saved games and logs for a blank slate
echo -e "${BLUE}Clearing out saved games, logs, and crash reports...${NC}"
# rm -rf "$CF_DIR/saves"
rm -rf "$CF_DIR/logs"
rm -rf "$CF_DIR/crash-reports"
# mkdir -p "$CF_DIR/saves"
mkdir -p "$CF_DIR/logs"
mkdir -p "$CF_DIR/crash-reports"
echo -e "${GREEN}✓ Clean slate achieved (map preserved)!${NC}"

# 1. Deploy KubeJS Scripts
echo -e "${BLUE}Deploying KubeJS scripts...${NC}"
if [ -d "$DEV_DIR/kubejs" ]; then
    # Clear target to prevent lingering deleted files
    rm -rf "$CF_DIR/kubejs"
    # Copy fresh KubeJS folder
    cp -R "$DEV_DIR/kubejs" "$CF_DIR/"
    echo -e "${GREEN}✓ KubeJS scripts deployed successfully!${NC}"
else
    echo -e "${RED}Warning: 'kubejs' folder not found in development directory.${NC}"
fi

# 2. Deploy OpenLoader Configurations (Datapacks & Resourcepacks)
echo -e "${BLUE}Deploying OpenLoader configurations...${NC}"
if [ -d "$DEV_DIR/config/openloader" ]; then
    # Clear target openloader config directory
    rm -rf "$CF_DIR/config/openloader"
    # Recreate the target path
    mkdir -p "$CF_DIR/config"
    # Copy fresh openloader config folder
    cp -R "$DEV_DIR/config/openloader" "$CF_DIR/config/"
    echo -e "${GREEN}✓ OpenLoader configurations deployed successfully!${NC}"
else
    echo -e "${RED}Warning: 'config/openloader' not found in development directory.${NC}"
fi

# 3. Deploy Biome Spawn Point Configurations
echo -e "${BLUE}Deploying Biome Spawn Point configurations...${NC}"
if [ -d "$DEV_DIR/config/biomespawnpoint" ]; then
    rm -rf "$CF_DIR/config/biomespawnpoint"
    mkdir -p "$CF_DIR/config"
    cp -R "$DEV_DIR/config/biomespawnpoint" "$CF_DIR/config/"
    echo -e "${GREEN}✓ Biome Spawn Point configurations deployed successfully!${NC}"
else
    echo -e "${RED}Warning: 'config/biomespawnpoint' not found in development directory.${NC}"
fi

echo -e "${GREEN}=== Deployment Complete! ===${NC}"
echo -e "To reload changes in-game:"
echo -e "  - Server scripts / loot tables: Run ${BLUE}/reload${NC}"
echo -e "  - Client scripts / JEI / Tooltips: Run ${BLUE}/kubejs reload client${NC}"
echo -e "  - Startup scripts / custom registries: ${RED}Restart Minecraft client${NC}"
