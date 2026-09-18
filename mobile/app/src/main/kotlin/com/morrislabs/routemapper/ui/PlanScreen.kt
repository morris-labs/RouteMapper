package com.morrislabs.routemapper.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.morrislabs.routemapper.ui.components.*
import com.morrislabs.routemapper.util.encodeShareUrl
import com.morrislabs.routemapper.viewmodel.RouteViewModel

@Composable
fun PlanScreen(viewModel: RouteViewModel, onNavigateToMap: () -> Unit) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val addresses = state.addresses
    val lastIdx = addresses.size - 1

    val startAddr = addresses.firstOrNull()?.trim() ?: ""
    val endAddr = addresses.lastOrNull()?.trim() ?: ""
    val middleAddrs = addresses.drop(1).dropLast(1).map { it.trim() }.filter { it.isNotEmpty() }
    val hasRoute = startAddr.isNotEmpty() && if (state.options.roundTrip) {
        middleAddrs.isNotEmpty()
    } else {
        endAddr.isNotEmpty() || middleAddrs.isNotEmpty()
    }

    var copied by remember { mutableStateOf(false) }
    val clipboard = LocalClipboardManager.current

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

        itemsIndexed(addresses) { i, addr ->
            AddressCard(
                index = i,
                address = addr,
                isStart = i == 0,
                isEnd = i == lastIdx,
                roundTrip = state.options.roundTrip,
                startAddress = addresses.firstOrNull() ?: "",
                onAddressChange = { viewModel.updateAddress(i, it) },
                onRemove = { viewModel.removeStop(i) }
            )
        }

        item {
            OutlinedButton(
                onClick = { viewModel.addStop() },
                enabled = addresses.size < 25,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("+ Add stop (${addresses.size - 2}/${25 - 2})")
            }
        }

        item {
            OptionsPanel(options = state.options, onOptionsChange = { viewModel.updateOptions(it) })
        }

        item {
            Button(
                onClick = {
                    viewModel.findRoute()
                    if (hasRoute) onNavigateToMap()
                },
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
                OutlinedButton(
                    onClick = {
                        clipboard.setText(AnnotatedString(encodeShareUrl(addresses, state.options)))
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
