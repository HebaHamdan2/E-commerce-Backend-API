import { roles } from "../../middleware/auth.js";

export const endPoint={
    profile:[roles.User],
    updatePass:[roles.User],
    uploadExcel:[roles.Admin]
}