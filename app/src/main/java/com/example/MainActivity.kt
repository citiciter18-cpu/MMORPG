package com.example

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Color
import android.os.Build
import android.os.Bundle
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.view.ViewGroup
import android.view.WindowManager
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color as ComposeColor
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat

class MainActivity : ComponentActivity() {

    private var activeWebView: WebView? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        configureImmersiveLandscape()

        setContent {
            BladeRealmScreen(
                onWebViewCreated = { webView -> activeWebView = webView },
                onExitApp = { finish() }
            )
        }
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) {
            configureImmersiveLandscape()
        }
    }

    override fun onPause() {
        super.onPause()
        activeWebView?.evaluateJavascript(
            "if (window.MMO && window.MMO.saveProgress) window.MMO.saveProgress();",
            null
        )
        activeWebView?.onPause()
    }

    override fun onResume() {
        super.onResume()
        configureImmersiveLandscape()
        activeWebView?.onResume()
    }

    override fun onDestroy() {
        activeWebView?.destroy()
        activeWebView = null
        super.onDestroy()
    }

    private fun configureImmersiveLandscape() {
        WindowCompat.setDecorFitsSystemWindows(window, false)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            window.attributes = window.attributes.apply {
                layoutInDisplayCutoutMode =
                    WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
            }
        }
        val controller = WindowInsetsControllerCompat(window, window.decorView)
        controller.hide(WindowInsetsCompat.Type.systemBars())
        controller.systemBarsBehavior =
            WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
    }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
private fun BladeRealmScreen(
    onWebViewCreated: (WebView) -> Unit,
    onExitApp: () -> Unit
) {
    var webViewRef by remember { mutableStateOf<WebView?>(null) }

    BackHandler {
        val wv = webViewRef
        if (wv != null) {
            wv.evaluateJavascript(
                "(function(){ return (window.UI && window.UI.handleBack) ? window.UI.handleBack() : false; })();"
            ) { result ->
                if (result != "true") {
                    onExitApp()
                }
            }
        } else {
            onExitApp()
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(ComposeColor(0xFF0A0F1F))
            .windowInsetsPadding(WindowInsets.safeDrawing)
            .testTag("bladerealm_root")
    ) {
        AndroidView(
            modifier = Modifier
                .fillMaxSize()
                .testTag("bladerealm_webview"),
            factory = { ctx ->
                WebView(ctx).apply {
                    layoutParams = ViewGroup.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.MATCH_PARENT
                    )
                    setBackgroundColor(Color.parseColor("#0A0F1F"))
                    settings.apply {
                        javaScriptEnabled = true
                        domStorageEnabled = true
                        databaseEnabled = true
                        allowFileAccess = true
                        @Suppress("DEPRECATION")
                        allowFileAccessFromFileURLs = true
                        @Suppress("DEPRECATION")
                        allowUniversalAccessFromFileURLs = true
                        mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                        mediaPlaybackRequiresUserGesture = false
                        useWideViewPort = true
                        loadWithOverviewMode = true
                        builtInZoomControls = false
                        displayZoomControls = false
                        setSupportZoom(false)
                    }
                    webViewClient = WebViewClient()
                    webChromeClient = WebChromeClient()
                    addJavascriptInterface(BladeRealmBridge(ctx), "AndroidBridge")
                    loadUrl("file:///android_asset/www/index.html")
                    webViewRef = this
                    onWebViewCreated(this)
                }
            }
        )
    }
}

private class BladeRealmBridge(private val context: Context) {
    private val prefs = context.getSharedPreferences("bladerealm_prefs", Context.MODE_PRIVATE)

    @JavascriptInterface
    fun saveGame(payload: String) {
        prefs.edit().putString("save_v1", payload).apply()
    }

    @JavascriptInterface
    fun loadGame(): String {
        return prefs.getString("save_v1", "") ?: ""
    }

    @JavascriptInterface
    fun clearSave() {
        prefs.edit().remove("save_v1").apply()
    }

    @JavascriptInterface
    fun vibrate(ms: Int) {
        val duration = ms.coerceIn(5, 180).toLong()
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val vm = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
                vm?.defaultVibrator?.vibrate(
                    VibrationEffect.createOneShot(duration, VibrationEffect.DEFAULT_AMPLITUDE)
                )
            } else {
                @Suppress("DEPRECATION")
                val v = context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    v?.vibrate(VibrationEffect.createOneShot(duration, VibrationEffect.DEFAULT_AMPLITUDE))
                } else {
                    @Suppress("DEPRECATION")
                    v?.vibrate(duration)
                }
            }
        } catch (_: Exception) {
            // Ignore devices without vibrator
        }
    }
}
