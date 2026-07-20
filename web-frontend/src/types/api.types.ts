// This file can extend types from @pecae/shared or declare local types
import { UserPublic } from '@pecae/shared';

// For example, if we need specific response types for local API routes
export interface RefreshTokenResponse {
  accessToken: string;
}
