package com.nush.app.ui.webview

import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.browser.customtabs.CustomTabColorSchemeParams
import androidx.browser.customtabs.CustomTabsIntent
import androidx.core.graphics.toColorInt
import com.nush.app.BuildConfig

class NushWebViewClient(
    private val context: Context,
    private val onPageFinishedCallback: (url: String?) -> Unit,
    private val onErrorReceived: (isError: Boolean) -> Unit
) : WebViewClient() {

    override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
        val url = request?.url?.toString() ?: return false
        val baseUrl = BuildConfig.NUSH_BASE_URL

        // Keep internal origin within WebView
        if (url.startsWith(baseUrl) || url.startsWith("about:blank")) {
            return false
        }

        // Deep links or custom app schemes
        if (url.startsWith("nush://")) {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
            context.startActivity(intent)
            return true
        }

        // WhatsApp / tel / mailto schemes
        if (url.startsWith("whatsapp://") || url.startsWith("https://api.whatsapp.com") || url.startsWith("https://wa.me") || url.startsWith("tel:") || url.startsWith("mailto:")) {
            try {
                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                context.startActivity(intent)
                return true
            } catch (e: Exception) {
                // fall through to custom tab or browser
            }
        }

        // External URLs open in Chrome Custom Tabs
        try {
            val customTabsIntent = CustomTabsIntent.Builder()
                .setDefaultColorSchemeParams(
                    CustomTabColorSchemeParams.Builder()
                        .setToolbarColor("#FF5C8E".toColorInt())
                        .build()
                )
                .setShowTitle(true)
                .build()
            customTabsIntent.intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            customTabsIntent.launchUrl(context, Uri.parse(url))
        } catch (e: Exception) {
            val browserIntent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
            browserIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(browserIntent)
        }
        return true
    }

    override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
        super.onPageStarted(view, url, favicon)
    }

    override fun onPageFinished(view: WebView?, url: String?) {
        super.onPageFinished(view, url)
        onPageFinishedCallback(url)
    }

    override fun onReceivedError(
        view: WebView?,
        request: WebResourceRequest?,
        error: WebResourceError?
    ) {
        super.onReceivedError(view, request, error)
        // Only trigger native offline screen if the main frame failed to load
        if (request?.isForMainFrame == true) {
            view?.loadUrl("about:blank")
            onErrorReceived(true)
        }
    }
}
