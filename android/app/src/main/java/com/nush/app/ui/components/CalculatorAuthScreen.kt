package com.nush.app.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.scaleIn
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.ripple.rememberRipple
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
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
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlin.math.roundToInt
import kotlin.random.Random

private val CalcDarkBg     = Color(0xFF141419)
private val CalcSurface    = Color(0xFF1F1F27)
private val CalcNumBtn     = Color(0xFF2B2B36)
private val CalcOpBtn      = Color(0xFFFF5C8E)
private val CalcActionBtn  = Color(0xFF3F3F50)
private val CalcScreenBg   = Color(0xFF0E0E12)
private val TextWhite      = Color(0xFFF5F5FA)
private val TextMuted      = Color(0xFF8E8EA0)
private val PinkGlow       = Color(0xFFFF5C8E)

data class FloatingParticle(
    val id: Int,
    val x: Float,
    val y: Float,
    val size: Float,
    val color: Color,
    val text: String
)

@Composable
fun CalculatorAuthScreen(
    onUnlocked: () -> Unit,
    modifier: Modifier = Modifier
) {
    var displayExpression by remember { mutableStateOf("0") }
    var rawInputBuffer by remember { mutableStateOf("") }
    var isUnlocked by remember { mutableStateOf(false) }
    var showSecretKeypad by remember { mutableStateOf(false) }
    var showHeartBurst by remember { mutableStateOf(false) }
    val haptic = LocalHapticFeedback.current
    val coroutineScope = rememberCoroutineScope()

    // Unlock codeword
    val secretCodeword = "chintapakdamdam"

    // Particles for dramatic unlock animation
    val particles = remember { mutableStateListOf<FloatingParticle>() }

    // Heartbeat scale animation when unlocked
    val unlockScale = remember { Animatable(1f) }

    fun checkAndUnlock(input: String) {
        val sanitized = input.lowercase().trim()
        if (sanitized.contains(secretCodeword)) {
            haptic.performHapticFeedback(HapticFeedbackType.LongPress)
            isUnlocked = true
            showHeartBurst = true

            // Trigger burst of romantic particles
            particles.clear()
            val emojis = listOf("💖", "🤍", "✨", "🌸", "🧸", "💌")
            for (i in 0 until 35) {
                particles.add(
                    FloatingParticle(
                        id = i,
                        x = Random.nextFloat() * 1000f,
                        y = Random.nextFloat() * 1800f,
                        size = Random.nextFloat() * 20f + 14f,
                        color = listOf(Color(0xFFFF5C8E), Color(0xFFFF94B8), Color(0xFFD6B4E8), Color.White).random(),
                        text = emojis.random()
                    )
                )
            }

            coroutineScope.launch {
                unlockScale.animateTo(1.25f, animationSpec = tween(350, easing = FastOutSlowInEasing))
                unlockScale.animateTo(0f, animationSpec = tween(500, easing = FastOutSlowInEasing))
                delay(200)
                onUnlocked()
            }
        }
    }

    fun onKeyClicked(label: String) {
        haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)

        when (label) {
            "C" -> {
                displayExpression = "0"
                rawInputBuffer = ""
            }
            "⌫" -> {
                if (rawInputBuffer.isNotEmpty()) {
                    rawInputBuffer = rawInputBuffer.dropLast(1)
                }
                displayExpression = if (displayExpression.length > 1) displayExpression.dropLast(1) else "0"
            }
            "=" -> {
                try {
                    // Try evaluating standard simple math expressions
                    val result = evaluateSimpleExpression(displayExpression)
                    displayExpression = result
                } catch (e: Exception) {
                    displayExpression = "Error"
                }
            }
            else -> {
                rawInputBuffer += label.lowercase()
                displayExpression = if (displayExpression == "0" || displayExpression == "Error") label else displayExpression + label
                checkAndUnlock(rawInputBuffer)
            }
        }
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(CalcDarkBg)
            .scale(unlockScale.value)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 20.dp, vertical = 24.dp),
            verticalArrangement = Arrangement.Bottom
        ) {
            // Top Disguise Header with interactive toggle for alpha keypad
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 12.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "RAD",
                    color = TextMuted.copy(alpha = 0.6f),
                    fontSize = 13.sp,
                    fontWeight = FontWeight.SemiBold
                )

                // Discreet mode switch icon (switches between standard digits and full alphabet mode)
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .background(if (showSecretKeypad) CalcOpBtn.copy(alpha = 0.2f) else CalcSurface)
                        .clickable {
                            showSecretKeypad = !showSecretKeypad
                            haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                        }
                        .padding(horizontal = 10.dp, vertical = 5.dp)
                ) {
                    Text(
                        text = if (showSecretKeypad) "ABC" else "123",
                        color = if (showSecretKeypad) CalcOpBtn else TextMuted,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            // Calculation Screen Display with subtle glowing backdrop
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
                    .clip(RoundedCornerShape(20.dp))
                    .background(CalcScreenBg)
                    .padding(20.dp),
                contentAlignment = Alignment.BottomEnd
            ) {
                Column(horizontalAlignment = Alignment.End) {
                    if (rawInputBuffer.isNotEmpty()) {
                        Text(
                            text = rawInputBuffer,
                            color = TextMuted.copy(alpha = 0.45f),
                            fontSize = 16.sp,
                            maxLines = 1,
                            fontFamily = FontFamily.Monospace
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                    }
                    Text(
                        text = displayExpression,
                        color = TextWhite,
                        fontSize = if (displayExpression.length > 9) 36.sp else 48.sp,
                        fontWeight = FontWeight.Bold,
                        textAlign = TextAlign.End,
                        maxLines = 2,
                        lineHeight = 52.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(18.dp))

            // Keypad Layout (Standard or Secret Alphabet keyboard for entering the secret codeword)
            if (!showSecretKeypad) {
                // Standard Calculator Keypad
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
                    buttons.forEach { row ->
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            row.forEach { btn ->
                                val isOp = btn in listOf("÷", "×", "−", "+", "=")
                                val isAction = btn in listOf("C", "±", "%", "⌫")
                                val btnBg = when {
                                    isOp -> CalcOpBtn
                                    isAction -> CalcActionBtn
                                    else -> CalcNumBtn
                                }
                                val textColor = if (isOp) Color.White else TextWhite

                                CalcButton(
                                    label = btn,
                                    bgColor = btnBg,
                                    textColor = textColor,
                                    modifier = Modifier.weight(1f),
                                    onClick = { onKeyClicked(btn) }
                                )
                            }
                        }
                    }
                }
            } else {
                // QWERTY / Alpha Keypad for secret passcode entry
                val rows = listOf(
                    listOf("q", "w", "e", "r", "t", "y", "u", "i", "o", "p"),
                    listOf("a", "s", "d", "f", "g", "h", "j", "k", "l"),
                    listOf("z", "x", "c", "v", "b", "n", "m", "⌫")
                )

                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    rows.forEach { row ->
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            row.forEach { letter ->
                                val isBack = letter == "⌫"
                                CalcButton(
                                    label = letter,
                                    bgColor = if (isBack) CalcActionBtn else CalcNumBtn,
                                    textColor = TextWhite,
                                    textSize = 18.sp,
                                    modifier = Modifier.weight(if (isBack) 1.4f else 1f),
                                    onClick = { onKeyClicked(letter) }
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(4.dp))

                    // Spacebar and Clear row
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        CalcButton(
                            label = "Clear",
                            bgColor = CalcActionBtn,
                            textColor = TextWhite,
                            modifier = Modifier.weight(1f),
                            onClick = { onKeyClicked("C") }
                        )
                        CalcButton(
                            label = "Unlock",
                            bgColor = CalcOpBtn,
                            textColor = Color.White,
                            modifier = Modifier.weight(1.5f),
                            onClick = { checkAndUnlock(rawInputBuffer) }
                        )
                    }
                }
            }
        }

        // Floating particle burst upon correct codeword entry
        if (showHeartBurst) {
            particles.forEach { p ->
                val infiniteTransition = rememberInfiniteTransition()
                val offsetY by infiniteTransition.animateFloat(
                    initialValue = 0f,
                    targetValue = -300f,
                    animationSpec = infiniteRepeatable(
                        animation = tween(1200, easing = LinearEasing),
                        repeatMode = RepeatMode.Restart
                    )
                )

                Text(
                    text = p.text,
                    fontSize = p.size.sp,
                    modifier = Modifier
                        .offset(x = p.x.dp, y = (p.y + offsetY).dp)
                )
            }
        }
    }
}

