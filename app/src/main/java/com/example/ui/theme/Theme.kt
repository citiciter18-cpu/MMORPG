package com.example.ui.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp

private val ArenaDarkColorScheme = darkColorScheme(
    primary = PlasmaCyan,
    onPrimary = ObsidianVoid,
    primaryContainer = ObsidianElevated,
    onPrimaryContainer = PlasmaCyan,
    secondary = LethalCrimson,
    onSecondary = TextPrimary,
    secondaryContainer = ColorTokens.CrimsonContainer,
    onSecondaryContainer = TextPrimary,
    tertiary = TacticalAmber,
    onTertiary = ObsidianVoid,
    background = ObsidianVoid,
    onBackground = TextPrimary,
    surface = ObsidianSurface,
    onSurface = TextPrimary,
    surfaceVariant = ObsidianCard,
    onSurfaceVariant = TextSecondary,
    outline = BorderSubtle,
    outlineVariant = ObsidianElevated
)

private object ColorTokens {
    val CrimsonContainer = androidx.compose.ui.graphics.Color(0xFF471220)
}

private val ArenaShapes = Shapes(
    small = RoundedCornerShape(8.dp),
    medium = RoundedCornerShape(12.dp),
    large = RoundedCornerShape(16.dp)
)

@Composable
fun VortexArenaTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = ArenaDarkColorScheme,
        typography = ArenaTypography,
        shapes = ArenaShapes,
        content = content
    )
}
