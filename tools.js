import axios from "axios";
import { accessToken, startDate, endDate } from "./constants.js";
import { makeRequestWithRetry } from "./axios.extensions.js";

export function isJWT(token) {
  if (typeof token !== "string") {
    return false;
  }

  // Diviser la chaîne par le point (.)
  const parts = token.split(".");

  // Un JWT valide doit avoir trois parties
  if (parts.length !== 3) {
    return false;
  }

  // Vérifier si les parties header et payload sont encodées en Base64URL
  const isBase64URL = (str) => {
    const base64URLPattern = /^[A-Za-z0-9_-]+$/;
    return base64URLPattern.test(str);
  };

  if (!isBase64URL(parts[0]) || !isBase64URL(parts[1])) {
    return false;
  }

  // La signature peut être vide, mais doit être en Base64URL si elle est présente
  if (parts[2] && !isBase64URL(parts[2])) {
    return false;
  }

  return true;
}

export async function getSubscriptions() {
  const url = `https://management.azure.com/subscriptions?api-version=2020-01-01`;

  try {
    const response = await makeRequestWithRetry(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`, // Assurez-vous d'avoir défini le jeton d'accès
        "Content-Type": "application/json",
      },
    });

    return response.data.value.map((subscription) => ({
      id: subscription.subscriptionId,
      displayName: subscription.displayName,
    }));
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des souscriptions:",
      error.message,
      error.response?.data.error.message
    );

    throw new Error(error.response.data.error.message);
  }
}

export async function getResourceGroups(subscriptionId) {
  const url = `https://management.azure.com/subscriptions/${subscriptionId}/resourcegroups?api-version=2021-04-01`;

  try {
    const response = await makeRequestWithRetry(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`, // Assurez-vous d'avoir défini le jeton d'accès
        "Content-Type": "application/json",
      },
    });
    return response.data.value.map((group) => group.name);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des groupes de ressources:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
}

export async function getCostForResourceGroup(
  subscriptionId,
  resourceGroupName
) {
  const url = `https://management.azure.com/subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.CostManagement/query?api-version=2023-03-01`;

  const requestData = {
    type: "Usage",
    timeframe: "Custom",
    timePeriod: {
      from: startDate,
      to: endDate,
    },
    dataset: {
      granularity: "None",
      aggregation: {
        totalCost: {
          name: "Cost",
          function: "Sum",
        },
      },
    },
  };

  try {
    const response = await makeRequestWithRetry(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`, // Assurez-vous d'avoir défini le jeton d'accès
        "Content-Type": "application/json",
      },
      data: requestData,
    });

    // Check if a cost exist or not
    const totalCost =
      response.data.properties.rows.length > 0
        ? response.data.properties.rows[0][0]
        : 0;

    console.log(`\t ${resourceGroupName} -> ${totalCost}`);
  } catch (error) {
    console.error(
      `Erreur lors de la récupération des coûts pour le groupe ${resourceGroupName} (souscription ${subscriptionId}):`,
      error.response ? error.response.data : error.message
    );
  }
}
