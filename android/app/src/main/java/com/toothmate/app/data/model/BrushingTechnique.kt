package com.toothmate.app.data.model

data class ZoneScriptItem(
    val zoneIndex: Int,
    val startTimeSeconds: Int,
    val title: String,
    val quadrantId: String,
    val quadrantName: String,
    val script: String,
    val clinicalTip: String
)

data class BrushingTechnique(
    val id: String,
    val name: String,
    val category: String,
    val targetAudience: String,
    val description: String,
    val angleDegrees: Float,
    val motionType: String,
    val prepScript: String,
    val zoneScripts: List<ZoneScriptItem>,
    val finishScript: String,
    val icon: String = ""
)

object ClinicalTechniquesRepository {
    val TECHNIQUES = listOf(
        BrushingTechnique(
            id = "modified_bass",
            name = "Modified Bass Technique (45°)",
            category = "Adults & Periodontal Care",
            targetAudience = "Adults & Periodontal Care",
            description = "Gold-standard sulcular technique for thorough plaque removal at the gumline.",
            angleDegrees = 45f,
            motionType = "vibrate_sweep",
            icon = "",
            prepScript = "Get your toothbrush ready with a little toothpaste and hold it gently.",
            zoneScripts = listOf(
                ZoneScriptItem(0, 0, "Upper Right Outer", "UR", "Upper Right Outer", "Place your brush on the upper right teeth, tilted slightly toward your gums. Jiggle it gently back and forth, then sweep down.", "Soft pressure avoids recession."),
                ZoneScriptItem(1, 20, "Upper Front Outer", "UF", "Upper Front Outer", "Move to your top front teeth. Keep the brush tilted at your gumline. Small gentle vibrations, then roll down.", "Keep bristles flexed in sulcus."),
                ZoneScriptItem(2, 40, "Upper Left Outer", "UL", "Upper Left Outer", "Switch to your upper left teeth. Soft little pulses right at the gums, then brush downward.", "Clean last molar face."),
                ZoneScriptItem(3, 60, "Lower Left Outer", "LL", "Lower Left Outer", "Move to your lower left teeth. Tilt the bristles down toward your gums, jiggle gently, and flick upward.", "Sweep upward away from gums."),
                ZoneScriptItem(4, 80, "Lower Front & Inside", "LF", "Lower Front & Inside", "Clean behind your lower front teeth. Turn the brush straight up and sweep from your gums to the top of your teeth.", "Vertical heel strokes reach lingual tartar."),
                ZoneScriptItem(5, 100, "Chewing Surfaces", "OC", "Chewing Surfaces", "Scrub the flat biting tops of your back teeth back and forth.", "Focus on occlusal molar pits.")
            ),
            finishScript = "All done! Spit out the paste, rinse your mouth with water, and wash your toothbrush clean."
        ),
        BrushingTechnique(
            id = "modified_stillman",
            name = "Modified Stillman Technique (45°)",
            category = "Receding Gums & Sensitive Teeth",
            targetAudience = "Receding Gums & Sensitive Teeth",
            description = "Gentle pulsing tissue-massage routine engineered for sensitive teeth and exposed roots.",
            angleDegrees = 45f,
            motionType = "blanch_roll",
            icon = "",
            prepScript = "Take your soft brush, add sensitive toothpaste, and get ready for gentle gum care.",
            zoneScripts = listOf(
                ZoneScriptItem(0, 0, "Upper Right Teeth", "UR", "Upper Right Teeth", "Rest the bristles softly half on your gums and half on your upper right teeth. Press gently, then roll down the tooth.", "Blanch tissue lightly, then roll."),
                ZoneScriptItem(1, 20, "Upper Front Teeth", "UF", "Upper Front Teeth", "Move to your top front teeth. Pulse gently against the gums without pressing hard, then roll down smoothly.", "Avoid sawing horizontal strokes."),
                ZoneScriptItem(2, 40, "Upper Left Teeth", "UL", "Upper Left Teeth", "Switch to your top left teeth. Soft, calming pulses at the gums, then roll down to the edge.", "Pulsing motion stimulates blood flow."),
                ZoneScriptItem(3, 60, "Lower Left Teeth", "LL", "Lower Left Teeth", "Move to your bottom left teeth. Rest bristles on the lower gums, pulse lightly, and roll upward.", "Roll upward smoothly."),
                ZoneScriptItem(4, 80, "Lower Front Teeth", "LF", "Lower Front Teeth", "Clean your bottom front teeth with soft upward rolls from the gums to the top.", "Light pressure protects enamel."),
                ZoneScriptItem(5, 100, "Chewing Tops", "OC", "Chewing Tops", "Gently brush the biting tops of your back teeth back and forth.", "Short light strokes protect enamel.")
            ),
            finishScript = "Brushing complete! Spit out the paste, rinse gently with water, and wash your brush."
        ),
        BrushingTechnique(
            id = "orthodontic_charters",
            name = "Orthodontic Charters Technique (-45°)",
            category = "Braces, Wires & Implants",
            targetAudience = "Braces, Wires & Implants",
            description = "Specialized angled technique designed to navigate around orthodontic brackets and archwires.",
            angleDegrees = -45f,
            motionType = "reverse_angle_vibrate",
            icon = "",
            prepScript = "Get your braces toothbrush and toothpaste ready.",
            zoneScripts = listOf(
                ZoneScriptItem(0, 0, "Upper Right Braces", "UR", "Upper Right Braces", "Point bristles downward over your top right braces. Wiggle gently under the wire and brackets to remove trapped food.", "Angle downward under top brackets."),
                ZoneScriptItem(1, 20, "Upper Front Braces", "UF", "Upper Front Braces", "Move to your top front braces. Keep bristles pointed down into the brackets and pulse softly.", "Clean around bracket wings."),
                ZoneScriptItem(2, 40, "Upper Left Braces", "UL", "Upper Left Braces", "Clean your top left braces. Work the bristles carefully around every bracket.", "Work bristles under main wire."),
                ZoneScriptItem(3, 60, "Lower Left Braces", "LL", "Lower Left Braces", "Move to your bottom left braces. Turn the brush upward under the wire and brackets, pulsing gently.", "Reverse angle 45° upward."),
                ZoneScriptItem(4, 80, "Lower Front Braces", "LF", "Lower Front Braces", "Clean your bottom front braces with bristles pointing up underneath the wire.", "Pulse around lower bracket faces."),
                ZoneScriptItem(5, 100, "Chewing Surfaces", "OC", "Chewing Surfaces", "Scrub the flat chewing tops of your back teeth back and forth.", "Clean terminal molar bands.")
            ),
            finishScript = "Great job! Spit out the paste, rinse well with water, and check your clean braces in the mirror."
        ),
        BrushingTechnique(
            id = "magic_circular_fones",
            name = "Magic Circular Fones Method (90°)",
            category = "Kids & Beginners",
            targetAudience = "Kids & Beginners",
            description = "Fun circular scrubbing routine tailored for pediatric motor skill development.",
            angleDegrees = 90f,
            motionType = "wide_circles",
            icon = "",
            prepScript = "Grab your brush, put a little drop of toothpaste on top, and get ready!",
            zoneScripts = listOf(
                ZoneScriptItem(0, 0, "Right Side Circles", "UR", "Right Side Circles", "Close your teeth like a big smile! Make big, happy circles over your right teeth.", "Keep teeth closed in occlusion."),
                ZoneScriptItem(1, 20, "Front Circles", "UF", "Front Circles", "Keep smiling and make big round circles right over your front teeth.", "Cover both arches together."),
                ZoneScriptItem(2, 40, "Left Side Circles", "UL", "Left Side Circles", "Move over to your left teeth! Round and round in big smooth circles.", "Sweep away plaque with big circles."),
                ZoneScriptItem(3, 60, "Bottom Chewing", "LL", "Bottom Chewing", "Open wide! Scrub the biting tops of your bottom teeth back and forth.", "Open wide for bottom molars."),
                ZoneScriptItem(4, 80, "Top Chewing & Inside", "LF", "Top Chewing & Inside", "Keep open wide! Brush the tops and inside of your upper teeth.", "Use choo-choo train strokes."),
                ZoneScriptItem(5, 100, "Tongue Clean", "OC", "Tongue Clean", "Stick out your tongue and give it three gentle tickles to stay super fresh!", "Three light forward tongue passes.")
            ),
            finishScript = "You did it, superstar! Spit your toothpaste into the sink, rinse your mouth, and wash your brush!"
        ),
        BrushingTechnique(
            id = "smith_bell_sulcular",
            name = "Smith-Bell Sulcular Method (45°)",
            category = "Crowns, Bridges & Implants",
            targetAudience = "Crowns, Bridges & Implants",
            description = "Prosthetic-safe precision technique protecting ceramic margins and implant abutments.",
            angleDegrees = 45f,
            motionType = "margin_sweep",
            icon = "",
            prepScript = "Take your soft brush and non-abrasive paste.",
            zoneScripts = listOf(
                ZoneScriptItem(0, 0, "Upper Right Crowns", "UR", "Upper Right Crowns", "Place bristles where your crown meets the gum. Sweep gently downward without hard pressing.", "Protect porcelain margins."),
                ZoneScriptItem(1, 20, "Upper Front Crowns", "UF", "Upper Front Crowns", "Clean around your top front crowns with light, gentle downward sweeps.", "Clean gingival collars."),
                ZoneScriptItem(2, 40, "Upper Left Crowns", "UL", "Upper Left Crowns", "Sweep softly along your top left crown edges and under bridge areas.", "Glide under bridge pontics."),
                ZoneScriptItem(3, 60, "Lower Left Crowns", "LL", "Lower Left Crowns", "Move to your lower left crowns and sweep smoothly upward from the gumline.", "Sweep away from peri-implant tissue."),
                ZoneScriptItem(4, 80, "Lower Front Lingual", "LF", "Lower Front Lingual", "Clean inside your bottom front teeth with light upward sweeps.", "Vertical sweep around posts."),
                ZoneScriptItem(5, 100, "Chewing Tops", "OC", "Chewing Tops", "Scrub the biting surfaces flat back and forth.", "Scrub occlusal tables gently.")
            ),
            finishScript = "Done! Spit, rinse thoroughly with water, and store your brush upright."
        ),
        BrushingTechnique(
            id = "roll_sweep",
            name = "Roll / Sweep Technique (45°)",
            category = "Standard Daily Maintenance",
            targetAudience = "Standard Daily Maintenance",
            description = "Efficient daily maintenance method sweeping bristles in a smooth continuous arc from gums to crowns.",
            angleDegrees = 45f,
            motionType = "gum_to_crown_roll",
            icon = "",
            prepScript = "Take your toothbrush and get ready for a full-mouth rolling clean.",
            zoneScripts = listOf(
                ZoneScriptItem(0, 0, "Upper Right Arch", "UR", "Upper Right Arch", "Place the brush flat on your upper right gums and roll downward over the teeth.", "Start on gum and roll down."),
                ZoneScriptItem(1, 20, "Upper Front Arch", "UF", "Upper Front Arch", "Roll the bristles down smoothly over your top front teeth.", "Repeat 5-6 downward rolls."),
                ZoneScriptItem(2, 40, "Upper Left Arch", "UL", "Upper Left Arch", "Roll downward from your top left gums over the tooth surfaces.", "Cover outer buccal faces."),
                ZoneScriptItem(3, 60, "Lower Left Arch", "LL", "Lower Left Arch", "Place bristles on your bottom left gums and roll upward toward the chewing edge.", "Roll upward from lower gums."),
                ZoneScriptItem(4, 80, "Lower Front Arch", "LF", "Lower Front Arch", "Roll upward from the bottom front gums to the tips of your teeth.", "Roll upward along front enamel."),
                ZoneScriptItem(5, 100, "Chewing Tops", "OC", "Chewing Tops", "Scrub the biting tops of your back teeth back and forth.", "Scrub molar biting tops flat.")
            ),
            finishScript = "All done! Spit, rinse your mouth with water, and clean your brush."
        ),
        BrushingTechnique(
            id = "tongue_cleaning",
            name = "Specialized Tongue Cleaning Routine",
            category = "Oral Hygiene & Breath Freshness",
            targetAudience = "Halitosis Prevention & Tongue Care",
            description = "Clinical tongue debridement protocol removing oral bacterial coating.",
            angleDegrees = 0f,
            motionType = "tongue_scrape",
            icon = "",
            prepScript = "Rinse your tongue cleaner or soft toothbrush with water.",
            zoneScripts = listOf(
                ZoneScriptItem(0, 0, "Back Base", "TP1", "Back Base", "Stick your tongue out. Place the cleaner gently at the back of your tongue.", "Extend tongue fully."),
                ZoneScriptItem(1, 20, "Back Position", "TP2", "Back Position", "Keep cleaner position at the back base, prepare to pull forward.", "Maintain firm contact."),
                ZoneScriptItem(2, 40, "Middle Base", "TM1", "Middle Base", "Pull the cleaner smoothly forward to the front.", "Pull forward in one smooth stroke."),
                ZoneScriptItem(3, 60, "Middle Glide", "TM2", "Middle Glide", "Continue pulling the cleaner smoothly forward across the mid-section.", "Remove biofilm with forward stroke."),
                ZoneScriptItem(4, 80, "Sides & Tip", "TS1", "Sides & Tip", "Clean the sides and tip in forward strokes. Rinse the cleaner after each pass.", "Rinse scraper between passes."),
                ZoneScriptItem(5, 100, "Tip Finish", "TS2", "Tip Finish", "Perform final gentle forward passes along the tip of the tongue.", "Clean lateral borders for freshness.")
            ),
            finishScript = "Rinse your mouth with clean water and wash your scraper."
        ),
        BrushingTechnique(
            id = "interdental_flossing",
            name = "Specialized Interdental Flossing Routine",
            category = "Interdental & Periodontal Care",
            targetAudience = "Interdental Plaque & Biofilm Removal",
            description = "C-shape interdental flossing protocol reaching subgingival spaces.",
            angleDegrees = 0f,
            motionType = "c_shape_floss",
            icon = "",
            prepScript = "Take a piece of dental floss and hold it tight between your fingers.",
            zoneScripts = listOf(
                ZoneScriptItem(0, 0, "Upper Teeth Interdental", "UR", "Upper Teeth Interdental", "Slide the floss gently between your top teeth. Curve it like a 'C' around the side and wipe up and down.", "Wrap floss snugly in C-shape."),
                ZoneScriptItem(1, 20, "Upper Front Interdental", "UF", "Upper Front Interdental", "Slide the floss gently between top front teeth, curve in C-shape and wipe.", "Wipe vertically up and down."),
                ZoneScriptItem(2, 40, "Upper Left Interdental", "UL", "Upper Left Interdental", "Move across upper left interdental spaces with gentle C-shape movements.", "Unroll clean segment per space."),
                ZoneScriptItem(3, 60, "Lower Left Interdental", "LL", "Lower Left Interdental", "Move to your bottom teeth. Wrap the floss around each tooth side and wipe gently.", "Curve around molar contours."),
                ZoneScriptItem(4, 80, "Lower Front Interdental", "LF", "Lower Front Interdental", "Clean lower front interdental spaces with C-shape wiping movements.", "Take care around tight contacts."),
                ZoneScriptItem(5, 100, "Lower Right Interdental", "LR", "Lower Right Interdental", "Finish lower right interdental spaces, wiping dislodged plaque clean.", "Clean both proximal sides of contact.")
            ),
            finishScript = "Throw away the floss, rinse your mouth with water, and enjoy your clean smile."
        )
    )

    fun getById(id: String): BrushingTechnique {
        return TECHNIQUES.find { it.id == id } ?: TECHNIQUES[0]
    }
}
