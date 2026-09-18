package com.morrislabs.routemapper.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.morrislabs.routemapper.data.RouteApiService
import com.morrislabs.routemapper.data.models.RouteRequest
import com.morrislabs.routemapper.data.models.RouteResponse
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class RouteOptions(
    val travelMode: String = "driving",
    val roundTrip: Boolean = false,
    val avoid: List<String> = emptyList()
)

data class RouteUiState(
    val addresses: List<String> = listOf("", ""),
    // Stable per-slot IDs so LazyColumn keys don't shift on removal.
    val addressIds: List<Long> = listOf(0L, 1L),
    val nextAddressId: Long = 2L,
    val options: RouteOptions = RouteOptions(),
    val route: RouteResponse? = null,
    // Increments on each successful route; lets PlanScreen navigate exactly once per result.
    val routeVersion: Int = 0,
    val loading: Boolean = false,
    val error: String? = null
)

class RouteViewModel : ViewModel() {
    private val _state = MutableStateFlow(RouteUiState())
    val state: StateFlow<RouteUiState> = _state.asStateFlow()

    fun updateAddress(index: Int, value: String) {
        val updated = _state.value.addresses.toMutableList()
        if (index < updated.size) updated[index] = value
        _state.value = _state.value.copy(addresses = updated)
    }

    fun addStop() {
        val s = _state.value
        if (s.addresses.size >= 25) return
        val insertAt = s.addresses.size - 1
        val newAddresses = s.addresses.toMutableList().apply { add(insertAt, "") }
        val newIds = s.addressIds.toMutableList().apply { add(insertAt, s.nextAddressId) }
        _state.value = s.copy(
            addresses = newAddresses,
            addressIds = newIds,
            nextAddressId = s.nextAddressId + 1
        )
    }

    fun removeStop(index: Int) {
        val s = _state.value
        if (index == 0 || index == s.addresses.size - 1) return
        _state.value = s.copy(
            addresses = s.addresses.filterIndexed { i, _ -> i != index },
            addressIds = s.addressIds.filterIndexed { i, _ -> i != index }
        )
    }

    fun updateOptions(options: RouteOptions) {
        _state.value = _state.value.copy(options = options)
    }

    fun findRoute() {
        val s = _state.value
        val startAddr = s.addresses.firstOrNull()?.trim() ?: return
        val endAddr = s.addresses.lastOrNull()?.trim() ?: ""
        val middleAddrs = s.addresses.drop(1).dropLast(1).map { it.trim() }.filter { it.isNotEmpty() }

        val apiAddresses = when {
            s.options.roundTrip -> listOf(startAddr) + middleAddrs
            endAddr.isNotEmpty() -> listOf(startAddr) + middleAddrs + endAddr
            else -> listOf(startAddr) + middleAddrs
        }
        if (apiAddresses.size < 2) return

        viewModelScope.launch {
            _state.value = _state.value.copy(loading = true, error = null)
            try {
                val result = RouteApiService.findRoute(
                    RouteRequest(
                        addresses = apiAddresses,
                        roundTrip = s.options.roundTrip,
                        travelMode = s.options.travelMode,
                        avoid = s.options.avoid
                    )
                )
                _state.value = _state.value.copy(
                    loading = false,
                    route = result,
                    routeVersion = _state.value.routeVersion + 1
                )
            } catch (e: Exception) {
                _state.value = _state.value.copy(
                    loading = false,
                    error = e.message ?: "Unknown error",
                    route = null
                )
            }
        }
    }
}
