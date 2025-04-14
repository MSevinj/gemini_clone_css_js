const container = document.querySelector('.container');
const chatsContainer = document.querySelector('.chats-container');
const promptForm = document.querySelector('.prompt-form');
const promptInput = promptForm.querySelector('.prompt-input');
const fileInput = promptForm.querySelector('#file-input');
const fileUploadWrapper = promptForm.querySelector('.file-upload-wrapper');

const API_KEY = 'AIzaSyD39lxArGY24cayaZywJpCZk2z7OaFzuiA';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

let userMessage = ''
const chatHistory = [];

const createMsgElement = (content, ...classes) => {
    const div = document.createElement ('div');
    div.classList.add('message', ...classes);
    div.innerHTML = content;
    return div;
}

const scrollToBottom = () => container.scrollTo({ top: container.scrollHeight, behavior: 'smooth'});
    
const typingEffect = (text, textElement, botMsgDiv) =>{
    textElement.textContent = "";
    const words = text.split(" ");
    let wordIndex = 0;

const typingInterval = setInterval(() => {
        if (wordIndex < words.length) {
            textElement.textContent += (wordIndex === 0 ? "" : " ") + words[wordIndex++];
            botMsgDiv.classList.remove('loading');
            scrollToBottom();
        }else {
            clearInterval(typingInterval);
        }
    }, 40)
}

const generateResponse = async (botMsgDiv) => {
    const textElement = botMsgDiv.querySelector(".message-text");

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [...chatHistory, { role: 'user', parts: [{ text: userMessage }] }]
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error.message);

        
        const responseText = data.candidates[0].content.parts[0].text.replace(/\*\*([^*]+)\*\*/g, "$1").trim();

       
        chatHistory.push({ role: 'user', parts: [{ text: userMessage }] });
        chatHistory.push({ role: 'model', parts: [{ text: responseText }] });

        typingEffect(responseText, textElement, botMsgDiv);

    } catch (error) {
        console.error(error);
        textElement.textContent = `Error: ${error.message}`;
        botMsgDiv.classList.remove('loading');
    }
};

const handleFormSubmit = (e) => {
    e.preventDefault();
    userMessage = promptInput.value.trim();
    if(!userMessage) return;

    promptInput.value = '';

    const userMsgHTML = '<p class="message-text"></p>';
    const userMsgDiv = createMsgElement (userMsgHTML, 'user-message');

    userMsgDiv.querySelector('.message-text').textContent = userMessage;
    chatsContainer.appendChild(userMsgDiv);
    scrollToBottom();

    setTimeout(() => {
     const botMsgHTML = '<img src="gemini-chatbot-logo.svg" class="avatar"></img><p class="message-text">Just a sec...</p>';
     const botMsgDiv = createMsgElement (botMsgHTML, 'bot-message', "loading");
     chatsContainer.appendChild(botMsgDiv);
     scrollToBottom();
     generateResponse(botMsgDiv);
    }, 600);
}

fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) return;

const isImage = file.type.startsWith('image/');
const reader = new FileReader();
reader.readAsDataURL(file);


    reader.onload = (e) => {
        fileInput.value = '';
        fileUploadWrapper.querySelector('.file-preview').src = e.target.result;
        fileUploadWrapper.classList.add('active', isImage ? 'img-attached' : 'file-attached');
    }
})


promptForm.addEventListener('submit', handleFormSubmit);
document.getElementById('add-file-btn').addEventListener('click', () => {
    fileInput.click();
});