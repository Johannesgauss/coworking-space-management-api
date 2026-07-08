import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { TAuthenticatedUser } from "../types/jwt-payload";
import { Request } from "express";

export const User = createParamDecorator((data: keyof TAuthenticatedUser | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Request>();

    const user = request.user as TAuthenticatedUser | undefined;

    return data ? user?.[data] :user;


})