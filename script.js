 function generateImage() {
            document.getElementById("randomImage").src =
                `https://picsum.photos/800/500?random=${Date.now()}`;
        }