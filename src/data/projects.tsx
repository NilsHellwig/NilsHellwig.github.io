type Project = {
  id?: string;
  title: string;
  subtitle: string;
  description?: string;
  technologies?: string[];
  programmingLanguages?: string[];
  type: string;
  category: string;
  iconPath: string;
  galleryImages?: string[];
  links?: { name: string; url: string }[];
};

export const PROJECTS: Project[] = [
  {
    id: "annoabsa",
    title: "AnnoABSA",
    subtitle: "AI-assisted (RAG) annotation tool for Aspect-Based Sentiment Analysis",
    description:
      "AnnoABSA is a modern annotation tool for Aspect-Based Sentiment Analysis, enabling researchers to efficiently label text data for NLP tasks. The application features an intuitive React-based interface with smart phrase selection, visual color-coded annotations, and optional AI-powered prediction assistance using LLMs (OS models via ollama or commercial models via OpenAI API). It supports multilingual datasets with translation display, provides comprehensive analytics including timing metrics, and handles both CSV and JSON formats. The tool offers flexible configuration through a CLI, supports custom sentiment elements and categories, and includes features like automatic phrase cleaning, dark mode, and embedded PDF annotation guidelines for maintaining consistent annotation standards.",
    type: "Web-App",
    category: "AI & NLP",
    programmingLanguages: ["TypeScript", "Python"],
    technologies: ["React", "Vite", "Tailwind", "FastAPI", "Ollama", "OpenAI API", "BM25"],
    iconPath: require("../img/icons/projects/annoabsa.png"),
    galleryImages: ["annoabsa/annoabsa-1.png"],
    links: [
      {
        name: "GitHub Repository: ABSA Annotation Tool",
        url: "https://github.com/NilsHellwig/ABSA-annotation-tool",
      },
    ],
  },
  {
    id: "basisdokument",
    title: "Das Basisdokument",
    subtitle: "Digital structuring for civil proceedings.",
    description:
      '"Das Basisdokument" enables lawyers and judges to create their previous analogue correspondence in a digital environment. The application was created as a co-operation between media informatics group and the faculty of law at University of Regensburg. From 2023 on, the implemented application was used at several courts in Bavaria and Lower Saxony, laying the first foundation stone for the digitalisation of civil proceedings. I recommend using the demo at https://app.parteivortrag.de/ since the hosted application does not have a backend for privacy reasons. You can experiment freely on the domain without any concerns.',
    type: "Web-App",
    category: "Software Development",
    programmingLanguages: ["TypeScript"],
    technologies: ["Tailwind", "HTML", "CSS", "Radix", "Draft.js"],
    iconPath: require("../img/icons/projects/basisdokument.png"),
    galleryImages: [
      "basisdokument/basisdokument-1.png",
      "basisdokument/basisdokument-2.png",
      "basisdokument/basisdokument-3.png",
      "basisdokument/basisdokument-4.png",
      "basisdokument/basisdokument-5.png",
    ],
    links: [
      {
        name: "Universität Regensburg: Basisdokument",
        url: "https://www.uni-regensburg.de/forschung/reallabor-parteivortrag-im-zivilprozess/startseite",
      },
      {
        name: "Justizministerium Bayern: Reallabor Strukturvorgaben im Zivilprozess",
        url: "https://www.justiz.bayern.de/presse-und-medien/pressemitteilungen/archiv/2023/52.php",
      },
      {
        name: "GitHub Repository: Das Basisdokument",
        url: "https://github.com/markusbink/basisdokument-implementierung",
      },
      { name: "Demo (without Backend)", url: "https://app.parteivortrag.de/" },
    ],
  },
  {
    id: "device-manager",
    title: "UR Device Manager",
    subtitle: "Device Management for the University of Regensburg",
    description:
      "This device manager was dockerized application developed as part of the course Advanced Software Engineering (module code: 36632b) at the University of Regensburg. The Device Manager is a web-based solution for managing devices at the University of Regensburg. For this purpose, a backend with FastAPI ⚡ and a SQLite database as well as a frontend with React.js ⚛️ were implemented.",
    type: "Web-App",
    category: "Software Development",
    programmingLanguages: ["JavaScript", "Python"],
    technologies: ["FastApi", "Uvicorn", "Bcrypt", "PyTest", "SQLAlchemy", "Radix", "React.js"],
    iconPath: require("../img/icons/projects/ur-device-manager.svg").default,
    galleryImages: [
      "device-manager/device-manager-1.png",
      "device-manager/device-manager-2.gif",
      "device-manager/device-manager-3.gif",
      "device-manager/device-manager-4.gif",
    ],
    links: [
      {
        name: "GitLab Repository: Device Manager",
        url: "https://github.com/NilsHellwig/UR-Device-Manager",
      },
    ],
  },
  {
    id: "amadeus",
    title: "AMADEUS",
    subtitle: "Free, data protection-compliant lesson evaluation",
    description:
      "Using AMADEUS (Anonymous Mobile App for Digital Classroom Evaluation by Students), you, as an educator, can easily, quickly, and reliably have the quality of your teaching assessed by students. The application is provided by the research group FALKO-PV at the University of Regensburg and is continually supported by ongoing scientific research. The use of the evaluation app is in compliance with data protection regulations and is entirely free of charge. The development process involved the utilization of Django, a high-level web framework written in Python. Django was chosen as the primary technology to build and structure the application.",
    type: "Web-App",
    category: "Software Development",
    programmingLanguages: ["Python"],
    technologies: ["Django", "HTML", "CSS", "numpy", "pandas", "matplotlib", "svglib", "seaborn"],
    iconPath: require("../img/icons/projects/amadeus.png"),
    galleryImages: [
      "amadeus/amadeus-1.png",
      "amadeus/amadeus-2.png",
      "amadeus/amadeus-3.png",
      "amadeus/amadeus-4.png",
    ],
    links: [
      { name: "AMADEUS App", url: "https://amadeus.falko-pv.de/" },
      { name: "GitHub Repository: AMADEUS", url: "https://github.com/FALKO-PV/amadeus" },
    ],
  },
  {
    id: "byles",
    title: "ByLes: Bayerisches Lesescreening",
    subtitle: "XDEV Software GMBH x Uni Regensburg",
    description:
      "ByLes is a state-funded project aimed at assessing the reading skills of students across Bavaria. The system provides a standardized, digital screening procedure used in schools to evaluate students' reading abilities at different educational stages. The collected data of about 200,000 pupils supports teachers and educational authorities in identifying students who may require additional support, enabling targeted interventions to promote literacy development throughout the region.",
    type: "Web-App",
    category: "Software Development",
    programmingLanguages: ["TypeScript", "Java"],
    technologies: [
      "Next.js",
      "Tailwind",
      "HTML",
      "CSS",
      "Swagger UI",
      "Quarkus",
      "Hibernate ORM",
      "Flyway",
      "Maven",
    ],
    iconPath: require("../img/icons/projects/byles.png"),
    galleryImages: [],
    links: [
      {
        name: "ByCs: Byles",
        url: "https://www.bycs.de/hilfe-und-tutorials/eddipuls/byles-bayerisches-lesescreening/index.html",
      },
      {
        name: "Süddeutsche Zeitung: ByLes",
        url: "https://www.sueddeutsche.de/sonderthemen/bayern/anna-stolz-schluessel-pisa-offensive-neues-bayerisches-lesescreening-grundschulen-freistaat-menschen-230431",
      },
    ],
  },
  {
    id: "bird-id",
    title: "BirdID",
    subtitle: "App for Bird species identification",
    description:
      "BirdID is a mobile application designed for the recognition of 307 distinct bird species through image recognition utilizing Convolutional Neural Networks (CNN). This project was developed as a component of my bachelor’s thesis. React Native served as the framework for the application, while the CNN underwent training, validation, and testing processes with an extensive dataset comprising almost 300,000 bird images sourced from Flickr. The deployment of the trained CNN model was achieved using Flask.",
    type: "App",
    category: "AI & Mobile Apps",
    programmingLanguages: ["Python", "JavaScript"],
    technologies: [
      "React Native",
      "Expo",
      "Redux",
      "Flask",
      "Tensorflow",
      "sklearn",
      "pandas",
      "numpy",
      "SQLite",
      "AdobeXD",
    ],
    iconPath: require("../img/icons/projects/bird-id.png"),
    galleryImages: ["bird-id/bird-id-1.png", "bird-id/bird-id-2.png", "bird-id/bird-id-3.png"],
    links: [{ name: "GitHub Repository: BirdID", url: "https://github.com/NilsHellwig/birdid" }],
  },
  {
    id: "vall-music",
    title: "Vall Music",
    subtitle: "New Portfolio for French producer Vall",
    description:
      "I had the privilege of crafting the online identity for French music producer Vall. With several million streams on Spotify, Vall specializes in producing captivating Tropical House music. To bring this project to life, I employed Angular and Tailwind. You can explore the website at vall-music.com. Unfortunately, due to legal constraints, I'm unable to share the GitHub repository with the Angular Code. Nevertheless, I invite you to experience the site firsthand!",
    type: "Website",
    category: "Web Development",
    programmingLanguages: ["JavaScript"],
    technologies: ["Angular", "HTML", "CSS", "Tailwind"],
    iconPath: require("../img/icons/projects/vall-music.svg").default,
    galleryImages: [
      "vall-music/vall-music-1.png",
      "vall-music/vall-music-2.png",
      "vall-music/vall-music-3.png",
      "vall-music/vall-music-4.png",
    ],
    links: [
      {
        name: "GitHub Repository: Artist Portfolio",
        url: "https://github.com/NilsHellwig/Artist-Portfolio",
      },
    ],
  },
  {
    id: "whistle-tube",
    title: "WhistleTube",
    subtitle: "A slightly different messenger service",
    description:
      'WhistleTube is a small messenger service that I developed as a personal project, driven by the goal of expanding my knowledge in various technologies. Instead of focusing on extensive features, the main aim was to gain hands-on experience with specific technologies. The central idea behind WhistleTube revolves around an infinite number of chatrooms. Each chatroom has a unique "Tube ID", allowing anyone to join the conversations. All messages are permanently stored in a MongoDB database. To facilitate real-time chat, I implemented socket.io. User authentication is handled using JWT tokens. On the frontend, Vue.js (specifically, Vite) was used in conjunction with Tailwind for a smooth and responsive user interface. While the project is not currently publicly accessible via a URL, I have plans to make further updates and improvements. I enjoy using the application with my friends and am excited about enhancing its features.',
    type: "Web-App",
    category: "Web Development",
    programmingLanguages: ["JavaScript"],
    technologies: [
      "Node.js",
      "MongoDB",
      "mongoose",
      "JWT",
      "Express.js",
      "Vue.js",
      "Tailwind",
      "HTML",
      "CSS",
      "AdobeXD",
    ],
    iconPath: require("../img/icons/projects/whistle-tube.svg").default,
    galleryImages: [
      "whistle-tube/whistle-tube-1.png",
      "whistle-tube/whistle-tube-2.png",
      "whistle-tube/whistle-tube-3.png",
    ],
    links: [
      {
        name: "GitHub Repository: WhistleTube",
        url: "https://github.com/NilsHellwig/WhistleTube-Front-end",
      },
    ],
  },
  {
    id: "discover-malta",
    title: "Discover Malta",
    subtitle: "A fictional vacation blog implemented with docsify",
    description:
      "DiscoverMalta is a fictional travel blog crafted using docsify, a straightforward document converter. The content is entirely fictional and was generated using GPT-2. You can explore the page here: https://homepages.ur.de/~hen58277/60218/ws202021/abgabe/docsify/#/.",
    type: "Website",
    category: "Web Development",
    programmingLanguages: ["JavaScript"],
    technologies: ["Docsify", "HTML", "CSS", "Markdown"],
    iconPath: require("../img/icons/projects/discover-malta.png"),
    galleryImages: [
      "discover-malta/discover-malta-1.png",
      "discover-malta/discover-malta-2.png",
      "discover-malta/discover-malta-3.png",
      "discover-malta/discover-malta-4.png",
    ],
    links: [
      {
        name: "GitHub Repository: DiscoverMalta",
        url: "https://github.com/NilsHellwig/DiscoverMalta",
      },
    ],
  },
  {
    id: "game-hub",
    title: "GameHub",
    subtitle: "A platform for reviewing games",
    description:
      "GameHub represents a significant milestone as it marks the first single-page application I have ever developed. This platform empowers users to explore new games, share gaming experiences, and rate games and user reviews. The app features the ability to rate the reviews posted by other users and emphasizes the importance of organizing games into personalized \"catalogs\". These catalogs serve various purposes, such as curating collections of favorite games. Originally designed as a web application primarily for mobile devices, users can easily add the app to their home screens for a seamless full-screen experience. Looking ahead, there is potential for a transition into a native app format (apk/ipa), with Apache Cordova being a viable option. It's worth noting that while the application was developed using Cordova, the primary focus was on functionality rather than content creation—texts were generated using GPT-2, and images were sourced from Pexels/Pixabay. GameHub isn't available for public at the moment but the code is available on my GitHub account.",
    type: "Web-App",
    category: "Web Development",
    programmingLanguages: ["JavaScript"],
    technologies: ["Node.js", "framework7", "HTML", "CSS", "Firebase", "Cordova"],
    iconPath: require("../img/icons/projects/game-hub.svg").default,
    galleryImages: [
      "game-hub/game-hub-1.png",
      "game-hub/game-hub-2.png",
      "game-hub/game-hub-3.png",
      "game-hub/game-hub-4.png",
      "game-hub/game-hub-5.gif",
      "game-hub/game-hub-6.gif",
    ],
    links: [{ name: "GitHub Repository: GameHub", url: "https://github.com/NilsHellwig/GameHub" }],
  },
  {
    id: "weather-assistant",
    title: "weather Assistant",
    subtitle: "ChatBot for the weather",
    description:
      "The Weather Assistant is a chat bot designed for users to inquire about weather data. Questions must be posed in German. It can provide answers to highly specific queries about the weather, including details like air pressure, as well as simpler ones such as predicting when it will rain again. The development of this bot was undertaken as part of an advanced Natural Language Processing course, where methods learned in two semesters of Natural Language Processing courses were put into practical application.",
    type: "Python Application",
    category: "AI & NLP",
    programmingLanguages: ["Python", "JavaScript"],
    technologies: [
      "HTML",
      "CSS",
      "geocoder",
      "geopy",
      "pywheatherbit",
      "xmltodict",
      "Lark",
      "sklearn",
      "flask",
      "spacy",
      "NLTK",
      "pandas",
    ],
    iconPath: require("../img/icons/projects/weather-assistant.svg").default,
    galleryImages: ["weather-assistant/weather-assistant-1.png"],
    links: [
      {
        name: "GitHub Repository: weather Assistant",
        url: "https://github.com/solaris-isbc/weather-assistant",
      },
    ],
  },
  {
    id: "uni-hub",
    title: "UniHub",
    subtitle: "Platform for storing documents during academic studies.",
    description:
      "Given the abundance of (organizational) documents that may accumulate throughout a university study, this application serves as a digital repository for systematically storing and organizing these documents. The app also offers encryption functionality, leveraging a fingerprint sensor for enhanced security. Developed for Android, this project represents one of my early university endeavors, originating in the year 2019.",
    type: "App",
    category: "Mobile Apps",
    programmingLanguages: ["Java"],
    technologies: ["XML", "Android", "Responsive Layout", "Fingerprint Authentication", "SQLite"],
    iconPath: require("../img/icons/projects/uni-hub.svg").default,
    galleryImages: [
      "uni-hub/uni-hub-1.png",
      "uni-hub/uni-hub-2.png",
      "uni-hub/uni-hub-3.png",
      "uni-hub/uni-hub-4.png",
      "uni-hub/uni-hub-5.png",
    ],
    links: [
      {
        name: "GitHub Repository: UniHub",
        url: "https://github.com/NilsHellwig/Document-Scanner-App",
      },
    ],
  },
  {
    id: "flickr-fetcher",
    title: "TheFlickrFetcher",
    subtitle: "Image data extraction tool for Flickr",
    description:
      "TheFlickrFetcher is a powerful tool designed for efficiently downloading huge amounts of image data from Flickr. It allows users to fetch up to 1500 images per search term. The primary audience for this tool is machine learning experts seeking a systematic approach to collecting image data with a defined folder structure. Users can download folders for training, testing, and validation purposes, with the resulting structure compatible with tensorflow/keras generators. Additionally, the tool offers the option to save image URLs to a .CSV file for further reference. The only prerequisites are Python 3 (along with the required packages listed in requirements.txt) and a free API key from Flickr.",
    type: "Python Utility",
    category: "AI & Data Collection",
    programmingLanguages: ["Python"],
    technologies: ["flickrapi", "pandas", "Pillow"],
    iconPath: require("../img/icons/projects/flickr-fetcher.svg").default,
    galleryImages: ["flickr-fetcher/flickr-fetcher-1.png"],
    links: [{ name: "", url: "" }],
  },
  {
    id: "image-fetcher",
    title: "TheImageFetcher",
    subtitle: "Image data extraction tool for Google images",
    description:
      "TheImageFetcher is an efficient tool that enables users to swiftly extract a substantial number of images from Google Images. Depending on the internet connection, it can retrieve over 70 high-resolution images within seconds. The tool provides the option to save the URLs of these images in an external text file, and users can specify the destination path for saving the images associated with a particular search query",
    type: "Python Utility",
    category: "AI & Data Collection",
    programmingLanguages: ["Python"],
    technologies: ["Chromium", "Selenium"],
    iconPath: require("../img/icons/projects/image-fetcher.svg").default,
    galleryImages: ["image-fetcher/image-fetcher-1.png"],
    links: [
      {
        name: "GitHub Repository: TheFlickrFetcher",
        url: "https://github.com/NilsHellwig/TheFlickrFetcher",
      },
    ],
  },
  {
    id: "id3-algorithm",
    title: "ID3-Algorithm",
    subtitle: "A decision tree algorithm implemented in Java",
    description:
      "D3 (Iterative Dichotomiser 3) is an algorithm developed by Ross Quinlan to construct decision trees from datasets. Serving as a precursor to the C4.5 algorithm, D3 finds extensive application in machine learning and natural language processing. The algorithm is showcased using the renowned Titanic dataset from Kaggle (https://www.kaggle.com/c/titanic). Leveraging demographic and background data, such as passenger class, it predicts whether a passenger survived or not. The model achieved an accuracy of 74.6% on the Kaggle test dataset. Furthermore, through 5-fold cross-validation, an accuracy of 78.3% was attained.",
    type: "Java Utility",
    category: "AI & Data Science",
    programmingLanguages: ["Java"],
    technologies: ["GraphViz", "Java PrintStream"],
    iconPath: require("../img/icons/projects/id3-algorithm.svg").default,
    galleryImages: ["id3-algorithm/id3-algorithm-1.png", "id3-algorithm/id3-algorithm-2.png"],
    links: [
      { name: "ID3 Algorithm", url: "https://github.com/NilsHellwig/Decision-Tree-Algorithm" },
    ],
  },
  {
    id: "predestrian-rnn",
    title: "Pedestrian RNN",
    subtitle: "Position prediction using a recurrent neural network",
    description:
      "The prediction of pedestrians' walking paths plays a crucial role in the development of autonomous driving systems. This research focused on predicting 12 future positions of pedestrians based on 8 initial positions, with data gathered using a laser scanner as pedestrians moved through a street intersection. To address this regression problem, a Recurrent Neural Network (RNN) was employed, utilizing a many-to-one architecture. The implementation of this architecture was carried out using Tensorflow/Keras.",
    type: "Python Utility",
    category: "AI & Data Science",
    programmingLanguages: ["Python"],
    technologies: ["Tensorflow", "Keras", "Sklearn", "Pandas", "Numpy", "matplotlib"],
    iconPath: require("../img/icons/projects/pedestrian-rnn.svg").default,
    galleryImages: [
      "pedestrian-rnn/pedestrian-rnn-1.png",
      "pedestrian-rnn/pedestrian-rnn-2.png",
      "pedestrian-rnn/pedestrian-rnn-3.png",
    ],
    links: [
      {
        name: "GitHub Repository: Pedestrian RNN",
        url: "https://github.com/NilsHellwig/RNN-for-pedestrian-movement-prediction",
      },
    ],
  },
  {
    id: "painting-colorizer",
    title: "Painting Colorizer",
    subtitle: "Colorizing black and white images",
    description:
      "To add color to black and white paintings, a Conditional Generative Adversarial Neural Network (pix2pix) can be employed. The pix2pix architecture learns a mapping from input images to output images, following the principles outlined in the paper by Isola et al. (2017). This approach utilizes supervised learning, where a dataset of paintings is collected for training. The generator employs a U-Net based architecture, while the discriminator is implemented as a convolutional PatchGAN classifier, aligning with the recommendations in the pix2pix paper.",
    type: "Python Utility",
    category: "AI & Data Science",
    programmingLanguages: ["Python"],
    technologies: ["Tensorflow", "Keras", "pandas", "numpy", "matplotlib"],
    iconPath: require("../img/icons/projects/painting-colorizer.png"),
    galleryImages: [
      "painting-colorizer/painting-colorizer-1.png",
      "painting-colorizer/painting-colorizer-2.png",
      "painting-colorizer/painting-colorizer-3.png",
      "painting-colorizer/painting-colorizer-4.png",
    ],
    links: [
      {
        name: "GitHub Repository: Painting Colorizer",
        url: "https://github.com/NilsHellwig/Painting-Colorizer",
      },
    ],
  },
  {
    id: "flight-delay-prediction",
    title: "Flight delay prediction with SVM",
    subtitle: "Flight delay prediction for munich airport ",
    description:
      "Within the scope of the Web & Data Science course, I trained a prediction model for flight departure delays at Munich Airport using metadata from over 200k flights taking off between 2020 and 2023. To tackle this regression task, I utilized a Support Vector Machine (SVM) model. The implementation was carried out in R, as this was a predefined requirement for this project.",
    type: "R Project",
    category: "AI & Data Science",
    programmingLanguages: ["R"],
    technologies: ["ggplot", "tidyverse", "dplyr", "forcats", "caret", "e1071"],
    iconPath: require("../img/icons/projects/flight-delay-prediction.svg").default,
    galleryImages: [
      "flight-delay-prediction/flight-delay-prediction-1.png",
      "flight-delay-prediction/flight-delay-prediction-2.png",
    ],
    links: [
      {
        name: "GitHub Repository: Flight Delay Prediction",
        url: "https://github.com/NilsHellwig/Abschlussprojekt-Web-Data-Science",
      },
    ],
  },
  {
    id: "bibtexy",
    title: "BibTeXy",
    subtitle: "Turn any webpage into a BibTeX entry.",
    description:
      "BibTeXy is a browser extension that reads the page you're currently on and asks a language model (a local Ollama model or OpenAI) to extract a citation for it, no copy-pasting metadata by hand or guessing field names. A BibTeX entry covering roughly 25 fields (title, author, editor, year, journal, DOI, ISBN, keywords, ...) is modeled once as a Zod schema and turned into a JSON Schema via z.toJSONSchema(), which is then handed to the provider as a hard output constraint (Ollama's format parameter or OpenAI's Structured Outputs in strict mode), so the model is grammar-constrained to emit only valid JSON matching that shape, instead of hoping it produces parseable output. The prompt additionally instructs the model to only fill in fields it's actually confident about and return null for the rest, avoiding hallucinated page numbers or invented DOIs. The response is parsed and re-validated against the same Zod schema on the client before being formatted into a BibTeX string, so a single typed schema drives extraction, provider constraints, and validation end to end. It remembers the configured Ollama URL, OpenAI key, and last-used model, and ships to Firefox, Chrome, and Edge from a single WXT-based codebase. Being local-first with Ollama, it has no backend of its own: page content is sent only to the LLM endpoint you configured.",
    type: "Browser Extension",
    category: "AI & NLP",
    programmingLanguages: ["TypeScript"],
    technologies: ["WXT", "React", "Zod", "Ollama", "OpenAI API", "Vite"],
    iconPath: require("../img/icons/projects/bibtexy.png"),
    galleryImages: ["bibtexy/bibtexy-1.png"],
    links: [
      {
        name: "GitHub Repository: BibTeXy",
        url: "https://github.com/NilsHellwig/bibtexy",
      },
    ],
  },
  {
    id: "portfolio",
    title: "portfolio",
    subtitle: "Nils' porfolio from June 2024",
    description:
      "I aimed to create a unique portfolio to showcase my projects, skills, publications, and courses. The design was developed entirely from scratch, without using any pre-made templates.",
    type: "Website",
    category: "Web Development",
    programmingLanguages: ["TypeScript"],
    technologies: ["HTML", "CSS", "Framer Motion", "Tailwind", "Radix", "React"],
    iconPath: require("../img/icons/projects/portfolio.png"),
    galleryImages: [
      "portfolio/portfolio-1.png",
      "portfolio/portfolio-2.png",
      "portfolio/portfolio-3.png",
      "portfolio/portfolio-4.png",
    ],
    links: [
      {
        name: "GitHub Repository: Portfolio",
        url: "https://github.com/NilsHellwig/NilsHellwig.github.io",
      },
    ],
  },
];
