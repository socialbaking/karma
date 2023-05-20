import { calculations, isProductReport, Product, Report } from "../karma";
import { v4 } from "uuid";
import { Chance } from "chance";
import { getActiveIngredients } from "../karma/data";
import { ok } from "../is";

const chance = new Chance();

const createdAt = new Date().toISOString();
const updatedAt = new Date().toISOString();
const reportedAt = new Date().toISOString();
const countryCode = "NZ";

{
  const typeA = "THC"; // chance.string({
  //     alpha: true,
  //     casing: "upper",
  //     length: 3,
  // });
  const typeB = "CBD"; // chance.string({
  //     alpha: true,
  //     casing: "upper",
  //     length: 3,
  // });

  const size = 35;
  const subUnit = "mg"; // chance.string({ alpha: true, length: 2, casing: "lower" })
  const unit = "g"; // chance.string({ alpha: true, length: 2, casing: "lower" })

  const typeAPercentage = 15.25;
  const typeBPercentage = 0.5;

  const product: Product = {
    productId: v4(),
    productName: chance.animal(),
    countryCode,
    createdAt,
    updatedAt,
    sizes: [
      {
        value: size.toString(),
        unit,
      },
    ],
    activeIngredientDescriptions: [
      `Total ${typeA} (${typeA}+${typeA}A) ${
        typeAPercentage * 10
      } ${subUnit}/${unit} (${typeAPercentage}% w/w)`,
      `Total ${typeB} (${typeB}+${typeB}A) ${
        typeBPercentage * 10
      } ${subUnit}/${unit} (<${typeBPercentage}% w/w)`,
    ],
  };
  product.activeIngredients = getActiveIngredients(product);

  console.log(product.activeIngredientDescriptions);

  const report: Report = {
    type: "purchase",
    reportId: v4(),
    createdAt,
    updatedAt,
    reportedAt,
    countryCode,
    roles: [],
    productId: product.productId,
    productItems: 1,
    productItemCost: 455,
    productTotalCost: 455,
    calculationConsent: [],
  };

  ok(isProductReport(report), "Expected report to be a product report");

  const result = await calculations.metrics.costPerUnit.calculate(report, {
    currencySymbol: "$",
    products: [product],
  });

  const { activeIngredients, productId } = result.products[0];

  ok(productId === product.productId);
  ok(activeIngredients.length);

  console.log(activeIngredients);

  function filter(unit: string, type: string) {
    return activeIngredients.filter(
      (value) => value.unit === unit && value.type === type
    );
  }

  function find(unit: string, type: string) {
    return filter(unit, type).filter((value) => !value.proportional)[0];
  }

  ok(find("$/g", "g").value === "13");

  ok(find("g", typeA).value === "5.3375");
  ok(find("g", typeB).value === "0.175");
  // (5.3375 + 0.175) = 5.5125
  ok(find("g", `${typeA}+${typeB}`).value === "5.5125");

  // 455 / 5.3375 = 85.2459
  ok(find("$/g", typeA).value === "85.2459");
  // 455 / 0.175 = 2600
  ok(find("$/g", typeB).value === "2600");
  // 455 / (5.3375 + 0.175) = 82.5397
  ok(find("$/g", `${typeA}+${typeB}`).value === "82.5397");
}
