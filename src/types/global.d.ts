// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type mongoose from 'mongoose';

declare global {
  const mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  } | undefined;
}

export {}; 