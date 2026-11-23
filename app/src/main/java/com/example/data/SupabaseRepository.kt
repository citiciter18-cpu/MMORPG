package com.example.data

import com.example.BuildConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import java.net.HttpURLConnection
import java.net.URL

class SupabaseRepository {

    val supabaseUrl: String
        get() = BuildConfig.SUPABASE_URL.trim().trimEnd('/')

    val supabaseAnonKey: String
        get() = BuildConfig.SUPABASE_ANON_KEY.trim()

    fun isConfigured(): Boolean {
        val url = supabaseUrl
        val key = supabaseAnonKey
        if (url.isEmpty() || key.isEmpty()) return false
        if (url.contains("PLACEHOLDER", ignoreCase = true)) return false
        if (key.contains("PLACEHOLDER", ignoreCase = true)) return false
        return url.startsWith("https://") || url.startsWith("http://")
    }

    suspend fun fetchLeaderboard(): Result<List<LeaderboardEntry>> = withContext(Dispatchers.IO) {
        if (!isConfigured()) {
            return@withContext Result.failure(IllegalStateException("Supabase not configured"))
        }
        var conn: HttpURLConnection? = null
        try {
            val endpoint = URL("$supabaseUrl/rest/v1/arena_leaderboard?select=player_name,kills,deaths,last_room&order=kills.desc&limit=20")
            conn = (endpoint.openConnection() as HttpURLConnection).apply {
                requestMethod = "GET"
                connectTimeout = 7000
                readTimeout = 7000
                setRequestProperty("apikey", supabaseAnonKey)
                setRequestProperty("Authorization", "Bearer $supabaseAnonKey")
                setRequestProperty("Accept", "application/json")
            }
            val code = conn.responseCode
            if (code !in 200..299) {
                return@withContext Result.failure(
                    IllegalStateException("HTTP $code — проверьте таблицу arena_leaderboard в Supabase")
                )
            }
            val body = conn.inputStream.bufferedReader().use { it.readText() }
            val arr = JSONArray(body)
            val entries = buildList {
                for (i in 0 until arr.length()) {
                    val obj = arr.getJSONObject(i)
                    add(
                        LeaderboardEntry(
                            playerName = obj.optString("player_name", "PLAYER"),
                            kills = obj.optInt("kills", 0),
                            deaths = obj.optInt("deaths", 0),
                            lastRoom = obj.optString("last_room", "ARENA-01")
                        )
                    )
                }
            }
            Result.success(entries)
        } catch (e: Exception) {
            Result.failure(e)
        } finally {
            conn?.disconnect()
        }
    }
}
