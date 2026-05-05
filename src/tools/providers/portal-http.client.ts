import { Injectable } from '@nestjs/common';

@Injectable()
export class PortalHttpClient {
  async getJson<T>(url: string, headers: Record<string, string>): Promise<T | null> {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as T;
  }
}
