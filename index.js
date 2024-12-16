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
      console.warn("☢ not valid token. Cancelling the operation");
      return;
    }

    const subscriptions = await getSubscriptions();
    console.log(`-> ${subscriptions.length} souscriptions trouvées...`);
    
    let resourceGroups = [];
    for (const subscription of subscriptions) {
      
      console.log(`-> Getting RGs of ${subscription.displayName} (ID: ${subscription.id})`);

      var currentGroups = await getResourceGroups(subscription.id);
      
      resourceGroups.push(...currentGroups);
    }

    resourceGroups = resourceGroups.sort((a,b) => a.rgName.localeCompare(b.rgName))
    
    for (const resourceGroup of resourceGroups) {
      await getCostForResourceGroup(resourceGroup);
    }

  } catch (error) {
    console.error("Erreur dans le traitement:", error);
  }
}

main();
