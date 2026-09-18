package com.morrislabs.routemapper.data

import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.morrislabs.routemapper.data.models.ErrorResponse
import com.morrislabs.routemapper.data.models.RouteRequest
import com.morrislabs.routemapper.data.models.RouteResponse
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.IOException
import java.util.concurrent.TimeUnit

// Singleton: one connection pool shared by all callers (ViewModel + AutocompleteField).
object RouteApiService {
    private val client = OkHttpClient.Builder()
        .callTimeout(10, TimeUnit.SECONDS)
        .followSslRedirects(false)
        .build()
    private val gson = Gson()
    private const val BASE_URL = "https://morrislabs.app/routemapper/api"
    private val JSON = "application/json".toMediaType()

    suspend fun findRoute(request: RouteRequest): RouteResponse = withContext(Dispatchers.IO) {
        val body = gson.toJson(request).toRequestBody(JSON)
        val req = Request.Builder().url("$BASE_URL/route").post(body).build()

        client.newCall(req).execute().use { response ->
            val text = response.body?.string() ?: throw IOException("Empty response")
            if (!response.isSuccessful) {
                val err = try { gson.fromJson(text, ErrorResponse::class.java) }
                          catch (_: Exception) { ErrorResponse("error", "Request failed (${response.code})") }
                throw IOException(err.message)
            }
            val result = gson.fromJson(text, RouteResponse::class.java)
                ?: throw IOException("Invalid response format")
            if (result.legs == null) throw IOException("Invalid response: missing route data")
            if (result.legs.isEmpty()) throw IOException("Route returned no stops")
            result
        }
    }

    // POST keeps typed addresses out of the nginx access log query strings.
    suspend fun autocomplete(input: String): List<String> = withContext(Dispatchers.IO) {
        if (input.isBlank()) return@withContext emptyList()
        val body = gson.toJson(mapOf("input" to input)).toRequestBody(JSON)
        val req = Request.Builder().url("$BASE_URL/autocomplete").post(body).build()

        client.newCall(req).execute().use { response ->
            if (!response.isSuccessful) return@withContext emptyList()
            val text = response.body?.string() ?: return@withContext emptyList()
            val type = object : TypeToken<Map<String, Any>>() {}.type
            val map: Map<String, Any> = gson.fromJson(text, type)
            @Suppress("UNCHECKED_CAST")
            val predictions = map["predictions"] as? List<Map<String, Any>> ?: return@withContext emptyList()
            predictions.mapNotNull { it["description"] as? String }
        }
    }
}
