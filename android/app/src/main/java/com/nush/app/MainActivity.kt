package com.nush.app

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.ViewGroup
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import com.nush.app.bridge.AndroidBridge
import com.nush.app.data.PreferencesManager
import com.nush.app.data.PushRepository
import com.nush.app.ui.components.OfflineScreen
import com.nush.app.ui.components.PermissionRationaleDialog
import com.nush.app.ui.theme.NushTheme
import com.nush.app.ui.theme.PinkPrimary
import com.nush.app.ui.webview.NushWebChromeClient
import com.nush.app.ui.webview.NushWebViewClient
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    @Inject lateinit var androidBridge: AndroidBridge
    @Inject lateinit var preferencesManager: PreferencesManager
    @Inject lateinit var pushRepository: PushRepository

    private var filePathCallback: ValueCallback<Array<Uri>>? = null

    private val fileChooserLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (filePathCallback != null) {
            val results = WebChromeClient.FileChooserParams.parseResult(result.resultCode, result.data)
            filePathCallback?.onReceiveValue(results)
            filePathCallback = null
        }
    }

    private var requestNotificationPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            androidBridge.registerPush()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        val splashScreen = installSplashScreen()
        super.onCreate(savedInstanceState)

        setContent {
            NushTheme {
                MainContent(intent = intent)
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
    }

    @Composable
    private fun MainContent(intent: Intent) {
        var isOffline by remember { mutableStateOf(false) }
        var pageProgress by remember { mutableIntStateOf(0) }
        var showPermissionRationale by remember { mutableStateOf(false) }
        var webViewInstance by remember { mutableStateOf<WebView?>(null) }

        // Ask for Notification permission on API 33+
        LaunchedEffect(Unit) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                val hasPermission = ContextCompat.checkSelfPermission(
                    this@MainActivity,
                    Manifest.permission.POST_NOTIFICATIONS
                ) == PackageManager.PERMISSION_GRANTED
                if (!hasPermission) {
                    showPermissionRationale = true
                } else {
                    androidBridge.registerPush()
                }
            } else {
                androidBridge.registerPush()
            }
        }

        if (showPermissionRationale) {
            PermissionRationaleDialog(
                onConfirm = {
                    showPermissionRationale = false
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                        requestNotificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
                    }
                },
                onDismiss = {
                    showPermissionRationale = false
                }
            )
        }

        // Predictive back: history back first, else exit app
        BackHandler(enabled = webViewInstance?.canGoBack() == true && !isOffline) {
            webViewInstance?.goBack()
        }

        Box(modifier = Modifier.fillMaxSize()) {
            if (isOffline) {
                OfflineScreen(
                    onRetry = {
                        isOffline = false
                        webViewInstance?.loadUrl(BuildConfig.NUSH_BASE_URL)
                    }
                )
            } else {
                AndroidView(
                    factory = { context ->
                        WebView(context).apply {
                            layoutParams = ViewGroup.LayoutParams(
                                ViewGroup.LayoutParams.MATCH_PARENT,
                                ViewGroup.LayoutParams.MATCH_PARENT
                            )
                            settings.apply {
                                javaScriptEnabled = true
                                domStorageEnabled = true
                                databaseEnabled = true
                                cacheMode = WebSettings.LOAD_DEFAULT
                                mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
                                safeBrowsingEnabled = true
                                mediaPlaybackRequiresUserGesture = false
                                allowFileAccess = true
                                setSupportZoom(false)
                                displayZoomControls = false
                            }

                            // Keep WebView clean without overscroll or pull to refresh
                            overScrollMode = WebView.OVER_SCROLL_NEVER

                            addJavascriptInterface(androidBridge, "AndroidBridge")

                            webViewClient = NushWebViewClient(
                                context = this@MainActivity,
                                onPageFinishedCallback = { _ ->
                                    // Handle deep links when page finishes
                                    handleDeepLink(this, intent)
                                },
                                onErrorReceived = { error ->
                                    isOffline = error
                                }
                            )

                            webChromeClient = NushWebChromeClient(
                                onProgressChangedCallback = { progress ->
                                    pageProgress = progress
                                },
                                onShowFileChooserCallback = { callback, params ->
                                    filePathCallback?.onReceiveValue(null)
                                    filePathCallback = callback
                                    val chooserIntent = params?.createIntent()
                                    try {
                                        if (chooserIntent != null) {
                                            fileChooserLauncher.launch(chooserIntent)
                                        }
                                    } catch (e: Exception) {
                                        filePathCallback = null
                                        return@NushWebChromeClient false
                                    }
                                    true
                                }
                            )

                            loadUrl(BuildConfig.NUSH_BASE_URL)
                            webViewInstance = this
                        }
                    },
                    modifier = Modifier.fillMaxSize()
                )

                if (pageProgress in 1..99) {
                    LinearProgressIndicator(
                        progress = { pageProgress / 100f },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(3.dp)
                            .align(Alignment.TopCenter),
                        color = PinkPrimary,
                    )
                }
            }
        }
    }

    private fun handleDeepLink(webView: WebView, intent: Intent?) {
        val data = intent?.data ?: return
        if (data.scheme == "nush" && data.host == "heartbeat") {
            // Scroll smoothly to presence aura on site
            webView.evaluateJavascript(
                "document.getElementById('presence-aurora')?.scrollIntoView({behavior:'smooth'});",
                null
            )
        }
    }
}
