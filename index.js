import {
  getSubscriptions,
  getResourceGroups,
  getCostForResourceGroup,
  isJWT,
} from "./tools.js";

import { accessToken } from "./constants.js";

async function main() {
  try {
    if (!isJWT(accessToken)) {
      console.warn("not valid token. Cancelling the operation");
      return;
    }

    const subscriptions = await getSubscriptions();
    console.log(`-> ${subscriptions.length} souscriptions trouvées...`);

    for (const subscription of subscriptions) {
      console.log(`-> ${subscription.displayName} (ID: ${subscription.id})`);

      const resourceGroups = await getResourceGroups(subscription.id);

      for (const resourceGroup of resourceGroups) {
        await getCostForResourceGroup(subscription.id, resourceGroup);
      }
    }
  } catch (error) {
    console.error("Erreur dans le traitement:", error);
  }
}

main();
