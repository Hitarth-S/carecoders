import Chart from 'chart.js';

document.addEventListener('DOMContentLoaded', function() {
  // Theme switcher
  const themeSwitch = document.getElementById('theme-switch');
  themeSwitch.addEventListener('change', function() {
    if(this.checked) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  });

  // Check for saved theme preference
  const currentTheme = localStorage.getItem('theme');
  if (currentTheme === 'dark') {
    themeSwitch.checked = true;
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  // Hero video handling - simplified
  const heroVideo = document.getElementById('hero-video');
  
  // Add autoplay and loop attributes
  heroVideo.autoplay = true;
  heroVideo.loop = true;
  heroVideo.muted = true;
  
  // Remove the play button from the HTML
  const playBtn = document.getElementById('play-btn');
  if (playBtn) {
    playBtn.remove();
  }

  // Navigation functionality
  const navButtons = document.querySelectorAll('.nav-button');
  
  navButtons.forEach(button => {
    button.addEventListener('click', function() {
      const sectionId = this.getAttribute('data-section');
      const section = document.getElementById(sectionId);
      
      navButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      window.scrollTo({
        top: section.offsetTop - 100,
        behavior: 'smooth'
      });
    });
  });
  
  // Chat functionality
  const chatBtn = document.getElementById('chat-btn');
  const chatContainer = document.getElementById('chat-container');
  const closeChat = document.getElementById('close-chat');
  const userInput = document.getElementById('user-input');
  const sendMessage = document.getElementById('send-message');
  const chatMessages = document.getElementById('chat-messages');
  
  let conversationHistory = [];
  
  chatBtn.addEventListener('click', function() {
    chatContainer.classList.add('active');
  });
  
  closeChat.addEventListener('click', function() {
    chatContainer.classList.remove('active');
  });
  
  function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    
    if (isUser) {
      messageDiv.classList.add('user');
      conversationHistory.push({
        role: "user",
        content: content
      });
    } else {
      messageDiv.classList.add('bot');
      if (content) {
        conversationHistory.push({
          role: "assistant",
          content: content
        });
      }
    }
    
    messageDiv.innerHTML = `
      <div class="message-content">
        <p>${content}</p>
      </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  async function handleUserMessage() {
    const message = userInput.value.trim();
    if (message === '') return;
    
    addMessage(message, true);
    userInput.value = '';
    
    // Loading indicator
    const loadingMessage = document.createElement('div');
    loadingMessage.classList.add('message', 'bot');
    loadingMessage.innerHTML = `
      <div class="message-content">
        <p>Typing<span class="loading-dots">...</span></p>
      </div>
    `;
    chatMessages.appendChild(loadingMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    try {
      // Updated URL to use ngrok
      const response = await fetch('https://6a21-34-168-148-59.ngrok-free.app/api/rag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ query: message })
      });

      // Remove loading message
      chatMessages.removeChild(loadingMessage);
      
      if (response.ok) {
        const data = await response.json();
        addMessage(data.response);
      } else {
        // Fallback to simple responses if RAG API fails
        const errorData = await response.json();
        console.error('RAG API error:', errorData);
        
        // Simple response simulation based on keywords
        let fallbackResponse = '';
        
        if (message.toLowerCase().includes('diagnose') || message.toLowerCase().includes('test') || message.toLowerCase().includes('scan')) {
          fallbackResponse = "You can use our diagnostic services by visiting the Diagnose section and selecting the appropriate test. We currently offer brain diagnosis, lung cancer screening, and diabetic retinopathy assessment.";
        } else if (message.toLowerCase().includes('price') || message.toLowerCase().includes('cost') || message.toLowerCase().includes('fee')) {
          fallbackResponse = "Our pricing varies based on the specific diagnostic service. For detailed pricing information, please contact our customer service team at support@diagnoplus.com.";
        } else if (message.toLowerCase().includes('time') || message.toLowerCase().includes('result') || message.toLowerCase().includes('wait')) {
          fallbackResponse = "Results from our AI-powered diagnostic tools are typically available within minutes after image upload. For detailed clinical reports reviewed by specialists, turnaround time is usually 24-48 hours.";
        } else if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi') || message.toLowerCase().includes('hey')) {
          fallbackResponse = "Hello! How can I assist you with our diagnostic services today?";
        } else {
          fallbackResponse = "Thank you for your message. For more specific information about our services, please explore our website or contact us directly at info@diagnoplus.com.";
        }
        
        addMessage(fallbackResponse);
      }
    } catch (error) {
      // Remove loading message
      chatMessages.removeChild(loadingMessage);
      console.error('Chat error:', error);
      
      // Fallback response for network issues
      addMessage("I'm having trouble connecting to our knowledge base at the moment. Please try again later or browse our website for information about our services.");
    }
  }
  
  sendMessage.addEventListener('click', handleUserMessage);
  
  userInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      handleUserMessage();
    }
  });

  // Testimonials carousel
  setupCarousel('.testimonial-slide', '.testimonial-prev', '.testimonial-next', '.testimonial-dots');
  
  // Touch/drag functionality for carousels
  setupDragScroll();
  
  // General carousel setup function
  function setupCarousel(slideSelector, prevSelector, nextSelector, dotsSelector) {
    const slides = document.querySelectorAll(slideSelector);
    const prevBtn = document.querySelector(prevSelector);
    const nextBtn = document.querySelector(nextSelector);
    const dots = document.querySelectorAll(`${dotsSelector} .dot`);
    
    let currentIndex = 0;
    
    function showSlide(index) {
      slides.forEach(slide => {
        slide.classList.remove('active');
      });
      
      slides[index].classList.add('active');
      
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
    }
    
    // Initialize first slide
    showSlide(currentIndex);
    
    // Previous button
    prevBtn.addEventListener('click', function() {
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      showSlide(currentIndex);
    });
    
    // Next button
    nextBtn.addEventListener('click', function() {
      currentIndex = (currentIndex + 1) % slides.length;
      showSlide(currentIndex);
    });
    
    // Dots navigation
    dots.forEach((dot, index) => {
      dot.addEventListener('click', function() {
        currentIndex = index;
        showSlide(currentIndex);
      });
    });
    
    // Auto-rotate slides
    setInterval(() => {
      currentIndex = (currentIndex + 1) % slides.length;
      showSlide(currentIndex);
    }, 5000);
  }
  
  // Drag to scroll functionality
  function setupDragScroll() {
    const carousels = [
      document.querySelector('.testimonials-carousel'),
      document.querySelector('.services-carousel')
    ];
    
    carousels.forEach(carousel => {
      if (!carousel) return;
      
      let isDown = false;
      let startX;
      let scrollLeft;
      
      carousel.addEventListener('mousedown', (e) => {
        isDown = true;
        carousel.classList.add('active');
        startX = e.pageX - carousel.offsetLeft;
        scrollLeft = carousel.scrollLeft;
      });
      
      carousel.addEventListener('mouseleave', () => {
        isDown = false;
        carousel.classList.remove('active');
      });
      
      carousel.addEventListener('mouseup', () => {
        isDown = false;
        carousel.classList.remove('active');
      });
      
      carousel.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - carousel.offsetLeft;
        const walk = (x - startX) * 2;
        carousel.scrollLeft = scrollLeft - walk;
      });
      
      // Touch events
      carousel.addEventListener('touchstart', (e) => {
        isDown = true;
        carousel.classList.add('active');
        startX = e.touches[0].pageX - carousel.offsetLeft;
        scrollLeft = carousel.scrollLeft;
      });
      
      carousel.addEventListener('touchend', () => {
        isDown = false;
        carousel.classList.remove('active');
      });
      
      carousel.addEventListener('touchmove', (e) => {
        if (!isDown) return;
        const x = e.touches[0].pageX - carousel.offsetLeft;
        const walk = (x - startX) * 2;
        carousel.scrollLeft = scrollLeft - walk;
      });
    });
  }
});
