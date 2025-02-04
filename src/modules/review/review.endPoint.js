import {roles} from "../../middleware/auth.js";

export const endPoint={
    create:[roles.User],
    get:[roles.User],
    delete:[roles.User],
    update:[roles.User],
}