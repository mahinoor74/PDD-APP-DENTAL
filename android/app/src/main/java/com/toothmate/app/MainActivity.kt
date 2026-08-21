package com.toothmate.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.navigation.compose.rememberNavController
import com.toothmate.app.ui.navigation.ToothMateNavGraph
import com.toothmate.app.ui.theme.ToothMateTheme

import androidx.activity.enableEdgeToEdge

import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.platform.LocalContext
import com.toothmate.app.data.local.UserPreferences
import com.toothmate.app.viewmodel.AuthViewModel

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            val context = LocalContext.current
            val prefs = remember { UserPreferences(context) }
            val authViewModel = remember { AuthViewModel(prefs) }
            val isDarkMode by authViewModel.isDarkMode.collectAsState()

            ToothMateTheme(darkTheme = isDarkMode) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val navController = rememberNavController()
                    ToothMateNavGraph(navController = navController)
                }
            }
        }
    }
}
