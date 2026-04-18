/**
 * guardian-js
 * * Copyright 2026 Lucas Henry
 * * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * * http://www.apache.org/licenses/LICENSE-2.0
 */

export type {
  Result,
  ResultOk,
  ResultErr,
  GuardianError,
  GuardianErrorCode
} from "./shared/result";

export { ok, err, guardianError } from "./shared/result";

export type {
  AgeGroup,
  AgeVerificationMethod,
  AgeVerificationResult,
  AgeVerificationRequest,
  AgeVerificationCallbackPayload,
  AgeVerificationProvider
} from "./age-verification/types";

export type {
  ContentRiskLevel,
  ContentCategory,
  ContentClassificationResult,
  ContentClassificationRequest,
  TextClassificationRequest,
  UrlClassificationRequest,
  ContentClassificationProvider
} from "./content-classification/types";
