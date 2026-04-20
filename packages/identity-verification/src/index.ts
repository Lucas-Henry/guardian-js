/**
 * guardian-js
 * Copyright 2026 Lucas Henry
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

export {
  IdentityVerificationService,
  createIdentityVerificationService
} from "./service/IdentityVerificationService";

export { StubIdentityVerificationAdapter } from "./adapters/StubIdentityVerificationAdapter";

export {
  GovBrIdentityVerificationAdapter,
  type GovBrAdapterConfig,
  type GovBrEnvironment
} from "./adapters/GovBrIdentityVerificationAdapter";

export type { GovBrPkceState } from "./adapters/govbr/types";
