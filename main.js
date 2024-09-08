import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import Base64 from 'base64-js';
import MarkdownIt from 'markdown-it';
import './style.css';
import { API_KEY } from './variables.js';



let imageForm = document.querySelector('#imageContent form');
let imagePromptInput = document.querySelector('#imageContent input[name="prompt"]');
let imageOutput = document.querySelector('#imageContent .output');

imageForm.onsubmit = async (ev) => {
    ev.preventDefault();
    imageOutput.textContent = 'Generating...';
    try {
        const imageInput = document.getElementById('imageInput');

        const imageFile = imageInput.files[0];
        const imageBase64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(imageFile);
            reader.onload = () => {
                const base64String = reader.result.split(',')[1];
                resolve(base64String);
            };
            reader.onerror = reject;
        });

        // Determine MIME type based on file extension
        const mimeType = imageFile.type || 'image/jpeg'; // Default to JPEG if type not detected

        // Gemini API interaction
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            safetySettings: [
                {
                    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
                },
            ],
        });
        const contents = [
            {
                role: 'user',
                parts: [
                    { inline_data: { mime_type: mimeType, data: imageBase64 } },
                    { text: imagePromptInput.value }
                ]
            }
        ];
        const result = await model.generateContentStream({ contents });
        let buffer = [];
        let md = new MarkdownIt();
        for await (let response of result.stream) {
            buffer.push(response.text());
            imageOutput.innerHTML = md.render(buffer.join(''));
        }
    } catch (e) {
        imageOutput.innerHTML += '<hr>' + e;
    }
};


let pdfForm = document.querySelector('#pdfContent form');
let pdfPromptInput = document.querySelector('#pdfContent input[name="pdfPrompt"]');
let pdfOutput = document.querySelector('.pdfOutput');
pdfForm.onsubmit = async (ev) => {
    ev.preventDefault();
    pdfOutput.textContent = 'Generating...';
    try {
        const pdfInput = document.getElementById('pdfInput');
        const pdfFile = pdfInput.files[0];
        const pdfBase64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(pdfFile);
            reader.onload = () => {
                const base64String = reader.result.split(',')[1];
                resolve(base64String);
            };
            reader.onerror = reject;
        });
        // Gemini API interaction
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            safetySettings: [
                {
                    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
                },
            ],
        });
        const contents = [
            {
                role: 'user',
                parts: [
                    { inline_data: { mime_type: 'application/pdf', data: pdfBase64 } },
                    { text: pdfPromptInput.value }
                ]
            }
        ];
        const result = await model.generateContentStream({ contents });
        let buffer = [];
        let md = new MarkdownIt();
        for await (let response of result.stream) {
            buffer.push(response.text());
            pdfOutput.innerHTML = md.render(buffer.join(''));
        }
    } catch (e) {
        pdfOutput.innerHTML += '<hr>' + e;
    }
};

let textForm = document.querySelector('#textContent form');
let textPromptInput = document.querySelector('#textContent textarea[name="textPrompt"]');
let textOutput = document.querySelector('.textOutput');

textForm.onsubmit = async (ev) => {
    ev.preventDefault();
    textOutput.textContent = 'Generating...';

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            safetySettings: [
                {
                    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
                },
            ],
        });

        const contents = [
            {
                role: 'user',
                parts: [
                    { text: textPromptInput.value }
                ]
            }
        ];

        const result = await model.generateContentStream({ contents });

        let buffer = [];
        let md = new MarkdownIt();
        for await (let response of result.stream) {
            buffer.push(response.text());
            textOutput.innerHTML = md.render(buffer.join(''));
        }

    } catch (e) {
        textOutput.innerHTML += '<hr>' + e;
    }
};


const sparkle = document.querySelector(".sparkle");

var current_star_count = 0;

const MAX_STARS = 40;
const STAR_INTERVAL = 16;

const MAX_STAR_LIFE = 2;
const MIN_STAR_LIFE = 1;

const MAX_STAR_SIZE = 60;
const MIN_STAR_SIZE = 20;

const MIN_STAR_TRAVEL_X = 100;
const MIN_STAR_TRAVEL_Y = 70;

const Star = class {
  constructor() {
    this.size = this.random(MAX_STAR_SIZE, MIN_STAR_SIZE);

    this.x = this.random(
      sparkle.offsetWidth * 0.75,
      sparkle.offsetWidth * 0.25
    );
    this.y = sparkle.offsetHeight / 2 - this.size / 2;

    this.x_dir = this.randomMinus();
    this.y_dir = this.randomMinus();

    this.x_max_travel =
      this.x_dir === -1 ? this.x : sparkle.offsetWidth - this.x - this.size;
    this.y_max_travel = sparkle.offsetHeight / 2 - this.size;

    this.x_travel_dist = this.random(this.x_max_travel, MIN_STAR_TRAVEL_X);
    this.y_travel_dist = this.random(this.y_max_travel, MIN_STAR_TRAVEL_Y);

    this.x_end = this.x + this.x_travel_dist * this.x_dir;
    this.y_end = this.y + this.y_travel_dist * this.y_dir;

    this.life = this.random(MAX_STAR_LIFE, MIN_STAR_LIFE);

    this.star = document.createElement("div");
    this.star.classList.add("star");

    this.star.style.setProperty("--start-left", this.x + "px");
    this.star.style.setProperty("--start-top", this.y + "px");

    this.star.style.setProperty("--end-left", this.x_end + "px");
    this.star.style.setProperty("--end-top", this.y_end + "px");

    this.star.style.setProperty("--star-life", this.life + "s");
    this.star.style.setProperty("--star-life-num", this.life);

    this.star.style.setProperty("--star-size", this.size + "px");
    this.star.style.setProperty("--star-color", this.specificBlue());
  }

  draw() {
    sparkle.appendChild(this.star);
  }

  pop() {
    sparkle.removeChild(this.star);
  }

  random(max, min) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  specificBlue(){
    return "#113768)";
  }

  randomMinus() {
    return Math.random() > 0.5 ? 1 : -1;
  }
};

setInterval(() => {
  if (current_star_count >= MAX_STARS) {
    return;
  }

  current_star_count++;

  var newStar = new Star();

  newStar.draw();

  setTimeout(() => {
    current_star_count--;

    newStar.pop();
  }, newStar.life * 1000);
}, STAR_INTERVAL);


