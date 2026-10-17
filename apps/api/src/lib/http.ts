import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { ZodTypeAny, z } from 'zod';

/** Wraps an async handler so rejected promises reach the error middleware. */
export const handler = (fn: (req: Request, res: Response) => Promise<unknown>): RequestHandler => (req, res, next: NextFunction) => { fn(req, res).catch(next); };

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

/** Parses a request body and answers 400 with a readable message when it is invalid. */
export function parse<S extends ZodTypeAny>(schema: S, body: unknown): z.infer<S> {
  const result = schema.safeParse(body);
  if (!result.success) {
    const issue = result.error.issues[0];
    const field = issue?.path.join('.') || 'request';
    throw new HttpError(400, `Please check the ${field} field. ${issue?.message ?? ''}`.trim());
  }
  return result.data;
}
