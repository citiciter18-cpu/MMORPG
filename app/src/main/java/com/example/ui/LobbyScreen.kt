package com.example.ui

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CloudDone
import androidx.compose.material.icons.filled.CloudOff
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.GpsFixed
import androidx.compose.material.icons.filled.Leaderboard
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Tune
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.example.R
import com.example.data.ARMOR_ACCENTS
import com.example.data.ArenaMapChoice
import com.example.data.ArenaUiState
import com.example.data.ControlSettings
import com.example.data.GameMode
import com.example.data.LeaderboardUiState
import com.example.data.QUICK_ROOMS
import com.example.data.SUPABASE_LEADERBOARD_SQL
import com.example.data.WeaponChoice
import com.example.ui.theme.BioEmerald
import com.example.ui.theme.BorderSubtle
import com.example.ui.theme.LethalCrimson
import com.example.ui.theme.ObsidianCard
import com.example.ui.theme.ObsidianElevated
import com.example.ui.theme.ObsidianSurface
import com.example.ui.theme.ObsidianVoid
import com.example.ui.theme.PlasmaCyan
import com.example.ui.theme.TacticalAmber
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary

@Composable
fun LobbyScreen(
    state: ArenaUiState,
    onNameChange: (String) -> Unit,
    onRoomChange: (String) -> Unit,
    onSelectAccent: (String) -> Unit,
    onSelectWeapon: (WeaponChoice) -> Unit,
    onSelectMap: (ArenaMapChoice) -> Unit,
    onLaunchMultiplayer: () -> Unit,
    onLaunchTraining: () -> Unit,
    onOpenSetup: () -> Unit,
    onCloseSetup: () -> Unit,
    onOpenLeaderboard: () -> Unit,
    onCloseLeaderboard: () -> Unit,
    onRefreshLeaderboard: () -> Unit,
    onOpenSettings: () -> Unit,
    onCloseSettings: () -> Unit,
    onUpdateSettings: (ControlSettings) -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(ObsidianVoid)
    ) {
        // Full-bleed tactical arena hero artwork backdrop
        Image(
            painter = painterResource(id = R.drawable.img_arena_hero_1795454724173),
            contentDescription = stringResource(R.string.cd_arena_hero),
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxSize()
        )

        // Multi-stop atmospheric scrim for crisp contrast
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.horizontalGradient(
                        0.0f to ObsidianVoid.copy(alpha = 0.94f),
                        0.52f to ObsidianVoid.copy(alpha = 0.78f),
                        1.0f to ObsidianVoid.copy(alpha = 0.90f)
                    )
                )
        )

        Box(
            modifier = Modifier
                .fillMaxSize()
                .windowInsetsPadding(WindowInsets.safeDrawing)
                .padding(horizontal = 16.dp, vertical = 10.dp)
        ) {
            Column(modifier = Modifier.fillMaxSize()) {
                // Top Header Bar
                LobbyTopBar(
                    isSupabaseConfigured = state.isSupabaseConfigured,
                    onOpenSetup = onOpenSetup,
                    onOpenLeaderboard = onOpenLeaderboard,
                    onOpenSettings = onOpenSettings
                )

                Spacer(modifier = Modifier.height(10.dp))

                // Responsive 2-column tactical command deck
                BoxWithConstraints(modifier = Modifier.weight(1f)) {
                    val isWide = maxWidth >= 560.dp
                    if (isWide) {
                        Row(
                            modifier = Modifier.fillMaxSize(),
                            horizontalArrangement = Arrangement.spacedBy(14.dp)
                        ) {
                            OperatorPanel(
                                state = state,
                                onNameChange = onNameChange,
                                onRoomChange = onRoomChange,
                                onSelectAccent = onSelectAccent,
                                modifier = Modifier
                                    .weight(0.46f)
                                    .fillMaxHeight()
                            )
                            LoadoutAndDeployPanel(
                                state = state,
                                onSelectWeapon = onSelectWeapon,
                                onSelectMap = onSelectMap,
                                onLaunchMultiplayer = onLaunchMultiplayer,
                                onLaunchTraining = onLaunchTraining,
                                modifier = Modifier
                                    .weight(0.54f)
                                    .fillMaxHeight()
                            )
                        }
                    } else {
                        Column(
                            modifier = Modifier
                                .fillMaxSize()
                                .verticalScroll(rememberScrollState()),
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            OperatorPanel(
                                state = state,
                                onNameChange = onNameChange,
                                onRoomChange = onRoomChange,
                                onSelectAccent = onSelectAccent,
                                modifier = Modifier.fillMaxWidth()
                            )
                            LoadoutAndDeployPanel(
                                state = state,
                                onSelectWeapon = onSelectWeapon,
                                onSelectMap = onSelectMap,
                                onLaunchMultiplayer = onLaunchMultiplayer,
                                onLaunchTraining = onLaunchTraining,
                                modifier = Modifier.fillMaxWidth()
                            )
                        }
                    }
                }
            }
        }
    }

    if (state.showSetupDialog) {
        SupabaseSetupDialog(
            isConfigured = state.isSupabaseConfigured,
            onDismiss = onCloseSetup
        )
    }

    if (state.showLeaderboardDialog) {
        LeaderboardDialog(
            uiState = state.leaderboardState,
            onRefresh = onRefreshLeaderboard,
            onDismiss = onCloseLeaderboard
        )
    }

    if (state.showSettingsDialog) {
        ControlSettingsDialog(
            settings = state.settings,
            onUpdate = onUpdateSettings,
            onDismiss = onCloseSettings
        )
    }
}

