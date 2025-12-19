// Simple Chatbot - No API Required
class SimpleChatbot {
  constructor() {
    this.toggle = document.getElementById('chatbotToggleSimple');
    this.close = document.getElementById('chatbotCloseSimple');
    this.container = document.getElementById('chatbotContainerSimple');
    this.content = document.getElementById('chatbotContentSimple');
    this.input = document.getElementById('chatbotInputSimple');
    this.sendBtn = document.getElementById('chatbotSendSimple');
    this.responses = [];
    this.init();
  }

  async init() {
    // Wait a bit for DOM to be ready
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Load responses from JSON
    await this.loadResponses();
    
    // Event listeners with preventDefault
      if (this.toggle) {
        // Event listener already attached in initChatbot, just update reference
        // Add additional click handler as backup
        this.toggle.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          this.toggleChat();
          return false;
        });
      }
    
    if (this.close) {
      this.close.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        this.toggleChat();
        return false;
      });
    }
    
    if (this.sendBtn) {
      this.sendBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        this.sendMessage();
        return false;
      });
    }
    
    if (this.input) {
      this.input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.sendMessage();
        }
      });
    }
    
    console.log('Chatbot initialized successfully');
  }

  async loadResponses() {
    try {
      const response = await fetch('/data/chatbot_responses.json');
      const data = await response.json();
      this.responses = data.responses || [];
      console.log('Loaded', this.responses.length, 'chatbot responses');
    } catch (error) {
      console.error('Lỗi khi tải responses:', error);
      this.responses = [];
    }
  }

  toggleChat() {
    if (!this.container) return;
    this.container.classList.toggle('active');
    if (this.container.classList.contains('active')) {
      if (this.input) {
        setTimeout(() => this.input.focus(), 100);
      }
    }
  }

  async sendMessage() {
    const message = this.input.value.trim();
    if (!message) return;

    this.addUserMessage(message);
    this.input.value = '';

    // Show typing indicator
    this.showTyping();

    try {
      // Find response after a short delay (simulate thinking)
      setTimeout(async () => {
        try {
          this.removeTyping();
          const response = await this.findResponse(message);
          this.addBotMessage(response);
        } catch (error) {
          console.error('Error in sendMessage:', error);
          this.removeTyping();
          this.addBotMessage("Xin lỗi, có lỗi xảy ra khi tìm kiếm sản phẩm. Vui lòng thử lại sau hoặc liên hệ hotline 0905 884 303.");
        }
      }, 500 + Math.random() * 500); // Random delay 500-1000ms
    } catch (error) {
      console.error('Error in sendMessage:', error);
      this.removeTyping();
      this.addBotMessage("Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.");
    }
  }

  // Extract price from message (e.g., "20 triệu", "10 triệu", "5 triệu")
  extractPrice(message) {
    const messageLower = message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    // Patterns to match: "20 triệu", "20 trieu", "20tr", "20 triệu đồng", etc.
    const patterns = [
      /(\d+(?:\.\d+)?)\s*(?:trieu|triệu|tr)/i,
      /(\d+(?:\.\d+)?)\s*(?:nghin|nghìn|k)/i,
      /(\d+(?:\.\d+)?)\s*(?:dong|đồng)/i,
      /(\d+(?:\.\d+)?)\s*(?:trieu|triệu)\s*(?:dong|đồng)/i,
      /co\s+(\d+(?:\.\d+)?)\s*(?:trieu|triệu|tr)/i, // "có 20 triệu"
      /budget\s+(\d+(?:\.\d+)?)/i, // "budget 20"
      /(\d+(?:\.\d+)?)\s*(?:million|m)/i
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        let price = parseFloat(match[1]);
        
        // Convert to VND
        if (messageLower.includes('trieu') || messageLower.includes('triệu') || messageLower.includes('tr') || messageLower.includes('million') || messageLower.includes('m')) {
          price = price * 1000000; // triệu
        } else if (messageLower.includes('nghin') || messageLower.includes('nghìn') || messageLower.includes('k')) {
          price = price * 1000; // nghìn
        }
        
        return price;
      }
    }
    
    return null;
  }

  // Extract price range from message (e.g., "từ 5 đến 10 triệu", "5-10 triệu")
  extractPriceRange(message) {
    const messageLower = message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    // Patterns: "từ 5 đến 10 triệu", "5-10 triệu", "5 đến 10 triệu"
    const rangePatterns = [
      /(?:tu|từ)\s*(\d+(?:\.\d+)?)\s*(?:den|đến|-)\s*(\d+(?:\.\d+)?)\s*(?:trieu|triệu|tr)/i,
      /(\d+(?:\.\d+)?)\s*(?:den|đến|-)\s*(\d+(?:\.\d+)?)\s*(?:trieu|triệu|tr)/i,
      /(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*(?:trieu|triệu|tr)/i
    ];

    for (const pattern of rangePatterns) {
      const match = message.match(pattern);
      if (match) {
        let minPrice = parseFloat(match[1]) * 1000000;
        let maxPrice = parseFloat(match[2]) * 1000000;
        return { minPrice, maxPrice };
      }
    }
    
    // Check for "dưới X triệu" or "dưới X triệu"
    const underPattern = /(?:duoi|dưới|under|less than)\s*(\d+(?:\.\d+)?)\s*(?:trieu|triệu|tr)/i;
    const underMatch = message.match(underPattern);
    if (underMatch) {
      const maxPrice = parseFloat(underMatch[1]) * 1000000;
      return { minPrice: 0, maxPrice };
    }
    
    return null;
  }

  async searchProductsByPrice(price, isMaxPrice = true) {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const params = isMaxPrice 
        ? `maxPrice=${price}&sort=price&order=desc&limit=6`
        : `minPrice=${price}&sort=price&order=asc&limit=6`;
      
      const response = await fetch(`/api/products?${params}`, { headers });
      const data = await response.json();
      
      if (data.products && data.products.length > 0) {
        return data.products;
      }
      return null;
    } catch (error) {
      console.error('Error searching products:', error);
      return null;
    }
  }

  async searchProductsByPriceRange(minPrice, maxPrice) {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const params = `minPrice=${minPrice}&maxPrice=${maxPrice}&sort=price&order=asc&limit=6`;
      const response = await fetch(`/api/products?${params}`, { headers });
      const data = await response.json();
      
      if (data.products && data.products.length > 0) {
        return data.products;
      }
      return null;
    } catch (error) {
      console.error('Error searching products:', error);
      return null;
    }
  }

  formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }

  formatProductList(products) {
    if (!products || products.length === 0) {
      return '';
    }

    let html = '<div class="chatbot-products-list" style="margin-top: 10px;">';
    products.forEach(product => {
      const price = this.formatPrice(product.price);
      const discount = product.discount_price ? this.formatPrice(product.discount_price) : null;
      html += `
        <div class="chatbot-product-item" style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin-bottom: 10px; background: #f9fafb; display: flex; flex-direction: column; min-height: 100px;">
          <div style="font-weight: 600; color: #1f2937; margin-bottom: 8px; min-height: 40px; line-height: 1.4; display: flex; align-items: flex-start;">${this.escapeHtml(product.name)}</div>
          <div style="color: #ef4444; font-weight: 600; font-size: 14px; margin-bottom: 8px; flex-shrink: 0;">
            ${discount ? `<span style="text-decoration: line-through; color: #6b7280; margin-right: 8px;">${price}</span>${discount}` : price}
          </div>
          <a href="/product-details.html?slug=${product.slug}" target="_blank" style="display: inline-block; color: #2563eb; text-decoration: none; font-size: 13px; flex-shrink: 0; align-self: flex-start; margin-top: auto;">Xem chi tiết →</a>
        </div>
      `;
    });
    html += '</div>';
    return html;
  }

  async findResponse(userMessage) {
    if (!this.responses || this.responses.length === 0) {
      return "Xin lỗi, hệ thống đang gặp sự cố. Vui lòng thử lại sau hoặc liên hệ hotline 0905 884 303.";
    }

    const messageLower = userMessage.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    // Check for price range first
    const priceRange = this.extractPriceRange(userMessage);
    if (priceRange) {
      const products = await this.searchProductsByPriceRange(priceRange.minPrice, priceRange.maxPrice);
      if (products && products.length > 0) {
        const minPriceStr = this.formatPrice(priceRange.minPrice);
        const maxPriceStr = this.formatPrice(priceRange.maxPrice);
        return `💰 Tìm thấy ${products.length} sản phẩm trong khoảng giá ${minPriceStr} - ${maxPriceStr}:\n\n${this.formatProductList(products)}\n\nBạn có thể click vào "Xem chi tiết" để xem thông tin sản phẩm!`;
      } else {
        const minPriceStr = this.formatPrice(priceRange.minPrice);
        const maxPriceStr = this.formatPrice(priceRange.maxPrice);
        return `😔 Không tìm thấy sản phẩm nào trong khoảng giá ${minPriceStr} - ${maxPriceStr}. Bạn có thể thử tìm với khoảng giá khác hoặc liên hệ hotline 0905 884 303 để được tư vấn!`;
      }
    }
    
    // Check for single price
    const price = this.extractPrice(userMessage);
    if (price) {
      const products = await this.searchProductsByPrice(price, true);
      if (products && products.length > 0) {
        const priceStr = this.formatPrice(price);
        return `💰 Tìm thấy ${products.length} sản phẩm phù hợp với ngân sách ${priceStr}:\n\n${this.formatProductList(products)}\n\nBạn có thể click vào "Xem chi tiết" để xem thông tin sản phẩm!`;
      } else {
        const priceStr = this.formatPrice(price);
        return `😔 Không tìm thấy sản phẩm nào dưới ${priceStr}. Bạn có thể thử tìm với mức giá khác hoặc liên hệ hotline 0905 884 303 để được tư vấn!`;
      }
    }

    let bestMatch = null;
    let maxScore = 0;

    // Calculate score for each response
    this.responses.forEach(item => {
      let score = 0;
      item.keywords.forEach(keyword => {
        const keywordLower = keyword.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (messageLower.includes(keywordLower)) {
          score += keywordLower.length; // Longer keywords get more weight
        }
      });
      if (score > maxScore) {
        maxScore = score;
        bestMatch = item;
      }
    });

    // If we have a good match, return it
    if (bestMatch && maxScore > 0) {
      return bestMatch.response;
    }

    // Default responses for common cases
    if (messageLower.includes('cảm ơn') || messageLower.includes('thank')) {
      return "🙏 Không có gì! Nếu bạn cần hỗ trợ thêm, đừng ngần ngại hỏi mình nhé. Chúc bạn mua sắm vui vẻ tại TechStore!";
    }

    if (messageLower.includes('tạm biệt') || messageLower.includes('bye')) {
      return "👋 Tạm biệt bạn! Nếu có bất kỳ câu hỏi nào khác, hãy quay lại chat với mình nhé. TechStore luôn sẵn sàng hỗ trợ bạn! 😊";
    }

    // Generic response if no match found
    return "Mình chưa hiểu rõ câu hỏi của bạn. Bạn có thể hỏi về:\n• Sản phẩm (điện thoại, laptop, phụ kiện...)\n• Tìm sản phẩm theo giá (ví dụ: 'mình có 20 triệu', 'tìm sản phẩm dưới 10 triệu')\n• Đơn hàng và giao hàng\n• Thanh toán và khuyến mãi\n• Bảo hành và đổi trả\n• Cửa hàng và liên hệ\n\nHoặc bạn có thể liên hệ hotline 0905 884 303 để được tư vấn trực tiếp!";
  }

  addUserMessage(text) {
    const msg = document.createElement('div');
    msg.className = 'chatbot-message-simple message-user-simple';
    msg.innerHTML = `
      <div class="message-avatar-simple user">👤</div>
      <div class="message-bubble-simple">${this.escapeHtml(text)}</div>
    `;
    this.content.appendChild(msg);
    this.scrollToBottom();
  }

  addBotMessage(text) {
    const msg = document.createElement('div');
    msg.className = 'chatbot-message-simple message-bot-simple';
    
    // Check if text contains HTML (product list)
    const hasHtml = text.includes('<div') || text.includes('<a');
    
    msg.innerHTML = `
      <div class="message-avatar-simple bot">🤖</div>
      <div class="message-bubble-simple">${hasHtml ? text : this.formatMessage(text)}</div>
    `;
    this.content.appendChild(msg);
    this.scrollToBottom();
  }

  showTyping() {
    const typing = document.createElement('div');
    typing.className = 'chatbot-message-simple message-bot-simple';
    typing.id = 'typing-indicator';
    typing.innerHTML = `
      <div class="message-avatar-simple bot">🤖</div>
      <div class="message-bubble-simple">
        <div class="typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
    `;
    this.content.appendChild(typing);
    this.scrollToBottom();
  }

  removeTyping() {
    const typing = document.getElementById('typing-indicator');
    if (typing) typing.remove();
  }

  formatMessage(text) {
    // Convert newlines to <br>
    return this.escapeHtml(text).replace(/\n/g, '<br>');
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  scrollToBottom() {
    setTimeout(() => {
      this.content.scrollTop = this.content.scrollHeight;
    }, 100);
  }
}

