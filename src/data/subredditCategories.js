// Subreddit categorization for interest and leisure analysis
// Comprehensive categorization from master subreddit lists

export const INTEREST_CATEGORIES = {
  technology: {
    label: 'Technology & Programming',
    subs: [
      // Programming
      'programming', 'learnprogramming', 'coding', 'python', 'javascript', 'java',
      'webdev', 'gamedev', 'machinelearning', 'artificial', 'compsci',
      'learnpython', 'dailyprogrammer', 'cpp', 'security', 'programmerhumor',
      'reactjs', 'unity3d', 'excel', 'php', 'reverseengineering', 'redditdev',
      // AI & Machine Learning
      'openai', 'chatgpt', 'stablediffusion', 'midjourney', 'dalle2', 'cursor',
      'fluxai', 'veo3', 'aiautomations', 'artificialinteligence', 'learnmachinelearning',
      // Automation & Integration
      'n8n', 'n8n_on_server', 'blackboxai_', 'discordbots', 'discordbotdesigner',
      // Tech general
      'technology', 'tech', 'gadgets', 'futurology', 'internetisbeautiful',
      'netsec', 'hacking', 'privacy', 'torrents', 'networking', 'piracy',
      'crackwatch', 'virtualreality', 'opensource', 'simulated',
      // Hardware
      'pcmasterrace', 'buildapc', 'hardware', 'software', 'hardwareswap',
      'mechanicalkeyboards', 'raspberry_pi', 'electronics', 'arduino', 'gopro',
      'amazonecho', 'retropie', 'blender', 'trackers', 'flipperzero', 'arcadecabinets',
      'projectors', 'watches', 'diyelectronics', 'lakka', 'batocera',
      // OS & Software
      'linux', 'ubuntu', 'linux_gaming', 'linux4noobs', 'linuxmasterrace', 'archlinux',
      'windows10', 'windows', 'microsoft', 'surface',
      'android', 'androidapps', 'androidgaming', 'androiddev', 'androidthemes', 'oneplus',
      'apple', 'iphone', 'mac', 'ipad', 'applewatch',
      // Other tech
      'google', 'chromecast', 'googlepixel', 'googlehome', 'firefox', 'photoshop',
      'dataisbeautiful', 'datahoarder', 'datascience', 'audiophile', 'headphones',
      'audioengineering', 'plex', 'multicopter', 'kodi', 'addons4kodi',
      '3dprinting', 'functionalprint', 'sysadmin', 'techsupport', 'softwaregore',
      'talesfromtechsupport', 'techsupportgore', 'itsaunixsystem', 'iiiiiiitttttttttttt',
      'programminghorror', 'techsupportmacgyver', 'buildapcsales', 'buildapcforme',
      // AI tools & platforms
      'comfyui', 'localllama', 'characterai', 'aiwars', 'soraai', 'aivideo',
      'pcbuild', 'beneater', 'antiai', 'scratch',
      // Bulk categorized additions
      'selfhosted', 'pcbuildhelp', 'vrchat', 'reptime', 'oculusquest', 'steamdeck',
      'bard', 'agi', 'hellaflyai', 'ai_art_is_not_art', 'playstationportal', 'github',
      'askelectronics', 'isthisaicirclejerk', 'c64', 'gamingsuggestions', 'csharp', 'ender6',
      'asm', 'technews', 'radeon', 'buildmeapc', 'aifails', 'oculusquest2',
      'office365', 'emudev', 'turbowarp', 'amdhelp', 'cpap', 'softwareengineering',
      'adventofcode', 'indiedev', 'macgaming', 'aislop', 'computerhelp', 'replit',
      'macos', 'monitors', 'gridfinity', 'hacking_tutorials', 'thinkpad', 'ios',
      'shitaibrossay', 'genai4all', 'informationtechnology', 'redstone', 'metaquestvr', 'androidquestions',
      'linuxquestions', 'asus', 'garminwatches', 'itchio', 'robotics', 'homenetworking',
      'chatgptpro', 'ender5', 'nvidia', 'entra', 'intune', 'fortran',
      'reolinkcam', 'bigtreetech', 'pfsense', 'fivem', 'montechpc', 'unrealengine5',
      'gaminglaptops', 'devvit', 'starlink', 'oled_gaming', 'creality', 'ubiquiti',
      'hotas', 'ai_agents', 'claudeai', 'flstudiobeginners',
    ]
  },
  
  science: {
    label: 'Science & Education',
    subs: [
      // Science
      'science', 'askscience', 'biology', 'chemistry', 'physics', 'cogsci',
      'space', 'astronomy', 'astrophotography', 'spacex', 'nasa', 'rockets',
      'psychology', 'medicine', 'medicalschool', 'medizzy', 'askdocs', 'coronavirus', 'covid19',
      'everythingscience', 'geology', 'physicsgifs', 'chemicalreactiongifs',
      'singularity', 'consciousevolution', 'deadinternettheory', 'rockhounds', 'whatsthisbug',
      // Education
      'todayilearned', 'explainlikeimfive', 'youshouldknow', 'lectures',
      'iw anttolearn', 'educationalgifs', 'learnuselesstalents', 'howto',
      'education', 'college', 'getstudy ing', 'teachers', 'watchandlearn',
      'foodforthought', 'wikipedia', 'outoftheloop', 'explainlikeiacalvin',
      'bulletjournal', 'applyingtocollege', 'lawschool',
      // Academic specific
      'askhistorians', 'history', 'anthropology', 'linguistics', 'etymology',
      'philosophy', 'askphilosophy', 'literature', 'books', 'colorizedhistory',
      'historyporn', 'propagandaposters', 'thewaywewere', 'historymemes', 'castles',
      '100yearsago', 'badhistory', 'askhistory',
      'math', 'theydidthemath', 'engineering', 'askengineers', 'engineeringstudents',
      'languagelearning', 'learnjapanese', 'french', 'law',
      // Additional science & education
      'dinosaurs', 'climate', 'environment', 'consciousness', 'ufos',
      'geography', 'conservation', 'cognitivetesting', 'mathmemes',
      'apstudents', 'elateachers', 'texasteachers', 'highstrangeness',
      'mapporn',
      // Bulk categorized additions
      'historicalcapsule', 'paleontology', 'spaceporn', 'aliens', 'invasivespecies', 'megafaunarewilding',
      'pleistocene', 'histology', 'duolingo', 'homeworkhelp', 'speculativeevolution', 'solarpunk',
      // Round 2 additions
      'productivitycafe', 'newsinterpretation',
      // Pattern-based additions (35 subs)
      'astrophysics', 'audemarspiguet', 'collegerant', 'darkpsychology101', 'darkpsychology666', 'deepspacenine',
      'facebookscience', 'healthinsurance', 'iflscienceofficial', 'legospace', 'liminalspaces', 'loveanddeepspace_',
      'malesurvivingspace', 'marssociety', 'metaphysics', 'michaellevinbiology', 'nutraceuticalscience', 'philosophyofscience',
      'psychologyofsex', 'researchchemicals', 'science2', 'scienceclock', 'scienceisdope', 'scienceuncensored',
      'social_psychology', 'spaceexploration', 'spaceflightsimulator', 'spacegirls', 'spaceships', 'spacexmasterrace',
      'standupforscience', 'stopdoingscience', 'theoreticalphysics', 'universityofhouston', 'wildlifebiology',
      'ornithology', 'sat', 'prehistoricmemes', 'evolution', 'nature', 'cryptozoology',
      'wguaccounting', 'climatechange', 'sciencememes', 'rarehistoricalphotos', 'snapshothistory', 'radiology',
      'whatsthisplant', 'archaeology', 'historicalfiction', 'imagesofhistory', 'learnpolish', 'holyshithistory',
      'ushistory', 'labrats', 'learnfinnish', 'paleoart', 'askbiology', 'entomology',
      'awesomeancientanimals', 'learnguitar', 'psychologytalk', 'microbiome', 'ornithologyuk', 'mesoamerica',
      'linguisticshumor',
    ]
  },
  
  business: {
    label: 'Business & Finance',
    subs: [
      // Business
      'entrepreneur', 'business', 'smallbusiness', 'marketing', 'startups',
      'economics', 'economy', 'basicincome', 'cscareerquestions',
      'sideproject', 'startupinvesting', 'microsaas', 'buildinpublic', 'indiehackers',
      'startups_promotion', 'saasmarketing', 'solodevelopment', 'digitalproductselling',
      'slavelabour', 'linkedinlunatics', 'linkedin',
      // Finance
      'personalfinance', 'financialindependence', 'finance', 'investing',
      'frugal', 'eatcheapandhealthy', 'frugalmalefashion', 'budgetfood',
      'cheap_meals', 'frugal_jerk', 'povertyfinance', 'beermoney',
      'apphookup', 'churning', 'realestate', 'flipping', 'antimlm',
      'personalfinancecanada', 'millionairemakers',
      // Stocks & Crypto
      'stocks', 'investing', 'stockmarket', 'wallstreetbets', 'options',
      'pennystocks', 'weedstocks',
      'cryptocurrency', 'bitcoin', 'ethereum', 'crypto', 'dogecoin',
      'ethtrade', 'litecoin', 'btc', 'garlicoin', 'cardano', 'vechain',
      'ripple', 'iota', 'stellar', 'bitcoinmarkets', 'cryptomarkets',
      'monero', 'neo', 'ethtrader', 'tronix', 'algotradingcrypto', 'inflation',
      // NFTs
      'nft', 'nftexchange', 'nftsmarketplace', 'opensea', 'openseamarket',
      'solananft', 'solseanft',
      // Additional stocks & finance
      'superstonk', 'ausfinance', 'auspropertychat', 'finanzen',
      'wallstreetbetsger', 'wallstreetbetselite', 'fluentinfinance',
      'mvis', 'inbitcoinwetrust', 'wallstreetbets_wins', 'theraceto10million',
      'gold', 'silverbugs', 'economiccollapse', 'inflation',
      // Bulk categorized additions
      'deepmarketscan', 'gme', 'bittensor_', 'wallstreet', 'wallstreetbetscrypto', 'homebuilding',
      'firsttimehomebuyer', 'educatedinvesting', 'salary', 'smallstreetbets', 'fidelityinvestments', 'deepfuckingvalue',
      'stocklaunchers', 'valueinvesting', 'filecoin', 'coincollecting', 'rivnstock', 'rddt',
      'tax', 'chubbyfire', 'asx_bets', 'walllstreetbets', 'redditstock', 'coins',
      // Round 2 additions
      'thenextgenbusiness', 'thebusinessmix', 'tokentimes', 'currencycards',
      // Pattern-based additions (30 subs)
      'algotrading', 'ausbusiness', 'business_ideas', 'canadajobs', 'criticalmineralstocks', 'daytrading',
      'egghamcornjob', 'entrepreneurs', 'hatemyjob', 'henryfinance', 'indianstocks', 'investing_discussion',
      'investingandtrading', 'jobcorps', 'jobhunting', 'middleclassfinance', 'nvda_stock', 'onejob',
      'options_trading', 'poorpeoplefinance', 'professorfinance', 'robinhoodpennystocks', 'stockbetz', 'stocknear',
      'stockstobuytoday', 'stockton', 'teslastockholders', 'torontojobs', 'usajobs', 'vampirestocks',
      'optionmillionaires', 'xrp', 'rebubble', 'torontorealestate', 'money', 'solana',
      'roaringtilray', 'unusual_whales', 'trezor', 'cryptoreality', 'bitpanda', 'schwab',
      'silver', 'bobbystock', 'numismatics', 'shibainucoin', 'bitcoinbeginners', 'thetagang',
      'pennystock', 'currency', 'investingforbeginners', 'interactivebrokers',
    ]
  },
  
  politics: {
    label: 'Politics & News',
    subs: [
      'politics', 'worldnews', 'news', 'conservative', 'liberal', 'anythinggoesnews',
      'libertarian', 'socialism', 'politicaldiscussion', 'neutralpolitics',
      'ukpolitics', 'worldpolitics', 'democrats', 'republican', 'mensrights',
      'politicalhumor', 'svenskpolitik', 'canadapolitics', 'bad_cop_no_donut',
      'kotakuinaction', 'wikileaks', 'shitcosmosays',
      // News
      'nottheonion', 'upliftingnews', 'offbeat', 'gamernews', 'floridaman',
      'energy', 'syriancivilwar', 'truecrime', 'theonion', 'atetheonion',
      // International
      'juridischadvies', 'nederland', 'nederlands', 'prague', 'uk_aliens_uap',
      // US politics
      'betteroffline', 'progressivehq', 'trumpvirus', 'enoughmuskspam',
      'conservatives', 'antitrump', 'nofiltrnews', 'meidastouch',
      'antitrumpalliance', 'bidenisnotmypresident', 'democraticsocialism',
      'politicalmemes', 'leftist', 'moderatepolitics', 'presidentelonmusk',
      'presidentfelon', 'fuckelonmusk', 'fuckthealtright', 'marchagainsttrump',
      'marchagainstnazis', 'somethingiswrong2024', 'youvotedforthat',
      'toiletpaperus', 'getnoted',
      // World politics & news
      'palestinian_violence', 'palestine', 'fucknigelfarage', 'ukgreens',
      'socialdemocracy', 'anarcho_capitalism', 'goldandblack',
      'conspiracy', 'libertarianmeme', 'scotus',
      // News & commentary
      'newsommassacre', 'leopardsatemyface', 'underreportednews',
      'goodnews', 'thescoop', 'suppressed_news', 'legalnews',
      'knowledgefight', 'behindthebastards', 'fedjerk',
      'nofilternews', 'trumpnicknames',,
      // Pattern additions round 2 (93 subs)
      'abovethenormnews', 'anarchychess', 'askconservatives', 'autismpolitics', 'bidenregret', 'britishpolitics',
      'canadianpolitics101', 'citizenwatchnews', 'completeanarchy', 'conservativecartoons', 'conservativenewsweb', 'conspiracyfact',
      'conspiracyunlocked', 'cosmicskeptic', 'cryptonews', 'danieltigerconspiracy', 'donaldtrump666', 'enoughtrumpspam',
      'environmentalnews', 'evopolitics', 'fauxnews', 'financenews', 'foxnews', 'gavincnewsom',
      'gayretardpoliticalsub', 'gbnews', 'geopolitics', 'global_news_hub', 'globalnews', 'goodnewsuk',
      'greengroundnews', 'grok', 'grokvsmaga', 'hotsciencenews', 'indian_politics', 'indianonpolitical',
      'interestingnewsworld', 'internationalnews', 'irishpolitics', 'israelconspiracy', 'joebiden', 'journalismnews',
      'karmaconspiracy', 'law_and_politics', 'livenews_24h', 'lobamains', 'marchagainstrump', 'multimedianews',
      'musked', 'neoliberal', 'neutralnews', 'news2', 'news_of_world', 'newsaroundyou',
      'newsaware', 'newsdepot', 'newsfinance', 'newsofthestupid', 'newsrewind', 'newsthread',
      'newsworthpayingfor', 'obamacare', 'paleonews', 'pbs_newshour', 'politicalopinions', 'politicalsham',
      'politicsinthewild', 'politicspeopletwitter', 'prayerstotrump', 'presidentmusk', 'presidents', 'qanoncasualties',
      'qualitynews', 'realbbcnews', 'republicans', 'republicanvalues', 'sandersforpresident', 'skeptic',
      'stocknewshub', 'symbynews', 'tech_updates_news', 'toiletpaperusa', 'top_trend_news_24_7', 'truenews',
      'trumptrumpstrump', 'uknews', 'usnewshub', 'weirdnews4u', 'whennews', 'womeninnews',
      'worldnewsvideo', 'wrestlingnewsupdates', 'ynnews',
      // Bulk categorized additions
      'foodstamps', 'darkbrandon', 'usnews', 'esist', 'qult_headquarters', 'newssource',
      'conservativetalk', 'armedsocialists', 'trumpcriticizestrump', 'prolife', 'leakednews', 'epstein',
      'political_revolution', 'babylonbee', 'optimistsunite', 'forunitedstates', 'shitstatistssay', 'trump',
      '2ndyomkippurwar', 'inthenews', 'byebyejob', 'politicalcompassmemes', 'vaccinelonghauler', 'conspiracytheories',
      'full_news', 'impeach_trump', 'politicswithrespect', 'russialago', 'therestispolitics', 'buttcoin',
      'billionairessuck', 'feminism', 'the_mueller', 'unitedamericahq', 'topmindsofreddit', 'ancap101',
      'prepperintel', 'leopardsatemyfarm', 'maganazi', 'selfawarewolves', 'askpolitics', 'scottgalloway',
      'workreform', 'fuckgregabbott', 'hermancainaward', 'parlerwatch', 'latestagecapitalism', 'jordanpeterson',
      'fuckcars', 'project2025award', 'jordan_peterson_memes', 'noncredibledefense', 'liberalgunowners', 'twoxpreppers',
      'israelcrimes', 'ukrainianconflict', 'shrinkflation', 'conservativeterrorism', 'labouruk', 'amerexit',
      'stupidpol', 'murderedbyaoc', 'acab', 'ironfrontusa', 'shermanposting', 'fascismlink',
      'enlightenedcentrism',
    ]
  },
  
  creative: {
    label: 'Creative Arts',
    subs: [
      // Visual arts
      'art', 'drawing', 'painting', 'photography', 'itookapicture', 'artporn',
      'pixelart', 'illustration', 'design', 'graphic_design', 'heavymind',
      'graffiti', 'retrofuturism', 'sketchdaily', 'artfundamentals', 'learnart',
      'specart', 'animation', 'wimmelbilder', 'streetart', 'minipainting',
      'redditgetsdrawn', 'photocritique', 'postprocessing', 'analog',
      'astrophotography', 'crafts', 'alternativeart', 'coloringcorruptions',
      'restofthefuckingowl', 'disneyvacation', 'place', 'breadstapledtotrees',
      // Writing
      'writing', 'writingprompts', 'poetry', 'screenwriting', 'lifeofnorman',
      'hfy', 'fountainpens', 'calligraphy', 'handwriting', 'twosentencehorror',
      'brandnewsentence',
      // Music creation
      'wearethemusicmakers', 'musictheory', 'learnmusic', 'edmproduction',
      'ableton', 'fl_studio',
      // Additional creative
      'analogcommunity', 'analogcirclejerk', 'flowerphotography', 'nikon',,
      // Pattern additions round 2 (102 subs)
      '60smusic', '70smusic', 'alignmentchartfills', 'anycubicphoton', 'artdeco', 'artefactporn',
      'arthistory', 'articulatedplastic', 'artificial2sentience', 'artificialntelligence', 'artificialsentience', 'artisanvideos',
      'artist', 'astonmartin', 'audiophilemusic', 'backgroundart', 'baddrawings', 'bartenders',
      'bhartiyastockmarket', 'birdphotography', 'brethart', 'canadianmusic', 'charts', 'collapsemusic',
      'coolvideosnomusic', 'countrymusicstuff', 'creativeabitlities', 'darts', 'delusionalartists', 'docmartin',
      'dollartree', 'drmartens', 'earth', 'earth25', 'economycharts', 'fartcoin',
      'fiberarts', 'flatearth', 'fuckmusic', 'fuckyouinparticular', 'guiltypleasuremusic', 'guitarteachers',
      'heartofmidlothianfc', 'heartstopperao', 'iamverysmart', 'imaginarydemons', 'imaginarygatekeeping', 'imaginaryjedi',
      'imaginarymapscj', 'imaginaryspidey', 'imaginarywarhammer', 'imaginarywesteros', 'indieanimation', 'kartenzahlung',
      'kmart', 'livemusic', 'loopartists', 'martialartsunleashed', 'martianmanhunter', 'martinguitar',
      'modern_art_gallery', 'motivatedmusic', 'music_anniversary', 'musicaljenga', 'musicals', 'musiccritique',
      'musicdegeneracy', 'musicindustry', 'naturephotography', 'no_small_parts', 'noisemusic', 'northeastartifacts',
      'oldphotosinreallife', 'partneredyoutube', 'photo', 'photos', 'photoshopbattles', 'photoshoprequest',
      'poptarts', 'rayemusic', 'rimworldart', 'rockphotosposters', 'sarthakgoswami', 'sevenheartstories',
      'shittyearthporn', 'silkysmoothmusic', 'smarthumanblogger', 'smartthings', 'soartistic', 'southafricanmusic',
      'stewartlee', 'strangeearth', 'streetphotography', 'thenandnowphotos', 'tribalart', 'unearthedarcana',
      'usefulcharts', 'utterlyuniquephotos', 'walmart', 'walmartcelebrities', 'warthunder', 'whencallstheheart',
      // Bulk categorized additions
      'imaginaryelections', 'imaginarymaps', 'wildlifephotography', 'fanfiction', 'amigurumi', 'outofcontextcomics',
      'nocontextpics', 'songwriting', 'albumcovers', 'askphotography', 'fakehistoryporn', 'africanart',
      'infraredphotography', 'pixelary', 'crochetpatterns', 'bronica', 'handwritinganalysis', 'imaginaryaviation',
      'filmphotography', 'artmemes', 'comicbookart', 'fujix', 'mediumformat', 'photomarket',
      'blackandwhite', 'cameras', 'accidentalrenaissance', 'designporn', 'walkingpics', 'framing',
      'imaginarysliceoflife', 'diyclothes', 'craftsnark', 'cineshots', 'macrophotography', 'vintageads',
      'badart', 'minimalistphotography', 'gameart', 'musicproduction', 'amateurphotography', 'photographs',
      'darkroom', 'geekycrochet', 'toyphotography',
    ]
  },
  
  careerLife: {
    label: 'Career & Work',
    subs: [
      'jobs', 'forhire', 'cscareerquestions', 'workonline',
      'talesfromtechsupport', 'talesfromretail', 'idontworkherelady',
      'talesfromyourserver', 'kitchenconfidential', 'talesfromthepizzaguy',
      'talesfromthefrontdesk', 'talesfromthecustomer', 'talesfromcallcenters',
      'talesfromthesquadcar', 'talesfromthepharmacy', 'starbucks',
      'protectandserve', 'accounting', 'teachers', 'military', 'army',
      // Gig work & career
      'antiwork', 'ubereatsDrivers', 'grubhubdrivers', 'doordash_drivers',
      'ubereats', 'socialsecurity', 'veteransbenefits',
      // Bulk categorized additions
      'roadie', 'uberdrivers', 'remotework', 'recruitinghell', 'medicare', 'doordash',
      'veterans', 'grubhub', 'workfromhome', 'fatherhood', 'construction', 'lawyertalk',
      'uber', 'careerguidance', 'truckers', 'careeradvice', 'jobsearch', 'fednews',
      'askamechanic',
    ]
  }
};

