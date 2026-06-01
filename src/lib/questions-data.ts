// Pool of 100 global architectural questions (10 per quiz/barrel) for NASA Heritage Quiz Hunt
// Location: src/lib/questions-data.ts

export interface QuestionInput {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
}

export interface QuizSeed {
  barrel_id: number;
  title: string;
  description: string;
  questions: QuestionInput[];
}

export const questionsData: QuizSeed[] = [
  {
    barrel_id: 1,
    title: "Ancient Wonders & Egypt",
    description: "Explore the structural genius, monumental masonry, and alignment of Giza, Luxor, and ancient dry-stone monuments.",
    questions: [
      {
        question: "Which type of limestone, prized for its white color and fine grain, was used for the outer casing stones of the Great Pyramid of Giza?",
        option_a: "Tura limestone",
        option_b: "Travertine",
        option_c: "Solnhofen limestone",
        option_d: "Nummulitic limestone",
        correct_answer: "A"
      },
      {
        question: "What structural system is composed of massive vertical supports carrying a horizontal stone beam, as seen in Stonehenge and Egyptian hypostyle halls?",
        option_a: "Post-and-beam (Post-and-lintel)",
        option_b: "Corbelled arch system",
        option_c: "Voussoir vaulting",
        option_d: "Truss framing",
        correct_answer: "A"
      },
      {
        question: "The Mortuary Temple of Hatshepsut, showcasing axial symmetry and collonaded terraces, was designed by which ancient architect?",
        option_a: "Senenmut",
        option_b: "Imhotep",
        option_c: "Hemiunu",
        option_d: "Ineni",
        correct_answer: "A"
      },
      {
        question: "Which element of a classical Egyptian temple layout functioned as a massive sloping gateway structure representing the horizon?",
        option_a: "Pylon",
        option_b: "Obelisk",
        option_c: "Hypostyle hall",
        option_d: "Peristyle courtyard",
        correct_answer: "A"
      },
      {
        question: "What is the name of the ancient flat-roofed, rectangular Egyptian tomb structure with sloping sides that predated the step pyramids?",
        option_a: "Mastaba",
        option_b: "Ziggurat",
        option_c: "Tumulus",
        option_d: "Stele",
        correct_answer: "A"
      },
      {
        question: "Imhotep designed the Step Pyramid of Djoser at Saqqara by stacking mastabas of decreasing sizes. During which dynasty was it built?",
        option_a: "Third Dynasty",
        option_b: "Fourth Dynasty",
        option_c: "First Dynasty",
        option_d: "Sixth Dynasty",
        correct_answer: "A"
      },
      {
        question: "Which architectural marvel of Mesopotamian design is a tiered temple tower representing a connection between heaven and earth?",
        option_a: "Ziggurat",
        option_b: "Obelisk",
        option_c: "Apadana",
        option_d: "Gopuram",
        correct_answer: "A"
      },
      {
        question: "What material was primarily utilized to construct the core of Mesopotamian ziggurats due to local geological scarcity of stone?",
        option_a: "Sun-dried mud bricks",
        option_b: "Granite slabs",
        option_c: "Volcanic tufa",
        option_d: "Cedar wood timber",
        correct_answer: "A"
      },
      {
        question: "The Palace of Persepolis featured a grand audience hall called the 'Apadana'. Which empire created this structure?",
        option_a: "Achaemenid Empire",
        option_b: "Byzantine Empire",
        option_c: "Babhlonian Empire",
        option_d: "Assyrian Empire",
        correct_answer: "A"
      },
      {
        question: "What structural technique allows stones to form a self-supporting dome or arch by slightly overlapping each layer inward until they meet?",
        option_a: "Corbelling",
        option_b: "Voussoir vaulting",
        option_c: "Centering",
        option_d: "Keystone lock",
        correct_answer: "A"
      }
    ]
  },
  {
    barrel_id: 2,
    title: "Classical Greek & Roman",
    description: "Examine the proportions of Greek orders and the revolutionary concrete and vaulting systems of the Roman Empire.",
    questions: [
      {
        question: "What optical correction did Greek architects use in the columns of the Parthenon, bowing them slightly outward in the center to prevent the illusion of concavity?",
        option_a: "Entasis",
        option_b: "Intercolumniation",
        option_c: "Anathyrosis",
        option_d: "Stylobate curvature",
        correct_answer: "A"
      },
      {
        question: "Which classic column order features scrolls called volutes on its capital and a more slender shaft compared to the Doric order?",
        option_a: "Ionic Order",
        option_b: "Doric Order",
        option_c: "Corinthian Order",
        option_d: "Tuscan Order",
        correct_answer: "A"
      },
      {
        question: "The Pantheon in Rome features a massive unreinforced concrete dome. What is the name of the circular opening at the apex of this dome?",
        option_a: "Oculus",
        option_b: "Exedra",
        option_c: "Coffer",
        option_d: "Lantern",
        correct_answer: "A"
      },
      {
        question: "What volcanic ash material did the Romans mix with lime to create their exceptionally durable concrete that cured underwater?",
        option_a: "Pozzolana",
        option_b: "Basalt",
        option_c: "Pumice",
        option_d: "Travertine",
        correct_answer: "A"
      },
      {
        question: "Which Roman construction type is a curved ceiling formed by a continuous semi-circular arch?",
        option_a: "Barrel vault",
        option_b: "Groin vault",
        option_c: "Ribbed vault",
        option_d: "Dome",
        correct_answer: "A"
      },
      {
        question: "The Roman Colosseum (Flavian Amphitheatre) utilizes a combination of superimposed orders. What is the order sequence from ground floor upward?",
        option_a: "Tuscan, Ionic, Corinthian",
        option_b: "Doric, Corinthian, Ionic",
        option_c: "Ionic, Corinthian, Composite",
        option_d: "Tuscan, Composite, Corinthian",
        correct_answer: "A"
      },
      {
        question: "What is the term for the triangular gable at the end of a classical Greek temple roof, often filled with relief sculptures?",
        option_a: "Pediment",
        option_b: "Frieze",
        option_c: "Architrave",
        option_d: "Cornice",
        correct_answer: "A"
      },
      {
        question: "Which Greek order is characterized by flat fluting, the absence of a base, and simple pillow-like capitals?",
        option_a: "Doric Order",
        option_b: "Ionic Order",
        option_c: "Corinthian Order",
        option_d: "Tuscan Order",
        correct_answer: "A"
      },
      {
        question: "What structural innovation did Roman engineers use to span wide valleys and supply cities with gravity-fed water conduits?",
        option_a: "Aqueducts with tiered semicircular arches",
        option_b: "Timber cantilever bridges",
        option_c: "Suspension cable bridges",
        option_d: "Corbelled stone box conduits",
        correct_answer: "A"
      },
      {
        question: "Which architectural element serves as the central wedge-shaped stone at the top of an arch, locking all other voussoirs into place?",
        option_a: "Keystone",
        option_b: "Springing stone",
        option_c: "Impost",
        option_d: "Spandrel",
        correct_answer: "A"
      }
    ]
  },
  {
    barrel_id: 3,
    title: "Gothic Cathedrals & Medieval Europe",
    description: "Investigate structural engineering breakthroughs: pointed arches, flying buttresses, and rib vaulting.",
    questions: [
      {
        question: "Which structural innovation in Gothic architecture redirected the lateral thrust of high vaults outward to ground piers, allowing for thinner, taller walls filled with stained glass?",
        option_a: "Flying buttresses",
        option_b: "Pendentives",
        option_c: "Squinches",
        option_d: "Corbelled piers",
        correct_answer: "A"
      },
      {
        question: "The birth of Gothic architecture is widely associated with the reconstruction of the choir of which church near Paris by Abbot Suger?",
        option_a: "Basilica of Saint-Denis",
        option_b: "Notre-Dame de Paris",
        option_c: "Chartres Cathedral",
        option_d: "Reims Cathedral",
        correct_answer: "A"
      },
      {
        question: "What type of vaults, formed by the intersection of pointed arches, replaced the heavy Romanesque barrel vaults in Gothic cathedrals?",
        option_a: "Ribbed vaults",
        option_b: "Groin vaults",
        option_c: "Coved vaults",
        option_d: "Cambered vaults",
        correct_answer: "A"
      },
      {
        question: "What decorative stone framework was used in Gothic windows to support leaded stained glass in geometric tracery?",
        option_a: "Mullion and Tracery",
        option_b: "Transom block",
        option_c: "Lattice framing",
        option_d: "Lintel brace",
        correct_answer: "A"
      },
      {
        question: "Which architectural style immediately preceded Gothic and was characterized by heavy masonry, thick walls, and rounded Roman arches?",
        option_a: "Romanesque",
        option_b: "Byzantine",
        option_c: "Renaissance",
        option_d: "Baroque",
        correct_answer: "A"
      },
      {
        question: "What is the circular stained-glass window typical of Gothic cathedral facades, styled with complex radial tracery?",
        option_a: "Rose window",
        option_b: "Clerestory window",
        option_c: "Lancet window",
        option_d: "Ocular fanlight",
        correct_answer: "A"
      },
      {
        question: "In medieval church layout, what is the cross-arm axis perpendicular to the main nave called?",
        option_a: "Transept",
        option_b: "Apse",
        option_c: "Chancel",
        option_d: "Narthex",
        correct_answer: "A"
      },
      {
        question: "What are the decorative, projecting stone spouts carved like monsters or beasts to drain rainwater away from cathedral walls?",
        option_a: "Gargoyles",
        option_b: "Grotesques",
        option_c: "Caryatids",
        option_d: "Finials",
        correct_answer: "A"
      },
      {
        question: "Which cathedral, famous for its extreme height and subsequent collapse of its choir vaults, represented the limits of Gothic structural scale?",
        option_a: "Beauvais Cathedral",
        option_b: "Chartres Cathedral",
        option_c: "Amiens Cathedral",
        option_d: "Salisbury Cathedral",
        correct_answer: "A"
      },
      {
        question: "What is the term for a continuous arcaded gallery built into the thickness of the wall, located below the clerestory and above the nave arcade?",
        option_a: "Triforium",
        option_b: "Crypt",
        option_c: "Ambulatory",
        option_d: "Tympanum",
        correct_answer: "A"
      }
    ]
  },
  {
    barrel_id: 4,
    title: "Renaissance & Baroque Masterpieces",
    description: "Analyze the revival of classicism, perspective, and the dramatic curves and optical illusions of the Baroque period.",
    questions: [
      {
        question: "Who engineered the double-walled brick dome of Santa Maria del Fiore in Florence without the use of temporary wooden scaffolding?",
        option_a: "Filippo Brunelleschi",
        option_b: "Leon Battista Alberti",
        option_c: "Michelangelo Buonarroti",
        option_d: "Donato Bramante",
        correct_answer: "A"
      },
      {
        question: "Which Renaissance architect authored 'De re aedificatoria' and designed the facade of Santa Maria Novella utilizing harmonic mathematical ratios?",
        option_a: "Leon Battista Alberti",
        option_b: "Andrea Palladio",
        option_c: "Giorgio Vasari",
        option_d: "Filippo Brunelleschi",
        correct_answer: "A"
      },
      {
        question: "Andrea Palladio developed a highly influential villa style based on symmetrical geometry. Which of his designs features a central dome and four identical temple porches?",
        option_a: "Villa Rotonda",
        option_b: "Villa Barbaro",
        option_c: "Palazzo Chiericati",
        option_d: "Villa Foscari",
        correct_answer: "A"
      },
      {
        question: "What layout design is Andrea Palladio famous for detailing in his treatise, 'The Four Books of Architecture'?",
        option_a: "Palladian tri-partite window motifs and symmetrical villa planning",
        option_b: "Radial urban design star plans",
        option_c: "Flying buttress sizing rules",
        option_d: "Reinforced concrete composite ratios",
        correct_answer: "A"
      },
      {
        question: "Which Roman Baroque architect designed the undulating facade of San Carlo alle Quattro Fontane, featuring complex geometry based on ellipses?",
        option_a: "Francesco Borromini",
        option_b: "Gian Lorenzo Bernini",
        option_c: "Pietro da Cortona",
        option_d: "Carlo Maderno",
        correct_answer: "A"
      },
      {
        question: "Who designed the monumental colonnade enclosing St. Peter's Square in Rome, symbolizing the welcoming arms of the church?",
        option_a: "Gian Lorenzo Bernini",
        option_b: "Francesco Borromini",
        option_c: "Michelangelo",
        option_d: "Baldassarre Peruzzi",
        correct_answer: "A"
      },
      {
        question: "Which architectural style reacted against classical symmetry with dynamic forms, dramatic lighting (chiaroscuro), and theatrical interior scale?",
        option_a: "Baroque",
        option_b: "Neoclassicism",
        option_c: "Rococo",
        option_d: "Mannerism",
        correct_answer: "A"
      },
      {
        question: "What French palace complex designed by Louis Le Vau and Jules Hardouin-Mansart is the absolute icon of French Baroque classical grandeur?",
        option_a: "Palace of Versailles",
        option_b: "Château de Chambord",
        option_c: "Palais du Louvre",
        option_d: "Château de Fontainebleau",
        correct_answer: "A"
      },
      {
        question: "Which Mannerist architectural style represents the transitional phase between Renaissance classicism and the Baroque, focusing on visual playfulness and rule-breaking?",
        option_a: "Mannerism",
        option_b: "Gothic Revival",
        option_c: "Art Nouveau",
        option_d: "Beaux-Arts",
        correct_answer: "A"
      },
      {
        question: "Who designed the dome of St. Paul's Cathedral in London, employing a concealed brick cone to support the heavy stone lantern?",
        option_a: "Sir Christopher Wren",
        option_b: "Inigo Jones",
        option_c: "Nicholas Hawksmoor",
        option_d: "John Vanbrugh",
        correct_answer: "A"
      }
    ]
  },
  {
    barrel_id: 5,
    title: "Islamic & Indian Marvels",
    description: "Explore the structural engineering and spatial layouts of Islamic domes, Taj Mahal, and South Indian temple gopurams.",
    questions: [
      {
        question: "What spherical transition system allows a circular dome to sit securely over a square room base, as perfected in Byzantine and Islamic architecture?",
        option_a: "Pendentives",
        option_b: "Squinches",
        option_c: "Corbel brackets",
        option_d: "Architraves",
        correct_answer: "A"
      },
      {
        question: "Which structural technique, common in Islamic vaulting, features a cellular honeycomb pattern of nested corbelled niches?",
        option_a: "Muqarnas",
        option_b: "Jali",
        option_c: "Arabesque",
        option_d: "Mashrabiya",
        correct_answer: "A"
      },
      {
        question: "The Taj Mahal features a double-dome system. What is the structural purpose of this design choice?",
        option_a: "To maintain grand exterior scale while keeping the interior ceiling proportions intimate",
        option_b: "To isolate sound acoustics for religious chanting",
        option_c: "To create an air gap for thermal cooling on hot summer days",
        option_d: "To serve as a structural water reservoir for fountains",
        correct_answer: "A"
      },
      {
        question: "The Great Mosque of Córdoba is famous for its vast hypostyle prayer hall. What unique feature do its columns support?",
        option_a: "Double-tiered red-and-white striped arches",
        option_b: "Heavy stone vaults with no intermediate columns",
        option_c: "A massive central monolithic dome",
        option_d: "Ornate wooden cantilever trusses",
        correct_answer: "A"
      },
      {
        question: "What is the name of the ornamental, latticed stone or wooden screen designed to filter light and provide privacy in Indian and Islamic architecture?",
        option_a: "Jali",
        option_b: "Chhatri",
        option_c: "Minar",
        option_d: "Gopuram",
        correct_answer: "A"
      },
      {
        question: "The Konark Sun Temple in Odisha is designed in the shape of a colossal processional chariot. For which Hindu deity was it built?",
        option_a: "Surya",
        option_b: "Shiva",
        option_c: "Vishnu",
        option_d: "Ganesha",
        correct_answer: "A"
      },
      {
        question: "What is the soaring gateway tower of a South Indian Hindu temple complex called, characterized by stepped layers of sculptures?",
        option_a: "Gopuram",
        option_b: "Shikhara",
        option_c: "Vimana",
        option_d: "Mandapa",
        correct_answer: "A"
      },
      {
        question: "Which Mughal emperor founded the city of Fatehpur Sikri, showcasing a fusion of Persian, Islamic, and Hindu architectural styles?",
        option_a: "Akbar",
        option_b: "Shah Jahan",
        option_c: "Babur",
        option_d: "Humayun",
        correct_answer: "A"
      },
      {
        question: "What is the structural term for the stone balcony supported by brackets and topped by a small dome, common in Rajput and Mughal designs?",
        option_a: "Chhatri",
        option_b: "Jharokha",
        option_c: "Minaret",
        option_d: "Mehrab",
        correct_answer: "A"
      },
      {
        question: "The Alhambra palace complex in Spain is renowned for its delicate courtyards. Which dynasty built this monument?",
        option_a: "Nasrid Dynasty",
        option_b: "Umayyad Dynasty",
        option_c: "Fatimid Dynasty",
        option_d: "Abbasid Dynasty",
        correct_answer: "A"
      }
    ]
  },
  {
    barrel_id: 6,
    title: "East Asian Temple Architecture",
    description: "Discover the wooden joinery systems, bracket complexes, and pagodas of China, Japan, and Southeast Asia.",
    questions: [
      {
        question: "What is the interlocking wooden bracket system used in traditional Chinese and Japanese architecture to distribute roof load without nails?",
        option_a: "Dougong",
        option_b: "Tatami",
        option_c: "Ken",
        option_d: "Shoji",
        correct_answer: "A"
      },
      {
        question: "Traditional Japanese pagodas feature a central structural pillar that absorbs seismic vibration. What is this pillar called?",
        option_a: "Shinbashira",
        option_b: "Torii",
        option_c: "Tokuyo",
        option_d: "Fusuma",
        correct_answer: "A"
      },
      {
        question: "The Temple of Heaven complex in Beijing features the Hall of Prayer for Good Harvests. What geometric shapes define its layout, symbolizing heaven and earth?",
        option_a: "A circular building on a square platform",
        option_b: "An octagonal tower inside a triangular yard",
        option_c: "A square pavilion with a pentagonal base",
        option_d: "A star-shaped temple on a circular lake",
        correct_answer: "A"
      },
      {
        question: "Which monumental temple complex in Cambodia is the largest religious structure in the world, featuring a layout mirroring Mt. Meru?",
        option_a: "Angkor Wat",
        option_b: "Borobudur",
        option_c: "Bagan",
        option_d: "Prambanan",
        correct_answer: "A"
      },
      {
        question: "Traditional Japanese residential planning is based on a modular floor mat. What is this mat called?",
        option_a: "Tatami mat",
        option_b: "Shoji screen",
        option_c: "Fusuma panel",
        option_d: "Tokonoma alcove",
        correct_answer: "A"
      },
      {
        question: "What is the name of the traditional Japanese wooden gate situated at the entrance of Shinto shrines, marking the boundary between the sacred and profane?",
        option_a: "Torii",
        option_b: "Pagoda",
        option_c: "Kura",
        option_d: "Chashitsu",
        correct_answer: "A"
      },
      {
        question: "Which Chinese text, compiled by Li Jie in the Song Dynasty, served as the first state-standardized building code for wooden architecture?",
        option_a: "Yingzao Fashi",
        option_b: "Lu Ban Jing",
        option_c: "Daodejing",
        option_d: "Feng Shui treatise",
        correct_answer: "A"
      },
      {
        question: "What iconic roof profile, characterized by sweeping upward curved eaves, is signature to classical East Asian monumental buildings?",
        option_a: "Hip-and-gable roof with flying eaves",
        option_b: "Flat concrete parapet roof",
        option_c: "Mansard style roof",
        option_d: "Shed style single pitch roof",
        correct_answer: "A"
      },
      {
        question: "The Todai-ji temple in Nara, Japan, houses the Great Buddha. What is its structural significance?",
        option_a: "It is one of the largest historic wooden buildings in the world",
        option_b: "It features the first stone arch dome in Japan",
        option_c: "It was built entirely of cast iron braces",
        option_d: "It stands on floating wooden pontoon foundations",
        correct_answer: "A"
      },
      {
        question: "The Buddhist temple Borobudur in Indonesia is built as a massive stepped pyramid. What cosmic shape is its ground plan designed to resemble?",
        option_a: "Mandala",
        option_b: "Yantra",
        option_c: "Hexagram",
        option_d: "Swastika",
        correct_answer: "A"
      }
    ]
  },
  {
    barrel_id: 7,
    title: "Pre-Columbian & Mesoamerican",
    description: "Explore the stone carving, dry-stone masonry, and solar alignments of the Maya, Aztecs, and Incas.",
    questions: [
      {
        question: "Which Mesoamerican city features the massive Pyramid of the Sun and Pyramid of the Moon, aligned along the Avenue of the Dead?",
        option_a: "Teotihuacan",
        option_b: "Chichen Itza",
        option_c: "Tikal",
        option_d: "Tenochtitlan",
        correct_answer: "A"
      },
      {
        question: "The Maya pyramid El Castillo at Chichen Itza exhibits an astronomical phenomenon during equinoxes. What shadow is cast down the staircase?",
        option_a: "A descending feathered serpent (Kukulkan)",
        option_b: "A giant jaguar paw",
        option_c: "A solar eclipse ring",
        option_d: "A calendar wheel outline",
        correct_answer: "A"
      },
      {
        question: "What stone construction style, featuring highly irregular stones fitted together precisely without mortar, was mastered by Inca masons at Machu Picchu?",
        option_a: "Ashlar polygonal masonry",
        option_b: "Mortared rubble fill",
        option_c: "Adobe brick layering",
        option_d: "Cyclopean concrete pouring",
        correct_answer: "A"
      },
      {
        question: "What is the name of the sacred trapezoidal carved stone used by the Incas for astronomical observation and calendar tracking?",
        option_a: "Intihuatana stone",
        option_b: "Chacmool table",
        option_c: "Calendar Stone",
        option_d: "Stela",
        correct_answer: "A"
      },
      {
        question: "The Aztec capital, Tenochtitlan, was built on an island in Lake Texcoco. What artificial agricultural plot system did they expand upon to grow food?",
        option_a: "Chinampas",
        option_b: "Milpas",
        option_c: "Terraces",
        option_d: "Aqueducts",
        correct_answer: "A"
      },
      {
        question: "Maya temples often feature a stepped roof structure that rises above the back wall of the shrine to provide a monument profile. What is this called?",
        option_a: "Roof comb",
        option_b: "Corbel vault",
        option_c: "Finial crest",
        option_d: "Pediment peak",
        correct_answer: "A"
      },
      {
        question: "Which Inca fortress near Cusco features massive zigzagging dry-stone walls made of monoliths weighing over 100 tons?",
        option_a: "Sacsayhuaman",
        option_b: "Ollantaytambo",
        option_c: "Pisac",
        option_d: "Choquequirao",
        correct_answer: "A"
      },
      {
        question: "What architectural profile characterizes Mesoamerican temple pyramids, consisting of alternating sloping panels and flat vertical panels?",
        option_a: "Talud-tablero",
        option_b: "Mastaba step",
        option_c: "Ziggurat tier",
        option_d: "Pilaster trim",
        correct_answer: "A"
      },
      {
        question: "What is the structural limitation of the Maya corbelled arch, which restricted the interior width of their stone temple chambers?",
        option_a: "It produces high lateral thrust that requires narrow spans and extremely thick walls",
        option_b: "It is prone to collapsing under wind load",
        option_c: "It cannot support stone roofs",
        option_d: "It requires iron brackets to stay locked",
        correct_answer: "A"
      },
      {
        question: "Which ancient Native American culture in the US Southwest built the multi-story sandstone cliff dwellings of Mesa Verde?",
        option_a: "Ancestral Puebloans (Anasazi)",
        option_b: "Mississippian Culture",
        option_c: "Hopewell Culture",
        option_d: "Navajo Nation",
        correct_answer: "A"
      }
    ]
  },
  {
    barrel_id: 8,
    title: "Modernism & Bauhaus Movement",
    description: "Analyze the architectural philosophies of Le Corbusier, Frank Lloyd Wright, Mies van der Rohe, and Walter Gropius.",
    questions: [
      {
        question: "Which modernist residential masterpiece in France, designed by Le Corbusier, acts as the absolute manifestation of his 'Five Points of Architecture'?",
        option_a: "Villa Savoye",
        option_b: "Villa Dirickz",
        option_c: "Villa Stein",
        option_d: "Villa Tugendhat",
        correct_answer: "A"
      },
      {
        question: "What are the slender columns of reinforced concrete that lift a building off the ground, as defined in Le Corbusier's design principles?",
        option_a: "Pilotis",
        option_b: "Mullions",
        option_c: "Buttresses",
        option_d: "Piles",
        correct_answer: "A"
      },
      {
        question: "Frank Lloyd Wright designed a residential masterpiece in Pennsylvania cantilevered over a waterfall. What is the name of this house?",
        option_a: "Fallingwater",
        option_b: "Robie House",
        option_c: "Taliesin West",
        option_d: "Hollyhock House",
        correct_answer: "A"
      },
      {
        question: "Which architectural school, founded by Walter Gropius in Weimar, Germany, in 1919, sought to unify art, craft, and technology?",
        option_a: "Bauhaus",
        option_b: "Vkhutemas",
        option_c: "Beaux-Arts Academy",
        option_d: "Cranbrook Academy",
        correct_answer: "A"
      },
      {
        question: "What famous architectural maxim, emphasizing minimalism and structural honesty, is attributed to Ludwig Mies van der Rohe?",
        option_a: "Less is more",
        option_b: "Form follows function",
        option_c: "Ornament is crime",
        option_d: "Less is a bore",
        correct_answer: "A"
      },
      {
        question: "Mies van der Rohe designed the Seagram Building in New York. What structural aesthetic did he express on its glass curtain wall facade?",
        option_a: "Non-structural bronze I-beams to mimic structural frame lines",
        option_b: "Precast concrete gargoyles",
        option_c: "Polished travertine panels",
        option_d: "Ornate neoclassical pilasters",
        correct_answer: "A"
      },
      {
        question: "Which concrete church in Ronchamp, France, represents Le Corbusier's late organic and sculptural phase, moving away from strict geometry?",
        option_a: "Chapelle Notre-Dame du Haut",
        option_b: "Villa Savoye",
        option_c: "Unité d'Habitation",
        option_d: "Palace of Assembly",
        correct_answer: "A"
      },
      {
        question: "Who coined the phrase 'Form follows function', which became a primary guideline for early modernist and functionalist architecture?",
        option_a: "Louis Sullivan",
        option_b: "Frank Lloyd Wright",
        option_c: "Walter Gropius",
        option_d: "Adolf Loos",
        correct_answer: "A"
      },
      {
        question: "What essay, written by Austrian architect Adolf Loos in 1908, condemned all decorative elements on buildings as obsolete and wasteful?",
        option_a: "Ornament and Crime",
        option_b: "Complexity and Contradiction",
        option_c: "Towards an Architecture",
        option_d: "The Seven Lamps of Architecture",
        correct_answer: "A"
      },
      {
        question: "Which modernist residential home, designed by Ludwig Mies van der Rohe in Plano, Illinois, consists of a steel frame and floor-to-ceiling glass walls?",
        option_a: "Farnsworth House",
        option_b: "Glass House",
        option_c: "Eames House",
        option_d: "Schröder House",
        correct_answer: "A"
      }
    ]
  },
  {
    barrel_id: 9,
    title: "Postmodern & Contemporary Giants",
    description: "Explore the reactions against modernism, deconstructivism, and iconic landmarks of the late 20th and early 21st century.",
    questions: [
      {
        question: "Which deconstructivist masterpiece, designed by Frank Gehry in Spain, is famous for its shimmering titanium-clad organic curves?",
        option_a: "Guggenheim Museum Bilbao",
        option_b: "Walt Disney Concert Hall",
        option_c: "L'Hemisfèric",
        option_d: "Centre Pompidou",
        correct_answer: "A"
      },
      {
        question: "What book by Robert Venturi, published in 1966, challenged modernist orthodoxy with the slogan 'Less is a bore' and championed complexity?",
        option_a: "Complexity and Contradiction in Architecture",
        option_b: "Learning from Las Vegas",
        option_c: "Delirious New York",
        option_d: "The Death and Life of Great American Cities",
        correct_answer: "A"
      },
      {
        question: "Who designed the Sydney Opera House, characterized by its precast concrete spherical shells mimicking sails?",
        option_a: "Jørn Utzon",
        option_b: "Eero Saarinen",
        option_c: "Alvar Aalto",
        option_d: "Richard Rogers",
        correct_answer: "A"
      },
      {
        question: "The Centre Pompidou in Paris, designed by Renzo Piano and Richard Rogers, is famous for which architectural design approach?",
        option_a: "Exposing its structural and mechanical systems on the exterior facade (High-tech architecture)",
        option_b: "Recreating a neoclassical marble palace",
        option_c: "Using load-bearing rammed earth walls",
        option_d: "Concealing all windows behind timber shutters",
        correct_answer: "A"
      },
      {
        question: "Which contemporary architect designed the Heydar Aliyev Center in Baku, characterized by its fluid, sweeping curves that merge floor, wall, and ceiling?",
        option_a: "Zaha Hadid",
        option_b: "Rem Koolhaas",
        option_c: "Daniel Libeskind",
        option_d: "Toyo Ito",
        correct_answer: "A"
      },
      {
        question: "Which structural system, utilizing exterior columns braced with outriggers, allowed the Burj Khalifa to reach its record-breaking height?",
        option_a: "Buttressed core system",
        option_b: "Suspended steel truss frame",
        option_c: "Load bearing brick masonry",
        option_d: "Rigid concrete portal frames",
        correct_answer: "A"
      },
      {
        question: "The Louvre Pyramid in Paris serves as the museum entrance. Which architect designed this glass and metal structure?",
        option_a: "I. M. Pei",
        option_b: "Jean Nouvel",
        option_c: "Norman Foster",
        option_d: "Kengo Kuma",
        correct_answer: "A"
      },
      {
        question: "Which postmodern skyscraper in New York features a pediment top resembling a Chippendale cabinet, directly mocking functionalism?",
        option_a: "550 Madison Avenue (formerly AT&T Building)",
        option_b: "Chrysler Building",
        option_c: "Hearst Tower",
        option_d: "Citicorp Center",
        correct_answer: "A"
      },
      {
        question: "What is the name of the architectural movement that emerged in the late 1980s, characterized by fragmentation, non-rectilinear shapes, and controlled chaos?",
        option_a: "Deconstructivism",
        option_b: "International Style",
        option_c: "Brutalisim",
        option_d: "Art Deco",
        correct_answer: "A"
      },
      {
        question: "Who designed the glass canopy dome of the Reichstag building in Berlin, incorporating a central mirrored cone to reflect light down into the parliament?",
        option_a: "Norman Foster",
        option_b: "Santiago Calatrava",
        option_c: "Tadao Ando",
        option_d: "Richard Meier",
        correct_answer: "A"
      }
    ]
  },
  {
    barrel_id: 10,
    title: "Sustainable & Vernacular Structures",
    description: "Discover passive heating and cooling, organic building materials, and cutting-edge ecological architecture designs.",
    questions: [
      {
        question: "What design philosophy seeks to align buildings with local climate, using passive solar heating, thermal mass, and natural ventilation instead of mechanical systems?",
        option_a: "Bioclimatic architecture",
        option_b: "High-tech modularism",
        option_c: "Deconstructivist spatial design",
        option_d: "Brutalist concrete framing",
        correct_answer: "A"
      },
      {
        question: "Which building material, composed of sand, clay, water, and straw, has been used since antiquity to build high thermal mass structures in dry climates?",
        option_a: "Adobe",
        option_b: "Pozzolana",
        option_c: "Portland cement",
        option_d: "Precast gypsum",
        correct_answer: "A"
      },
      {
        question: "What is the name of the earth-sheltered home design popularized by Michael Reynolds, constructed from recycled materials like tires and bottles to be fully off-grid?",
        option_a: "Earthship",
        option_b: "Dome Home",
        option_c: "Geodesic dome",
        option_d: "Passivhaus",
        correct_answer: "A"
      },
      {
        question: "Which natural architectural material is technically a grass, exhibits higher tensile strength than steel, and is widely used for ecological structures in the tropics?",
        option_a: "Bamboo",
        option_b: "Cedar wood",
        option_c: "Rattan vine",
        option_d: "Teak timber",
        correct_answer: "A"
      },
      {
        question: "What is the passive solar heating system where a thick glass-covered masonry wall facing the sun acts as a thermal collector and radiator?",
        option_a: "Trombe wall",
        option_b: "Double-skin curtain facade",
        option_c: "Solar chimney",
        option_d: "Atrium lightwell",
        correct_answer: "A"
      },
      {
        question: "The Green School in Bali is famous for its organic, open-air classrooms. What is the primary material used for its entire structure?",
        option_a: "Local Bamboo",
        option_b: "Recycled structural steel",
        option_c: "Laminated veneer lumber (LVL)",
        option_d: "Polished concrete blocks",
        correct_answer: "A"
      },
      {
        question: "What is the name of the sustainable design certification system established by the US Green Building Council (USGBC) in 1998?",
        option_a: "LEED",
        option_b: "BREEAM",
        option_c: "WELL Building Standard",
        option_d: "Passivhaus Standard",
        correct_answer: "A"
      },
      {
        question: "The Eastgate Centre in Harare, Zimbabwe, designed by Mick Pearce, uses passive cooling inspired by which natural structures?",
        option_a: "Termite mounds",
        option_b: "Beehives",
        option_c: "Bird nests",
        option_d: "Lotus leaves",
        correct_answer: "A"
      },
      {
        question: "What architectural method compresses natural soil mixed with a small stabilizer (like cement) inside temporary formwork to create massive, durable walls?",
        option_a: "Rammed earth",
        option_b: "Adobe bricking",
        option_c: "Dry stone stacking",
        option_d: "Cob building",
        correct_answer: "A"
      },
      {
        question: "Which eco-friendly city in Abu Dhabi, designed by Foster + Partners, was planned to rely entirely on solar energy and passive cooling features?",
        option_a: "Masdar City",
        option_b: "NEOM",
        option_c: "Songdo International City",
        option_d: "Forest City",
        correct_answer: "A"
      }
    ]
  },
  {
    barrel_id: 11,
    title: "Classic Columns & Greek Architecture",
    description: "Delve into the orders, proportions, and details of classical columns from Doric to Composite.",
    questions: [
      {
        question: "Which classical order features volutes (scroll-like ornaments) on its capital?",
        option_a: "Ionic",
        option_b: "Doric",
        option_c: "Corinthian",
        option_d: "Tscan",
        correct_answer: "A"
      },
      {
        question: "What is the triangular gable forming the end of the roof slope over a portico in classical architecture?",
        option_a: "Pediment",
        option_b: "Entablature",
        option_c: "Architrave",
        option_d: "Frieze",
        correct_answer: "A"
      },
      {
        question: "Which architectural order was developed by the Romans as a simplified version of the Greek Doric order?",
        option_a: "Tuscan",
        option_b: "Composite",
        option_c: "Corinthian",
        option_d: "Ionic",
        correct_answer: "A"
      },
      {
        question: "What is the term for the slight convex curve applied to a classical column to correct the optical illusion of concavity?",
        option_a: "Entasis",
        option_b: "Fluting",
        option_c: "Capital",
        option_d: "Stylobate",
        correct_answer: "A"
      },
      {
        question: "Which classical order is characterized by its capital decorated with stylized acanthus leaves?",
        option_a: "Corinthian",
        option_b: "Ionic",
        option_c: "Doric",
        option_d: "Tuscan",
        correct_answer: "A"
      },
      {
        question: "What is the horizontal superstructure of temples resting on classical columns, consisting of architrave, frieze, and cornice?",
        option_a: "Entablature",
        option_b: "Pediment",
        option_c: "Plinth",
        option_d: "Abacus",
        correct_answer: "A"
      },
      {
        question: "Which part of the classical column capital is the flat slab forming the uppermost member?",
        option_a: "Abacus",
        option_b: "Echinus",
        option_c: "Volute",
        option_d: "Shaft",
        correct_answer: "A"
      },
      {
        question: "The Composite order is a Roman development combining features of which two Greek orders?",
        option_a: "Ionic and Corinthian",
        option_b: "Doric and Ionic",
        option_c: "Doric and Corinthian",
        option_d: "Tuscan and Ionic",
        correct_answer: "A"
      },
      {
        question: "What is the continuous base supporting a row of classical columns called?",
        option_a: "Stylobate",
        option_b: "Architrave",
        option_c: "Pedestal",
        option_d: "Cornice",
        correct_answer: "A"
      },
      {
        question: "What are the vertical grooves carved into the shaft of a classical column?",
        option_a: "Fluting",
        option_b: "Entasis",
        option_c: "Fillets",
        option_d: "Volutes",
        correct_answer: "A"
      }
    ]
  },
  {
    barrel_id: 12,
    title: "Mud-Brick Arches & Vaulting",
    description: "Explore the structural principles and vernacular traditions of mud-brick arching.",
    questions: [
      {
        question: "What structural technique uses overlapping layers of brick or stone projecting slightly inward to form an arch or dome?",
        option_a: "Corbeling",
        option_b: "Voussoir arching",
        option_c: "Centering",
        option_d: "Keystone reinforcement",
        correct_answer: "A"
      },
      {
        question: "Which architectural culture is famous for the Nubian vault, a mud-brick vault built without shuttering?",
        option_a: "Nubian/Egyptian",
        option_b: "Roman",
        option_c: "Gothic",
        option_d: "Mayan",
        correct_answer: "A"
      },
      {
        question: "What is the wedge-shaped stone or brick used in constructing a true arch called?",
        option_a: "Voussoir",
        option_b: "Keystone",
        option_c: "Impost",
        option_d: "Spandrel",
        correct_answer: "A"
      },
      {
        question: "What is the central wedge-shaped block at the crown of an arch that locks all the elements in place?",
        option_a: "Keystone",
        option_b: "Voussoir",
        option_c: "Springer",
        option_d: "Abacus",
        correct_answer: "A"
      },
      {
        question: "Which type of mortar is traditionally preferred for historical mud-brick preservation due to its breathability?",
        option_a: "Lime-sand mortar",
        option_b: "Portland cement",
        option_c: "Gypsum plaster",
        option_d: "Asphalt mastic",
        correct_answer: "A"
      },
      {
        question: "What is the horizontal support member projecting from a wall to carry an arch load?",
        option_a: "Corbel",
        option_b: "Lintel",
        option_c: "Purlin",
        option_d: "Joist",
        correct_answer: "A"
      },
      {
        question: "What are the lower wedge-shaped blocks of an arch where the curve begins to rise from the support?",
        option_a: "Springers",
        option_b: "Keystones",
        option_c: "Extrados",
        option_d: "Intrados",
        correct_answer: "A"
      },
      {
        question: "The inner curve of an arch or vault is known by which architectural term?",
        option_a: "Intrados",
        option_b: "Extrados",
        option_c: "Spandrel",
        option_d: "Haunch",
        correct_answer: "A"
      },
      {
        question: "What is the space between the outer curve of an arch and the rectangular frame surrounding it?",
        option_a: "Spandrel",
        option_b: "Tympanum",
        option_c: "Architrave",
        option_d: "Soffit",
        correct_answer: "A"
      },
      {
        question: "What temporary structural framework supports an arch during its construction until the keystone is placed?",
        option_a: "Centering",
        option_b: "Shoring",
        option_c: "Scaffolding",
        option_d: "Formwork",
        correct_answer: "A"
      }
    ]
  },
  {
    barrel_id: 13,
    title: "Central Lake Court & Landscaping",
    description: "Discover principles of courtyard gardens, stepwell designs, and landscape features.",
    questions: [
      {
        question: "What is the focal design element of a traditional Indian stepwell (baoli) that connects the surface to the water table?",
        option_a: "Descending subterranean stairs",
        option_b: "Tall minarets",
        option_c: "Grand dome galleries",
        option_d: "Massive fortification walls",
        correct_answer: "A"
      },
      {
        question: "The Court of the Lions at the Alhambra Palace in Spain is a supreme example of which style of Islamic garden courtyard?",
        option_a: "Charbagh layout",
        option_b: "Zen garden",
        option_c: "English landscape",
        option_d: "French formal",
        correct_answer: "A"
      },
      {
        question: "Which landscape element refers to the non-vegetative, hard materials like stone, concrete, and wood incorporated into a design?",
        option_a: "Hardscape",
        option_b: "Softscape",
        option_c: "Xeriscape",
        option_d: "Aquascape",
        correct_answer: "A"
      },
      {
        question: "What is the design practice of using native, drought-resistant plants to minimize water consumption in landscaping?",
        option_a: "Xeriscaping",
        option_b: "Hydrozoning",
        option_c: "Permaculture",
        option_d: "Turfscaping",
        correct_answer: "A"
      },
      {
        question: "What is a semi-enclosed structural courtyard or garden room surrounded by colonnades in classical Roman houses?",
        option_a: "Peristyle",
        option_b: "Atrium",
        option_c: "Vestibule",
        option_d: "Triclinium",
        correct_answer: "A"
      },
      {
        question: "Which design principle involves creating a series of visual layers that frame a body of water or garden vistas?",
        option_a: "Axis and focal alignment",
        option_b: "Random asymmetry",
        option_c: "Static monotony",
        option_d: "Radial dispersion",
        correct_answer: "A"
      },
      {
        question: "The Persian garden layout divided into four quadrants by water channels is known as what?",
        option_a: "Chahar Bagh",
        option_b: "Bagh-e Fin",
        option_c: "Shalimar",
        option_d: "Bustan",
        correct_answer: "A"
      },
      {
        question: "What is a structure consisting of parallel colonnades supporting an open roof of girders and cross rafters, often covered in climbing plants?",
        option_a: "Pergola",
        option_b: "Gazebo",
        option_c: "Pavilion",
        option_d: "Veranda",
        correct_answer: "A"
      },
      {
        question: "What refers to the plant materials (trees, shrubs, lawns) used in a landscape design?",
        option_a: "Softscape",
        option_b: "Hardscape",
        option_c: "Greenscape",
        option_d: "Earthworks",
        correct_answer: "A"
      },
      {
        question: "Which historic style of garden design focuses on imitating nature with rolling lawns, clumps of trees, and irregular lakes?",
        option_a: "English Landscape Garden",
        option_b: "French Formal Garden",
        option_c: "Italian Renaissance Garden",
        option_d: "Moorish Courtyard",
        correct_answer: "A"
      }
    ]
  },
  {
    barrel_id: 14,
    title: "Acoustic Chamber & Spatial Sounds",
    description: "Investigate how space shapes sound, reverberation calculations, and absorption strategies.",
    questions: [
      {
        question: "What unit is used to measure the sound absorption capacity of a material or surface area in architectural acoustics?",
        option_a: "Sabine",
        option_b: "Decibel",
        option_c: "Hertz",
        option_d: "Pascal",
        correct_answer: "A"
      },
      {
        question: "What architectural acoustic phenomenon occurs when sound waves reflect off hard, concave surfaces and focus at a specific point?",
        option_a: "Acoustic focusing",
        option_b: "Flutter echo",
        option_c: "Resonance",
        option_d: "Reverberation",
        correct_answer: "A"
      },
      {
        question: "Which material is highly effective at absorbing mid-to-high frequency sound waves in auditorium design?",
        option_a: "Open-cell acoustic foam",
        option_b: "Polished marble slabs",
        option_c: "Thick concrete panels",
        option_d: "Tempered glass panels",
        correct_answer: "A"
      },
      {
        question: "What is the persistent sound reflection that remains in a closed space after the source has stopped?",
        option_a: "Reverberation",
        option_b: "Echo",
        option_c: "Decibel decay",
        option_d: "Sound transmission",
        correct_answer: "A"
      },
      {
        question: "Which design shape is typically avoided for the rear walls of auditoriums to prevent late reflections and echo?",
        option_a: "Concave curve",
        option_b: "Convex curve",
        option_c: "Flat plane",
        option_d: "Segmented panels",
        correct_answer: "A"
      },
      {
        question: "What acoustic panel system utilizes a series of air cavities behind a perforated facing to absorb low frequencies?",
        option_a: "Helmholtz resonator",
        option_b: "Bass trap panel",
        option_c: "Diffuser panel",
        option_d: "Baffle system",
        correct_answer: "A"
      },
      {
        question: "What is the term for scattering sound waves in many directions to prevent flutter echoes and improve sound distribution?",
        option_a: "Diffusion",
        option_b: "Absorption",
        option_c: "Isolation",
        option_d: "Attenuation",
        correct_answer: "A"
      },
      {
        question: "What index is used to measure the sound isolation performance of a wall or floor assembly?",
        option_a: "Sound Transmission Class (STC)",
        option_b: "Noise Reduction Coefficient (NRC)",
        option_c: "Reverberation Time (RT60)",
        option_d: "Impact Insulation Class (IIC)",
        correct_answer: "A"
      },
      {
        question: "Which type of ceiling baffle is hung vertically in open spaces to reduce reverberation?",
        option_a: "Acoustic baffle",
        option_b: "Diffuser cloud",
        option_c: "Bass trap",
        option_d: "Sound barrier",
        correct_answer: "A"
      },
      {
        question: "The Sabin formula is used to calculate which critical acoustic design parameter?",
        option_a: "Reverberation Time (RT60)",
        option_b: "Sound transmission loss",
        option_c: "Noise criteria rating",
        option_d: "Acoustic clarity index",
        correct_answer: "A"
      }
    ]
  },
  {
    barrel_id: 15,
    title: "Digital Fabrication & Parametric Design",
    description: "Explore 3D printing, parametric models, and CNC routing in modern building construction.",
    questions: [
      {
        question: "What is the computational design methodology where geometric forms are generated by defining rules and parameters rather than drawing them directly?",
        option_a: "Parametric design",
        option_b: "CAD sketching",
        option_c: "Raster mapping",
        option_d: "Isometric rendering",
        correct_answer: "A"
      },
      {
        question: "Which robotic manufacturing process builds architectural components layer-by-layer using concrete, clay, or polymers?",
        option_a: "3D concrete printing",
        option_b: "CNC milling",
        option_c: "Subtractive sculpting",
        option_d: "Vacuum forming",
        correct_answer: "A"
      },
      {
        question: "What subtractive manufacturing tool uses computer numerical control to cut or carve materials like wood and high-density foam?",
        option_a: "CNC router",
        option_b: "3D printer",
        option_c: "Laser scanner",
        option_d: "Robotic arm extruder",
        correct_answer: "A"
      },
      {
        question: "Which material is commonly used in parametric facade fabrication due to its high strength, lightweight nature, and moldability?",
        option_a: "Glass Fiber Reinforced Concrete (GFRC)",
        option_b: "Structural timber",
        option_c: "Heavy cast iron",
        option_d: "Solid masonry blocks",
        correct_answer: "A"
      },
      {
        question: "What digital tool uses a laser or structured light to capture the exact 3D coordinates of an existing building or landscape?",
        option_a: "3D laser scanner (LiDAR)",
        option_b: "CNC scanner",
        option_c: "Plotter",
        option_d: "Digitizer tablet",
        correct_answer: "A"
      },
      {
        question: "What design process utilizes algorithms inspired by natural selection to automatically find the optimal structural form?",
        option_a: "Generative design",
        option_b: "Parametric lofting",
        option_c: "Manual drafting",
        option_d: "Boolean extrusion",
        correct_answer: "A"
      },
      {
        question: "Which term describes the digital instruction file format used by CNC machines and 3D printers to execute fabrication paths?",
        option_a: "G-code",
        option_b: "STL mesh",
        option_c: "DXF vector",
        option_d: "PDF raster",
        correct_answer: "A"
      },
      {
        question: "What digital modeling paradigm represents objects as mathematically defined curves and surfaces rather than polygons?",
        option_a: "NURBS modeling",
        option_b: "Mesh modeling",
        option_c: "Voxel modeling",
        option_d: "Wireframe drafting",
        correct_answer: "A"
      },
      {
        question: "Which manufacturing technique shapes sheet material over a mold using heat and atmospheric pressure?",
        option_a: "Vacuum forming",
        option_b: "CNC routing",
        option_c: "Additive extrusion",
        option_d: "Laser cutting",
        correct_answer: "A"
      },
      {
        question: "What is the term for a virtual, real-time representation of a physical building used to monitor performance during its lifecycle?",
        option_a: "Digital Twin",
        option_b: "BIM model",
        option_c: "CAD prototype",
        option_d: "Rendering model",
        correct_answer: "A"
      }
    ]
  },
  {
    barrel_id: 16,
    title: "Space Frames & Large Span Engineering",
    description: "Understand structural grids, tetrahedral shapes, and static equilibrium.",
    questions: [
      {
        question: "What is a three-dimensional truss-like structure constructed from interlocking struts in a geometric pattern, used to span large areas with few supports?",
        option_a: "Space frame",
        option_b: "Portal frame",
        option_c: "Balloon frame",
        option_d: "Tension cable network",
        correct_answer: "A"
      },
      {
        question: "Which geometric solid is the primary building block of most space frames due to its inherent structural stability?",
        option_a: "Tetrahedron",
        option_b: "Hexahedron",
        option_c: "Octahedron",
        option_d: "Dodecahedron",
        correct_answer: "A"
      },
      {
        question: "What structural member in a space frame is designed to resist compressive forces along its axis?",
        option_a: "Strut",
        option_b: "Tie",
        option_c: "Cable",
        option_d: "Purlin",
        correct_answer: "A"
      },
      {
        question: "What patented spherical connector system is widely used to join structural tubes in space frames?",
        option_a: "Mero joint",
        option_b: "Cleat plate",
        option_c: "Gusset plate",
        option_d: "Tenon joint",
        correct_answer: "A"
      },
      {
        question: "Who popularized the geodesic dome, which utilizes a spherical space frame system?",
        option_a: "Buckminster Fuller",
        option_b: "Frei Otto",
        option_c: "Walter Gropius",
        option_d: "Le Corbusier",
        correct_answer: "A"
      },
      {
        question: "What structural state is achieved when all forces acting on a structure are balanced, resulting in no acceleration?",
        option_a: "Static equilibrium",
        option_b: "Elastic deformation",
        option_c: "Yield limit",
        option_d: "Ultimate failure",
        correct_answer: "A"
      },
      {
        question: "Which type of structural truss has diagonal members in tension and vertical members in compression?",
        option_a: "Pratt truss",
        option_b: "Warren truss",
        option_c: "Howe truss",
        option_d: "Kingpost truss",
        correct_answer: "A"
      },
      {
        question: "What structural forces pull or stretch a member, causing it to elongate?",
        option_a: "Tension",
        option_b: "Compression",
        option_c: "Shear",
        option_d: "Torsion",
        correct_answer: "A"
      },
      {
        question: "Which structural forces squeeze or crush a member, causing it to shorten?",
        option_a: "Compression",
        option_b: "Tension",
        option_c: "Bending",
        option_d: "Shear",
        correct_answer: "A"
      },
      {
        question: "What is the main structural advantage of a space frame over a traditional linear truss system?",
        option_a: "Multidirectional load distribution",
        option_b: "Thicker structural members",
        option_c: "Higher material weight",
        option_d: "Lower fabrication cost",
        correct_answer: "A"
      }
    ]
  },
  {
    barrel_id: 17,
    title: "History Museums & Spatial Curation",
    description: "Explore circulation flows, gallery lighting design, and historic displays.",
    questions: [
      {
        question: "Which museum circulation layout leads visitors along a single, predetermined, linear path through a sequence of rooms?",
        option_a: "Enfilade",
        option_b: "Central hall radial",
        option_c: "Free-form grid",
        option_d: "Multi-level stack",
        correct_answer: "A"
      },
      {
        question: "What lighting design strategy is crucial in museums to protect sensitive artworks while ensuring high-quality color rendering?",
        option_a: "Indirect skylights with UV filtering",
        option_b: "Direct halogen spotlights",
        option_c: "Low-frequency fluorescent tubes",
        option_d: "Unshielded incandescent bulbs",
        correct_answer: "A"
      },
      {
        question: "The Solomon R. Guggenheim Museum in New York, designed by Frank Lloyd Wright, uses which unique circulation element as its main gallery?",
        option_a: "Continuous spiral ramp",
        option_b: "Grand monumental staircase",
        option_c: "Central glass elevator tower",
        option_d: "Series of parallel escalators",
        correct_answer: "A"
      },
      {
        question: "What refers to the spatial design field focused on planning and organizing museum exhibition layouts and displays?",
        option_a: "Exhibition design / Scenography",
        option_b: "Urban design",
        option_c: "Landscape architecture",
        option_d: "Interior styling",
        correct_answer: "A"
      },
      {
        question: "Which gallery type features modular partition walls that can be easily reconfigured for temporary exhibitions?",
        option_a: "Flexible gallery",
        option_b: "Permanent collection gallery",
        option_c: "Period room",
        option_d: "Atrium courtyard",
        correct_answer: "A"
      },
      {
        question: "The Louvre Pyramid in Paris, designed by I. M. Pei, serves as what primary architectural function?",
        option_a: "Central entrance portal and visitor hub",
        option_b: "Sculpture gallery",
        option_c: "Administrative wing",
        option_d: "Climate-controlled conservation lab",
        correct_answer: "A"
      },
      {
        question: "What museum gallery design incorporates historical architectural interiors or artifacts salvaged from other locations?",
        option_a: "Period room",
        option_b: "White cube gallery",
        option_c: "Black box theater",
        option_d: "Atrium courtyard",
        correct_answer: "A"
      },
      {
        question: "What term describes the neutral, white-walled, rectangular gallery design standard in modern art museums?",
        option_a: "White cube",
        option_b: "Industrial loft",
        option_c: "Neo-classical hall",
        option_d: "Minimalist pavilion",
        correct_answer: "A"
      },
      {
        question: "What is the main architectural challenge of museum climate control systems?",
        option_a: "Maintaining constant temperature and humidity",
        option_b: "High air velocity",
        option_c: "Minimizing duct visibility",
        option_d: "Passive ventilation",
        correct_answer: "A"
      },
      {
        question: "The Centre Pompidou in Paris, designed by Piano and Rogers, is famous for what radical museum architecture style?",
        option_a: "High-tech structural expressionism",
        option_b: "Beaux-Arts classicism",
        option_c: "Brutalist concrete monumentalism",
        option_d: "Deconstructivist glass sculpture",
        correct_answer: "A"
      }
    ]
  },
  {
    barrel_id: 18,
    title: "Solar Passive Chimneys & Natural Venting",
    description: "Investigate convective airflow, stack effects, and passive cooling.",
    questions: [
      {
        question: "What is a solar chimney (thermal chimney) primarily used for in passive building design?",
        option_a: "Inducing natural ventilation through stack effect",
        option_b: "Storing heat in water tanks",
        option_c: "Generating high-voltage electricity",
        option_d: "Filtering exhaust gases",
        correct_answer: "A"
      },
      {
        question: "What physics principle causes warm air to rise and escape through the top of a solar chimney, drawing cooler air in from below?",
        option_a: "Stack effect",
        option_b: "Bernoulli principle",
        option_c: "Venturi effect",
        option_d: "Evaporative cooling",
        correct_answer: "A"
      },
      {
        question: "What color is typically applied to the absorber plate inside a solar chimney to maximize solar heat absorption?",
        option_a: "Matte black",
        option_b: "Highly reflective silver",
        option_c: "Pure white",
        option_d: "Translucent green",
        correct_answer: "A"
      },
      {
        question: "What material is used for the glazing cover of a solar chimney to trap solar radiation while letting light pass through?",
        option_a: "Low-emissivity glass",
        option_b: "Solid sheet metal",
        option_c: "Perforated concrete",
        option_d: "High-density timber",
        correct_answer: "A"
      },
      {
        question: "To optimize solar radiation collection, which direction should the glazing of a solar chimney face in the Northern Hemisphere?",
        option_a: "South",
        option_b: "North",
        option_c: "East",
        option_d: "West",
        correct_answer: "A"
      },
      {
        question: "What passive design feature is often combined with a solar chimney to cool incoming air before it enters the building?",
        option_a: "Earth-to-air heat exchanger",
        option_b: "Mechanical air conditioning",
        option_c: "Electric fan coils",
        option_d: "Solar photovoltaic array",
        correct_answer: "A"
      },
      {
        question: "What refers to the heat storage capacity of a material, like the concrete wall behind the glazing in a solar chimney?",
        option_a: "Thermal mass",
        option_b: "Thermal conductivity",
        option_c: "Thermal resistance",
        option_d: "Thermal transmittance",
        correct_answer: "A"
      },
      {
        question: "The velocity of air flowing through a solar chimney increases with which architectural parameter?",
        option_a: "Height of the chimney",
        option_b: "Thickness of the insulation",
        option_c: "Width of the exit damper",
        option_d: "Area of the foundation",
        correct_answer: "A"
      },
      {
        question: "Which type of solar chimney is integrated into a building's envelope to double as a solar collector and ventilation shaft?",
        option_a: "Facade-integrated solar chimney",
        option_b: "Free-standing solar tower",
        option_c: "Underground thermal duct",
        option_d: "Roof-mounted wind scoop",
        correct_answer: "A"
      },
      {
        question: "What is the primary environmental benefit of using a solar chimney in a green building?",
        option_a: "Zero energy consumption for passive cooling",
        option_b: "High carbon sequestration",
        option_c: "Absolute sound insulation",
        option_d: "Graywater filtration",
        correct_answer: "A"
      }
    ]
  },
  {
    barrel_id: 19,
    title: "Bamboo Joinery & Organic Pavilions",
    description: "Discover the material properties, joint details, and designs of bamboo architectures.",
    questions: [
      {
        question: "What traditional joint type is used to connect hollow bamboo poles together by inserting a smaller bamboo pin?",
        option_a: "Pin-and-peg joinery",
        option_b: "Mortise and tenon",
        option_c: "Dovetail joint",
        option_d: "Steel bolt fastening",
        correct_answer: "A"
      },
      {
        question: "What is the primary chemical treatment used in modern bamboo construction to prevent insect infestation and decay?",
        option_a: "Borax-boric acid solution",
        option_b: "Creosote oil coating",
        option_c: "Polyurethane varnish",
        option_d: "Formaldehyde resin",
        correct_answer: "A"
      },
      {
        question: "Which bamboo structural element is bent using heat or steam to form sweeping, curved roofs in tropical pavilions?",
        option_a: "Split bamboo arches",
        option_b: "Solid bamboo beams",
        option_c: "Laminated bamboo columns",
        option_d: "Woven bamboo trusses",
        correct_answer: "A"
      },
      {
        question: "What is the botanical family to which bamboo belongs, explaining its rapid growth and high flexibility?",
        option_a: "Poaceae",
        option_b: "Pinaceae",
        option_c: "Fabaceae",
        option_d: "Rosaceae",
        correct_answer: "A"
      },
      {
        question: "What structural component is filled with mortar or concrete at the base of a bamboo column to prevent crushing?",
        option_a: "Bamboo internode cavity",
        option_b: "External sleeve joint",
        option_c: "Metal connector plate",
        option_d: "Timber dowel hole",
        correct_answer: "A"
      },
      {
        question: "What foundation type is commonly used for bamboo structures to keep the organic material away from ground moisture?",
        option_a: "Raised concrete piers / Stone plinths",
        option_b: "Direct soil embedment",
        option_c: "Steel screw piles",
        option_d: "Continuous concrete slab",
        correct_answer: "A"
      },
      {
        question: "Which term describes the node points dividing bamboo culms into hollow segments, providing lateral stability?",
        option_a: "Nodes",
        option_b: "Internodes",
        option_c: "Culms",
        option_d: "Sheaths",
        correct_answer: "A"
      },
      {
        question: "What structural advantage does bamboo have over traditional hardwood timber?",
        option_a: "Higher flexibility and rapid renewability",
        option_b: "Uniform diameter",
        option_c: "Complete resistance to fire",
        option_d: "High decay resistance",
        correct_answer: "A"
      },
      {
        question: "What is the hollow space between two nodes inside a bamboo culm called?",
        option_a: "Internode",
        option_b: "Culm chamber",
        option_c: "Node cavity",
        option_d: "Vascular bundle",
        correct_answer: "A"
      },
      {
        question: "Which famous contemporary Colombian architect is known as a pioneer of modern bamboo (Guadua) architecture?",
        option_a: "Simón Vélez",
        option_b: "Shigeru Ban",
        option_c: "Kengo Kuma",
        option_d: "Oscar Niemeyer",
        correct_answer: "A"
      }
    ]
  },
  {
    barrel_id: 20,
    title: "Central Dome Galleries & Vaults",
    description: "Explore the geometries of Pantheon-style oculus domes, pendentives, and squinches.",
    questions: [
      {
        question: "What is the triangular architectural transition element that allows a circular dome to be placed over a square room?",
        option_a: "Pendentive",
        option_b: "Squinch",
        option_c: "Voussoir",
        option_d: "Archivolt",
        correct_answer: "A"
      },
      {
        question: "What is the circular opening at the apex of a dome, such as the one in the Roman Pantheon, that lets in light?",
        option_a: "Oculus",
        option_b: "Lantern",
        option_c: "Drum",
        option_d: "Cupola",
        correct_answer: "A"
      },
      {
        question: "Which architectural structure consists of an arch placed diagonally across the corners of a square room to support a dome?",
        option_a: "Squinch",
        option_b: "Pendentive",
        option_c: "Vault",
        option_d: "Keystone",
        correct_answer: "A"
      },
      {
        question: "The dome of the Hagia Sophia in Istanbul is structurally supported by which combination of elements?",
        option_a: "Four massive pendentives and piers",
        option_b: "Thick solid concrete load-bearing walls",
        option_c: "Internal steel space frame",
        option_d: "Geodesic timber frame",
        correct_answer: "A"
      },
      {
        question: "What is the continuous circular or polygonal wall that supports a dome, often containing windows to light the space below?",
        option_a: "Drum",
        option_b: "Lantern",
        option_c: "Oculus",
        option_d: "Archivolt",
        correct_answer: "A"
      },
      {
        question: "What refers to a vault formed by the intersection of two barrel vaults at right angles?",
        option_a: "Groin vault",
        option_b: "Ribbed vault",
        option_c: "Fan vault",
        option_d: "Barrel vault",
        correct_answer: "A"
      },
      {
        question: "What decorative, recessed panels are carved into the interior surface of a dome to reduce its weight?",
        option_a: "Coffers",
        option_b: "Tesserae",
        option_c: "Frescoes",
        option_d: "Arabesques",
        correct_answer: "A"
      },
      {
        question: "The Taj Mahal dome is an example of which cultural style of dome design, characterized by its bulbous shape?",
        option_a: "Mughal onion dome",
        option_b: "Roman classical dome",
        option_c: "Byzantine hemispherical dome",
        option_d: "Gothic ribbed dome",
        correct_answer: "A"
      },
      {
        question: "What structural element sits on top of a dome, often enclosing a small oculus while providing ventilation and light?",
        option_a: "Lantern / Cupola",
        option_b: "Drum",
        option_c: "Finial",
        option_d: "Tympanum",
        correct_answer: "A"
      },
      {
        question: "What structural material was used by the Romans to cast the massive dome of the Pantheon?",
        option_a: "Unreinforced concrete with lightweight tufa aggregate",
        option_b: "Solid carved granite blocks",
        option_c: "Brickwork with lime mortar",
        option_d: "Structural steel framing",
        correct_answer: "A"
      }
    ]
  }
];