@Composable
private fun LobbyTopBar(
    isSupabaseConfigured: Boolean,
    onOpenSetup: () -> Unit,
    onOpenLeaderboard: () -> Unit,
    onOpenSettings: () -> Unit
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .border(1.5.dp, PlasmaCyan.copy(alpha = 0.7f), RoundedCornerShape(10.dp))
            ) {
                Image(
                    painter = painterResource(id = R.drawable.ic_vortex_arena_fg_1795454724099),
                    contentDescription = null,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize()
                )
            }
            Spacer(modifier = Modifier.width(10.dp))
            Column {
                Text(
                    text = "VORTEX ARENA",
                    style = MaterialTheme.typography.headlineMedium,
                    color = TextPrimary
                )
                Text(
                    text = stringResource(R.string.subtitle_arena),
                    style = MaterialTheme.typography.labelSmall,
                    color = PlasmaCyan
                )
            }
        }

        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            // Supabase Status Pill
            val statusColor = if (isSupabaseConfigured) BioEmerald else TacticalAmber
            Surface(
                shape = RoundedCornerShape(999.dp),
                color = ObsidianCard.copy(alpha = 0.88f),
                border = BorderStroke(1.dp, statusColor.copy(alpha = 0.65f)),
                modifier = Modifier
                    .heightIn(min = 48.dp)
                    .clip(RoundedCornerShape(999.dp))
                    .clickable(onClick = onOpenSetup)
                    .testTag("supabase_status_pill")
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Icon(
                        imageVector = if (isSupabaseConfigured) Icons.Default.CloudDone else Icons.Default.CloudOff,
                        contentDescription = stringResource(R.string.cd_supabase_info),
                        tint = statusColor,
                        modifier = Modifier.size(16.dp)
                    )
                    Text(
                        text = stringResource(
                            if (isSupabaseConfigured) R.string.status_supabase_online
                            else R.string.status_supabase_unconfigured
                        ),
                        style = MaterialTheme.typography.labelMedium,
                        color = statusColor,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }

            Surface(
                shape = RoundedCornerShape(12.dp),
                color = ObsidianCard.copy(alpha = 0.88f),
                border = BorderStroke(1.dp, BorderSubtle)
            ) {
                IconButton(
                    onClick = onOpenLeaderboard,
                    modifier = Modifier
                        .size(48.dp)
                        .testTag("leaderboard_button")
                ) {
                    Icon(
                        imageVector = Icons.Default.Leaderboard,
                        contentDescription = stringResource(R.string.cd_leaderboard),
                        tint = TacticalAmber
                    )
                }
            }

            Surface(
                shape = RoundedCornerShape(12.dp),
                color = ObsidianCard.copy(alpha = 0.88f),
                border = BorderStroke(1.dp, BorderSubtle)
            ) {
                IconButton(
                    onClick = onOpenSettings,
                    modifier = Modifier
                        .size(48.dp)
                        .testTag("settings_button")
                ) {
                    Icon(
                        imageVector = Icons.Default.Settings,
                        contentDescription = stringResource(R.string.cd_settings),
                        tint = TextPrimary
                    )
                }
            }
        }
    }
}

