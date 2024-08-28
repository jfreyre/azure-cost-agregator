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
      console.log(
        `\t -> Groupes de ressources trouvés pour la souscription ${
          subscription.displayName
        } : ${resourceGroups.join(", ")}`
      );

      for (const resourceGroup of resourceGroups) {
        await getCostForResourceGroup(subscription.id, resourceGroup);
      }
    }
  } catch (error) {
    console.error("Erreur dans le traitement:", error);
  }
}

main();
