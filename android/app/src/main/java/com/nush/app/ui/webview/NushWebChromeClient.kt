package com.nush.app.ui.webview

import android.net.Uri
import android.webkit.PermissionRequest
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebView

class NushWebChromeClient(
    private val onProgressChangedCallback: (progress: Int) -> Unit,
    private val onShowFileChooserCallback: (
        filePathCallback: ValueCallback<Array<Uri>>?,
        fileChooserParams: FileChooserParams?
    ) -> Boolean
) : WebChromeClient() {

    override fun onProgressChanged(view: WebView?, newProgress: Int) {
        super.onProgressChanged(view, newProgress)
        onProgressChangedCallback(newProgress)
    }

    override fun onPermissionRequest(request: PermissionRequest?) {
        // Grant permissions for audio capture / microphone for voice recorder on our origin
        val resources = request?.resources ?: return
        if (resources.contains(PermissionRequest.RESOURCE_AUDIO_CAPTURE)) {
            request.grant(arrayOf(PermissionRequest.RESOURCE_AUDIO_CAPTURE))
        } else {
            request.deny()
        }
    }

    override fun onShowFileChooser(
        webView: WebView?,
        filePathCallback: ValueCallback<Array<Uri>>?,
        fileChooserParams: FileChooserParams?
    ): Boolean {
        return onShowFileChooserCallback(filePathCallback, fileChooserParams)
    }
}
