import Hadist from "../models/Hadist.js";

/**
 * Fetch random hadiths from external API based on a keyword/theme.
 */
export const fetchRandomHadist = async (keyword, limit = 20) => {
  try {
    const resolvedLimit = Math.min(Number(limit) || 20, 20);
    const encodedKeyword = encodeURIComponent(keyword);

    // 1. First fetch: Fetch page 1 to get total pages count and initial data
    const firstUrl = `https://api.myquran.com/v3/hadis/enc/cari/${encodedKeyword}?page=1&limit=${resolvedLimit}`;
    const response = await fetch(firstUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`External API returned status: ${response.status}`);
    }

    const result = await response.json();

    if (result.status !== true) {
      throw new Error(result.message || "Failed to fetch hadist from api.myquran");
    }

    const paging = result.data.paging;
    let hadisList = result.data.hadis || [];

    if (hadisList.length === 0) {
      return [];
    }

    const totalPages = paging.total_pages || 1;

    // 2. If there is more than 1 page, pick a random page
    if (totalPages > 1) {
      const randomPage = Math.floor(Math.random() * totalPages) + 1;

      if (randomPage > 1) {
        const randomPageUrl = `https://api.myquran.com/v3/hadis/enc/cari/${encodedKeyword}?page=${randomPage}&limit=${resolvedLimit}`;
        const secondResponse = await fetch(randomPageUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (secondResponse.ok) {
          const secondResult = await secondResponse.json();
          if (secondResult.status === true && secondResult.data.hadis) {
            hadisList = secondResult.data.hadis;
          }
        }
      }
    }

    // Fetch details (takhrij) for each hadith
    const hadisWithDetails = [];
    for (const item of hadisList) {
      let takhrij = "";
      try {
        const detailUrl = `https://api.myquran.com/v3/hadis/enc/show/${item.id}`;
        const detailResponse = await fetch(detailUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (detailResponse.ok) {
          const detailResult = await detailResponse.json();
          if (detailResult.status === true && detailResult.data) {
            takhrij = detailResult.data.takhrij || "";
          }
        }
      } catch (detailError) {
        console.error(`Error fetching detail for hadist ID ${item.id}:`, detailError.message);
      }
      hadisWithDetails.push({
        ...item,
        takhrij
      });
      // 100ms delay to avoid rate limit
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return hadisWithDetails;
  } catch (error) {
    console.error("Error in fetchRandomHadist:", error.message);
    throw error;
  }
};

/**
 * Fetch from external API and save it to MongoDB (Upsert)
 */
export const syncHadistData = async (keyword, limit = 20) => {
  const resolvedLimit = Math.min(Number(limit) || 20, 20);
  const normalizedKeyword = keyword.trim().toLowerCase();

  const apiHadist = await fetchRandomHadist(normalizedKeyword, resolvedLimit);
  const filteredHadist = apiHadist.filter((item) => item.text.length <= 450);

  if (!filteredHadist || filteredHadist.length === 0) {
    throw new Error(`No hadiths found for keyword "${keyword}" from the external API.`);
  }

  const bulkOps = filteredHadist.map((item) => ({
    updateOne: {
      filter: { 
        keyword: normalizedKeyword, 
        hadistId: item.id 
      },
      update: {
        $set: {
          keyword: normalizedKeyword,
          hadistId: item.id,
          text: item.text,
          focus: item.focus,
          takhrij: item.takhrij
        }
      },
      upsert: true
    }
  }));

  const bulkResult = await Hadist.bulkWrite(bulkOps);

  return {
    keyword: normalizedKeyword,
    totalSynced: filteredHadist.length,
    upsertedCount: bulkResult.upsertedCount,
    modifiedCount: bulkResult.modifiedCount
  };
};

/**
 * Retrieve 1 random hadith from all available hadiths in local MongoDB
 */
export const getRandomHadistFromDb = async () => {
  const list = await Hadist.find({});

  if (list.length === 0) {
    return null;
  }

  // Select 1 random hadith from the retrieved list
  const randomIndex = Math.floor(Math.random() * list.length);
  return list[randomIndex];
};

/**
 * Check if active hadiths already exist in local DB for a keyword
 */
export const checkExistingHadist = async (keyword) => {
  const normalizedKeyword = keyword.trim().toLowerCase();
  return await Hadist.findOne({ 
    keyword: normalizedKeyword
  });
};