@Composable
private fun OperatorPanel(
    state: ArenaUiState,
    onNameChange: (String) -> Unit,
    onRoomChange: (String) -> Unit,
    onSelectAccent: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        color = ObsidianSurface.copy(alpha = 0.84f),
        border = BorderStroke(1.dp, BorderSubtle)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            OutlinedTextField(
                value = state.playerName,
                onValueChange = onNameChange,
                label = { Text(stringResource(R.string.label_callsign)) },
                singleLine = true,
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("callsign_input"),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = PlasmaCyan,
                    unfocusedBorderColor = BorderSubtle,
                    focusedLabelColor = PlasmaCyan,
                    unfocusedLabelColor = TextSecondary,
                    focusedTextColor = TextPrimary,
                    unfocusedTextColor = TextPrimary
                )
            )

            OutlinedTextField(
                value = state.roomCode,
                onValueChange = onRoomChange,
                label = { Text(stringResource(R.string.label_room_code)) },
                singleLine = true,
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("room_code_input"),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = PlasmaCyan,
                    unfocusedBorderColor = BorderSubtle,
                    focusedLabelColor = PlasmaCyan,
                    unfocusedLabelColor = TextSecondary,
                    focusedTextColor = TextPrimary,
                    unfocusedTextColor = TextPrimary
                )
            )

            // Quick room selector chips
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                QUICK_ROOMS.forEach { room ->
                    val selected = state.roomCode.equals(room, ignoreCase = true)
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = if (selected) PlasmaCyan.copy(alpha = 0.2f) else ObsidianCard,
                        border = BorderStroke(1.dp, if (selected) PlasmaCyan else BorderSubtle),
                        modifier = Modifier
                            .weight(1f)
                            .heightIn(min = 40.dp)
                            .clip(RoundedCornerShape(8.dp))
                            .clickable { onRoomChange(room) }
                            .testTag("room_chip_${room.lowercase()}")
                    ) {
                        Box(contentAlignment = Alignment.Center, modifier = Modifier.padding(horizontal = 4.dp)) {
                            Text(
                                text = room,
                                style = MaterialTheme.typography.labelSmall,
                                color = if (selected) PlasmaCyan else TextSecondary,
                                maxLines = 1
                            )
                        }
                    }
                }
            }

            // Armor visor accent color picker
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text(
                    text = stringResource(R.string.label_accent_color),
                    style = MaterialTheme.typography.labelMedium,
                    color = TextSecondary
                )
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    ARMOR_ACCENTS.forEach { accent ->
                        val isSelected = state.selectedAccentHex.equals(accent.hex, ignoreCase = true)
                        Box(
                            modifier = Modifier
                                .size(48.dp)
                                .clip(CircleShape)
                                .background(accent.color.copy(alpha = if (isSelected) 0.35f else 0.14f))
                                .border(
                                    width = if (isSelected) 2.5.dp else 1.dp,
                                    color = if (isSelected) accent.color else BorderSubtle,
                                    shape = CircleShape
                                )
                                .clickable { onSelectAccent(accent.hex) }
                                .testTag("accent_${accent.label.lowercase()}"),
                            contentAlignment = Alignment.Center
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(22.dp)
                                    .clip(CircleShape)
                                    .background(accent.color),
                                contentAlignment = Alignment.Center
                            ) {
                                if (isSelected) {
                                    Icon(
                                        imageVector = Icons.Default.Check,
                                        contentDescription = accent.label,
                                        tint = ObsidianVoid,
                                        modifier = Modifier.size(14.dp)
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun LoadoutAndDeployPanel(
    state: ArenaUiState,
    onSelectWeapon: (WeaponChoice) -> Unit,
    onSelectMap: (ArenaMapChoice) -> Unit,
    onLaunchMultiplayer: () -> Unit,
    onLaunchTraining: () -> Unit,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        color = ObsidianSurface.copy(alpha = 0.84f),
        border = BorderStroke(1.dp, BorderSubtle)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Text(
                text = stringResource(R.string.label_loadout),
                style = MaterialTheme.typography.labelMedium,
                color = TextSecondary
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                WeaponChoice.entries.forEach { weapon ->
                    val selected = state.selectedWeapon == weapon
                    val title = when (weapon) {
                        WeaponChoice.RIFLE -> stringResource(R.string.weapon_rifle_name)
                        WeaponChoice.SHOTGUN -> stringResource(R.string.weapon_shotgun_name)
                        WeaponChoice.RAILGUN -> stringResource(R.string.weapon_railgun_name)
                    }
                    val desc = when (weapon) {
                        WeaponChoice.RIFLE -> stringResource(R.string.weapon_rifle_desc)
                        WeaponChoice.SHOTGUN -> stringResource(R.string.weapon_shotgun_desc)
                        WeaponChoice.RAILGUN -> stringResource(R.string.weapon_railgun_desc)
                    }
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = if (selected) PlasmaCyan.copy(alpha = 0.16f) else ObsidianCard,
                        border = BorderStroke(
                            width = if (selected) 1.5.dp else 1.dp,
                            color = if (selected) PlasmaCyan else BorderSubtle
                        ),
                        modifier = Modifier
                            .weight(1f)
                            .heightIn(min = 66.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .clickable { onSelectWeapon(weapon) }
                            .testTag("weapon_card_${weapon.id}")
                    ) {
                        Column(modifier = Modifier.padding(8.dp)) {
                            Text(
                                text = title,
                                style = MaterialTheme.typography.titleSmall,
                                color = if (selected) PlasmaCyan else TextPrimary,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = desc,
                                style = MaterialTheme.typography.bodySmall,
                                color = TextSecondary,
                                maxLines = 2,
                                overflow = TextOverflow.Ellipsis
                            )
                        }
                    }
                }
            }

            Text(
                text = stringResource(R.string.label_arena_map),
                style = MaterialTheme.typography.labelMedium,
                color = TextSecondary
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                ArenaMapChoice.entries.forEach { map ->
                    val selected = state.selectedMap == map
                    val name = if (map == ArenaMapChoice.FOUNDRY) {
                        stringResource(R.string.map_foundry_name)
                    } else {
                        stringResource(R.string.map_courtyard_name)
                    }
                    val desc = if (map == ArenaMapChoice.FOUNDRY) {
                        stringResource(R.string.map_foundry_desc)
                    } else {
                        stringResource(R.string.map_courtyard_desc)
                    }
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = if (selected) LethalCrimson.copy(alpha = 0.18f) else ObsidianCard,
                        border = BorderStroke(
                            width = if (selected) 1.5.dp else 1.dp,
                            color = if (selected) LethalCrimson else BorderSubtle
                        ),
                        modifier = Modifier
                            .weight(1f)
                            .heightIn(min = 56.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .clickable { onSelectMap(map) }
                            .testTag("map_card_${map.id}")
                    ) {
                        Column(modifier = Modifier.padding(horizontal = 10.dp, vertical = 8.dp)) {
                            Text(
                                text = name,
                                style = MaterialTheme.typography.titleSmall,
                                color = if (selected) TextPrimary else TextPrimary.copy(alpha = 0.85f)
                            )
                            Text(
                                text = desc,
                                style = MaterialTheme.typography.bodySmall,
                                color = TextSecondary,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.weight(1f, fill = false))

            // Primary Deploy Actions
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Button(
                    onClick = onLaunchMultiplayer,
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (state.isSupabaseConfigured) PlasmaCyan else LethalCrimson,
                        contentColor = if (state.isSupabaseConfigured) ObsidianVoid else TextPrimary
                    ),
                    contentPadding = PaddingValues(horizontal = 14.dp, vertical = 12.dp),
                    modifier = Modifier
                        .weight(1.25f)
                        .heightIn(min = 52.dp)
                        .testTag("play_multiplayer_button")
                ) {
                    Icon(
                        imageVector = Icons.Default.PlayArrow,
                        contentDescription = null,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = stringResource(R.string.btn_play_multiplayer),
                        style = MaterialTheme.typography.labelLarge,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }

                OutlinedButton(
                    onClick = onLaunchTraining,
                    shape = RoundedCornerShape(12.dp),
                    border = BorderStroke(1.5.dp, PlasmaCyan.copy(alpha = 0.7f)),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = PlasmaCyan),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 12.dp),
                    modifier = Modifier
                        .weight(1f)
                        .heightIn(min = 52.dp)
                        .testTag("play_training_button")
                ) {
                    Icon(
                        imageVector = Icons.Default.GpsFixed,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = stringResource(R.string.btn_play_training),
                        style = MaterialTheme.typography.labelLarge,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }
        }
    }
}

@Composable
private fun SupabaseSetupDialog(
    isConfigured: Boolean,
    onDismiss: () -> Unit
) {
    val context = LocalContext.current
    var copied by remember { mutableStateOf(false) }

    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = ObsidianSurface,
        title = {
            Text(
                text = stringResource(R.string.setup_title),
                style = MaterialTheme.typography.titleMedium,
                color = PlasmaCyan
            )
        },
        text = {
            Column(
                modifier = Modifier.verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Text(
                    text = if (isConfigured) {
                        "Supabase Realtime активен и готов к сетевым матчам! При желании выполните SQL ниже для сохранения глобальной таблицы лидеров:"
                    } else {
                        stringResource(R.string.setup_body)
                    },
                    style = MaterialTheme.typography.bodyMedium,
                    color = TextPrimary
                )

                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = ObsidianVoid,
                    border = BorderStroke(1.dp, BorderSubtle)
                ) {
                    Text(
                        text = SUPABASE_LEADERBOARD_SQL,
                        style = MaterialTheme.typography.labelSmall,
                        color = PlasmaCyan,
                        modifier = Modifier.padding(10.dp)
                    )
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as? ClipboardManager
                    clipboard?.setPrimaryClip(ClipData.newPlainText("Supabase SQL", SUPABASE_LEADERBOARD_SQL))
                    copied = true
                },
                colors = ButtonDefaults.buttonColors(
                    containerColor = PlasmaCyan,
                    contentColor = ObsidianVoid
                ),
                modifier = Modifier.testTag("copy_sql_button")
            ) {
                Icon(
                    imageVector = Icons.Default.ContentCopy,
                    contentDescription = null,
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(stringResource(if (copied) R.string.setup_sql_copied else R.string.setup_copy_sql))
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text(stringResource(R.string.close), color = TextSecondary)
            }
        }
    )
}

@Composable
private fun LeaderboardDialog(
    uiState: LeaderboardUiState,
    onRefresh: () -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = ObsidianSurface,
        title = {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Icon(Icons.Default.EmojiEvents, contentDescription = null, tint = TacticalAmber)
                    Text(
                        text = stringResource(R.string.leaderboard_title),
                        style = MaterialTheme.typography.titleMedium,
                        color = TextPrimary
                    )
                }
                IconButton(onClick = onRefresh, modifier = Modifier.size(48.dp)) {
                    Icon(
                        imageVector = Icons.Default.Refresh,
                        contentDescription = stringResource(R.string.leaderboard_refresh),
                        tint = PlasmaCyan
                    )
                }
            }
        },
        text = {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .heightIn(min = 120.dp, max = 260.dp)
            ) {
                when (uiState) {
                    LeaderboardUiState.Idle, LeaderboardUiState.Loading -> {
                        CircularProgressIndicator(
                            color = PlasmaCyan,
                            modifier = Modifier.align(Alignment.Center)
                        )
                    }
                    LeaderboardUiState.Unconfigured -> {
                        Text(
                            text = stringResource(R.string.leaderboard_need_setup),
                            style = MaterialTheme.typography.bodyMedium,
                            color = TextSecondary
                        )
                    }
                    is LeaderboardUiState.Error -> {
                        Text(
                            text = uiState.message,
                            style = MaterialTheme.typography.bodyMedium,
                            color = LethalCrimson
                        )
                    }
                    is LeaderboardUiState.Success -> {
                        if (uiState.entries.isEmpty()) {
                            Text(
                                text = stringResource(R.string.leaderboard_empty),
                                style = MaterialTheme.typography.bodyMedium,
                                color = TextSecondary
                            )
                        } else {
                            Column(
                                modifier = Modifier.verticalScroll(rememberScrollState()),
                                verticalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                uiState.entries.forEachIndexed { idx, entry ->
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .clip(RoundedCornerShape(8.dp))
                                            .background(ObsidianCard)
                                            .padding(horizontal = 10.dp, vertical = 8.dp),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(
                                            text = "#${idx + 1} ${entry.playerName}",
                                            style = MaterialTheme.typography.titleSmall,
                                            color = if (idx == 0) TacticalAmber else TextPrimary
                                        )
                                        Text(
                                            text = "${entry.kills}K / ${entry.deaths}D · ${entry.lastRoom}",
                                            style = MaterialTheme.typography.labelMedium,
                                            color = PlasmaCyan
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text(stringResource(R.string.close), color = PlasmaCyan)
            }
        }
    )
}

@Composable
private fun ControlSettingsDialog(
    settings: ControlSettings,
    onUpdate: (ControlSettings) -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = ObsidianSurface,
        title = {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Icon(Icons.Default.Tune, contentDescription = null, tint = PlasmaCyan)
                Text(
                    text = stringResource(R.string.settings_title),
                    style = MaterialTheme.typography.titleMedium,
                    color = TextPrimary
                )
            }
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text(
                    text = "${stringResource(R.string.settings_sensitivity)}: ${String.format("%.1fx", settings.sensitivity)}",
                    style = MaterialTheme.typography.bodyMedium,
                    color = TextPrimary
                )
                Slider(
                    value = settings.sensitivity,
                    onValueChange = { onUpdate(settings.copy(sensitivity = it)) },
                    valueRange = 0.4f..2.2f,
                    colors = SliderDefaults.colors(
                        thumbColor = PlasmaCyan,
                        activeTrackColor = PlasmaCyan,
                        inactiveTrackColor = ObsidianElevated
                    )
                )
                HorizontalDivider(color = BorderSubtle)
                SettingsToggleRow(
                    label = stringResource(R.string.settings_invert_y),
                    checked = settings.invertY,
                    onCheckedChange = { onUpdate(settings.copy(invertY = it)) }
                )
                SettingsToggleRow(
                    label = stringResource(R.string.settings_sound),
                    checked = settings.soundEnabled,
                    onCheckedChange = { onUpdate(settings.copy(soundEnabled = it)) }
                )
                SettingsToggleRow(
                    label = stringResource(R.string.settings_haptics),
                    checked = settings.hapticsEnabled,
                    onCheckedChange = { onUpdate(settings.copy(hapticsEnabled = it)) }
                )
            }
        },
        confirmButton = {
            Button(
                onClick = onDismiss,
                colors = ButtonDefaults.buttonColors(
                    containerColor = PlasmaCyan,
                    contentColor = ObsidianVoid
                )
            ) {
                Text(stringResource(R.string.close), fontWeight = FontWeight.Bold)
            }
        }
    )
}

@Composable
private fun SettingsToggleRow(
    label: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(text = label, style = MaterialTheme.typography.bodyMedium, color = TextPrimary)
        Switch(
            checked = checked,
            onCheckedChange = onCheckedChange,
            colors = SwitchDefaults.colors(
                checkedThumbColor = ObsidianVoid,
                checkedTrackColor = PlasmaCyan
            )
        )
    }
}
