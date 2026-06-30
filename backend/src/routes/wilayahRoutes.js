import express from 'express';

const router = express.Router();

// Proxy to get all provinces
router.get('/provinces', async (req, res) => {
  try {
    const response = await fetch('https://wilayah.id/api/provinces.json');
    if (!response.ok) {
      throw new Error(`External API returned status: ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching provinces proxy:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch provinces from external API', error: error.message });
  }
});

// Proxy to get regencies/cities by province code
router.get('/regencies/:provinceCode', async (req, res) => {
  try {
    const { provinceCode } = req.params;
    const response = await fetch(`https://wilayah.id/api/regencies/${provinceCode}.json`);
    if (!response.ok) {
      throw new Error(`External API returned status: ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(`Error fetching regencies proxy for code ${provinceCode}:`, error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch regencies from external API', error: error.message });
  }
});

export default router;
