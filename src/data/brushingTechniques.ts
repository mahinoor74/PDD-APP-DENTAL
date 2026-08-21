export type MotionType =
  | 'vibrate_sweep'
  | 'blanch_roll'
  | 'reverse_angle_vibrate'
  | 'wide_circles'
  | 'margin_sweep'
  | 'gum_to_crown_roll'
  | 'tongue_scrape'
  | 'c_shape_floss';

export interface ZoneScriptItem {
  zoneIndex: number;
  startTimeSeconds: number;
  title: string;
  quadrantId: string;
  quadrantName: string;
  script: string;
  clinicalTip: string;
}

export interface BrushingTechnique {
  id: string;
  name: string;
  category: string;
  targetAudience: string;
  description: string;
  angleDegrees: number;
  motionType: MotionType;
  prepScript: string;
  zoneScripts: ZoneScriptItem[];
  finishScript: string;
  icon?: string;
}

export const CLINICAL_TECHNIQUES: BrushingTechnique[] = [
  {
    id: 'modified_bass',
    name: 'Modified Bass Technique (45°)',
    category: 'Adults & Periodontal Care',
    targetAudience: 'Adults & Periodontal Care',
    description: 'Gold-standard sulcular technique for thorough plaque removal at the gumline.',
    angleDegrees: 45,
    motionType: 'vibrate_sweep',
    prepScript: 'Get your toothbrush ready with a little toothpaste and hold it gently.',
    zoneScripts: [
      { zoneIndex: 0, startTimeSeconds: 0, title: 'Upper Right Outer', quadrantId: 'UR', quadrantName: 'Upper Right Outer', script: 'Place your brush on the upper right teeth, tilted slightly toward your gums. Jiggle it gently back and forth, then sweep down.', clinicalTip: 'Soft pressure avoids recession.' },
      { zoneIndex: 1, startTimeSeconds: 20, title: 'Upper Front Outer', quadrantId: 'UF', quadrantName: 'Upper Front Outer', script: 'Move to your top front teeth. Keep the brush tilted at your gumline. Small gentle vibrations, then roll down.', clinicalTip: 'Keep bristles flexed in sulcus.' },
      { zoneIndex: 2, startTimeSeconds: 40, title: 'Upper Left Outer', quadrantId: 'UL', quadrantName: 'Upper Left Outer', script: 'Switch to your upper left teeth. Soft little pulses right at the gums, then brush downward.', clinicalTip: 'Clean last molar face.' },
      { zoneIndex: 3, startTimeSeconds: 60, title: 'Lower Left Outer', quadrantId: 'LL', quadrantName: 'Lower Left Outer', script: 'Move to your lower left teeth. Tilt the bristles down toward your gums, jiggle gently, and flick upward.', clinicalTip: 'Sweep upward away from gums.' },
      { zoneIndex: 4, startTimeSeconds: 80, title: 'Lower Front & Inside', quadrantId: 'LF', quadrantName: 'Lower Front & Inside', script: 'Clean behind your lower front teeth. Turn the brush straight up and sweep from your gums to the top of your teeth.', clinicalTip: 'Vertical heel strokes reach lingual tartar.' },
      { zoneIndex: 5, startTimeSeconds: 100, title: 'Chewing Surfaces', quadrantId: 'OC', quadrantName: 'Chewing Surfaces', script: 'Scrub the flat biting tops of your back teeth back and forth.', clinicalTip: 'Focus on occlusal molar pits.' }
    ],
    finishScript: 'All done! Spit out the paste, rinse your mouth with water, and wash your toothbrush clean.'
  },
  {
    id: 'modified_stillman',
    name: 'Modified Stillman Technique (45°)',
    category: 'Receding Gums & Sensitive Teeth',
    targetAudience: 'Receding Gums & Sensitive Teeth',
    description: 'Gentle pulsing tissue-massage routine engineered for sensitive teeth and exposed roots.',
    angleDegrees: 45,
    motionType: 'blanch_roll',
    prepScript: 'Take your soft brush, add sensitive toothpaste, and get ready for gentle gum care.',
    zoneScripts: [
      { zoneIndex: 0, startTimeSeconds: 0, title: 'Upper Right Teeth', quadrantId: 'UR', quadrantName: 'Upper Right Teeth', script: 'Rest the bristles softly half on your gums and half on your upper right teeth. Press gently, then roll down the tooth.', clinicalTip: 'Blanch tissue lightly, then roll.' },
      { zoneIndex: 1, startTimeSeconds: 20, title: 'Upper Front Teeth', quadrantId: 'UF', quadrantName: 'Upper Front Teeth', script: 'Move to your top front teeth. Pulse gently against the gums without pressing hard, then roll down smoothly.', clinicalTip: 'Avoid sawing horizontal strokes.' },
      { zoneIndex: 2, startTimeSeconds: 40, title: 'Upper Left Teeth', quadrantId: 'UL', quadrantName: 'Upper Left Teeth', script: 'Switch to your top left teeth. Soft, calming pulses at the gums, then roll down to the edge.', clinicalTip: 'Pulsing motion stimulates blood flow.' },
      { zoneIndex: 3, startTimeSeconds: 60, title: 'Lower Left Teeth', quadrantId: 'LL', quadrantName: 'Lower Left Teeth', script: 'Move to your bottom left teeth. Rest bristles on the lower gums, pulse lightly, and roll upward.', clinicalTip: 'Roll upward smoothly.' },
      { zoneIndex: 4, startTimeSeconds: 80, title: 'Lower Front Teeth', quadrantId: 'LF', quadrantName: 'Lower Front Teeth', script: 'Clean your bottom front teeth with soft upward rolls from the gums to the top.', clinicalTip: 'Light pressure protects enamel.' },
      { zoneIndex: 5, startTimeSeconds: 100, title: 'Chewing Tops', quadrantId: 'OC', quadrantName: 'Chewing Tops', script: 'Gently brush the biting tops of your back teeth back and forth.', clinicalTip: 'Short light strokes protect enamel.' }
    ],
    finishScript: 'Brushing complete! Spit out the paste, rinse gently with water, and wash your brush.'
  },
  {
    id: 'orthodontic_charters',
    name: 'Orthodontic Charters Technique (-45°)',
    category: 'Braces, Wires & Implants',
    targetAudience: 'Braces, Wires & Implants',
    description: 'Specialized angled technique designed to navigate around orthodontic brackets and archwires.',
    angleDegrees: -45,
    motionType: 'reverse_angle_vibrate',
    prepScript: 'Get your braces toothbrush and toothpaste ready.',
    zoneScripts: [
      { zoneIndex: 0, startTimeSeconds: 0, title: 'Upper Right Braces', quadrantId: 'UR', quadrantName: 'Upper Right Braces', script: 'Point bristles downward over your top right braces. Wiggle gently under the wire and brackets to remove trapped food.', clinicalTip: 'Angle downward under top brackets.' },
      { zoneIndex: 1, startTimeSeconds: 20, title: 'Upper Front Braces', quadrantId: 'UF', quadrantName: 'Upper Front Braces', script: 'Move to your top front braces. Keep bristles pointed down into the brackets and pulse softly.', clinicalTip: 'Clean around bracket wings.' },
      { zoneIndex: 2, startTimeSeconds: 40, title: 'Upper Left Braces', quadrantId: 'UL', quadrantName: 'Upper Left Braces', script: 'Clean your top left braces. Work the bristles carefully around every bracket.', clinicalTip: 'Work bristles under main wire.' },
      { zoneIndex: 3, startTimeSeconds: 60, title: 'Lower Left Braces', quadrantId: 'LL', quadrantName: 'Lower Left Braces', script: 'Move to your bottom left braces. Turn the brush upward under the wire and brackets, pulsing gently.', clinicalTip: 'Reverse angle 45° upward.' },
      { zoneIndex: 4, startTimeSeconds: 80, title: 'Lower Front Braces', quadrantId: 'LF', quadrantName: 'Lower Front Braces', script: 'Clean your bottom front braces with bristles pointing up underneath the wire.', clinicalTip: 'Pulse around lower bracket faces.' },
      { zoneIndex: 5, startTimeSeconds: 100, title: 'Chewing Surfaces', quadrantId: 'OC', quadrantName: 'Chewing Surfaces', script: 'Scrub the flat chewing tops of your back teeth back and forth.', clinicalTip: 'Clean terminal molar bands.' }
    ],
    finishScript: 'Great job! Spit out the paste, rinse well with water, and check your clean braces in the mirror.'
  },
  {
    id: 'magic_circular_fones',
    name: 'Magic Circular Fones Method (90°)',
    category: 'Kids & Beginners',
    targetAudience: 'Kids & Beginners',
    description: 'Fun circular scrubbing routine tailored for pediatric motor skill development.',
    angleDegrees: 90,
    motionType: 'wide_circles',
    prepScript: 'Grab your brush, put a little drop of toothpaste on top, and get ready!',
    zoneScripts: [
      { zoneIndex: 0, startTimeSeconds: 0, title: 'Right Side Circles', quadrantId: 'UR', quadrantName: 'Right Side Circles', script: 'Close your teeth like a big smile! Make big, happy circles over your right teeth.', clinicalTip: 'Keep teeth closed in occlusion.' },
      { zoneIndex: 1, startTimeSeconds: 20, title: 'Front Circles', quadrantId: 'UF', quadrantName: 'Front Circles', script: 'Keep smiling and make big round circles right over your front teeth.', clinicalTip: 'Cover both arches together.' },
      { zoneIndex: 2, startTimeSeconds: 40, title: 'Left Side Circles', quadrantId: 'UL', quadrantName: 'Left Side Circles', script: 'Move over to your left teeth! Round and round in big smooth circles.', clinicalTip: 'Sweep away plaque with big circles.' },
      { zoneIndex: 3, startTimeSeconds: 60, title: 'Bottom Chewing', quadrantId: 'LL', quadrantName: 'Bottom Chewing', script: 'Open wide! Scrub the biting tops of your bottom teeth back and forth.', clinicalTip: 'Open wide for bottom molars.' },
      { zoneIndex: 4, startTimeSeconds: 80, title: 'Top Chewing & Inside', quadrantId: 'LF', quadrantName: 'Top Chewing & Inside', script: 'Keep open wide! Brush the tops and inside of your upper teeth.', clinicalTip: 'Use choo-choo train strokes.' },
      { zoneIndex: 5, startTimeSeconds: 100, title: 'Tongue Clean', quadrantId: 'OC', quadrantName: 'Tongue Clean', script: 'Stick out your tongue and give it three gentle tickles to stay super fresh!', clinicalTip: 'Three light forward tongue passes.' }
    ],
    finishScript: 'You did it, superstar! Spit your toothpaste into the sink, rinse your mouth, and wash your brush!'
  },
  {
    id: 'smith_bell_sulcular',
    name: 'Smith-Bell Sulcular Method (45°)',
    category: 'Crowns, Bridges & Implants',
    targetAudience: 'Crowns, Bridges & Implants',
    description: 'Prosthetic-safe precision technique protecting ceramic margins and implant abutments.',
    angleDegrees: 45,
    motionType: 'margin_sweep',
    prepScript: 'Take your soft brush and non-abrasive paste.',
    zoneScripts: [
      { zoneIndex: 0, startTimeSeconds: 0, title: 'Upper Right Crowns', quadrantId: 'UR', quadrantName: 'Upper Right Crowns', script: 'Place bristles where your crown meets the gum. Sweep gently downward without hard pressing.', clinicalTip: 'Protect porcelain margins.' },
      { zoneIndex: 1, startTimeSeconds: 20, title: 'Upper Front Crowns', quadrantId: 'UF', quadrantName: 'Upper Front Crowns', script: 'Clean around your top front crowns with light, gentle downward sweeps.', clinicalTip: 'Clean gingival collars.' },
      { zoneIndex: 2, startTimeSeconds: 40, title: 'Upper Left Crowns', quadrantId: 'UL', quadrantName: 'Upper Left Crowns', script: 'Sweep softly along your top left crown edges and under bridge areas.', clinicalTip: 'Glide under bridge pontics.' },
      { zoneIndex: 3, startTimeSeconds: 60, title: 'Lower Left Crowns', quadrantId: 'LL', quadrantName: 'Lower Left Crowns', script: 'Move to your lower left crowns and sweep smoothly upward from the gumline.', clinicalTip: 'Sweep away from peri-implant tissue.' },
      { zoneIndex: 4, startTimeSeconds: 80, title: 'Lower Front Lingual', quadrantId: 'LF', quadrantName: 'Lower Front Lingual', script: 'Clean inside your bottom front teeth with light upward sweeps.', clinicalTip: 'Vertical sweep around posts.' },
      { zoneIndex: 5, startTimeSeconds: 100, title: 'Chewing Tops', quadrantId: 'OC', quadrantName: 'Chewing Tops', script: 'Scrub the biting surfaces flat back and forth.', clinicalTip: 'Scrub occlusal tables gently.' }
    ],
    finishScript: 'Done! Spit, rinse thoroughly with water, and store your brush upright.'
  },
  {
    id: 'roll_sweep',
    name: 'Roll / Sweep Technique (45°)',
    category: 'Standard Daily Maintenance',
    targetAudience: 'Standard Daily Maintenance',
    description: 'Efficient daily maintenance method sweeping bristles in a smooth continuous arc from gums to crowns.',
    angleDegrees: 45,
    motionType: 'gum_to_crown_roll',
    prepScript: 'Take your toothbrush and get ready for a full-mouth rolling clean.',
    zoneScripts: [
      { zoneIndex: 0, startTimeSeconds: 0, title: 'Upper Right Arch', quadrantId: 'UR', quadrantName: 'Upper Right Arch', script: 'Place the brush flat on your upper right gums and roll downward over the teeth.', clinicalTip: 'Start on gum and roll down.' },
      { zoneIndex: 1, startTimeSeconds: 20, title: 'Upper Front Arch', quadrantId: 'UF', quadrantName: 'Upper Front Arch', script: 'Roll the bristles down smoothly over your top front teeth.', clinicalTip: 'Repeat 5-6 downward rolls.' },
      { zoneIndex: 2, startTimeSeconds: 40, title: 'Upper Left Arch', quadrantId: 'UL', quadrantName: 'Upper Left Arch', script: 'Roll downward from your top left gums over the tooth surfaces.', clinicalTip: 'Cover outer buccal faces.' },
      { zoneIndex: 3, startTimeSeconds: 60, title: 'Lower Left Arch', quadrantId: 'LL', quadrantName: 'Lower Left Arch', script: 'Place bristles on your bottom left gums and roll upward toward the chewing edge.', clinicalTip: 'Roll upward from lower gums.' },
      { zoneIndex: 4, startTimeSeconds: 80, title: 'Lower Front Arch', quadrantId: 'LF', quadrantName: 'Lower Front Arch', script: 'Roll upward from the bottom front gums to the tips of your teeth.', clinicalTip: 'Roll upward along front enamel.' },
      { zoneIndex: 5, startTimeSeconds: 100, title: 'Chewing Tops', quadrantId: 'OC', quadrantName: 'Chewing Tops', script: 'Scrub the biting tops of your back teeth back and forth.', clinicalTip: 'Scrub molar biting tops flat.' }
    ],
    finishScript: 'All done! Spit, rinse your mouth with water, and clean your brush.'
  },
  {
    id: 'tongue_cleaning',
    name: 'Specialized Tongue Cleaning Routine',
    category: 'Oral Hygiene & Breath Freshness',
    targetAudience: 'Halitosis Prevention & Tongue Care',
    description: 'Clinical tongue debridement protocol removing oral bacterial coating.',
    angleDegrees: 0,
    motionType: 'tongue_scrape',
    prepScript: 'Rinse your tongue cleaner or soft toothbrush with water.',
    zoneScripts: [
      { zoneIndex: 0, startTimeSeconds: 0, title: 'Back Base', quadrantId: 'TP1', quadrantName: 'Back Base', script: 'Stick your tongue out. Place the cleaner gently at the back of your tongue.', clinicalTip: 'Extend tongue fully.' },
      { zoneIndex: 1, startTimeSeconds: 20, title: 'Back Position', quadrantId: 'TP2', quadrantName: 'Back Position', script: 'Keep cleaner position at the back base, prepare to pull forward.', clinicalTip: 'Maintain firm contact.' },
      { zoneIndex: 2, startTimeSeconds: 40, title: 'Middle Base', quadrantId: 'TM1', quadrantName: 'Middle Base', script: 'Pull the cleaner smoothly forward to the front.', clinicalTip: 'Pull forward in one smooth stroke.' },
      { zoneIndex: 3, startTimeSeconds: 60, title: 'Middle Glide', quadrantId: 'TM2', quadrantName: 'Middle Glide', script: 'Continue pulling the cleaner smoothly forward across the mid-section.', clinicalTip: 'Remove biofilm with forward stroke.' },
      { zoneIndex: 4, startTimeSeconds: 80, title: 'Sides & Tip', quadrantId: 'TS1', quadrantName: 'Sides & Tip', script: 'Clean the sides and tip in forward strokes. Rinse the cleaner after each pass.', clinicalTip: 'Rinse scraper between passes.' },
      { zoneIndex: 5, startTimeSeconds: 100, title: 'Tip Finish', quadrantId: 'TS2', quadrantName: 'Tip Finish', script: 'Perform final gentle forward passes along the tip of the tongue.', clinicalTip: 'Clean lateral borders for freshness.' }
    ],
    finishScript: 'Rinse your mouth with clean water and wash your scraper.'
  },
  {
    id: 'interdental_flossing',
    name: 'Specialized Interdental Flossing Routine',
    category: 'Interdental & Periodontal Care',
    targetAudience: 'Interdental Plaque & Biofilm Removal',
    description: 'C-shape interdental flossing protocol reaching subgingival spaces.',
    angleDegrees: 0,
    motionType: 'c_shape_floss',
    prepScript: 'Take a piece of dental floss and hold it tight between your fingers.',
    zoneScripts: [
      { zoneIndex: 0, startTimeSeconds: 0, title: 'Upper Teeth Interdental', quadrantId: 'UR', quadrantName: 'Upper Teeth Interdental', script: 'Slide the floss gently between your top teeth. Curve it like a "C" around the side and wipe up and down.', clinicalTip: 'Wrap floss snugly in C-shape.' },
      { zoneIndex: 1, startTimeSeconds: 20, title: 'Upper Front Interdental', quadrantId: 'UF', quadrantName: 'Upper Front Interdental', script: 'Slide the floss gently between top front teeth, curve in C-shape and wipe.', clinicalTip: 'Wipe vertically up and down.' },
      { zoneIndex: 2, startTimeSeconds: 40, title: 'Upper Left Interdental', quadrantId: 'UL', quadrantName: 'Upper Left Interdental', script: 'Move across upper left interdental spaces with gentle C-shape movements.', clinicalTip: 'Unroll clean segment per space.' },
      { zoneIndex: 3, startTimeSeconds: 60, title: 'Lower Left Interdental', quadrantId: 'LL', quadrantName: 'Lower Left Interdental', script: 'Move to your bottom teeth. Wrap the floss around each tooth side and wipe gently.', clinicalTip: 'Curve around molar contours.' },
      { zoneIndex: 4, startTimeSeconds: 80, title: 'Lower Front Interdental', quadrantId: 'LF', quadrantName: 'Lower Front Interdental', script: 'Clean lower front interdental spaces with C-shape wiping movements.', clinicalTip: 'Take care around tight contacts.' },
      { zoneIndex: 5, startTimeSeconds: 100, title: 'Lower Right Interdental', quadrantId: 'LR', quadrantName: 'Lower Right Interdental', script: 'Finish lower right interdental spaces, wiping dislodged plaque clean.', clinicalTip: 'Clean both proximal sides of contact.' }
    ],
    finishScript: 'Throw away the floss, rinse your mouth with water, and enjoy your clean smile.'
  }
];

export function getTechniqueById(id: string): BrushingTechnique {
  return CLINICAL_TECHNIQUES.find((t) => t.id === id) || CLINICAL_TECHNIQUES[0];
}
