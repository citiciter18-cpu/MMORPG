package com.example.data

import androidx.compose.ui.graphics.Color

enum class ArenaScreen {
    LOBBY,
    IN_MATCH
}

enum class GameMode(val wireValue: String) {
    MULTIPLAYER("multiplayer"),
    TRAINING("training")
}

enum class WeaponChoice(val id: String, val shortCode: String) {
    RIFLE("rifle", "VX-9"),
    SHOTGUN("shotgun", "SG-4"),
    RAILGUN("railgun", "LR-7")
}

enum class ArenaMapChoice(val id: String) {
    FOUNDRY("foundry"),
    COURTYARD("courtyard")
}

data class ArmorAccent(
    val hex: String,
    val label: String,
    val color: Color
)

val ARMOR_ACCENTS = listOf(
    ArmorAccent("#00E5FF", "Cyan", Color(0xFF00E5FF)),
    ArmorAccent("#FF3B5C", "Crimson", Color(0xFFFF3B5C)),
    ArmorAccent("#FFB020", "Amber", Color(0xFFFFB020)),
    ArmorAccent("#00E676", "Emerald", Color(0xFF00E676))
)

val QUICK_ROOMS = listOf("ARENA-01", "CYBER-DM", "DUEL-1V1")

data class ControlSettings(
    val sensitivity: Float = 1.0f,
    val invertY: Boolean = false,
    val soundEnabled: Boolean = true,
    val hapticsEnabled: Boolean = true
)

data class LeaderboardEntry(
    val playerName: String,
    val kills: Int,
    val deaths: Int,
    val lastRoom: String
)

sealed interface LeaderboardUiState {
    data object Idle : LeaderboardUiState
    data object Loading : LeaderboardUiState
    data object Unconfigured : LeaderboardUiState
    data class Success(val entries: List<LeaderboardEntry>) : LeaderboardUiState
    data class Error(val message: String) : LeaderboardUiState
}

data class ArenaUiState(
    val screen: ArenaScreen = ArenaScreen.LOBBY,
    val playerName: String = "STRIKER",
    val roomCode: String = "ARENA-01",
    val selectedAccentHex: String = "#00E5FF",
    val selectedWeapon: WeaponChoice = WeaponChoice.RIFLE,
    val selectedMap: ArenaMapChoice = ArenaMapChoice.FOUNDRY,
    val settings: ControlSettings = ControlSettings(),
    val activeMode: GameMode = GameMode.TRAINING,
    val isSupabaseConfigured: Boolean = false,
    val showSetupDialog: Boolean = false,
    val showSettingsDialog: Boolean = false,
    val showLeaderboardDialog: Boolean = false,
    val leaderboardState: LeaderboardUiState = LeaderboardUiState.Idle,
    val matchNonce: Int = 0
)

const val SUPABASE_LEADERBOARD_SQL = """create table if not exists public.arena_leaderboard (
  player_name text primary key,
  kills integer not null default 0,
  deaths integer not null default 0,
  last_room text not null default 'ARENA-01',
  updated_at timestamptz not null default now()
);

alter table public.arena_leaderboard enable row level security;

create policy "Public read leaderboard"
  on public.arena_leaderboard for select using (true);

create policy "Public upsert leaderboard"
  on public.arena_leaderboard for insert with check (true);

create policy "Public update leaderboard"
  on public.arena_leaderboard for update using (true);"""
