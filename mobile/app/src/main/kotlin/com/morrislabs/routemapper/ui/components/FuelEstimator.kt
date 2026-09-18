package com.morrislabs.routemapper.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp

@Composable
fun FuelEstimator(totalMiles: Double) {
    var mpg by remember { mutableStateOf("") }
    var pricePerGallon by remember { mutableStateOf("") }

    val mpgVal = mpg.toDoubleOrNull()
    val priceVal = pricePerGallon.toDoubleOrNull()
    val cost = if (mpgVal != null && mpgVal > 0 && priceVal != null) {
        (totalMiles / mpgVal) * priceVal
    } else null

    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("Fuel estimate", style = MaterialTheme.typography.titleSmall)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = mpg,
                    onValueChange = { mpg = it },
                    label = { Text("MPG") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                    modifier = Modifier.weight(1f),
                    singleLine = true
                )
                OutlinedTextField(
                    value = pricePerGallon,
                    onValueChange = { pricePerGallon = it },
                    label = { Text("\$/gal") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                    modifier = Modifier.weight(1f),
                    singleLine = true
                )
            }
            if (cost != null) {
                Text(
                    "Estimated cost: \$${"%.2f".format(cost)}",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.primary
                )
            }
        }
    }
}
