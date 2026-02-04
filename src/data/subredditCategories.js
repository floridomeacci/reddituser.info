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
      'programminghorror', 'techsupportmacgyver', 'buildapcsales', 'buildapcforme'
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
      'languagelearning', 'learnjapanese', 'french', 'law'
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
      'solananft', 'solseanft'
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
      'juridischadvies', 'nederland', 'nederlands', 'prague', 'uk_aliens_uap'
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
      'ableton', 'fl_studio'
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
      'protectandserve', 'accounting', 'teachers', 'military', 'army'
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
      'emulation', 'retrogaming', 'cade', 'mame'
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
      'strava', 'fitbit', 'applewatch', 'sportsarefun'
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
      'dccomics', 'spiderman', 'deadpool', 'unexpectedhogwarts'
    ]
  },
  
  animeMedia: {
    label: 'Anime & Manga',
    subs: [
      'anime', 'manga', 'anime_irl', 'awwnime', 'tsunderesharks',
      'animesuggest', 'animemes', 'animegifs', 'animewallpaper',
      'wholesomeanimemes', 'pokemon', 'onepiece', 'naruto', 'dbz',
      'onepunchman', 'bokunoheroacademia', 'yugioh', 'ddlc', 'berserk',
      'hunterxhunter', 'tokyoghoul', 'shitpostcrusaders', 'attackontitan'
    ]
  },
  
  books: {
    label: 'Books & Reading',
    subs: [
      'books', 'literature', 'booksuggestions', 'poetry', 'lovecraft',
      'suggestmeabook', 'freeebooks', 'boottoobig', 'harrypotter',
      'kingkillerchronicle', 'asoiaf', 'lotr', 'tolkienfans'
    ]
  },
  
  comics: {
    label: 'Comics',
    subs: [
      'comics', 'comicbooks', 'polandball', 'marvel', 'webcomics',
      'bertstrips', 'marvelstudios', 'defenders', 'marvelmemes',
      'batman', 'calvinandhobbes', 'xkcd', 'dccomics'
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
      'guitar', 'piano', 'bass', 'drums', 'guitarlessons'
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
      'plumbing', 'licenseplates', 'ltadevlog'
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
      'aliensamongus', 'neverbrokeabone', 'tall'
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
      'tiktokcringe'
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
      'weathergifs', 'tropicalweather'
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
      'robinhood', 'kotakuinaction', 'wikileaks'
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
      // Resolve API base (tries 37.27.27.247:5000 and :5001)
      const ports = [5000, 5001];
      let apiBase = null;
      
      for (const port of ports) {
        const base = `http://37.27.27.247:${port}`;
        try {
          const healthCheck = await fetch(base + '/health', { method: 'GET' });
          if (healthCheck.ok) {
            apiBase = base;
            break;
          }
        } catch (e) {
          // Try next port
        }
      }
      
      if (!apiBase) apiBase = 'http://37.27.27.247:5000'; // fallback
      
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
