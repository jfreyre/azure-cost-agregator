import axios from "axios";

// Fonction pour effectuer une requête avec retry et backoff exponentiel
export async function makeRequestWithRetry(
  url,
  options,
  retries = 3,
  backoff = 1500
) {
  try {
    return await axios(url, options);
  } catch (error) {
    if (retries > 0 && error.response && error.response.status === 429) {
      console.log(`Trop de requêtes, nouvelle tentative dans ${backoff}ms...`);
      await new Promise((resolve) => setTimeout(resolve, backoff));
      return makeRequestWithRetry(url, options, retries - 1, backoff * 2); // Exponential backoff
    } else {
      throw error;
    }
  }
}
