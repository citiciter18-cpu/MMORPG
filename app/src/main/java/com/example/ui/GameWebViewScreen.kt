package com.example.ui

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Color
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.util.Log
import android.view.View
import android.view.ViewGroup
import android.webkit.ConsoleMessage
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.key
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.viewinterop.AndroidView
import com.example.ui.theme.ObsidianVoid

private const val LOCAL_HOST = "vortexarena.app"
private const val START_URL = "https://$LOCAL_HOST/index.html"

private class ArenaJsBridge(
    private val context: Context,
    private val matchConfigJson: String,
    private val onExitToLobby: () -> Unit
) {
    private val mainHandler = Handler(Looper.getMainLooper())

    @JavascriptInterface
    fun isAndroid(): Boolean = true

    @JavascriptInterface
    fun getMatchConfig(): String = matchConfigJson

    @JavascriptInterface
    fun exitToLobby() {
        mainHandler.post { onExitToLobby() }
    }

    @JavascriptInterface
    fun vibrate(durationMs: Long) {
        val safeMs = durationMs.coerceIn(5L, 90L)
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val manager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
                manager?.defaultVibrator?.vibrate(
                    VibrationEffect.createOneShot(safeMs, VibrationEffect.DEFAULT_AMPLITUDE)
                )
            } else {
                @Suppress("DEPRECATION")
                val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    vibrator?.vibrate(
                        VibrationEffect.createOneShot(safeMs, VibrationEffect.DEFAULT_AMPLITUDE)
                    )
                } else {
                    @Suppress("DEPRECATION")
                    vibrator?.vibrate(safeMs)
                }
            }
        } catch (_: Exception) {
            // Ignore devices without vibrator hardware
        }
    }
}

private class ArenaAssetsWebViewClient(private val context: Context) : WebViewClient() {
    private fun mimeFor(path: String): String = when {
        path.endsWith(".html", ignoreCase = true) -> "text/html"
        path.endsWith(".css", ignoreCase = true) -> "text/css"
        path.endsWith(".js", ignoreCase = true) -> "application/javascript"
        path.endsWith(".json", ignoreCase = true) -> "application/json"
        path.endsWith(".png", ignoreCase = true) -> "image/png"
        path.endsWith(".jpg", ignoreCase = true) || path.endsWith(".jpeg", ignoreCase = true) -> "image/jpeg"
        path.endsWith(".svg", ignoreCase = true) -> "image/svg+xml"
        else -> "application/octet-stream"
    }

    override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
        val host = request?.url?.host
        return host != LOCAL_HOST
    }

    override fun shouldInterceptRequest(
        view: WebView?,
        request: WebResourceRequest?
    ): WebResourceResponse? {
        val uri = request?.url ?: return null
        if (uri.host != LOCAL_HOST) return super.shouldInterceptRequest(view, request)

        val cleanPath = (uri.path ?: "/index.html").trimStart('/').ifEmpty { "index.html" }
        return try {
            val stream = context.assets.open("www/$cleanPath")
            WebResourceResponse(
                mimeFor(cleanPath),
                "UTF-8",
                200,
                "OK",
                mapOf(
                    "Access-Control-Allow-Origin" to "*",
                    "Cache-Control" to "no-cache"
                ),
                stream
            )
        } catch (e: Exception) {
            Log.e("VortexWebView", "Missing asset: www/$cleanPath", e)
            null
        }
    }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun GameWebViewScreen(
    matchNonce: Int,
    matchConfigJson: String,
    onWebViewReady: (WebView?) -> Unit,
    onExitToLobby: () -> Unit
) {
    val context = LocalContext.current
    val webViewRef = remember(matchNonce) { arrayOfNulls<WebView>(1) }

    BackHandler {
        val wv = webViewRef[0]
        if (wv != null) {
            wv.evaluateJavascript(
                "(function(){ return (window.GameAPI && window.GameAPI.handleBack) ? window.GameAPI.handleBack() : false; })()"
            ) { result ->
                if (result == "false" || result == "null") {
                    onExitToLobby()
                }
            }
        } else {
            onExitToLobby()
        }
    }

    DisposableEffect(matchNonce) {
        onDispose {
            webViewRef[0]?.let { wv ->
                wv.evaluateJavascript("if (window.GameAPI && window.GameAPI.shutdown) window.GameAPI.shutdown();", null)
                wv.removeJavascriptInterface("AndroidBridge")
                wv.destroy()
            }
            webViewRef[0] = null
            onWebViewReady(null)
        }
    }

    key(matchNonce) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(ObsidianVoid)
        ) {
            AndroidView(
                modifier = Modifier
                    .fillMaxSize()
                    .testTag("arena_3d_webview"),
                factory = { ctx ->
                    val bridge = ArenaJsBridge(ctx.applicationContext, matchConfigJson, onExitToLobby)
                    WebView(ctx).apply {
                        layoutParams = ViewGroup.LayoutParams(
                            ViewGroup.LayoutParams.MATCH_PARENT,
                            ViewGroup.LayoutParams.MATCH_PARENT
                        )
                        setBackgroundColor(Color.parseColor("#070B12"))
                        isFocusable = true
                        isFocusableInTouchMode = true
                        isHorizontalScrollBarEnabled = false
                        isVerticalScrollBarEnabled = false
                        overScrollMode = View.OVER_SCROLL_NEVER

                        settings.apply {
                            javaScriptEnabled = true
                            domStorageEnabled = true
                            databaseEnabled = true
                            useWideViewPort = true
                            loadWithOverviewMode = false
                            textZoom = 100
                            builtInZoomControls = false
                            displayZoomControls = false
                            setSupportZoom(false)
                            mediaPlaybackRequiresUserGesture = false
                            cacheMode = WebSettings.LOAD_NO_CACHE
                        }

                        addJavascriptInterface(bridge, "AndroidBridge")
                        webViewClient = ArenaAssetsWebViewClient(ctx.applicationContext)
                        webChromeClient = object : WebChromeClient() {
                            override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
                                if (consoleMessage != null) {
                                    Log.d(
                                        "VortexWebView",
                                        "${consoleMessage.message()} (${consoleMessage.sourceId()}:${consoleMessage.lineNumber()})"
                                    )
                                }
                                return true
                            }
                        }

                        requestFocus()
                        loadUrl(START_URL)
                        webViewRef[0] = this
                        onWebViewReady(this)
                    }
                }
            )
        }
    }
}
