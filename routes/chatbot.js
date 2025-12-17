const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Load FAQs from JSON
const faqsPath = path.join(__dirname, '../config/faqs.json');
const faqs = JSON.parse(fs.readFileSync(faqsPath, 'utf-8'));

/**
 * GET /api/chatbot/faqs
 * Lấy danh sách tất cả FAQ
 */
router.get('/faqs', (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        categories: faqs.categories,
        faqs: faqs.faqs
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy FAQs' });
  }
});

/**
 * GET /api/chatbot/faqs/:categoryId
 * Lấy FAQ theo danh mục
 */
router.get('/faqs/:categoryId', (req, res) => {
  try {
    const { categoryId } = req.params;
    const categoryFaqs = faqs.faqs.filter(faq => faq.category === categoryId);
    
    res.json({
      success: true,
      data: categoryFaqs
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy FAQs' });
  }
});

/**
 * POST /api/chatbot/chat
 * Xử lý tin nhắn chat, tìm kiếm FAQ phù hợp
 * Body: { message: "string" }
 */
router.post('/chat', (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập tin nhắn'
      });
    }

    // Normalize input: lowercase và remove accents
    const normalizedInput = normalizeText(message.toLowerCase());

    // Tìm FAQ phù hợp nhất
    let bestMatch = null;
    let maxScore = 0;

    faqs.faqs.forEach(faq => {
      // Tính điểm match dựa trên keywords
      let score = 0;

      // Check keywords
      faq.keywords.forEach(keyword => {
        if (normalizedInput.includes(normalizeText(keyword))) {
          score += 2;
        }
      });

      // Check question
      if (normalizedInput.includes(normalizeText(faq.question.split(' ').slice(0, 3).join(' ')))) {
        score += 1;
      }

      // Lưu FAQ có score cao nhất
      if (score > maxScore) {
        maxScore = score;
        bestMatch = faq;
      }
    });

    // Nếu tìm được câu hỏi phù hợp (score > 0)
    if (bestMatch && maxScore > 0) {
      return res.json({
        success: true,
        data: {
          type: 'answer',
          question: bestMatch.question,
          answer: bestMatch.answer,
          category: bestMatch.category,
          confidence: Math.min(100, maxScore * 30) // Confidence score
        }
      });
    }

    // Không tìm được, gợi ý các danh mục hoặc câu hỏi phổ biến
    const suggestedFaqs = faqs.faqs.slice(0, 3);
    
    res.json({
      success: true,
      data: {
        type: 'suggestions',
        message: 'Xin lỗi, chúng tôi không tìm thấy câu trả lời chính xác. Dưới đây là một số câu hỏi phổ biến:',
        suggestions: suggestedFaqs.map(faq => ({
          id: faq.id,
          question: faq.question,
          category: faq.category
        }))
      }
    });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({
      success: false,
      message: 'Lỗi xử lý yêu cầu'
    });
  }
});

/**
 * Hàm normalize text (loại bỏ dấu tiếng Việt)
 */
function normalizeText(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .trim();
}

module.exports = router;
