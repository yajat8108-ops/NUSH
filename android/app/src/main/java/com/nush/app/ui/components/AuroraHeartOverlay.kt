package com.nush.app.ui.components

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.EaseInOutCubic
import androidx.compose.animation.core.EaseOutBack
import androidx.compose.animation.core.EaseOutQuart
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import kotlin.math.cos
import kotlin.math.sin
import kotlin.random.Random

private val Pink     = Color(0xFFFF5C8E)
private val PinkMid  = Color(0xFFFF94B8)
private val Purple   = Color(0xFFB06EE0)
private val Gold     = Color(0xFFFFD700)

// ─── Floating heart data ──────────────────────────────────────────────────────
private data class FloatingHeart(
    val id: Int,
    val startX: Float,   // dp offset from centre
    val startY: Float,
    val size: Float,
    val emoji: String,
    val durationMs: Int,
    val delayMs: Int,
    val angle: Float     // radians — drift direction
)

@Composable
fun AuroraHeartOverlay(
    isActive: Boolean,
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier
) {
    if (!isActive) return

    // Overall fade-in / fade-out controller
    val alpha      = remember { Animatable(0f) }
    val heartScale = remember { Animatable(0f) }

    // Floating hearts spawned once
    val floatingHearts = remember {
        val emojis = listOf("💖", "🩷", "✨", "🌸", "💌", "🌙", "💫", "🧸", "🎀")
        List(24) { i ->
            FloatingHeart(
                id          = i,
                startX      = (Random.nextFloat() - 0.5f) * 320f,
                startY      = Random.nextFloat() * 600f + 100f,
                size        = Random.nextFloat() * 26f + 16f,
                emoji       = emojis[i % emojis.size],
                durationMs  = Random.nextInt(1400, 2800),
                delayMs     = Random.nextInt(0, 800),
                angle       = (Random.nextFloat() - 0.5f) * 0.5f  // slight horizontal drift
            )
        }
    }

    LaunchedEffect(isActive) {
        // Fade in
        alpha.animateTo(1f, tween(350, easing = EaseInOutCubic))
        // Pop the heart in
        heartScale.animateTo(1.35f, tween(500, easing = EaseOutBack))
        heartScale.animateTo(1.0f, tween(300, easing = EaseInOutCubic))
        // Hold
        delay(2800)
        // Fade everything out
        alpha.animateTo(0f, tween(600, easing = EaseOutQuart))
        onDismiss()
    }

    // ── Staggered ring alpha transitions (3 rings with phase offset) ───────────
    val ring1 = rememberInfiniteTransition(label = "ring1")
    val ring1Scale by ring1.animateFloat(
        initialValue = 0.6f, targetValue = 2.8f,
        animationSpec = infiniteRepeatable(
            animation = tween(1400, easing = EaseOutQuart),
            repeatMode = RepeatMode.Restart
        ), label = "r1s"
    )
    val ring1Alpha by ring1.animateFloat(
        initialValue = 0.7f, targetValue = 0f,
        animationSpec = infiniteRepeatable(
            animation = tween(1400, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ), label = "r1a"
    )

    val ring2 = rememberInfiniteTransition(label = "ring2")
    val ring2Scale by ring2.animateFloat(
        initialValue = 0.6f, targetValue = 2.8f,
        animationSpec = infiniteRepeatable(
            animation = tween(1400, delayMillis = 460, easing = EaseOutQuart),
            repeatMode = RepeatMode.Restart
        ), label = "r2s"
    )
    val ring2Alpha by ring2.animateFloat(
        initialValue = 0.7f, targetValue = 0f,
        animationSpec = infiniteRepeatable(
            animation = tween(1400, delayMillis = 460, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ), label = "r2a"
    )

    val ring3 = rememberInfiniteTransition(label = "ring3")
    val ring3Scale by ring3.animateFloat(
        initialValue = 0.6f, targetValue = 2.8f,
        animationSpec = infiniteRepeatable(
            animation = tween(1400, delayMillis = 920, easing = EaseOutQuart),
            repeatMode = RepeatMode.Restart
        ), label = "r3s"
    )
    val ring3Alpha by ring3.animateFloat(
        initialValue = 0.7f, targetValue = 0f,
        animationSpec = infiniteRepeatable(
            animation = tween(1400, delayMillis = 920, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ), label = "r3a"
    )

    // Rotation of the outer shimmer ring
    val spinInf = rememberInfiniteTransition(label = "spin")
    val spinAngle by spinInf.animateFloat(
        initialValue = 0f, targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(4000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ), label = "spin"
    )

    // Heartbeat pulse on the emoji itself
    val beatInf = rememberInfiniteTransition(label = "beat")
    val beatScale by beatInf.animateFloat(
        initialValue = 1f, targetValue = 1.18f,
        animationSpec = infiniteRepeatable(
            animation = tween(600, easing = EaseInOutCubic),
            repeatMode = RepeatMode.Reverse
        ), label = "beat"
    )

    Box(
        modifier = modifier
            .fillMaxSize()
            .graphicsLayer { this.alpha = alpha.value }
            .background(
                Brush.radialGradient(
                    colors = listOf(
                        Pink.copy(alpha = 0.22f),
                        Purple.copy(alpha = 0.16f),
                        Color.Black.copy(alpha = 0.55f)
                    )
                )
            )
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = null
            ) { onDismiss() },
        contentAlignment = Alignment.Center
    ) {

        // ── Drawn rings ─────────────────────────────────────────────────
        Canvas(modifier = Modifier.fillMaxSize()) {
            val cx = size.width / 2f
            val cy = size.height / 2f
            val baseR = 90.dp.toPx()

            // Ring 1 — pink
            drawCircle(
                color  = Pink.copy(alpha = ring1Alpha * alpha.value),
                radius = baseR * ring1Scale,
                center = Offset(cx, cy),
                style  = androidx.compose.ui.graphics.drawscope.Stroke(width = 3.dp.toPx())
            )
            // Ring 2 — purple
            drawCircle(
                color  = Purple.copy(alpha = ring2Alpha * alpha.value * 0.8f),
                radius = baseR * ring2Scale,
                center = Offset(cx, cy),
                style  = androidx.compose.ui.graphics.drawscope.Stroke(width = 2.dp.toPx())
            )
            // Ring 3 — pink mid
            drawCircle(
                color  = PinkMid.copy(alpha = ring3Alpha * alpha.value * 0.6f),
                radius = baseR * ring3Scale,
                center = Offset(cx, cy),
                style  = androidx.compose.ui.graphics.drawscope.Stroke(width = 1.5f.dp.toPx())
            )

            // Spinning arc / shimmer
            val arcR = baseR * 1.1f
            for (i in 0 until 8) {
                val angle = Math.toRadians((spinAngle + i * 45f).toDouble())
                val ax = cx + arcR * cos(angle).toFloat()
                val ay = cy + arcR * sin(angle).toFloat()
                drawCircle(
                    color  = Gold.copy(alpha = 0.45f * alpha.value),
                    radius = 4.dp.toPx(),
                    center = Offset(ax, ay)
                )
            }
        }

        // ── Floating hearts ──────────────────────────────────────────────
        floatingHearts.forEach { h ->
            val inf = rememberInfiniteTransition(label = "fh${h.id}")
            val prog by inf.animateFloat(
                initialValue = 0f, targetValue = 1f,
                animationSpec = infiniteRepeatable(
                    animation = tween(h.durationMs, delayMillis = h.delayMs, easing = EaseOutQuart),
                    repeatMode = RepeatMode.Restart
                ), label = "fhp${h.id}"
            )
            val riseY = h.startY - prog * 420f
            val driftX = h.startX + sin(prog * Math.PI.toFloat()) * 30f
            val fadeA = when {
                prog < 0.12f -> prog / 0.12f
                prog > 0.75f -> (1f - prog) / 0.25f
                else -> 1f
            } * alpha.value

            Text(
                text     = h.emoji,
                fontSize = h.size.sp,
                modifier = Modifier
                    .offset(x = (190f + driftX).dp, y = riseY.dp)
                    .graphicsLayer { this.alpha = fadeA }
            )
        }

        // ── Central pulsing heart emoji ──────────────────────────────────
        Text(
            text     = "💖",
            fontSize = 96.sp,
            modifier = Modifier.graphicsLayer {
                scaleX = heartScale.value * beatScale
                scaleY = heartScale.value * beatScale
            }
        )

        // ── "yearning for you" label ─────────────────────────────────────
        Text(
            text     = "yearning for you 🩷",
            fontSize = 18.sp,
            color    = Color.White.copy(alpha = 0.85f * alpha.value),
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .offset(y = (-80).dp)
                .graphicsLayer {
                    translationY = (1f - alpha.value) * 30f
                }
        )
    }
}