export const LEISURE_CATEGORIES = {
  gaming: {
    label: 'Gaming',
    subs: [
      'gaming', 'games', 'pcgaming', 'ps4', 'ps5', 'xbox', 'xboxone',
      'nintendoswitch', 'nintendo', 'steam', 'valve', 'gamedev',
      // Major games
      'leagueoflegends', 'overwatch', 'minecraft', 'fortnite', 'apex',
      'valorant', 'rocketleague', 'destinythegame', 'destiny2', 'wow', 'ffxiv',
      'pokemon', 'zelda', 'smashbros', 'competitiveoverwatch',
      'globaloffensive', 'dota2', 'hearthstone', 'modernwarfare', 'callofduty',
      'battlefield', 'battlefield3', 'battlefront', 'pubg', 'warzone',
      'amongus', 'fallout', 'elderscrolls', 'skyrim', 'witcher',
      'reddeadredemption', 'grandtheftautov', 'gta', 'rainbowsix',
      'csgo', 'csgobetting', 'animalcrossing', 'stardewvalley',
      // Genres
      'rpg', 'jrpg', 'mmorpg', 'roguelikes', 'strategy',
      // Platforms
      'pcmasterrace', 'buildapc', 'nintendoswitch', 'vita', '3ds',
      // Gaming adjacent
      'gamemusic', 'gamegrumps', 'gaming circlejerk', 'shouldibuythisgame',
      'patientgamers', 'gamedeals', 'freetoplay', 'freegamesonsteam',
      'randomactsofgaming', 'androidgaming', 'iosgaming', 'mobilegaming',
      'emulation', 'retrogaming', 'cade', 'mame',
      // Additional games
      'duneawakening', 'rainbow6', 'starcitizen', 'baldursgate3', 'pathofexile',
      'mortalkombat', 'helldivers', 'deadbydaylight', 'batmanarkham', 'codwarzone',
      'tf2', 'fromsoftware', 'monsterhunter', 'pathofexile2', 'gta6',
      'stalker', 'cyberpunkgame', 'wownoob', 'efootball', 'projectdiablo2',
      'edh', 'thetowergame', 'romanceclub', 'romanceclubdiscussion',
      // Round 2 additions
      'themsfightinherds', 'fighters',
      'cs2', 'counterstrike2', 'thelastofus2', 'thedivision', 'commandandconquer',
      'eldenring', 'masseffect', 'clashofclans', 'subnautica', 'ghostoftsushima',
      'darksouls2', 'stellaris', 'octopathtraveler', 'fortnitebr', 'warframe',
      'hitman', 'doom', 'princeofpersia', 'gtaonline', 'fifacareers',
      'loveanddeepspace', 'hermitcraft', 'playstation', 'lowsodiumhelldivers',
      'baldursgate', 'ghostofyotei', 'gamingcirclejerk', 'warcraftlore',
      'pokemonquest', 'videogames', 'malbontesempire', 'lotrlcg',
      'minecraftmemes', 'wiiu',
      // Bulk categorized additions
      'pkmntcgdeals', 'sto', 'wepes', 'borderlands4', 'witcher3', 'mytimeatsandrock',
      'ncaafbseries', 'kingdomcome', 'remnantgame', 'dbs_cardgame', 'deadbydaylightkillers', 'deathstranding',
      'fo76', 'pokemonscarletviolet', 'shittydarksouls', 'maplestory', 'pathofexilebuilds', 'steam_giveaway',
      'deadbydaylightrage', 'wizard101', 'pokemonhome', 'nomansskythegame', 'borderlands3', 'pokemoncardcollectors',
      'dvdcollection', 'mhwilds', 'rdr2', 'monsterhunterwilds', 'crusaderkings', 'elitedangerous',
      'tekken', 'albiononline', 'tf2shitposterclub', 'pokemongompls', 'finalfantasy', 'lastepoch',
      'roguelites', 'pokemoncardvalue', 'megaman', 'dbsfusionworld', 'botw', 'competitivewow',
      'tf2memes', 'swordandsuppergame', 'apexlegends', 'hoi4', 'legendsza', 'ps2',
      'ark', 'wizardposting', 'fo4', 'diablo2', 'easportsfc', 'truegaming',
      'pokemonlegendsarceus', 'deathstranding2', 'scp', 'diablo_2_resurrected', 'granturismo', 'fivenightsatfreddys',
      'xbox360', 'borderlands2', 'breath_of_the_wild', 'undertale', 'satisfactorygame', 'reddeadredemption2',
      'farcry', 'simracing', 'silenthill', 'psp', 'tcg', 'hookedonyou',
      'oblivion', 'noita', 'classicwow', 'rimworld', 'f1game', 'stunfisk',
      'bindingofisaac', 'spelunky', 'metroidvania', 'totk', 'xcom', 'quake',
      'fansofcriticalrole', 'riseofkingdoms', 'summonerschool', 'civ5', 'walkingwarrobots', 'simracingstewards',
      'boomershooters', 'xboxgamepass', 'systemshock', 'grimdawn', 'darksouls3', 'pokemongo',
      'tinyglade', 'onednd', 'truepokemon', 'gamecollecting', 'cavesofqud', 'sniperelite',
      'sunhaven', 'valheim', 'indiegaming', 'dragonquest', 'tearsofthekingdom', 'switch',
      'kerbalspaceprogram', 'crossout', 'xdefiant', 'spore', 'bioshock', 'terraria',
      'warhammer40k', 'starfield', 'pokemonsleep', 'armoredcore', 'darksouls', 'satisfactory',
      'pokemonlegendsza', 'shinypokemon', 'scarletandviolet', 'titanfall', '3d6', 'acquisitionsinc',
      'legendofzelda', 'genshin_impact', 'deadspace', 'halflife', 'strandeddeep', 'clonehero',
      'rockband', 'playrust', 'simcity', 'granturismo7', 'ptcgp', 'codvanguard',
      'deadbydaylightmobile', 'hadesthegame', 'civ', 'mw4', 'blackopscoldwar', 'codblackops7',
      'portal', 'genshinimpacttips', 'pathofexile2builds',
    ]
  },
  
  sports: {
    label: 'Sports & Fitness',
    subs: [
      // Major sports
      'sports', 'nfl', 'nba', 'baseball', 'mlb', 'hockey', 'nhl',
      'soccer', 'football', 'mma', 'ufc', 'boxing', 'formula1', 'nascar',
      'cfb', 'collegebasketball', 'tennis', 'golf', 'cricket', 'rugbyunion',
      'squaredcircle', 'wwe', 'wrestling',
      // Teams
      'patriots', 'eagles', 'greenbaypackers', 'minnesotavikings', 'losangelesrams',
      'warriors', 'lakers', 'bostonceltics', 'torontoraptors', 'sixers',
      'chicagobulls', 'leafs', 'gunners', 'reddevils', 'liverpoolfc',
      'chelseafc', 'realmadrid', 'barca',
      // Fantasy
      'fantasyfootball', 'fantasybball', 'fantasybaseball', 'fantasypl',
      // Leagues
      'mls', 'bundesliga', 'premierleague', 'laliga', 'seriea',
      // Olympics & events
      'olympics', 'apocalympics2016', 'worldcup', 'theocho',
      // Streaming
      'nflstreams', 'nbastreams', 'soccerstreams', 'mmastreams', 'nhlstreams',
      // Activity sports
      'running', 'bicycling', 'c25k', 'skateboarding', 'snowboarding',
      'longboarding', 'skiing', 'climbing', 'hiking', 'camping', 'backpacking',
      'campingandhiking', 'wildernessbackpacking', 'ultralight', 'campinggear',
      'bushcraft', 'survival', 'mtb', 'outdoors', 'fishing', 'sailing',
      'discgolf', 'yoga', 'bjj', 'crossfit',
      // Fitness
      'fitness', 'xxfitness', 'bodybuilding', 'weightroom', 'powerlifting',
      'bodyweightfitness', 'gainit', 'swoleacceptance', 'flexibility',
      'progresspics', 'brogress', 'loseit', 'getmotivated', 'motivation',
      // Activity tracking
      'strava', 'fitbit', 'applewatch', 'sportsarefun',
      // Additional sports
      'eyesonice', 'ravens', 'championship', 'superleague', 'watford_fc',
      'rolltide', 'scottishfootball', 'michiganwolverines', 'galatasaray',
      'mcfc', 'wrasslin', 'wrestling_figures', 'udinese', 'sportsbetting',
      'formuladank', 'motouk', 'softball', 'nfcnorthmemewar', 'nbatalk',
      'browns', 'degenbets', 'whowouldwin',
      // Bulk categorized additions
      'bikepacking', 'superlig', 'nflv2', 'fussball', 'colts', 'afcnorthmemewar',
      'goalkeepers', 'mariners', 'bmwmotorrad', 'rugbyleague', 'sportsbook', 'aprilia',
      'soccercirclejerk', 'astonmartinformula1', 'bikewrench', 'redbullracing', 'mountainbiking', 'golfgear',
      // Round 2 additions
      'footballcards', 'sportscards',
      // Pattern-based additions (56 subs)
      'allaboutbodybuilding', 'amateur_boxing', 'austriansports', 'classicsoccer', 'classicsportslogos', 'coinbase',
      'combatsportscentral', 'commanders', 'confleis', 'cricketwireless', 'cyclingwomen_', 'dailygolfsteals',
      'darussianbadger', 'deadendsports', 'easportswrc', 'emmachamberlain', 'emmawatson', 'everybodysgolf',
      'fightreportufc', 'footballemergency', 'footballhighlights', 'golftips', 'grandprixracing', 'gravelcycling',
      'greatnessofwrestling', 'gymgirlsnsfw', 'hockeyrefs', 'ihatesportsball', 'inflatedegos', 'influencersfeed',
      'lainfluencersnark', 'marathon', 'mclarenformula1', 'mercedesamgf1', 'mmamedia', 'moraldilemmas',
      'naturalbodybuilding', 'nba2k', 'nbaspurs', 'nongolfers', 'oldschool_nfl', 'professionalwrestling',
      'prowrestling', 'saggymilftits', 'sportsgossips', 'sportsmemorabilia', 'sunflowers', 'sylvansport',
      'thenflvibes', 'thepassportbros', 'ultimategolf', 'weightliftingquestion', 'williamsf1', 'wnba',
      'wrestlingfigures', 'wrestlingmemorabilia',
      'secfootball', 'martialarts', 'fcbayern', 'wec', 'ohiostatefootball', 'basketball',
      'golfswing', 'nflcirclejerk', 'nbacirclejerk', 'skiingcirclejerk', 'f1circlejerk', 'zwift',
      'nbaeastmemewar', 'nfceastmemewar', 'indycar', 'collegefootballdawgs', 'nflmemes', 'rollercoasters',
      'flyfishing', 'michiganfootball', 'f1discussions', 'motogp', 'fenerbahcesk',
    ]
  },
  
  entertainment: {
    label: 'Movies & TV Shows',
    subs: [
      // Movies
      'movies', 'truefilm', 'moviedetails', 'documentaries', 'fullmoviesonyoutube',
      'bollywoodrealism', 'moviesinthemaking', 'fullmoviesonvimeo',
      'cinematography', 'shittymoviedetails', 'moviescirclejerk', 'continuityporn',
      'ghibli', 'filmmakers', 'predator', 'cinema4d',
      // TV
      'television', 'netflix', 'netflixbestof', 'bestofnetflix', 'cordcutters',
      'japanesegameshows', 'shield', 'tvdetails', 'offlinetv', 'eurovision',
      // Shows
      'gameofthrones', 'asoiaf', 'freefolk', 'breakingbad', 'bettercallsaul',
      'thewalkingdead', 'dundermifflin', 'theoffice', 'pandr', 'community',
      'arresteddevelopment', 'topgear', 'startrek', 'himym', 'firefly',
      'sherlock', 'truedetective', 'houseofcards', 'makingamurderer',
      'flashtv', 'arrow', 'trailerparkboys', 'mrrobot', 'siliconvalleyhbo',
      'strangerthings', 'supernatural', 'thegrandtour', 'americanhorrorstory',
      'rupaulsdragrace', 'westworld', 'blackmirror', 'filthyfrank',
      'orangeisthenewblack', 'twinpeaks', 'bigbrother', 'brooklynninenine',
      'scrubs', 'howyoudoin', '30rock', 'lifeisstrange', 'survivor',
      'riverdale', 'letterkenny', 'attackontitan', 'shingeki nokyojin',
      // Animated
      'adventuretime', 'futurama', 'thelastairbender', 'archerFX', 'southpark',
      'thesimpsons', 'mylittlepony', 'rickandmorty', 'naruto', 'stevenuniverse',
      'bobsburgers', 'bojackhorseman', 'gravityfalls', 'familyguy',
      'kingofthehill', 'spongebob', 'dbz', 'dbzdokkanbattle', 'dragonballfighterz',
      // Doctor Who
      'doctorwho', 'gallifrey',
      // Seinfeld
      'seinfeld', 'redditwritesseinfeld', 'seinfeldgifs',
      // IASIP
      'iasip', 'the_dennis',
      // Franchises
      'starwars', 'harrypotter', 'lotr', 'lotrmemes', 'tolkienfans', 'otmemes',
      'prequelmemes', 'empiredidnothingwrong', 'sequelmemes',
      'marvelstudios', 'batman', 'dc_cinematic', 'thanosdidnothingwrong',
      'inthesoulstone', 'marvel', 'defenders', 'marvelmemes', 'avengers',
      'dccomics', 'spiderman', 'deadpool', 'unexpectedhogwarts',
      // Additional movies & TV
      'saw', 'percyjacksontv', 'rickygervais', 'howardstern',
      'loveisblindonnetflix', 'welcometoderrytvshow', 'moviecritic', 'cinema',
      'ithinkyoushouldleave', 'britishtv', 'curb', 'jamesbond',
      'indianajones', 'guessthemovie', 'okbuddycinephile', 'lebowski',
      'circlejerksopranos', 'scenesfromathat', 'killtony', 'normmacdonald',
      'moviesuggestions', 'horror', 'scream', 'alanpartridge',
      'peacemakershow', 'terminator', 'superman', 'underratedmovies',
      'reddwarf', 'forgottentv', 'oldbritishtelly', '90dayfiance',
      'startrekmemes', 'shittydaystrom', 'tng', 'star_trek_',
      'unexpectedseinfeld', 'film', 'trixieandkatya',
      // Additional entertainment
      'topcharactertropes', 'favoritecharacter',
      // Bulk categorized additions
      'timanderic', 'powerfuljre', 'dccmakingtheteam', 'biggboss', 'letterboxd', 'dungeoncrawlercarl',
      'scifi', 'sitcoms', 'badmovies', 'transformers', 'tedlasso', 'thepunisher',
      'invincible', 'spaceballs', 'wonderwoman', '80smovies', 'andor', 'thedollop',
      'mcutheories', 'lv426', 'pka', 'iwatchedanoldmovie', 'adultswim', 'ghostbusters',
      'jurassicworldevo', 'xmen', 'bandofbrothers', 'friskydingo', 'thesopranos', 'criticaldrinker',
      // Round 2 additions
      'scenesfromahat', 'hamilton', 'mission_impossible', 'unhhhh', 'actors', 'minecraftseeds',
      // Pattern-based additions (230 subs)
      '3cfilms', '80shorrormovies', 'absurdmovies', 'adcmains', 'alltvclassicsfrom1960', 'analoghorror',
      'anime_random', 'anime_titties', 'animealley', 'animedubs', 'animeindian', 'askmovie',
      'audiodrama', 'azumanga', 'backyardchickens', 'baddragongirls', 'badscificovers', 'basedcamppod',
      'booksfilmsandtherest', 'bootsnetflix', 'boxoffice', 'breakingnews', 'breakingpoints', 'broadchurch',
      'cabletv_memories', 'choices', 'cineseries', 'classictv', 'comedyhell', 'cosmichorror',
      'criterion', 'cultcinema', 'cursedcrochet', 'daddyincestfantasy', 'dailyshow', 'danlebatardshow',
      'darwinawardcontenders', 'dcau', 'dcu_', 'deadheadcirclejerk', 'discussingfilm', 'discussingfilmsandtv',
      'disney', 'dndhorrorstories', 'donthelpjustfilm', 'drag', 'dragonball', 'dragonballgaku',
      'dragonballjapaninfo', 'dragonballpowerscale', 'dragonballsquadra', 'dragonquestbuilders2', 'dragonquestmonsters', 'dragrace',
      'dragrace_canada', 'dreamlightvalley', 'dune', 'dunememes', 'edmprodcirclejerk', 'elitenetflix',
      'expectationvsreality', 'explainafilmplotbadly', 'fanshowdown', 'fantasy_bookclub', 'fantasy_football', 'fantasybooking',
      'fantasyfootballadvice', 'fantasyfootballers', 'fargotv', 'feltgoodcomingout', 'films', 'finalfantasytactics',
      'findthismovie', 'fixingmovies', 'foodcube', 'futurama_sleepers', 'glitch_in_the_matrix', 'godfather',
      'hardcorevindicta', 'harrypottermemes', 'harrypotteronhbo', 'hauntedchocolatier', 'hbo', 'hbomberguy',
      'heartstoppernetflix', 'horrorbookcovers', 'hotandcold', 'howardsternshow', 'ilovelahbo', 'imacelebtv',
      'imaginarydc', 'imdbfilmgeneral', 'insideno9', 'isawthetvglow', 'ishowspeed', 'issk_manga',
      'itwelcometoderryshow', 'kdramas', 'landconservation', 'lastpodcastontheleft', 'latenighttalkshows', 'lateshow',
      'lazarusanime', 'leavingneverlandhbo', 'legostarwars', 'lorepodcast', 'madmax', 'madmen',
      'mandjtv', 'mangafire', 'marketvibe', 'marvel_movies', 'marvelcirclejerk', 'marvelheroes',
      'marvelrivals', 'marvelstrikeforce', 'marvelvsdc', 'masterchef', 'matrix', 'medaltv',
      'meninsuits', 'mildlystartledcats', 'miniworldcreata', 'mitchellandwebb', 'modclub', 'morbidreality',
      'moviemistakes', 'moviemonsterporn', 'moviequotes', 'movierecommendations', 'moviereviews', 'moviesthatfeellike',
      'movietheateremployees', 'movietvarticles', 'msspodcast', 'namenerdcirclejerk', 'neighborsfromhell', 'nobodywantsthistv',
      'noshitsherlock', 'nosodiumduneawakening', 'officehourslive', 'officespeak', 'oldcommercials', 'oncinemaatthecinema',
      'ozshow', 'perktv', 'pinkfloydcirclejerk', 'pluribustv', 'primalshow', 'pulpfiction',
      'puzzleanddragons', 'raleighfilmsociety', 'redactedcharts', 'retroanime', 'robocoproguecity', 'romancemovies',
      'rpdrdrama', 'sadhorseshow', 'scarymovies', 'scifibabes', 'scifiwriting', 'severanceappletvplus',
      'sherlockholmes', 'shortfilms', 'silentmoviegifs', 'simpsons', 'slingtv', 'sopranoscirclejerk',
      'sopranosduckposting', 'spartacus_tv', 'sportscardcollecting', 'squaredcirclejerk', 'stargate', 'startrekgifs',
      'startrekpicard', 'startrekstarships', 'startrektimelines', 'startrektng', 'starwarsbattlefront', 'starwarsblackseries',
      'starwarscanon', 'starwarscirclejerk', 'starwarscosplay', 'starwarsjedisurvivor', 'starwarsleaks', 'starwarsrebels',
      'starwarstrader', 'stugotzandcompany', 'stupidcarquestions', 'stvo', 'subredditdramadrama', 'supermanlegacy',
      'survivalhorror', 'tadc', 'thebuckinghamshow', 'thecrownnetflix', 'theericandreshow', 'thefastshow',
      'theleftovers', 'theoudcollective', 'theregzshow', 'therunningmanfilm', 'thewhitelotushbo', 'theyoushow',
      'tldrmovies', 'tradingcardcommunity', 'tvcamp', 'tvshows', 'tvtoohigh', 'twilightzone',
      'u_hippiegodfather', 'u_marty_movie', 'uk_tv_girls', 'unbgbbiivchidctiicbg', 'unfilteredchina', 'unsolvedcrime',
      'untetheredrage', 'warmovies', 'washdc', 'washingtondc', 'waywardnetflix', 'weaponsmovie',
      'whatanime', 'whatsthemoviecalled', 'whyweretheyfilming', 'worldcupqatarstrophy', 'wreddittv', 'youtubedrama',
      'youtubetv', 'yugiohshowcase',
      // Pattern-based additions (208 subs)
      '2007scape', 'age_30_plus_gamers', 'aigamedev', 'ammo', 'anthemthegame', 'aow4',
      'apexconsole', 'arpg', 'askgames', 'askgaming', 'augmentcodeai', 'battlefield2042',
      'battlefield6', 'battlefield_one', 'battlefieldv', 'beyblademetal', 'bigfishgames', 'bloodborne',
      'buildingcodes', 'codeium', 'competitiveedh', 'conspiracy_commons', 'controller', 'cozygamers',
      'cozygames', 'crocodiles', 'csgolounge', 'cyberpunk', 'dailywowstuff', 'decodingthegurus',
      'degenerateedh', 'destiny', 'diablo', 'diablo3', 'diablo4', 'division2',
      'drawscape', 'epicgamespc', 'escape_velocity', 'falloutmemes', 'falloutmods', 'falloutnewvegas',
      'foilmtg', 'forcurioussouls', 'fortnitememes', 'freemagic', 'game', 'gameboy',
      'gameboyadvance', 'gamecube', 'gamedevscreens', 'gamemaker', 'gameoflife', 'gamephysics',
      'gamerpals', 'gamers', 'gamersnexus', 'gamesindustry', 'gameslikediablo', 'gamingleaksandrumours',
      'gamingnews', 'gamingpc', 'gamingpcbuildhelp', 'gamingunjerk', 'girlgamers', 'girlgames',
      'gmod', 'godofwar', 'gta5online', 'gta6unmoderated', 'gtacarmeetmarket', 'gtadupe',
      'gtav', 'gymmotivation', 'horrorgames', 'horrorgaming', 'imaginaryseascapes', 'immortalists',
      'indianajonesgames', 'indiegames', 'irelandgaming', 'ismypokemoncardfake', 'itsallaboutgames', 'landscapephotography',
      'leagueofdreamers', 'leagueofmemes', 'leagueone', 'leaguetwo', 'litrpgwriting', 'littleleague',
      'longtail', 'lostarkgame', 'lowsodiumcyberpunk', 'madmaxgame', 'mafiathegame', 'magiccardpulls',
      'mario', 'mariokarttour', 'mariomaker', 'minecraftbuilds', 'minecraftclients', 'minecraftcommands',
      'minecrafthmmm', 'minecraftinventions', 'minecraftserver', 'minecraftsuggestions', 'minecrafttodo', 'mobcontrolgame',
      'msi_gaming', 'mtg', 'mtgbrawl', 'mtgfinance', 'mtgmisprints', 'netflixgamers',
      'newworldgame', 'nextcargame', 'nintendo3ds', 'nintendoswitchdeals', 'nintendoswitchhelp', 'okbuddyvicodin',
      'optimizedgaming', 'originalxbox', 'osrsmobile', 'outsidexbox', 'outwardgame', 'papermario',
      'phgamers', 'piratedgames', 'playstation5', 'playstation_x', 'playstationclassic', 'plsdonategame',
      'plussizedhotwives2', 'pokemmo', 'pokemonanime', 'pokemonart', 'pokemonbdsp', 'pokemoncardappraisal',
      'pokemoncrystal', 'pokemongofriends', 'pokemongotrades', 'pokemoninvesting', 'pokemonletsgo', 'pokemonmemes',
      'pokemonoras', 'pokemonrestockr', 'pokemonswordandshield', 'pokemontgcp', 'premiummotivation', 'quizplanetgame',
      'readyornotgame', 'redditgames', 'redhead_love', 'redhotchilipeppers', 'retrogamedev', 'retrogamingmagazines',
      'rhythmgames', 'riseofnationsroblox', 'roblox', 'robloxexploiting', 'robloxgamedev', 'robloxhackers',
      'roguetradercrpg', 'rpg_gamers', 'sekiro', 'shittymobilegameads', 'skyrimmemes', 'skyrimmodsxbox',
      'skyrimporn', 'slappedham', 'slashdiablo', 'slatestarcodex', 'sonicshowerthoughts', 'soulslikes',
      'spectrummobile', 'squidgame', 'starrupturegame', 'steamcontroller', 'steamscams', 'storyscape',
      'suicidesquadgaming', 'superpeoplegame', 'the_division', 'the_division_2', 'thegamerlounge', 'tunicgame',
      'twinegames', 'twitchplayspokemon', 'tyrannygame', 'u_marioyoyo247', 'uflthegame', 'unexpectedhimym',
      'vibecoding', 'vrgaming', 'vtm', 'vtmb', 'whitewolfrpg', 'witcher4',
      'wotcpokemoncards', 'wowclassic', 'wowhardcore', 'wowroleplay', 'wowservers', 'wwegames',
      'xboxseriesxls', 'yakuzagames', 'zeldaiscute', 'zeldatearsofkingdom',
      'mst3k', 'halloweenmovies', 'superpowers', 'cinephobe', 'comedy', 'westerns',
      'backtothefuture', 'standup', 'crunchyroll', 'lordoftherings', 'robocop', 'kindafunny',
      'starwarscantina', 'disneyland', 'flicks', 'nottimandericpics', 'fantasticfour', 'freefolknation',
      'moviequestions', 'davidlynch', 'venturebros', 'greenlantern', '90smovies', 'goosebumps',
      'squidbillies', 'captainamerica', 'heartstoppersyndrome', 'lovetrash', 'stranger_things', 'topgun',
      'jurassicpark', 'stephencolbert', 'tmnt', 'godzilla', 'gijoe', 'reno911',
      'disneyplus', 'smilingfriends', 'theacolyte', 'nosleep', 'terrifier', 'taskmaster',
      'houseofthedragon', 'pixar', 'starwarsoutlaws', 'napoleon', 'starwarscollecting', 'itcrowd',
      'clarksonsfarm', 'starwarseu', 'disneyworld',
    ]
  },
  
  animeMedia: {
    label: 'Anime & Manga',
    subs: [
      'anime', 'manga', 'anime_irl', 'awwnime', 'tsunderesharks',
      'animesuggest', 'animemes', 'animegifs', 'animewallpaper',
      'wholesomeanimemes', 'pokemon', 'onepiece', 'naruto', 'dbz',
      'onepunchman', 'bokunoheroacademia', 'yugioh', 'ddlc', 'berserk',
      'hunterxhunter', 'tokyoghoul', 'shitpostcrusaders', 'attackontitan',
      // Additional anime & manga
      'grapplerbaki', 'hajimenoippo', 'azumangaposting', 'mlplounge',
      'justyuri', 'deathbattlematchups', 'ben10', 'rwbycritics',
      'dragonballsuper', 'dragonballz', 'animecirclejerk', 'animequestions', 'reiplush',
      // Bulk categorized additions
      'kimetsunoyaiba', 'mydressupdarlinganime', 'animereccomendations', 'fionnaandcake', 'nagatoro', 'characterrant',
      'manhwa', 'chainsawman', 'fullmetalalchemist',
    ]
  },
  
  books: {
    label: 'Books & Reading',
    subs: [
      'books', 'literature', 'booksuggestions', 'poetry', 'lovecraft',
      'suggestmeabook', 'freeebooks', 'boottoobig', 'harrypotter',
      'kingkillerchronicle', 'asoiaf', 'lotr', 'tolkienfans',
      // Additional books
      'stephenking', 'fantasy', 'horrorlit',
      // Bulk categorized additions
      'dresdenfiles', 'exfor', 'humansarespaceorcs', 'thefirstlaw', 'printsf', 'stormlight_archive',
      'discworld', 'neilgaiman', 'sciencefiction',
      // Pattern-based additions (27 subs)
      'audiobooks', 'blacklibrary', 'bookcollecting', 'bookkeeping', 'booksthatfeellikethis', 'comicbookcollecting',
      'comicbookporn', 'currentlyreading', 'destructivereaders', 'facebook', 'facebookads', 'fightlibrary',
      'ifbookscouldkill', 'longreads', 'mysterybooks', 'narniabooks', 'readanotherbook', 'romanceclubbooknook',
      'spreadsmile', 'strangematterbooks', 'stupidpeoplefacebook', 'telenovelas', 'terriblebookcovers', 'thatsabooklight',
      'tolkienbooks', 'whatsthatbook', 'zlibrary',
    ]
  },
  
  comics: {
    label: 'Comics',
    subs: [
      'comics', 'comicbooks', 'polandball', 'marvel', 'webcomics',
      'bertstrips', 'marvelstudios', 'defenders', 'marvelmemes',
      'batman', 'calvinandhobbes', 'xkcd', 'dccomics',
      // Bulk categorized additions
      'starwarsmemes', 'transformemes', 'superheroes', 'comicbookmovies',
    ]
  },
  
  music: {
    label: 'Music',
    subs: [
      // General
      'music', 'listentothis', 'mashups', 'vinyl', 'futurebeats',
      'spotify', 'fakealbumcovers',
      // Artists
      'kanye', 'radiohead', 'kendricklamar', 'gorillaz', 'frankocean',
      'donaldglover', 'eminem', 'brockhampton', 'beatles', 'deathgrips',
      'pinkfloyd', 'joerogan',
      // Genres
      'classicalmusic', 'jazz', 'trap', 'indieheads', 'gamemusic',
      'outrun', 'vaporwave', 'dubstep', 'electronicmusic', 'edmproduction',
      'edm', 'hiphopheads', 'hiphopimages', 'metal', 'metalcore',
      'spop', 'kpop', 'funkopop', 'popheads', 'kpopfap',
      // Instruments
      'guitar', 'piano', 'bass', 'drums', 'guitarlessons',
      // Additional music
      'doommetal', 'littlemix', 'metalforthemasses', 'brucespringsteen',
      'michaeljackson', 'synthesizers', 'pantera', 'guitarcirclejerk',
      'musicsuggestions', 'guitars', 'toddintheshadow', 'truespotify',
      'fkatwigs', 'crappymusic', 'fantanoforever', 'vintageaudio',
      'powermetal', 'musicians', 'reaper',
      // Bulk categorized additions
      'musicrecommendations', 'stonerrock', '90shiphop', 'thebeatles', 'turntables', 'concerts',
      'lanadelrey', '80smusic', 'ukulele', 'jazzcirclejerk', 'ironmaiden', 'hip_hop_that_u_need',
      'askmusic', 'metalmemes', 'radioheadcirclejerk', 'kylieminogue', 'qotsa', 'arminvanbuuren',
      'hozier', 'allrockmusic', 'inmetalwetrust', 'sabrinacarpenterfans', 'oasis', 'bassguitar',
      'heavyvinyl', 'gloryhammer', 'davidbowie', 'classicrock', 'electricguitar', 'oldschoolcoolmusic',
      'sludge', 'metalsuggestions', 'thecure', 'guitar_theory', 'bobdylan', 'guitaramps',
      'rockmusic', 'progmetal', 'stratocaster', 'telecaster', 'guitarpedals', 'letstalkmusic',
      // Pattern-based additions (84 subs)
      'abandoned', 'abandoned_world', 'alternativerock', 'band', 'bandmembers', 'beatleshatesub',
      'bedroompop', 'bobandtom', 'britpop', 'cedarrapids', 'chicagoedm', 'contrapoints',
      'crappyoffbrands', 'craps', 'deathband', 'deeprockgalactic', 'drumming', 'edmond',
      'electronic_cigarette', 'germanrap', 'getmotivatedmindset', 'grandrapids', 'graphicnovels', 'guitar_improvisation',
      'guitarhero', 'guitarmod', 'guitarplaying', 'guitarporn', 'guitarquestions', 'heavymetal',
      'humansaremetal', 'infographics', 'jacksucksatgeography', 'jazztheory', 'kpopdemonhunters', 'krapopolis',
      'leftyguitarists', 'metalboners', 'metaldetecting', 'metalgearsolid', 'metalisnature', 'metallica',
      'metalocalypse', 'mypeopleneedme', 'namethatsong', 'noscrapleftbehind', 'okbuddydraper', 'pianolearning',
      'pimplepoppersdelight', 'popcorn', 'popculture', 'popularculturezone', 'popularopinion', 'popularopinions',
      'postrock', 'powerapps', 'rap', 'rock', 'rockidentification', 'rocks',
      'rocksmith', 'rockstar', 'scrapmetal', 'sepulturaband', 'silksong', 'skyscrapers',
      'sleeperapp', 'songsforthispicture', 'stonermetal', 'taxidermyismetal', 'trypophilia', 'trypophobia',
      'twistedmetal', 'typography', 'u_terraparadisexo', 'ukpopculture', 'unidentifiedmedia', 'unresolvedmysteries',
      'unsolvedmysteries', 'weirdspotifyplaylists', 'whatbeatsrock', 'whatsongisthis', 'whatsthisrock', 'whothefuckdownvotedme',
      // Pattern-based additions (224 subs)
      'agentsofai', 'ai4tech', 'ai__limit', 'aiartwork', 'aibeingstupid', 'aidangers',
      'aidungeon', 'aiecosystem', 'aifu_stock', 'aimapgore', 'aio', 'aipartners',
      'airfryer', 'airplaneears', 'airplanes', 'airpods', 'airtags', 'akaiforce',
      'akaimpc', 'americanairlines', 'amibeingdetained', 'analogrepair', 'androidafterlife', 'andromedainsightspc',
      'applearcade', 'applemaps', 'applemusic', 'appleshortcuts', 'applesucks', 'arcraiders',
      'areyouafraidofthedark', 'azudaioh', 'bakingfail', 'battletech', 'betterkimetsunoyaiba', 'bitchimatrain',
      'bitcoin_com', 'bleak_faith', 'boneappletea', 'boneappletypo', 'bonsaicommunity', 'brainrot',
      'britain', 'britishairways', 'butterfliesai', 'catastrophicfailure', 'cattraining', 'celebportraits',
      'cestdufrancaisca', 'characterairunaways', 'chatgptcomplaints', 'chessprogramming', 'civitai', 'cobrakai',
      'cocktails', 'complainaboutanything', 'computers', 'computersecurity', 'computershare', 'crimesculinaires',
      'crypto_com', 'cryptochartwatch', 'cryptoindia', 'cryptomining', 'cryptotrenching', 'cyberstuck',
      'cybersucks', 'dailychristinaricci', 'dailydoseofdamn', 'dailyguess', 'dataisugly', 'deathstairs',
      'degoogle', 'delusionalcraigslist', 'dmacademy', 'dogtrainingtips', 'dubai', 'dubaijobs',
      'electronicsrepair', 'ethelcain', 'explainthisscreen', 'facebookaislop', 'failsonstream', 'fairytaleasfuck',
      'foxbrain', 'fraiser', 'frankiemacdonald', 'garbagepailkids', 'garenmains', 'gba4ios',
      'geminiai', 'generativeai', 'geschichtsmaimais', 'googlefiber', 'haiku', 'hair',
      'hairlossresearch', 'hairmetal', 'haiti', 'hardaiimages', 'hardtailgang', 'hardwaregore',
      'higgsfieldai', 'html5', 'humanaidiscourse', 'ice_raids', 'indiancivicfails', 'indiatech',
      'industrialmaintenance', 'ios26', 'iosdevelopersmacos', 'iosprogramming', 'iossetups', 'iphone16promax',
      'isekai', 'isitai', 'isthisai', 'italianbrainrot', 'jamaica', 'jermaine_jackson',
      'jujutsukaisen', 'jungle_mains', 'lain', 'linustechtips', 'linuxmint', 'livestreamfails',
      'longhair', 'lovingai', 'ludditerenaissance', 'macapps', 'macbookair', 'machinesinaction',
      'machinists', 'macrogrowery', 'macroporn', 'maintenance', 'mauvaisesreponses', 'micromachines',
      'microsoftflightsim', 'microsoftrewards', 'microsoftteams', 'microsoftword', 'missfortunemains', 'mla_official',
      'mlpmature', 'mlscaling', 'mountainwisdom', 'muaentertainment', 'muaythai', 'muaythaitips',
      'nails', 'nothingtech', 'nowintech', 'okoidawappler', 'oldtrailers', 'oneai',
      'opendogtraining', 'openhaiku', 'opinionnonpopulaire', 'orphancrushingmachine', 'otomeisekai', 'paint',
      'painterlyphotos', 'pepecryptocurrency', 'perplexity_ai', 'pharmacy', 'pharmacytechnician', 'phonerepair',
      'pj_explained', 'portfolios', 'praisethecameraman', 'publicdomain', 'pyrotechnics', 'qiditech3d',
      'rainboweverything', 'realorai', 'retail', 'retailhell', 'robotech', 'saintsfc',
      'saionara', 'saltierthancrait', 'saltierthankrait', 'samurai', 'scambait', 'selbermachen',
      'sennamains', 'shacomains', 'sillybritain', 'smilesdaily', 'staiy', 'sustainability',
      'taintedgrail', 'techmoan', 'techno', 'technologyshorts', 'thailandtourism', 'the_donaid',
      'thecryptoindia', 'thedailyzeitgeist', 'theentertainmentmix', 'trailers', 'trailforks', 'trainporn',
      'truecryptozoology', 'turkishairlines', 'u_mellymac123', 'u_new-entertainment112', 'u_ptentertainment', 'ukrainewarvideoreport',
      'unexplained', 'uniteagainsttheright', 'unitedairlines', 'unraid', 'usbchardware', 'voxmachina',
      'waiters', 'whatisthispainting', 'windows11', 'windowsmr', 'windowsphone', 'wissenistmacht',
      'worstaid', 'xerathmains',
      'numetal', 'astateoftrance',
    ]
  },
  
  lifestyle: {
    label: 'Lifestyle & Hobbies',
    subs: [
      // DIY & Making
      'diy', 'woodworking', 'crafts', 'knitting', 'sewing', 'somethingimade',
      'architecture', 'coolguides', 'worldbuilding', 'diWHY', 'modelmakers',
      'crochet', 'redneckengineering', 'crossstitch', 'dumpsterdiving',
      'gunpla', 'cubers', 'blacksmith', 'toptalent',
      // Home
      'homeimprovement', 'homelab', 'homeautomation', 'battlestations',
      'hometheater', 'interiordesign', 'roomporn', 'amateurroomporn',
      'cozyplaces', 'malelivingspace', 'tinyhouses', 'vandwellers',
      // Food & Cooking
      'food', 'foodporn', 'foodhacks', 'shittyfoodporn', 'eatsandwiches',
      'nutrition', 'mealtimevideos', 'wewantplates', 'forbiddensnacks',
      'seriouseats', 'spicy', 'cooking', 'slowcooking', 'askculinary',
      'baking', 'mealprepsunday', 'breadit', 'cookingforbeginners',
      'smoking', 'castiron', 'instantpot', 'sousvide', 'recipes',
      'gifrecipes', 'veganrecipes', 'pizza', 'grilledcheese', 'ramen',
      'bbq', 'sushi', 'coffee', 'tea',
      // Diet
      'eatcheapandhealthy', 'fitmeals', 'budgetfood', 'ketorecipes',
      'vegan', '1200isplenty', 'cheap_meals', 'healthyfood', 'veganrecipes',
      'intermittentfasting', 'fasting', 'keto', 'ketogains', 'paleo',
      'vegetarian', 'leangains',
      // Fashion & Beauty
      'malefashionadvice', 'frugalmalefashion', 'femalefashionadvice',
      'thriftstorehauls', 'fashion', 'streetwear', 'malefashion',
      'supremeclothing', 'fashionreps', 'designerreps', 'sneakers',
      'repsneakers', 'goodyearwelt', 'makeupaddiction', 'skincareaddiction',
      'beards', 'wicked_edge', 'redditlaqueristas', 'asianbeauty',
      'piercing', 'fancyfollicles', 'malehairadvice', 'curlyhair',
      'tattoos', 'badtattoos', 'tattoo',
      // Automotive
      'cars', 'motorcycles', 'carporn', 'justrolledintotheshop',
      'idiotsincars', 'shitty_car_mods', 'autos', 'roadcam',
      'autodetailing', 'awesomecarmods', 'projectcar', 'cartalk',
      'tiresaretheenemy', 'roadtrip', 'convenientcop', 'dashcamgifs',
      'subaru', 'teslamotors', 'bmw', 'jeep', 'formula1', 'nascar',
      // Tools & Skills
      'watches', 'lockpicking', 'knives', 'specializedtools', 'knifeclub',
      'edc', 'everymanshouldknow', 'geek', 'simpleliving', 'rainmeter',
      // Travel
      'travel', 'solotravel', 'japantravel', 'shoestring', 'earthporn',
      // Gardening & Plants
      'gardening', 'indoorgarden', 'marijuanaenthusiasts', 'succulents',
      'mycology', 'bonsai', 'treessuckingonthings', 'houseplants',
      'plantedtank', 'aquariums',
      // Photography
      'photography', 'itookapicture', 'photocritique', 'postprocessing',
      'analog', 'astrophotography',
      // Outdoors
      'urbanexploration', 'survival', 'backpacking', 'camping', 'homestead',
      'mtb', 'outdoors', 'wildernessbackpacking', 'campinggear', 'bushcraft',
      'campingandhiking', 'hiking', 'ultralight',
      // Other
      'aviation', 'flying', 'lego', 'boardgames', 'rpg', 'chess',
      'poker', 'jrpg', 'dnd', 'dndgreentext', 'dndbehindthescreen',
      'dndnext', 'dungeonsanddragons', 'criticalrole', 'dmaacademy',
      'dndmemes', 'magictcg', 'modernmagic', 'magicarena', 'cubancigars',
      'plumbing', 'licenseplates', 'ltadevlog',
      // Plants & gardening
      'pseudolithos', 'cactus', 'flowers', 'mesembs', 'caudex', 'botanicalporn',
      'cactusbloom', 'nativeplantcirclejerk', 'euphorbiaceae', 'ariocarpus_of_mexico',
      'flower', 'astrophytum', 'pachypodium', 'growagarden', 'microgrowery',
      'cannabiscultivation', 'okmarijuana',
      // Collecting & hobbies
      'actionfigures', 'marvellegends', 'mcfarlanefigures', 'wwefigures',
      'currencytradingcards', 'pokemoncards', 'pokemontcg', 'spacetradingcards',
      'shells', 'pokeinvesting', 'gunpla',
      // General lifestyle
      'homeowners', 'fashionhunters', 'burningman', 'nostalgia', 'decadeology',
      'zepbound', 'porsche911', 'tacobell', 'flooring', 'boba',
      'motorcyclegear', 'japantraveltips',
      // Cannabis & substances
      'trees', 'lsd', 'microgrowery',
      // Nostalgia
      '90s', '80s',,
      // Pattern additions round 2 (178 subs)
      '80scartoons', '80sdesign', '90scartoons', '90sdesign', 'aicarart', 'airplants',
      'animationcareer', 'asianfood', 'autobody', 'autoflowers', 'autographassistance', 'autographs',
      'autoimmuneprotocol', 'automoderator', 'autopartstina', 'awardtravel', 'bandai_carddass', 'baseballcards',
      'baseballcards_vintage', 'bitcheatingcrafters', 'botanicgardens', 'car', 'caracavei', 'carcrash',
      'carcrushers2', 'cardiff', 'cardputer', 'cardsmithscurrency', 'caricatures', 'carinsuranceuk',
      'carlsjr', 'carnivore', 'carpentry', 'carquestions', 'carsaustralia', 'carspotting',
      'carsuk', 'cartoonnetwork', 'cartrackdays', 'carvana', 'characterdesign', 'craftedbyai',
      'craftit', 'crappyredesigns', 'creditcards', 'creepydesign', 'crestedsucculents', 'customtradingcard',
      'dancarlin', 'deadbydaylightfashion', 'designatedsurvivor', 'detailcraft', 'diycosplay', 'diypedals',
      'eldercare', 'electriccars', 'emofashion', 'emotionalcrafts', 'europetravel', 'expat',
      'expatfire', 'exteriordesign', 'exvegans', 'fastfood', 'financialcareers', 'foodiebeauty',
      'foodquestions', 'foodscience', 'foodvideoporn', 'footballcardz', 'forgottenfoods', 'garden',
      'gardenind', 'gardeninguk', 'gardenwildlifeuk', 'georgecarlin', 'giftcardexchange', 'goodtimeswithscar',
      'grandtheftauto', 'graphicscard', 'haircare', 'hazbinhotel', 'hitchhiking', 'homeimprovementideas',
      'hondamotorcycles', 'hotasdiy', 'indianfoodphotos', 'instructionaldesign', 'itcareerquestions', 'jewishcrafts',
      'johncarpenter', 'junkfoodfinds', 'ketodrunk', 'ketotrees', 'koreanfood', 'lafitness',
      'logodesign', 'makeupaddictionuk', 'makeupeducation', 'makeuptips', 'mensfashion', 'metalworking',
      'mexicanfood', 'mexicoexpats', 'milwaukeetool', 'motivationbydesign', 'motorcycle', 'motorcycleporn',
      'musclecar', 'namethatcar', 'nativeplantgardening', 'neutralmilkhotel', 'nichtdietagespresse', 'nickcarter',
      'nonsportcards', 'organicgardening', 'paristravelguide', 'picard', 'piratesofthecaribbean', 'planetfitnessmembers',
      'plantgoths', 'primaldiettm', 'protools', 'rarehouseplants', 'reallyweirdplants', 'redscarepod',
      'regularcarreviews', 'reincarnation', 'roestetmeinauto', 'royalcaribbean', 'sabrinacarpenterdisc', 'scarface',
      'scarystories', 'shittycarmod', 'shittytattoos', 'shortscarystories', 'skincareaddicts', 'sortedfood',
      'spooncarving', 'sportcardvalue', 'staging_succulents', 'standardamericandiet', 'stlfood', 'stonerfood',
      'superautomatic', 'supercars', 'tastyfood', 'tattoobeginners', 'tattoocoverups', 'tattooscratchers',
      'toolband', 'toolgifs', 'toolsforsale', 'topcharacterdesigns', 'tradingcards', 'travelchina',
      'travelmaps', 'u_decart_ai', 'u_decartai', 'u_sylvania_automotive', 'uk_food', 'ukfood',
      'ukgardening', 'urbancarliving', 'vegetablegardening', 'verygoodrecipes', 'vintagemotorcycles', 'vintagetraveltrailer',
      'vlandiya', 'watchcartoononline', 'whatisthisplant', 'whatplantisthis', 'whatsinyourcart', 'wild_fashion',
      'woodycraft', 'workout', 'workoutroutines', 'workouts',
      // Bulk categorized additions
      'cleetusmcfarland', 'ebayuk', 'realtesla', 'badfoodporn', 'qantasfrequentflyer', 'energydrinks',
      'neca', 'incense', 'haworthia', 'legoleak', 'tools', 'dahlias',
      'dashcams', 'lithops', 'hibiscus', 'carav', 'dentures', 'chesscom',
      'tattooadvice', 'legocirclejerk', 'seafood', 'drivinguk', 'guns', 'weed',
      'diyuk', 'arborists', 'cactusandsucculents', 'matureplants', 'audi', 'bmwgs',
      'roses', 'friendsinbloom', 'customactionfigures', 'expats', 'tressless', 'conophytum',
      'garageporn', 'gijoeclassifiedseries', 'buyitforlife', '90sand2000snostalgia', 'plants', 'civic',
      'dmt', 'coolcollections', 'rolex', 'homemaintenance', 'whatnotapp', 'landscaping',
      'idiotswithguns', 'vanlife', 'psychonaut', 'foodies_sydney', 'vaping', 'smithandwesson',
      'classiccars', 'japanesefood', 'apartmentliving', 'legocastles', 'cartalkuk', 'keto_food',
      'onlycacs', 'porsche', 'puzzles', 'vexillology', 'lightningcollection', 'countertops',
      'innout', 'vhs', '70s', '2000snostalgia', 'lawncare', 'grilling',
      'bathrooms', 'strangeplants', 'knifemaking', 'weirdwheels', 'whatisthiscar', 'dogadvice',
      'cleaningtips', 'top_food', 'vagabond', 'euphorbiasandcaudex', 'gasteria', 'lophophora',
      'remarkabletablet', 'crtgaming', 'shortwave', 'smoothies', 'steak', 'plantidentification',
      'sandwiches', 'vaporents', 'carnivorediet', 'whatcarshouldibuy', 'dorstenia', 'wierdplants',
      'qantasairways', 'travelagents', 'homebrewing', 'legopirates', 'rawmeat', 'pointstravel',
      'roastmycar', 'magnetfishing', 'singaporeairlines', 'teslamodel3', 'craftymighty', 'puzzle',
      'dumplings', 'pho', 'eggs', 'appliancerepair', 'psychedelics', 'vintagetees',
      'trains', 'plantclinic', 'beer', 'curlyhairuk', 'mushroomid', 'hvacadvice',
      'cereal', 'firewood', 'nolawns', 'electrical', 'gothplants', 'plantsandpots',
      'ariocarpus', 'oldinternetculturev2', 'preppers', 'home', 'pestcontrol', 'hookah',
      'plantbaseddiet', 'renovations',
    ]
  },
  
  social: {
    label: 'Social & Community',
    subs: [
      // Discussion
      'casualconversation', 'askreddit', 'nostupidquestions', 'showerthoughts',
      'doesanybodyelse', 'changemyview', 'crazyideas', 'howtonotgiveafuck',
      'tipofmytongue', 'quotes', 'makenewfriendshere', 'tooafraidtoask',
      'isitbullshit', 'questions', 'morbidquestions', 'trueaskredddit',
      'asksciencefiction', 'askouija', 'shittyaskscience', 'whatisthisthing',
      'whatisit', 'wewantplates', 'masterhacker',
      // Relationships
      'relationships', 'relationship_advice', 'dating_advice', 'breakups',
      'dating', 'tinder', 'okcupid', 'r4r', 'longdistance', 'sex',
      'seduction', 'nofap', 'deadbedrooms', 'polyamory', 'weddingplanning',
      'socialskills', 'socialengineering',
      // Family & Parenting
      'parenting', 'daddit', 'babybumps', 'beyondthebump', 'mommit',
      'childfree', 'raisedbynarcissists', 'justnomil', 'justnofamily',
      // Advice & Support
      'advice', 'relationship_advice', 'legaladvice', 'bestoflegaladvice',
      'amitheasshole', 'mechanicadvice', 'toastme', 'needadvice',
      'depression', 'suicidewatch', 'anxiety', 'foreveralone', 'offmychest',
      'socialanxiety', 'trueoffmychest', 'unsentletters', 'rant',
      'mentalhealth', 'adhd', 'bipolar',
      // Positive
      'wholesome', 'mademesmile', 'humansbeingbros', 'happycryingdads',
      'humansbeingbros', 'happycrowds', 'sportsarefun', 'gatesopencomeonin',
      'congratslikeimfive',
      // LGBT
      'lgbt', 'gaybros', 'actuallesbians', 'gaymers', 'bisexual',
      'askgaybros', 'ainbow', 'gay', 'gay_irl', 'asktransgender',
      'transgender',
      // Stories
      'tifu', 'self', 'confession', 'fatpeoplestories', 'confessions',
      'storiesaboutkevin', 'pettyrevenge', 'prorevenge', 'nuclearrevenge',
      'maliciouscompliance',
      // Communities
      'teenagers', 'introvert', 'totallynotrobots', 'teachers',
      'aliensamongus', 'neverbrokeabone', 'tall',
      // Regional & country communities
      'sweden', 'europe', 'de', 'ich_iel', 'france', 'colombia', 'munich',
      'ireland', 'denmark', 'germany', 'austria', 'wien', 'scotland',
      'casualuk', 'casualireland', 'illinois', 'chattanooga', 'oakland',
      'texas', 'indiana', 'houston', 'minnesota', 'michigan',
      'northcarolina', 'oregon', 'sacramento', 'nyc', 'annarbor',
      'providence', 'bogota', 'yurop', 'ameristralia', 'unket',
      'shitrentals',
      // Ask communities
      'asktheworld', 'askanything', 'askuk', 'askbrits', 'askanaustrailian',
      'askoldpeople', 'askmenover30', 'askus', 'askfrance', 'askireland',
      'askagerman',
      // Generational & identity
      'unpopularopinion', 'trueunpopularopinion', 'amioverreacting',
      'genx', 'adulting', 'genz', 'xennials', 'generationjones',
      'generationology', 'randomthoughts', 'deepthoughts', 'the10thdentist',
      'complaints', 'amitheangel', 'selfie', 'iama',
      // Religion & belief
      'truechristian', 'christianity', 'atheism', 'judaism',
      'antitheistcheesecake',
      // Mental health additions
      'autism', 'cptsd', 'problemgambling', 'blatantmisogyny',
      'anticonsumption',
      // LGBT
      'traaaaaaannnnnnnnnns2',
      // Discussion
      'discussionzone', 'allthequestions',
      // Additional social
      'aitah', 'entertainment', 'starterpacks', 'combatfootage',
      // Bulk categorized additions
      'askanaustralian', 'ask', 'help', 'guysbeingdudes', 'dallas', 'bald',
      'columbiamo', 'askmen', 'bumble', 'wouldyourather', 'ama', 'christian',
      'australia', 'askchina', 'bible', 'askchicago', 'freecompliments', 'arethestraightsok',
      'hypotheticalsituation', 'bestofredditorupdates', 'twohottakes', 'life', 'nicegirls', '40something',
      'britishproblems', 'australian', 'egg_irl', 'millennials', 'legaladviceuk', 'introvertmemes',
      'bullcity', 'me_irlgbt', 'twoxchromosomes', 'seriousconversation', 'transtimelines', 'askachristian',
      'dublin', 'london', 'toronto', 'ohio', 'eczemauk', 'alabama',
      'cochlearimplants', 'sdsu', 'askindia', 'irvine', 'petpeeves', 'austin',
      'fragreddit', 'yorkshire', 'longcovid', 'selfimprovement', 'askabrit', 'ontario',
      'connecticut', 'getdisciplined', 'askgermany', 'trans', 'amiwrong', 'detroit',
      'pennsylvania', 'askto', 'askdfw', 'health', 'newtoreddit', 'badroommates',
      'edanonymous', 'askcanada', 'plano', 'losangeles', 'traaaaaaaaaaaansbians', 'zillennials',
      'askfeminists', 'wisconsin', 'dermatologyquestions', 'oklahoma', 'askeurope', 'askaustria',
      'asklatinamerica', 'northernireland', 'choosingbeggars', 'asksweddit', 'hygiene', 'askmenadvice',
      'georgia', 'minneapolis', 'liverpool', 'dpdr', 'california', 'asksocialists',
      'chicago', 'iowa', 'polska', 'askaliberal', 'nova', 'columbus',
      'ukraine', 'asthma', 'huddersfield', 'santiago', 'kenya', 'unitedkingdom',
      'sanantonio', 'poland', 'malaysia', 'tinnitus', 'huntsvillealabama', 'auslegal',
      'iceland', 'chile', 'woundcare', 'newbrunswickcanada', 'monterrey', 'bayarea',
      'eugene', 'sandiego', 'prostatecancer', 'toddlers', 'turkey', 'sydney',
      'rhodeisland', 'cincinnati', 'bi_irl', 'berlin', 'paris', 'autisticcreatives',
      'maine', 'deaf', 'finland', 'medellin', 'woodbridgeva', 'infp',
      'gifted', 'reno', 'transytalk', 'florida', 'howislivingthere', 'sheffield',
      'redditforgrownups', 'anxietymemes', 'maryland', 'askacanadian', 'massachusetts', 'newjersey',
      'insaneparents', 'parents', 'amithejerk', 'concussion', 'catholicism', 'elsalvador',
      // Pattern-based additions (122 subs)
      'adhdireland', 'adventism', 'adventurers', 'adviceforteens', 'alaska', 'animaladvice',
      'appearanceadvice', 'applehelp', 'askanamerican', 'askarussian', 'askashittymechanic', 'askbaking',
      'askbattlestations', 'askbelgium', 'askblackpeople', 'askcarguys', 'askcomicbooks', 'askcomputerscience',
      'askdogowners', 'askeconomics', 'askelectricians', 'askfitness', 'askfitnessindia', 'askforanswers',
      'asklinguistics', 'asklondon', 'askmath', 'askmeanythingianswer', 'askmec', 'askmechanics',
      'askmoderators', 'askmusicians', 'asknordics', 'askoldpeopleadvice', 'askphysics', 'askprogramming',
      'askredditafterdark', 'askredditespanol', 'askredditfood', 'asksciencediscussion', 'asksf', 'asksocialscience',
      'asksouthafrica', 'askteachers', 'askvet', 'askwomen', 'aslhelp', 'autism_parenting',
      'autisminwomen', 'autismuk', 'autotransportopia', 'awkwardfamilyphotos', 'basketballcards', 'beardadvice',
      'benefitsadviceuk', 'career_advice', 'casual_conversation', 'casualiama', 'casualknitting', 'casualnewworldorder',
      'catadvice', 'coventry', 'covid19_support', 'cracksupport', 'crochethelp', 'currentevents',
      'datingoverfifty', 'dynastyfftradeadvice', 'ebayselleradvice', 'environmental_science', 'environmentalism', 'exadventist',
      'familyfeud', 'fo76filthycasuals', 'griefsupport', 'gymhelp', 'hairdyehelp', 'hairstyleadvice',
      'headphoneadvice', 'helpmefind', 'helpmefindthis', 'huntertheparenting', 'instagramsupport', 'kidmental',
      'lawyeradvice', 'legaldogadvice', 'legoindyogadventures', 'lgbt_superheroes', 'looksmaxingadvice', 'manualtransmissions',
      'medical_advice', 'mensfashionadvice', 'modern_family', 'modevents', 'modhelp', 'nrelationships',
      'onlinedating', 'parentingfr', 'pchelp', 'playeruphelp', 'r6siegefashionadvice', 'reddithelp',
      'relationships_advice', 'santaslittlehelpers', 'shittyaskhistory', 'shittyaskreddit', 'stereoadvice', 'suicidebywords',
      'theadventuresoftintin', 'transcription', 'transhumanism', 'transit', 'transitturkey', 'translator',
      'transmogrification', 'transportopia', 'transteens', 'trueaskreddit', 'vent', 'weightlossadvice',
      'windowshelp', 'worldevents',
      // Round 2 additions
      'canada', 'jewishleft',
      'debateanatheist', 'melbourne',
    ]
  },
  
  humor: {
    label: 'Humor & Memes',
    subs: [
      // General humor
      'funny', 'humor', 'contagiouslaughter', 'standupcomedy',
      'prematurecelebration', 'childrenfalling over', 'dadreflexes',
      'stepdadreflexes', 'kenm', 'notkenm', 'politicalhumor',
      'accidentalcomedy', 'funnyandsad', 'kidsarefuckingstupid',
      'suspiciouslyspecific', 'oddlyspecific', 'rimjob_steve',
      'dark_humor', 'darkhumorandmemes', 'darkjokes',
      // Interesting/Viral
      'interestingasfuck', 'damnthatsinteresting', 'interesting', 'bigfoot',
      // Comedy
      'comedycemetery', 'comedyheaven', 'comedynecromancy',
      'comedyhomicide', 'comedynecrophilia',
      // Jokes
      'jokes', 'dadjokes', 'standupshots', 'punny', 'antijokes',
      'meanjokes', '3amjokes', 'puns', 'wordavalanches',
      // Memes
      'memes', 'dankmemes', 'me_irl', 'meirl', 'wholesomememes',
      'prequelmemes', 'lotrmemes', 'animemes', 'historymemes',
      'dankchristianmemes', 'freefolk', 'thanosdidnothingwrong',
      'gameofthronesmemes', 'asongofmemesandrage', 'sequelmemes',
      'empiredidnothingwrong', 'bertstrips', 'boottoobig',
      // Twitter
      'blackpeopletwitter', 'whitepeopletwitter', 'scottishpeopletwitter',
      'wholesomebpt', 'latinopeopletwitter',
      // Specific comedy
      'facepalm', 'cringe', 'cringepics', 'instant_regret',
      'blunderyears', 'fatlogic', 'publicfreakout', 'actualpublicfreakouts',
      'lewronggeneration', 'fellowkids', 'sadcringe', 'corporatefacepalm',
      '4panelcringe', 'instantbarbarians', 'watchpeopledieinside',
      'technicallythetruth', 'accidentalracism', 'engrish', 'wokekids',
      'masterhacker', 'cringetopia', 'holup', 'agedlikemilk',
      'tiktokcringe',
      // Additional humor & viral
      'antimeme', 'antimemes', 'therewasanattempt', 'mildlyinfuriating',
      'nextfuckinglevel', 'whenthe', 'cringetiktoks', 'wellthatsucks',
      'clevercomebacks', 'murderedbywords', 'beamazed', 'mildlyinteresting',
      'thathappened', 'wtf', 'chaoticgood', 'peterexplainsthejoke',
      'explainthejoke', 'siptea', 'whatcouldgowrong', 'oddlysatisfying',
      'unexpected', 'adviceanimals', 'confidentlyincorrect', 'thatsinsane',
      'boomersbeingfools', 'funnymemes', 'shitamericanssay', 'stupidfood',
      'bandnames', 'satisfyingasfuck', 'fuckimold', 'oldschoolcool',
      'absoluteunits', 'oddlyterrifying', 'terrifyingasfuck',
      'maybemaybemaybe', 'nonononoyes', 'nothowgirlswork',
      'pointlesslygendered', 'lobotomyposting', 'shitposting', 'meme',
      'mapporncirclejerk', 'notinteresting', 'greatbritishmemes',
      'deutschememes', 'tragedeigh', 'crazyfuckingvideos',
      'stupidquestions', 'roastme', 'noshtisherlock',
      'philosophymemes', 'ichbin40undschwurbler', 'copypasta_es',
      // Bulk categorized additions
      'amazing', 'creepy', 'thewordfuck', 'weird', 'nonsense', 'texts',
      'explainitpeter', 'rareinsults', 'idiocracy', 'thanksimcured', 'sweatypalms', 'justfuckmyshitup',
      'humorinpoortaste', 'madlads', 'iamthemaincharacter', 'tooktoomuch', 'abruptchaos', 'funnysigns',
      'cursedcomments', 'doppelganger', 'trashy', 'instantkarma', 'justiceporn', 'iamverybadass',
      'crappydesign', 'blursedimages', 'aboringdystopia', 'bonehurtingjuice', 'winstupidprizes', 'blursed_videos',
      'thalassophobia', 'liminalspace', 'pareidolia', 'blackmagicfuckery', 'atbge', 'lifeprotips',
      'bossfights', 'yesyesyesno', 'glowups', 'trollcoping', 'skamtebord', 'reactiongifs',
      'damnthatsreal', 'woahdude', 'im14andthisisdeep', 'holdmycosmo', 'confusing_perspective', 'quityourbullshit',
      'megalophobia', 'justneckbeardthings', 'bossfight', 'assholedesign', 'havewemet', 'urbanhell',
      // Pattern-based additions (192 subs)
      '90dayfiance_fb_memes', 'adhdmeme', 'afceastmemewar', 'aidankmemes', 'ancient_history_memes', 'animalmemes',
      'antimoneymemes', 'asoiafcirclejerk', 'atla_circlejerk', 'ausmemes', 'austincirclejerk', 'awwtf',
      'awwwtf', 'badfacebookmemes', 'badmemes', 'baseballcirclejerk', 'basscirclejerk', 'beatlescirclejerk',
      'bestconspiracymemes', 'bicyclingcirclejerk', 'blessedimages', 'bloxymemes', 'bollywoodmemes', 'bookscirclejerk',
      'boxingcirclejerk', 'brexitmemes', 'britishmemes', 'bundesligacirclejerk', 'carcirclejerk', 'carscirclejerk',
      'catmemes', 'cfbmemes', 'chessmemes', 'christianmemes', 'circlejerk', 'circlejerkauscorp',
      'circlejerkaustralia', 'circlejerknyc', 'civmemes', 'climatememes', 'climateshitposting', 'clonewarsmemes',
      'cmpunk', 'cookingcirclejerk', 'corporatetrolling', 'couplememes', 'cringeofthering', 'cringereels',
      'cringevideo', 'crusadememes', 'cryptocurrencymemes', 'cursedai', 'cursedimages', 'daftpunk',
      'damnfunny', 'dankleft', 'dankmark', 'dankprecolumbianmemes', 'dankruto', 'dankvideos',
      'dbzmemes', 'ddlccirclejerk', 'deadmemes', 'decadeologycirclejerk', 'denvercirclejerk', 'depressionmemes',
      'desimemes', 'dogmemes', 'doomercirclejerk', 'duolingomemes', 'economicsmemes', 'edanonymemes',
      'epicartmemes', 'espressocirclejerk', 'f1meme', 'fiberartscirclejerk', 'firstrespondercringe', 'fnafcringe',
      'frenchmemes', 'frostpunk', 'fuckwasps', 'funnygifs', 'funnyvideos', 'garlicbreadmemes',
      'gaysoundsshitposts', 'generationscirclejerk', 'geographymemes', 'gigachadmemecoin', 'giscardpunk', 'grimdank',
      'guitarmemes', 'gymmemes', 'hellsomememes', 'hermeticmemes', 'hermitcraftmemes', 'hilariouscringe',
      'hiphopcirclejerk', 'houseplantscirclejerk', 'humornama', 'hunterxdank', 'impracticaljokers', 'indiameme',
      'indiamemes', 'indianmemer', 'indieheadscirclejerk', 'invinciblememes', 'jewdank', 'joker',
      'jokercringe', 'jurassicmemes', 'justmemesforus', 'kimetsunoyaibamemes', 'knowyourmeme', 'lgbtmemes',
      'literaturememes', 'lolokbro', 'lovememes', 'mathjokes', 'mathsmeme', 'memefrancais',
      'memehunter', 'memepiece', 'memes_of_the_dank', 'memesenespanol', 'memesopdidnotlike', 'memesthatucanrepost',
      'memetallica', 'memetemplatesofficial', 'memethisthing', 'memeyourenthusiasm', 'motodank', 'naturebeingfunny',
      'nbamemes', 'nbawestmemewar', 'newvegasmemes', 'nfcsouthmemewar', 'nfcwestmemewar', 'nincirclejerk',
      'ocdmemes', 'onejoke', 'pessi_memes', 'physicsmemes', 'politicalmeme', 'popheadscirclejerk',
      'programminghumor', 'programmingmemes', 'psychologymemes', 'pundarblocket', 'punk', 'punk_rock',
      'punlawyers', 'punpatrol', 'qanonmemes', 'relatable_memes_', 'roastmypet', 'rolexcirclejerk',
      'roughromanmemes', 'rpdrcringe', 'satireliketheonion', 'scienceshitposts', 'seinfeldshitposting', 'servicedogscirclejerk',
      'shitmemers', 'shitpostersofscience', 'slopcorecirclejerk', 'stardewmemes', 'starfieldmemes', 'steelydancirclejerk',
      'stellarismemes', 'stoicmemes', 'strangeandfunny', 'strangerthingsmemes', 'synthesizercirclejerk', 'thegreatmemereset_',
      'thememeryremains', 'therightcantmeme', 'trainmemes', 'trollxchromosomes', 'trumproasts', 'twinpeakscirclejerk',
      'twittercringe', 'vexillologycirclejerk', 'warthundermemes', 'whatisitcirclejerk', 'workmemes', 'worldbuildingmemes',
      'worldofdankmemes', 'wtfart', 'wtfdidijustread', 'wwememes', 'xrpunite', 'yomamajokes',
      // Round 2 additions
      'fightporn', 'captionthis', 'bombing', 'namethissthing', 'answers',
      'abandonedporn', 'evilbuildings', 'iamatotalpieceofshit', 'justiceserved', 'coaxedintoasnafu', 'silmarillionmemes',
      'simpsonsshitposting', 'perfectlycutscreams', 'memevideos', 'gatekeeping', 'totallylookslike', 'moviememes',
      'notliketheothergirls', 'imthemaincharacter', 'misleadingthumbnails', 'gifsound', 'menwritingwomen', 'picsthatgohard',
      'unethicallifeprotips', 'hmmm', '13or30', 'shittylifeprotips', 'foundsatan', 'sbubby',
      'dontyouknowwhoiam', 'yesyesyesyesno',
    ]
  },
  
  animals: {
    label: 'Animals & Pets',
    subs: [
      // Cute
      'aww', 'eyebleach', 'rarepuppers', 'awwducational',
      // General animal
      'animalsbeingjerks', 'animalsbeingbros', 'animalporn',
      'animalsbeingderps', 'likeus', 'stoppedworking', 'hitmanimals',
      'animaltextgifs', 'beforenafteradoption', 'sneks', 'tsunderesharks',
      'whatsthisbug', 'hybridanimals', 'zoomies', 'brushybrushy',
      'bigboye', 'curledfeetsies', 'mlem', 'floof', 'shittyanimalfacts',
      'animalsthatlovemagic', 'spiderbro', 'properanimalnames',
      'reverseanimalrescue', 'animalsdoingstuff', 'sploot',
      // Birds
      'birdswitharms', 'superbowl', 'birbs', 'partyparrot',
      'birdsbeingdicks', 'emuwarflashbacks', 'birdsarentreal', 'birdpics',
      // Mammals
      'babyelephantgifs', 'sloths', 'foxes', 'trashpandas',
      'happycowgifs', 'rabbits', 'goatparkour', 'bearsdoinghumanthings',
      // Cats
      'cats', 'startledcats', 'catpictures', 'catsstandingup',
      'catpranks', 'meow_irl', 'holdmycatnip', 'catslaps',
      'thecatdimension', 'babybigcatgifs', 'catloaf', 'thisismylifemeow',
      'cattaps', 'teefies', 'tuckedinkitties', 'catsareassholes',
      'catsisuottatfo', 'stuffoncats', 'bigcatgifs', 'jellybeantoes',
      'catsareliquid', 'catgifs', 'blackcats', 'supermodelcats',
      'chonkers', 'tightpussy', 'catswithjobs', 'catswhoyell',
      'whatswrongwithyourcat', 'illegallysmolcats',
      // Dogs
      'dogs', 'dogpictures', 'dogtraining', 'woof_irl',
      'whatswrongwithyourdog', 'dogberg', 'dogswithjobs',
      'masterreturns', 'barkour', 'blop', 'puppysmiles', 'puppies',
      'petthedamndog', 'corgi', 'pitbulls', 'goldenretrievers',
      'incorgnito', 'babycorgis', 'rarepuppers', 'husky',
      // Nature
      'earthporn', 'hardcoreaww', 'natureisfuckinglit', 'heavyseas',
      'natureismetal', 'natureisbrutal', 'naturewasmetal',
      'weathergifs', 'tropicalweather',
      // Additional animals
      'oneorangebraincell', 'velvethippos', 'funnyanimals',
      'petsareamazing', 'birds', 'birding',
      // Bulk categorized additions
      'animalid', 'ukbirds', 'pugs', 'elephants', 'awww', 'staffordbullterriers',
      'namemycat', 'snakes', 'dogvideos', 'cartoons', 'bengalcats', 'norwegianforestcats',
      'renalcats', 'funnycats', 'orangecats', 'seagulls', 'hardcorenature', 'animals',
      'animalsbeingfunny', 'opossums', 'dogsbeingderps', 'kittens', 'insects', 'oceans',
      'bigcats', 'animal', 'cockatiel', 'cathelp', 'jellyfish', 'leaves',
      // Pattern-based additions (74 subs)
      'animalbased', 'animalsbeinggeniuses', 'animalsbeingmoms', 'animalsbeingstrange', 'animalsonreddit', 'australianbirds',
      'babyanimals', 'badassanimals', 'battlecats', 'beautifulnatureseen', 'birdfeeding', 'birdwatching',
      'birdwatchinguk', 'cat', 'catbellies', 'catculations', 'catdistributionsystem', 'catmuffins',
      'catsarealiens', 'cattle', 'cattyinvestors', 'catwoman', 'councilofcats', 'cute_animals',
      'cutedogsreddit', 'dog', 'doggrooming', 'dogowners', 'dogsarepeopletoo', 'fishdom',
      'fishingforbeginners', 'fosterdogs', 'gatcat', 'herpetology', 'hotdogs', 'idmydog',
      'kitten', 'learningtocat', 'longcats', 'medievalcats', 'namemydog', 'namemypet',
      'natureisbeautiful', 'natureisfuckingcute', 'natureporn', 'naturestemper', 'notmycat', 'oldmandog',
      'pallascats', 'petdoves', 'petfree', 'petnames', 'pets', 'petsgo',
      'pimpcats', 'pipetobacco', 'prematuretruncation', 'saltwaterfishing', 'seniorcats', 'siamesecats',
      'sillycats', 'standardfrenchbulldog', 'talesfromthedoghouse', 'tierzoo', 'u_sea-signature-1496', 'ukwildlife',
      'unorthodog', 'untoldwildlifestories', 'uppiesappeasecats', 'whatbreedismydog', 'whatkindofdogisthis', 'zoology',
      'zoomexglobalexchange', 'zootopia',
      'birdsfacingforward', 'voidcats', 'fish', 'tuxedocats', 'whatsthisbird', 'catsbeingcats',
      'spiders', 'beardeddragons', 'jumpingspiders', 'catbreeds', 'catsallday', 'blurrypicturesofcats',
      'dachshund', 'pigeon',
    ]
  },
  
  internet: {
    label: 'Internet Culture',
    subs: [
      // Platforms
      'tumblrinaction', 'tumblr', 'oldpeoplefacebook', 'facebookwins',
      'indianpeoplefacebook', 'terriblefacebookmemes', 'insanepeoplefacebook',
      'instagramreality', 'internetstars', 'tiktokcringe', 'tiktokthots',
      'tiktoknsfw', 'tiktokporn', 'discordapp', 'snaplenses',
      'shortcuts', 'scams', 'crackheadcraigslist',
      // 4chan
      '4chan', 'classic4chan', 'greentext',
      // YouTube
      'youtubehaiku', 'youtube', 'youngpeopleyoutube', 'deepintoyoutube',
      'nottimanderic', 'gamegrumps', 'h3h3productions', 'cgpgrey',
      'yogscast', 'jontron', 'idubbbz', 'defranco', 'cynicalbrit',
      'pyrocynical', 'sovietwomble', 'redlettermedia', 'videogamedunkey',
      'loltyler1', 'ksi', 'miniladd', 'jacksepticeye',
      'pewdiepiesubmissions', 'pewdiepie', 'roosterteeth', 'funhaus',
      'rwby', 'cowchop',
      // Streaming
      'twitch', 'livestreamfail',
      // Podcasts
      'serialpodcast', 'podcasts',
      // Internet culture
      'internetisbeautiful', 'creepyPMs', 'web_design', 'google',
      'bannedfromclubpenguin', 'savedyouaclick', 'bestofworldstar',
      'robinhood', 'kotakuinaction', 'wikileaks',
      // Additional internet culture
      'asmongold', 'fauxmoi', 'popculturechat', 'curatedtumblr',
      'nonpoliticaltwitter', 'reckful', 'pics', 'videos', 'gifs',
      'modsupport', 'modcoord', 'redditipo', 'subreditdrama',
      'blueskyskeets', 'mntrolls', 'cursedguns',
      'uktrains',
      // Bulk categorized additions
      'subredditdrama', 'reddit.com', 'datguylirik', 'watchfuleyesbot', 'no', 'lol',
      'pinterest', 'mitchjones', 'instagram', 'redditrequest', 'modnews', 'redditsafety',
      'bestof', 'lostredditors', 'travisandtaylor', 'fixedbytheduet', 'save3rdpartyapps', 'redditgetsdrawnbadly',
      'ludwigahgren', 'fridgedetective', 'redditonwiki', 'fundiesnarkuncensored', 'elizabetheatsnyc', 'twitter',
      'joeroganreacharound', 'shanegillis', 'theovon', 'billburr', 'redditblackout2023', 'hasan_snark',
      // Pattern-based additions (41 subs)
      'a_persona_on_reddit', 'advertisediscord', 'antisemitisminreddit', 'bannedfromdiscord', 'bestofreddit', 'bikinibottomtwitter',
      'blackpeopleofreddit', 'charlottedobreyoutube', 'discordsucks', 'discordvideos', 'fragilewhiteredditor', 'ihaveihaveihavereddit',
      'karensoftiktok', 'libsofreddit', 'lostredditor', 'negareddit', 'newreddits', 'preguntas_de_reddit_',
      'preguntasreddit', 'promotereddit', 'realtwitteraccounts', 'reddit', 'redditalternatives', 'redditbothunters',
      'redditcrimecommunity', 'redditdayof', 'redditisfun', 'redditpregunta', 'redditsessions', 'reddittrophies',
      'smallyoutubechannels', 'smallyoutubers', 'smallyoutubersboost', 'subreddit_stats', 'subredditname', 'theoryofreddit',
      'trendingandviral', 'truereddit', 'wreddit', 'wredditschool', 'youngpeoplereddit',
      // Round 2 additions
      'imisstheoldidubbbz', 'gorlworldfiles', 'theregulationpod',
      'johnoliver', 'findareddit', 'hasan_piker', 'tiktok',
    ]
  }
};

