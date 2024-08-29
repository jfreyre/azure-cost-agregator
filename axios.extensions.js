import axios from "axios";

// Fonction pour effectuer une requête avec retry et backoff exponentiel
export async function makeRequestWithRetry(
  url,
  options,
  retries = 6,
  backoff = 1500
) {
  try {
    var response = await axios(url, options);

    return response;
  } catch (error) {
    // IF too many request, we will wait a bit
    if (retries > 0 && error.response && error.response.status === 429) {
      let msftRetryHeader = error.response.headers.get(
        "x-ms-ratelimit-microsoft.costmanagement-tenant-retry-after"
      );

      if (msftRetryHeader !== "") {
        console.log("as suggested by msft, retry in ", msftRetryHeader * 1000);
        await new Promise((resolve) =>
          setTimeout(resolve, msftRetryHeader * 1000)
        );
      } else {
        console.log(`too much query. backoff in ${backoff}ms...`);
        await new Promise((resolve) => setTimeout(resolve, backoff));
      }

      return makeRequestWithRetry(url, options, retries - 1, backoff * 2); // Exponential backoff
    } else {
      throw error;
    }
  }
}
