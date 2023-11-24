import { roles } from "../../middleware/auth.js";

export const endPoint={
    create:[roles.User],
    delete:[roles.User],
    clear:[roles.User],
    get:[roles.User]
}