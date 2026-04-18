<table border="0">
  <tr>
    <td>
      <img width="80" height="80" alt="guardian-ico2" src="https://github.com/user-attachments/assets/81399011-0b1c-47a3-a827-801ce939dc38" />
    </td>
    <td>
      <h1>guardian-js</h1>
    </td>
  </tr>
</table>

> Toolkit stateless e privacy-first para verificação de idade e classificação de conteúdo — construído para conformidade com o ECA Digital brasileiro (Lei 15.211/2025) e além.

[![Licença](https://img.shields.io/badge/licen%C3%A7a-Apache%202.0-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-pr%C3%A9--alpha-orange.svg)]()
[![Linguagem](https://img.shields.io/badge/lang-TypeScript-blue.svg)]()

---

## O que é o guardian-js?

O **guardian-js** é um toolkit TypeScript open source que ajuda plataformas digitais a implementar verificação de idade e classificação de conteúdo de forma padronizada e com preservação de privacidade.

**Não é** um serviço de armazenamento de dados. **Não é** um sistema de reporte para órgãos governamentais. É uma biblioteca composável que fornece a infraestrutura de integração — sua plataforma é dona das decisões e das obrigações de conformidade.

A biblioteca foi criada em resposta direta ao **ECA Digital (Lei 15.211/2025)**, a primeira lei da América Latina a impor requisitos aplicáveis de verificação de idade a plataformas digitais, em vigor desde **17 de março de 2026**. O design é intencionalmente agnóstico em relação à jurisdição e pode ser adaptado para o DSA europeu, o UK Age Appropriate Design Code, e frameworks similares.

---

## Princípios fundamentais

**Stateless por design** — o guardian-js processa entradas e retorna saídas. Nunca armazena dados pessoais, nunca registra identificadores de usuários e nunca se comunica com serviços externos por conta própria sem configuração explícita.

**Você é o dono da conformidade** — a biblioteca retorna resultados estruturados. O que sua plataforma faz com esses resultados — bloquear acesso, iniciar um fluxo de consentimento parental, registrar para auditoria — é inteiramente sua responsabilidade. O guardian-js é uma ferramenta, não um serviço de compliance.

**Baseado em adapters** — cada dependência externa (provedores de identidade, APIs de moderação de conteúdo, runtimes de ML) fica atrás de uma interface de adapter. Você escolhe seus provedores e pode trocá-los sem alterar o código de integração.

**Superfície mínima de dados** — os fluxos de verificação de idade são projetados para que dados de identidade sensíveis trafeguem diretamente entre o usuário e o provedor de identidade, sem passar pelo guardian-js.

---

## Pacotes

Este repositório é um monorepo. Os pacotes são publicados independentemente sob o escopo `@guardian-js`.

| Pacote | Descrição | Status |
|---|---|---|
| `@guardian-js/age-verification` | Fluxos padronizados de verificação de idade com adapters de provedores plugáveis | Alpha |
| `@guardian-js/content-classification` | Classificação de risco de conteúdo com adapters de backend plugáveis | Alpha |
| `@guardian-js/core` | Tipos compartilhados, schemas de resultado e utilitários | Alpha |

---

## Instalação

Instale apenas os pacotes que você precisa. O `@guardian-js/core` é uma dependência peer dos outros pacotes e deve sempre ser instalado junto.

```bash
# npm
npm install @guardian-js/core @guardian-js/age-verification @guardian-js/content-classification

# pnpm
pnpm add @guardian-js/core @guardian-js/age-verification @guardian-js/content-classification

# yarn
yarn add @guardian-js/core @guardian-js/age-verification @guardian-js/content-classification
```

Se você precisar apenas de uma das funcionalidades:

```bash
# somente verificação de idade
pnpm add @guardian-js/core @guardian-js/age-verification

# somente classificação de conteúdo
pnpm add @guardian-js/core @guardian-js/content-classification
```

**Requisitos:** Node.js >= 18, TypeScript >= 5.0, Zod >= 3.24 (peer dependency).

---

## Início rápido

### Verificação de idade

A verificação de idade funciona em dois passos: inicia um redirecionamento para o provedor de identidade, depois processa o callback quando o usuário retorna.

```typescript
import { AgeVerificationService } from '@guardian-js/age-verification';
import { MeuAdapterDeProvedor } from './adapters/MeuAdapterDeProvedor';

const service = new AgeVerificationService(new MeuAdapterDeProvedor());

// Passo 1 — iniciar a verificação
// Chame isso quando o usuário tentar acessar conteúdo com restrição de idade.
const initResult = await service.initiateVerification({
  redirectUri: 'https://minhaplataforma.com.br/auth/callback',
  locale: 'pt-BR',
  metadata: { sessionId: 'sess_abc123' } // opcional, Record<string, string>
});

if (!initResult.success) {
  // initResult.error.code: 'INVALID_INPUT' | 'PROVIDER_UNAVAILABLE' | ...
  throw new Error(`Falha na verificação: ${initResult.error.message}`);
}

// Redirecione o usuário para o provedor de identidade
redirect(initResult.data.redirectUrl);
```

```typescript
// Passo 2 — processar o callback
// Chame isso na rota para onde o provedor redireciona o usuário de volta.
const callbackResult = await service.handleCallback({
  providerPayload: req.body // o payload bruto enviado pelo provedor
});

if (!callbackResult.success) {
  // trate erros do provedor
  return res.status(502).json({ error: callbackResult.error.code });
}

const { verified, ageGroup, method, providerRef } = callbackResult.data;
// verified: boolean
// ageGroup: 'child' | 'adolescent' | 'adult' | null
// method: 'document' | 'gov_id' | 'biometric' | 'third_party'
// providerRef: string | null — referência opaca do provedor, para uso em auditoria

// Sua plataforma decide o que fazer com o resultado.
if (!verified || ageGroup !== 'adult') {
  return res.redirect('/acesso-negado');
}

return res.redirect('/conteudo-restrito');
```

---

### Classificação de conteúdo

```typescript
import { ContentClassificationService } from '@guardian-js/content-classification';
import { MeuAdapterDeModeração } from './adapters/MeuAdapterDeModeração';

const service = new ContentClassificationService(new MeuAdapterDeModeração());

// Classificar um texto
const textResult = await service.classify({
  type: 'text',
  content: 'Conteúdo enviado pelo usuário...',
  locale: 'pt-BR' // opcional
});

if (textResult.success) {
  const { riskLevel, categories, confidence } = textResult.data;
  // riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'blocked'
  // categories: Array<'adult_content' | 'violence' | 'hate_speech' | 'gambling' | 'drugs' | 'self_harm' | 'safe'>
  // confidence: number (0–1)

  if (riskLevel === 'blocked' || riskLevel === 'high') {
    // sua plataforma decide: rejeitar, sinalizar para revisão, etc.
  }
}

// Classificar uma URL
const urlResult = await service.classify({
  type: 'url',
  url: 'https://example.com/alguma-pagina'
});
```

---

### Implementando seu próprio adapter

O guardian-js vem com adapters stub para testes. Em produção, você conecta provedores reais implementando as interfaces de adapter de `@guardian-js/core`.

**Adapter de verificação de idade:**

```typescript
import type {
  AgeVerificationProvider,
  AgeVerificationRequest,
  AgeVerificationCallbackPayload,
  AgeVerificationResult,
  Result
} from '@guardian-js/core';
import { ok, err, guardianError } from '@guardian-js/core';

export class MeuAdapterDeProvedor implements AgeVerificationProvider {
  public readonly name = 'meu-provedor-de-identidade';

  public async initiateVerification(
    request: AgeVerificationRequest
  ): Promise<Result<{ readonly redirectUrl: string }>> {
    try {
      const url = await meuProviderSdk.criarSessao({
        callbackUrl: request.redirectUri,
        locale: request.locale
      });
      return ok({ redirectUrl: url });
    } catch {
      return err(guardianError('PROVIDER_UNAVAILABLE', 'Falha ao criar sessão de verificação'));
    }
  }

  public async handleCallback(
    payload: AgeVerificationCallbackPayload
  ): Promise<Result<AgeVerificationResult>> {
    try {
      const response = await meuProviderSdk.resolverCallback(payload.providerPayload);
      return ok({
        verified: response.verified,
        ageGroup: response.age >= 18 ? 'adult' : response.age >= 12 ? 'adolescent' : 'child',
        method: 'third_party',
        providerRef: response.referenceId ?? null
      });
    } catch {
      return err(guardianError('PROVIDER_REJECTED', 'Falha ao resolver o callback'));
    }
  }
}
```

**Adapter de classificação de conteúdo:**

```typescript
import type {
  ContentClassificationProvider,
  ContentClassificationRequest,
  ContentClassificationResult,
  Result
} from '@guardian-js/core';
import { ok, err, guardianError } from '@guardian-js/core';

export class MeuAdapterDeModeração implements ContentClassificationProvider {
  public readonly name = 'minha-api-de-moderacao';

  public async classify(
    request: ContentClassificationRequest
  ): Promise<Result<ContentClassificationResult>> {
    try {
      const input = request.type === 'text' ? request.content : request.url;
      const response = await minhaApiDeModeração.analisar(input);
      return ok({
        riskLevel: response.riskLevel,
        categories: response.categories,
        confidence: response.confidence,
        providerRef: response.id ?? null
      });
    } catch {
      return err(guardianError('PROVIDER_UNAVAILABLE', 'API de moderação inacessível'));
    }
  }
}
```

---

### Testes com adapters stub

Ambos os pacotes incluem adapters stub configuráveis para que você possa testar a lógica de integração sem chamar APIs de provedores reais.

```typescript
import { AgeVerificationService, StubAgeVerificationAdapter } from '@guardian-js/age-verification';
import { ContentClassificationService, StubContentClassificationAdapter } from '@guardian-js/content-classification';

// Stub retorna adulto verificado por padrão
const ageService = new AgeVerificationService(new StubAgeVerificationAdapter());

// Configure o stub para cenários específicos de teste
const childService = new AgeVerificationService(
  new StubAgeVerificationAdapter({ ageGroup: 'child', verified: false })
);

// Stub de classificação retorna 'safe' por padrão
const classificationService = new ContentClassificationService(
  new StubContentClassificationAdapter()
);

// Configure para cenários de alto risco
const highRiskService = new ContentClassificationService(
  new StubContentClassificationAdapter({ riskLevel: 'high', categories: ['adult_content'] })
);
```

---

### Trabalhando com o tipo Result

Todos os métodos do guardian-js retornam um `Result<T>` — nunca lançam exceção. O padrão é consistente em todos os pacotes.

```typescript
import type { Result } from '@guardian-js/core';
import { ok, err, guardianError } from '@guardian-js/core';

// Narrowing via flag success
const result = await service.initiateVerification({ redirectUri: 'https://...' });

if (result.success) {
  // TypeScript estreita result.data aqui
  console.log(result.data.redirectUrl);
} else {
  // TypeScript estreita result.error aqui
  // result.error.code é um de:
  // 'INVALID_INPUT' | 'PROVIDER_UNAVAILABLE' | 'PROVIDER_REJECTED' | 'UNSUPPORTED_METHOD' | 'INTERNAL_ERROR'
  console.error(result.error.code, result.error.message);
}
```

---

## O que o guardian-js NÃO faz

Isso é explícito e intencional:

- Não armazena nenhum dado pessoal
- Não armazena resultados de verificação vinculados a identificadores de usuários
- Não se comunica com órgãos governamentais ou autoridades
- Não toma decisões finais de controle de acesso
- Não substitui assessoria jurídica nem garante conformidade regulatória
- Não realiza reconhecimento facial ou análise biométrica

---

## Conformidade com o ECA Digital

O ECA Digital (Lei 15.211/2025) exige que plataformas digitais implementem mecanismos confiáveis de verificação de idade, substituindo a autodeclaração por alternativas técnicas verificáveis. O guardian-js fornece a camada de integração padronizada para que desenvolvedores brasileiros possam implementar esses fluxos sem reinventar a roda.

A fiscalização é de responsabilidade da ANPD (Autoridade Nacional de Proteção de Dados). O guardian-js não garante conformidade com a lei — a responsabilidade pela implementação correta e pelo cumprimento das obrigações legais é sempre da plataforma que utiliza a biblioteca.

---

## Aviso legal

O guardian-js é uma biblioteca de software fornecida no estado em que se encontra, sob a licença Apache 2.0. Não é um serviço de conformidade legal. O uso desta biblioteca não garante que sua plataforma está em conformidade com qualquer lei ou regulação. Você é responsável por entender suas obrigações legais e implementar os controles adequados. Consulte sempre um advogado qualificado para decisões de compliance.

---

## Documentação

- [English README](README.md)
- [Escopo do Projeto](SCOPE.md)
- [Como Contribuir](CONTRIBUTING.md)
- [Código de Conduta](CODE_OF_CONDUCT.md)
- [Changelog](CHANGELOG.md)

---

## Licença

Apache License 2.0 — veja [LICENSE](LICENSE) para detalhes.
