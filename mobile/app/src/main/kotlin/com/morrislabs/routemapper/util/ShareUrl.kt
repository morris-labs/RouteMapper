package com.morrislabs.routemapper.util

import com.morrislabs.routemapper.viewmodel.RouteOptions
import java.net.URLEncoder

fun encodeShareUrl(addresses: List<String>, options: RouteOptions): String {
    val base = "https://morrislabs.app/routemapper/"
    val params = mutableListOf<String>()

    addresses.map { it.trim() }.filter { it.isNotEmpty() }.forEach { addr ->
        params.add("a=${URLEncoder.encode(addr, "UTF-8")}")
    }
    if (options.travelMode != "driving") params.add("mode=${URLEncoder.encode(options.travelMode, "UTF-8")}")
    if (options.roundTrip) params.add("round=1")
    options.avoid.forEach { params.add("avoid=${URLEncoder.encode(it, "UTF-8")}") }

    return if (params.isEmpty()) base else "$base?${params.joinToString("&")}"
}