// Initialize chatbot when DOM is ready
function initChatbot() {
  // Wait for elements to be in DOM
  const checkElements = setInterval(() => {
    const toggle = document.getElementById('chatbotToggleSimple');
    const container = document.getElementById('chatbotContainerSimple');
    if (toggle && container) {
      clearInterval(checkElements);
      try {
        // Attach event listener IMMEDIATELY to prevent navigation
        toggle.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          if (window.simpleChatbot) {
            window.simpleChatbot.toggleChat();
          }
          return false;
        }, true); // Capture phase
        
        toggle.addEventListener('mousedown', function(e) {
          e.preventDefault();
          e.stopPropagation();
        }, true);
        
        // Now initialize chatbot
        window.simpleChatbot = new SimpleChatbot();
        console.log('Chatbot initialized successfully');
      } catch (error) {
        console.error('Error initializing chatbot:', error);
      }
    }
  }, 50);
  
  // Timeout after 5 seconds
  setTimeout(() => {
    clearInterval(checkElements);
    if (!window.simpleChatbot) {
      console.warn('Chatbot elements not found after 5 seconds');
    }
  }, 5000);
}

// Removed global event delegation - only use direct event listeners

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initChatbot);
} else {
  // DOM already loaded, but wait a bit for dynamic content
  setTimeout(initChatbot, 300);
}

