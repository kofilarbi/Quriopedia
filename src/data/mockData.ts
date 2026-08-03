export interface Category {
  id: string
  name: string
  color: string
  bgClass: string
}

export interface KnowledgeCard {
  id: string
  categoryId: string
  headline: string
  body: string
  readMore: string
  date: string
  type: 'fact' | 'vocab' | 'insight'
}

export interface UserConfig {
  name: string
  selectedCategories: string[]
  notificationsEnabled: boolean
  notificationTime: string
  darkMode: boolean
}

export const categories: Category[] = [
  { id: 'music', name: 'Music', color: '#E8A838', bgClass: 'bg-amber/10 border-amber' },
  { id: 'news', name: 'News', color: '#C4614A', bgClass: 'bg-terracotta/10 border-terracotta' },
  { id: 'history', name: 'History', color: '#78716C', bgClass: 'bg-stone-500/10 border-stone-500' },
  { id: 'sports', name: 'Sports', color: '#16A34A', bgClass: 'bg-green-600/10 border-green-600' },
  { id: 'finance', name: 'Finance', color: '#0D9488', bgClass: 'bg-teal-600/10 border-teal-600' },
  { id: 'science', name: 'Science', color: '#2563EB', bgClass: 'bg-blue-600/10 border-blue-600' },
  { id: 'technology', name: 'Technology', color: '#4F46E5', bgClass: 'bg-indigo-600/10 border-indigo-600' },
  { id: 'art', name: 'Art', color: '#DB2777', bgClass: 'bg-pink-600/10 border-pink-600' },
  { id: 'psychology', name: 'Psychology', color: '#7C3AED', bgClass: 'bg-purple-600/10 border-purple-600' },
  { id: 'space', name: 'Space', color: '#475569', bgClass: 'bg-slate-600/10 border-slate-600' },
  { id: 'language', name: 'Language', color: '#EA580C', bgClass: 'bg-orange-600/10 border-orange-600' },
  { id: 'nature', name: 'Nature', color: '#059669', bgClass: 'bg-emerald-600/10 border-emerald-600' },
  { id: 'food', name: 'Food', color: '#DC2626', bgClass: 'bg-red-600/10 border-red-600' },
  { id: 'philosophy', name: 'Philosophy', color: '#7C3AED', bgClass: 'bg-violet-600/10 border-violet-600' },
  { id: 'culture', name: 'Culture', color: '#0891B2', bgClass: 'bg-cyan-600/10 border-cyan-600' },
  { id: 'geography', name: 'Geography', color: '#0284C7', bgClass: 'bg-sky-600/10 border-sky-600' },
]

