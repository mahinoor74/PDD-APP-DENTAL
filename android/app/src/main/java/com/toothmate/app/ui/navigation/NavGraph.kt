package com.toothmate.app.ui.navigation

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import com.toothmate.app.data.local.AppDatabase
import com.toothmate.app.data.local.UserPreferences
import com.toothmate.app.data.network.RetrofitClient
import com.toothmate.app.data.repository.ChatRepository
import com.toothmate.app.data.repository.DentalRepository
import com.toothmate.app.ui.components.BottomNavigationBar
import com.toothmate.app.ui.screens.AssessmentScreen
import com.toothmate.app.ui.screens.AuthScreen
import com.toothmate.app.ui.screens.ChatbotScreen
import com.toothmate.app.ui.screens.DashboardScreen
import com.toothmate.app.ui.screens.DemographicsScreen
import com.toothmate.app.ui.screens.DrMintyChatScreen
import com.toothmate.app.ui.screens.LanguageScreen
import com.toothmate.app.ui.screens.PrescriptionScreen
import com.toothmate.app.ui.screens.ProfileScreen
import com.toothmate.app.ui.screens.SmartMirrorScreen
import com.toothmate.app.ui.screens.SplashScreen
import com.toothmate.app.ui.screens.SuccessScreen
import com.toothmate.app.viewmodel.AssessmentViewModel
import com.toothmate.app.viewmodel.AuthViewModel
import com.toothmate.app.viewmodel.ChatViewModel
import com.toothmate.app.viewmodel.DashboardViewModel
import com.toothmate.app.viewmodel.MirrorViewModel

@Composable
fun ToothMateNavGraph(
    navController: NavHostController,
    isDarkTheme: Boolean = false,
    onToggleTheme: (() -> Unit)? = null
) {
    val context = LocalContext.current

    // Dependencies & Repositories
    val prefs = remember { UserPreferences(context) }
    val db = remember { AppDatabase.getDatabase(context) }
    val dentalRepository = remember { DentalRepository(db.assessmentDao(), RetrofitClient.apiService, prefs) }
    val chatRepository = remember { ChatRepository(RetrofitClient.apiService) }

    // ViewModels
    val authViewModel = remember { AuthViewModel(prefs) }
    val assessmentViewModel = remember { AssessmentViewModel(dentalRepository) }
    val chatViewModel = remember { ChatViewModel(chatRepository, prefs) }
    val mirrorViewModel = remember { MirrorViewModel(prefs) }
    val dashboardViewModel = remember { DashboardViewModel(dentalRepository, prefs) }

    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    val screenBg = if (isDarkTheme) Color(0xFF0F172A) else Color(0xFFF0FDFA)

    NavHost(
        navController = navController,
        startDestination = Screen.Splash.route,
        modifier = Modifier
            .fillMaxSize()
            .background(screenBg)
    ) {
        composable(Screen.Splash.route) {
            SplashScreen(navController = navController, isLoggedIn = prefs.isLoggedIn)
        }

        composable(Screen.Auth.route) {
            AuthScreen(navController = navController, authViewModel = authViewModel)
        }

        composable(Screen.Demographics.route) {
            DemographicsScreen(navController = navController, authViewModel = authViewModel)
        }

        composable(Screen.Assessment.route) {
            AssessmentScreen(navController = navController, assessmentViewModel = assessmentViewModel)
        }

        composable(Screen.Success.route) {
            SuccessScreen(navController = navController, assessmentViewModel = assessmentViewModel)
        }

        composable(Screen.Prescription.route) {
            PrescriptionScreen(navController = navController, assessmentViewModel = assessmentViewModel)
        }

        composable(Screen.SmartMirror.route) {
            SmartMirrorScreen(navController = navController, mirrorViewModel = mirrorViewModel)
        }

        composable("mirror") {
            SmartMirrorScreen(navController = navController, mirrorViewModel = mirrorViewModel)
        }

        composable(Screen.Chatbot.route) {
            DrMintyChatScreen(navController = navController, chatViewModel = chatViewModel, isDarkTheme = isDarkTheme)
        }

        composable("chat") {
            DrMintyChatScreen(navController = navController, chatViewModel = chatViewModel, isDarkTheme = isDarkTheme)
        }

        composable("dr_minty") {
            DrMintyChatScreen(navController = navController, chatViewModel = chatViewModel, isDarkTheme = isDarkTheme)
        }

        composable(Screen.Dashboard.route) {
            DashboardScreen(navController = navController, dashboardViewModel = dashboardViewModel)
        }

        composable("dashboard") {
            DashboardScreen(navController = navController, dashboardViewModel = dashboardViewModel)
        }

        composable(Screen.Profile.route) {
            ProfileScreen(navController = navController, authViewModel = authViewModel)
        }

        composable("profile") {
            ProfileScreen(navController = navController, authViewModel = authViewModel)
        }

        composable(Screen.Language.route) {
            LanguageScreen(navController = navController)
        }
    }
}
