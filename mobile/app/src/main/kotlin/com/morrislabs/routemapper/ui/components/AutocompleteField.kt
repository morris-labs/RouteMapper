package com.morrislabs.routemapper.ui.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.morrislabs.routemapper.data.RouteApiService
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

private val sharedApi = RouteApiService()

@Composable
fun AutocompleteField(
    value: String,
    onValueChange: (String) -> Unit,
    placeholder: String
) {
    var suggestions by remember { mutableStateOf(listOf<String>()) }
    var showSuggestions by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()
    var debounceJob by remember { mutableStateOf<Job?>(null) }

    Column {
        OutlinedTextField(
            value = value,
            onValueChange = { v ->
                onValueChange(v)
                showSuggestions = v.isNotBlank()
                debounceJob?.cancel()
                if (v.length >= 2) {
                    debounceJob = scope.launch {
                        delay(300)
                        suggestions = try { sharedApi.autocomplete(v) } catch (_: Exception) { emptyList() }
                    }
                } else {
                    suggestions = emptyList()
                }
            },
            placeholder = { Text(placeholder) },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )

        if (showSuggestions && suggestions.isNotEmpty()) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                elevation = CardDefaults.cardElevation(defaultElevation = 6.dp)
            ) {
                LazyColumn(modifier = Modifier.heightIn(max = 200.dp)) {
                    items(suggestions) { suggestion ->
                        Text(
                            text = suggestion,
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable {
                                    onValueChange(suggestion)
                                    suggestions = emptyList()
                                    showSuggestions = false
                                }
                                .padding(horizontal = 16.dp, vertical = 12.dp),
                            style = MaterialTheme.typography.bodyMedium
                        )
                        HorizontalDivider()
                    }
                }
            }
        }
    }
}
