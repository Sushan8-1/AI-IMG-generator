const themeToggle = document.querySelector(".theme-toggle");
const promptForm = document.querySelector(".prompt-form");
const promptInput = document.querySelector(".prompt-input");
const promptBtn = document.querySelector(".prompt-btn");
const modelSelect = document.getElementById("model-select");
const countSelect = document.getElementById("count-select");
const ratioSelect = document.getElementById("ratio-select");
const gridGallery = document.querySelector(".gallery-grid");

const examplePrompts = [
    "A futuristic city at night with glowing neon lights and flying cars.",
    "A cute robot sitting in a flower field at sunset.",
    "An astronaut floating in space with Earth in the background.",
    "A cyberpunk street market filled with holograms and rain reflections.",
    "A fantasy castle built on a floating island above the clouds.",
    "A dragon flying over a snowy mountain range.",
    "A peaceful Japanese garden with cherry blossoms falling.",
    "A futuristic samurai standing in neon armor.",
    "A magical forest glowing with blue and purple lights.",
    "A pirate ship sailing through the sky instead of ocean.",
    "A giant mechanical elephant walking through a desert.",
    "A cozy cabin in the mountains during heavy snowfall.",
    "A sci-fi spaceship interior with glowing control panels.",
    "A lion made of fire roaring in a dark battlefield.",
    "A surreal world where oceans float in the sky.",
    "A medieval knight facing a glowing magical portal.",
    "A city built underwater with glass domes and sea life.",
    "A cute cat wearing a tiny astronaut suit in space.",
    "A time travel machine opening a portal to ancient Egypt.",
    "A futuristic motorcycle racing through a neon tunnel.",
    "A giant tree that holds an entire village inside it.",
    "A wizard casting spells under a stormy sky.",
    "A snowy cyberpunk Tokyo street with neon signs.",
    "A hyper-realistic portrait of a half-human half-android face.",
    "A desert planet with two suns and strange rock formations.",
    "A floating library in the sky with glowing books.",
    "A battle between light and dark energy beings.",
    "A peaceful lake reflecting a galaxy in the night sky.",
    "A steampunk airship flying over Victorian London.",
    "A cute alien exploring Earth for the first time.",
];

(() => {
    const savedTheme = localStorage.getItem("theme");

    const systemPrefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
    ).matches;

    const isDarkTheme =
    savedTheme === "dark" || (!savedTheme && systemPrefersDark);

    document.body.classList.toggle("dark-theme", isDarkTheme);

    themeToggle.querySelector("i").className = isDarkTheme
    ? "fa-solid fa-sun"
    : "fa-solid fa-moon";
})();

const toggleTheme = () => {
    const isDarkTheme = document.body.classList.toggle("dark-theme");

    localStorage.setItem("theme", isDarkTheme ? "dark" : "light");

    themeToggle.querySelector("i").className = isDarkTheme
    ? "fa-solid fa-sun"
    : "fa-solid fa-moon";
};

const getImageDimensions = (aspectRatio, baseSize = 512) => {
    const [width, height] = aspectRatio.split("/").map(Number);

  const scaleFactor = baseSize / Math.sqrt(width * height);

  let calculatedWidth = Math.round(width * scaleFactor);
  let calculatedHeight = Math.round(height * scaleFactor);

  calculatedWidth = Math.floor(calculatedWidth / 16) * 16;
  calculatedHeight = Math.floor(calculatedHeight / 16) * 16;

    return {
    width: calculatedWidth,
    height: calculatedHeight,
    };
};

const updateImageCard = (imgIndex, imgUrl) => {
    const imgCard = document.getElementById(`img-card-${imgIndex}`);

    if (!imgCard) return;

    imgCard.classList.remove("loading");

    imgCard.innerHTML = `
    <img src="${imgUrl}" class="result-img">

    <div class="img-overlay">
        <a 
        href="${imgUrl}" 
        class="img-download-btn" 
        download="${Date.now()}-image.png"
        >
        <i class="fa-solid fa-download"></i>
        </a>
    </div>
    `;
};

const generateImages = async (
    selectedModel,
    imageCount,
    aspectRatio,
    promptText
) => {
    const { width, height } = getImageDimensions(aspectRatio);

    const imagePromises = Array.from(
    { length: imageCount },
    async (_, i) => {
        try {
        const response = await fetch("http://localhost:3000/generate", {
            method: "POST",

            headers: {
            "Content-Type": "application/json",
            },

            body: JSON.stringify({
            prompt: promptText,
            model: selectedModel,
            width,
            height,
            }),
        });

        if (!response.ok) {
            throw new Error("Image generation failed");
        }

        const data = await response.json();

        updateImageCard(i, data.imageUrl);
        } catch (error) {
        console.log(error);

        const imgCard = document.getElementById(`img-card-${i}`);

        if (imgCard) {
            imgCard.classList.remove("loading");

            imgCard.innerHTML = `
            <div class="status-container error">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <p class="status-text">
                Failed to generate image
                </p>
            </div>
            `;
        }
        }
    }
    );

    await Promise.allSettled(imagePromises);
};

const createImageCards = (
    selectedModel,
    imageCount,
    aspectRatio,
    promptText
) => {
    gridGallery.innerHTML = "";

    for (let i = 0; i < imageCount; i++) {
    gridGallery.innerHTML += `
        <div 
        class="img-card loading" 
        id="img-card-${i}" 
        style="aspect-ratio: ${aspectRatio}"
        >
        <div class="status-container">
            <div class="spinner"></div>

            <p class="status-text">
            Generating...
            </p>
        </div>
        </div>
    `;
    }

    generateImages(
    selectedModel,
    imageCount,
    aspectRatio,
    promptText
    );
};

const handleFormSubmit = (e) => {
    e.preventDefault();

    const selectedModel = modelSelect.value;

    const imageCount = parseInt(countSelect.value) || 1;

    const aspectRatio = ratioSelect.value || "1/1";

    const promptText = promptInput.value.trim();

    if (!promptText) return;

    createImageCards(
    selectedModel,
    imageCount,
    aspectRatio,
    promptText
    );
};

promptBtn.addEventListener("click", () => {
    const prompt =
    examplePrompts[
      Math.floor(Math.random() * examplePrompts.length)
    ];

    promptInput.value = prompt;

    promptInput.focus();
});

promptForm.addEventListener("submit", handleFormSubmit);

themeToggle.addEventListener("click", toggleTheme);
