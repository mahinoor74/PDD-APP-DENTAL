package com.toothmate.app.utils

import android.content.Context
import android.speech.tts.TextToSpeech
import java.util.Locale

class NativeSpeechCoach(context: Context) : TextToSpeech.OnInitListener {

    private var tts: TextToSpeech? = TextToSpeech(context.applicationContext, this)
    private var isInitialized = false
    private var isMuted = false

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            val result = tts?.setLanguage(Locale.US)
            if (result != TextToSpeech.LANG_MISSING_DATA && result != TextToSpeech.LANG_NOT_SUPPORTED) {
                tts?.setSpeechRate(0.95f)
                tts?.setPitch(1.0f)
                isInitialized = true
            }
        }
    }

    fun setMuted(muted: Boolean) {
        isMuted = muted
        if (muted) {
            stop()
        }
    }

    fun isMuted(): Boolean = isMuted

    fun speak(text: String) {
        if (isMuted || !isInitialized || text.isBlank()) return
        try {
            tts?.stop() // Stop ongoing speech before new prompt
            tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "ZonePromptId")
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    fun stop() {
        try {
            tts?.stop()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    fun shutdown() {
        try {
            tts?.stop()
            tts?.shutdown()
            tts = null
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
