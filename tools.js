import axios from "axios";
import { accessToken } from "./constants.js";

export async function getSubscriptions() {
  const url = `https://management.azure.com/subscriptions?api-version=2020-01-01`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
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
      error.response ? error.response.data : error.message
    );
    throw error;
  }
}

export async function getResourceGroups(subscriptionId) {
  const url = `https://management.azure.com/subscriptions/${subscriptionId}/resourcegroups?api-version=2021-04-01`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
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
  const startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const endDate = new Date().toISOString().split("T")[0];

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
    const response = await axios.post(url, requestData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const totalCost = response.data.properties.rows[0][0];
    console.log(
      `Le coût total pour le groupe de ressources ${resourceGroupName} (souscription ${subscriptionId}) est de ${totalCost} USD pour le mois en cours.`
    );
  } catch (error) {
    console.error(
      `Erreur lors de la récupération des coûts pour le groupe ${resourceGroupName} (souscription ${subscriptionId}):`,
      error.response ? error.response.data : error.message
    );
  }
}
