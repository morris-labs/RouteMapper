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
import java.net.URLEncoder

class RouteApiService {
    private val client = OkHttpClient()
    private val gson = Gson()
    private val baseUrl = "https://morrislabs.app/api"
    private val json = "application/json".toMediaType()

    suspend fun findRoute(request: RouteRequest): RouteResponse = withContext(Dispatchers.IO) {
        val body = gson.toJson(request).toRequestBody(json)
        val req = Request.Builder()
            .url("$baseUrl/route")
            .post(body)
            .build()

        client.newCall(req).execute().use { response ->
            val responseBody = response.body?.string() ?: throw IOException("Empty response")
            if (!response.isSuccessful) {
                val error = try {
                    gson.fromJson(responseBody, ErrorResponse::class.java)
                } catch (_: Exception) {
                    ErrorResponse("error", "Request failed (${response.code})")
                }
                throw IOException(error.message)
            }
            gson.fromJson(responseBody, RouteResponse::class.java)
        }
    }

    suspend fun autocomplete(input: String): List<String> = withContext(Dispatchers.IO) {
        if (input.isBlank()) return@withContext emptyList()
        val encoded = URLEncoder.encode(input, "UTF-8")
        val req = Request.Builder().url("$baseUrl/autocomplete?input=$encoded").build()

        client.newCall(req).execute().use { response ->
            if (!response.isSuccessful) return@withContext emptyList()
            val body = response.body?.string() ?: return@withContext emptyList()
            val type = object : TypeToken<Map<String, Any>>() {}.type
            val map: Map<String, Any> = gson.fromJson(body, type)
            @Suppress("UNCHECKED_CAST")
            val predictions = map["predictions"] as? List<Map<String, Any>> ?: return@withContext emptyList()
            predictions.mapNotNull { it["description"] as? String }
        }
    }
}
