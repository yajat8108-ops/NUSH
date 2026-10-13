package com.nush.app.ui.components

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.EaseInOutCubic
import androidx.compose.animation.core.EaseOutBack
import androidx.compose.animation.core.EaseOutQuart
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlin.math.sin
import kotlin.random.Random

// ── Palette ──────────────────────────────────────────────────────────────────
private val CalcDarkBg    = Color(0xFF0D0D14)
private val CalcSurface   = Color(0xFF1A1A24)
private val CalcNumBtn    = Color(0xFF252533)
private val CalcOpBtn     = Color(0xFFE8407A)
private val CalcActionBtn = Color(0xFF353548)
private val CalcScreenBg  = Color(0xFF080810)
private val TextWhite     = Color(0xFFF0F0FA)
private val TextMuted     = Color(0xFF7070A0)
private val PinkGlow      = Color(0xFFFF5C8E)
private val PinkSoft      = Color(0xFFFF94B8)
private val PurpleGlow    = Color(0xFFB06EE0)

// ── Particle model ────────────────────────────────────────────────────────────
private data class AmbientDot(
    val id: Int,
    val startX: Float,   // 0..1 normalised
    val startY: Float,   // 0..1 normalised
    val size: Float,
    val driftX: Float,
    val driftY: Float,
    val durationMs: Int,
    val delayMs: Int,
    val color: Color
)

private data class BurstParticle(
    val id: Int,
    val x: Float,
    val y: Float,
    val size: Float,
    val text: String
)

