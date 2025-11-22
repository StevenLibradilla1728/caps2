// constants/StaticData.ts

// --- 1. DATA TYPE DEFINITIONS ---

export interface SavedPlant {
  plant_id: number; name: string; classification: string; image_url: string; is_favorite: boolean; personal_notes: string;
  category?: string; care_guide?: string; ailment?: string; medicinal_uses?: string; health_benefits?: string; preparation_method?: string; cautions?: string; chemical_compounds?: string;
}
export interface Achievement { name: string; desc: string; unlocked: boolean; icon: string; }
export interface GuestProfile {
  user_info: { username: string; email: string; };
  stats: { score: number; rank_name: string; total_scans: number; plants_saved: number; quizzes_done: number; badges_earned: number; };
  rank_progress: { points_string: string; percentage: number; };
}
export interface Question { id: string; text: string; options: string[]; correct_index: number; explanation: string; }
export interface QuizLevel { id: string; title: string; description: string; questions: Question[]; reward_points: number; reward_badge?: string; }
export interface QuizCategory { id: string; title: string; icon: string; color: string; description: string; levels: QuizLevel[]; }

// --- 2. GUEST'S DEFAULT PROFILE ---
export const STATIC_GUEST_PROFILE: GuestProfile = {
  user_info: { username: "Guest User", email: "guest@tuklaslunas.app" },
  stats: { score: 0, rank_name: "Herbal Novice", total_scans: 0, plants_saved: 7, quizzes_done: 0, badges_earned: 0 },
  rank_progress: { points_string: "0 / 1000", percentage: 0 },
};

