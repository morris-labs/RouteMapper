package com.morrislabs.routemapper.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.morrislabs.routemapper.ui.components.*
import com.morrislabs.routemapper.util.MAPS_NAV_MAX_STOPS
import com.morrislabs.routemapper.util.encodeShareUrl
import com.morrislabs.routemapper.viewmodel.RouteViewModel
import kotlinx.coroutines.delay

@Composable
fun PlanScreen(viewModel: RouteViewModel, onNavigateToMap: () -> Unit) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val addresses = state.addresses
    val lastIdx = addresses.size - 1

    val startAddr = addresses.firstOrNull()?.trim() ?: ""
    val endAddr = addresses.lastOrNull()?.trim() ?: ""
    val middleAddrs = addresses.drop(1).dropLast(1).map { it.trim() }.filter { it.isNotEmpty() }
    val middleAddresses = addresses.drop(1).dropLast(1)
    val middleIds = state.addressIds.drop(1).dropLast(1)

    val hasRoute = startAddr.isNotEmpty() && if (state.options.roundTrip) {
        middleAddrs.isNotEmpty()
    } else {
        endAddr.isNotEmpty() || middleAddrs.isNotEmpty()
    }

    val shareAddresses = when {
        state.options.roundTrip -> listOf(startAddr) + middleAddrs
        endAddr.isNotEmpty() -> listOf(startAddr) + middleAddrs + endAddr
        else -> listOf(startAddr) + middleAddrs
    }

    var copied by remember { mutableStateOf(false) }
    val clipboard = LocalClipboardManager.current

    LaunchedEffect(copied) {
        if (copied) {
            delay(1500)
            copied = false
        }
    }

    // Navigate only when a new route version hasn't been consumed yet. Storing the consumed
    // version in the ViewModel prevents this effect from re-firing when the user returns
    // to PlanScreen from the Map tab.
    LaunchedEffect(state.routeVersion, state.navigatedForVersion) {
        if (state.routeVersion > 0 && state.routeVersion != state.navigatedForVersion) {
            viewModel.consumeNavigation()
            onNavigateToMap()
        }
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        item {
            Text("RouteMapper", style = MaterialTheme.typography.headlineSmall)
            Text(
                "Enter 2-25 stops to find the most efficient route.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(Modifier.height(4.dp))
        }

        // Origin — always first
        item(key = state.addressIds.firstOrNull() ?: 0L) {
            AddressCard(
                index = 0,
                address = addresses.firstOrNull() ?: "",
                isStart = true,
                isEnd = false,
                roundTrip = false,
                startAddress = "",
                onAddressChange = { viewModel.updateAddress(0, it) },
                onRemove = {}
            )
        }

        // Destination — always second; locked to origin when round trip is on
        item(key = state.addressIds.lastOrNull() ?: 1L) {
            AddressCard(
                index = lastIdx,
                address = addresses.lastOrNull() ?: "",
                isStart = false,
                isEnd = true,
                roundTrip = state.options.roundTrip,
                startAddress = startAddr,
                onAddressChange = { viewModel.updateAddress(lastIdx, it) },
                onRemove = {}
            )
        }

        // Other stops section header
        item {
            Row(
                modifier = Modifier.fillMaxWidth().padding(top = 4.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    "Other stops",
                    style = MaterialTheme.typography.labelLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Text(
                    "${middleAddresses.size} of 23",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        // Intermediate stops — keyed by stable slot ID so autocomplete state
        // doesn't bleed to the wrong card after a stop is removed.
        itemsIndexed(
            items = middleAddresses,
            key = { i, _ -> middleIds.getOrElse(i) { i.toLong() } }
        ) { i, addr ->
            AddressCard(
                index = i + 1,
                address = addr,
                isStart = false,
                isEnd = false,
                roundTrip = false,
                startAddress = "",
                onAddressChange = { viewModel.updateAddress(i + 1, it) },
                onRemove = { viewModel.removeStop(i + 1) }
            )
        }

        item {
            OutlinedButton(
                onClick = { viewModel.addStop() },
                enabled = addresses.size < 25,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("+ Add stop")
            }
        }

        item {
            OptionsPanel(options = state.options, onOptionsChange = { viewModel.updateOptions(it) })
        }

        item {
            Button(
                onClick = { viewModel.findRoute() },
                enabled = hasRoute && !state.loading,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(if (state.loading) "Finding route…" else "Find route")
            }
        }

        if (state.error != null) {
            item {
                Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.errorContainer)) {
                    Text(
                        text = state.error!!,
                        modifier = Modifier.padding(12.dp),
                        color = MaterialTheme.colorScheme.onErrorContainer
                    )
                }
            }
        }

        state.route?.let { route ->
            item { ResultsPanel(route = route) }

            item {
                val linkStops = route.orderedStops.take(MAPS_NAV_MAX_STOPS)
                OutlinedButton(
                    onClick = {
                        clipboard.setText(AnnotatedString(encodeShareUrl(linkStops, state.options)))
                        copied = true
                    },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(if (copied) "Link copied" else "Copy share link")
                }
            }

            item { FuelEstimator(totalMiles = route.totalDistanceMiles) }
            item { DirectionsAccordion(route = route) }
        }
    }
}
