package com.nush.app.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// Site palette  ───────────────────────────────────────────────────────────────
val PinkPrimary   = Color(0xFFFF5C8E)
val PinkDeep      = Color(0xFFE0457A)
val PinkContainer = Color(0xFFFFD6E4)
val Lavender      = Color(0xFFD6B4E8)
val Plum          = Color(0xFF3B2245)
val PlumSoft      = Color(0xFF5A3568)
val CreamBg       = Color(0xFFFFF4ED)
val ErrorRed      = Color(0xFFB00020)

private val LightColors = lightColorScheme(
    primary          = PinkPrimary,
    onPrimary        = Color.White,
    primaryContainer = PinkContainer,
    onPrimaryContainer = Plum,
    secondary        = PlumSoft,
    onSecondary      = Color.White,
    background       = CreamBg,
    onBackground     = Plum,
    surface          = Color.White,
    onSurface        = Plum,
    error            = ErrorRed,
)

private val DarkColors = darkColorScheme(
    primary          = PinkPrimary,
    onPrimary        = Plum,
    primaryContainer = PlumSoft,
    onPrimaryContainer = PinkContainer,
    secondary        = Lavender,
    onSecondary      = Plum,
    background       = Color(0xFF1A0A22),
    onBackground     = Color(0xFFFFE4F0),
    surface          = Color(0xFF2A1035),
    onSurface        = Color(0xFFFFD6E4),
    error            = Color(0xFFCF6679),
)

@Composable
fun NushTheme(
    darkTheme: Boolean = false,
    content: @Composable () -> Unit,
) {
    val colors = if (darkTheme) DarkColors else LightColors
    MaterialTheme(
        colorScheme = colors,
        content     = content,
    )
}