export const NSFW_CATEGORIES = {
  general: {
    label: 'General Adult',
    subs: [
      'nsfw', 'nsfw2', 'nsfw_gif', 'nsfw_gifs', 'nsfw_html5', 'porn_gifs',
      'porninfifteenseconds', 'cutemo deslutmode', '60fpsporn',
      'the_best_nsfw_gifs', 'verticalgifs', 'besthqporngifs',
      'bonermaterial', 'nsfw411', 'iwanttofuckher', 'exxxtras',
      'sexybutnotporn', 'femalepov', 'omgbeckylookathiscock',
      'sexygirls', 'breedingmaterial', 'canthold', 'toocuteforporn',
      'justhotwomen', 'stripgirls', 'hotstuffnsfw', 'uncommonposes',
      'gifsofremoval', 'nostalgiafapping', 'truefmk', 'nudes', 'slut',
      'tipofmypenis', 'pornid', 'porn', 'pornvids', 'nsfw_videos',
      'nsfwhardcore', 'bodyperfection', 'samespecies'
    ]
  },
  
  amateur: {
    label: 'Amateur & Real',
    subs: [
      'realgirls', 'amateur', 'homemadexxx', 'festivalsluts',
      'collegeamateurs', 'amateurcumsluts', 'nsfw_amateurs',
      'funwithfriends', 'randomsexiness', 'amateurporn',
      'normalnudes', 'itsamateurhour', 'irlgirls', 'verifiedamateurs',
      'nsfwverifiedamateurs', 'camwhores', 'camsluts', 'streamersgonewild',
      'realsexyselfies', 'nude_selfie', 'amateurgirlsbigcocks'
    ]
  },
  
  gonewild: {
    label: 'Gonewild Community',
    subs: [
      'gonewild', 'petitegonewild', 'gonewildstories', 'gonewildtube',
      'treesgonewild', 'gonewildaudio', 'gwnerdy', 'gonemild',
      'altgonewild', 'gifsgonewild', 'analgw', 'gonewildsmiles',
      'onstagegw', 'repressedgonewild', 'bdsmgw', 'underweargg',
      'labiagw', 'tributeme', 'weddingsgonewild', 'gwpublic',
      'assholegonewild', 'leggingsgonewild', 'dykesgonewild',
      'goneerotic', 'snapchatgw', 'gonewildhairy', 'gonewildtrans',
      'gonwild', 'ratemynudebody', 'gonewild30plus', 'gonewild18',
      'onmww', '40plusgonewild', 'gwcouples', 'gonewildcouples',
      'gwcumsluts', 'wouldyoufuckmywife', 'couplesgonewild',
      'gonewildcurvy', 'gonewildplus', 'bigboobsgw', 'bigboobsgonewild',
      'mycleavage', 'gonewildchubby', 'asiansgonewild', 'gonewildcolor',
      'indiansgonewild', 'latinasgw', 'pawgtastic', 'workgonewild',
      'gonewildscrubs', 'swingersgw', 'militarygonewild',
      'ladybonersgw', 'massivecock', 'gaybrosgonewild'
    ]
  },
  
  bodyParts: {
    label: 'Body Features',
    subs: [
      // Ass
      'ass', 'asstastic', 'facedownassup', 'assinthong', 'bigasses',
      'buttplug', 'theunderbun', 'booty', 'pawg', 'paag',
      'cutelittlebutts', 'hipcleavage', 'frogbutt', 'hungrybutts',
      'cottontails', 'lovetowatchyouleave', 'celebritybutts',
      'cosplaybutts', 'whooties', 'booty_queens', 'twerking',
      // Anal
      'anal', 'analgw', 'painal', 'masterofanal', 'buttsharpies',
      // Asshole
      'asshole', 'assholebehindthong', 'assholegonewild', 'spreadem',
      'godasshole',
      // Boobs
      'boobies', 'tittydrop', 'boltedontits', 'boobbounce', 'boobs',
      'downblouse', 'homegrowntits', 'cleavage', 'breastenvy',
      'youtubetitties', 'torpedotits', 'thehangingboobs',
      'page3glamour', 'fortyfivefiftyfive', 'tits', 'amazingtits',
      'titstouchingtits', 'bustypetite', 'hugeboobs', 'stacked',
      'burstingout', 'bigboobsgw', 'bigboobsgonewild', '2busty2hide',
      'bigtiddygothgf', 'engorgedveinybreasts', 'bigtitsinbikinis',
      'biggerthanherhead', 'pokies', 'ghostnipples', 'nipples',
      'puffies', 'lactation', 'tinytits', 'aa_cups', 'titfuck',
      'clothedtitfuck',
      // Legs & Feet
      'girlsinyogapants', 'yogapants', 'stockings', 'legs',
      'tightshorts', 'tight_shorts', 'buttsandbarefeet', 'feet',
      'datgap', 'thighhighs', 'thickthighs', 'thighdeology',
      // Pussy
      'pussy', 'rearpussy', 'innie', 'simps', 'pelfie', 'labiagw',
      'godpussy', 'presenting', 'cameltoe', 'hairypussy',
      'pantiestotheside', 'breakingtheseal', 'moundofvenus', 'pussymound',
      // Other
      'hotchickswithtattoos', 'sexyfrex', 'tanlines', 'oilporn',
      'complexionexcellence', 'sexytummies', 'theratio', 'braceface',
      'girlswithneonhair', 'shorthairchicks', 'blonde'
    ]
  },
  
  bodyType: {
    label: 'Body Types',
    subs: [
      'athleticgirls', 'coltish', 'fitgirls', 'fitnakedgirls',
      'curvy', 'gonewildcurvy', 'gonewildplus', 'thick', 'juicyasians',
      'voluptuous', 'biggerthanyouthought', 'jigglefuck', 'chubby',
      'slimthick', 'massivetitsnass', 'thicker', 'thickthighs',
      'tightsqueeze', 'casualjiggles', 'bbw', 'gonewildchubby',
      'amazingcurves', 'bustypetite', 'dirtysmall', 'petitegonewild',
      'xsmallgirls', 'funsized', 'hugedicktinychick', 'petite', 'skinnytail'
    ]
  },
  
  ethnicity: {
    label: 'Ethnicity',
    subs: [
      'damngoodinterracial', 'asianhotties', 'asiansgonewild',
      'realasians', 'juicyasians', 'asiannsfw', 'nextdoorasians',
      'asianporn', 'bustyasians', 'paag', 'indianbabes',
      'indiansgonewild', 'nsfw_japan', 'javdownloadcenter',
      'kpopfap', 'nsfw_korea', 'womenofcolor', 'darkangels',
      'blackchickswhitedicks', 'ebony', 'afrodisiac', 'ginger',
      'redheads', 'latinas', 'latinasgw', 'latinacuties',
      'palegirls', 'pawg', 'snowwhites', 'whooties'
    ]
  },
  
  age: {
    label: 'Age Groups',
    subs: [
      'milf', 'gonewild30plus', 'preggoporn', 'realmoms',
      'agedbeauty', '40plusgonewild', 'maturemilf', 'legalteens',
      'collegesluts', 'adorableporn', 'legalteensxxx', 'gonewild18',
      '18_19', 'just18', 'pornstarlethq', 'fauxbait', 'barelylegalteens'
    ]
  },
  
  acts: {
    label: 'Sexual Acts',
    subs: [
      // Oral
      'blowjobs', 'lipsthatgrip', 'deepthroat', 'onherknees',
      'blowjobsandwich', 'iwanttosuckcock', 'facefuck',
      // Hardcore
      'nsfwhardcore', 'shelikesitrough', 'strugglefucking',
      'jigglefuck', 'whenitgoesin', 'outercourse', 'gangbang',
      'pegging', 'insertions', 'passionx', 'xsome', 'shefuckshim',
      'cuckold', 'cuckquean', 'breeding', 'forcedcreampie',
      'hugedicktinychick', 'amateurgirlsbigcocks', 'bbcsluts',
      // Positions
      'facesitting', 'nsfw_plowcam', 'pronebone', 'girlswhoride',
      // BDSM
      'bdsm', 'bondage', 'bdsmcommunity', 'bdsmgw', 'femdom',
      // Masturbation
      'holdthemoan', 'o_faces', 'jilling', 'gettingherselfoff',
      'quiver', 'girlshumpingthings', 'forcedorgasms', 'mmgirls',
      'ruinedorgasms', 'realahegao', 'suctiondildos', 'baddragon',
      // Cum
      'cumsluts', 'girlsfinishingthejob', 'cumfetish', 'amateurcumsluts',
      'cumcoveredfucking', 'cumhaters', 'thickloads',
      'before_after_cumsluts', 'pulsatingcumshots', 'impressedbycum',
      'creampies', 'throatpies', 'facialfun', 'cumonclothes',
      'oralcreampie', 'creampie',
      // Wet
      'grool', 'squirting'
    ]
  },
  
  outfits: {
    label: 'Clothing & Outfits',
    subs: [
      'onoff', 'nsfwoutfits', 'girlswithglasses', 'collared',
      'seethru', 'sweatermeat', 'cfnm', 'nsfwfashion', 'leotards',
      'whyevenwearanything', 'shinyporn', 'gothsluts', 'bikinis',
      'bikinibridge', 'bigtitsinbikinis', 'nsfwcosplay',
      'nsfwcostumes', 'girlsinschooluniforms', 'wtsstadam it',
      'tightdresses', 'upskirt', 'schoolgirlskirts', 'stockings',
      'thighhighs', 'leggingsgonewild', 'bottomless_vixens',
      'tightshorts', 'tight_shorts', 'girlsinyogapants', 'yogapants',
      'lingerie', 'pantiestotheside', 'assinthong', 'assholebehindthong'
    ]
  },
  
  kinks: {
    label: 'Specific Kinks',
    subs: [
      'bdsm', 'bondage', 'kinky', 'fetish', 'freeuse', 'fuckdoll',
      'degradingholes', 'fuckmeat', 'incestporn', 'wincest',
      'incest_gifs', 'dirtypenpals', 'dirtysnapchat', 'dirtykikpals',
      'distension', 'bimbofetish', 'christiangirls', 'dirtygaming'
    ]
  },
  
  animated: {
    label: 'Animated & Drawn',
    subs: [
      'rule34', 'ecchi', 'futanari', 'doujinshi', 'yiff', 'furry',
      'monstergirl', 'rule34_comics', 'sex_comics', 'hentai',
      'hentai_gif', 'westernhentai', 'hentai_irl', 'traphentai',
      'hentaibondage', 'overwatch_porn', 'pokeporn', 'bowsette',
      'rule34lol', 'rule34overwatch'
    ]
  },
  
  orientation: {
    label: 'Orientation Specific',
    subs: [
      'lesbians', 'straightgirlsplaying', 'girlskissing', 'mmgirls',
      'dykesgonewild', 'justfriendshavingfun',
      'ladybonersgw', 'massivecock', 'chickflixxx', 'gaybrosgonewild',
      'sissies', 'penis', 'monsterdicks', 'thickdick',
      'tgirls', 'traps', 'futanari', 'gonewildtrans', 'tgifs',
      'shemales', 'femboys', 'transporn'
    ]
  },
  
  celebrity: {
    label: 'Celebrity & Athletes',
    subs: [
      'volleyballgirls', 'ohlympics', 'celebnsfw', 'watchitfortheplot',
      'nsfwcelebarchive', 'celebritypussy', 'oldschoolcoolnsfw',
      'extramile', 'jerkofftocelebs', 'celebritybutts', 'onoffcelebs',
      'celebswithbigtits', 'youtubersgonewild'
    ]
  },
  
  professionals: {
    label: 'Professional & Sites',
    subs: [
      'suicidegirls', 'girlsdoporn', 'pornstarhq', 'porninaminute',
      'remylacroix', 'anjelica_ebbi', 'blancnoir', 'rileyreid',
      'tessafowler', 'lilyivy', 'mycherrycrush', 'gillianbarnes',
      'emilybloom', 'miamalkova', 'sashagrey', 'angelawhite',
      'miakhalifa', 'alexapearl', 'missalice_18', 'lanarhoades',
      'evalovia', 'giannamichaels', 'erinashford', 'sextrophies',
      'sabrina_nichole', 'liyasilver', 'melissadebling',
      'adrianachechik', 'abelladanger'
    ]
  },
  
  social: {
    label: 'Social Media',
    subs: [
      'nsfw_snapchat', 'snapchat_sluts', 'snapleaks',
      'socialmediasluts', 'slutsofsnapchat', 'onlyfans101',
      'tiktoknsfw', 'tiktokthots', 'tiktokporn'
    ]
  },
  
  public: {
    label: 'Public & Exhibitionism',
    subs: [
      'changingrooms', 'workgonewild', 'flashinggirls',
      'publicflashing', 'sexinfrontofothers', 'notsafefornature',
      'gwpublic', 'realpublicnudity', 'flashingandflaunting',
      'publicsexporn', 'nakedadventures'
    ]
  },
  
  other: {
    label: 'Miscellaneous',
    subs: [
      'happyembarrassedgirls', 'unashamed', 'borednignored',
      'annoyedtobenude', 'randomactsofblowjob', 'nsfwfunny',
      'pornhubcomments', 'confusedboners', 'nsfw_wtf',
      'randomactsofmuffdive', 'stupidslutsclub', 'sluttyconfessions',
      'jobuds', 'trashyboners', 'flubtrash', 'wifesharing',
      'hotwife', 'wouldyoufuckmywife', 'slutwife', 'naughtywives',
      'twingirls', 'groupofnudegirls', 'ifyouhadtopickone',
      'highresnsfw', 'nsfw_html5', '60fpsporn', 'popping', 'medicalgore'
    ]
  }
};