// ── Main composable ───────────────────────────────────────────────────────────
@Composable
fun CalculatorAuthScreen(
    onUnlocked: () -> Unit,
    modifier: Modifier = Modifier
) {
    var displayExpression by remember { mutableStateOf("0") }
    var rawInputBuffer    by remember { mutableStateOf("") }
    var showSecretKeypad  by remember { mutableStateOf(false) }
    var showBurst         by remember { mutableStateOf(false) }
    var unlocking         by remember { mutableStateOf(false) }

    val haptic        = LocalHapticFeedback.current
    val coroutineScope = rememberCoroutineScope()

    // Unlock transition scale + fade
    val containerScale = remember { Animatable(1f) }
    val containerAlpha = remember { Animatable(1f) }

    // Burst particles
    val burstParticles = remember { mutableStateListOf<BurstParticle>() }

    // Ambient floating dots (always visible in background)
    val ambientDots = remember {
        val colors = listOf(PinkGlow, PinkSoft, PurpleGlow, Color.White)
        List(18) { i ->
            AmbientDot(
                id        = i,
                startX    = Random.nextFloat(),
                startY    = Random.nextFloat(),
                size      = Random.nextFloat() * 6f + 3f,
                driftX    = (Random.nextFloat() - 0.5f) * 0.12f,
                driftY    = -(Random.nextFloat() * 0.15f + 0.05f),
                durationMs = Random.nextInt(3000, 6000),
                delayMs    = Random.nextInt(0, 3000),
                color     = colors[i % colors.size].copy(alpha = Random.nextFloat() * 0.3f + 0.05f)
            )
        }
    }

    // Cursor blink
    val cursorInfinite = rememberInfiniteTransition(label = "cursor")
    val cursorAlpha by cursorInfinite.animateFloat(
        initialValue = 1f, targetValue = 0f,
        animationSpec = infiniteRepeatable(
            animation = tween(530, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "cursorAlpha"
    )

    // Rotating ambient gradient hue offset
    val gradientInfinite = rememberInfiniteTransition(label = "gradient")
    val gradientAngle by gradientInfinite.animateFloat(
        initialValue = 0f, targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(12000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "gradientAngle"
    )

    fun checkAndUnlock(input: String) {
        if (input.lowercase().contains("chintapakdamdam") && !unlocking) {
            unlocking = true
            haptic.performHapticFeedback(HapticFeedbackType.LongPress)
            showBurst = true

            burstParticles.clear()
            val emojis = listOf("💖", "🤍", "✨", "🌸", "🧸", "💌", "🌙", "💫", "🎀")
            repeat(45) { i ->
                burstParticles.add(
                    BurstParticle(
                        id   = i,
                        x    = Random.nextFloat() * 380f + 10f,
                        y    = Random.nextFloat() * 700f + 80f,
                        size = Random.nextFloat() * 22f + 14f,
                        text = emojis[i % emojis.size]
                    )
                )
            }

            coroutineScope.launch {
                // Pop the screen
                containerScale.animateTo(1.06f, tween(180, easing = EaseOutBack))
                delay(60)
                containerScale.animateTo(1f, tween(200, easing = EaseInOutCubic))
                delay(500)
                // Fade + shrink out
                containerScale.animateTo(0.85f, tween(450, easing = EaseInOutCubic))
                containerAlpha.animateTo(0f, tween(450, easing = EaseOutQuart))
                delay(100)
                onUnlocked()
            }
        }
    }

    fun onKeyClicked(label: String) {
        if (unlocking) return
        haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
        when (label) {
            "C"  -> { displayExpression = "0"; rawInputBuffer = "" }
            "⌫"  -> {
                rawInputBuffer    = rawInputBuffer.dropLast(1)
                displayExpression = if (displayExpression.length > 1) displayExpression.dropLast(1) else "0"
            }
            "="  -> {
                displayExpression = try { evaluateSimpleExpression(displayExpression) }
                catch (_: Exception) { "Error" }
            }
            else -> {
                rawInputBuffer    += label.lowercase()
                displayExpression  = if (displayExpression == "0" || displayExpression == "Error")
                    label else displayExpression + label
                checkAndUnlock(rawInputBuffer)
            }
        }
    }

    // ── Root box ──────────────────────────────────────────────────────────────
    Box(
        modifier = modifier
            .fillMaxSize()
            .graphicsLayer {
                scaleX = containerScale.value
                scaleY = containerScale.value
                alpha  = containerAlpha.value
            }
            .background(CalcDarkBg)
    ) {

        // ── Ambient floating dots (Canvas) ────────────────────────────────────
        Canvas(modifier = Modifier.fillMaxSize()) {
            // Subtle radial gradient vignette
            val cx = size.width / 2f
            val cy = size.height * 0.4f
            drawCircle(
                brush = Brush.radialGradient(
                    colors = listOf(PinkGlow.copy(alpha = 0.07f), Color.Transparent),
                    center = androidx.compose.ui.geometry.Offset(cx, cy),
                    radius = size.width * 0.7f
                ),
                radius = size.width * 0.7f,
                center = androidx.compose.ui.geometry.Offset(cx, cy)
            )
        }

        ambientDots.forEach { dot ->
            val infinite = rememberInfiniteTransition(label = "dot${dot.id}")
            val progress by infinite.animateFloat(
                initialValue = 0f, targetValue = 1f,
                animationSpec = infiniteRepeatable(
                    animation = tween(dot.durationMs, delayMillis = dot.delayMs, easing = LinearEasing),
                    repeatMode = RepeatMode.Restart
                ),
                label = "dotProgress${dot.id}"
            )
            // sin wave drift on X, linear drift on Y
            val screenW = 400f
            val screenH = 860f
            val px = (dot.startX + dot.driftX * sin(progress * Math.PI.toFloat() * 2)) * screenW
            val py = ((dot.startY + dot.driftY * progress) % 1f + 1f) % 1f * screenH
            val dotAlpha = when {
                progress < 0.1f -> progress / 0.1f
                progress > 0.85f -> (1f - progress) / 0.15f
                else -> 1f
            } * dot.color.alpha

            Canvas(
                modifier = Modifier
                    .offset(x = px.dp, y = py.dp)
                    .size(dot.size.dp)
            ) {
                drawCircle(color = dot.color.copy(alpha = dotAlpha))
            }
        }

        // ── Main UI column ────────────────────────────────────────────────────
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 18.dp, vertical = 28.dp),
            verticalArrangement = Arrangement.Bottom
        ) {
            // Header bar
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 10.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("RAD", color = TextMuted.copy(alpha = 0.5f), fontSize = 12.sp, fontWeight = FontWeight.SemiBold)

                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(CalcSurface)
                        .clickable {
                            showSecretKeypad = !showSecretKeypad
                            haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                        }
                        .padding(horizontal = 10.dp, vertical = 5.dp)
                ) {
                    Text(
                        text = if (showSecretKeypad) "123" else "ABC",
                        color = TextMuted,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium
                    )
                }
            }

            // ── Display screen ─────────────────────────────────────────────
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
                    .clip(RoundedCornerShape(20.dp))
                    .background(
                        Brush.verticalGradient(
                            listOf(CalcScreenBg, Color(0xFF0A0A18))
                        )
                    )
                    .padding(horizontal = 20.dp, vertical = 16.dp),
                contentAlignment = Alignment.BottomEnd
            ) {
                Column(horizontalAlignment = Alignment.End) {
                    // Sub-expression (raw buffer, dimmed)
                    if (rawInputBuffer.isNotEmpty()) {
                        Text(
                            text = rawInputBuffer,
                            color = TextMuted.copy(alpha = 0.35f),
                            fontSize = 14.sp,
                            maxLines = 1,
                            fontFamily = FontFamily.Monospace
                        )
                        Spacer(Modifier.height(2.dp))
                    }
                    // Main expression + blinking cursor
                    Row(verticalAlignment = Alignment.Bottom) {
                        Text(
                            text = displayExpression,
                            color = TextWhite,
                            fontSize = if (displayExpression.length > 9) 34.sp else 46.sp,
                            fontWeight = FontWeight.Bold,
                            textAlign = TextAlign.End,
                            maxLines = 2,
                            lineHeight = 50.sp
                        )
                        // Blinking cursor pipe
                        Text(
                            text = "|",
                            color = PinkGlow.copy(alpha = cursorAlpha),
                            fontSize = 36.sp,
                            fontWeight = FontWeight.Light,
                            modifier = Modifier.padding(start = 2.dp, bottom = 2.dp)
                        )
                    }
                }
            }

            Spacer(Modifier.height(16.dp))

            // ── Keypad ─────────────────────────────────────────────────────
            if (!showSecretKeypad) {
                val buttons = listOf(
                    listOf("C", "±", "%", "÷"),
                    listOf("7", "8", "9", "×"),
                    listOf("4", "5", "6", "−"),
                    listOf("1", "2", "3", "+"),
                    listOf("0", ".", "⌫", "=")
                )
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    buttons.forEachIndexed { rowIdx, row ->
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            row.forEachIndexed { colIdx, btn ->
                                val isOp     = btn in listOf("÷", "×", "−", "+", "=")
                                val isAction = btn in listOf("C", "±", "%", "⌫")
                                val btnBg = when {
                                    isOp     -> Brush.linearGradient(listOf(CalcOpBtn, PurpleGlow.copy(alpha = 0.7f)))
                                    isAction -> Brush.linearGradient(listOf(CalcActionBtn, CalcActionBtn))
                                    else     -> Brush.linearGradient(listOf(CalcNumBtn, CalcNumBtn))
                                }
                                val textColor = if (isOp) Color.White else TextWhite
                                GlowCalcButton(
                                    label     = btn,
                                    bgBrush   = btnBg,
                                    glowColor = if (isOp) PinkGlow else Color.Transparent,
                                    textColor = textColor,
                                    modifier  = Modifier.weight(1f),
                                    onClick   = { onKeyClicked(btn) }
                                )
                            }
                        }
                    }
                }
            } else {
                // QWERTY
                val rows = listOf(
                    listOf("q","w","e","r","t","y","u","i","o","p"),
                    listOf("a","s","d","f","g","h","j","k","l"),
                    listOf("z","x","c","v","b","n","m","⌫")
                )
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(7.dp)
                ) {
                    rows.forEach { row ->
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(5.dp)
                        ) {
                            row.forEach { letter ->
                                val isBack = letter == "⌫"
                                GlowCalcButton(
                                    label     = letter,
                                    bgBrush   = Brush.linearGradient(
                                        listOf(
                                            if (isBack) CalcActionBtn else CalcNumBtn,
                                            if (isBack) CalcActionBtn else CalcNumBtn
                                        )
                                    ),
                                    glowColor = Color.Transparent,
                                    textColor = TextWhite,
                                    textSize  = 17.sp,
                                    modifier  = Modifier.weight(if (isBack) 1.4f else 1f),
                                    onClick   = { onKeyClicked(letter) }
                                )
                            }
                        }
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        GlowCalcButton(
                            label     = "C",
                            bgBrush   = Brush.linearGradient(listOf(CalcActionBtn, CalcActionBtn)),
                            glowColor = Color.Transparent,
                            textColor = TextWhite,
                            modifier  = Modifier.weight(1f),
                            onClick   = { onKeyClicked("C") }
                        )
                        GlowCalcButton(
                            label     = "space",
                            bgBrush   = Brush.linearGradient(listOf(CalcNumBtn, CalcNumBtn)),
                            glowColor = Color.Transparent,
                            textColor = TextMuted,
                            textSize  = 14.sp,
                            modifier  = Modifier.weight(2.2f),
                            onClick   = { /* Normal keyboard spacebar */ }
                        )
                        GlowCalcButton(
                            label     = "=",
                            bgBrush   = Brush.linearGradient(listOf(CalcOpBtn, CalcOpBtn)),
                            glowColor = PinkGlow,
                            textColor = Color.White,
                            modifier  = Modifier.weight(1f),
                            onClick   = {
                                // Checking code automatically happens on each letter press, but hitting '=' also checks
                                checkAndUnlock(rawInputBuffer)
                            }
                        )
                    }
                }
            }
        }

        // ── Burst particles on unlock ────────────────────────────────────────
        if (showBurst) {
            burstParticles.forEach { p ->
                val inf  = rememberInfiniteTransition(label = "burst${p.id}")
                val rise by inf.animateFloat(
                    initialValue = 0f, targetValue = -380f,
                    animationSpec = infiniteRepeatable(
                        animation = tween(900 + p.id * 18, easing = EaseOutQuart),
                        repeatMode = RepeatMode.Restart
                    ),
                    label = "rise${p.id}"
                )
                val fade by inf.animateFloat(
                    initialValue = 1f, targetValue = 0f,
                    animationSpec = infiniteRepeatable(
                        animation = tween(900 + p.id * 18, easing = LinearEasing),
                        repeatMode = RepeatMode.Restart
                    ),
                    label = "fade${p.id}"
                )
                Text(
                    text     = p.text,
                    fontSize = p.size.sp,
                    modifier = Modifier
                        .offset(x = p.x.dp, y = (p.y + rise).dp)
                        .graphicsLayer { alpha = fade }
                )
            }
        }
    }
}

