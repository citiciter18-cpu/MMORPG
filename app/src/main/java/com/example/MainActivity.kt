package com.example

import android.os.Build
import android.os.Bundle
import android.view.WindowManager
import android.webkit.WebView
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.getValue
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.data.ArenaScreen
import com.example.data.GameMode
import com.example.ui.ArenaViewModel
import com.example.ui.GameWebViewScreen
import com.example.ui.LobbyScreen
import com.example.ui.theme.VortexArenaTheme

class MainActivity : ComponentActivity() {

    private var activeWebView: WebView? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        configureImmersiveLandscape()

        setContent {
            VortexArenaTheme {
                val vm: ArenaViewModel = viewModel()
                val uiState by vm.uiState.collectAsStateWithLifecycle()

                when (uiState.screen) {
                    ArenaScreen.LOBBY -> {
                        LobbyScreen(
                            state = uiState,
                            onNameChange = vm::updatePlayerName,
                            onRoomChange = vm::updateRoomCode,
                            onSelectAccent = vm::selectAccent,
                            onSelectWeapon = vm::selectWeapon,
                            onSelectMap = vm::selectMap,
                            onLaunchMultiplayer = { vm.launchMatch(GameMode.MULTIPLAYER) },
                            onLaunchTraining = { vm.launchMatch(GameMode.TRAINING) },
                            onOpenSetup = { vm.setShowSetupDialog(true) },
                            onCloseSetup = { vm.setShowSetupDialog(false) },
                            onOpenLeaderboard = vm::openLeaderboard,
                            onCloseLeaderboard = vm::closeLeaderboard,
                            onRefreshLeaderboard = vm::refreshLeaderboard,
                            onOpenSettings = { vm.setShowSettingsDialog(true) },
                            onCloseSettings = { vm.setShowSettingsDialog(false) },
                            onUpdateSettings = vm::updateSettings
                        )
                    }

                    ArenaScreen.IN_MATCH -> {
                        GameWebViewScreen(
                            matchNonce = uiState.matchNonce,
                            matchConfigJson = vm.buildMatchConfigJson(),
                            onWebViewReady = { webView -> activeWebView = webView },
                            onExitToLobby = vm::returnToLobby
                        )
                    }
                }
            }
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
