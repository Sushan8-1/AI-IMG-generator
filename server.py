from openai import OpenAI
import base64
from datetime import datetime
import os

client = OpenAI()

def generate_image(prompt):
    print("Generating image for:", prompt)

    try:
        result = client.images.generate(
            model="gpt-image-1",
            prompt=prompt,
            size="1024x1024"
        )

        image_base64 = result.data[0].b64_json
        image_bytes = base64.b64decode(image_base64)

        filename = f"image_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"

        with open(filename, "wb") as f:
            f.write(image_bytes)

        print("Saved:", filename)

    except Exception as e:
        print("Error generating image:", e)


def enhance_prompt(prompt):
    return f"high quality, detailed, cinematic lighting, {prompt}"


if __name__ == "__main__":
    print("AI Image Generator Started")

    while True:
        prompt = input("Enter prompt (or type exit): ")

        if prompt.lower().strip() == "exit":
            break

        if not prompt.strip():
            print("Please enter a valid prompt")
            continue

        final_prompt = enhance_prompt(prompt)
        generate_image(final_prompt)
