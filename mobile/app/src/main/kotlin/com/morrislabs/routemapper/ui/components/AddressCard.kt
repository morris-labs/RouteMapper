package com.morrislabs.routemapper.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun AddressCard(
    index: Int,
    address: String,
    isStart: Boolean,
    isEnd: Boolean,
    roundTrip: Boolean,
    startAddress: String,
    onAddressChange: (String) -> Unit,
    onRemove: () -> Unit
) {
    val badgeColor = when {
        isStart -> Color(0xFF16A34A)
        isEnd -> Color(0xFFF97316)
        else -> Color(0xFF2563EB)
    }
    val badgeLabel = when {
        isStart -> "S"
        isEnd -> "E"
        else -> index.toString()
    }

    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.Top,
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Box(
            modifier = Modifier
                .padding(top = 16.dp)
                .size(24.dp)
                .background(badgeColor, CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Text(badgeLabel, color = Color.White, fontSize = 10.sp, fontWeight = FontWeight.Bold)
        }

        Box(modifier = Modifier.weight(1f)) {
            if (isEnd && roundTrip) {
                OutlinedTextField(
                    value = startAddress.ifEmpty { "Returns to start" },
                    onValueChange = {},
                    enabled = false,
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
            } else {
                AutocompleteField(
                    value = address,
                    onValueChange = onAddressChange,
                    placeholder = when {
                        isStart -> "Starting address"
                        isEnd -> "Ending address (optional)"
                        else -> "Stop ${index + 1}"
                    }
                )
            }
        }

        IconButton(
            onClick = onRemove,
            enabled = !isStart && !isEnd,
            modifier = Modifier.padding(top = 4.dp)
        ) {
            if (!isStart && !isEnd) {
                Icon(
                    Icons.Default.Close,
                    contentDescription = "Remove stop",
                    tint = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}