// --- 3. GUEST'S DEFAULT SAVED PLANTS (7 Plants) ---
export const STATIC_GUEST_GARDEN: SavedPlant[] = [
  { plant_id: 1, name: "Lagundi", classification: "Vitex negundo", image_url: "https://upload.wikimedia.org/wikipedia/commons/4/44/Vitex_negundo_L._%281%29.jpg", is_favorite: true, personal_notes: "My favorite for coughs.", category: "Leafy" },
  { plant_id: 2, name: "Sambong", classification: "Blumea balsamifera", image_url: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Blumea_balsamifera_%28Sambong%29_leaves.jpg", is_favorite: false, personal_notes: "Good for kidney stones.", category: "Leafy" },
  { plant_id: 3, name: "Bayabas (Guava)", classification: "Psidium guajava", image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Psidium_guajava_fruit.jpg/1280px-Psidium_guajava_fruit.jpg", is_favorite: true, personal_notes: "Antiseptic for wounds.", category: "Fruit-bearing" },
  { plant_id: 4, name: "Yerba Buena", classification: "Mentha arvensis", image_url: "https://upload.wikimedia.org/wikipedia/commons/c/c9/Mentha_arvensis_002.JPG", is_favorite: false, personal_notes: "Good for headaches.", category: "Herb" },
  { plant_id: 5, name: "Akapulko", classification: "Cassia alata", image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Senna_alata_%28Candle_Bush%29_in_Hyderabad_W_IMG_8081.jpg/1024px-Senna_alata_%28Candle_Bush%29_in_Hyderabad_W_IMG_8081.jpg", is_favorite: false, personal_notes: "For skin fungal infections.", category: "Shrub" },
  { plant_id: 9, name: "Bawang (Garlic)", classification: "Allium sativum", image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Garlic.jpg/1280px-Garlic.jpg", is_favorite: false, personal_notes: "For high blood pressure.", category: "Bulb" },
  { plant_id: 10, name: "Luya (Ginger)", classification: "Zingiber officinale", image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Zingiber_officinale_02.JPG/1280px-Zingiber_officinale_02.JPG", is_favorite: true, personal_notes: "Great for sore throat.", category: "Rhizome" },
];

// --- 4. ACHIEVEMENTS LIST ---
export const GUEST_ACHIEVEMENTS: Achievement[] = [
  { name: "First Steps", desc: "Complete your first quiz level", unlocked: false, icon: "footsteps" },
  { name: "Leaf Legend", desc: "Master all Leafy Healer levels", unlocked: false, icon: "leaf" },
  { name: "Root Specialist", desc: "Master all Root & Rhizome levels", unlocked: false, icon: "nutrition" },
  { name: "Fruit Expert", desc: "Master all Fruit & Seed levels", unlocked: false, icon: "nutrition-outline" },
  { name: "Scanner Pro", desc: "Scan 10 plants", unlocked: false, icon: "camera" },
  { name: "Quiz Master", desc: "Earn 5000 total points", unlocked: false, icon: "trophy" },
  { name: "Knowledge Seeker", desc: "Take 3 quizzes", unlocked: false, icon: "book" },
  { name: "Herbal Expert", desc: "Reach Herbal Legend Rank", unlocked: false, icon: "ribbon" },
];

// --- 5. GUEST CATEGORIES ---
export const GUEST_CATEGORIES = [
  { name: "Leafy", image_url: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Blumea_balsamifera_%28Sambong%29_leaves.jpg", description: "Plants valued primarily for their medicinal leaves." },
  { name: "Herb", image_url: "https://upload.wikimedia.org/wikipedia/commons/c/c9/Mentha_arvensis_002.JPG", description: "Small, non-woody plants with savory or aromatic properties." },
  { name: "Shrub", image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Senna_alata_%28Candle_Bush%29_in_Hyderabad_W_IMG_8081.jpg/1024px-Senna_alata_%28Candle_Bush%29_in_Hyderabad_W_IMG_8081.jpg", description: "Medium-sized woody plants, smaller than trees." },
  { name: "Fruit-bearing", image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Psidium_guajava_fruit.jpg/1280px-Psidium_guajava_fruit.jpg", description: "Large woody plants, often fruit-bearing." },
  { name: "Vine", image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Momordica_charantia_2014_08_08_001.jpg/1280px-Momordica_charantia_2014_08_08_001.jpg", description: "Climbing or trailing plants that need support." },
];

// --- 6. GUEST LEADERBOARD ---
export const GUEST_LEADERBOARD = {
  myRank: { position: 4, score: 0, rank_name: 'Herbal Novice' },
  topPlayers: [
    { username: "HerbalLegend", score: 5000, rank_name: 'Herbal Legend' },
    { username: "PlantMaster", score: 3500, rank_name: 'Nature Master' },
    { username: "BotanyBoy", score: 2000, rank_name: 'Herbal Enthusiast' },
    { username: "Guest User", score: 0, rank_name: 'Herbal Novice' },
    { username: "Newbie", score: 0, rank_name: 'Herbal Novice' },
  ]
};

// --- 7. MASTER PLANT DETAILS (35 Plants) ---
export const GUEST_PLANT_MAP = new Map<number, SavedPlant>([
  [1, { plant_id: 1, name: "Lagundi", classification: "Vitex negundo", category: "Leafy", image_url: "https://upload.wikimedia.org/wikipedia/commons/4/44/Vitex_negundo_L._%281%29.jpg", care_guide: "Prefers full sun and well-drained soil.", ailment: "Cough, Cold, Asthma", medicinal_uses: "Used as an herbal remedy for respiratory ailments.", health_benefits: "Bronchodilator, anti-inflammatory.", preparation_method: "Boil leaves in water for 15 mins.", cautions: "Generally safe.", is_favorite: true, personal_notes: "" }],
  [2, { plant_id: 2, name: "Sambong", classification: "Blumea balsamifera", category: "Leafy", image_url: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Blumea_balsamifera_%28Sambong%29_leaves.jpg", care_guide: "Needs regular watering and full sun.", ailment: "Kidney Stones, Edema", medicinal_uses: "Diuretic properties, helps dissolve kidney stones.", health_benefits: "Diuretic, anti-urolithiasis.", preparation_method: "Boil leaves to make tea.", cautions: "Not for pregnant women.", is_favorite: false, personal_notes: "" }],
  [3, { plant_id: 3, name: "Bayabas (Guava)", classification: "Psidium guajava", category: "Fruit-bearing", image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Psidium_guajava_fruit.jpg/1280px-Psidium_guajava_fruit.jpg", care_guide: "Hardy tree, tolerates various soils.", ailment: "Wounds, Diarrhea", medicinal_uses: "Antiseptic for washing wounds.", health_benefits: "Antibacterial, rich in Vitamin C.", preparation_method: "Boil leaves for wound wash.", cautions: "Generally safe.", is_favorite: true, personal_notes: "" }],
  [4, { plant_id: 4, name: "Yerba Buena", classification: "Mentha arvensis", category: "Herb", image_url: "https://upload.wikimedia.org/wikipedia/commons/c/c9/Mentha_arvensis_002.JPG", care_guide: "Prefers moist soil and partial shade.", ailment: "Headache, Stomachache", medicinal_uses: "Pain-relieving properties.", health_benefits: "Analgesic, anti-emetic.", preparation_method: "Crush fresh leaves and apply to forehead.", cautions: "Avoid high doses for infants.", is_favorite: false, personal_notes: "" }],
  [5, { plant_id: 5, name: "Akapulko", classification: "Cassia alata", category: "Shrub", image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Senna_alata_%28Candle_Bush%29_in_Hyderabad_W_IMG_8081.jpg/1024px-Senna_alata_%28Candle_Bush%29_in_Hyderabad_W_IMG_8081.jpg", care_guide: "Needs full sun to flower.", ailment: "Fungal Infections, Ringworm", medicinal_uses: "Fungicide for skin diseases.", health_benefits: "Fungicidal, laxative.", preparation_method: "Pound fresh leaves and apply juice to skin.", cautions: "External use only.", is_favorite: false, personal_notes: "" }],
  [6, { plant_id: 6, name: "Tsaang Gubat", classification: "Ehretia microphylla", category: "Shrub", image_url: "https://upload.wikimedia.org/wikipedia/commons/3/30/Carmona_retusa_var._microphylla.jpg", care_guide: "Full sun. Water when soil is dry.", ailment: "Stomachache, Diarrhea", medicinal_uses: "Anti-spasmodic properties for the gut.", health_benefits: "Anti-spasmodic.", preparation_method: "Boil leaves and drink as tea.", cautions: "Generally safe.", is_favorite: false, personal_notes: "" }],
  [7, { plant_id: 7, name: "Niyog-niyogan", classification: "Quisqualis indica", category: "Vine", image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Quisqualis_indica_flower_cluster.jpg/1280px-Quisqualis_indica_flower_cluster.jpg", care_guide: "Climbing vine, needs support.", ailment: "Intestinal Worms", medicinal_uses: "Seeds eaten to expel parasites.", health_benefits: "Anthelmintic.", preparation_method: "Chew 8-10 dried seeds (adults).", cautions: "Do not overdose, can cause hiccups.", is_favorite: false, personal_notes: "" }],
  [8, { plant_id: 8, name: "Ulasimang Bato", classification: "Peperomia pellucida", category: "Herb", image_url: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Peperomia_pellucida_20111001.jpg", care_guide: "Grows in damp, shady areas.", ailment: "Gout, Arthritis", medicinal_uses: "Lowers uric acid levels.", health_benefits: "Anti-inflammatory.", preparation_method: "Eat raw as salad or boil as tea.", cautions: "Generally safe.", is_favorite: false, personal_notes: "" }],
  [9, { plant_id: 9, name: "Bawang (Garlic)", classification: "Allium sativum", category: "Bulb", image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Garlic.jpg/1280px-Garlic.jpg", care_guide: "Needs loose soil and full sun.", ailment: "High Blood Pressure", medicinal_uses: "Contains allicin for cardiovascular benefits.", health_benefits: "Lowers blood pressure, antibacterial.", preparation_method: "Eat raw or toasted cloves.", cautions: "Can thin blood.", is_favorite: false, personal_notes: "" }],
  [10, { plant_id: 10, name: "Luya (Ginger)", classification: "Zingiber officinale", category: "Rhizome", image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Zingiber_officinale_02.JPG/1280px-Zingiber_officinale_02.JPG", care_guide: "Prefers partial shade and rich soil.", ailment: "Nausea, Sore Throat", medicinal_uses: "Anti-inflammatory remedy for motion sickness.", health_benefits: "Anti-emetic, anti-inflammatory.", preparation_method: "Boil rhizome to make tea (salabat).", cautions: "Generally safe.", is_favorite: true, personal_notes: "" }],
  [11, { plant_id: 11, name: "Ampalaya", classification: "Momordica charantia", category: "Vine", image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Momordica_charantia_2014_08_08_001.jpg/1280px-Momordica_charantia_2014_08_08_001.jpg", ailment: "Diabetes", medicinal_uses: "Helps lower blood sugar levels.", is_favorite: false, personal_notes: "" }],
  [12, { plant_id: 12, name: "Malunggay", classification: "Moringa oleifera", category: "Leafy", image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Moringa_oleifera_-_leaves.jpg/1280px-Moringa_oleifera_-_leaves.jpg", ailment: "Malnutrition", medicinal_uses: "Extremely nutritious superfood.", is_favorite: false, personal_notes: "" }],
  [13, { plant_id: 13, name: "Oregano", classification: "Origanum vulgare", category: "Herb", image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Starr_070906-8656_Origanum_vulgare.jpg/1280px-Starr_070906-8656_Origanum_vulgare.jpg", ailment: "Cough", medicinal_uses: "Juice mixed with honey for coughs.", is_favorite: false, personal_notes: "" }],
  [14, { plant_id: 14, name: "Pandan", classification: "Pandanus amaryllifolius", category: "Leafy", image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Pandanus_amaryllifolius.jpg/1280px-Pandanus_amaryllifolius.jpg", ailment: "Flavoring", medicinal_uses: "Aromatic leaves for cooking.", is_favorite: false, personal_notes: "" }],
  [15, { plant_id: 15, name: "Siling Labuyo", classification: "Capsicum frutescens", category: "Shrub", image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Siling_labuyo.jpg/1024px-Siling_labuyo.jpg", ailment: "Arthritis pain", medicinal_uses: "Topical pain reliever (capsaicin).", is_favorite: false, personal_notes: "" }],
  [16, { plant_id: 16, name: "Tanglad", classification: "Cymbopogon citratus", category: "Herb", image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Cymbopogon_citratus_DC._-_K%C3%B6hler%E2%80%93s_Medizinal-Pflanzen-046.jpg/1280px-Cymbopogon_citratus_DC._-_K%C3%B6hler%E2%80%93s_Medizinal-Pflanzen-046.jpg", ailment: "Stomachache", medicinal_uses: "Tea for digestion and calming.", is_favorite: false, personal_notes: "" }],
  [17, { plant_id: 17, name: "Adelfa", classification: "Nerium oleander", category: "Shrub", image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Nerium_oleander_flower_and_leaves.jpg/1280px-Nerium_oleander_flower_and_leaves.jpg", ailment: "POISONOUS", medicinal_uses: "Toxic if ingested.", is_favorite: false, personal_notes: "" }],
  [18, { plant_id: 18, name: "Gumamela", classification: "Hibiscus rosa-sinensis", category: "Shrub", image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Single_Red_Hibiscus.jpg/1280px-Single_Red_Hibiscus.jpg", ailment: "Boils", medicinal_uses: "Flower buds as poultice.", is_favorite: false, personal_notes: "" }],
  [19, { plant_id: 19, name: "Damong Maria", classification: "Artemisia vulgaris", category: "Herb", image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Gewoehnlicher_Beifuss_Artemisia_vulgaris.jpg/1280px-Gewoehnlicher_Beifuss_Artemisia_vulgaris.jpg", ailment: "Menstrual problems", medicinal_uses: "Regulates menstrual cycles.", is_favorite: false, personal_notes: "" }],
  [20, { plant_id: 20, name: "Banaba", classification: "Lagerstroemia speciosa", category: "Fruit-bearing", image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Banaba_Plant_-_Lagerstroemia_speciosa.jpg/1280px-Banaba_Plant_-_Lagerstroemia_speciosa.jpg", ailment: "Diabetes", medicinal_uses: "Tea to lower blood sugar.", is_favorite: false, personal_notes: "" }],
  [21, { plant_id: 21, name: "Kataka-taka", classification: "Kalanchoe pinnata", category: "Herb", image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Kalanchoe_pinnata_bulblets.jpg/1280px-Kalanchoe_pinnata_bulblets.jpg", ailment: "Boils, Sprains", medicinal_uses: "Heated leaves applied as poultice.", is_favorite: false, personal_notes: "" }],
  [22, { plant_id: 22, name: "Gotu Kola", classification: "Centella asiatica", category: "Herb", image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Centella_asiatica_in_Aso_National_Park_Japan.jpg/1280px-Centella_asiatica_in_Aso_National_Park_Japan.jpg", ailment: "Memory", medicinal_uses: "Memory enhancer.", is_favorite: false, personal_notes: "" }],
  [23, { plant_id: 23, name: "Kangkong", classification: "Ipomoea aquatica", category: "Leafy", image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Ipomoea_aquatica_in_Bhopal.jpg/1280px-Ipomoea_aquatica_in_Bhopal.jpg", ailment: "Constipation", medicinal_uses: "High fiber vegetable.", is_favorite: false, personal_notes: "" }],
  [24, { plant_id: 24, name: "Kalamansi", classification: "Citrofortunella microcarpa", category: "Fruit-bearing", image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Calamondin_fruits_-_2011-01-08.jpg/1280px-Calamondin_fruits_-_2011-01-08.jpg", ailment: "Cough, Colds", medicinal_uses: "Rich in Vitamin C.", is_favorite: false, personal_notes: "" }],
  [25, { plant_id: 25, name: "Kamias", classification: "Averrhoa bilimbi", category: "Fruit-bearing", image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Averrhoa_bilimbi_DS.jpg/1024px-Averrhoa_bilimbi_DS.jpg", ailment: "Cough", medicinal_uses: "Fruit decoction for cough.", is_favorite: false, personal_notes: "" }],
  [26, { plant_id: 26, name: "Makabuhay", classification: "Tinospora crispa", category: "Vine", image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Tinospora_crispa_06.jpg/1024px-Tinospora_crispa_06.jpg", ailment: "Stomach problems", medicinal_uses: "Bitter tonic for stomach ulcers.", is_favorite: false, personal_notes: "" }],
  [27, { plant_id: 27, name: "Mangosteen", classification: "Garcinia mangostana", category: "Fruit-bearing", image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Mangosteen.jpg/1280px-Mangosteen.jpg", ailment: "Diarrhea", medicinal_uses: "Rind decoction for diarrhea.", is_favorite: false, personal_notes: "" }],
  [28, { plant_id: 28, name: "Pansit-pansitan", classification: "Peperomia pellucida", category: "Herb", image_url: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Peperomia_pellucida_20111001.jpg", ailment: "Gout", medicinal_uses: "Lowers uric acid.", is_favorite: false, personal_notes: "" }],
  [29, { plant_id: 29, name: "Saging", classification: "Musa", category: "Fruit-bearing", image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Bananas_white_background_DS.jpg/1280px-Bananas_white_background_DS.jpg", ailment: "Cramps", medicinal_uses: "Rich in potassium.", is_favorite: false, personal_notes: "" }],
  [30, { plant_id: 30, name: "Sabila", classification: "Aloe vera", category: "Herb", image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Aloe_vera_leaf_and_cut_max.jpg/1280px-Aloe_vera_leaf_and_cut_max.jpg", ailment: "Burns", medicinal_uses: "Gel for minor burns.", is_favorite: false, personal_notes: "" }],
  [31, { plant_id: 31, name: "Tawa-tawa", classification: "Euphorbia hirta", category: "Herb", image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Euphorbia_hirta_in_SCTR%2C_Kerala_-_02.jpg/1280px-Euphorbia_hirta_in_SCTR%2C_Kerala_-_02.jpg", ailment: "Dengue", medicinal_uses: "Increases platelet count.", is_favorite: false, personal_notes: "" }],
  [32, { plant_id: 32, name: "Kamatis", classification: "Solanum lycopersicum", category: "Fruit-bearing", image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Bright_red_tomato_and_cross_section02.jpg/1280px-Bright_red_tomato_and_cross_section02.jpg", ailment: "Nutrition", medicinal_uses: "Rich in Lycopene.", is_favorite: false, personal_notes: "" }],
  [33, { plant_id: 33, name: "Atis", classification: "Annona squamosa", category: "Fruit-bearing", image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Annona_squamosa_fruit.jpg/1280px-Annona_squamosa_fruit.jpg", ailment: "Lice", medicinal_uses: "Crushed seeds for head lice.", is_favorite: false, personal_notes: "" }],
  [34, { plant_id: 34, name: "Chichirica", classification: "Catharanthus roseus", category: "Shrub", image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Catharanthus_roseus_at_Kadavoor_02.jpg/1280px-Catharanthus_roseus_at_Kadavoor_02.jpg", ailment: "Diabetes, Cancer", medicinal_uses: "Source of chemotherapy drugs.", is_favorite: false, personal_notes: "" }],
  [35, { plant_id: 35, name: "Kanya Pistula", classification: "Cassia fistula", category: "Fruit-bearing", image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Cassia_fistula_flower_and_leaves_in_Kolkata_I_IMG_8604.jpg/1280px-Cassia_fistula_flower_and_leaves_in_Kolkata_I_IMG_8604.jpg", ailment: "Constipation", medicinal_uses: "Pulp is a laxative.", is_favorite: false, personal_notes: "" }],
]);

// Helper to generate placeholder questions
const generateQuestions = (catId: string, lvlNum: number): Question[] => {
  return Array.from({ length: 10 }, (_, i) => ({
    id: `${catId}_l${lvlNum}_q${i}`,
    text: `${catId.toUpperCase()} Level ${lvlNum} Question ${i + 1}: What is...?`,
    options: ["Correct Answer", "Wrong A", "Wrong B", "Wrong C"],
    correct_index: 0,
    explanation: "Placeholder explanation. In a real app, this would be detailed plant info."
  }));
};

// --- 8. GUEST QUIZ (8 Categories x 5 Levels x 10 Questions) ---
export const GUEST_QUIZ_DATA: QuizCategory[] = [
  {
    id: 'cat1', title: 'Leafy Healers', icon: 'leaf', color: '#4ADE80', description: 'Master the medicinal uses of leafy plants.',
    levels: [
        { id: 'c1_l1', title: 'Level 1: Basics', description: 'Common leafy herbs.', reward_points: 100, questions: [
            { id: 'c1l1q1', text: "Which leafy plant is DOH-approved for cough and asthma?", options: ["Sambong", "Lagundi", "Akapulko", "Oregano"], correct_index: 1, explanation: "Lagundi is scientifically proven to be effective against coughs." },
            { id: 'c1l1q2', text: "Sambong is primarily used as a diuretic to help with what organ?", options: ["Liver", "Heart", "Kidneys", "Lungs"], correct_index: 2, explanation: "Sambong helps flush out the kidneys and dissolve stones." },
            { id: 'c1l1q3', text: "Best way to prepare Lagundi for asthma?", options: ["Eat raw", "Decoction (Boil)", "Poultice", "Smoke"], correct_index: 1, explanation: "Boiling leaves into a strong tea is standard." },
            { id: 'c1l1q4', text: "Akapulko contains chrysophanic acid, great for...", options: ["Headache", "Fungal infection", "Stomach ache", "Fever"], correct_index: 1, explanation: "It is a powerful antifungal for ringworm." },
            { id: 'c1l1q5', text: "Which leafy vegetable is a 'superfood'?", options: ["Kangkong", "Pechay", "Malunggay", "Talbos"], correct_index: 2, explanation: "Malunggay is packed with vitamins." },
            { id: 'c1l1q6', text: "Yerba Buena is a local variety of what herb?", options: ["Basil", "Mint", "Thyme", "Rosemary"], correct_index: 1, explanation: "It is the Philippine wild mint." },
            { id: 'c1l1q7', text: "Pandan leaves are mostly used for their...", options: ["Bitter taste", "Aroma", "Spice", "Sourness"], correct_index: 1, explanation: "Used for its fragrant aroma." },
            { id: 'c1l1q8', text: "Mix Oregano juice with what for coughs?", options: ["Vinegar", "Soy Sauce", "Calamansi/Honey", "Oil"], correct_index: 2, explanation: "Makes the strong juice palatable." },
            { id: 'c1l1q9', text: "Which of these is typically GROWN in water?", options: ["Lagundi", "Kangkong", "Sambong", "Malunggay"], correct_index: 1, explanation: "Kangkong is also known as Water Spinach." },
            { id: 'c1l1q10', text: "Are all leafy plants safe to eat raw?", options: ["Yes", "No", "If green", "If fragrant"], correct_index: 1, explanation: "Never assume safety. Identify first." },
        ]},
        { id: 'c1_l2', title: 'Level 2: Preparations', description: 'How to use them.', reward_points: 150, questions: generateQuestions('cat1', 2) },
        { id: 'c1_l3', title: 'Level 3: Identification', description: 'Spot the difference.', reward_points: 200, questions: generateQuestions('cat1', 3) },
        { id: 'c1_l4', title: 'Level 4: Chemistry', description: 'Active compounds.', reward_points: 250, questions: generateQuestions('cat1', 4) },
        { id: 'c1_l5', title: 'Level 5: Mastery', description: 'Final leafy test.', reward_points: 500, reward_badge: 'Leaf Legend', questions: generateQuestions('cat1', 5) },
    ]
  },
  {
    id: 'cat2', title: 'Roots & Rhizomes', icon: 'nutrition', color: '#F59E0B', description: 'Unearth the power of Ginger, Turmeric, and more.',
    levels: Array.from({length:5},(_,i)=>({id:`c2_l${i+1}`, title:`Level ${i+1}`, description:'...', reward_points:100*(i+1), questions:generateQuestions('cat2',i+1)}))
  },
  {
    id: 'cat3', title: 'Fruits & Seeds', icon: 'nutrition-outline', color: '#EF4444', description: 'Nature\'s sweet remedies.',
    levels: Array.from({length:5},(_,i)=>({id:`c3_l${i+1}`, title:`Level ${i+1}`, description:'...', reward_points:100*(i+1), questions:generateQuestions('cat3',i+1)}))
  },
  {
    id: 'cat4', title: 'Trees & Bark', icon: 'leaf-outline', color: '#78350F', description: 'Strong medicine from majestic trees.',
    levels: Array.from({length:5},(_,i)=>({id:`c4_l${i+1}`, title:`Level ${i+1}`, description:'...', reward_points:100*(i+1), questions:generateQuestions('cat4',i+1)}))
  },
  {
    id: 'cat5', title: 'Vines & Creepers', icon: 'git-merge-outline', color: '#10B981', description: 'Climbing plants with healing properties.',
    levels: Array.from({length:5},(_,i)=>({id:`c5_l${i+1}`, title:`Level ${i+1}`, description:'...', reward_points:100*(i+1), questions:generateQuestions('cat5',i+1)}))
  },
  {
    id: 'cat6', title: 'Flowering Plants', icon: 'flower-outline', color: '#EC4899', description: 'Beautiful blooms that also heal.',
    levels: Array.from({length:5},(_,i)=>({id:`c6_l${i+1}`, title:`Level ${i+1}`, description:'...', reward_points:100*(i+1), questions:generateQuestions('cat6',i+1)}))
  },
  {
    id: 'cat7', title: 'Kitchen Herbs', icon: 'restaurant-outline', color: '#6366F1', description: 'Medicine you already have in your pantry.',
    levels: Array.from({length:5},(_,i)=>({id:`c7_l${i+1}`, title:`Level ${i+1}`, description:'...', reward_points:100*(i+1), questions:generateQuestions('cat7',i+1)}))
  },
  {
    id: 'cat8', title: 'Toxins & Cautions', icon: 'warning-outline', color: '#DC2626', description: 'Vital knowledge: What NOT to use.',
    levels: Array.from({length:5},(_,i)=>({id:`c8_l${i+1}`, title:`Level ${i+1}`, description:'...', reward_points:100*(i+1), questions:generateQuestions('cat8',i+1)}))
  }
];