@Composable
private fun CalcButton(
    label: String,
    bgColor: Color,
    textColor: Color,
    modifier: Modifier = Modifier,
    textSize: androidx.compose.ui.unit.TextUnit = 24.sp,
    onClick: () -> Unit
) {
    var isPressed by remember { mutableStateOf(false) }
    val scale by animateFloatAsState(
        targetValue = if (isPressed) 0.92f else 1f,
        animationSpec = spring(stiffness = 500f)
    )

    Box(
        modifier = modifier
            .aspectRatio(1.15f)
            .scale(scale)
            .clip(RoundedCornerShape(22.dp))
            .background(bgColor)
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = null
            ) {
                isPressed = true
                onClick()
            },
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = label,
            color = textColor,
            fontSize = textSize,
            fontWeight = FontWeight.SemiBold
        )
    }

    LaunchedEffect(isPressed) {
        if (isPressed) {
            delay(90)
            isPressed = false
        }
    }
}

private fun evaluateSimpleExpression(expr: String): String {
    val clean = expr.replace("×", "*").replace("÷", "/").replace("−", "-")
    // Simple integer addition / subtraction / multiplication check
    val parts = clean.split(Regex("(?<=[-+*/])|(?=[-+*/])"))
    if (parts.size >= 3) {
        val num1 = parts[0].trim().toDoubleOrNull() ?: return expr
        val op = parts[1].trim()
        val num2 = parts[2].trim().toDoubleOrNull() ?: return expr
        val res = when (op) {
            "+" -> num1 + num2
            "-" -> num1 - num2
            "*" -> num1 * num2
            "/" -> if (num2 != 0.0) num1 / num2 else return "Error"
            else -> return expr
        }
        return if (res % 1.0 == 0.0) res.toLong().toString() else "%.2f".format(res)
    }
    return expr
}
