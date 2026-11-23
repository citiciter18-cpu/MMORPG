package com.example.ui

import android.app.Application
import android.content.Context
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.ArenaMapChoice
import com.example.data.ArenaScreen
import com.example.data.ArenaUiState
import com.example.data.ControlSettings
import com.example.data.GameMode
import com.example.data.LeaderboardUiState
import com.example.data.SupabaseRepository
import com.example.data.WeaponChoice
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import org.json.JSONObject

class ArenaViewModel(application: Application) : AndroidViewModel(application) {

    private val prefs = application.getSharedPreferences("vortex_arena_prefs", Context.MODE_PRIVATE)
    private val supabaseRepo = SupabaseRepository()

    private val _uiState = MutableStateFlow(loadInitialState())
    val uiState: StateFlow<ArenaUiState> = _uiState.asStateFlow()

    private fun loadInitialState(): ArenaUiState {
        val weaponId = prefs.getString("weapon", WeaponChoice.RIFLE.id)
        val mapId = prefs.getString("map", ArenaMapChoice.FOUNDRY.id)
        return ArenaUiState(
            playerName = prefs.getString("player_name", "STRIKER") ?: "STRIKER",
            roomCode = prefs.getString("room_code", "ARENA-01") ?: "ARENA-01",
            selectedAccentHex = prefs.getString("accent_hex", "#00E5FF") ?: "#00E5FF",
            selectedWeapon = WeaponChoice.entries.find { it.id == weaponId } ?: WeaponChoice.RIFLE,
            selectedMap = ArenaMapChoice.entries.find { it.id == mapId } ?: ArenaMapChoice.FOUNDRY,
            settings = ControlSettings(
                sensitivity = prefs.getFloat("sensitivity", 1.0f),
                invertY = prefs.getBoolean("invert_y", false),
                soundEnabled = prefs.getBoolean("sound_enabled", true),
                hapticsEnabled = prefs.getBoolean("haptics_enabled", true)
            ),
            isSupabaseConfigured = supabaseRepo.isConfigured()
        )
    }

    fun updatePlayerName(name: String) {
        val clean = name.take(16)
        _uiState.update { it.copy(playerName = clean) }
        prefs.edit().putString("player_name", clean).apply()
    }

    fun updateRoomCode(code: String) {
        val clean = code.uppercase().filter { it.isLetterOrDigit() || it == '-' || it == '_' }.take(16)
        _uiState.update { it.copy(roomCode = clean) }
        prefs.edit().putString("room_code", clean).apply()
    }

    fun selectAccent(hex: String) {
        _uiState.update { it.copy(selectedAccentHex = hex) }
        prefs.edit().putString("accent_hex", hex).apply()
    }

    fun selectWeapon(weapon: WeaponChoice) {
        _uiState.update { it.copy(selectedWeapon = weapon) }
        prefs.edit().putString("weapon", weapon.id).apply()
    }

    fun selectMap(map: ArenaMapChoice) {
        _uiState.update { it.copy(selectedMap = map) }
        prefs.edit().putString("map", map.id).apply()
    }

    fun updateSettings(newSettings: ControlSettings) {
        _uiState.update { it.copy(settings = newSettings) }
        prefs.edit()
            .putFloat("sensitivity", newSettings.sensitivity)
            .putBoolean("invert_y", newSettings.invertY)
            .putBoolean("sound_enabled", newSettings.soundEnabled)
            .putBoolean("haptics_enabled", newSettings.hapticsEnabled)
            .apply()
    }

    fun launchMatch(mode: GameMode) {
        if (mode == GameMode.MULTIPLAYER && !supabaseRepo.isConfigured()) {
            _uiState.update { it.copy(showSetupDialog = true) }
            return
        }
        val normalizedName = _uiState.value.playerName.trim().ifEmpty { "STRIKER" }
        val normalizedRoom = _uiState.value.roomCode.trim().ifEmpty { "ARENA-01" }
        _uiState.update {
            it.copy(
                playerName = normalizedName,
                roomCode = normalizedRoom,
                activeMode = mode,
                screen = ArenaScreen.IN_MATCH,
                matchNonce = it.matchNonce + 1
            )
        }
    }

    fun returnToLobby() {
        _uiState.update { it.copy(screen = ArenaScreen.LOBBY) }
    }

    fun setShowSetupDialog(show: Boolean) {
        _uiState.update { it.copy(showSetupDialog = show) }
    }

    fun setShowSettingsDialog(show: Boolean) {
        _uiState.update { it.copy(showSettingsDialog = show) }
    }

    fun openLeaderboard() {
        _uiState.update { it.copy(showLeaderboardDialog = true) }
        refreshLeaderboard()
    }

    fun closeLeaderboard() {
        _uiState.update { it.copy(showLeaderboardDialog = false) }
    }

    fun refreshLeaderboard() {
        if (!supabaseRepo.isConfigured()) {
            _uiState.update { it.copy(leaderboardState = LeaderboardUiState.Unconfigured) }
            return
        }
        _uiState.update { it.copy(leaderboardState = LeaderboardUiState.Loading) }
        viewModelScope.launch {
            val result = supabaseRepo.fetchLeaderboard()
            _uiState.update { state ->
                state.copy(
                    leaderboardState = result.fold(
                        onSuccess = { LeaderboardUiState.Success(it) },
                        onFailure = { LeaderboardUiState.Error(it.message ?: "Ошибка сети") }
                    )
                )
            }
        }
    }

    fun buildMatchConfigJson(): String {
        val s = _uiState.value
        return JSONObject().apply {
            put("mode", s.activeMode.wireValue)
            put("playerName", s.playerName.ifBlank { "STRIKER" })
            put("room", s.roomCode.ifBlank { "ARENA-01" })
            put("mapId", s.selectedMap.id)
            put("weaponId", s.selectedWeapon.id)
            put("accentHex", s.selectedAccentHex)
            put("sensitivity", s.settings.sensitivity.toDouble())
            put("invertY", s.settings.invertY)
            put("soundEnabled", s.settings.soundEnabled)
            put("hapticsEnabled", s.settings.hapticsEnabled)
            put("supabaseUrl", if (s.activeMode == GameMode.MULTIPLAYER) supabaseRepo.supabaseUrl else "")
            put("supabaseAnonKey", if (s.activeMode == GameMode.MULTIPLAYER) supabaseRepo.supabaseAnonKey else "")
        }.toString()
    }
}