export const knowledgeCards: KnowledgeCard[] = [
  // Music
  {
    id: 'music-1',
    categoryId: 'music',
    headline: 'The 432 Hz Tuning Controversy',
    body: 'Some musicians claim that tuning instruments to 432 Hz instead of the standard 440 Hz produces a warmer, more harmonious sound. While science hasn\'t confirmed any special property, the debate has sparked a fascinating conversation about perception.',
    readMore: 'The modern standard of 440 Hz was officially adopted by the ISO in 1955. Before that, tuning varied wildly — Handel reportedly preferred 422.5 Hz, while Verdi advocated for 432 Hz. The "432 Hz movement" grew in the internet age, attracting both musicians and conspiracy theorists. Psychoacoustic research shows our perception of pitch is highly contextual — what feels "warmer" is often influenced by expectation and familiarity rather than absolute frequency.',
    date: '2026-08-03',
    type: 'fact',
  },
  {
    id: 'music-2',
    categoryId: 'music',
    headline: 'Earworms: Why Songs Get Stuck',
    body: 'About 98% of people experience earworms — involuntary musical imagery. Songs that are simple, repetitive, and have an unexpected interval or note tend to lodge most stubbornly in our minds.',
    readMore: 'Researchers at the University of Durham found that earworm-prone songs share a faster tempo, a common rhythmic pattern, and at least one unusual interval that the brain keeps trying to "resolve." The brain\'s auditory cortex can replay music even without any external trigger. Interestingly, engaging your working memory — by solving anagrams or reading a novel — can dislodge a stubborn earworm, as the cognitive resources needed overlap with music replay.',
    date: '2026-08-03',
    type: 'insight',
  },
  {
    id: 'music-3',
    categoryId: 'music',
    headline: 'Polyrhythm',
    body: 'A technique where two or more conflicting rhythms are played simultaneously, creating a layered, interlocking groove. West African drumming traditions are the foundational source of modern polyrhythmic music.',
    readMore: 'In polyrhythm, the most common ratio is 3-against-2: one musician plays three notes in the time another plays two. This creates a perceived "tension and release" cycle. Artists like Fela Kuti, Steve Reich, and even Radiohead use polyrhythm extensively. The human brain actually processes conflicting rhythms through two separate neural pathways, which is why polyrhythm can feel both disorienting and deeply satisfying at the same time.',
    date: '2026-08-04',
    type: 'vocab',
  },

  // News
  {
    id: 'news-1',
    categoryId: 'news',
    headline: 'The Rise of Solutions Journalism',
    body: 'Rather than focusing solely on problems, solutions journalism reports on evidence-based responses to social issues. Studies show it increases civic engagement without sacrificing critical rigor.',
    readMore: 'The Solutions Journalism Network, founded in 2013, has trained over 45,000 journalists globally. Research from the Reuters Institute found that audiences exposed to solutions-focused stories were 20% more likely to share content and 15% more likely to report feeling motivated to act on an issue. Critics argue it can veer into advocacy, but the movement maintains a strict standard: stories must include evidence of what works, how it works, and limitations of the approach.',
    date: '2026-08-03',
    type: 'insight',
  },
  {
    id: 'news-2',
    categoryId: 'news',
    headline: 'Attention Economy and the News Cycle',
    body: 'News organizations compete for the same finite pool of human attention. This competition has structurally incentivized outrage and urgency over depth and nuance.',
    readMore: 'The term "attention economy" was coined by psychologist and Nobel laureate Herbert Simon in 1971. In a world rich in information, attention becomes the scarce resource. For news media, this means headlines must create emotional arousal — particularly fear, anger, or moral outrage — to compete. Studies by researchers at MIT found that false news spreads 6x faster than true news on social platforms, partly because it tends to be more emotionally charged. Understanding this system is the first step to navigating it.',
    date: '2026-08-03',
    type: 'fact',
  },
  {
    id: 'news-3',
    categoryId: 'news',
    headline: 'Epistemic Closure',
    body: 'A political science concept describing communities that become sealed off from outside information, relying only on self-confirming sources. Often linked to echo chambers and filter bubbles.',
    readMore: 'Political blogger Julian Sanchez popularized the term in 2010 to describe a trend in right-wing media, though researchers have since documented the phenomenon across the ideological spectrum. Epistemic closure differs from confirmation bias: while confirmation bias is a cognitive tendency, epistemic closure is a social and media ecosystem phenomenon. Breaking it requires deliberate exposure to high-quality, opposing-view sources — not just any disagreement, but well-reasoned arguments.',
    date: '2026-08-04',
    type: 'vocab',
  },

  // History
  {
    id: 'history-1',
    categoryId: 'history',
    headline: 'The Library of Ashurbanipal: First Great Library',
    body: 'Assembled by Assyrian king Ashurbanipal around 650 BCE, this Nineveh library held over 30,000 clay tablet texts — including the Epic of Gilgamesh — and predates the Library of Alexandria by 400 years.',
    readMore: 'Ashurbanipal was unusual among ancient rulers in that he was literate and passionate about knowledge. He sent scribes throughout his empire to copy existing texts and reportedly boasted of his ability to solve complex mathematical problems. When Nineveh fell in 612 BCE, the clay tablets survived — unlike papyrus, fire actually baked them harder. British archaeologist Austen Henry Layard discovered the ruins in 1849, and the tablets are now housed in the British Museum.',
    date: '2026-08-03',
    type: 'fact',
  },
  {
    id: 'history-2',
    categoryId: 'history',
    headline: 'The Year Without a Summer (1816)',
    body: 'The eruption of Mount Tambora in Indonesia in 1815 caused global temperatures to drop by 0.4–0.7°C. 1816 saw frosts in June and widespread crop failures across the Northern Hemisphere.',
    readMore: 'The Tambora eruption was the largest in recorded history, ejecting 160 km³ of material into the atmosphere. The resulting aerosol cloud blocked sunlight globally. In New England, snowfall was recorded in June and July. The resulting food shortages drove mass migration from New England to the Midwest. Mary Shelley, stuck indoors during an unusually cold Swiss summer, wrote Frankenstein during this period. The famine also accelerated the invention of the bicycle, as dying horses prompted Karl Drais to develop a human-powered vehicle.',
    date: '2026-08-03',
    type: 'insight',
  },
  {
    id: 'history-3',
    categoryId: 'history',
    headline: 'Anacyclosis',
    body: 'The ancient Greek theory of political cycles, proposed by Polybius, describing how governments inevitably degrade from monarchy to tyranny, aristocracy to oligarchy, democracy to ochlocracy (mob rule), and back.',
    readMore: 'Polybius developed anacyclosis in his "Histories" (c. 150 BCE) while observing the Roman Republic. He believed Rome\'s mixed constitution — combining elements of monarchy (consuls), aristocracy (Senate), and democracy (assemblies) — broke the cycle. The theory influenced the American Founding Fathers, particularly John Adams, who cited it in designing a system of checks and balances. Modern political scientists have revisited anacyclosis to analyze democratic backsliding in the 21st century.',
    date: '2026-08-04',
    type: 'vocab',
  },

  // Sports
  {
    id: 'sports-1',
    categoryId: 'sports',
    headline: 'The Hot Hand Fallacy Isn\'t Always a Fallacy',
    body: 'For decades, the "hot hand" — believing a player on a streak will keep performing — was considered a cognitive bias. Recent research has upended this, finding real hot hand effects in several sports.',
    readMore: 'A landmark 1985 paper by Gilovich, Vallone, and Tversky claimed the hot hand was pure cognitive illusion in basketball shooting data. But a 2016 re-analysis by Miller and Sanjurjo found a subtle statistical flaw: when you condition on previous makes, the remaining attempts in a sequence are biased downward, artificially suppressing the hot hand signal. Correcting for this revealed a genuine hot hand effect of about 6 percentage points — small but real. The effect appears most strongly in sports with high situational variation.',
    date: '2026-08-03',
    type: 'insight',
  },
  {
    id: 'sports-2',
    categoryId: 'sports',
    headline: 'The Fosbury Flop Changed High Jump Forever',
    body: 'Before Dick Fosbury\'s 1968 Olympic gold medal, high jumpers went over the bar face-first. Fosbury\'s backward arch technique was initially mocked, then universally adopted within a decade.',
    readMore: 'Fosbury developed his technique in high school after struggling with the straddle technique. His innovation — arching his back so his body clears the bar while his center of mass passes below it — is a perfect illustration of physics overcoming convention. The center of mass of a well-executed Fosbury Flop actually travels below the bar while the athlete\'s body goes over it, requiring less energy. By the 1980 Olympics, 13 of 16 finalists used the flop. Today it is universal at the elite level.',
    date: '2026-08-03',
    type: 'fact',
  },
  {
    id: 'sports-3',
    categoryId: 'sports',
    headline: 'Proprioception',
    body: 'The body\'s ability to sense its own position, movement, and force in space without looking. Elite athletes have highly developed proprioception, allowing precise control at high speeds.',
    readMore: 'Proprioception is often called the "sixth sense." Specialized sensory receptors in muscles, tendons, and joints called mechanoreceptors continuously transmit position data to the brain. Training proprioception — through balance work, agility drills, and sport-specific movement patterns — is increasingly central to both performance and injury prevention. After ACL surgery, proprioceptive retraining is as important as strength rebuilding, as the injury disrupts the neural feedback loop that protects the joint.',
    date: '2026-08-04',
    type: 'vocab',
  },

  // Finance
  {
    id: 'finance-1',
    categoryId: 'finance',
    headline: 'The Rule of 72',
    body: 'Divide 72 by your annual interest rate to estimate how many years it takes to double your money. At 8% annual return, money doubles roughly every 9 years — a mental math shortcut investors actually use.',
    readMore: 'The Rule of 72 works because ln(2) ≈ 0.693, and the rule approximates this via 72/r where r is the interest rate. It\'s accurate to within 1% for rates between 6% and 10%. The same rule applies inversely to inflation: at 6% inflation, purchasing power halves in about 12 years. Luca Pacioli referenced the rule in 1494 in "Summa de arithmetica," making it one of the oldest finance heuristics still in common use.',
    date: '2026-08-03',
    type: 'fact',
  },
  {
    id: 'finance-2',
    categoryId: 'finance',
    headline: 'Why Index Funds Usually Beat Active Managers',
    body: 'Over any 15-year period, roughly 90% of actively managed funds underperform their benchmark index after fees. This is not because fund managers are incompetent — it\'s structural.',
    readMore: 'The arithmetic of active management, as explained by William Sharpe, is straightforward: active and passive investors together hold the entire market. Before costs, the average active investor must earn the market return. After costs, they must underperform. The more actively a fund trades, the more fees, taxes, and bid-ask spread costs eat into returns. Only fund managers with genuine, durable informational edges can overcome this. Jack Bogle\'s Vanguard introduced the first index fund for retail investors in 1976, which was initially mocked as "Bogle\'s folly."',
    date: '2026-08-03',
    type: 'insight',
  },
  {
    id: 'finance-3',
    categoryId: 'finance',
    headline: 'Yield Curve',
    body: 'A graph plotting interest rates of bonds with equal credit quality but different maturity dates. An inverted yield curve — where short-term rates exceed long-term rates — has preceded every U.S. recession since 1955.',
    readMore: 'Normally, longer-term bonds pay higher interest to compensate for time risk — creating an upward-sloping curve. When investors expect economic trouble, they pile into long-term bonds for safety, driving their yields down. Meanwhile, central banks often raise short-term rates to fight inflation, pushing those up. The gap "inverts." The 2-year/10-year spread is the most watched metric. It inverted in 2006 (before the 2008 crisis), 2019 (before the 2020 recession), and again in 2022.',
    date: '2026-08-04',
    type: 'vocab',
  },

  // Science
  {
    id: 'science-1',
    categoryId: 'science',
    headline: 'CRISPR Was Discovered in Yogurt Bacteria',
    body: 'The gene-editing revolution began with scientists at a dairy company studying why some bacteria survived viral attacks. The answer was a natural immune system — now the most powerful genetic tool ever developed.',
    readMore: 'In 2007, researchers at Danisco (a yogurt manufacturer) published evidence that bacteria use clustered repeated DNA sequences — CRISPR — to store memories of past viral infections. When the virus returns, the bacteria produce guide RNA that leads a protein called Cas9 to cut the virus\'s DNA. Jennifer Doudna and Emmanuelle Charpentier figured out how to reprogram this system to cut any DNA sequence in 2012, earning the 2020 Nobel Prize in Chemistry. The tool can now edit human genomes with a precision that was science fiction a decade ago.',
    date: '2026-08-03',
    type: 'fact',
  },
  {
    id: 'science-2',
    categoryId: 'science',
    headline: 'The Mpemba Effect: Hot Water Can Freeze Faster',
    body: 'Under specific conditions, hot water freezes faster than cold water. This counterintuitive phenomenon was famously observed by a Tanzanian student in 1963 and remains incompletely explained.',
    readMore: 'Erasto Mpemba noticed that hot ice cream mix froze faster than cold mix. Physicist Denis Osborne investigated and confirmed the effect in 1969. Proposed explanations include: evaporative cooling (hot water loses mass and cools faster), dissolved gas release (hot water loses dissolved gases, changing its thermal properties), convection currents creating more efficient heat transfer, and hydrogen bond restructuring in water molecules at different temperatures. A 2016 study suggested the answer lies in the properties of hydrogen bonds in hot water, but no single explanation has achieved consensus.',
    date: '2026-08-03',
    type: 'insight',
  },
  {
    id: 'science-3',
    categoryId: 'science',
    headline: 'Entropy',
    body: 'A measure of disorder or randomness in a system. The Second Law of Thermodynamics states that in a closed system, entropy always increases — the universe is fundamentally, irreversibly trending toward disorder.',
    readMore: 'Entropy explains why a dropped egg breaks but a broken egg never spontaneously reassembles; why heat flows from hot to cold but never the reverse; why aging is irreversible. Claude Shannon borrowed the term for information theory: informational entropy measures uncertainty in data. A perfectly predictable message has zero entropy; a random message has maximum entropy. This mathematical bridge between thermodynamic and informational entropy (established by Boltzmann and later Shannon) is one of the deepest unifications in physics.',
    date: '2026-08-04',
    type: 'vocab',
  },

  // Technology
  {
    id: 'technology-1',
    categoryId: 'technology',
    headline: 'The Lindy Effect: Old Tech Often Outlasts New Tech',
    body: 'A technology that has been around for 100 years is likely to remain relevant for another 100. The longer something survives, the longer its expected remaining life — a counterintuitive principle with profound implications.',
    readMore: 'The Lindy Effect was formalized by Nassim Nicholas Taleb in "Antifragile." The intuition: technologies that have survived long enough have proven their adaptability. Email (1971) has outlasted hundreds of would-be replacements. The C programming language (1972) still powers most of the internet\'s infrastructure. Plain text files are more durable than any proprietary format. This doesn\'t mean new technology is bad — it means institutional caution about replacing robust, battle-tested systems is often rational, not conservatism.',
    date: '2026-08-03',
    type: 'insight',
  },
  {
    id: 'technology-2',
    categoryId: 'technology',
    headline: 'Moore\'s Law Is Slowing — and It Changes Everything',
    body: 'Gordon Moore\'s 1965 prediction that transistor counts would double every two years drove 50 years of exponential computing gains. That curve is flattening, forcing a fundamental rethink of how progress happens.',
    readMore: 'Moore\'s Law was never a law of physics — it was an economic observation about the semiconductor industry\'s pace of investment and innovation. Physical limits are now real: transistors are approaching atomic scale (Intel\'s 2nm chips have gates roughly 10 atoms wide). The industry is responding by going 3D (stacking chip layers), using specialized hardware (GPUs, TPUs, NPUs), and shifting computation to the edge. The implication: software efficiency and algorithm design now matter more than ever, as you can no longer rely on hardware to bail you out.',
    date: '2026-08-03',
    type: 'fact',
  },
  {
    id: 'technology-3',
    categoryId: 'technology',
    headline: 'Technical Debt',
    body: 'The accumulated cost of shortcuts, quick fixes, and deferred maintenance in software systems. Like financial debt, it accrues "interest" — each future change becomes harder and riskier as the codebase grows messier.',
    readMore: 'Ward Cunningham coined the term in 1992. Technical debt is not inherently bad — sometimes a fast, imperfect solution is the right business decision, just as financial debt can be sensible leverage. The problem is unacknowledged or unmanaged debt. Studies by McKinsey found that large tech companies spend 10–20% of their technology budget just servicing technical debt, and that up to 40% of IT balance sheets consist of legacy tech requiring constant maintenance. The solution is treating it explicitly: tracking it, budgeting for it, and paying it down strategically.',
    date: '2026-08-04',
    type: 'vocab',
  },

  // Art
  {
    id: 'art-1',
    categoryId: 'art',
    headline: 'Chiaroscuro: The Drama of Light and Shadow',
    body: 'The Renaissance technique of using strong contrasts between light and dark to give the illusion of three-dimensionality. Caravaggio pushed it to extreme emotional effect — a style called tenebrism.',
    readMore: 'Chiaroscuro (Italian: "light-dark") was developed by Leonardo da Vinci and perfected by Rembrandt and Caravaggio. Where Leonardo used it for subtle modeling of form, Caravaggio used pitch-black backgrounds with a single strong light source to create theatrical drama. Rembrandt\'s self-portraits use chiaroscuro to suggest psychological depth. The technique migrated to cinema — German Expressionism and film noir both use high-contrast lighting to externalize internal states. When you see a villain lit from below in a movie, you\'re watching chiaroscuro at work.',
    date: '2026-08-03',
    type: 'vocab',
  },
  {
    id: 'art-2',
    categoryId: 'art',
    headline: 'Why Abstract Art Sells for Millions',
    body: 'Abstract art\'s market value isn\'t arbitrary. It reflects a complex web of institutional validation, historical positioning, scarcity, and the unique role art plays as a store of value for the ultra-wealthy.',
    readMore: 'Mark Rothko\'s color field paintings sell for $80M+ not because of technical virtuosity but because of their position in art history (they represent a turning point from European to American dominance in fine art), their scarcity (he produced a limited body of work), and institutional validation (MoMA acquisitions, retrospectives). Art also functions as a portable, appreciating asset that transcends borders and tax regimes. The "beauty" is partly real but partly constructed through the art world\'s gatekeeping institutions — galleries, auction houses, critics, and museums.',
    date: '2026-08-03',
    type: 'insight',
  },
  {
    id: 'art-3',
    categoryId: 'art',
    headline: 'Wabi-Sabi',
    body: 'A Japanese aesthetic philosophy finding beauty in imperfection, impermanence, and incompleteness. A cracked tea bowl repaired with gold, a weathered wooden fence, cherry blossoms falling — all embody wabi-sabi.',
    readMore: 'Wabi originally referred to the loneliness of living in nature, away from society; sabi to the beauty that comes with age and wear. The tea master Sen no Rikyū formalized wabi-sabi as the aesthetic of the Japanese tea ceremony in the 16th century, deliberately choosing rough, asymmetric, imperfect vessels over imported Chinese porcelain. The philosophy has deep Buddhist roots in the concept of impermanence (anicca). In design today, wabi-sabi influences everything from the "distressed" aesthetic in furniture to the deliberate roughness of handmade goods as a counterpoint to industrial perfection.',
    date: '2026-08-04',
    type: 'vocab',
  },

  // Psychology
  {
    id: 'psychology-1',
    categoryId: 'psychology',
    headline: 'The Peak-End Rule: Memory Isn\'t Average',
    body: 'We judge experiences not by their average quality but by how they felt at their peak (best or worst moment) and how they ended. A painful procedure ending gently is remembered as less painful than a shorter one ending abruptly.',
    readMore: 'Daniel Kahneman and Barbara Frederickson demonstrated this in the 1990s with a colonoscopy experiment. Patients who had a longer procedure but with a gentler ending rated it as less painful overall than patients who had a shorter but more abruptly ending procedure. This reveals a split between the "experiencing self" and the "remembering self." The rule has profound design implications: customer experience teams focus obsessively on final interactions; airlines prioritize the landing; retailers invest in the checkout moment.',
    date: '2026-08-03',
    type: 'insight',
  },
  {
    id: 'psychology-2',
    categoryId: 'psychology',
    headline: 'The Dunning-Kruger Effect Is More Nuanced Than the Meme',
    body: 'The famous finding that incompetent people overestimate their skills is real, but the viral "confidence graph" is a misrepresentation. The actual effect is subtler and applies to everyone.',
    readMore: 'The 1999 Kruger and Dunning study showed that people in the bottom quartile of performance consistently overestimated their performance. But critics noted a statistical artifact: regression to the mean predicts that the worst performers will overestimate and the best will underestimate, regardless of any metacognitive deficit. Recent reanalyses suggest the effect is real but smaller than popularized. More importantly, the effect applies to all skill levels: we all overestimate our competence in areas where we lack feedback, and underestimate where we\'ve internalized difficulty.',
    date: '2026-08-03',
    type: 'fact',
  },
  {
    id: 'psychology-3',
    categoryId: 'psychology',
    headline: 'Cognitive Dissonance',
    body: 'The discomfort felt when holding two contradictory beliefs, or when behavior conflicts with beliefs. Rather than change behavior, people typically resolve it by updating or rationalizing their beliefs.',
    readMore: 'Leon Festinger coined the term in 1957 after studying a doomsday cult whose prophecy failed. Rather than abandoning their belief when the world didn\'t end, members became more fervent, adding new rationalizations. The mind resolves dissonance through rationalization (finding post-hoc justifications), trivialization (deciding the conflict doesn\'t matter much), or actual belief/behavior change (the hardest path). Advertisers use dissonance deliberately: making people publicly commit to small actions creates psychological pressure to align their beliefs with their actions.',
    date: '2026-08-04',
    type: 'vocab',
  },

  // Space
  {
    id: 'space-1',
    categoryId: 'space',
    headline: 'There Are More Stars Than Grains of Sand',
    body: 'The observable universe contains roughly 2 × 10²⁴ stars — more than all the grains of sand on Earth\'s beaches. Yet the universe is 99.9999% empty space.',
    readMore: 'The number of stars (roughly 2 septillion) exceeds Earth\'s estimated 7.5 × 10¹⁸ grains of beach sand by several orders of magnitude. Yet the distances between stars are so immense that interstellar space is essentially a perfect vacuum. If the Sun were the size of a white blood cell, the nearest star would be 8 km away. The Milky Way alone is 100,000 light-years across — light from one edge takes 100,000 years to reach the other. These scales are so extreme that human intuition is simply the wrong tool for grasping them.',
    date: '2026-08-03',
    type: 'fact',
  },
  {
    id: 'space-2',
    categoryId: 'space',
    headline: 'The Fermi Paradox: Where Is Everybody?',
    body: 'Given the age and size of the universe and the prevalence of Earth-like planets, intelligent life should be common. Yet we have detected no signals, no visitors, no evidence. This is the Fermi Paradox.',
    readMore: 'Enrico Fermi posed the question at lunch in 1950: "Where is everybody?" The Drake Equation attempts to estimate the number of communicating civilizations, with estimates ranging from one (just us) to millions. Proposed resolutions include the Great Filter (a civilizational hurdle most species don\'t survive — possibly behind us, possibly ahead), the Zoo hypothesis (we\'re being deliberately isolated), and the Rare Earth hypothesis (complex life requires an improbably specific set of conditions). The discovery of the first unambiguous biosignature would be among the most significant events in human history.',
    date: '2026-08-03',
    type: 'insight',
  },
  {
    id: 'space-3',
    categoryId: 'space',
    headline: 'Lagrange Point',
    body: 'Five gravitational equilibrium points in a two-body orbital system where a smaller object can maintain a stable position relative to two larger bodies. The James Webb Space Telescope orbits the Sun-Earth L2 point.',
    readMore: 'Lagrange points were calculated by Joseph-Louis Lagrange in 1772. At these points, the gravitational forces of two large bodies (like the Sun and Earth) plus the centrifugal force of orbital motion exactly balance. L1, L2, and L3 are unstable — objects drift away if perturbed and require station-keeping thrusters. L4 and L5 are stable, and naturally accumulate asteroids called Trojans. Jupiter\'s L4 and L5 points hold over 7,000 known Trojan asteroids. Webb orbits L2, about 1.5 million km from Earth, always facing away from the Sun.',
    date: '2026-08-04',
    type: 'vocab',
  },

  // Language
  {
    id: 'language-1',
    categoryId: 'language',
    headline: 'English\'s Great Vowel Shift',
    body: 'Between 1400 and 1700, the pronunciation of English long vowels systematically shifted upward in the mouth, explaining why English spelling and pronunciation diverge so wildly today.',
    readMore: 'Before the Great Vowel Shift, "bite" was pronounced "beet," "meet" was pronounced "mate," and "mate" sounded like "maht." As vowels shifted, spellings were already being fixed by early printing presses — so we kept the old spellings with new pronunciations. This is why "through," "though," "thought," "cough," "rough," and "hiccough" all end in -ough but rhyme with six different sounds. The shift may have been triggered by large-scale social migration following the Black Death, which brought different regional dialects into contact.',
    date: '2026-08-03',
    type: 'fact',
  },
  {
    id: 'language-2',
    categoryId: 'language',
    headline: 'Language Shapes the Colors You Can See',
    body: 'People who have a linguistic distinction between two colors — like Russian speakers distinguishing goluboy (light blue) from siniy (dark blue) — can perceive differences faster and more accurately than those with one word for both.',
    readMore: 'The Sapir-Whorf hypothesis, in its weak form, proposes that language influences (not determines) thought. Color perception is its best-documented case. Experiments measuring reaction time and accuracy show Russian speakers are faster at discriminating blues at the goluboy/siniy boundary than at boundaries within each color. The Pirahã language of the Amazon has no fixed number words and no color terms beyond light and dark — and its speakers show corresponding differences in numeric and color cognition.',
    date: '2026-08-03',
    type: 'insight',
  },
  {
    id: 'language-3',
    categoryId: 'language',
    headline: 'Phoneme',
    body: 'The smallest unit of sound in a language that can distinguish meaning. English has approximately 44 phonemes. The difference between "bat" and "pat" is a single phoneme change — the initial consonant.',
    readMore: 'Humans can physically produce hundreds of distinct sounds, but each language uses only a subset as meaningful units. Japanese doesn\'t distinguish /r/ and /l/ as separate phonemes (both map to a single Japanese phoneme), which is why adult Japanese speakers struggle to hear a difference that English speakers find obvious — they literally don\'t have the neural category. Babies are born able to distinguish all human phonemes; by age one, unused distinctions fade. This phonemic pruning is why native-level accent acquisition is hardest after childhood.',
    date: '2026-08-04',
    type: 'vocab',
  },

  // Nature
  {
    id: 'nature-1',
    categoryId: 'nature',
    headline: 'Trees Communicate Through Underground Fungal Networks',
    body: 'Forests are connected by vast mycorrhizal fungal webs — the "wood wide web" — through which trees share nutrients, water, and even warning signals when under attack.',
    readMore: 'Suzanne Simard\'s research at the University of British Columbia showed that mother trees (large, old specimens) preferentially send carbon and nutrients to their own seedlings through fungal networks. When a tree is stressed by drought or insects, it sends chemical signals through the network, prompting neighboring trees to upregulate their defenses. Some researchers caution against over-anthropomorphizing — the "communication" is chemical signaling, not intentional — but the ecological interdependence is real. Clearcutting destroys not just trees but this entire subterranean social infrastructure.',
    date: '2026-08-03',
    type: 'insight',
  },
  {
    id: 'nature-2',
    categoryId: 'nature',
    headline: 'Tardigrades: The Indestructible Animal',
    body: 'Microscopic eight-legged animals, tardigrades can survive in outer space, at temperatures near absolute zero, at pressures six times the deepest ocean, and after doses of radiation that would kill any other animal.',
    readMore: 'Tardigrades ("water bears") achieve extreme survival through a process called cryptobiosis — essentially turning all biological activity off. They expel nearly all water from their cells and curl into a protective "tun" state. In this state, metabolism drops to 0.01% of normal, and they can remain viable for decades. When rehydrated, they resume normal activity within hours. In 2007, they survived direct exposure to open space for 10 days aboard a European Space Agency mission. A 2021 study found they protect their DNA from radiation with a protein that has since been engineered into human cells to increase radiation resistance.',
    date: '2026-08-03',
    type: 'fact',
  },
  {
    id: 'nature-3',
    categoryId: 'nature',
    headline: 'Biomimicry',
    body: 'Design innovation inspired by nature\'s solutions. After 3.8 billion years of evolution, nature has already solved most engineering problems humans face — often more efficiently than we have.',
    readMore: 'Velcro was inspired by burdock burrs. The bullet train\'s nose was redesigned after the kingfisher\'s beak, reducing noise and energy use by 15%. Shark skin\'s micro-texture, reproduced in swimsuit fabric, reduces drag by disrupting turbulence. Termite mounds use passive ventilation so efficient that the Eastgate Centre in Zimbabwe uses no conventional air conditioning, saving 90% of energy. The field of biomimicry was popularized by Janine Benyus\'s 1997 book and has become a formal engineering discipline at institutions like MIT and Caltech.',
    date: '2026-08-04',
    type: 'vocab',
  },

  // Food
  {
    id: 'food-1',
    categoryId: 'food',
    headline: 'Umami: The Fifth Taste Was Discovered in Tokyo',
    body: 'In 1908, chemist Kikunae Ikeda isolated glutamate from kombu seaweed and identified a distinct savory taste that didn\'t fit sweet, sour, salty, or bitter. He called it "umami" — delicious flavor.',
    readMore: 'Ikeda observed that dashi broth had a satisfying depth that none of the four known tastes could explain. He crystallized the active compound as monosodium glutamate (MSG) and commercialized it through the Ajinomoto company, which still dominates the global MSG market. Western food science was skeptical for decades, but in 2000 researchers identified specific umami receptors (T1R1/T1R3) on human taste cells, formally establishing it as a distinct primary taste. Glutamate-rich foods — parmesan, soy sauce, tomatoes, anchovies, mushrooms — owe their depth to umami.',
    date: '2026-08-03',
    type: 'fact',
  },
  {
    id: 'food-2',
    categoryId: 'food',
    headline: 'Why We Cook: The Expensive Tissue Hypothesis',
    body: 'Cooking may have been the single most important innovation in human evolution. By predigesting food with heat, cooking made more calories available, enabling smaller guts and bigger brains over millennia.',
    readMore: 'Richard Wrangham\'s "Catching Fire" (2009) argues that cooking predates Homo sapiens by 1.9 million years, when Homo erectus appeared with a dramatically larger brain and smaller gut than its predecessors. Cooking breaks down starches, denatures proteins, and kills pathogens, making more energy available from the same food. Chimps spend 6 hours a day chewing raw food; humans spend 1 hour. The freed energy and time, Wrangham argues, underwrote the explosion in brain complexity that defines our species. The hypothesis remains debated but influential.',
    date: '2026-08-03',
    type: 'insight',
  },
  {
    id: 'food-3',
    categoryId: 'food',
    headline: 'Terroir',
    body: 'The complete natural environment in which food or wine is produced — soil, topography, microclimate, local yeast — which gives it a distinct character that cannot be replicated elsewhere.',
    readMore: 'The French concept of terroir ("land") explains why champagne can only come from Champagne, Bordeaux from Bordeaux, and why Burgundy wine from two adjacent plots can taste distinctly different. The same grape variety (Pinot Noir) produces wine in Burgundy that no California vineyard can exactly replicate because the limestone soils, the specific angle of sun, the morning fog, and the centuries-old wild yeast populations are unique. The concept has expanded beyond wine to coffee (Ethiopian Yirgacheffe vs. Guatemalan), chocolate (fine cacao varietals), cheese (Comté vs. generic Swiss), and even maple syrup.',
    date: '2026-08-04',
    type: 'vocab',
  },

  // Philosophy
  {
    id: 'philosophy-1',
    categoryId: 'philosophy',
    headline: 'Stoicism\'s Core Insight: Distinguish What You Control',
    body: 'Epictetus, who was born a slave, articulated the central Stoic practice: relentlessly distinguishing between what is "up to us" (our judgments, impulses, desires) and what is not (body, reputation, property, external events).',
    readMore: 'The opening line of Epictetus\'s "Enchiridion" states the entire Stoic method: "Some things are in our control and others not." Modern cognitive behavioral therapy (CBT) is explicitly modeled on this Stoic framework. Viktor Frankl\'s "Man\'s Search for Meaning," written after surviving Auschwitz, arrives at the same insight: between stimulus and response lies a space, and in that space lies our freedom. The Stoic practice is not passive resignation but active engagement — acting vigorously on what you control while releasing attachment to outcomes you don\'t.',
    date: '2026-08-03',
    type: 'insight',
  },
  {
    id: 'philosophy-2',
    categoryId: 'philosophy',
    headline: 'The Ship of Theseus and Personal Identity',
    body: 'If the Athenians replaced every plank of Theseus\'s ship over centuries, is it still the same ship? This ancient thought experiment is now central to debates about personal identity, consciousness, and what makes you "you."',
    readMore: 'Thomas Hobbes sharpened the paradox: if you collected all the old planks and rebuilt the original ship, you\'d have two ships — which is the real one? Applied to persons: every atom in your body is replaced over years. Your beliefs, memories, and personality have changed dramatically since childhood. In what sense are you the same person? Derek Parfit\'s "Reasons and Persons" (1984) argues personal identity isn\'t what matters — what matters is psychological continuity. This has radical implications for how we think about punishment, promises, and moral responsibility over time.',
    date: '2026-08-03',
    type: 'fact',
  },
  {
    id: 'philosophy-3',
    categoryId: 'philosophy',
    headline: 'Phenomenology',
    body: 'A philosophical method, founded by Edmund Husserl, that studies conscious experience as it is actually lived — bracketing assumptions about external reality to examine the pure structure of experience itself.',
    readMore: 'Husserl\'s rallying cry was "To the things themselves!" — meaning: stop theorizing about experience from the outside and examine it rigorously from within. His student Martin Heidegger used phenomenology to argue that "being-in-the-world" is more fundamental than the Cartesian subject-object split. Merleau-Ponty applied it to the body: the phantom limb phenomenon shows that our body-schema (felt sense of our body) is cognitively prior to our intellectual knowledge of our anatomy. Phenomenology has deeply influenced cognitive science, AI research on consciousness, and qualitative research methods in psychology.',
    date: '2026-08-04',
    type: 'vocab',
  },

  // Culture
  {
    id: 'culture-1',
    categoryId: 'culture',
    headline: 'The Global Spread of K-Pop Is a Case Study in Soft Power',
    body: 'South Korea\'s deliberate investment in cultural export — K-pop, K-drama, K-beauty, K-food — has generated billions in revenue and fundamentally reshaped global perceptions of Korean identity.',
    readMore: 'After the 1997 Asian financial crisis, South Korea\'s government created the Korean Culture and Content Agency (KOCCA) to systematically develop and export cultural products. BTS alone generated an estimated $4.65 billion in annual economic impact by 2019. The "Korean Wave" (Hallyu) has driven tourism (up 47% after the success of "Squid Game"), cosmetics exports (K-beauty is now a $9B global industry), and language learning (Korean is among the fastest-growing languages on Duolingo). It\'s one of the most successful deliberate applications of Joseph Nye\'s concept of "soft power."',
    date: '2026-08-03',
    type: 'insight',
  },
  {
    id: 'culture-2',
    categoryId: 'culture',
    headline: 'The Origins of the Seven-Day Week',
    body: 'Our seven-day week traces back to ancient Babylon, was preserved by Jewish tradition, and spread globally through Roman administration. There is no astronomical basis for it — it\'s entirely a cultural artifact.',
    readMore: 'The Babylonians of the 6th century BCE organized their calendar around the seven celestial bodies visible to the naked eye: Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn. Each hour of the day was "ruled" by one of these in sequence, and the planet ruling the first hour of a day gave it its name. Through Jewish influence (the Sabbath) and Roman adoption, the seven-day cycle became standard. The French Revolutionary calendar tried to replace it with a 10-day week in 1793 — it lasted 12 years before Napoleon abolished it, partly because workers simply refused to give up 1-in-7 rest days for 1-in-10.',
    date: '2026-08-03',
    type: 'fact',
  },
  {
    id: 'culture-3',
    categoryId: 'culture',
    headline: 'Polychronic vs. Monochronic Time',
    body: 'Anthropologist Edward Hall identified two fundamentally different orientations to time: monochronic cultures do one thing at a time and treat schedules as sacred; polychronic cultures prioritize relationships over schedules and do multiple things simultaneously.',
    readMore: 'Northern European and North American business cultures are strongly monochronic — being late is disrespectful, appointments are binding, and multitasking in a meeting is rude. Mediterranean, Latin American, Middle Eastern, and South Asian cultures tend toward polychronic — relationships supersede schedules, and being present with multiple people simultaneously is normal and valued. Neither is objectively superior, but mismatches cause enormous friction in international business. Hall\'s insight (from "The Dance of Life," 1983) is that time is not neutral — it\'s a deeply cultural medium that structures social reality.',
    date: '2026-08-04',
    type: 'vocab',
  },

  // Geography
  {
    id: 'geography-1',
    categoryId: 'geography',
    headline: 'Africa Is Much Larger Than Most Maps Show',
    body: 'The Mercator projection, designed for 16th-century navigation, dramatically distorts size at higher latitudes. Africa is actually 14x larger than Greenland — though Greenland appears similar in size on standard maps.',
    readMore: 'The Mercator projection preserves angles (useful for navigation) but distorts area: regions near the poles appear far larger relative to equatorial regions than they actually are. Africa at 30.4 million km² is larger than the USA, China, India, Japan, and most of Europe combined. Greenland at 2.2 million km² is 14x smaller than Africa, yet appears similar in size. The Peters Projection (1973) uses equal area but distorts shape. No flat map can be both conformal (angle-preserving) and equal-area — it\'s a mathematical impossibility proven by Gauss in the 19th century.',
    date: '2026-08-03',
    type: 'fact',
  },
  {
    id: 'geography-2',
    categoryId: 'geography',
    headline: 'The Surprisingly Arbitrary Nature of Country Borders',
    body: 'Most modern political borders in Africa, the Middle East, and South Asia were drawn by European colonial powers with little regard for ethnic, linguistic, or geographic realities — creating conflicts that persist today.',
    readMore: 'The 1884–85 Berlin Conference divided Africa among European powers without a single African representative present. Borders were drawn using straight lines along longitude and latitude for administrative convenience, cutting through hundreds of ethnic homelands. The Yoruba people were split between Nigeria and Benin; the Somali people between five countries; the Kurdish people between four. The 1916 Sykes-Picot Agreement similarly drew the Middle East\'s borders. Scholars debate whether redrawing borders would help — the process itself creates instability — but the colonial legacy is a documented driver of ongoing ethnic conflict.',
    date: '2026-08-03',
    type: 'insight',
  },
  {
    id: 'geography-3',
    categoryId: 'geography',
    headline: 'Rain Shadow',
    body: 'The dry area on the leeward side of a mountain range, caused by air losing its moisture as it rises and cools over the mountains, then descending dry on the other side.',
    readMore: 'The classic example: California\'s Sierra Nevada creates one of the world\'s most dramatic rain shadows. The windward (western) slopes receive 150+ cm of rain annually; the Owens Valley on the leeward side receives less than 15 cm, and Death Valley beyond it is one of Earth\'s driest places. The same mechanism explains the Atacama Desert (east of the Andes), the Gobi Desert (north of the Himalayas), and the arid interior of Patagonia. Rain shadow dynamics also explain why Seattle (windward of the Cascades) is rainy while Yakima (leeward) is an arid wine-growing region.',
    date: '2026-08-04',
    type: 'vocab',
  },
]

export const defaultUserConfig: UserConfig = {
  name: '',
  selectedCategories: [],
  notificationsEnabled: false,
  notificationTime: '08:00',
  darkMode: false,
}