// Helper function to categorize a subreddit
export function categorizeSubreddit(subredditName) {
  const sub = subredditName.toLowerCase().replace(/^r\//, '').trim();
  const categories = {
    interest: null,
    leisure: null,
    nsfw: null
  };
  
  // Helper to check if subreddit matches using strict logic
  const matchesCategory = (category) => {
    return category.subs.some(s => {
      const catSub = s.toLowerCase().trim();
      return sub === catSub || sub.startsWith(catSub + '_') || sub.startsWith(catSub);
    });
  };
  
  // Check interest categories
  for (const [key, category] of Object.entries(INTEREST_CATEGORIES)) {
    if (matchesCategory(category)) {
      categories.interest = key;
      break;
    }
  }
  
  // Check leisure categories
  for (const [key, category] of Object.entries(LEISURE_CATEGORIES)) {
    if (matchesCategory(category)) {
      categories.leisure = key;
      break;
    }
  }
  
  // Check NSFW categories
  for (const [key, category] of Object.entries(NSFW_CATEGORIES)) {
    if (matchesCategory(category)) {
      categories.nsfw = key;
      break;
    }
  }
  
  return categories;
}

// Get category distribution from user data
export function getCategoryDistribution(userData, type = 'interest') {
  const allItems = [
    ...(userData.comments || []),
    ...(userData.posts || [])
  ];
  
  const categoryCounts = {};
  const CATEGORIES = type === 'interest' ? INTEREST_CATEGORIES : 
                     type === 'leisure' ? LEISURE_CATEGORIES :
                     NSFW_CATEGORIES;
  
  // Initialize counts
  Object.keys(CATEGORIES).forEach(key => {
    categoryCounts[key] = 0;
  });
  
  // Track uncategorized subreddits
  const uncategorized = new Set();
  
  // Count activities per category
  allItems.forEach(item => {
    const sub = (item.subreddit || '').toLowerCase().trim();
    if (!sub) return;
    
    let found = false;
    for (const [key, category] of Object.entries(CATEGORIES)) {
      // Use same strict matching as widgets: exact match or prefix match
      const matches = category.subs.some(s => {
        const catSub = s.toLowerCase().trim();
        return sub === catSub || sub.startsWith(catSub + '_') || sub.startsWith(catSub);
      });
      if (matches) {
        categoryCounts[key]++;
        found = true;
        break;
      }
    }
    
    // If no match found, track it as uncategorized
    if (!found) {
      uncategorized.add(sub);
    }
  });
  
  // Save uncategorized subreddits to JSON file
  if (uncategorized.size > 0) {
    saveUncategorizedSubreddits(Array.from(uncategorized));
  }
  
  return categoryCounts;
}

// Save uncategorized subreddits to JSON file
async function saveUncategorizedSubreddits(subreddits) {
  try {
    // Get existing data from localStorage
    const storageKey = 'uncategorized_subreddits';
    let existing = {};
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        existing = JSON.parse(stored);
      }
    } catch (e) {
      // No existing data, that's fine
    }
    
    // Add timestamp to each new subreddit
    const timestamp = new Date().toISOString();
    subreddits.forEach(sub => {
      if (!existing[sub]) {
        existing[sub] = {
          firstSeen: timestamp,
          lastSeen: timestamp,
          count: 1
        };
      } else {
        existing[sub].lastSeen = timestamp;
        existing[sub].count = (existing[sub].count || 1) + 1;
      }
    });
    
    // Save to localStorage
    localStorage.setItem(storageKey, JSON.stringify(existing, null, 2));
    
    // Auto-save to file via API
    try {
      // Production: always use Cloudflare-proxied domain
      const IS_PROD = typeof window !== 'undefined' && window.location.protocol === 'https:';
      const apiBase = IS_PROD
        ? 'https://api.reddituser.info'
        : 'http://localhost:5000';
      
      const response = await fetch(apiBase + '/save-uncategorized', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subreddits: existing })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Saved ${result.saved} uncategorized subreddits to file. Total: ${result.total}`);
      } else {
        console.warn('⚠️ Could not save to file (API error):', response.status);
      }
    } catch (apiError) {
      console.warn('⚠️ Could not save to file (API unavailable):', apiError.message);
    }
    
    console.log(`📝 Found ${subreddits.length} uncategorized subreddits. Total tracked: ${Object.keys(existing).length}`);
  } catch (error) {
    console.error('Error saving uncategorized subreddits:', error);
  }
}