// ── Glowing button composable ─────────────────────────────────────────────────
@Composable
private fun GlowCalcButton(
    label: String,
    bgBrush: Brush,
    glowColor: Color,
    textColor: Color,
    modifier: Modifier = Modifier,
    textSize: androidx.compose.ui.unit.TextUnit = 22.sp,
    onClick: () -> Unit
) {
    var pressed by remember { mutableStateOf(false) }
    val scale by animateFloatAsState(
        targetValue = if (pressed) 0.90f else 1f,
        animationSpec = spring(stiffness = 600f),
        label = "btnScale"
    )
    val glowAlpha by animateFloatAsState(
        targetValue = if (pressed) 0.55f else 0f,
        animationSpec = tween(120),
        label = "btnGlow"
    )

    Box(
        modifier = modifier
            .aspectRatio(1.1f)
            .scale(scale)
    ) {
        // Outer glow bloom (only for operator buttons)
        if (glowColor != Color.Transparent) {
            Box(
                modifier = Modifier
                    .matchParentSize()
                    .graphicsLayer { shadowElevation = 0f }
                    .background(
                        brush = Brush.radialGradient(
                            listOf(
                                glowColor.copy(alpha = glowAlpha * 0.6f),
                                Color.Transparent
                            )
                        ),
                        shape = RoundedCornerShape(24.dp)
                    )
            )
        }

        Box(
            modifier = Modifier
                .fillMaxSize()
                .clip(RoundedCornerShape(22.dp))
                .background(bgBrush)
                .clickable(
                    interactionSource = remember { MutableInteractionSource() },
                    indication = null
                ) {
                    pressed = true
                    onClick()
                },
            contentAlignment = Alignment.Center
        ) {
            Text(
                text       = label,
                color      = textColor,
                fontSize   = textSize,
                fontWeight = FontWeight.SemiBold,
                textAlign  = TextAlign.Center
            )
        }
    }

    LaunchedEffect(pressed) {
        if (pressed) { delay(80); pressed = false }
    }
}

// ── Expression evaluator ──────────────────────────────────────────────────────
private fun evaluateSimpleExpression(expr: String): String {
    val clean = expr.replace("×", "*").replace("÷", "/").replace("−", "-")
    val parts = clean.split(Regex("(?<=[-+*/])|(?=[-+*/])"))
    if (parts.size >= 3) {
        val n1 = parts[0].trim().toDoubleOrNull() ?: return expr
        val op = parts[1].trim()
        val n2 = parts[2].trim().toDoubleOrNull() ?: return expr
        val res = when (op) {
            "+" -> n1 + n2
            "-" -> n1 - n2
            "*" -> n1 * n2
            "/" -> if (n2 != 0.0) n1 / n2 else return "Error"
            else -> return expr
        }
        return if (res % 1.0 == 0.0) res.toLong().toString() else "%.2f".format(res)
    }
    return expr
}
