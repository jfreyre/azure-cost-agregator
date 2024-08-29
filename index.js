import {
  getSubscriptions,
  getResourceGroups,
  getCostForResourceGroup,
} from "./tools.js";

async function main() {
  try {
    const subscriptions = await getSubscriptions();
    console.log(`-> ${subscriptions.length} souscriptions trouvées...`);

    for (const subscription of subscriptions) {
      console.log(`-> ${subscription.displayName} (ID: ${subscription.id})`);

      const resourceGroups = await getResourceGroups(subscription.id);

      for (const resourceGroup of resourceGroups) {
        await getCostForResourceGroup(subscription.id, resourceGroup);
        
      }
      exit;
    }
  } catch (error) {
    console.error("Erreur dans le traitement:", error);
  }
}

main();
