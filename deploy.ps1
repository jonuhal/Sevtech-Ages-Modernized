# SevTech: Ages Modernized - Local Deployment Script for Windows
# Copies active KubeJS scripts and OpenLoader resource/data configurations
# from the development directory to the active CurseForge profile.

$ErrorActionPreference = "Stop"

# Target paths
$DEV_DIR = $PSScriptRoot
$CF_DIR = "C:\Users\jonuh\curseforge\minecraft\Instances\Sevtech Ages - Modernized"

# Colors for terminal output
function Write-Header ($text) {
    Write-Host "=== $text ===" -ForegroundColor Blue
}

function Write-Info ($text) {
    Write-Host $text -ForegroundColor Blue
}

function Write-Success ($text) {
    Write-Host "[SUCCESS] $text" -ForegroundColor Green
}

function Write-DeployError ($text) {
    Write-Host "[ERROR] $text" -ForegroundColor Red
    Exit 1
}

function Write-Warning ($text) {
    Write-Host "[WARNING] $text" -ForegroundColor Yellow
}

Write-Header "Starting SevTech: Ages Modernized Deployment"

# Check if target CurseForge folder exists
if (-not (Test-Path -Path $CF_DIR -PathType Container)) {
    Write-DeployError "CurseForge instance folder not found at: $CF_DIR"
}

# 0. Clear existing Minecraft saved games and logs for a blank slate
# (Commented out to prevent file locking and NoSuchFileException in game client)
# Write-Info "Clearing out logs and crash reports..."
# $logsDir = Join-Path $CF_DIR "logs"
# $kubejsLogsDir = Join-Path $logsDir "kubejs"
# $crashReportsDir = Join-Path $CF_DIR "crash-reports"
# 
# try {
#     $null = New-Item -Path $logsDir -ItemType Directory -Force
#     $null = New-Item -Path $kubejsLogsDir -ItemType Directory -Force
#     $null = New-Item -Path $crashReportsDir -ItemType Directory -Force
# 
#     # Safely truncate log files instead of deleting them to avoid invalidating game file handles
#     $logFiles = @(
#         (Join-Path $logsDir "latest.log"),
#         (Join-Path $kubejsLogsDir "server.log"),
#         (Join-Path $kubejsLogsDir "client.log"),
#         (Join-Path $kubejsLogsDir "startup.log")
#     )
#     foreach ($file in $logFiles) {
#         if (Test-Path -Path $file -PathType Leaf) {
#             Clear-Content -Path $file -ErrorAction SilentlyContinue
#         }
#     }
# 
#     # Delete other temporary files/folders in logs and crash-reports
#     Get-ChildItem -Path $logsDir -File -Exclude "latest.log" -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
#     Get-ChildItem -Path $crashReportsDir -File -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
# 
#     Write-Success "Clean slate achieved (map preserved)!"
# } catch {
#     Write-Warning "Could not fully clear logs/crash-reports directory (Minecraft might be running): $_"
# }

# 1. Deploy KubeJS Scripts
Write-Info "Deploying KubeJS scripts..."
$srcKubejs = Join-Path $DEV_DIR "kubejs"
$destKubejs = Join-Path $CF_DIR "kubejs"

if (Test-Path -Path $srcKubejs -PathType Container) {
    # Clear target to prevent lingering deleted files
    if (Test-Path -Path $destKubejs -PathType Container) {
        Remove-Item -Path $destKubejs -Recurse -Force
    }
    # Copy fresh KubeJS folder
    Copy-Item -Path $srcKubejs -Destination $destKubejs -Recurse -Force
    Write-Success "KubeJS scripts deployed successfully!"
} else {
    Write-Warning "'kubejs' folder not found in development directory ($srcKubejs)."
}

# 2. Deploy OpenLoader Configurations (Datapacks & Resourcepacks)
Write-Info "Deploying OpenLoader configurations..."
$srcOpenloader = Join-Path $DEV_DIR "config\openloader"
$destConfig = Join-Path $CF_DIR "config"
$destOpenloader = Join-Path $destConfig "openloader"

if (Test-Path -Path $srcOpenloader -PathType Container) {
    # Clear target openloader config directory
    if (Test-Path -Path $destOpenloader -PathType Container) {
        Remove-Item -Path $destOpenloader -Recurse -Force
    }
    # Recreate the target path and copy
    $null = New-Item -Path $destConfig -ItemType Directory -Force
    Copy-Item -Path $srcOpenloader -Destination $destOpenloader -Recurse -Force
    Write-Success "OpenLoader configurations deployed successfully!"
} else {
    Write-Warning "'config\openloader' not found in development directory ($srcOpenloader)."
}

# 3. Deploy Biome Spawn Point Configurations
Write-Info "Deploying Biome Spawn Point configurations..."
$srcBiome = Join-Path $DEV_DIR "config\biomespawnpoint"
$destBiome = Join-Path $destConfig "biomespawnpoint"

if (Test-Path -Path $srcBiome -PathType Container) {
    if (Test-Path -Path $destBiome -PathType Container) {
        Remove-Item -Path $destBiome -Recurse -Force
    }
    $null = New-Item -Path $destConfig -ItemType Directory -Force
    Copy-Item -Path $srcBiome -Destination $destBiome -Recurse -Force
    Write-Success "Biome Spawn Point configurations deployed successfully!"
} else {
    Write-Warning "'config\biomespawnpoint' not found in development directory ($srcBiome)."
}

Write-Host "=== Deployment Complete! ===" -ForegroundColor Green
Write-Host "To reload changes in-game:"
Write-Host "  - Server scripts / loot tables: Run /reload" -ForegroundColor Blue
Write-Host "  - Client scripts / JEI / Tooltips: Run /kubejs reload client" -ForegroundColor Blue
Write-Host "  - Startup scripts / custom registries: Restart Minecraft client" -ForegroundColor Red
