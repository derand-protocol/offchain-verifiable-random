import { param } from "express-validator";

export const validateGetRarity = () => {
  return [param("id").exists().withMessage("Invalid id").matches(/^\d+$/)];
};
